/**
 * Saaryans API Client Service
 * Centralized HTTP request utility with automatic auth header injection and robust error handling.
 * All backend communication goes through this module — no direct fetch() calls scattered in components.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Returns common headers including Authorization token if available
 */
export const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('saaryans-token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Core request helper — all API calls go through here
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(url, { ...options, headers, credentials: 'same-origin' });
  } catch {
    throw new Error('Unable to reach Saaryans. Please check your connection and try again.');
  }
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(json.message || `Request failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json.data;
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const sendWhatsAppOtp = async (phoneNumber) => request('/auth/whatsapp/send-otp', {
  method: 'POST', body: JSON.stringify({ phoneNumber }),
});

export const verifyWhatsAppOtp = async (requestId, otp) => request('/auth/whatsapp/verify-otp', {
  method: 'POST', body: JSON.stringify({ requestId, otp }),
});

/**
 * Verify whether a phone-authed user has completed registration
 * @param {string} token Firebase ID token
 */
export const verifyPhoneUser = async (token) => {
  return await request('/auth/verify-phone-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
};

/**
 * Complete first-time user profile with full name
 * @param {string} token Firebase ID token
 * @param {string} fullName
 */
export const completeProfile = async (token, fullName) => {
  return await request('/auth/complete-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fullName }),
  });
};

/**
 * Get current user's full profile from backend
 */
export const getMe = async () => {
  return await request('/auth/me');
};

// ─── Orders ──────────────────────────────────────────────────────────────────

/**
 * Create / place a new order
 * @param {Object} orderData
 */
export const placeOrder = async (orderData) => {
  return await request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

/**
 * Fetch all orders for current user session
 */
export const fetchOrders = async () => {
  return await request('/orders');
};

/**
 * Fetch details of a single order by ID
 * @param {string} orderId
 */
export const fetchOrderById = async (orderId) => {
  return await request(`/orders/${encodeURIComponent(orderId)}`);
};

export const requestOrderReturn = async (orderId, reason) => request(`/orders/${encodeURIComponent(orderId)}/return`, {
  method: 'PATCH', body: JSON.stringify({ reason }),
});

// ─── Coupons ─────────────────────────────────────────────────────────────────

/**
 * Validate a promotional coupon code server-side
 * @param {string} code
 * @param {number} subtotal
 */
export const validateCoupon = async (code, subtotal = 0) => {
  return await request('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
};

// ─── Products ────────────────────────────────────────────────────────────────

/**
 * Fetch catalog products, optionally filtered by category
 * @param {string|null} category
 */
export const fetchProducts = async (category = null) => {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return await request(`/products${query}`);
};

/**
 * Fetch a single product by ID or slug
 * @param {string|number} id
 */
export const fetchProductById = async (id) => {
  return await request(`/products/${encodeURIComponent(id)}`);
};

export default {
  getAuthHeaders,
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
  verifyPhoneUser,
  completeProfile,
  getMe,
  placeOrder,
  fetchOrders,
  fetchOrderById,
  validateCoupon,
  fetchProducts,
  fetchProductById,
};
