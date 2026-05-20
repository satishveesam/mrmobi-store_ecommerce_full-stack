import api from './api';

export const bannerService = {
  getAllBanners: async () => {
    const response = await api.get('/banners');
    return response.data;
  },

  createBanner: async (bannerData) => {
    const response = await api.post('/banners', bannerData);
    return response.data;
  },

  deleteBanner: async (id) => {
    await api.delete(`/banners/${id}`);
  }
};
