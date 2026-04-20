// Use backend proxy to avoid CORS issues

const API_BASE = 'http://localhost:5000/api/geocoding';

// Get current location from browser
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

// Reverse geocode using backend
export const reverseGeocode = async (lat, lng) => {
  try {
    console.log('🔄 Reverse geocoding via backend:', { lat, lng });

    const response = await fetch(`${API_BASE}/reverse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: lat,
        longitude: lng,
      }),
    });

    const data = await response.json();
    console.log('✅ Backend response:', data);

    if (!data.success) {
      throw new Error(data.message || 'Geocoding failed');
    }

    return data.address;

  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    
    // Return fallback
    return {
      formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      placeId: null,
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    };
  }
};

// Search location using backend
export const searchLocation = async (query) => {
  try {
    if (!query || query.trim().length < 3) {
      throw new Error('Please enter at least 3 characters');
    }

    console.log('🔍 Searching via backend:', query);

    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
      }),
    });

    const data = await response.json();
    console.log('✅ Backend search response:', data);

    if (!data.success) {
      throw new Error(data.message || 'Search failed');
    }

    if (!data.results || data.results.length === 0) {
      throw new Error(`No results found for "${query}"`);
    }

    return data.results;

  } catch (error) {
    console.error('❌ Search error:', error);
    throw error;
  }
};

// Calculate distance
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};