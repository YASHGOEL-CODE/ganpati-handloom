import React, { useState, useEffect } from 'react';
import { recommendationsAPI } from '../../services/api';
import ProductCard from './ProductCard';
import Loader from '../common/Loader';

const SimilarProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarProducts();
  }, [productId]);

  const fetchSimilarProducts = async () => {
    try {
      const response = await recommendationsAPI.getSimilar(productId);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching similar products:', error);
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
    <section className="mb-16">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Similar Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;