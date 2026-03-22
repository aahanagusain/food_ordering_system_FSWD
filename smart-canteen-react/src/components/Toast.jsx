// src/components/Toast.jsx - Toast Notification Component
import { useEffect } from 'react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const iconClass = {
    success: 'fa-check-circle text-success',
    error: 'fa-exclamation-circle text-danger',
    warning: 'fa-exclamation-triangle text-warning',
    info: 'fa-info-circle text-primary'
  }[type] || 'fa-info-circle text-primary';

  return (
    <div className="toast-container-premium">
      <div className={`toast-premium ${type}`}>
        <div className="toast-content">
          <i className={`fas ${iconClass} toast-icon`}></i>
          <span className="toast-message">{message}</span>
          <button className="toast-close-btn" onClick={onClose}>&times;</button>
        </div>
      </div>
    </div>
  );
}
