// src/components/Suggestions.jsx - Recommendations / Suggestions Section
export default function Suggestions({ recommendations, currentCustomerId, coupons, onApplyCoupon }) {
  const personalItems = (recommendations.personal || []).slice(0, 5);
  const popularItems = (recommendations.popular || []).slice(0, 5);

  // Merge promotions + active coupons (remove duplicates by code)
  const allPromos = [...(recommendations.promotions || []), ...(coupons || []).filter(c => c.active)];
  const seen = new Set();
  const mergedPromos = allPromos.filter(p => p.code && !seen.has(p.code) && seen.add(p.code));

  return (
    <section id="suggestions" className="py-5">
      <div className="container">
        <h2 className="text-center">Suggestions</h2>
        <p className="text-center text-muted mb-4">Personal picks, crowd favourites, and current offers.</p>

        <div className="recommendations">
          {/* Frequently Bought */}
          <div className="recommendation-group">
            <h3>Frequently Bought</h3>
            <div className="frequently-bought-container">
              {personalItems.length > 0 && currentCustomerId ? (
                <ul className="recommendation-list">
                  {personalItems.map((item, i) => (
                    <li key={i} className="recommendation-item">
                      <div className="recommend-line">
                        <span className="recommend-name">
                          <i className="fas fa-heart"></i> {item.name}
                        </span>
                        <span className="recommend-pill">{item.times}×</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <input
                  type="text"
                  className="frequently-bought-input"
                  placeholder="Register to see your favourites."
                  readOnly
                />
              )}
            </div>
          </div>

          {/* Popular Dishes */}
          <div className="recommendation-group">
            <h3>Popular Dishes</h3>
            <ul className="recommendation-list">
              {popularItems.length === 0 ? (
                <li className="recommendation-empty text-muted">No orders yet</li>
              ) : (
                popularItems.map((item, i) => (
                  <li key={i} className="recommendation-item">
                    <div className="recommend-line">
                      <span className="recommend-name">
                        <i className="fas fa-fire" style={{ color: '#00d4ff' }}></i> {item.name}
                      </span>
                      <span className="recommend-pill">{item.times}×</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Current Offers */}
          <div className="recommendation-group">
            <h3>Current Offers</h3>
            <ul className="recommendation-list">
              {mergedPromos.length === 0 ? (
                <li className="recommendation-empty text-muted">No promotions</li>
              ) : (
                mergedPromos.map((promo, i) => {
                  const amount = promo.amount_off ? Number(promo.amount_off).toFixed(0) : '';
                  const minSubtotal = promo.min_subtotal ? Number(promo.min_subtotal).toFixed(0) : '';

                  return (
                    <li key={i} className="recommendation-item promotion-item">
                      <div className="promo-content-wrapper">
                        <div className="promo-left-section">
                          <i className="fas fa-tag" style={{ color: '#00d4ff' }}></i>
                          <div className="promo-title-text">{promo.title}</div>
                        </div>

                        {amount && (
                          <div className="promo-middle-section">
                            <div className="promo-chip-large">
                              <div>₹{amount}</div>
                              <div style={{ fontSize: '0.7rem' }}>OFF</div>
                              {minSubtotal && <div style={{ fontSize: '0.65rem' }}>ON ₹{minSubtotal}+</div>}
                            </div>
                          </div>
                        )}

                        <div className="promo-right-section">
                          <div className="promo-message">{promo.message}</div>
                          <div className="promo-time">
                            <i className="fas fa-clock"></i> {promo.time}
                          </div>
                          <div className="promo-actions">
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => onApplyCoupon(promo.code)}
                              style={{ borderColor: '#00d4ff', color: '#00d4ff' }}
                            >
                              Apply {promo.code}
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
