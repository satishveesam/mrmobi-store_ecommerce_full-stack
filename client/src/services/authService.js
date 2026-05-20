import api from './api.js';

export const authService = {
  login: (payload) => api.post('/auth/login', payload),
  signupUser: (payload) => api.post('/auth/user/signup', payload),
  loginUser: (payload) => api.post('/auth/user/login', payload),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (payload) => api.put('/user/profile', payload),
  
  // Addresses API
  getAddresses: () => api.get('/user/addresses'),
  addAddress: (payload) => api.post('/user/addresses', payload),
  updateAddress: (id, payload) => api.put(`/user/addresses/${id}`, payload),
  deleteAddress: (id) => api.delete(`/user/addresses/${id}`),
};
