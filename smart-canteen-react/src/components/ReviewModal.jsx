// src/components/ReviewModal.jsx - Reviews & Rating Modal
import { useState, useEffect } from 'react';
import { fetchReviews, addReview } from '../utils/api';

export default function ReviewModal({ show, onClose, item, currentUser, onRatingUpdate }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && item) {
      loadReviews();
    }
  }, [show, item]);

  const loadReviews = async () => {
    setLoading(true);
    const res = await fetchReviews(item.item_id);
    if (res.success) setReviews(res.data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert('Please login to leave a review');
    
    setLoading(true);
    const res = await addReview(item.item_id, {
      customer_id: currentUser.customer_id,
      customer_name: currentUser.name,
      rating,
      comment
    });
    
    if (res.success) {
      setComment('');
      loadReviews();
      if (onRatingUpdate) onRatingUpdate();
    }
    setLoading(false);
  };

  if (!show || !item) return null;

  return (
    <div className={`modal-overlay ${show ? 'show' : ''}`} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-dialog">
        <div className="modal-content review-modal">
          <div className="modal-header">
            <h5>Reviews: {item.name}</h5>
            <button className="btn-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            {/* Review List */}
            <div className="review-list mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {reviews.length === 0 ? (
                <p className="text-muted text-center py-4">No reviews yet. Be the first!</p>
              ) : (
                reviews.map((r, i) => (
                  <div key={i} className="review-item border-bottom border-secondary py-3">
                    <div className="d-flex justify-content-between">
                      <span className="fw-700 text-white">{r.customer_name}</span>
                      <span className="text-warning small">
                        {[...Array(5)].map((_, star) => (
                          <i key={star} className={`${star < r.rating ? 'fas' : 'far'} fa-star`}></i>
                        ))}
                      </span>
                    </div>
                    <p className="small text-muted mb-1">{new Date(r.review_date).toLocaleDateString()}</p>
                    <p className="mb-0 text-white-50">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            {currentUser && (
              <form onSubmit={handleSubmit} className="p-3 bg-dark rounded border border-secondary shadow-sm">
                <h6 className="mb-3">Leave a Review</h6>
                <div className="mb-3">
                  <label className="small text-muted mb-1">Your Rating</label>
                  <div className="rating-select d-flex gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button 
                        key={num}
                        type="button" 
                        className={`btn btn-sm ${rating >= num ? 'btn-warning' : 'btn-outline-secondary'}`}
                        onClick={() => setRating(num)}
                      >
                        {num} <i className="fas fa-star"></i>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <textarea 
                    className="form-control bg-darker border-secondary text-white" 
                    placeholder="Tell us what you liked..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows="3"
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Posting...' : 'Post Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
