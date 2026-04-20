import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}
  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
  aria-label="Toggle theme"
>
  {theme === 'light' ? (
    <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
  ) : (
    <FiSun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
  )}
</button>
  );
};

export default ThemeToggle;