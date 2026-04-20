import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import { isValidPincode } from '../../utils/helpers';

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    houseStreet: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await userAPI.getProfile();
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.houseStreet.trim()) {
      newErrors.houseStreet = 'House/Street is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!isValidPincode(formData.pincode)) {
      newErrors.pincode = 'Invalid pincode';
    }

    return newErrors;
  };

  const resetForm = () => {
    setFormData({
      houseStreet: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
    setErrors({});
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        await userAPI.updateAddress(editingId, formData);
      } else {
        await userAPI.addAddress(formData);
      }
      await fetchAddresses();
      resetForm();
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Failed to save address' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      houseStreet: address.houseStreet,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await userAPI.deleteAddress(addressId);
        await fetchAddresses();
      } catch (error) {
        alert('Failed to delete address');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Delivery Addresses
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-saffron-600 text-white px-4 py-2 rounded-lg hover:bg-saffron-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Address
          </button>
        )}
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h3>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                House / Street
              </label>
              <input
                type="text"
                value={formData.houseStreet}
                onChange={(e) => {
                  setFormData({ ...formData, houseStreet: e.target.value });
                  setErrors({ ...errors, houseStreet: '' });
                }}
                className="input-field"
                placeholder="House No., Building Name, Street"
              />
              {errors.houseStreet && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.houseStreet}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    setErrors({ ...errors, city: '' });
                  }}
                  className="input-field"
                  placeholder="City"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => {
                    setFormData({ ...formData, state: e.target.value });
                    setErrors({ ...errors, state: '' });
                  }}
                  className="input-field"
                  placeholder="State"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => {
                  setFormData({ ...formData, pincode: e.target.value });
                  setErrors({ ...errors, pincode: '' });
                }}
                className="input-field"
                placeholder="110001"
                maxLength="6"
              />
              {errors.pincode && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pincode}</p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-saffron-600 focus:ring-saffron-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Set as default address
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-saffron-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-saffron-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address._id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-saffron-600 dark:hover:border-saffron-400 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-saffron-600 dark:text-saffron-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {address.houseStreet}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    {address.isDefault && (
                      <span className="inline-block mt-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                        Default Address
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            No addresses added yet
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressManager;