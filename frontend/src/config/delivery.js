// Frontend delivery configuration (must match backend)

export const STORE_LOCATION = {
  latitude: 28.4744,
  longitude: 77.5040,
  address: 'Greater Noida, Uttar Pradesh, India',
};

export const DELIVERY_RULES = {
  MAX_SERVICEABLE_DISTANCE: 20,  // km
  FREE_DELIVERY_DISTANCE: 5,     // km
  PER_KM_RATE: 10,               // ₹ per km
  CURRENCY: '₹',
};