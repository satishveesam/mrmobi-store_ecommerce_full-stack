import api from './api.js';

export const productService = {
  getProducts: (search = '') => api.get('/products', { params: search ? { search } : {} }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (payload) => api.post('/products', payload),
  updateProduct: (id, payload) => api.put(`/products/${id}`, payload),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};
