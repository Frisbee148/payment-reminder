import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  requestLoginOTP: (email) => api.post('/auth/request-login-otp', { email }),
  login: (data) => api.post('/auth/login', data),
};

// Payment API calls
export const paymentAPI = {
  getPayments: () => api.get('/payments'),
  createPayment: (paymentData) => api.post('/payments', paymentData),
  updatePaymentStatus: (id, status) => api.patch(`/payments/${id}/status`, { status }),
  deletePayment: (id) => api.delete(`/payments/${id}`),
};

export default api;
