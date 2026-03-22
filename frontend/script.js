let menuItems = [], cart = [], currentCustomer = null, currentCustomerId = null;
let coupons = [], appliedCoupon = null, recommendations = { personal: [], popular: [], promotions: [] };
const API_BASE_URL = 'http://localhost:5000/api';
const TAX_RATE = 0.05;

function round(value, decimals) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

document.addEventListener('DOMContentLoaded', function() {
    loadMenu();
    loadCartFromStorage();
    updateCartDisplay();
    const savedCustomer = localStorage.getItem('currentCustomer');
    if (savedCustomer) {
        currentCustomer = JSON.parse(savedCustomer);
        currentCustomerId = currentCustomer.customer_id;
    }
    loadRecommendations();
    loadCoupons();
});

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        return { success: false, message: error.message };
    }
}

async function loadMenu() {
    showLoading(true);
    const data = await apiCall('/menu');
    if (data.success) {
        const seen = new Set();
        menuItems = (data.data || []).filter(item => {
            const key = String(item.name || '').trim().toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        displayMenu(menuItems);
    } else {
        showToast('Failed to load menu', 'error');
    }
    showLoading(false);
}

async function loadRecommendations() {
    const query = currentCustomerId ? `?customerId=${currentCustomerId}` : '';
    const data = await apiCall(`/recommendations${query}`);
    recommendations = data.success && data.data ? data.data : { personal: [], popular: [], promotions: [] };
    renderRecommendations();
    updateCartDisplay();
}

async function loadCoupons() {
    const data = await apiCall('/coupons');
    coupons = data.success ? data.data || [] : [];
    renderRecommendations();
    updateCartDisplay();
}

function findCouponByCode(code) {
    const upper = String(code || '').toUpperCase();
    const promomap = (recommendations.promotions || []).map(p => ({ code: p.code, type: p.type || 'cart', min_subtotal: p.min_subtotal, amount_off: p.amount_off, active: true }));
    return coupons.find(c => c.code === upper) || promomap.find(c => c.code === upper);
}

function applyCoupon(code) {
    const c = findCouponByCode(code);
    if (!c) {
        showToast('Invalid coupon', 'error');
        return;
    }
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (c.min_subtotal && subtotal < c.min_subtotal) {
        showToast(`Minimum order ₹${c.min_subtotal} required`, 'error');
        return;
    }
    appliedCoupon = { code: c.code, type: c.type || 'cart', minSubtotal: c.min_subtotal || 0, amount: c.amount_off || 0 };
    updateCartDisplay();
    showToast(`Coupon ${appliedCoupon.code} applied`, 'success');
}

function removeCoupon() {
    appliedCoupon = null;
    updateCartDisplay();
    showToast('Coupon removed', 'info');
}

function renderRecommendations() {
    const personalContainer = document.getElementById('personal-recommendations');
    const popularList = document.getElementById('popular-recommendations');
    const promotionList = document.getElementById('promotion-list');
    if (!personalContainer || !popularList || !promotionList) return;
    
    const personalItems = (recommendations.personal || []).slice(0, 5);
    if (personalItems.length > 0 && currentCustomerId) {
        personalContainer.innerHTML = '<ul class="recommendation-list">' + personalItems.map(item => `<li class="recommendation-item"><div class="recommend-line"><span class="recommend-name"><i class="fas fa-heart"></i>${item.name}</span><span class="recommend-pill">${item.times}×</span></div></li>`).join('') + '</ul>';
    } else {
        personalContainer.innerHTML = '<input type="text" class="frequently-bought-input" placeholder="Register to see your favourites." readonly>';
    }
    
    const popularItems = (recommendations.popular || []).slice(0, 5);
    popularList.innerHTML = popularItems.length === 0 ? '<li class="recommendation-empty text-muted">No orders yet</li>' : popularItems.map(item => `<li class="recommendation-item"><div class="recommend-line"><span class="recommend-name"><i class="fas fa-fire" style="color: #00d4ff;"></i>${item.name}</span><span class="recommend-pill">${item.times}×</span></div></li>`).join('');
    
    const allPromos = [...(recommendations.promotions || []), ...(coupons || []).filter(c => c.active)];
    const seen = new Set();
    const mergedPromos = allPromos.filter(p => p.code && !seen.has(p.code) && seen.add(p.code));
    
    promotionList.innerHTML = mergedPromos.length === 0 ? '<li class="recommendation-empty text-muted">No promotions</li>' : mergedPromos.map(promo => {
        const amount = promo.amount_off ? Number(promo.amount_off).toFixed(0) : '';
        const minSubtotal = promo.min_subtotal ? Number(promo.min_subtotal).toFixed(0) : '';
        return `<li class="recommendation-item promotion-item"><div class="promo-content-wrapper"><div class="promo-left-section"><i class="fas fa-tag" style="color: #00d4ff;"></i><div class="promo-title-text">${promo.title}</div></div><div class="promo-middle-section">${amount ? `<div class="promo-chip-large"><div>₹${amount}</div><div style="font-size: 0.7rem;">OFF</div>${minSubtotal ? `<div style="font-size: 0.65rem;">ON ₹${minSubtotal}+</div>` : ''}</div>` : ''}</div><div class="promo-right-section"><div class="promo-message">${promo.message}</div><div class="promo-time"><i class="fas fa-clock"></i>${promo.time}</div><div class="promo-actions"><button class="btn btn-sm btn-outline" onclick="applyCoupon('${promo.code}')" style="border-color: #00d4ff; color: #00d4ff;">Apply ${promo.code}</button></div></div></div></li>`;
    }).join('');
}

function displayMenu(items) {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = items.length === 0 ? '<div class="text-center"><p>No items found.</p></div>' : items.map(createMenuCard).join('');
}

function getDishImage(name) {
    // Curated images that match each dish
    const images = {
        'Masala Chai': 'Images/Masala Chai.jpg',
        'Coffee': 'Images/Coffee.avif',
        'Cold Coffee': 'Images/Cold Coffee.jpg',
        'Orange Juice': 'Images/Orange Juice.jpg',
        'Samosa': 'Images/Samosa.jpg',
        'Vada Pav': 'Images/Vada pav.jpg',
        'Poha': 'Images/Poha.jpg',
        'Sandwich': 'Images/Sandwich.avif',
        'Dal Rice': 'Images/Dal Rice.jpg',
        'Rajma Rice': 'Images/Rajma Rice.jpg',
        'Chole Bhature': 'Images/Chole Bhature.jpg',
        'Biryani': 'Images/Biryani.jpg',
        'Gulab Jamun': 'Images/Gulab Jamun.jpg',
        'Ice Cream': 'Images/Ice cream.jpg',
        'Kheer': 'Images/Kheer.jpg',
        'Idli Sambar': 'Images/Idli Sambhar.jpg',
        'Dosa': 'Images/Masala Dosa.jpg',
        'Paratha': 'Images/Parantha.webp'
    };
    return images[name] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
}

function createMenuCard(item) {
    const isOutOfStock = item.stock_quantity === 0;
    const price = Number(item.price || 0).toFixed(2);
    const imageUrl = getDishImage(item.name);
    return `<div class="card menu-card"><div class="card-img-top"><img src="${imageUrl}" alt="${item.name}" class="dish-image" loading="lazy"><div class="image-overlay"></div><div class="dish-name-overlay"><span class="dish-name-text">${item.name}</span></div></div><div class="card-body"><h5 class="card-title">${item.name}</h5><p class="card-text text-muted">${item.category_name}</p><p class="card-text">${item.description || 'Delicious food item'}</p><div class="d-flex justify-content-between align-items-center"><div><div class="price-stack"><span class="price-current">₹${price}</span></div><div class="stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}">${isOutOfStock ? 'Out of Stock' : 'Available'}</div></div><div class="d-flex align-items-center"><span class="me-2 text-muted small">${item.preparation_time || 10} min</span><button class="btn btn-primary btn-sm" onclick="addToCart(${item.item_id})" ${isOutOfStock ? 'disabled' : ''}><i class="fas fa-plus"></i>${isOutOfStock ? 'Unavailable' : 'Add'}</button></div></div></div></div>`;
}

function filterMenu(category) {
    document.querySelectorAll('.filter-buttons .btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayMenu(category === 'all' ? menuItems : menuItems.filter(item => item.category_name === category));
}

function addToCart(itemId) {
    const item = menuItems.find(i => i.item_id === itemId);
    if (!item || item.stock_quantity === 0) {
        showToast('Item unavailable', 'error');
        return;
    }
    const existingItem = cart.find(cartItem => cartItem.item_id === itemId);
    if (existingItem) {
        if (existingItem.quantity >= item.stock_quantity) {
            showToast('Stock limit reached', 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({ item_id: itemId, name: item.name, price: item.price, quantity: 1, category_name: item.category_name });
    }
    updateCartDisplay();
    saveCartToStorage();
    showToast(`${item.name} added to cart`, 'success');
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.item_id !== itemId);
    updateCartDisplay();
    saveCartToStorage();
    showToast('Item removed', 'info');
}

function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.item_id === itemId);
    if (!item) return;
    const menuItem = menuItems.find(i => i.item_id === itemId);
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    if (menuItem && newQuantity > menuItem.stock_quantity) {
        showToast('Stock limit reached', 'error');
        return;
    }
    item.quantity = newQuantity;
    updateCartDisplay();
    saveCartToStorage();
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartItems.innerHTML = cart.length === 0 ? '<div class="text-center"><p>Your cart is empty.</p></div>' : cart.map(item => `<div class="cart-item"><div class="d-flex justify-content-between align-items-center"><div><div class="item-name">${item.name}</div><div class="text-muted small">${item.category_name}</div></div><div class="text-center"><div class="item-price">₹${parseFloat(item.price).toFixed(2)}</div></div><div class="text-center"><div class="quantity-controls"><button class="quantity-btn" onclick="updateQuantity(${item.item_id}, -1)"><i class="fas fa-minus"></i></button><span class="quantity-display">${item.quantity}</span><button class="quantity-btn" onclick="updateQuantity(${item.item_id}, 1)"><i class="fas fa-plus"></i></button></div></div><div class="text-end"><div class="item-price">₹${(item.price * item.quantity).toFixed(2)}</div><button class="btn btn-sm btn-outline-danger mt-1" onclick="removeFromCart(${item.item_id})"><i class="fas fa-trash"></i></button></div></div></div>`).join('');
    
    const totals = getCartTotals();
    document.getElementById('cart-subtotal').textContent = `₹${totals.subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `₹${totals.tax.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `₹${totals.total.toFixed(2)}`;
    document.getElementById('checkout-btn').disabled = cart.length === 0;
    
    const summaryCard = document.querySelector('.summary-card');
    if (summaryCard && !summaryCard.querySelector('#coupon-row')) {
        const rows = summaryCard.querySelectorAll('.summary-row');
        const couponRow = document.createElement('div');
        couponRow.className = 'summary-row';
        couponRow.id = 'coupon-row';
        couponRow.innerHTML = `<span>${appliedCoupon ? `Coupon (${appliedCoupon.code})` : 'Auto Discount'}</span><span id="cart-coupon">₹0.00</span>`;
        if (rows.length > 0 && rows[0].parentNode) {
            rows[0].parentNode.insertBefore(couponRow, rows[1] || rows[0].nextSibling);
        }
        const controls = document.createElement('div');
        controls.id = 'coupon-controls';
        controls.className = 'mt-1';
        summaryCard.appendChild(controls);
    }
    const couponAmountEl = document.getElementById('cart-coupon');
    if (couponAmountEl) {
        couponAmountEl.textContent = totals.couponDiscount ? `-₹${totals.couponDiscount.toFixed(2)}` : '₹0.00';
    }
    const ctrl = document.getElementById('coupon-controls');
    if (ctrl) {
        ctrl.innerHTML = (appliedCoupon && totals.couponDiscount > 0) ? `<button class="btn btn-sm btn-outline-danger" onclick="removeCoupon()">Remove ${appliedCoupon.code}</button>` : '';
    }
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) cart = JSON.parse(savedCart);
}

function getCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let couponDiscount = 0;
    if (appliedCoupon) {
        if (subtotal >= (appliedCoupon.minSubtotal || 0)) {
            couponDiscount = Math.min(subtotal, Number(appliedCoupon.amount));
        } else {
            appliedCoupon = null;
        }
    } else {
        const cartCoupons = [...(coupons || []), ...(recommendations.promotions || [])].filter(c => c.type === 'cart' && c.active);
        let best = 0;
        cartCoupons.forEach(c => {
            if (subtotal >= (c.min_subtotal || 0)) {
                const disc = c.amount_off || 0;
                if (disc > best) best = disc;
            }
        });
        if (best === 0 && subtotal > 0) {
            if (subtotal >= 200) best = 60;
            else if (subtotal >= 100) best = 30;
            else if (subtotal >= 50) best = 10;
        }
        couponDiscount = Math.min(subtotal, round(best, 2));
    }
    const effectiveSubtotal = Math.max(0, round(subtotal - couponDiscount, 2));
    const tax = round(effectiveSubtotal * TAX_RATE, 2);
    const total = round(effectiveSubtotal + tax, 2);
    return { subtotal: round(subtotal, 2), tax, total, couponDiscount: round(couponDiscount, 2) };
}

function showCart() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('orders').style.display = 'none';
    document.getElementById('cart').style.display = 'block';
    updateCartDisplay();
}

