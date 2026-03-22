// src/components/Orders.jsx - My Orders Section Component
export default function Orders({ orders, currentCustomerId, onOpenRegister }) {
  if (!currentCustomerId) {
    return (
      <section id="orders" className="py-5">
        <div className="container">
          <h2 className="text-center">My Orders</h2>
          <div className="text-center">
            <p>Please register to view orders.</p>
            <button className="btn btn-primary" onClick={onOpenRegister}>
              Register Now
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="orders" className="py-5">
      <div className="container">
        <h2 className="text-center">My Orders</h2>

        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="text-center"><p>No orders found.</p></div>
        ) : (
          orders.map(order => {
            const itemCount = (typeof order.item_count === 'number' && order.item_count >= 0)
              ? order.item_count
              : (Array.isArray(order.line_items)
                ? order.line_items.reduce((a, l) => a + (parseInt(l.quantity) || 0), 0)
                : 0);

            const itemsStr = (order.items && String(order.items).trim())
              ? order.items
              : (Array.isArray(order.line_items) && order.line_items.length
                ? order.line_items.map(l => `${l.name || 'Item'} x ${l.quantity}`).join(', ')
                : 'No items');

            return (
              <div key={order.order_id} className="order-card">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6>Order #{order.order_id}</h6>
                    <p className="text-muted mb-1">{new Date(order.order_date).toLocaleString()}</p>
                    <p className="mb-1">{itemsStr}</p>
                    <span className={`order-status ${String(order.order_status || '').toLowerCase()}`}>
                      {order.order_status || 'Status'}
                    </span>
                  </div>
                  <div className="text-end">
                    <div className="h5 text-primary">₹{parseFloat(order.total_amount).toFixed(2)}</div>
                    <div className="text-muted small">{itemCount} items</div>
                    <div className="text-muted small">Payment: {order.payment_status || 'N/A'}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
