// seed.js - Seeds the MongoDB database with initial data
// Run this once: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Customer = require('./models/Customer');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_canteen';

// ── Menu Items (same as your original SQL data) ──
const menuItems = [
  { item_id: 1, name: 'Masala Chai', category_name: 'Beverages', description: 'Traditional Indian spiced tea', price: 15.00, stock_quantity: 100, preparation_time: 5 },
  { item_id: 2, name: 'Coffee', category_name: 'Beverages', description: 'Hot brewed coffee', price: 20.00, stock_quantity: 80, preparation_time: 5 },
  { item_id: 3, name: 'Cold Coffee', category_name: 'Beverages', description: 'Iced coffee with cream', price: 35.00, stock_quantity: 50, preparation_time: 3 },
  { item_id: 4, name: 'Orange Juice', category_name: 'Beverages', description: 'Fresh squeezed orange juice', price: 25.00, stock_quantity: 30, preparation_time: 2 },
  { item_id: 5, name: 'Samosa', category_name: 'Snacks', description: 'Crispy fried pastry with spiced filling', price: 12.00, stock_quantity: 200, preparation_time: 8 },
  { item_id: 6, name: 'Vada Pav', category_name: 'Snacks', description: 'Mumbai style potato fritter burger', price: 25.00, stock_quantity: 150, preparation_time: 8 },
  { item_id: 7, name: 'Poha', category_name: 'Snacks', description: 'Flattened rice with spices', price: 20.00, stock_quantity: 100, preparation_time: 10 },
  { item_id: 8, name: 'Sandwich', category_name: 'Snacks', description: 'Fresh grilled vegetable sandwich', price: 30.00, stock_quantity: 80, preparation_time: 8 },
  { item_id: 9, name: 'Dal Rice', category_name: 'Main Course', description: 'Comforting lentil curry with steamed rice', price: 45.00, stock_quantity: 60, preparation_time: 15 },
  { item_id: 10, name: 'Rajma Rice', category_name: 'Main Course', description: 'Kidney bean curry with rice', price: 50.00, stock_quantity: 50, preparation_time: 15 },
  { item_id: 11, name: 'Chole Bhature', category_name: 'Main Course', description: 'Spiced chickpeas with fried bread', price: 60.00, stock_quantity: 40, preparation_time: 20 },
  { item_id: 12, name: 'Biryani', category_name: 'Main Course', description: 'Fragrant spiced rice dish', price: 70.00, stock_quantity: 35, preparation_time: 25 },
  { item_id: 13, name: 'Gulab Jamun', category_name: 'Desserts', description: 'Sweet milk-solid balls in syrup', price: 25.00, stock_quantity: 100, preparation_time: 5 },
  { item_id: 14, name: 'Ice Cream', category_name: 'Desserts', description: 'Creamy vanilla ice cream', price: 30.00, stock_quantity: 50, preparation_time: 2 },
  { item_id: 15, name: 'Kheer', category_name: 'Desserts', description: 'Rice pudding with nuts', price: 35.00, stock_quantity: 40, preparation_time: 5 },
  { item_id: 16, name: 'Idli Sambar', category_name: 'Breakfast', description: 'Steamed rice cakes with lentil soup', price: 30.00, stock_quantity: 80, preparation_time: 10 },
  { item_id: 17, name: 'Dosa', category_name: 'Breakfast', description: 'Crispy fermented rice crepe', price: 40.00, stock_quantity: 60, preparation_time: 12 },
  { item_id: 18, name: 'Paratha', category_name: 'Breakfast', description: 'Stuffed Indian flatbread', price: 35.00, stock_quantity: 70, preparation_time: 10 }
];

// ── Sample Customers ──
const customers = [
  { customer_id: 1, name: 'Arjun Mehta', email: 'arjun@college.edu', customer_type: 'Student' },
  { customer_id: 2, name: 'Kavya Reddy', email: 'kavya@college.edu', customer_type: 'Student' },
  { customer_id: 3, name: 'Dr. Suresh Kumar', email: 'suresh@college.edu', customer_type: 'Staff' },
  { customer_id: 4, name: 'Prof. Meera Joshi', email: 'meera@college.edu', customer_type: 'Staff' }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing collections
    await MenuItem.deleteMany({});
    await Customer.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert menu items
    await MenuItem.insertMany(menuItems);
    console.log(`🍽️  Inserted ${menuItems.length} menu items`);

    // Insert customers
    await Customer.insertMany(customers);
    console.log(`👤 Inserted ${customers.length} customers`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('   You can now start the server with: npm start');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
