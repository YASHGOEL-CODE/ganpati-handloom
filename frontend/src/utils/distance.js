/**
 * Frontend distance calculation utilities
 * NOTE: These are for instant UI feedback only
 * Server MUST recalculate for security
 */

/**
 * Calculate distance using Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in km
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null;
  }

  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(2));
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate delivery charge
 * @param {number} distance
 * @param {number} freeThreshold
 * @param {number} perKmRate
 * @returns {number} Charge in rupees
 */
export const calculateDeliveryCharge = (distance, freeThreshold, perKmRate) => {
  if (distance <= freeThreshold) {
    return 0;
  }

  const chargeableDistance = distance - freeThreshold;
  const charge = chargeableDistance * perKmRate;

  return parseFloat(charge.toFixed(2));
};

/**
 * Check if serviceable
 * @param {number} distance
 * @param {number} maxDistance
 * @returns {boolean}
 */
export const isServiceable = (distance, maxDistance) => {
  return distance <= maxDistance;
};

/**
 * Format distance for display
 * @param {number} distance
 * @returns {string}
 */
export const formatDistance = (distance) => {
  if (!distance) return 'N/A';
  return `${distance.toFixed(1)} km`;
};