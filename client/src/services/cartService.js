import api from './api.js';

export const cartService = {
  getCart: () => api.get('/user/cart'),
  addToCart: (productId, quantity = 1) => api.post(`/user/cart/add?productId=${productId}&quantity=${quantity}`),
  updateQuantity: (productId, quantity) => api.put(`/user/cart/update?productId=${productId}&quantity=${quantity}`),
  removeFromCart: (productId) => api.delete(`/user/cart/remove/${productId}`),
  clearCart: () => api.delete('/user/cart/clear'),
};
