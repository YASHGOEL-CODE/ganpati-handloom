import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { CartContext } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import CartItem from './CartItem';
import CartCouponSuggestion from './CartCouponSuggestion';
import { formatPrice } from '../../utils/helpers';
import api from '../../services/api';
import {
  FiShoppingBag, FiArrowLeft, FiArrowRight,
  FiTruck, FiShield, FiCreditCard, FiPackage,
  FiTag, FiCheck, FiX, FiChevronDown, FiChevronUp,
  FiGift,
} from 'react-icons/fi';

const Cart = () => {
  // ── All original logic completely unchanged ──
  const { cartItems, getCartTotal, getCartCount } = useCart();
  const { appliedCoupon, setCoupon, clearCoupon } = React.useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const shipping = subtotal >= 500 ? 0 : 50;

  // ── Coupon state ──
  const [couponCode, setCouponCode]           = useState('');
  // appliedCoupon now comes from CartContext (shared with Checkout)
  const [couponMsg, setCouponMsg]             = useState('');
  const [couponError, setCouponError]         = useState('');
  const [couponLoading, setCouponLoading]     = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons]         = useState(false);
  const [couponsLoading, setCouponsLoading]   = useState(false);

  const discount   = appliedCoupon?.discount || 0;
  const total      = subtotal + shipping - discount;
  const savings    = (subtotal >= 500 ? 50 : 0) + discount;

  // ── Fetch available coupons when cart has items and user is logged in ──
  useEffect(() => {
    if (!user || subtotal === 0) return;
    const fetchCoupons = async () => {
      try {
        setCouponsLoading(true);
        const res = await api.get(`/coupons/available?cartTotal=${subtotal}`);
        if (res.data.success) {
          const freshCoupons = res.data.coupons;
          setAvailableCoupons(freshCoupons);

          // Re-validate applied coupon against fresh server data
          if (appliedCoupon) {
            const now   = new Date();
            const fresh = freshCoupons.find(fc => fc.code === appliedCoupon.code);

            if (!fresh) {
              clearCoupon();
              setCouponMsg('');
              setCouponError(`Coupon ${appliedCoupon.code} is no longer available`);
              setTimeout(() => setCouponError(''), 5000);
            } else if (fresh.isActive === false) {
              clearCoupon();
              setCouponMsg('');
              setCouponError(`Coupon ${appliedCoupon.code} has been deactivated`);
              setTimeout(() => setCouponError(''), 5000);
            } else if (fresh.expiryDate && now > new Date(fresh.expiryDate)) {
              clearCoupon();
              setCouponMsg('');
              setCouponError(`Coupon ${appliedCoupon.code} has expired`);
              setTimeout(() => setCouponError(''), 5000);
            } else {
              // Still valid — refresh metadata in context
              setCoupon({
                ...appliedCoupon,
                isActive:      fresh.isActive,
                expiryDate:    fresh.expiryDate    || null,
                minOrderValue: fresh.minOrderValue || appliedCoupon.minOrderValue,
                discount:      fresh.discount      || appliedCoupon.discount,
              });
            }
          }
        }
      } catch (_) {
        // silently fail — coupons are optional enhancement
      } finally {
        setCouponsLoading(false);
      }
    };
    fetchCoupons();
  }, [user, subtotal]);

  // ── Auto-remove coupon if it becomes invalid (isActive/expired/minOrderValue) ──
  useEffect(() => {
    if (!appliedCoupon) return;
    const now = new Date();
    const min = appliedCoupon.minOrderValue || 0;

    // Check 1: admin deactivated the coupon
    if (appliedCoupon.isActive === false) {
      clearCoupon();
      setCouponMsg('');
      setCouponError(`Coupon ${appliedCoupon.code} is no longer active and has been removed`);
      setTimeout(() => setCouponError(''), 5000);
      return;
    }
    // Check 2: coupon has expired
    if (appliedCoupon.expiryDate && now > new Date(appliedCoupon.expiryDate)) {
      clearCoupon();
      setCouponMsg('');
      setCouponError(`Coupon ${appliedCoupon.code} has expired and has been removed`);
      setTimeout(() => setCouponError(''), 5000);
      return;
    }
    // Check 3: subtotal dropped below minimum order value
    if (min > 0 && subtotal < min) {
      clearCoupon();
      setCouponMsg('');
      const shortfall = min - subtotal;
      setCouponError(
        `Coupon removed — add ₹${shortfall.toLocaleString()} more to re-apply ${appliedCoupon.code}`
      );
      setTimeout(() => setCouponError(''), 5000);
    }
  }, [subtotal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Apply coupon ──
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) { setCouponError('Please enter a coupon code'); return; }
    if (!user) { navigate('/signin'); return; }

    // ── Frontend pre-validation against known coupons ──
    const known = availableCoupons.find(ac => ac.code === code);
    if (known) {
      const now = new Date();
      if (known.isActive === false) {
        setCouponError('This coupon is no longer active'); return;
      }
      if (known.expiryDate && now > new Date(known.expiryDate)) {
        setCouponError('This coupon has expired'); return;
      }
    }

    setCouponLoading(true);
    setCouponMsg('');
    setCouponError('');
    try {
      const res = await api.post('/coupons/apply', { code, cartTotal: subtotal });
      if (res.data.success) {
        // Store minOrderValue from available coupons list for later re-validation
        const matchedCoupon = availableCoupons.find(ac => ac.code === res.data.code);
        const couponToStore = {
          code:          res.data.code,
          discount:      res.data.discount,
          discountType:  res.data.discountType,
          discountValue: res.data.discountValue,
          minOrderValue: matchedCoupon?.minOrderValue || 0,
          isActive:      res.data.isActive !== false,
          expiryDate:    res.data.expiryDate || null,
        };
        // Save to CartContext (shared with Checkout) + localStorage
        setCoupon(couponToStore);
        setCouponMsg(res.data.message);
        setCouponCode('');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Remove coupon ──
  const handleRemoveCoupon = () => {
    clearCoupon();
    setCouponMsg('');
    setCouponError('');
    setCouponCode('');
  };

  // ── Checkout handler — unchanged ──
  const handleCheckout = () => {
    if (!user) { navigate('/signin'); } else { navigate('/checkout'); }
  };

  /* ── EMPTY STATE — unchanged ── */
  if (cartItems.length === 0) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
          .cart-page { min-height:100vh; background:radial-gradient(circle at 15% 10%,rgba(249,115,22,0.07) 0%,transparent 55%),radial-gradient(circle at 85% 90%,rgba(139,92,246,0.05) 0%,transparent 55%),linear-gradient(160deg,#0f172a 0%,#000 50%,#020617 100%); font-family:'DM Sans',sans-serif; }
          .cart-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:120px 20px; text-align:center; }
          .cart-empty-icon { width:110px; height:110px; border-radius:50%; background:rgba(234,88,12,0.08); border:1px solid rgba(234,88,12,0.18); display:flex; align-items:center; justify-content:center; margin-bottom:28px; animation:emptyPulse 2.5s ease-in-out infinite; }
          @keyframes emptyPulse { 0%,100%{box-shadow:0 0 0 0 rgba(234,88,12,0.15)} 50%{box-shadow:0 0 0 16px rgba(234,88,12,0)} }
          .cart-empty-title { font-family:'Playfair Display',serif; font-size:clamp(24px,3vw,36px); font-weight:800; color:#fff; margin-bottom:12px; }
          .cart-empty-sub { font-size:15px; color:rgba(255,255,255,0.40); max-width:320px; margin:0 auto 32px; line-height:1.65; }
          .cart-empty-btn { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#ea580c,#f97316); color:#fff; text-decoration:none; padding:14px 32px; border-radius:13px; font-size:14.5px; font-weight:700; transition:transform .22s,box-shadow .22s; box-shadow:0 6px 20px rgba(234,88,12,0.30); }
          .cart-empty-btn:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 12px 32px rgba(234,88,12,0.46); }
          .cart-empty-btn .arrow { transition:transform .22s; }
          .cart-empty-btn:hover .arrow { transform:translateX(4px); }
        `}</style>
        <div className="cart-page">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <FiShoppingBag size={46} color="#fb923c" strokeWidth={1.5} />
            </div>
            <h2 className="cart-empty-title">Your cart is empty</h2>
            <p className="cart-empty-sub">Looks like you haven't added anything to your cart yet</p>
            <Link to="/products" className="cart-empty-btn">
              Explore Products <FiArrowRight size={16} className="arrow" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  const count = getCartCount();
  // Filter to only truly valid coupons — backend already does this but
  // this guards against any stale cached data on the client
  const now = new Date();
  const validCoupons = availableCoupons.filter(c =>
    c.isActive !== false &&
    (!c.expiryDate || now < new Date(c.expiryDate))
  );
  const bestCoupon = validCoupons.find(c => c.eligible && !appliedCoupon);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .cart-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 10%, rgba(249,115,22,0.07) 0%, transparent 55%),
            radial-gradient(circle at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 55%),
            linear-gradient(160deg, #0f172a 0%, #000000 50%, #020617 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 0 0 100px;
        }
        .cart-wrap { max-width: 1320px; margin: 0 auto; padding: 0 28px; }
        @media (max-width: 640px) { .cart-wrap { padding: 0 16px; } }

        /* ── HEADER ── */
        .cart-header {
          padding: 40px 0 28px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 36px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .cart-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700;
          color: #ea580c; letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 8px;
        }
        .cart-eyebrow::before { content:''; display:inline-block; width:16px; height:1.5px; background:#ea580c; }
        .cart-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px,3.5vw,42px); font-weight:800; color:#fff;
          line-height:1.1; letter-spacing:-0.02em;
        }
        .cart-count-badge {
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(234,88,12,0.15); border: 1px solid rgba(234,88,12,0.28);
          color: #fb923c; font-size:12px; font-weight:700;
          padding: 2px 10px; border-radius: 999px; margin-left: 12px; vertical-align: middle;
        }
        .cart-continue-btn {
          display: inline-flex; align-items: center; gap: 7px;
          color: rgba(255,255,255,0.48); text-decoration: none;
          font-size: 13.5px; font-weight: 600;
          padding: 9px 16px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.04);
          transition: color .2s, border-color .2s, background .2s;
        }
        .cart-continue-btn:hover { color:#fff; border-color:rgba(255,255,255,0.18); background:rgba(255,255,255,0.07); }
        .cart-continue-btn .back-arrow { transition: transform .2s; }
        .cart-continue-btn:hover .back-arrow { transform: translateX(-3px); }

        /* ── LAYOUT ── */
        .cart-grid {
          display: grid; grid-template-columns: 1fr 380px;
          gap: 28px; align-items: start;
        }
        @media (max-width: 1024px) { .cart-grid { grid-template-columns: 1fr; } }
        .cart-items { display: flex; flex-direction: column; gap: 14px; }

        /* ── SHIPPING PROGRESS ── */
        .cart-ship-progress {
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.18);
          border-radius: 14px; padding: 14px 18px; margin-bottom: 4px;
        }
        .cart-ship-txt { font-size:13px; font-weight:600; color:rgba(147,197,253,0.90); margin-bottom:8px; }
        .cart-ship-txt span { color:#60a5fa; font-weight:800; }
        .cart-ship-bar-bg { height:5px; border-radius:999px; background:rgba(255,255,255,0.08); overflow:hidden; }
        .cart-ship-bar-fill { height:100%; border-radius:999px; background:linear-gradient(90deg,#3b82f6,#60a5fa); transition:width .5s ease; }
        .cart-ship-free { font-size:13px; font-weight:600; color:#4ade80; display:flex; align-items:center; gap:6px; }

        /* ── SMART COUPON SUGGESTION ── */
        .cart-suggestion {
          background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.20);
          border-radius: 12px; padding: 12px 16px; margin-top: 12px;
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          flex-wrap: wrap;
        }
        .cart-suggestion-txt { font-size:13px; font-weight:600; color:rgba(255,255,255,0.75); }
        .cart-suggestion-txt strong { color:#fb923c; }
        .cart-suggestion-apply {
          background: linear-gradient(135deg,#ea580c,#f97316); color:#fff; border:none;
          border-radius:8px; padding:7px 14px; font-size:12.5px; font-weight:700;
          font-family:'DM Sans',sans-serif; cursor:pointer; white-space:nowrap;
          transition:transform .2s,box-shadow .2s;
        }
        .cart-suggestion-apply:hover { transform:scale(1.04); box-shadow:0 4px 12px rgba(234,88,12,0.35); }

        /* ── ORDER SUMMARY ── */
        .cart-summary {
          position: sticky; top: 88px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 28px 26px;
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 56px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative;
        }
        .cart-summary::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,#ea580c,#f97316,transparent);
          border-radius:20px 20px 0 0;
        }
        .cart-summary-title {
          font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:#f1f5f9;
          margin-bottom:22px; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.07);
        }

        /* ── COUPON INPUT ── */
        .cart-coupon-wrap { margin-bottom: 18px; }
        .cart-coupon-row { display:flex; gap:8px; }
        .cart-coupon-input {
          flex:1; background:rgba(0,0,0,0.30); border:1.5px solid rgba(255,255,255,0.09);
          border-radius:10px; padding:10px 14px; color:#fff; font-size:13px;
          font-family:'DM Sans',sans-serif; outline:none; transition:border-color .22s;
        }
        .cart-coupon-input::placeholder { color:rgba(255,255,255,0.25); }
        .cart-coupon-input:focus { border-color:#ea580c; box-shadow:0 0 0 3px rgba(234,88,12,0.12); }
        .cart-coupon-btn {
          background:rgba(234,88,12,0.14); border:1px solid rgba(234,88,12,0.22);
          color:#fb923c; border-radius:10px; padding:10px 14px; font-size:13px; font-weight:700;
          font-family:'DM Sans',sans-serif; cursor:pointer; white-space:nowrap;
          transition:background .2s,border-color .2s; display:flex; align-items:center; gap:5px;
        }
        .cart-coupon-btn:hover { background:rgba(234,88,12,0.22); border-color:rgba(234,88,12,0.38); }
        .cart-coupon-btn:disabled { opacity:0.55; cursor:not-allowed; }

        /* Applied coupon */
        .cart-coupon-applied {
          display:flex; align-items:center; justify-content:space-between;
          background:rgba(74,222,128,0.10); border:1px solid rgba(74,222,128,0.22);
          border-radius:10px; padding:10px 14px; margin-bottom:18px;
        }
        .cart-coupon-applied-left { display:flex; align-items:center; gap:8px; }
        .cart-coupon-applied-code { font-size:13px; font-weight:800; color:#4ade80; }
        .cart-coupon-applied-save { font-size:12px; color:rgba(74,222,128,0.75); }
        .cart-coupon-remove {
          background:none; border:none; color:rgba(248,113,113,0.70); cursor:pointer;
          padding:3px; border-radius:5px; display:flex; align-items:center;
          transition:color .2s;
        }
        .cart-coupon-remove:hover { color:#f87171; }

        /* Coupon message */
        .cart-coupon-msg { font-size:12px; margin-top:7px; padding:6px 10px; border-radius:8px; }
        .cart-coupon-msg.success { background:rgba(74,222,128,0.10); color:#4ade80; }
        .cart-coupon-msg.error   { background:rgba(239,68,68,0.10); color:#f87171; }

        /* Available coupons panel */
        .cart-avail-toggle {
          width:100%; display:flex; align-items:center; justify-content:space-between;
          background:none; border:none; color:rgba(255,255,255,0.50); cursor:pointer;
          font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif;
          padding:10px 0; margin-bottom:4px; transition:color .2s;
        }
        .cart-avail-toggle:hover { color:rgba(255,255,255,0.80); }
        .cart-avail-toggle-left { display:flex; align-items:center; gap:7px; }
        .cart-avail-list { display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
        .cart-avail-item {
          display:flex; align-items:center; justify-content:space-between; gap:10px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
          border-radius:10px; padding:10px 13px;
          transition:border-color .2s;
        }
        .cart-avail-item:hover { border-color:rgba(249,115,22,0.22); }
        .cart-avail-item.ineligible { opacity:0.55; }
        .cart-avail-code { font-size:13px; font-weight:800; color:#fb923c; font-family:monospace; }
        .cart-avail-desc { font-size:11.5px; color:rgba(255,255,255,0.42); margin-top:2px; }
        .cart-avail-shortfall { font-size:11px; color:rgba(251,191,36,0.70); margin-top:2px; }
        .cart-avail-apply {
          background:rgba(234,88,12,0.12); border:1px solid rgba(234,88,12,0.22);
          color:#fb923c; border-radius:8px; padding:5px 11px; font-size:12px; font-weight:700;
          font-family:'DM Sans',sans-serif; cursor:pointer; white-space:nowrap;
          transition:background .2s; flex-shrink:0;
        }
        .cart-avail-apply:hover { background:rgba(234,88,12,0.22); }
        .cart-avail-apply:disabled { opacity:0.4; cursor:not-allowed; }
        .cart-avail-badge { display:inline-flex; align-items:center; gap:3px; font-size:9.5px; font-weight:800; padding:2px 7px; border-radius:999px; text-transform:uppercase; letter-spacing:.06em; margin-right:4px; }
        .cart-avail-badge-exp  { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.25); color:#f87171; }
        .cart-avail-badge-inac { background:rgba(107,114,128,0.16); border:1px solid rgba(107,114,128,0.25); color:#9ca3af; }

        /* Summary rows */
        .cart-sum-row {
          display:flex; justify-content:space-between; align-items:center;
          font-size:14px; color:rgba(255,255,255,0.52); font-weight:500; margin-bottom:12px;
        }
        .cart-sum-row.free    { color:#4ade80; }
        .cart-sum-row.savings { color:#4ade80; }
        .cart-sum-row.discount { color:#4ade80; }
        .cart-sum-divider { height:1px; background:rgba(255,255,255,0.08); margin:16px 0; }
        .cart-sum-total { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:22px; }
        .cart-sum-total-label { font-size:15px; font-weight:700; color:#f1f5f9; }
        .cart-sum-total-val {
          font-size:26px; font-weight:800;
          background:linear-gradient(90deg,#fb923c,#f97316);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }

        /* Checkout button */
        .cart-checkout-btn {
          width:100%; display:flex; align-items:center; justify-content:center; gap:9px;
          background:linear-gradient(135deg,#ea580c,#f97316); color:#fff; border:none;
          border-radius:13px; padding:15px 20px; font-size:15px; font-weight:700;
          font-family:'DM Sans',sans-serif; cursor:pointer; letter-spacing:.02em;
          transition:transform .22s,box-shadow .22s,filter .22s;
          box-shadow:0 6px 22px rgba(234,88,12,0.32); position:relative; overflow:hidden;
          margin-bottom:16px;
        }
        .cart-checkout-btn:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 12px 32px rgba(234,88,12,0.48); filter:brightness(1.07); }
        .cart-checkout-inner { position:relative; z-index:1; display:flex; align-items:center; gap:9px; }
        .cart-checkout-arrow { transition:transform .22s; }
        .cart-checkout-btn:hover .cart-checkout-arrow { transform:translateX(4px); }

        /* Trust badges */
        .cart-trust { display:flex; flex-direction:column; gap:8px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.07); }
        .cart-trust-item { display:flex; align-items:center; gap:9px; font-size:12.5px; font-weight:500; color:rgba(255,255,255,0.40); }

        @media (max-width: 640px) {
          .cart-header { padding:28px 0 20px; }
          .cart-summary { position:static; }
        }
      `}</style>

      <div className="cart-page">
        <div className="cart-wrap">

          {/* ── HEADER — unchanged ── */}
          <div className="cart-header">
            <div>
              <p className="cart-eyebrow">Your Order</p>
              <h1 className="cart-title">
                Shopping Cart
                <span className="cart-count-badge">{count} {count === 1 ? 'item' : 'items'}</span>
              </h1>
            </div>
            <Link to="/products" className="cart-continue-btn">
              <FiArrowLeft size={14} className="back-arrow" /> Continue Shopping
            </Link>
          </div>

          <div className="cart-grid">

            {/* ── LEFT: ITEMS ── */}
            <div>
              {/* Free shipping progress — unchanged */}
              <div className="cart-ship-progress" style={{ marginBottom: 16 }}>
                {subtotal >= 500 ? (
                  <p className="cart-ship-free"><FiTruck size={14} /> You've unlocked FREE shipping!</p>
                ) : (
                  <>
                    <p className="cart-ship-txt">Add <span>{formatPrice(500 - subtotal)}</span> more to unlock FREE shipping</p>
                    <div className="cart-ship-bar-bg">
                      <div className="cart-ship-bar-fill" style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }} />
                    </div>
                  </>
                )}
              </div>

              {/* Smart coupon suggestion — full progressive UI */}
              {!appliedCoupon && (
                <CartCouponSuggestion
                  subtotal={subtotal}
                  availableCoupons={availableCoupons}
                  onApply={handleApplyCoupon}
                />
              )}

              {/* No valid offers message — only when logged in + 0 valid coupons */}
              {user && !appliedCoupon && availableCoupons.length > 0 && validCoupons.length === 0 && (
                <div style={{
                  background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:12,padding:'11px 15px',marginBottom:14,
                  fontSize:13,color:'rgba(255,255,255,0.35)',display:'flex',alignItems:'center',gap:8
                }}>
                  🏷️ No valid offers available right now. Check back later!
                </div>
              )}

              {/* Cart items — unchanged */}
              <div className="cart-items" style={{ marginTop: 14 }}>
                {cartItems.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
            </div>

            {/* ── RIGHT: ORDER SUMMARY ── */}
            <div className="cart-summary">
              <h2 className="cart-summary-title">Order Summary</h2>

              {/* ── COUPON SECTION ── */}
              {appliedCoupon ? (
                /* Applied coupon display */
                <div className="cart-coupon-applied">
                  <div className="cart-coupon-applied-left">
                    <FiCheck size={15} color="#4ade80" />
                    <div>
                      <p className="cart-coupon-applied-code">{appliedCoupon.code}</p>
                      <p className="cart-coupon-applied-save">You saved {formatPrice(appliedCoupon.discount)}</p>
                    </div>
                  </div>
                  <button className="cart-coupon-remove" onClick={handleRemoveCoupon} title="Remove coupon">
                    <FiX size={15} />
                  </button>
                </div>
              ) : (
                /* Coupon input + available coupons */
                <div className="cart-coupon-wrap">
                  <div className="cart-coupon-row">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="cart-coupon-input"
                    />
                    <button
                      className="cart-coupon-btn"
                      onClick={() => handleApplyCoupon()}
                      disabled={couponLoading}
                    >
                      <FiTag size={13} />
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponMsg   && <p className="cart-coupon-msg success"><FiCheck size={11} /> {couponMsg}</p>}
                  {couponError && <p className="cart-coupon-msg error"><FiX size={11} /> {couponError}</p>}

                  {/* Available coupons toggle */}
                  {user && validCoupons.length > 0 && (
                    <>
                      <button
                        className="cart-avail-toggle"
                        onClick={() => setShowCoupons(v => !v)}
                      >
                        <span className="cart-avail-toggle-left">
                          <FiGift size={13} color="#fb923c" />
                          Available Offers ({validCoupons.length})
                        </span>
                        {showCoupons ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                      </button>

                      {showCoupons && (
                        <div className="cart-avail-list">
                          {validCoupons.map((c) => {
                            const now      = new Date();
                            const isExp    = c.expiryDate && now > new Date(c.expiryDate);
                            const isInac   = c.isActive === false;
                            const isDisabl = isExp || isInac;
                            // canApply: active + not expired + eligible (subtotal >= min)
                            const canApply = !isDisabl && c.eligible;
                            return (
                              <div
                                key={c.code}
                                className={`cart-avail-item ${isDisabl ? 'ineligible disabled-coupon' : !c.eligible ? 'ineligible' : ''}`}
                                style={ isDisabl ? { opacity:0.50, pointerEvents:'none' } : {} }
                              >
                                <div style={{ flex:1, minWidth:0 }}>
                                  {/* Status badges */}
                                  {isDisabl && (
                                    <div style={{ marginBottom:3 }}>
                                      {isExp  && <span className="cart-avail-badge cart-avail-badge-exp">Expired</span>}
                                      {isInac && <span className="cart-avail-badge cart-avail-badge-inac">Inactive</span>}
                                    </div>
                                  )}
                                  <p className="cart-avail-code" style={ isDisabl ? { textDecoration:'line-through', color:'rgba(255,255,255,0.30)' } : {} }>
                                    {c.code}
                                  </p>
                                  <p className="cart-avail-desc">{c.description}</p>
                                  {!isDisabl && !c.eligible && c.shortfall > 0 && (
                                    <p className="cart-avail-shortfall">Add ₹{c.shortfall} more to unlock</p>
                                  )}
                                  {isExp && c.expiryDate && (
                                    <p className="cart-avail-shortfall" style={{color:'rgba(248,113,113,0.70)'}}>
                                      Expired on {new Date(c.expiryDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                                    </p>
                                  )}
                                  {isInac && (
                                    <p className="cart-avail-shortfall" style={{color:'rgba(156,163,175,0.80)'}}>
                                      This offer is no longer available
                                    </p>
                                  )}
                                </div>
                                <button
                                  className="cart-avail-apply"
                                  disabled={!canApply}
                                  onClick={() => { setShowCoupons(false); handleApplyCoupon(c.code); }}
                                  style={ isDisabl ? { opacity:0.35, cursor:'not-allowed', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.28)', border:'1px solid rgba(255,255,255,0.08)' } : {} }
                                >
                                  {isExp   ? 'Expired'
                                  : isInac ? 'Inactive'
                                  : canApply ? 'Apply'
                                  : `Need ₹${c.shortfall}`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Summary rows */}
              <div className="cart-sum-row">
                <span>Subtotal ({count} {count === 1 ? 'item' : 'items'})</span>
                <span style={{ color:'#f1f5f9', fontWeight:600 }}>{formatPrice(subtotal)}</span>
              </div>
              <div className={`cart-sum-row ${shipping === 0 ? 'free' : ''}`}>
                <span style={{ color: shipping === 0 ? '#4ade80' : undefined }}>Shipping</span>
                <span style={{ fontWeight:600 }}>{shipping === 0 ? '🎉 FREE' : formatPrice(shipping)}</span>
              </div>
              {appliedCoupon && (
                <div className="cart-sum-row discount">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span style={{ fontWeight:700 }}>−{formatPrice(appliedCoupon.discount)}</span>
                </div>
              )}
              {savings > 0 && (
                <div className="cart-sum-row savings">
                  <span>Total Savings</span>
                  <span style={{ fontWeight:700 }}>−{formatPrice(savings)}</span>
                </div>
              )}

              <div className="cart-sum-divider" />

              <div className="cart-sum-total">
                <span className="cart-sum-total-label">Total</span>
                <span className="cart-sum-total-val">{formatPrice(total)}</span>
              </div>

              {/* Checkout button — unchanged */}
              <button onClick={handleCheckout} className="cart-checkout-btn">
                <span className="cart-checkout-inner">
                  <FiShoppingBag size={17} />
                  Proceed to Checkout
                  <FiArrowRight size={16} className="cart-checkout-arrow" />
                </span>
              </button>

              {/* Trust badges — unchanged */}
              <div className="cart-trust">
                <div className="cart-trust-item"><FiShield size={13} color="#4ade80" /> Secure Checkout — SSL Encrypted</div>
                <div className="cart-trust-item"><FiTruck size={13} color="#60a5fa" /> Fast Delivery across India</div>
                <div className="cart-trust-item"><FiCreditCard size={13} color="#fb923c" /> Cash on Delivery Available</div>
                <div className="cart-trust-item"><FiPackage size={13} color="#c084fc" /> 7-Day Easy Returns</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Cart;