// src/components/AuthModal.jsx - Re-designed Premium Auth
import { useState } from 'react';

export default function AuthModal({ show, onClose, onLogin, onRegister, isInternal }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerType, setCustomerType] = useState('Student');

  if (!show && !isInternal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin(email, password);
    } else {
      onRegister({ name, email, phone, customer_type: customerType, password });
    }
  };

  const formBody = (
    <form onSubmit={handleSubmit} className="auth-premium-form">
      {mode === 'signup' && (
        <div className="input-field-group mb-4">
          <label className="field-label-premium">Full Name</label>
          <div className="input-wrapper-v2">
             <i className="fas fa-user field-icon"></i>
             <input 
               type="text" 
               className="input-v2"
               placeholder="John Doe"
               value={name} 
               onChange={e => setName(e.target.value)} 
               required 
             />
          </div>
        </div>
      )}

      <div className="input-field-group mb-4">
        <label className="field-label-premium">Email Address</label>
        <div className="input-wrapper-v2">
           <i className="fas fa-envelope field-icon"></i>
           <input 
             type="email" 
             className="input-v2"
             placeholder="name@gmail.com"
             value={email} 
             onChange={e => setEmail(e.target.value)} 
             required 
           />
        </div>
      </div>

      <div className="input-field-group mb-4">
        <label className="field-label-premium">Secure Password</label>
        <div className="input-wrapper-v2">
           <i className="fas fa-lock field-icon"></i>
           <input 
             type="password" 
             className="input-v2"
             placeholder="••••••••"
             value={password} 
             onChange={e => setPassword(e.target.value)} 
             required 
           />
        </div>
      </div>

      {mode === 'signup' && (
        <>
          <div className="input-field-group mb-4">
            <label className="field-label-premium">Phone Number</label>
            <div className="input-wrapper-v2">
               <i className="fas fa-phone field-icon"></i>
               <input 
                 type="tel" 
                 className="input-v2"
                 placeholder="+91 XXXXX XXXXX"
                 value={phone} 
                 onChange={e => setPhone(e.target.value)} 
               />
            </div>
          </div>
          <div className="input-field-group mb-5">
            <label className="field-label-premium">Role / Category</label>
            <div className="input-wrapper-v2">
               <i className="fas fa-user-tag field-icon"></i>
               <select 
                 className="select-v2"
                 value={customerType} 
                 onChange={e => setCustomerType(e.target.value)}
               >
                 <option value="Student">Student</option>
                 <option value="Staff">Staff</option>
                 <option value="Guest">Guest</option>
               </select>
            </div>
          </div>
        </>
      )}

      <button type="submit" className="btn-v2 btn-glow-v2 w-100 py-3 mt-2">
         {mode === 'login' ? 'Proceed to Dashboard' : 'Create My Account'}
         <i className="fas fa-arrow-right ms-2 fs-7"></i>
      </button>

      {!isInternal && (
         <div className="text-center mt-4">
            <button type="button" className="text-btn" onClick={onClose}>Cancel & return</button>
         </div>
      )}
    </form>
  );

  const cardContent = (
    <div className={`auth-card-premium ${isInternal ? 'is-embedded' : 'is-modal'}`}>
      <div className="auth-header-v2">
        <button 
          className={`auth-toggle-btn ${mode === 'login' ? 'active' : ''}`}
          onClick={() => setMode('login')}
          type="button"
        >
          Sign In
        </button>
        <button 
          className={`auth-toggle-btn ${mode === 'signup' ? 'active' : ''}`}
          onClick={() => setMode('signup')}
          type="button"
        >
          Join Now
        </button>
        <div className={`toggle-slider ${mode === 'signup' ? 'at-right' : ''}`}></div>
      </div>
      
      <div className="auth-body-v2">
         {formBody}
      </div>
    </div>
  );

  if (isInternal) return cardContent;

  return (
    <div className="modal-overlay-v2 show" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
       <div className="modal-dialog-v2">
          {cardContent}
       </div>
    </div>
  );
}
