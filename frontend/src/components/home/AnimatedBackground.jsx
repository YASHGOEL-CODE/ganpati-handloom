import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 handloom-pattern opacity-30"></div>
      
      {/* Floating handloom textures */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-saffron-200 dark:bg-saffron-900 rounded-full opacity-20 animate-float"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-deepgreen-200 dark:bg-deepgreen-900 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-golden-200 dark:bg-golden-900 rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-saffron-300 dark:bg-saffron-800 rounded-full opacity-20 animate-float" style={{ animationDelay: '3s' }}></div>
    </div>
  );
};

export default AnimatedBackground;