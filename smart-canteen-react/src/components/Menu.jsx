// src/components/Menu.jsx - Premium Menu Section
import { useState } from 'react';
import MenuCard from './MenuCard';

const CATEGORIES = ['all', 'Beverages', 'Snacks', 'Main Course', 'Desserts', 'Breakfast'];

export default function Menu({ items, onAddToCart, onOpenReviews }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item => {
    const matchesCategory = activeFilter === 'all' || item.category_name === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="menu-section py-5 animate-in">
      <div className="container">
        <div className="text-center mb-5">
           <h2 className="fw-800 text-white display-6">Our Culinary <span className="text-accent">Collection</span></h2>
           <p className="text-muted">Handpicked ingredients, cooked to perfection.</p>
        </div>

        {/* Premium Search */}
        <div className="search-container-premium mb-5">
           <i className="fas fa-search search-icon-pos"></i>
           <input 
              type="text" 
              placeholder="Search for something delicious..." 
              className="form-control search-input-v2 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>

        {/* Modern Category Pills */}
        <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-pill ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Grid using Bootstrap col classes */}
        <div className="row g-4 justify-content-center">
          {filteredItems.length === 0 ? (
            <div className="text-center py-5">
               <i className="fas fa-search fa-3x mb-3 opacity-25"></i>
               <h4 className="text-white">No matches found</h4>
               <p className="text-muted">Try searching for something else!</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.item_id} className="col-12 col-md-6 col-lg-4">
                <MenuCard 
                  item={item} 
                  onAddToCart={onAddToCart} 
                  onOpenReviews={onOpenReviews} 
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
