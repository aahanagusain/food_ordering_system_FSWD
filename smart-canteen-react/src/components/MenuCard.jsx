// src/components/MenuCard.jsx - Premium Menu Item Card
import { getDishImage } from '../utils/images';

export default function MenuCard({ item, onAddToCart, onOpenReviews }) {
  const isOutOfStock = (item.stock_quantity || 0) === 0;
  const imageUrl = getDishImage(item.name);

  return (
    <div className="menu-card-premium h-100 animate-in">
      <div className="position-relative overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name}
          className="menu-card-img"
          loading="lazy"
        />
        {isOutOfStock && (
           <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-black bg-opacity-50">
              <span className="badge bg-danger rounded-pill px-3 py-2">Out of Stock</span>
           </div>
        )}
      </div>

      <div className="card-body p-4 d-flex flex-column gap-2">
        <div className="d-flex justify-content-between align-items-<ctrl94>">
           <div className="category-label text-accent fw-700 fs-small text-uppercase">{item.category_name}</div>
           <div className="rating-tag text-warning fs-small" onClick={() => onOpenReviews(item)} style={{ cursor: 'pointer' }}>
              <i className="fas fa-star me-1"></i> {item.rating || 4.5} 
              <span className="text-muted ms-1">({item.reviews_count || 10})</span>
           </div>
        </div>

        <h5 className="text-white fw-800 mb-2">{item.name}</h5>
        <p className="text-muted fs-small mb-4 line-clamp-2">{item.description || 'Prepared fresh daily with premium ingredients.'}</p>

        <div className="mt-auto pt-3 d-flex justify-content-between align-items-center border-top border-secondary">
          <div className="price-tag h4 text-white fw-800 mb-0">₹{parseFloat(item.price).toFixed(2)}</div>
          <button
            className="btn btn-v2 rounded-pill px-4 py-2"
            onClick={() => onAddToCart(item.item_id)}
            disabled={isOutOfStock}
          >
            <i className={`fas ${isOutOfStock ? 'fa-ban' : 'fa-plus'} me-2`}></i>
            {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
