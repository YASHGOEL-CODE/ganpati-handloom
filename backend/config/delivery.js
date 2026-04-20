// Fixed delivery configuration

// Store/Warehouse location (Ganpati Handloom)
const STORE_LOCATION = {
  latitude: 28.4744,    // Greater Noida coordinates
  longitude: 77.5040,
  address: 'Greater Noida, Uttar Pradesh, India',
};

// Delivery rules
const DELIVERY_RULES = {
  MAX_SERVICEABLE_DISTANCE: 20,  // km
  FREE_DELIVERY_DISTANCE: 5,     // km
  PER_KM_RATE: 10,               // ₹ per km
  CURRENCY: '₹',
};

module.exports = {
  STORE_LOCATION,
  DELIVERY_RULES,
};