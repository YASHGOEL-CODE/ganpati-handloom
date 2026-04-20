const express = require('express');
const router = express.Router();
const axios = require('axios');

// Rate limiting - simple queue
let lastRequestTime = 0;
const MIN_INTERVAL = 1000; // 1 second

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// @desc    Search location
// @route   POST /api/geocoding/search
// @access  Public
const searchLocation = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 3) {
      return res.status(400).json({ 
        success: false,
        message: 'Query must be at least 3 characters' 
      });
    }

    console.log('🔍 Backend searching for:', query);

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_INTERVAL) {
      await delay(MIN_INTERVAL - timeSinceLastRequest);
    }
    lastRequestTime = Date.now();

    // Search with India bias
    const searchQuery = `${query}, India`;

    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          format: 'json',
          q: searchQuery,
          addressdetails: 1,
          limit: 10,
          countrycodes: 'in',
        },
        headers: {
          'User-Agent': 'GanpatiHandloom/1.0',
        },
        timeout: 10000,
      }
    );

    console.log('✅ Search results:', response.data.length);

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No results found for "${query}"`,
        results: [],
      });
    }

    res.json({
      success: true,
      results: response.data,
      count: response.data.length,
    });

  } catch (error) {
    console.error('❌ Search error:', error.message);

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Search failed. Please try again.',
      error: error.message,
    });
  }
};

// @desc    Reverse geocode
// @route   POST /api/geocoding/reverse
// @access  Public
const reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude required',
      });
    }

    console.log('🔄 Backend reverse geocoding:', { latitude, longitude });

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_INTERVAL) {
      await delay(MIN_INTERVAL - timeSinceLastRequest);
    }
    lastRequestTime = Date.now();

    const response = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          format: 'json',
          lat: latitude,
          lon: longitude,
          addressdetails: 1,
          zoom: 18,
        },
        headers: {
          'User-Agent': 'GanpatiHandloom/1.0',
        },
        timeout: 10000,
      }
    );

    console.log('✅ Address found');

    if (!response.data || !response.data.address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    const addr = response.data.address;

    const result = {
      formattedAddress: response.data.display_name,
      placeId: response.data.place_id,
      street: [addr.road, addr.street, addr.house_number].filter(Boolean).join(' ').trim(),
      area: addr.suburb || addr.neighbourhood || addr.quarter || '',
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      state: addr.state || addr.state_district || '',
      pincode: addr.postcode || '',
      country: addr.country || 'India',
    };

    res.json({
      success: true,
      address: result,
    });

  } catch (error) {
    console.error('❌ Reverse geocoding error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Geocoding failed',
      error: error.message,
    });
  }
};

router.post('/search', searchLocation);
router.post('/reverse', reverseGeocode);

module.exports = router;