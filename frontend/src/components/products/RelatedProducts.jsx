import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../services/api';
import ProductCard from './ProductCard';
import Loader from '../common/Loader';

const RelatedProducts = ({ categoryId, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [categoryId, currentProductId]);

  const fetchRelatedProducts = async () => {
    try {
      if (!categoryId) {
        setLoading(false);
        return;
      }

      const response = await productsAPI.getAll({
        category: categoryId,
        limit: 8,
      });

      // Filter out the current product
      const filtered = response.data.products.filter(
        (product) => product._id !== currentProductId
      );

      setProducts(filtered.slice(0, 4)); // Show max 4 products
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-16">
        <Loader />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Related Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;