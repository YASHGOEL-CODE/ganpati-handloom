import React, { useState } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';

const ImageUpload = ({ onClose, onUpload }) => {
  const [imageUrls, setImageUrls] = useState(['', '', '', '']);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validUrls = imageUrls.filter((url) => url.trim() !== '');
    if (validUrls.length > 0) {
      onUpload(validUrls);
    } else {
      alert('Please enter at least one image URL');
    }
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upload Product Images
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Enter image URLs for your products. You can add up to 4 images.
            Use services like Imgur, Cloudinary, or direct URLs from your hosting.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {imageUrls.map((url, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL {index + 1} {index === 0 && '*'}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                required={index === 0}
                className="input-field"
              />
            </div>
          ))}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-saffron-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-saffron-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiUpload className="w-5 h-5" />
              Upload Images
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageUpload;