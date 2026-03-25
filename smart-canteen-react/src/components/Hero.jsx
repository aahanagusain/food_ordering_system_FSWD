// src/components/Hero.jsx - Hero Section Component
export default function Hero({ onOrderClick }) {
  return (
    <section className="hero-section py-5 animate-in">
      <div className="container">
        <div className="hero-content d-flex align-items-center gap-5 pt-4">
          <div className="hero-text flex-grow-1">
            <h1 className="display-4 fw-800 text-white mb-3">Savor the Taste of <span className="text-accent-glow">Excellence</span></h1>
            <h4 className="text-accent mb-4 fw-light">Seamless ordering, delightful dining.</h4>
            <p className="lead text-light mb-4 fs-5" style={{ opacity: 0.85 }}>Skip the queue. Our AI-powered food ordering system ensures your favorite meals are ready right when you arrive.</p>
            <div className="d-flex gap-3">
              <button className="btn btn-primary rounded-pill px-5 py-3 fs-5 shadow-accent" onClick={onOrderClick}>
                 Order Now <i className="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
          <div className="hero-image d-none d-lg-block">
             <div className="image-wrapper-premium">
                <img 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop" 
                  alt="Premium Food" 
                  className="hero-food-img-new" 
                />
                <div className="image-aura"></div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
