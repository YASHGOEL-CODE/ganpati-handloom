import React from 'react';

const OrderStatusPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No status data available
      </div>
    );
  }

  const colors = {
    processing: { bg: '#FCD34D', text: '#78350F' },
    packed: '#3B82F6',
    shipped: '#8B5CF6',
    delivered: '#10B981',
    cancelled: '#EF4444',
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);
  let currentAngle = 0;

  const slices = data.map((item) => {
    const percentage = (item.count / total) * 100;
    const angle = (percentage / 100) * 360;
    
    const startX = 50 + 45 * Math.cos((currentAngle * Math.PI) / 180);
    const startY = 50 + 45 * Math.sin((currentAngle * Math.PI) / 180);
    
    currentAngle += angle;
    
    const endX = 50 + 45 * Math.cos((currentAngle * Math.PI) / 180);
    const endY = 50 + 45 * Math.sin((currentAngle * Math.PI) / 180);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return {
      ...item,
      path: `M 50 50 L ${startX} ${startY} A 45 45 0 ${largeArc} 1 ${endX} ${endY} Z`,
      color: colors[item.status] || '#94A3B8',
      percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div className="flex justify-center">
        <svg viewBox="0 0 100 100" className="w-64 h-64">
          {slices.map((slice, index) => (
            <g key={index}>
              <path
                d={slice.path}
                fill={slice.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{`${slice.status}: ${slice.count} orders (${slice.percentage.toFixed(1)}%)`}</title>
              </path>
            </g>
          ))}
          {/* Center circle */}
          <circle cx="50" cy="50" r="20" fill="white" className="dark:fill-gray-800" />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-bold fill-gray-900 dark:fill-white"
          >
            {total}
          </text>
          <text
            x="50"
            y="58"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[5px] fill-gray-600 dark:fill-gray-400"
          >
            Total Orders
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colors[item.status] || '#94A3B8' }}
            ></div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                {item.status}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {item.count} orders ({item.percentage}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusPieChart;