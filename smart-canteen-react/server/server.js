console.log('🚀 Starting Backend Server...');
// server.js - Express + MongoDB Backend for Smart Food Ordering System
// Beginner-friendly: all routes in one file for easy understanding!
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const MenuItem = require('./models/MenuItem');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_canteen';
const TAX_RATE = 0.05;

// ── Middleware ──
app.use(cors());                    // Allow React frontend to talk to this server
app.use(express.json());            // Parse JSON request bodies

// ── Helper: round to 2 decimals ──
function round2(val) {
  return Math.round(val * 100) / 100;
}

// ── Helper: get active coupons/promotions ──
function getCoupons() {
  const now = new Date();
  const weekday = now.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const hour = now.getHours();

  function isActive(startHr, endHr, days) {
    if (days && !days.includes(weekday)) return false;
    if (endHr === null) return hour >= startHr;
    return hour >= startHr && hour < endHr;
  }

  return [
    { code: 'BREAKFAST10', title: 'Breakfast Saver', message: '10% off breakfast until 11 AM', time: '6-11 AM', category: 'Breakfast', discount_percent: 10, active: isActive(6, 11) },
    { code: 'WEEKEND12', title: 'Weekend Dessert', message: '12% off desserts Fri/Sat eve', time: '5 PM - close', category: 'Desserts', discount_percent: 12, active: isActive(17, null, [5, 6]) },
    { code: 'CART10OFF50', title: 'Cart Saver ₹10', message: '₹10 off on orders above ₹50', time: 'All day', type: 'cart', min_subtotal: 50, amount_off: 10, active: true },
    { code: 'CART30OFF100', title: 'Cart Saver ₹30', message: '₹30 off on orders above ₹100', time: 'All day', type: 'cart', min_subtotal: 100, amount_off: 30, active: true },
    { code: 'CART60OFF200', title: 'Cart Saver ₹60', message: '₹60 off on orders above ₹200', time: 'All day', type: 'cart', min_subtotal: 200, amount_off: 60, active: true }
  ];
}

// ── Helper: calculate cart discount ──
function getCartDiscount(subtotal, couponCode) {
  subtotal = Math.max(subtotal || 0, 0);
  let best = 0;
  const code = couponCode ? couponCode.toUpperCase() : null;

  for (const c of getCoupons()) {
    if (!c.active) continue;
    if (c.type !== 'cart' && !(code && c.code === code)) continue;
    if (subtotal < (c.min_subtotal || 0)) continue;
    const amount = c.amount_off || 0;
    best = Math.max(best, Math.min(amount > 0 ? amount : 0, subtotal));
  }

  // Fallback auto-discounts
  if (best === 0 && subtotal > 0) {
    if (subtotal >= 200) best = 60;
    else if (subtotal >= 100) best = 30;
    else if (subtotal >= 50) best = 10;
  }

  return round2(best);
}

// ══════════════════════════════════════════
// ══  API ROUTES  ═════════════════════════
// ══════════════════════════════════════════

// 1️⃣ Health Check
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
  res.json({
    success: true,
    message: `API is healthy (MongoDB: ${states[dbState] || 'Unknown'})`
  });
});

// 2️⃣ Get Menu (all items)
app.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find({ status: { $ne: 'Discontinued' } })
      .sort({ name: 1 })
      .lean();   // .lean() gives plain JS objects (faster)
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3️⃣ Get Coupons
app.get('/api/coupons', (req, res) => {
  const coupons = getCoupons().map(c => ({
    code: c.code,
    title: c.title,
    message: c.message,
    time: c.time,
    category: c.category || null,
    discount_percent: c.discount_percent || null,
    amount_off: c.amount_off || null,
    min_subtotal: c.min_subtotal || null,
    type: c.type || (c.category ? 'category' : 'cart'),
    active: c.active
  }));
  res.json({ success: true, data: coupons });
});

