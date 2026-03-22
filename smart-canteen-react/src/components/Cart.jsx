// src/components/Cart.jsx - Cart Section Component
export default function Cart({
  cart,
  cartTotals,
  appliedCoupon,
  onUpdateQuantity,
  onRemoveFromCart,
  onRemoveCoupon,
  onCheckout
}) {
  const { subtotal, tax, total, couponDiscount } = cartTotals;

  return (
    <section id="cart" className="py-5">
      <div className="container">
        <h2 className="text-center">Your Cart</h2>

        {/* Cart Items */}
        <div id="cart-items">
          {cart.length === 0 ? (
            <div className="text-center"><p>Your cart is empty.</p></div>
          ) : (
            cart.map(item => (
              <div key={item.item_id} className="cart-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="item-name">{item.name}</div>
                    <div className="text-muted small">{item.category_name}</div>
                  </div>
                  <div className="text-center">
                    <div className="item-price">₹{parseFloat(item.price).toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="quantity-controls">
                      <button className="quantity-btn" onClick={() => onUpdateQuantity(item.item_id, -1)}>
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button className="quantity-btn" onClick={() => onUpdateQuantity(item.item_id, 1)}>
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                    <button className="btn btn-sm btn-outline-danger mt-1" onClick={() => onRemoveFromCart(item.item_id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <div className="summary-card">
            <h5>Order Summary</h5>
            <hr style={{ borderColor: 'rgba(0, 212, 255, 0.2)' }} />
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>{appliedCoupon ? `Coupon (${appliedCoupon.code})` : 'Auto Discount'}</span>
              <span>{couponDiscount ? `-₹${couponDiscount.toFixed(2)}` : '₹0.00'}</span>
            </div>
            <div className="summary-row">
              <span>Tax (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <hr style={{ borderColor: 'rgba(0, 212, 255, 0.2)' }} />
            <div className="summary-row total">
              <strong>Total</strong>
              <strong>₹{total.toFixed(2)}</strong>
            </div>

            {/* Remove coupon button */}
            {appliedCoupon && couponDiscount > 0 && (
              <div className="mt-1 mb-3">
                <button className="btn btn-sm btn-outline-danger" onClick={onRemoveCoupon}>
                  Remove {appliedCoupon.code}
                </button>
              </div>
            )}

            <button
              className="btn btn-primary w-100"
              onClick={onCheckout}
              disabled={cart.length === 0}
            >
              <i className="fas fa-credit-card"></i> Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
