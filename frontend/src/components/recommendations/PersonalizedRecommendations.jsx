import React, { useState, useEffect } from 'react';
import { recommendationsAPI } from '../../services/api';
import ProductCard from '../products/ProductCard';
import Loader from '../common/Loader';
import { FiStar } from 'react-icons/fi';

const PersonalizedRecommendations = ({ limit = 8 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await recommendationsAPI.getPersonalized(limit);
        
        if (isMounted) {
          setProducts(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching personalized recommendations:', error);
        if (isMounted) {
          setError(error.message);
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, [limit]); // ✅ Added dependency

  if (loading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Loader />
        </div>
      </section>
    );
  }

  if (error) {
    console.log('Personalized recommendations error (non-critical):', error);
    return null; // Silently fail - not critical
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FiStar className="w-8 h-8 text-saffron-600 dark:text-saffron-400" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Picked Just For You
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Based on your unique preferences and browsing behavior
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

export default PersonalizedRecommendations;