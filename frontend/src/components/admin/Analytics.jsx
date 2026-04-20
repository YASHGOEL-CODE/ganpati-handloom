import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import Loader from '../common/Loader';
import { FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiTrendingUp } from 'react-icons/fi';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard Analytics
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatPrice(analytics.summary.totalRevenue)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <FiShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
            Total Orders
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.summary.totalOrders}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.summary.totalUsers}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-saffron-100 dark:bg-saffron-900 rounded-full flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-saffron-600 dark:text-saffron-400" />
            </div>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
            Total Products
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.summary.totalProducts}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Most Viewed Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Most Viewed Products
          </h2>
          <div className="space-y-4">
            {analytics.mostViewed.slice(0, 5).map((product, index) => (
              <div key={product._id} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-400">
                  {index + 1}
                </div>
                <img
                  src={product.images[0] || 'https://via.placeholder.com/60x60'}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.viewCount} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Best Selling Products
          </h2>
          <div className="space-y-4">
            {analytics.bestSelling.slice(0, 5).map((product, index) => (
              <div key={product._id} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center font-bold text-green-600 dark:text-green-400">
                  {index + 1}
                </div>
                <img
                  src={product.images[0] || 'https://via.placeholder.com/60x60'}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.purchaseCount} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Orders by Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analytics.ordersByStatus.map((status) => (
            <div key={status._id} className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {status.count}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {status._id}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Total
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {order.user?.fullName}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 capitalize">
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;