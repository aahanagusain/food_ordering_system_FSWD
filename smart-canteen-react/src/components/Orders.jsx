// src/components/Orders.jsx - Premium Order Tracking Section
import { getDishImage } from '../utils/images';

export default function Orders({ orders, currentCustomerId }) {
  if (!currentCustomerId) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-card p-5 animate-in">
           <i className="fas fa-lock fa-4x mb-4 text-muted"></i>
           <h2 className="fw-800 text-white">Access Restricted</h2>
           <p className="text-muted">Please log in to view and track your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <section id="orders" className="py-5 bg-navy-gradient min-vh-100">
      <div className="container">
        <div className="d-flex align-items-center gap-3 mb-5">
           <div className="brand-logo" style={{ width: '45px', height: '45px' }}>
              <i className="fas fa-history"></i>
           </div>
           <h2 className="fw-800 text-white mb-0">Order History & Tracking</h2>
        </div>

        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="glass-card p-5 text-center animate-in">
             <i className="fas fa-receipt fa-4x mb-4 opacity-25"></i>
             <h3 className="text-white">No active orders found</h3>
             <p className="text-muted">Once you place an order, you can track its live status right here.</p>
          </div>
        ) : (
          <div className="orders-v-list d-flex flex-column gap-4">
            {orders.map((order, idx) => {
              const statusMap = { 'placed': 1, 'preparing': 2, 'out for delivery': 3, 'delivered': 4 };
              const currentStatus = (order.order_status || 'placed').toLowerCase();
              const step = statusMap[currentStatus] || 1;
              const progressPercentage = ((step - 1) / 3) * 100;

              return (
                <div key={order.order_id} className="glass-card p-4 animate-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="row g-4 align-items-center">
                    <div className="col-lg-4">
                       <div className="d-flex align-items-center gap-3 mb-3">
                          <span className="badge bg-primary rounded-pill">ID: #{order.order_id}</span>
                          <span className="text-muted small">{new Date(order.order_date).toLocaleDateString()}</span>
                       </div>
                       <div className="order-items-summary mb-3">
                          {order.line_items?.map((li, i) => (
                             <div key={i} className="small text-white opacity-75">• {li.name} <span className="text-accent x-small">x{li.quantity}</span></div>
                          )) || <div className="text-muted">No items list</div>}
                       </div>
                       <div className="total-badge h4 text-accent fw-800 mb-0">₹{parseFloat(order.total_amount).toFixed(2)}</div>
                    </div>

                    <div className="col-lg-8 border-start border-secondary py-2 ps-lg-5">
                       <div className="tracking-status-label mb-4 d-flex justify-content-between">
                          <span className="text-muted small">LIVE STATUS</span>
                          <span className="text-accent fw-700">{order.order_status?.toUpperCase()}</span>
                       </div>

                       <div className="modern-tracking-bar">
                         <div className="track-rail"></div>
                         <div className="track-glow" style={{ width: `${progressPercentage}%` }}></div>
                         
                         {Object.keys(statusMap).map((s, i) => (
                            <div key={s} className={`track-point ${step > i ? 'done' : step === i + 1 ? 'active' : ''}`}>
                               <div className="point-icon">
                                  <i className={`fas ${i === 0 ? 'fa-check' : i === 1 ? 'fa-fire' : i === 2 ? 'fa-shipping-fast' : 'fa-home'}`}></i>
                               </div>
                               <span className="point-label d-none d-md-block">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                            </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
