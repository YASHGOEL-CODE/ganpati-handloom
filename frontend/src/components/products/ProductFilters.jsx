import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    productType: searchParams.get('productType') || '',
    fabricType: searchParams.get('fabricType') || '',
    size: searchParams.get('size') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    isHandmade: searchParams.get('isHandmade') || '',
    isPremium: searchParams.get('isPremium') || '',
    sort: searchParams.get('sort') || '',
  });

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    // Update URL params
    const newParams = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) {
        newParams.set(key, newFilters[key]);
      }
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      productType: '',
      fabricType: '',
      size: '',
      minPrice: '',
      maxPrice: '',
      isHandmade: '',
      isPremium: '',
      sort: '',
    });
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-saffron-600 dark:text-saffron-400 hover:underline"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron-500"
          >
            <option value="">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {/* Product Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Type
          </label>
          <select
            value={filters.productType}
            onChange={(e) => handleFilterChange('productType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron-500"
          >
            <option value="">All Types</option>
            <option value="bedsheet">Bedsheets</option>
            <option value="pillow">Pillows</option>
            <option value="sofa-cover">Sofa Covers</option>
            <option value="blanket">Blankets</option>
            <option value="quilt">Quilts</option>
            <option value="curtain">Curtains</option>
            <option value="door-mat">Door Mats</option>
          </select>
        </div>

        {/* Fabric Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fabric Type
          </label>
          <select
            value={filters.fabricType}
            onChange={(e) => handleFilterChange('fabricType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron-500"
          >
            <option value="">All Fabrics</option>
            <option value="cotton">Cotton</option>
            <option value="silk">Silk</option>
            <option value="wool">Wool</option>
            <option value="blended">Blended</option>
            <option value="linen">Linen</option>
          </select>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Size
          </label>
          <select
            value={filters.size}
            onChange={(e) => handleFilterChange('size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron-500"
          >
            <option value="">All Sizes</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="queen">Queen</option>
            <option value="king">King</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron-500"
            />
          </div>
        </div>

        {/* Handmade Filter */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isHandmade === 'true'}
              onChange={(e) =>
                handleFilterChange('isHandmade', e.target.checked ? 'true' : '')
              }
              className="w-4 h-4 text-saffron-600 focus:ring-saffron-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Handmade Only
            </span>
          </label>
        </div>

        {/* Premium Filter */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isPremium === 'true'}
              onChange={(e) =>
                handleFilterChange('isPremium', e.target.checked ? 'true' : '')
              }
              className="w-4 h-4 text-saffron-600 focus:ring-saffron-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Premium Only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;