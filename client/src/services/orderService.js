import api from './api.js';

export const orderService = {
  placeOrder: (payload) => api.post('/orders', payload),
  placeBulkOrders: (payload) => api.post('/orders/bulk', payload),
  getOrders: () => api.get('/orders'),
  getMyOrders: () => api.get('/orders/my'),
  getDashboard: () => api.get('/admin/dashboard'),
  updateStatus: (orderId, status) => api.put(`/orders/${orderId}/status`, null, { params: { status } }),
  cancelOrder: (orderId) => api.post(`/orders/${orderId}/cancel`),
};
