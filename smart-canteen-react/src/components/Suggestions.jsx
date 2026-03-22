// src/components/Suggestions.jsx - Re-designed Premium AI Section (Fixed Alignment)
import { getDishImage } from '../utils/images';

export default function Suggestions({ recommendations, currentCustomerId, coupons, onApplyCoupon }) {
  const personalItems = (recommendations.personal || []).slice(0, 3);
  const popularItems = (recommendations.popular || []).slice(0, 3);
  const mergedPromos = (recommendations.promotions || []).slice(0, 2);

  return (
    <section id="suggestions" className="py-5 bg-navy-gradient">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-4 px-2">
           <div>
              <h2 className="mb-1 fw-800 text-glow">Canteen AI</h2>
              <p className="text-muted small mb-0">Smart predictions curated for you</p>
           </div>
           <div className="ai-status-badge d-flex align-items-center">
              <span className="pulse-dot me-2"></span>
              <span className="small fw-700">Predictor: ACTIVE</span>
           </div>
        </div>

        <div className="row g-4 align-items-stretch">
           {/* Column 1: Personal (The Smartest) */}
           <div className="col-lg-4 col-md-6">
              <div className="glass-card h-100 p-4">
                 <h5 className="card-title-premium mb-4">
                    <i className="fas fa-magic text-accent"></i>
                    Just For You
                 </h5>
                 
                 <div className="smart-v-list">
                    {personalItems.length > 0 ? (
                       personalItems.map((item, i) => (
                          <div key={i} className="smart-item-row p-2 rounded-3 interact-card">
                             <img src={getDishImage(item.name)} alt={item.name} className="smart-item-img" />
                             <div className="flex-grow-1 min-w-0">
                                <div className="fw-700 text-white small text-truncate">{item.name}</div>
                                <div className="text-accent x-small opacity-75">98% Flavor Match</div>
                             </div>
                             <div className="rating-pill">
                                {item.rating || 4.5} <span className="text-warning">★</span>
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="empty-state-v2">
                          <i className="fas fa-history mb-2 d-block opacity-30"></i>
                          Wait for more orders to unlock
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Column 2: Popular (Trending Today) */}
           <div className="col-lg-4 col-md-6">
              <div className="glass-card h-100 p-4">
                 <h5 className="card-title-premium mb-4">
                    <i className="fas fa-fire text-danger"></i>
                    Trending Today
                 </h5>
                 
                 <div className="smart-v-list">
                    {popularItems.map((item, i) => (
                       <div key={i} className="smart-item-row p-2 rounded-3 interact-card">
                          <img src={getDishImage(item.name)} alt={item.name} className="smart-item-img" />
                          <div className="flex-grow-1 min-w-0">
                             <div className="fw-700 text-white small text-truncate">{item.name}</div>
                             <div className="text-muted x-small">Popular in {item.category_name}</div>
                          </div>
                          <div className="trend-rank">#{i+1}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Column 3: Offers & Deals */}
           <div className="col-lg-4 col-md-12">
              <div className="glass-card h-100 p-4 border-accent-faded">
                 <h5 className="card-title-premium mb-4">
                    <i className="fas fa-ticket-alt text-success"></i>
                    Deals Locker
                 </h5>
                 
                 <div className="promos-v-list">
                    {/* Auto Discounts Display (Requested by User) */}
                    <div className="premium-promo-card p-3 mb-3 border border-1" style={{ borderColor: 'rgba(0, 212, 255, 0.3)' }}>
                       <div className="d-flex align-items-center mb-3">
                          <i className="fas fa-magic text-accent me-2"></i>
                          <h6 className="fw-800 text-white mb-0">Automatic Cart Discounts</h6>
                       </div>
                       
                       <div className="d-flex flex-column gap-2 ps-1">
                          <div className="d-flex align-items-center bg-dark-glass p-2 rounded-2">
                             <div className="text-accent fw-900 me-2" style={{ width: '60px' }}>₹10 OFF</div>
                             <div className="text-light small">On orders above ₹50</div>
                          </div>
                          
                          <div className="d-flex align-items-center bg-dark-glass p-2 rounded-2">
                             <div className="text-accent fw-900 me-2" style={{ width: '60px' }}>₹30 OFF</div>
                             <div className="text-light small">On orders above ₹100</div>
                          </div>
                          
                          <div className="d-flex align-items-center bg-dark-glass p-2 rounded-2">
                             <div className="text-accent fw-900 me-2" style={{ width: '60px' }}>₹60 OFF</div>
                             <div className="text-light small">On orders above ₹200</div>
                          </div>
                       </div>
                    </div>

                    {mergedPromos.length > 0 && mergedPromos.map((p, i) => (
                       <div key={i} className="premium-promo-card p-3 position-relative mt-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                             <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill x-small">PROMO CODE</span>
                             <div className="fw-800 text-white">₹{p.amount_off} OFF</div>
                          </div>
                          <p className="x-small text-muted mb-3">{p.message}</p>
                          <div className="d-flex align-items-center gap-2">
                             <div className="code-box-premium flex-grow-1 py-1 px-2">
                                <span className="code-text small fw-bold text-accent">{p.code}</span>
                             </div>
                             <button className="btn-v2 btn-glow-v2 btn-sm px-3 rounded-pill" onClick={() => onApplyCoupon(p.code)}>
                                Apply
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
