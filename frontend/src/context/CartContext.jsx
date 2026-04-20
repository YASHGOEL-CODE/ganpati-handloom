import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── NEW: Coupon state — single source of truth for Cart + Checkout ──
  const [appliedCoupon, setAppliedCouponState] = useState(null);
  // appliedCoupon shape: { code, discount, discountType, discountValue,
  //                        minOrderValue, isActive, expiryDate }

  useEffect(() => {
    // Load cart from localStorage on mount
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCartItems(JSON.parse(savedCart));
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }

    // Load coupon from localStorage on mount
    try {
      const savedCoupon = localStorage.getItem('gh_applied_coupon');
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        // Basic client-side expiry/active guard
        const now = new Date();
        const isExpired  = parsed.expiryDate && now > new Date(parsed.expiryDate);
        const isInactive = parsed.isActive === false;
        if (!isExpired && !isInactive) {
          setAppliedCouponState(parsed);
        } else {
          localStorage.removeItem('gh_applied_coupon');
        }
      }
    } catch (_) {
      localStorage.removeItem('gh_applied_coupon');
    }
  }, []); // runs once on mount

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if (!loading) {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, loading]);

  // ── Coupon helpers — used by both Cart and Checkout ──
  const setCoupon = (coupon) => {
    setAppliedCouponState(coupon);
    if (coupon) {
      localStorage.setItem('gh_applied_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('gh_applied_coupon');
    }
  };

  const clearCoupon = () => {
    setAppliedCouponState(null);
    localStorage.removeItem('gh_applied_coupon');
  };

  // ── All original cart methods — completely unchanged ──
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item._id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    // Also clear coupon when cart is cleared (after order placed)
    clearCoupon();
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    cart: { items: cartItems }, // for Navbar compatibility
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    // ── Coupon — shared between Cart and Checkout ──
    appliedCoupon,
    setCoupon,
    clearCoupon,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};