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
    <div className="toast-container">
      <div className="toast show">
        <div className="toast-header">
          <i className={`fas ${iconClass}`}></i>
          <strong>Notification</strong>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <div className="toast-body">{message}</div>
      </div>
    </div>
  );
}
