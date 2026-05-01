import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Coupon state — single source of truth for Cart + Checkout ──
  const [appliedCoupon, setAppliedCouponState] = useState(null);

  // ── User-specific localStorage keys ──
  const cartKey   = user?._id ? `cart_${user._id}`               : 'cart_guest';
  const couponKey = user?._id ? `gh_applied_coupon_${user._id}`  : 'gh_applied_coupon_guest';

  // ── Load cart + coupon whenever user changes (login/logout/switch) ──
  useEffect(() => {
    setLoading(true);

    // Load cart
    try {
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]); // fresh cart for this user
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCartItems([]);
    }

    // Load coupon
    try {
      const savedCoupon = localStorage.getItem(couponKey);
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        const now        = new Date();
        const isExpired  = parsed.expiryDate && now > new Date(parsed.expiryDate);
        const isInactive = parsed.isActive === false;
        if (!isExpired && !isInactive) {
          setAppliedCouponState(parsed);
        } else {
          localStorage.removeItem(couponKey);
          setAppliedCouponState(null);
        }
      } else {
        setAppliedCouponState(null); // clear coupon for new user
      }
    } catch (_) {
      localStorage.removeItem(couponKey);
      setAppliedCouponState(null);
    }

    setLoading(false);
  }, [user?._id]); // ← re-runs on every user change

  // ── Save cart to localStorage whenever cartItems changes ──
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, loading, cartKey]);

  // ── Coupon helpers — unchanged ──
  const setCoupon = (coupon) => {
    setAppliedCouponState(coupon);
    if (coupon) {
      localStorage.setItem(couponKey, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(couponKey);
    }
  };

  const clearCoupon = () => {
    setAppliedCouponState(null);
    localStorage.removeItem(couponKey);
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