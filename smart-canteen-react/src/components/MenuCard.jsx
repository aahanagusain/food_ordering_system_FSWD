// src/components/MenuCard.jsx - Single Menu Item Card
import { getDishImage } from '../utils/images';

export default function MenuCard({ item, onAddToCart }) {
  const isOutOfStock = item.stock_quantity === 0;
  const price = Number(item.price || 0).toFixed(2);
  const imageUrl = getDishImage(item.name);

  return (
    <div className="card menu-card">
      <div className="card-img-top">
        <img
          src={imageUrl}
          alt={item.name}
          className="dish-image"
          loading="lazy"
        />
        <div className="image-overlay"></div>
        <div className="dish-name-overlay">
          <span className="dish-name-text">{item.name}</span>
        </div>
      </div>
      <div className="card-body">
        <h5 className="card-title">{item.name}</h5>
        <p className="card-text text-muted">{item.category_name}</p>
        <p className="card-text">{item.description || 'Delicious food item'}</p>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="price-stack">
              <span className="price-current">₹{price}</span>
            </div>
            <div className={`stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
              {isOutOfStock ? 'Out of Stock' : 'Available'}
            </div>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2 text-muted small">{item.preparation_time || 10} min</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onAddToCart(item.item_id)}
              disabled={isOutOfStock}
            >
              <i className="fas fa-plus"></i>
              {isOutOfStock ? 'Unavailable' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
