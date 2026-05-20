import api from './api.js';

export const reviewService = {
  canRate: (productId) => api.get(`/reviews/can-rate/${productId}`),
  submit: (payload) => api.post('/reviews', payload),
  productReviews: (productId) => api.get(`/reviews/product/${productId}`),
  getAllReviews: () => api.get('/reviews/all'),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

