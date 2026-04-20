import React from 'react';

const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const maxOrders = Math.max(...data.map((d) => d.orders));

  return (
    <div className="space-y-4">
      {/* Revenue Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Daily Revenue (Last 7 Days)
        </h4>
        <div className="flex items-end justify-between gap-2 h-32">
          {data.map((day, index) => {
            const heightPercent = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-semibold text-gray-700 dark:text-white">
                  ₹{(day.revenue / 1000).toFixed(0)}k
                </div>
                <div
                  className="w-full bg-gradient-to-t from-saffron-600 to-saffron-400 rounded-t-lg transition-all hover:from-saffron-700 hover:to-saffron-500 cursor-pointer"
                  style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                  title={`₹${day.revenue.toLocaleString()} - ${day.orders} orders`}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {day.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Daily Orders (Last 7 Days)
        </h4>
        <div className="flex items-end justify-between gap-2 h-24">
          {data.map((day, index) => {
            const heightPercent = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-semibold text-gray-700 dark:text-white">
                  {day.orders}
                </div>
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                  style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                  title={`${day.orders} orders`}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {day.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;