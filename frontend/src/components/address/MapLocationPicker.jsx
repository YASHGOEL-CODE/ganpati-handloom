import React, { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiNavigation, FiAlertCircle } from 'react-icons/fi';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapLocationPicker = ({ onLocationSelect, initialLocation }) => {
  // State
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const mapRef = useRef(null);
  const initRef = useRef(false);

  const defaultCenter = initialLocation || { lat: 28.4744, lng: 77.5040 };

  // Initialize map once
  useEffect(() => {
    if (!initRef.current && mapRef.current) {
      initRef.current = true;
      initializeMap();
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  const initializeMap = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🗺️ Initializing map...');

      await new Promise(resolve => setTimeout(resolve, 100));

      const mapInstance = L.map(mapRef.current, {
        center: [defaultCenter.lat, defaultCenter.lng],
        zoom: 15,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomControl: true,
        inertia: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapInstance);

      const markerInstance = L.marker([defaultCenter.lat, defaultCenter.lng], {
        draggable: true,
        autoPan: true,
      }).addTo(mapInstance);

      markerInstance.on('dragend', async (e) => {
        const pos = e.target.getLatLng();
        console.log('📍 Marker dragged to:', pos);
        await handleLocationChange(pos.lat, pos.lng);
      });

      mapInstance.on('click', async (e) => {
        console.log('🖱️ Map clicked at:', e.latlng);
        markerInstance.setLatLng(e.latlng);
        await handleLocationChange(e.latlng.lat, e.latlng.lng);
      });

      setMap(mapInstance);
      setMarker(markerInstance);

      await handleLocationChange(defaultCenter.lat, defaultCenter.lng);

      setLoading(false);
      console.log('✅ Map initialized');

    } catch (err) {
      console.error('❌ Map init error:', err);
      setError('Failed to load map. Please refresh.');
      setLoading(false);
    }
  };

  // ── CHANGED: Added Nominatim fallback for correct city/state/pincode ──
  const reverseGeocode = async (lat, lng) => {
    try {
      console.log('🔄 Reverse geocoding via Nominatim:', { lat, lng });

      const nominatimRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'GanpatiHandloom/1.0',
          },
        }
      );
      const nominatimData = await nominatimRes.json();
      console.log('📍 Nominatim response:', nominatimData);

      const addr = nominatimData.address || {};

      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.county ||
        addr.district ||
        '';

      const area =
        addr.suburb ||
        addr.neighbourhood ||
        addr.locality ||
        addr.quarter ||
        addr.residential ||
        '';

      return {
        formattedAddress: nominatimData.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        street: addr.road || addr.street || addr.pedestrian || '',
        area: area,
        city: city,
        state: addr.state || '',
        pincode: addr.postcode || '',
        country: addr.country || 'India',
      };

    } catch (error) {
      console.error('❌ Geocoding error:', error);
      return {
        formattedAddress: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        street: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      };
    }
  };
  const handleLocationChange = async (lat, lng) => {
    try {
      setGeocoding(true);

      const address = await reverseGeocode(lat, lng);
      setSelectedAddress(address);

      if (onLocationSelect) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          formattedAddress: address.formattedAddress,
          street: address.street || '',
          area: address.area || '',
          city: address.city || '',
          state: address.state || '',
          pincode: address.pincode || '',
          country: address.country || 'India',
        });
      }

    } catch (err) {
      console.error('❌ Location change error:', err);
    } finally {
      setGeocoding(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    if (locationLoading) return;

    setError(null);
    setLocationLoading(true);

    if (
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost'
    ) {
      setError('Location access requires HTTPS.');
      setLocationLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported.');
      setLocationLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const onSuccess = async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      console.log('✅ Location:', lat, lng);

      if (map && marker) {
        map.flyTo([lat, lng], 16, { duration: 1.5 });
        marker.setLatLng([lat, lng]);
        await handleLocationChange(lat, lng);
      }

      setLocationLoading(false);
    };

    const buildErrorMessage = (err) => {
      if (err.code === 1) {
        return 'Please allow location permission to use current location.';
      }
      if (err.code === 2) {
        return 'Please turn on your device location/GPS to use current location.';
      }
      if (err.code === 3) {
        return 'Please turn on your device location/GPS to use current location.';
      }
      return 'Please turn on your device location/GPS to use current location.';
    };

    const onError = (err) => {
      console.error('❌ Location error:', err);
      setError(buildErrorMessage(err));
      setLocationLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => {
        if (err.code === 1) {
          onError(err);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          onSuccess,
          onError,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="w-full h-full flex flex-col">

      {/* Use Current Location Button */}
      <button
        onClick={handleGetCurrentLocation}
        disabled={locationLoading}
        type="button"
        className="mb-2 flex items-center justify-center gap-2 bg-saffron-600 text-white px-6 py-3 rounded-lg hover:bg-saffron-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
      >
        <FiNavigation className="w-5 h-5" />
        {locationLoading ? 'Getting Your Location...' : 'Use My Current Location'}
      </button>

      {/* GPS instruction below button */}
      <p className="text-xs text-gray-400 mb-3 text-center">
        Please make sure your phone GPS/location is turned ON
      </p>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
              Location Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        className="relative flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-lg"
        style={{
          minHeight: '400px',
          touchAction: 'none',
        }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-[1000]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-saffron-600 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {geocoding ? 'Fetching address...' : 'Loading map...'}
              </p>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-full"
          style={{
            minHeight: '400px',
            cursor: 'grab',
            zIndex: 1,
          }}
        />

        {/* Geocoding Indicator */}
        {geocoding && !loading && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-xl border-2 border-saffron-500 flex items-center gap-2 z-[1000]">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-saffron-600 border-t-transparent" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Getting address...
            </span>
          </div>
        )}
      </div>

      {/* Selected Address Display */}
      <div className="mt-4 p-4 bg-gradient-to-r from-saffron-50 to-golden-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-saffron-300 dark:border-saffron-700 shadow-md">
        <div className="flex items-start gap-3">
          <FiMapPin className="w-6 h-6 text-saffron-600 dark:text-saffron-400 flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
              📍 Selected Location
            </h3>
            {selectedAddress ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-900 dark:text-white font-medium break-words leading-relaxed">
                  {selectedAddress.formattedAddress}
                </p>
                {(selectedAddress.city || selectedAddress.state || selectedAddress.pincode) && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedAddress.city && (
                      <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                        🏙️ {selectedAddress.city}
                      </span>
                    )}
                    {selectedAddress.state && (
                      <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                        📍 {selectedAddress.state}
                      </span>
                    )}
                    {selectedAddress.pincode && (
                      <span className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                        📮 {selectedAddress.pincode}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Click "Use My Current Location" or click on the map to select your delivery address
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
          <strong>💡 How to use:</strong> Click "Use My Current Location" to auto-detect your address,
          or drag the marker on the map to your exact location. The address fields below will be filled automatically.
        </p>
      </div>
    </div>
  );
};

export default MapLocationPicker;