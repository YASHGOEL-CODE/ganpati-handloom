import React, { useState, useEffect } from 'react';
import { adminAPI, clearCache } from '../../services/api';
import { FiUpload, FiX, FiImage, FiAlertCircle } from 'react-icons/fi';

const AddProduct = ({ onClose, onProductAdded }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    productType: 'bedsheet',
    fabricType: 'cotton',
    size: 'standard',
    color: '',
    stock: '',
    careInstructions: 'Hand wash or gentle machine wash. Do not bleach.',
    isPremium: false,
    isHandmade: true,
    collections: [], // ✅ NEW FIELD
  });

  // Available collections
  const availableCollections = [
    { value: 'rajasthan-handloom', label: 'Rajasthan Handloom' },
    { value: 'winter-quilt', label: 'Winter Quilt' },
    { value: 'wedding-special', label: 'Wedding Special' },
    { value: 'eco-friendly-cotton', label: 'Eco-Friendly Cotton' },
    { value: 'premium-handmade', label: 'Premium Handmade' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await adminAPI.getCategories();
      console.log('Categories response:', response.data);
      
      if (response.data.success && response.data.categories && response.data.categories.length > 0) {
        setCategories(response.data.categories);
        setFormData((prev) => ({ ...prev, category: response.data.categories[0]._id }));
      } else if (response.data.categories && response.data.categories.length > 0) {
        setCategories(response.data.categories);
        setFormData((prev) => ({ ...prev, category: response.data.categories[0]._id }));
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Only image files (JPEG, PNG, GIF, WEBP) are allowed');
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Each image must be less than 5MB');
      return;
    }

    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ✅ NEW: Handle collection toggle
  const handleCollectionToggle = (collectionValue) => {
    setFormData((prev) => {
      const isSelected = prev.collections.includes(collectionValue);
      return {
        ...prev,
        collections: isSelected
          ? prev.collections.filter((c) => c !== collectionValue)
          : [...prev.collections, collectionValue],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.description) {
      alert('Please fill all required fields');
      return;
    }

    if (!formData.category && categories.length > 0) {
      alert('Please select a category');
      return;
    }

    if (categories.length === 0) {
      alert('⚠️ No categories available. Please create a category first from Categories section.');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    try {
      setLoading(true);

      const uploadData = new FormData();
      
      Object.keys(formData).forEach((key) => {
        if (key === 'collections') {
          // ✅ Append collections as JSON array
          uploadData.append('collections', JSON.stringify(formData.collections));
        } else {
          uploadData.append(key, formData[key]);
        }
      });

      images.forEach((image) => {
        uploadData.append('images', image);
      });

      const response = await fetch('http://localhost:5000/admin/products/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: uploadData,
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Product created successfully!');
        clearCache();
        onProductAdded();
        onClose();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {categories.length === 0 && !loadingCategories && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <FiAlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-semibold">
                    No Categories Available
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    Please create at least one category before adding products.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Images * (Max 5, up to 5MB each)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-saffron-500 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={images.length >= 5}
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center ${
                  images.length >= 5 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {images.length >= 5 ? 'Maximum images reached' : 'Click to upload images'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  JPEG, PNG, GIF, WEBP (Max 5MB each)
                </span>
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-4 mt-6">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-saffron-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-saffron-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter product description"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-saffron-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-saffron-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          {/* Category and Product Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              {loadingCategories ? (
                <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="w-full px-4 py-2 border-2 border-yellow-400 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-sm">
                  No categories available. Create one first!
                </div>
              ) : (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-saffron-500 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Type *
              </label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-saffron-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="bedsheet">Bedsheet</option>
                <option value="pillow">Pillow</option>
                <option value="sofa-cover">Sofa Cover</option>
                <option value="blanket">Blanket</option>
                <option value="quilt">Quilt</option>
                <option value="curtain">Curtain</option>
                <option value="door-mat">Door Mat</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* ✅ NEW: Collections Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Collections (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableCollections.map((collection) => (
                <label
                  key={collection.value}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.collections.includes(collection.value)
                      ? 'border-saffron-600 bg-saffron-50 dark:bg-saffron-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.collections.includes(collection.value)}
                    onChange={() => handleCollectionToggle(collection.value)}
                    className="w-4 h-4 text-saffron-600 focus:ring-saffron-500 rounded"
                  />
                  <span className={`text-sm font-medium ${
                    formData.collections.includes(collection.value)
                      ? 'text-saffron-700 dark:text-saffron-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {collection.label}
                  </span>
                </label>
              ))}
            </div>
            {formData.collections.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Selected: {formData.collections.length} collection(s)
              </p>
            )}
          </div>

          {/* Fabric Type and Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fabric Type *
              </label>
              <select
                name="fabricType"
                value={formData.fabricType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-saffron-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="cotton">Cotton</option>
                <option value="silk">Silk</option>
                <option value="wool">Wool</option>
                <option value="blended">Blended</option>
                <option value="linen">Linen</option>
                <option value="synthetic">Synthetic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Size
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-saffron-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="standard">Standard</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="king">King</option>
                <option value="queen">Queen</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color *
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-saffron-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., blue"
            />
          </div>

          {/* Care Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Care Instructions
            </label>
            <textarea
              name="careInstructions"
              value={formData.careInstructions}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-saffron-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPremium"
                checked={formData.isPremium}
                onChange={handleChange}
                className="w-4 h-4 text-saffron-600 focus:ring-saffron-500 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Premium Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isHandmade"
                checked={formData.isHandmade}
                onChange={handleChange}
                className="w-4 h-4 text-saffron-600 focus:ring-saffron-500 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Handmade</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || categories.length === 0}
              className="flex-1 px-6 py-3 bg-saffron-600 text-white rounded-lg font-semibold hover:bg-saffron-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FiUpload className="w-5 h-5" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;