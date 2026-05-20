import api from './api';

export const categoryService = {
  getAll: async () => {
    const res = await api.get('/categories');
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/categories', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    await api.delete(`/categories/${id}`);
  },
};
