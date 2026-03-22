// src/components/Menu.jsx - Menu Section with Filter Buttons
import { useState } from 'react';
import MenuCard from './MenuCard';

const CATEGORIES = ['all', 'Beverages', 'Snacks', 'Main Course', 'Desserts', 'Breakfast'];

export default function Menu({ menuItems, onAddToCart }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeFilter === 'all' || item.category_name === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="py-5">
      <div className="container">
        <h2 className="text-center">Our Menu</h2>

        {/* Search Bar */}
        <div className="search-container mb-4">
          <div className="search-box">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search for your favorite dish..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`btn btn-outline ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="menu-grid">
          {filteredItems.length === 0 ? (
            <div className="text-center"><p>No items found.</p></div>
          ) : (
            filteredItems.map(item => (
              <MenuCard key={item.item_id} item={item} onAddToCart={onAddToCart} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