function showOrders() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('cart').style.display = 'none';
    document.getElementById('orders').style.display = 'block';
    loadCustomerOrders();
}

function showMenu() {
    document.getElementById('cart').style.display = 'none';
    document.getElementById('orders').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
}

function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

function toggleNavbar() {
    document.getElementById('navbarNav').classList.toggle('show');
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

async function registerCustomer() {
    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value;
    const phone = document.getElementById('customerPhone').value;
    const customerType = document.getElementById('customerType').value;
    if (!name || !email || !customerType) {
        showToast('Fill all required fields', 'error');
        return;
    }
    showLoading(true);
    const data = await apiCall('/customers', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, phone, customer_type: customerType})
    });
    if (data.success) {
        currentCustomer = {customer_id: data.customer_id, name, email, phone, customer_type: customerType};
        currentCustomerId = data.customer_id;
        localStorage.setItem('currentCustomer', JSON.stringify(currentCustomer));
        closeModal('customerModal');
        showToast('Registration successful!', 'success');
    } else {
        showToast(data.message || 'Registration failed', 'error');
    }
    showLoading(false);
}

function checkout() {
    if (cart.length === 0) {
        showToast('Cart is empty', 'error');
        return;
    }
    if (!currentCustomerId) {
        openModal('customerModal');
        return;
    }
    showOrderConfirmation();
}

