import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './useAuth';

/*
  useCoupons — fetches valid coupons from backend.
  Returns only: isActive=true + expiryDate > now
  Max 3 for homepage display.
  Never touches cart/apply/order logic.
*/
const useCoupons = (limit = 3) => {
  const { user } = useAuth();
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use welcome endpoint for guests; available endpoint for logged-in users
      let raw = [];
      if (user) {
        const res = await api.get('/coupons/available?cartTotal=0');
        if (res.data.success) raw = res.data.coupons || [];
      } else {
        // For guests, fetch welcome coupon only
        const res = await api.get('/coupons/welcome');
        if (res.data.success && res.data.coupon) raw = [res.data.coupon];
      }

      const now = new Date();

      // Client-side guard — only active + non-expired
      const valid = raw.filter(c =>
        c.isActive !== false &&
        (!c.expiryDate || now < new Date(c.expiryDate))
      );

      // Sort: highest discount first, then nearest expiry
      valid.sort((a, b) => {
        const dA = a.discountValue || a.discount || 0;
        const dB = b.discountValue || b.discount || 0;
        if (dB !== dA) return dB - dA;
        if (a.expiryDate && b.expiryDate)
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        return 0;
      });

      setCoupons(valid.slice(0, limit));
    } catch (err) {
      setError(err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  // Best coupon = first after sort
  const bestCoupon = coupons[0] || null;

  // Near-expiry = expires within 3 days
  const isNearExpiry = (coupon) => {
    if (!coupon?.expiryDate) return false;
    const diffMs  = new Date(coupon.expiryDate) - new Date();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 3;
  };

  const discountLabel = (c) => {
    if (!c) return '';
    const val = c.discountValue || c.discount || 0;
    return c.discountType === 'percentage' ? `${val}% OFF` : `₹${val} OFF`;
  };

  return {
    coupons,
    bestCoupon,
    loading,
    error,
    isNearExpiry,
    discountLabel,
    refetch: fetchCoupons,
  };
};

export default useCoupons;