// 4️⃣ Register a Customer
app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, customer_type, password } = req.body;
    console.log(`[AUTH] Register attempt for email: ${email} with payload:`, req.body);

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // Explicit check for existing email
    const emailLower = typeof email === 'string' ? email.trim().toLowerCase() : email;
    const existing = await Customer.findOne({ email: emailLower }).lean();
    if (existing) {
      console.log(`[AUTH] Registration failed: Email ${emailLower} already exists`);
      // Since the user wants a smooth "sign in also happen", we can actually just login if password matches!
      // But standard protocol is to return an error:
      return res.status(400).json({ success: false, message: 'This email is already registered. Please login.' });
    }

    // Auto-increment customer_id gracefully
    let newId = 100;
    try {
        const lastCustomer = await Customer.findOne().sort({ customer_id: -1 }).lean();
        if (lastCustomer && !isNaN(lastCustomer.customer_id)) {
            newId = parseInt(lastCustomer.customer_id) + 1;
        }
    } catch (e) {
        console.warn('Could not increment customer_id automatically, falling back to random. ', e);
        newId = Math.floor(Math.random() * 100000);
    }
    
    const customer = await Customer.create({
      customer_id: newId,
      name: name.trim(),
      email: emailLower,
      phone: phone || '',
      customer_type: customer_type || 'Student',
      password: password || 'password123'
    });

    console.log(`[AUTH] Registration success: ID ${newId}`);
    res.json({ success: true, data: customer });
  } catch (err) {
    console.error(`[AUTH] Registration Fatal Error:`, err);
    res.status(500).json({ success: false, message: err.message || 'Unknown database error occurred during registration.' });
  }
});

