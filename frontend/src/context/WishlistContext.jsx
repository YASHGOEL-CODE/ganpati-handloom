import React, { createContext, useState, useContext } from 'react';
import { wishlistAPI } from '../services/api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // ✅ DISABLED AUTO-FETCHING - Only fetch when explicitly called
  // This prevents infinite loops
  
  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      const response = await wishlistAPI.get();
      setWishlistItems(response.data.products || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const response = await wishlistAPI.add(productId);
      setWishlistItems(response.data.products || []);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to wishlist',
      };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await wishlistAPI.remove(productId);
      setWishlistItems(response.data.products || []);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from wishlist',
      };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.product?._id === productId);
  };

  const value = {
    wishlistItems,
    wishlist: { products: wishlistItems },
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};