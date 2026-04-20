import React, { useState, useEffect } from 'react';
import { recommendationsAPI } from '../../services/api';
import ProductCard from '../products/ProductCard';
import Loader from '../common/Loader';
import { useAuth } from '../../hooks/useAuth';

const RecommendedProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      let response;

      if (user) {
        // Logged-in user: Get personalized recommendations
        response = await recommendationsAPI.getPersonalized(12);
      } else {
        // Guest user: Get guest recommendations
        const sessionId = localStorage.getItem('sessionId') || `guest-${Date.now()}`;
        localStorage.setItem('sessionId', sessionId);
        response = await recommendationsAPI.getGuest(12, sessionId);
      }

      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {user ? 'Recommended For You' : 'You Might Like'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {user 
              ? 'Personalized selections based on your preferences and browsing history'
              : 'Popular products loved by our customers'
            }
          </p>
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

export default RecommendedProducts;