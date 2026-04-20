import React, { useState, useEffect } from 'react';
import { recommendationsAPI } from '../../services/api';
import ProductCard from '../products/ProductCard';
import Loader from '../common/Loader';
import { FiHeart } from 'react-icons/fi';

const WishlistBasedRecommendations = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await recommendationsAPI.getWishlistBased();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching wishlist-based recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FiHeart className="w-8 h-8 text-red-600 dark:text-red-400" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Because You Wishlisted
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Similar to items in your wishlist
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WishlistBasedRecommendations;