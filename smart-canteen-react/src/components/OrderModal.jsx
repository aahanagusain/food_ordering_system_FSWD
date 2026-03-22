// src/components/OrderModal.jsx - Order Confirmation Modal
export default function OrderModal({ show, onClose, onConfirm, cart, cartTotals, currentCustomer }) {
  if (!currentCustomer) return null;

  const { subtotal, tax, total, couponDiscount } = cartTotals;

  return (
    <div className={`modal-overlay ${show ? 'show' : ''}`} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Order Confirmation</h5>
            <button className="btn-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            {/* Customer Info */}
            <div className="mb-3">
              <h6>Customer: {currentCustomer.name} ({currentCustomer.customer_type})</h6>
              <p className="text-muted">{currentCustomer.email}</p>
            </div>

            {/* Order Items */}
            <div className="mb-3">
              <h6>Order Items:</h6>
              {cart.map(item => (
                <div key={item.item_id} className="d-flex justify-content-between mb-2">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr style={{ borderColor: 'rgba(0, 212, 255, 0.2)' }} />

            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Auto Discount:</span>
              <span>-₹{couponDiscount.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Tax (5%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            <hr style={{ borderColor: 'rgba(0, 212, 255, 0.2)' }} />

            <div className="d-flex justify-content-between">
              <strong>Total:</strong>
              <strong>₹{total.toFixed(2)}</strong>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-success" onClick={onConfirm}>Confirm Order</button>
          </div>
        </div>
      </div>
    </div>
  );
}
