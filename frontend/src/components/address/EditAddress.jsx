import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { addressAPI } from '../../services/api';
import MapLocationPicker from './MapLocationPicker';
import { FiMapPin, FiEdit, FiAlertCircle, FiCheck } from 'react-icons/fi';
import Loader from '../common/Loader';

const EditAddress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl'); // ✅ Get return URL from query params
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);

  const [formData, setFormData] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    houseStreet: '',
    areaLandmark: '',
    city: '',
    state: '',
    pincode: '',
    latitude: null,
    longitude: null,
    isDefault: false,
  });

  useEffect(() => {
    fetchAddress();
  }, [id]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const response = await addressAPI.getById(id);
      const address = response.data.address;

      setFormData({
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        houseStreet: address.houseStreet,
        areaLandmark: address.areaLandmark || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
        placeId: address.placeId,
        formattedAddress: address.formattedAddress,
        isDefault: address.isDefault,
      });
    } catch (err) {
      console.error('Fetch address error:', err);
      setError('Failed to load address');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMapLocationSelect = (location) => {
    setFormData({
      ...formData,
      latitude: location.latitude,
      longitude: location.longitude,
      placeId: location.placeId,
      formattedAddress: location.formattedAddress,
      houseStreet: location.street || formData.houseStreet,
      areaLandmark: location.area || formData.areaLandmark,
      city: location.city || formData.city,
      state: location.state || formData.state,
      pincode: location.pincode || formData.pincode,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.fullName || !formData.phone || !formData.houseStreet || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await addressAPI.update(id, formData);
      
      // ✅ Navigate back to returnUrl if provided, otherwise go to profile
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/profile?tab=addresses');
      }
    } catch (err) {
      console.error('Update address error:', err);
      setError(err.response?.data?.message || 'Failed to update address');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // ✅ Navigate back to returnUrl if provided, otherwise go to profile
    if (returnUrl) {
      navigate(returnUrl);
    } else {
      navigate('/profile?tab=addresses');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Address
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your delivery address information
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {/* Toggle Map View */}
          <div className="mb-6">
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 text-saffron-600 dark:text-saffron-400 hover:underline"
            >
              <FiMapPin className="w-4 h-4" />
              {showMap ? 'Hide Map' : 'Update Location on Map'}
            </button>
          </div>

          {/* Map (Collapsible) */}
          {showMap && (
            <div className="mb-6 h-[400px] sm:h-[500px] border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <MapLocationPicker
                onLocationSelect={handleMapLocationSelect}
                initialLocation={
                  formData.latitude && formData.longitude
                    ? { lat: formData.latitude, lng: formData.longitude }
                    : null
                }
              />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Address Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address Label
              </label>
              <div className="flex gap-4">
                {['Home', 'Office', 'Other'].map((label) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="label"
                      value={label}
                      checked={formData.label === label}
                      onChange={handleFormChange}
                      className="w-4 h-4 text-saffron-600 focus:ring-saffron-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleFormChange}
                required
                className="input-field"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                required
                maxLength="10"
                className="input-field"
                placeholder="10-digit mobile number"
              />
            </div>

            {/* House/Street */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                House No. / Street / Building *
              </label>
              <input
                type="text"
                name="houseStreet"
                value={formData.houseStreet}
                onChange={handleFormChange}
                required
                className="input-field"
                placeholder="Enter house/street address"
              />
            </div>

            {/* Area/Landmark */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Area / Landmark
              </label>
              <input
                type="text"
                name="areaLandmark"
                value={formData.areaLandmark}
                onChange={handleFormChange}
                className="input-field"
                placeholder="Enter area or nearby landmark"
              />
            </div>

            {/* City, State, Pincode Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  required
                  className="input-field"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  required
                  className="input-field"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleFormChange}
                  required
                  maxLength="6"
                  className="input-field"
                  placeholder="6-digit pincode"
                />
              </div>
            </div>

            {/* Default Address Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 text-saffron-600 focus:ring-saffron-500 rounded"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Make this my default delivery address
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-saffron-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-saffron-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Update Address
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAddress;