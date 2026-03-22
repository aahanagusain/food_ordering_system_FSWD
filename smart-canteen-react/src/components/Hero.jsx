// src/components/Hero.jsx - Hero Section Component
export default function Hero({ onBrowseMenu }) {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Order Your Favorite Food Online</h1>
            <p>Skip the queue and order directly from your device. Fresh, delicious food delivered to your table.</p>
            <button className="btn btn-primary" onClick={onBrowseMenu}>
              <i className="fas fa-arrow-down"></i> Browse Menu
            </button>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"
              alt="Delicious Vegetarian Food"
              className="hero-food-image"
            />
            <div className="hero-image-glow"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
