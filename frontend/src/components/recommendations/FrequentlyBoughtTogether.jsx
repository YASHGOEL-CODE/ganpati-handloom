import React, { useState, useEffect } from 'react';
import { recommendationsAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { getImageUrl } from '../../utils/imageHelper'; // ✅ ADDED
import { FiPlus, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';

const FrequentlyBoughtTogether = ({ productId, currentProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([productId]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFrequentlyBought();
  }, [productId]);

  const fetchFrequentlyBought = async () => {
    try {
      const response = await recommendationsAPI.getFrequentlyBought(productId, 3);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching frequently bought together:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (pid) => {
    setSelectedProducts((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const calculateTotal = () => {
    let total = 0;
    if (selectedProducts.includes(productId)) {
      total += currentProduct.price;
    }
    products.forEach((product) => {
      if (selectedProducts.includes(product._id)) {
        total += product.price;
      }
    });
    return total;
  };

  const handleAddAllToCart = () => {
    if (selectedProducts.includes(productId)) {
      addToCart(currentProduct);
    }
    products.forEach((product) => {
      if (selectedProducts.includes(product._id)) {
        addToCart(product);
      }
    });
    alert(`${selectedProducts.length} items added to cart!`);
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Frequently Bought Together
      </h3>

      <div className="space-y-4">
        {/* Current Product */}
        <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <input
            type="checkbox"
            checked={selectedProducts.includes(productId)}
            onChange={() => toggleProduct(productId)}
            className="w-5 h-5 text-saffron-600 focus:ring-saffron-500"
          />
          {/* ✅ FIXED: use getImageUrl() instead of raw images[0] */}
          <img
            src={getImageUrl(currentProduct.images?.[0])}
            alt={currentProduct.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {currentProduct.name}
            </h4>
            <p className="text-saffron-600 dark:text-saffron-400 font-bold">
              {formatPrice(currentProduct.price)}
            </p>
          </div>
        </div>

        {/* Plus Icon */}
        <div className="flex justify-center">
          <FiPlus className="w-6 h-6 text-gray-400" />
        </div>

        {/* Recommended Products */}
        {products.map((product) => (
          <div
            key={product._id}
            className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <input
              type="checkbox"
              checked={selectedProducts.includes(product._id)}
              onChange={() => toggleProduct(product._id)}
              className="w-5 h-5 text-saffron-600 focus:ring-saffron-500"
            />
            {/* ✅ FIXED: use getImageUrl() instead of raw images[0] */}
            <img
              src={getImageUrl(product.images?.[0])}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                {product.name}
              </h4>
              <p className="text-saffron-600 dark:text-saffron-400 font-bold">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total and Add to Cart */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Total for {selectedProducts.length} items:
          </span>
          <span className="text-2xl font-bold text-saffron-600 dark:text-saffron-400">
            {formatPrice(calculateTotal())}
          </span>
        </div>
        <button
          onClick={handleAddAllToCart}
          disabled={selectedProducts.length === 0}
          className="w-full bg-saffron-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-saffron-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FiShoppingCart className="w-5 h-5" />
          Add Selected to Cart
        </button>
      </div>
    </div>
  );
};

export default FrequentlyBoughtTogether;