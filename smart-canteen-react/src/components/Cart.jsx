// src/components/Cart.jsx - Premium Cart Section Component
import { useState } from 'react';

export default function Cart({
  cart,
  cartTotals,
  appliedCoupon,
  onUpdateQuantity,
  onRemoveFromCart,
  onRemoveCoupon,
  onApplyCoupon,
  onCheckout
}) {
  const { subtotal, tax, total, couponDiscount } = cartTotals;
  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = () => {
    if (couponCode.trim() !== '') {
      onApplyCoupon(couponCode.trim());
      setCouponCode('');
    }
  };

  return (
    <section id="cart" className="py-5 bg-navy-gradient">
      <div className="container">
        <h2 className="mb-4 fw-800 text-glow">Your Shopping Cart</h2>

        <div className="row g-4">
          {/* Cart Items List */}
          <div className="col-lg-8">
            <div className="glass-card p-4 h-100">
              {cart.length === 0 ? (
                <div className="empty-state-v2 text-center py-5">
                  <i className="fas fa-shopping-cart fa-3x mb-3 d-block opacity-50"></i>
                  <p className="text-muted">Your cart is currently empty. Head over to the menu to add some delicious items!</p>
                </div>
              ) : (
                <div className="smart-v-list">
                  {cart.map(item => (
                    <div key={item.item_id} className="smart-item-row p-3 rounded-3 d-flex align-items-center flex-wrap gap-3">
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-700 text-white fs-5">{item.name}</div>
                        <div className="text-accent x-small">{item.category_name}</div>
                      </div>
                      
                      <div className="fs-6 fw-bold text-white px-3">
                        ₹{parseFloat(item.price).toFixed(2)}
                      </div>

                      <div className="d-flex align-items-center p-1 rounded-pill" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button className="btn btn-sm text-white border-0" onClick={() => onUpdateQuantity(item.item_id, -1)}>
                          <i className="fas fa-minus fs-small"></i>
                        </button>
                        <span className="fw-800 px-3 text-white">{item.quantity}</span>
                        <button className="btn btn-sm text-accent border-0" onClick={() => onUpdateQuantity(item.item_id, 1)}>
                          <i className="fas fa-plus fs-small"></i>
                        </button>
                      </div>

                      <div className="fs-5 fw-900 text-end min-w-80 px-2 text-white">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      
                      <button className="btn btn-sm btn-outline-danger rounded-circle py-2 px-2" onClick={() => onRemoveFromCart(item.item_id)}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div className="col-lg-4">
            <div className="glass-card p-4 border-accent-faded">
              <h4 className="fw-800 text-white mb-4"><i className="fas fa-receipt text-accent me-2"></i>Order Summary</h4>
              
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Subtotal</span>
                <span className="fw-bold text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3 text-success">
                <span>{appliedCoupon ? `Coupon (${appliedCoupon.code})` : 'Auto Discount'}</span>
                <span className="fw-bold">{couponDiscount ? `-₹${couponDiscount.toFixed(2)}` : '₹0.00'}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-4">
                <span className="text-muted">Tax (5%)</span>
                <span className="fw-bold text-white">₹{tax.toFixed(2)}</span>
              </div>
              
              <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              
              <div className="d-flex justify-content-between mb-4 align-items-end">
                <strong className="text-white fs-5">Total</strong>
                <strong className="text-accent fw-900 fs-3">₹{total.toFixed(2)}</strong>
              </div>

              {/* Coupon Input Area */}
              <div className="mb-4">
                <p className="x-small text-muted mb-2">Have a promo code?</p>
                {appliedCoupon && couponDiscount > 0 ? (
                  <div className="premium-promo-card px-3 py-2 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-success bg-opacity-20 text-success me-2 border border-success">APPLIED</span>
                      <strong className="text-white small">{appliedCoupon.code}</strong>
                    </div>
                    <button className="btn btn-sm text-danger border-0 p-1" onClick={onRemoveCoupon} title="Remove Coupon">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control input-v2 border-secondary" 
                      placeholder="Enter code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    />
                    <button 
                      className="btn text-white px-3" 
                      style={{ background: 'rgba(0, 212, 255, 0.2)', border: '1px solid rgba(0,212,255,0.4)' }}
                      onClick={handleApplyCoupon}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <button
                className="btn-v2 btn-glow-v2 w-100 py-3 d-flex justify-content-center align-items-center gap-2"
                onClick={onCheckout}
                disabled={cart.length === 0}
              >
                <i className="fas fa-lock"></i> Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
