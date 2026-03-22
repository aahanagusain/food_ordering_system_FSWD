// src/components/OrderModal.jsx - Premium Order Confirmation Modal
export default function OrderModal({ show, onClose, onConfirm, cart, cartTotals, currentCustomer }) {
  if (!show || !currentCustomer) return null;

  const { subtotal, tax, total, couponDiscount } = cartTotals;

  return (
    <div className="modal-overlay-v2 show" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-dialog-v2">
        <div className="auth-card-premium is-modal p-4 border-accent-faded">
          
          <div className="d-flex justify-content-between align-items-center mb-4">
             <h4 className="fw-800 text-white m-0">
               <i className="fas fa-check-circle text-success me-2"></i> Confirm Order
             </h4>
             <button className="btn text-muted p-1" onClick={onClose}>
               <i className="fas fa-times fs-5"></i>
             </button>
          </div>

          <div className="glass-card p-3 mb-4">
            <h6 className="text-accent fw-bold mb-1">Delivering To:</h6>
            <div className="text-white fw-bold">{currentCustomer.name} <span className="badge bg-secondary ms-2">{currentCustomer.customer_type}</span></div>
            <div className="text-muted small">{currentCustomer.email}</div>
          </div>

          <div className="mb-4">
            <h6 className="text-muted fw-bold mb-3 border-bottom border-secondary pb-2">Order Items</h6>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }} className="pe-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.item_id} className="d-flex justify-content-between mb-2">
                  <span className="text-white">
                    <span className="text-accent fw-bold me-2">{item.quantity}x</span> 
                    {item.name}
                  </span>
                  <span className="fw-bold text-white fs-6">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-3 mb-4">
            <div className="d-flex justify-content-between mb-2 small text-muted">
              <span>Subtotal:</span>
              <span className="text-white">₹{subtotal.toFixed(2)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="d-flex justify-content-between mb-2 small text-success">
                <span>Discount Applied:</span>
                <span>-₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-3 small text-muted border-bottom border-secondary pb-2">
              <span>Tax (5%):</span>
              <span className="text-white">₹{tax.toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between align-items-end mt-2">
              <span className="fw-bold text-white fs-5">Grand Total</span>
              <span className="fw-900 text-accent fs-3">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="d-flex gap-3">
            <button className="btn btn-outline-secondary flex-grow-1 border-secondary text-white rounded-pill py-2" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-v2 btn-glow-v2 flex-grow-1" onClick={onConfirm} style={{ padding: '10px 20px !important' }}>
              Confirm Payment
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