function showOrderConfirmation() {
    const orderDetails = document.getElementById('order-details');
    const totals = getCartTotals();
    orderDetails.innerHTML = `<div class="mb-3"><h6>Customer: ${currentCustomer.name} (${currentCustomer.customer_type})</h6><p class="text-muted">${currentCustomer.email}</p></div><div class="mb-3"><h6>Order Items:</h6>${cart.map(item => `<div class="d-flex justify-content-between mb-2"><span>${item.name} x ${item.quantity}</span><span>₹${(item.price * item.quantity).toFixed(2)}</span></div>`).join('')}</div><hr><div class="d-flex justify-content-between mb-2"><span>Subtotal:</span><span>₹${totals.subtotal.toFixed(2)}</span></div><div class="d-flex justify-content-between mb-2"><span>Auto Discount:</span><span>-₹${totals.couponDiscount.toFixed(2)}</span></div><div class="d-flex justify-content-between mb-2"><span>Tax (5%):</span><span>₹${totals.tax.toFixed(2)}</span></div><hr><div class="d-flex justify-content-between"><strong>Total:</strong><strong>₹${totals.total.toFixed(2)}</strong></div>`;
    openModal('orderModal');
}

async function confirmOrder() {
    if (!currentCustomerId || cart.length === 0) {
        showToast('Cannot place order', 'error');
        return;
    }
    showLoading(true);
    const data = await apiCall('/orders', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            customer_id: currentCustomerId,
            items: cart.map(item => ({item_id: item.item_id, quantity: item.quantity})),
            payment_method: 'Cash',
            ...(appliedCoupon && appliedCoupon.code ? {coupon_code: appliedCoupon.code} : {})
        })
    });
    if (data.success) {
        cart = [];
        updateCartDisplay();
        saveCartToStorage();
        closeModal('orderModal');
        showToast(`Order placed! ID: ${data.order_id}`, 'success');
        showMenu();
        appliedCoupon = null;
        loadRecommendations();
    } else {
        showToast(data.message || 'Order failed', 'error');
    }
    showLoading(false);
}

