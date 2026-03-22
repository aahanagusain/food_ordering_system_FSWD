// src/utils/api.js - API Helper for making requests to backend
// Change this URL if your backend runs on a different port
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Generic API call function
export async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { success: false, message: error.message };
  }
}

// ── Specific API functions ──

export function fetchMenu() {
  return apiCall('/menu');
}

export function fetchCoupons() {
  return apiCall('/coupons');
}

export function fetchRecommendations(customerId) {
  const query = customerId ? `?customerId=${customerId}` : '';
  return apiCall(`/recommendations${query}`);
}

export function registerCustomer(data) {
  return apiCall('/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, password: data.password || 'password123' })
  });
}

export function loginCustomer(email, password) {
  return apiCall('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

export function fetchReviews(id) {
  return apiCall(`/menu/${id}/reviews`);
}

export function addReview(id, data) {
  return apiCall(`/menu/${id}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export function updateOrderStatus(orderId, status) {
  return apiCall(`/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
}

export function placeOrder(data) {
  return apiCall('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export function fetchCustomerOrders(customerId) {
  return apiCall(`/orders/customer/${customerId}`);
}
