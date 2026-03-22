// src/components/Navbar.jsx - Navigation Bar Component
import { useState } from 'react';

export default function Navbar({ cartCount, onShowMenu, onShowCart, onShowOrders }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container d-flex justify-content-between align-items-center">
        <a className="navbar-brand" onClick={onShowMenu}>
          <i className="fas fa-utensils"></i> Smart Food Ordering System
        </a>

        <button className="navbar-toggler" onClick={() => setNavOpen(!navOpen)}>
          <span></span><span></span><span></span>
        </button>

        <div className={`navbar-nav ${navOpen ? 'show' : ''}`}>
          <button className="nav-link" onClick={() => { onShowMenu(); setNavOpen(false); }}>
            Menu
          </button>
          <button className="nav-link" onClick={() => { onShowCart(); setNavOpen(false); }}>
            <i className="fas fa-shopping-cart"></i> Cart (<span>{cartCount}</span>)
          </button>
          <button className="nav-link" onClick={() => { onShowOrders(); setNavOpen(false); }}>
            My Orders
          </button>
        </div>
      </div>
    </nav>
  );
}