// 5️⃣ Get Customer by ID
app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ customer_id: parseInt(req.params.id) }).lean();
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6️⃣ Place an Order
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, items, payment_method, coupon_code } = req.body;
    if (!customer_id || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Customer ID and items are required' });
    }

    // Look up menu items from DB
    const itemIds = items.map(i => i.item_id);
    const menuItems = await MenuItem.find({ item_id: { $in: itemIds } }).lean();
    const menuMap = {};
    menuItems.forEach(m => { menuMap[m.item_id] = m; });

    // Build line items and calculate subtotal
    const lineItems = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = menuMap[item.item_id];
      if (!menuItem || item.quantity <= 0) continue;

      const lineTotal = round2(menuItem.price * item.quantity);
      lineItems.push({
        item_id: menuItem.item_id,
        name: menuItem.name,
        quantity: item.quantity,
        unit_price: menuItem.price,
        line_total: lineTotal
      });
      subtotal += lineTotal;
    }

    if (lineItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid items in order' });
    }

    subtotal = round2(subtotal);
    const discount = getCartDiscount(subtotal, coupon_code);
    const taxable = Math.max(0, round2(subtotal - discount));
    const tax = round2(taxable * TAX_RATE);
    const total = round2(taxable + tax);

    // Auto-increment order_id
    const lastOrder = await Order.findOne().sort({ order_id: -1 }).lean();
    const newOrderId = (lastOrder ? lastOrder.order_id : 0) + 1;

    // Create order
    const order = await Order.create({
      order_id: newOrderId,
      customer_id,
      items: lineItems.map(l => `${l.name} x ${l.quantity}`).join(', '),
      line_items: lineItems,
      subtotal,
      tax_percent: Math.round(TAX_RATE * 100),
      tax_amount: tax,
      total_amount: total,
      payment_status: 'Paid',
      order_status: 'Placed',
      payment_method: payment_method || 'Cash',
      item_count: lineItems.reduce((sum, l) => sum + l.quantity, 0),
      coupon_code: coupon_code || '',
      coupon_discount: discount
    });

    // Update stock quantities
    for (const l of lineItems) {
      await MenuItem.updateOne(
        { item_id: l.item_id },
        { $inc: { stock_quantity: -l.quantity } }
      );
    }

    res.json({
      success: true,
      order_id: order.order_id,
      subtotal,
      tax_percent: Math.round(TAX_RATE * 100),
      tax_amount: tax,
      total_amount: total,
      coupon_code: coupon_code || '',
      coupon_discount: discount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7️⃣ Get Orders for a Customer
app.get('/api/orders/customer/:id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const orders = await Order.find({ customer_id: customerId })
      .sort({ order_date: -1 })
      .lean();

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8️⃣ AI Recommendations (Smart Picks)
app.get('/api/recommendations', async (req, res) => {
  try {
    const custId = req.query.customerId ? parseInt(req.query.customerId) : null;
    const allItems = await MenuItem.find({ stock_quantity: { $gt: 0 } }).lean();
    
    // Enrich with order counts
    const orderStats = await Order.aggregate([
      { $unwind: '$line_items' },
      { $group: { _id: '$line_items.name', count: { $sum: '$line_items.quantity' } } }
    ]);
    const statMap = {};
    orderStats.forEach(s => statMap[s._id] = s.count);

    const scoredItems = allItems.map(item => ({
      ...item,
      score: (item.rating || 4) * 0.6 + (statMap[item.name] || 0) * 0.4
    })).sort((a, b) => b.score - a.score);

    const popular = scoredItems.slice(0, 5);

    // 2. Personal Picks
    let personal = [];
    if (custId) {
      try {
        const history = await Order.find({ customer_id: custId }).sort({ order_date: -1 }).limit(10).lean();
        if (history.length > 0) {
          const categories = new Set();
          history.forEach(o => o.line_items.forEach(li => {
            const mi = allItems.find(mi => mi.name === li.name);
            if (mi) categories.add(mi.category_name);
          }));
          
          personal = allItems
            .filter(item => categories.has(item.category_name))
            .filter(item => !popular.find(p => p.name === item.name)) // Don't repeat popular
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5);
        }
      } catch (e) {
        personal = [];
      }
    }

    // 3. Promotions
    let promos = [];
    try {
      const activeCoupons = await Coupon.find({ active: true }).limit(2).lean();
      promos = activeCoupons.map(c => ({
        code: c.code,
        amount_off: c.amount_off,
        message: `Extra ₹${c.amount_off} OFF!`
      }));
    } catch (e) {
      promos = [];
    }

    res.json({
      success: true,
      data: { popular, personal, promotions: promos }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9️⃣ Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const emailLower = email.trim().toLowerCase();
    const customer = await Customer.findOne({ email: emailLower, password: password }).lean();
    
    if (!customer) {
      console.log(`[AUTH] Login failed for: ${emailLower}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    console.log(`[AUTH] Login success: ${emailLower}`);
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const Review = require('./models/Review');

// 🔟 Get & Add Reviews for Menu Item
app.get('/api/menu/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ item_id: parseInt(req.params.id) }).sort({ review_date: -1 }).lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/menu/:id/reviews', async (req, res) => {
  try {
    const { customer_id, customer_name, rating, comment } = req.body;
    const item_id = parseInt(req.params.id);

    // Create review
    const review = await Review.create({
      item_id,
      customer_id,
      customer_name,
      rating: parseFloat(rating),
      comment
    });

    // Update item total rating
    const item = await MenuItem.findOne({ item_id });
    if (item) {
      const current_total = item.rating * item.reviews_count;
      item.reviews_count += 1;
      item.rating = Math.round(((current_total + rating) / item.reviews_count) * 10) / 10;
      await item.save();
    }

    res.json({ success: true, data: review, item_rating: item ? item.rating : null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 1️⃣1️⃣ Update Order Status (for Live Tracking simulation)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { order_id: parseInt(req.params.id) },
      { order_status: status },
      { new: true }
    ).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, status: order.order_status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Connect to MongoDB & Start Server ──
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Auto-seed if menu is empty
    const MenuItem = require('./models/MenuItem');
    const count = await MenuItem.countDocuments();
    if (count === 0 || (await MenuItem.findOne({ name: 'Cheese Chutney Sandwich' }))) {
        console.log('📦 Updating menu items to match original files...');
        await MenuItem.deleteMany({});
        const seedData = [
            { item_id: 1, name: 'Masala Chai', category_name: 'Beverages', price: 15.00, stock_quantity: 100, description: 'Traditional Indian spiced tea', rating: 4.8, reviews_count: 150 },
            { item_id: 2, name: 'Coffee', category_name: 'Beverages', price: 20.00, stock_quantity: 80, description: 'Hot brewed coffee', rating: 4.2, reviews_count: 85 },
            { item_id: 3, name: 'Cold Coffee', category_name: 'Beverages', price: 35.00, stock_quantity: 50, description: 'Iced coffee with cream', rating: 4.9, reviews_count: 210 },
            { item_id: 4, name: 'Orange Juice', category_name: 'Beverages', price: 25.00, stock_quantity: 30, description: 'Fresh squeezed orange juice', rating: 4.5, reviews_count: 45 },
            { item_id: 5, name: 'Samosa', category_name: 'Snacks', price: 12.00, stock_quantity: 200, description: 'Crispy fried pastry with spiced filling', rating: 4.7, reviews_count: 320 },
            { item_id: 6, name: 'Vada Pav', category_name: 'Snacks', price: 25.00, stock_quantity: 150, description: 'Mumbai style potato fritter burger', rating: 4.6, reviews_count: 180 },
            { item_id: 7, name: 'Poha', category_name: 'Snacks', price: 20.00, stock_quantity: 100, description: 'Flattened rice with spices', rating: 4.3, reviews_count: 90 },
            { item_id: 8, name: 'Sandwich', category_name: 'Snacks', price: 30.00, stock_quantity: 80, description: 'Fresh grilled vegetable sandwich', rating: 4.4, reviews_count: 110 },
            { item_id: 9, name: 'Dal Rice', category_name: 'Main Course', price: 45.00, stock_quantity: 60, description: 'Comforting lentil curry with steamed rice', rating: 4.5, reviews_count: 75 },
            { item_id: 10, name: 'Rajma Rice', category_name: 'Main Course', price: 50.00, stock_quantity: 50, description: 'Kidney bean curry with rice', rating: 4.7, reviews_count: 130 },
            { item_id: 11, name: 'Chole Bhature', category_name: 'Main Course', price: 60.00, stock_quantity: 40, description: 'Spiced chickpeas with fried bread', rating: 4.8, reviews_count: 250 },
            { item_id: 12, name: 'Biryani', category_name: 'Main Course', price: 70.00, stock_quantity: 35, description: 'Fragrant spiced rice dish', rating: 4.9, reviews_count: 420 },
            { item_id: 13, name: 'Gulab Jamun', category_name: 'Desserts', price: 25.00, stock_quantity: 100, description: 'Sweet milk-solid balls in syrup', rating: 4.8, reviews_count: 190 },
            { item_id: 14, name: 'Ice Cream', category_name: 'Desserts', price: 30.00, stock_quantity: 50, description: 'Creamy vanilla ice cream', rating: 4.5, reviews_count: 65 },
            { item_id: 15, name: 'Kheer', category_name: 'Desserts', price: 35.00, stock_quantity: 40, description: 'Rice pudding with nuts', rating: 4.6, reviews_count: 40 },
            { item_id: 16, name: 'Idli Sambar', category_name: 'Breakfast', price: 30.00, stock_quantity: 80, description: 'Steamed rice cakes with lentil soup', rating: 4.6, reviews_count: 120 },
            { item_id: 17, name: 'Dosa', category_name: 'Breakfast', price: 40.00, stock_quantity: 60, description: 'Crispy fermented rice crepe', rating: 4.8, reviews_count: 310 },
            { item_id: 18, name: 'Paratha', category_name: 'Breakfast', price: 35.00, stock_quantity: 70, description: 'Stuffed Indian flatbread', rating: 4.5, reviews_count: 140 }
        ];
        await MenuItem.insertMany(seedData);
        console.log('✨ Auto-seed complete!');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📋 API endpoints:`);
      console.log(`   GET  /api/health`);
      console.log(`   GET  /api/menu`);
      console.log(`   GET  /api/coupons`);
      console.log(`   POST /api/customers`);
      console.log(`   POST /api/orders`);
      console.log(`   GET  /api/orders/customer/:id`);
      console.log(`   GET  /api/recommendations`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
