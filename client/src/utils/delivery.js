import api from '../services/api.js';

let cachedLocationsPromise = null;
let cachedLocations = null;

export const getQuickLocations = async () => {
  if (cachedLocations) return cachedLocations;
  if (!cachedLocationsPromise) {
    cachedLocationsPromise = api.get('/products/settings/quick-delivery-locations')
      .then(({ data }) => {
        cachedLocations = data || [];
        return cachedLocations;
      })
      .catch((err) => {
        console.error('Failed to load quick locations', err);
        return [];
      });
  }
  return cachedLocationsPromise;
};

export const checkQuickDeliveryEligibility = async () => {
  const pin = String(localStorage.getItem('delivery_pincode') || '').trim();

  // Rely purely on dynamic lookups against database pincodes coverage area
  if (!pin) return false;
  try {
    const locations = await getQuickLocations();
    return locations.some(l => String(l.pincode).trim() === pin);
  } catch (err) {
    return false;
  }
};
