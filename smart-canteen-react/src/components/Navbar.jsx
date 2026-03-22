// src/components/Navbar.jsx - Modern, Right-Aligned Navbar
import { useState } from 'react';

export default function Navbar({ cartCount, onViewChange, currentCustomer, onOpenAuth, onLogout }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg py-3 sticky-top">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Logo - Stays Left */}
        <a className="navbar-brand d-flex align-items-center gap-2" onClick={() => onViewChange('menu')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo">
             <i className="fas fa-utensils"></i>
          </div>
          <span className="brand-text">Smart Food Ordering System</span>
        </a>

        {/* Hamburger Menu Mobile */}
        <button 
          className="navbar-toggler border-0 text-white" 
          onClick={() => setNavOpen(!navOpen)}
          type="button"
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Right-Aligned Navigation Items */}
        <div className={`collapse navbar-collapse justify-content-end ${navOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav align-items-center gap-2 pt-lg-0 pt-3">
            <li className="nav-item">
              <button 
                className="nav-link nav-btn-link" 
                onClick={() => { onViewChange('menu'); setNavOpen(false); }}
              >
                Menu
              </button>
            </li>
            
            <li className="nav-item">
              <button 
                className="nav-link nav-btn-link" 
                onClick={() => { onViewChange('orders'); setNavOpen(false); }}
              >
                My Orders
              </button>
            </li>

            <li className="nav-item mx-lg-2">
              <button 
                className="nav-link nav-btn-link cart-trigger position-relative p-2" 
                onClick={() => { onViewChange('cart'); setNavOpen(false); }}
              >
                 <i className="fas fa-shopping-cart fa-lg"></i>
                 {cartCount > 0 && <span className="cart-badge-new">{cartCount}</span>}
              </button>
            </li>

            {currentCustomer ? (
              <li className="nav-item dropdown ms-lg-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="user-profile d-flex align-items-center gap-2" title={currentCustomer.name}>
                    <div className="avatar-small">
                      {currentCustomer.name.charAt(0)}
                    </div>
                    <span className="text-white small fw-600 d-none d-md-inline">{currentCustomer.name.split(' ')[0]}</span>
                  </div>
                  <button className="btn btn-outline-danger btn-sm p-2" onClick={onLogout} title="Logout">
                     <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </li>
            ) : (
              <li className="nav-item ms-lg-3">
                <button 
                  className="btn btn-primary rounded-pill px-4 shadow-accent" 
                  onClick={() => { onOpenAuth(); setNavOpen(false); }}
                >
                  Login / Sign Up
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
