/**
 * Distance calculation utilities using Haversine formula
 */

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    throw new Error('Invalid coordinates provided');
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

const calculateDeliveryCharge = (distance, freeDeliveryDistance, perKmRate) => {
  if (distance <= freeDeliveryDistance) {
    return 0;
  }

  const chargeableDistance = distance - freeDeliveryDistance;
  const charge = chargeableDistance * perKmRate;

  return parseFloat(charge.toFixed(2));
};

const isServiceable = (distance, maxDistance) => {
  return distance <= maxDistance;
};

// ✅ FIXED: Correct function name (lowercase 'e')
const estimateDeliveryTime = (distance) => {
  if (distance <= 5) return 24;
  if (distance <= 10) return 48;
  if (distance <= 15) return 72;
  if (distance <= 20) return 96;
  return 120;
};

// ✅ FIXED: Export with correct name
module.exports = {
  calculateDistance,
  calculateDeliveryCharge,
  isServiceable,
  estimateDeliveryTime,
};