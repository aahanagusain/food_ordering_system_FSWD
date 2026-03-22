// src/components/CustomerModal.jsx - Customer Registration Modal
import { useState } from 'react';

export default function CustomerModal({ show, onClose, onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customerType, setCustomerType] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !customerType) {
      alert('Please fill all required fields');
      return;
    }
    onRegister({ name, email, phone, customer_type: customerType });
  };

  return (
    <div className={`modal-overlay ${show ? 'show' : ''}`} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Customer Information</h5>
            <button className="btn-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Customer Type *</label>
              <select value={customerType} onChange={e => setCustomerType(e.target.value)} required>
                <option value="">Select Type</option>
                <option value="Student">Student</option>
                <option value="Staff">Staff</option>
                <option value="Guest">Guest</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}
