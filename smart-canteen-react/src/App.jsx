// src/App.jsx - Main Application Component
// This is the "brain" of the app. It manages all state and passes data to child components.

import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Suggestions from './components/Suggestions';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Orders from './components/Orders';
import CustomerModal from './components/CustomerModal';
import OrderModal from './components/OrderModal';
import Toast from './components/Toast';
import Loading from './components/Loading';
import { fetchMenu, fetchCoupons, fetchRecommendations, registerCustomer, placeOrder, fetchCustomerOrders } from './utils/api';

const TAX_RATE = 0.05;

function round2(val) {
  return Math.round(val * 100) / 100;
}

export default function App() {
  // ── State ──
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [recommendations, setRecommendations] = useState({ personal: [], popular: [], promotions: [] });
  const [orders, setOrders] = useState([]);
  const [activeView, setActiveView] = useState('menu'); // 'menu' | 'cart' | 'orders'
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // ── Show toast notification ──
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  // ── Load menu from backend ──
  const loadMenu = useCallback(async () => {
    setLoading(true);
    const data = await fetchMenu();
    if (data.success) {
      // Remove duplicates by name
      const seen = new Set();
      const unique = (data.data || []).filter(item => {
        const key = String(item.name || '').trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setMenuItems(unique);
    } else {
      showToast('Failed to load menu', 'error');
    }
    setLoading(false);
  }, [showToast]);

  // ── Load recommendations ──
  const loadRecommendations = useCallback(async (custId) => {
    const data = await fetchRecommendations(custId);
    if (data.success && data.data) {
      setRecommendations(data.data);
    }
  }, []);

  // ── Load coupons ──
  const loadCoupons = useCallback(async () => {
    const data = await fetchCoupons();
    if (data.success) {
      setCoupons(data.data || []);
    }
  }, []);

  // ── Initial load (runs once) ──
  useEffect(() => {
    // Load saved cart & customer from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedCustomer = localStorage.getItem('currentCustomer');
    if (savedCustomer) {
      const c = JSON.parse(savedCustomer);
      setCurrentCustomer(c);
      setCurrentCustomerId(c.customer_id);
    }

    loadMenu();
    loadCoupons();
  }, [loadMenu, loadCoupons]);

  // Load recommendations when customer changes
  useEffect(() => {
    loadRecommendations(currentCustomerId);
  }, [currentCustomerId, loadRecommendations]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ── Cart calculations ──
  const getCartTotals = useCallback(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let couponDiscount = 0;

    if (appliedCoupon) {
      if (subtotal >= (appliedCoupon.minSubtotal || 0)) {
        couponDiscount = Math.min(subtotal, Number(appliedCoupon.amount));
      }
    } else {
      // Auto-discount: find best matching cart coupon
      const allCoupons = [...(coupons || []), ...(recommendations.promotions || [])].filter(c => c.type === 'cart' && c.active);
      let best = 0;
      allCoupons.forEach(c => {
        if (subtotal >= (c.min_subtotal || 0)) {
          const disc = c.amount_off || 0;
          if (disc > best) best = disc;
        }
      });
      // Fallback auto-discounts
      if (best === 0 && subtotal > 0) {
        if (subtotal >= 200) best = 60;
        else if (subtotal >= 100) best = 30;
        else if (subtotal >= 50) best = 10;
      }
      couponDiscount = Math.min(subtotal, round2(best));
    }

    const effectiveSubtotal = Math.max(0, round2(subtotal - couponDiscount));
    const tax = round2(effectiveSubtotal * TAX_RATE);
    const total = round2(effectiveSubtotal + tax);
    return { subtotal: round2(subtotal), tax, total, couponDiscount: round2(couponDiscount) };
  }, [cart, appliedCoupon, coupons, recommendations.promotions]);

  const cartTotals = getCartTotals();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Add to cart ──
  const addToCart = (itemId) => {
    const item = menuItems.find(i => i.item_id === itemId);
    if (!item || item.stock_quantity === 0) {
      showToast('Item unavailable', 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(c => c.item_id === itemId);
      if (existing) {
        if (existing.quantity >= item.stock_quantity) {
          showToast('Stock limit reached', 'error');
          return prev;
        }
        return prev.map(c => c.item_id === itemId ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item_id: itemId, name: item.name, price: item.price, quantity: 1, category_name: item.category_name }];
    });
    showToast(`${item.name} added to cart`, 'success');
  };

  // ── Remove from cart ──
  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.item_id !== itemId));
    showToast('Item removed', 'info');
  };

  // ── Update quantity ──
  const updateQuantity = (itemId, change) => {
    const cartItem = cart.find(c => c.item_id === itemId);
    if (!cartItem) return;

    const menuItem = menuItems.find(i => i.item_id === itemId);
    const newQty = cartItem.quantity + change;

    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    if (menuItem && newQty > menuItem.stock_quantity) {
      showToast('Stock limit reached', 'error');
      return;
    }

    setCart(prev => prev.map(c => c.item_id === itemId ? { ...c, quantity: newQty } : c));
  };

  // ── Apply coupon ──
  const applyCoupon = (code) => {
    const upper = String(code || '').toUpperCase();
    const allCoupons = [...coupons, ...(recommendations.promotions || [])];
    const coupon = allCoupons.find(c => c.code === upper);

    if (!coupon) {
      showToast('Invalid coupon', 'error');
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (coupon.min_subtotal && subtotal < coupon.min_subtotal) {
      showToast(`Minimum order ₹${coupon.min_subtotal} required`, 'error');
      return;
    }

    setAppliedCoupon({ code: coupon.code, type: coupon.type || 'cart', minSubtotal: coupon.min_subtotal || 0, amount: coupon.amount_off || 0 });
    showToast(`Coupon ${coupon.code} applied`, 'success');
  };

  // ── Remove coupon ──
  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // ── Register customer ──
  const handleRegister = async (formData) => {
    if (!formData.name || !formData.email || !formData.customer_type) {
      showToast('Fill all required fields', 'error');
      return;
    }
    setLoading(true);
    const data = await registerCustomer(formData);
    if (data.success) {
      const customer = { customer_id: data.customer_id, ...formData };
      setCurrentCustomer(customer);
      setCurrentCustomerId(data.customer_id);
      localStorage.setItem('currentCustomer', JSON.stringify(customer));
      setShowCustomerModal(false);
      showToast('Registration successful!', 'success');
    } else {
      showToast(data.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  // ── Checkout ──
  const checkout = () => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }
    if (!currentCustomerId) {
      setShowCustomerModal(true);
      return;
    }
    setShowOrderModal(true);
  };

  // ── Confirm order ──
  const confirmOrder = async () => {
    if (!currentCustomerId || cart.length === 0) {
      showToast('Cannot place order', 'error');
      return;
    }
    setLoading(true);
    const data = await placeOrder({
      customer_id: currentCustomerId,
      items: cart.map(item => ({ item_id: item.item_id, quantity: item.quantity })),
      payment_method: 'Cash',
      ...(appliedCoupon && appliedCoupon.code ? { coupon_code: appliedCoupon.code } : {})
    });
    if (data.success) {
      setCart([]);
      setShowOrderModal(false);
      setAppliedCoupon(null);
      showToast(`Order placed! ID: ${data.order_id}`, 'success');
      setActiveView('menu');
      loadRecommendations(currentCustomerId);
      loadMenu(); // Refresh stock
    } else {
      showToast(data.message || 'Order failed', 'error');
    }
    setLoading(false);
  };

  // ── Load customer orders ──
  const loadOrders = useCallback(async () => {
    if (!currentCustomerId) return;
    setLoading(true);
    const data = await fetchCustomerOrders(currentCustomerId);
    if (data.success) {
      setOrders(data.data);
    } else {
      showToast('Failed to load orders', 'error');
    }
    setLoading(false);
  }, [currentCustomerId, showToast]);

  // ── View handlers ──
  const showMenu = () => setActiveView('menu');
  const showCart = () => setActiveView('cart');
  const showOrders = () => {
    setActiveView('orders');
    loadOrders();
  };
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Navbar */}
      <Navbar
        cartCount={cartCount}
        onShowMenu={showMenu}
        onShowCart={showCart}
        onShowOrders={showOrders}
      />

      {/* Hero */}
      <Hero onBrowseMenu={scrollToMenu} />

      {/* Suggestions - always visible */}
      <Suggestions
        recommendations={recommendations}
        currentCustomerId={currentCustomerId}
        coupons={coupons}
        onApplyCoupon={applyCoupon}
      />

      {/* Sections – show/hide based on activeView */}
      {activeView === 'menu' && (
        <Menu menuItems={menuItems} onAddToCart={addToCart} />
      )}

      {activeView === 'cart' && (
        <Cart
          cart={cart}
          cartTotals={cartTotals}
          appliedCoupon={appliedCoupon}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onRemoveCoupon={removeCoupon}
          onCheckout={checkout}
        />
      )}

      {activeView === 'orders' && (
        <Orders
          orders={orders}
          currentCustomerId={currentCustomerId}
          onOpenRegister={() => setShowCustomerModal(true)}
        />
      )}

      {/* Modals */}
      <CustomerModal
        show={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onRegister={handleRegister}
      />

      <OrderModal
        show={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onConfirm={confirmOrder}
        cart={cart}
        cartTotals={cartTotals}
        currentCustomer={currentCustomer}
      />

      {/* Loading & Toast */}
      <Loading show={loading} />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </>
  );
}
