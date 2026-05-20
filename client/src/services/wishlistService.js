import api from './api.js';

export const wishlistService = {
  getWishlist: () => api.get('/user/wishlist'),
  getWishlistCount: () => api.get('/user/wishlist/count'),
  addToWishlist: (productId) => api.post(`/user/wishlist/add?productId=${productId}`),
  removeFromWishlist: (productId) => api.delete(`/user/wishlist/remove/${productId}`),
  checkInWishlist: (productId) => api.get(`/user/wishlist/check/${productId}`),
};
