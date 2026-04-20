import React, { useState, useEffect } from 'react';
import { adminAPI, clearCache } from '../../services/api';
import { FiX, FiUpload, FiTrash2 } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageHelper';

const EditProduct = ({ product, onClose, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    productType: '',
    fabricType: '',
    color: '',
    size: '',
    weight: '',
    dimensions: '',
    careInstructions: '',
    isActive: true,
    isFeatured: false,
    collections: [],
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const availableCollections = [
    'rajasthan-handloom',
    'winter-quilt',
    'wedding-special',
    'eco-friendly-cotton',
    'premium-handmade',
  ];

  // ✅ Fetch categories first
  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Set form data after categories are loaded
  useEffect(() => {
    if (product && categories.length > 0) {
      console.log('🔍 Product received:', product);
      console.log('🔍 Product category:', product.category);
      console.log('🔍 Product category type:', typeof product.category);
      console.log('📁 Available categories:', categories.map(c => ({ id: c._id, name: c.name })));
      
      // ✅ Handle category as either object or string
      let categoryId = '';
      if (product.category) {
        if (typeof product.category === 'object' && product.category._id) {
          categoryId = product.category._id;
        } else if (typeof product.category === 'string') {
          categoryId = product.category;
        }
      }

      console.log('🔍 Extracted category ID:', categoryId);
      console.log('✅ Matching category exists?', categories.some(c => c._id === categoryId));

      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        category: categoryId,
        productType: product.productType || '',
        fabricType: product.fabricType || '',
        color: product.color || '',
        size: product.size || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        careInstructions: product.careInstructions || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured || false,
        collections: product.collections || [],
      });
      setExistingImages(product.images || []);
    }
  }, [product, categories]);

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getAllCategories();
      if (response.data.success) {
        console.log('📁 Categories fetched:', response.data.categories);
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleCollectionToggle = (collection) => {
    setFormData((prev) => ({
      ...prev,
      collections: prev.collections.includes(collection)
        ? prev.collections.filter((c) => c !== collection)
        : [...prev.collections, collection],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
  };

  const handleRemoveNewImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (key === 'collections') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append existing images
      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      // Append new images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await adminAPI.updateProduct(product._id, formDataToSend);

      if (response.data.success) {
        alert('Product updated successfully!');
        clearCache();
        console.log('🔍 Updated product from API:', response.data.product);
        onProductUpdated(response.data.product); // ✅ Pass the updated product
        }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Product
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Images (Max 5)
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Existing Images:
                </p>
                <div className="flex flex-wrap gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <img
                        src={getImageUrl(image)}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {images.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  New Images:
                </p>
                <div className="flex flex-wrap gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {existingImages.length + images.length < 5 && (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-saffron-500 transition-colors">
                <FiUpload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Add More Images ({existingImages.length + images.length}/5)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="input-field"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                className="input-field"
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
                onChange={handleInputChange}
                required
                min="0"
                className="input-field"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              className="input-field"
            />
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Type
              </label>
              <input
                type="text"
                name="productType"
                value={formData.productType}
                onChange={handleInputChange}
                placeholder="e.g., Blanket, Quilt"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fabric Type
              </label>
              <input
                type="text"
                name="fabricType"
                value={formData.fabricType}
                onChange={handleInputChange}
                placeholder="e.g., Cotton, Wool"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="e.g., Red, Blue"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Size
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                placeholder="e.g., Single, Double"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight
              </label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="e.g., 2kg"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dimensions
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleInputChange}
                placeholder="e.g., 90x100 inches"
                className="input-field"
              />
            </div>
          </div>

          {/* Care Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Care Instructions
            </label>
            <textarea
              name="careInstructions"
              value={formData.careInstructions}
              onChange={handleInputChange}
              rows="3"
              placeholder="How to care for this product..."
              className="input-field"
            />
          </div>

          {/* Collections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Collections
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableCollections.map((collection) => (
                <label
                  key={collection}
                  className="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={formData.collections.includes(collection)}
                    onChange={() => handleCollectionToggle(collection)}
                    className="w-4 h-4 text-saffron-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {collection.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-saffron-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Active (visible to customers)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="w-4 h-4 text-saffron-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Featured Product
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-saffron-600 text-white rounded-lg hover:bg-saffron-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;