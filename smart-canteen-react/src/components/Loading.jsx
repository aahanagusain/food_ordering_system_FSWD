// src/components/Loading.jsx - Loading Spinner Component
export default function Loading({ show }) {
  if (!show) return null;

  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );
}