async function loadCustomerOrders() {
    if (!currentCustomerId) {
        document.getElementById('orders-list').innerHTML = `<div class="text-center"><p>Please register to view orders.</p><button class="btn btn-primary" onclick="openModal('customerModal')">Register Now</button></div>`;
        return;
    }
    showLoading(true);
    const data = await apiCall(`/orders/customer/${currentCustomerId}`);
    if (data.success) {
        displayOrders(data.data);
    } else {
        showToast('Failed to load orders', 'error');
    }
    showLoading(false);
}

function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    if (!Array.isArray(orders) || orders.length === 0) {
        ordersList.innerHTML = '<div class="text-center"><p>No orders found.</p></div>';
        return;
    }
    ordersList.innerHTML = orders.map(order => {
        const itemCount = (typeof order.item_count === 'number' && order.item_count >= 0) ? order.item_count : (Array.isArray(order.line_items) ? order.line_items.reduce((a, l) => a + (parseInt(l.quantity) || 0), 0) : 0);
        const itemsStr = (order.items && String(order.items).trim()) ? order.items : (Array.isArray(order.line_items) && order.line_items.length ? order.line_items.map(l => `${l.name || 'Item'} x ${l.quantity}`).join(', ') : 'No items');
        return `<div class="order-card"><div class="d-flex justify-content-between align-items-center"><div><h6>Order #${order.order_id}</h6><p class="text-muted mb-1">${new Date(order.order_date).toLocaleString()}</p><p class="mb-1">${itemsStr}</p><span class="order-status ${String(order.order_status || '').toLowerCase()}">${order.order_status || 'Status'}</span></div><div class="text-end"><div class="h5 text-primary">₹${parseFloat(order.total_amount).toFixed(2)}</div><div class="text-muted small">${itemCount} items</div><div class="text-muted small">Payment: ${order.payment_status || 'N/A'}</div></div></div></div>`;
    }).join('');
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastHeader = toast.querySelector('.toast-header i');
    toastMessage.textContent = message;
    toastHeader.className = `fas ${type === 'success' ? 'fa-check-circle text-success' : type === 'error' ? 'fa-exclamation-circle text-danger' : type === 'warning' ? 'fa-exclamation-triangle text-warning' : 'fa-info-circle text-primary'}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function closeToast() {
    document.getElementById('toast').classList.remove('show');
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});
