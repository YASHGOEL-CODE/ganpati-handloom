import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiEdit2 } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageHelper';

const LowStockAlert = ({ products }) => {
  const navigate = useNavigate();

  const handleRestock = (productId) => {
    // Navigate to Products page with edit modal/functionality
    navigate(`/admin/products?edit=${productId}`);
  };

  if (!products || products.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-green-800 dark:text-green-200 font-medium">
            All products are well stocked!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
          <FiAlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
          Low Stock Alert ({products.length})
        </h3>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product._id}
            className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex items-center gap-4">
              <img
                src={getImageUrl(product.images?.[0]) || 'https://via.placeholder.com/60'}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stock: <span className="font-bold text-red-600">{product.stock}</span> remaining
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRestock(product._id)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <FiEdit2 className="w-4 h-4" />
              Restock
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlert;