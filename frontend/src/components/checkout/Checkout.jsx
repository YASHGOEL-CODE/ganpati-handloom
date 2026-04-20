import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { ordersAPI, addressAPI } from '../../services/api';
import api from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { calculateDistance, calculateDeliveryCharge, isServiceable, formatDistance } from '../../utils/distance';
import { STORE_LOCATION, DELIVERY_RULES } from '../../config/delivery';
import { getImageUrl } from '../../utils/imageHelper';
import Loader from '../common/Loader';
import AddressList from '../address/AddressList';
import {
  FiMapPin, FiShoppingBag, FiCheck, FiAlertCircle,
  FiCreditCard, FiLock, FiSmartphone, FiTruck,
  FiPackage, FiShield, FiArrowRight, FiChevronDown,
  FiChevronUp, FiEdit2, FiZap, FiTag, FiX,
} from 'react-icons/fi';
import { BsBank2 } from 'react-icons/bs';

/* ── Payment options — unchanged ── */
const PAYMENT_OPTIONS = [
  { id: 'COD',        label: 'Cash on Delivery',   description: 'Pay when your order arrives',  icon: '💵', available: true  },
  { id: 'UPI',        label: 'UPI',                 description: 'GPay, PhonePe, Paytm & more',  icon: <FiSmartphone className="w-5 h-5" />, available: false },
  { id: 'CARD',       label: 'Credit / Debit Card', description: 'Visa, Mastercard, RuPay',       icon: <FiCreditCard className="w-5 h-5" />, available: false },
  { id: 'NETBANKING', label: 'Net Banking',          description: 'All major banks supported',     icon: <BsBank2 className="w-5 h-5" />,      available: false },
];

const STEPS = [
  { id: 'address',  label: 'Address',  num: 1 },
  { id: 'delivery', label: 'Delivery', num: 2 },
  { id: 'payment',  label: 'Payment',  num: 3 },
  { id: 'items',    label: 'Review',   num: 4 },
];
const STEP_ORDER = ['address','delivery','payment','items'];

/* ── Enhanced accordion section — unchanged ── */
const Section = ({ stepId, num, label, icon: Icon, activeStep, setActiveStep, done, children }) => {
  const isOpen = activeStep === stepId;
  return (
    <div className={`co-sec ${isOpen ? 'co-sec-open' : ''} ${done && !isOpen ? 'co-sec-done' : ''}`}>
      <button className="co-sec-hdr" onClick={() => setActiveStep(isOpen ? null : stepId)}>
        <div className={`co-sec-num ${isOpen ? 'active' : ''} ${done && !isOpen ? 'done' : ''}`}>
          {done && !isOpen
            ? <span className="co-check-anim"><FiCheck size={13} /></span>
            : <span>{num}</span>
          }
        </div>
        <div className={`co-sec-ico ${isOpen ? 'active' : ''}`}>
          <Icon size={15} />
        </div>
        <div className="co-sec-label-wrap">
          <span className="co-sec-label">{label}</span>
          {done && !isOpen && <span className="co-sec-status">Completed</span>}
          {isOpen && <span className="co-sec-status active">In Progress</span>}
        </div>
        <div className={`co-sec-chev ${isOpen ? 'open' : ''}`}>
          <FiChevronDown size={16} />
        </div>
      </button>
      <div className={`co-sec-body ${isOpen ? 'open' : ''}`}>
        <div className="co-sec-body-inner">
          <div className="co-sec-content">{children}</div>
        </div>
      </div>
    </div>
  );
};

/* ── Ripple hook — unchanged ── */
const useRipple = () => {
  const [ripples, setRipples] = useState([]);
  const addRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };
  return [ripples, addRipple];
};

const Checkout = () => {
  const { user }                                      = useContext(AuthContext);
  const { cart, clearCart, appliedCoupon, clearCoupon } = useContext(CartContext);
  const navigate                                        = useNavigate();

  // ── All original state — unchanged ──
  const [loading, setLoading]                             = useState(false);
  const [checkingAddress, setCheckingAddress]             = useState(true);
  const [selectedAddress, setSelectedAddress]             = useState(null);
  const [deliveryInfo, setDeliveryInfo]                   = useState(null);
  const [isLocationServiceable, setIsLocationServiceable] = useState(true);
  const [selectedPayment, setSelectedPayment]             = useState('COD');
  const [activeStep, setActiveStep]                       = useState('address');
  const [ripples, addRipple]                              = useRipple();

  // ── Coupon state — appliedCoupon comes from CartContext (shared with Cart page) ──
  const [couponError,      setCouponError] = useState('');
  const [couponValid,      setCouponValid] = useState(!!appliedCoupon);
  const [validatingCoupon, setValidating]  = useState(false);

  // ── Revalidate coupon with backend on mount ──
  // appliedCoupon already loaded from CartContext (persisted via localStorage)
  useEffect(() => {
    if (!appliedCoupon || !user) {
      setCouponValid(false);
      return;
    }

    const revalidate = async () => {
      setValidating(true);
      setCouponError('');
      try {
        const subtotal = calculateSubtotal();
        const res = await api.post('/coupons/revalidate', {
          code:      appliedCoupon.code,
          cartTotal: subtotal,
        });
        if (res.data.valid) {
          setCouponValid(true);
        } else {
          // Server says invalid — clear from context + localStorage
          clearCoupon();
          setCouponValid(false);
          setCouponError(res.data.message || 'Coupon is no longer valid');
          setTimeout(() => setCouponError(''), 5000);
        }
      } catch (_) {
        // Network error — optimistically keep coupon, mark as valid if it was
        setCouponValid(!!appliedCoupon);
      } finally {
        setValidating(false);
      }
    };

    revalidate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // run once on mount after user is available

  // ── Remove coupon ──
  const handleRemoveCoupon = () => {
    clearCoupon();
    setCouponValid(false);
    setCouponError('');
  };

  // ── All original useEffects — unchanged ──
  useEffect(() => {
    if (selectedAddress?.latitude && selectedAddress?.longitude) {
      const distance    = calculateDistance(STORE_LOCATION.latitude, STORE_LOCATION.longitude, selectedAddress.latitude, selectedAddress.longitude);
      const serviceable = isServiceable(distance, DELIVERY_RULES.MAX_SERVICEABLE_DISTANCE);
      const charge      = calculateDeliveryCharge(distance, DELIVERY_RULES.FREE_DELIVERY_DISTANCE, DELIVERY_RULES.PER_KM_RATE);
      setDeliveryInfo({ distance, charge, isFree: charge === 0 });
      setIsLocationServiceable(serviceable);
    } else {
      setDeliveryInfo(null);
      setIsLocationServiceable(true);
    }
  }, [selectedAddress]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!cart || cart.items.length === 0) { navigate('/cart'); return; }
      try {
        const response  = await addressAPI.getAll();
        const addresses = response.data.addresses;
        if (addresses.length === 0) { navigate('/add-address?returnUrl=/checkout'); return; }
        const defaultAddr = addresses.find((addr) => addr.isDefault);
        setSelectedAddress(defaultAddr || addresses[0]);
      } catch (error) { console.error('Error loading addresses:', error); }
      finally { setCheckingAddress(false); }
    };
    loadAddresses();
  }, []);

  // ── Calculations — subtotal/shipping unchanged; total includes coupon discount ──
  const calculateSubtotal = () => !cart?.items ? 0 : cart.items.reduce((t, i) => t + i.price * i.quantity, 0);
  const calculateShipping = () => deliveryInfo?.charge ?? 0;
  const calculateDiscount = () => (couponValid && appliedCoupon) ? (appliedCoupon.discount || 0) : 0;
  const calculateTotal    = () => Math.max(0, calculateSubtotal() + calculateShipping() - calculateDiscount());

  // ── Place Order — marks coupon used AFTER successful order ──
  const handlePlaceOrder = async (e) => {
    addRipple(e);
    if (!selectedAddress) { alert('Please select a delivery address'); return; }
    if (!isLocationServiceable) { alert('Cannot deliver to this location'); return; }

    setLoading(true);
    try {
      const subtotal = calculateSubtotal();

      // Re-validate coupon one final time before placing order
      let finalDiscount = 0;
      if (appliedCoupon && couponValid) {
        const revalRes = await api.post('/coupons/revalidate', {
          code:      appliedCoupon.code,
          cartTotal: subtotal,
        });
        if (revalRes.data.valid) {
          finalDiscount = revalRes.data.discount;
        } else {
          // Coupon became invalid between validation and placing order
          clearCoupon();
          setCouponValid(false);
          setCouponError(revalRes.data.message || 'Coupon expired. Order placed without discount.');
          setLoading(false);
          return;
        }
      }

      const shippingCharge = calculateShipping();

      const orderData = {
        orderItems: cart.items.map((item) => ({
          product:  item.product || item._id,
          name:     item.name,
          image:    item.images?.[0] || item.image,
          price:    item.price,
          quantity: item.quantity,
        })),
        shippingAddress: selectedAddress,
        shippingPrice:   shippingCharge,
        totalPrice:      Math.max(0, subtotal + shippingCharge - finalDiscount),

        // ✅ Delivery fields (from deliveryInfo state — required by Order schema)
        deliveryDistance: deliveryInfo?.distance  ?? 0,
        deliveryCharge:   deliveryInfo?.charge    ?? shippingCharge,
        isServiceable:    isLocationServiceable,

        // ✅ Coupon fields — saved permanently in DB
        ...(appliedCoupon && couponValid && {
          couponCode:     appliedCoupon.code,
          discountAmount: finalDiscount,
        }),
      };

      const response = await ordersAPI.create(orderData);
      if (response.data.success) {
        // Mark coupon as used ONLY after order is successfully placed
        if (appliedCoupon && couponValid) {
          try {
            await api.post('/coupons/mark-used', { code: appliedCoupon.code });
          } catch (_) {
            // Non-critical — usage tracking failure shouldn't block the user
            console.warn('Failed to mark coupon used');
          }
        }

        // clearCart() in CartContext also calls clearCoupon() internally
        clearCart();
        navigate(`/orders/${response.data.order._id}`);
        alert('✅ Order placed successfully!');
      }
    } catch (error) {
      console.error('❌ Place order error:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAddress) return <Loader />;

  const subtotal  = calculateSubtotal();
  const shipping  = calculateShipping();
  const discount  = calculateDiscount();
  const total     = calculateTotal();
  const itemCount = cart?.items?.length || 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .co-page {
          min-height: 100vh;
          background: #070d1a;
          background-image:
            radial-gradient(ellipse 80% 60% at 20% 0%, rgba(234,88,12,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 100%, rgba(139,92,246,0.05) 0%, transparent 60%),
            linear-gradient(160deg, #070d1a 0%, #0d1a2e 50%, #070d1a 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 0 0 100px;
        }
        .co-wrap { max-width: 1320px; margin: 0 auto; padding: 0 28px; }
        @media (max-width: 640px) { .co-wrap { padding: 0 16px; } }

        .co-header {
          padding: 44px 0 30px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 38px;
        }
        .co-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; color: #ea580c;
          letter-spacing: .15em; text-transform: uppercase; margin-bottom: 10px;
        }
        .co-eyebrow::before, .co-eyebrow::after {
          content:''; display:inline-block; width:14px; height:1.5px; background:#ea580c;
        }
        .co-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 3.5vw, 44px); font-weight: 800;
          color: #fff; line-height: 1.1; letter-spacing: -.02em;
        }
        .co-title-accent {
          background: linear-gradient(90deg,#fb923c,#f97316);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .co-stepper {
          display: flex; align-items: center; flex-wrap: nowrap;
          margin-bottom: 38px; gap: 0; overflow: hidden;
        }
        .co-step {
          display: flex; align-items: center; gap: 6px;
          font-size: 11.5px; font-weight: 600;
          color: rgba(255,255,255,0.25);
          padding: 8px 0; transition: color .3s;
          cursor: default; flex-shrink: 1; min-width: 0;
        }
        .co-step.active   { color: #f1f5f9; }
        .co-step.complete { color: #4ade80; }
        .co-step-num {
          width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.10);
          transition: all .35s ease;
        }
        .co-step.active .co-step-num {
          background: linear-gradient(135deg, rgba(234,88,12,0.25), rgba(249,115,22,0.15));
          border-color: #ea580c; color: #fb923c;
          box-shadow: 0 0 0 4px rgba(234,88,12,0.12);
          animation: stepPulse 2.5s ease-in-out infinite;
        }
        @keyframes stepPulse {
          0%,100% { box-shadow: 0 0 0 4px rgba(234,88,12,0.12); }
          50%      { box-shadow: 0 0 0 6px rgba(234,88,12,0.08); }
        }
        .co-step.complete .co-step-num {
          background: linear-gradient(135deg, rgba(74,222,128,0.18), rgba(34,197,94,0.10));
          border-color: #4ade80; color: #4ade80;
        }
        .co-check-anim {
          display: flex; align-items: center; justify-content: center;
          animation: checkBounce .4s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes checkBounce {
          from { transform: scale(0) rotate(-20deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .co-step-connector {
          flex: 1; height: 2px; min-width: 8px; max-width: 40px;
          background: rgba(255,255,255,0.07);
          border-radius: 2px; margin: 0 5px; position: relative; overflow: hidden;
        }
        .co-step-connector.filled::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, #4ade80, #22c55e);
          animation: connectorFill .5s ease both;
        }
        @keyframes connectorFill {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }
        .co-grid {
          display: grid; grid-template-columns: 1fr 390px;
          gap: 28px; align-items: start;
        }
        @media (max-width: 1024px) { .co-grid { grid-template-columns: 1fr; } }

        .co-sec {
          border-radius: 20px; overflow: hidden; margin-bottom: 14px;
          position: relative; transition: box-shadow .28s ease;
          background: rgba(255,255,255,0.035);
          border: 1.5px solid rgba(255,255,255,0.08);
          isolation: isolate;
        }
        .co-sec:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.22); }
        .co-sec, .co-sec * { box-sizing: border-box; }
        .co-sec-open {
          border-color: rgba(234,88,12,0.45);
          box-shadow: 0 0 0 2px rgba(234,88,12,0.12), 0 12px 40px rgba(234,88,12,0.10), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .co-sec-done { border-color: rgba(74,222,128,0.35); box-shadow: 0 4px 18px rgba(74,222,128,0.06); }
        .co-sec-hdr {
          width: 100%; display: flex; align-items: center; gap: 14px;
          padding: 18px 22px; background: transparent; border: none;
          cursor: pointer; text-align: left; transition: background .2s;
        }
        .co-sec-hdr:hover { background: rgba(255,255,255,0.02); }
        .co-sec-num {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800;
          border: 1.5px solid rgba(234,88,12,0.25);
          background: rgba(234,88,12,0.10); color: #fb923c;
          transition: all .3s ease;
        }
        .co-sec-num.active { box-shadow: 0 0 12px rgba(234,88,12,0.35); animation: secNumPulse 2s ease-in-out infinite; }
        @keyframes secNumPulse {
          0%,100% { box-shadow: 0 0 8px rgba(234,88,12,0.25); }
          50%      { box-shadow: 0 0 18px rgba(234,88,12,0.45); }
        }
        .co-sec-num.done { background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.30); color: #4ade80; }
        .co-sec-ico {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.45);
          transition: background .25s, color .25s, transform .25s;
        }
        .co-sec-ico.active { background: rgba(234,88,12,0.14); color: #fb923c; transform: rotate(-5deg) scale(1.08); }
        .co-sec-label-wrap { flex: 1; }
        .co-sec-label { display: block; font-size: 15px; font-weight: 700; color: #f1f5f9; }
        .co-sec-status { display: inline-block; font-size: 10.5px; font-weight: 700; color: rgba(74,222,128,0.80); margin-top: 2px; letter-spacing: .05em; text-transform: uppercase; }
        .co-sec-status.active { color: rgba(251,146,60,0.80); }
        .co-sec-chev { color: rgba(255,255,255,0.30); transition: transform .35s cubic-bezier(0.4,0,0.2,1), color .2s; }
        .co-sec-chev.open { transform: rotate(180deg); color: #fb923c; }
        .co-sec-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .32s ease; }
        .co-sec-body.open { grid-template-rows: 1fr; }
        .co-sec-body-inner { overflow: hidden; min-height: 0; }
        .co-sec-content { padding: 0 22px 24px; }

        .co-del-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        @media (max-width: 580px) { .co-del-grid { grid-template-columns: 1fr; } }
        .co-del-card {
          border-radius: 14px; padding: 18px 15px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          transition: transform .25s, border-color .25s, box-shadow .25s;
        }
        .co-del-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15); box-shadow: 0 10px 28px rgba(0,0,0,0.22); }
        .co-del-ico { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .co-del-lbl { font-size: 10.5px; color: rgba(255,255,255,0.32); text-transform:uppercase; letter-spacing:.09em; margin-bottom:4px; }
        .co-del-val { font-size: 15px; font-weight: 700; color: #f1f5f9; }
        .co-not-svc {
          background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.22);
          border-radius: 14px; padding: 16px; display:flex; gap:12px; align-items:flex-start;
        }
        .co-pay-opt {
          display: flex; align-items: center; gap: 14px;
          padding: 16px; border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
          margin-bottom: 10px; cursor: pointer;
          transition: border-color .22s, background .22s, box-shadow .22s, transform .22s;
          position: relative; overflow: hidden;
        }
        .co-pay-opt:last-child { margin-bottom: 0; }
        .co-pay-opt.sel { border-color: transparent; background: rgba(234,88,12,0.07); box-shadow: 0 0 0 2px rgba(234,88,12,0.35), 0 4px 18px rgba(234,88,12,0.12); }
        .co-pay-opt.dis { opacity:.42; cursor:not-allowed; }
        .co-pay-opt:not(.dis):not(.sel):hover { border-color: rgba(234,88,12,0.28); background: rgba(234,88,12,0.04); transform: translateX(3px); }
        .co-pay-radio { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; transition: border-color .2s, box-shadow .2s; }
        .co-pay-opt.sel .co-pay-radio { border-color: #ea580c; box-shadow: 0 0 8px rgba(234,88,12,0.35); }
        .co-pay-dot { width: 9px; height: 9px; border-radius: 50%; background: #ea580c; animation: dotPop .25s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes dotPop { from{transform:scale(0)} to{transform:scale(1)} }
        .co-pay-icon { font-size: 22px; flex-shrink: 0; width: 32px; text-align: center; }
        .co-pay-name { font-size: 14px; font-weight: 700; color: #f1f5f9; margin-bottom: 2px; }
        .co-pay-desc { font-size: 12px; color: rgba(255,255,255,0.36); }
        .co-pay-badge { font-size: 10px; font-weight: 700; padding:3px 9px; border-radius:999px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.09); color:rgba(255,255,255,0.35); white-space:nowrap; }
        .co-pay-sel-badge { font-size: 10px; font-weight: 700; padding:3px 9px; border-radius:999px; background:rgba(234,88,12,0.15); border:1px solid rgba(234,88,12,0.28); color:#fb923c; display:flex; align-items:center; gap:4px; white-space:nowrap; animation: badgeFade .2s ease; }
        @keyframes badgeFade { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        .co-pay-secure { display:flex; align-items:center; gap:7px; margin-top:14px; font-size:12px; color:rgba(255,255,255,0.28); }

        .co-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background .2s; border-radius: 8px; }
        .co-item:last-child { border-bottom: none; }
        .co-item:hover { background: rgba(255,255,255,0.025); padding-left: 6px; }
        .co-item-img { width: 66px; height: 66px; border-radius: 12px; object-fit: cover; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.07); background: #0f172a; transition: transform .35s; }
        .co-item:hover .co-item-img { transform: scale(1.05); }
        .co-item-name { font-size: 14px; font-weight: 700; color: #f1f5f9; margin-bottom:3px; }
        .co-item-qty  { font-size: 12px; color: rgba(255,255,255,0.36); }
        .co-item-price { font-size:15px; font-weight:800; background:linear-gradient(90deg,#fb923c,#f97316); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; white-space:nowrap; }
        .co-edit-link { display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; color:rgba(255,255,255,0.36); text-decoration:none; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03); padding:7px 13px; border-radius:9px; margin-top:14px; transition:all .2s; }
        .co-edit-link:hover { color:#fff; border-color:rgba(255,255,255,0.18); background:rgba(255,255,255,0.07); }

        /* ── ORDER SUMMARY ── */
        .co-summary {
          position: sticky; top: 88px;
          border-radius: 22px; padding: 26px 24px;
          background: rgba(13,26,46,0.85);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid transparent; background-clip: padding-box;
          box-shadow: 0 0 0 1px rgba(234,88,12,0.18), 0 24px 60px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .co-summary::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #ea580c, #f97316, #c084fc);
          border-radius: 22px 22px 0 0;
        }
        .co-summary::after {
          content:''; position:absolute; z-index:-1;
          width:200px; height:200px; border-radius:50%;
          background: radial-gradient(circle, rgba(234,88,12,0.10) 0%, transparent 70%);
          top:-60px; right:-40px; pointer-events:none;
        }
        @media (max-width:1024px) { .co-summary { position:static; } }
        .co-sum-title { font-family:'Playfair Display',serif; font-size:19px; font-weight:700; color:#f1f5f9; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.07); display:flex; align-items:center; gap:8px; }
        .co-sum-row { display:flex; justify-content:space-between; align-items:center; font-size:13.5px; color:rgba(255,255,255,0.48); font-weight:500; margin-bottom:11px; }
        .co-sum-row.free    { color:#4ade80; }
        .co-sum-row.discount{ color:#4ade80; }
        .co-sum-div { height:1px; background:rgba(255,255,255,0.08); margin:15px 0; }
        .co-sum-total { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:20px; }
        .co-sum-total-lbl { font-size:15px; font-weight:700; color:#f1f5f9; }
        .co-sum-total-val { font-size:28px; font-weight:800; background:linear-gradient(90deg,#fb923c,#f97316); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; transition: all .3s ease; }

        /* Coupon applied row in summary */
        .co-coupon-applied {
          display:flex; align-items:center; justify-content:space-between;
          background:rgba(74,222,128,0.08); border:1px solid rgba(74,222,128,0.20);
          border-radius:11px; padding:10px 13px; margin-bottom:14px;
        }
        .co-coupon-applied-left { display:flex; align-items:center; gap:8px; }
        .co-coupon-code { font-size:13px; font-weight:800; color:#4ade80; font-family:monospace; }
        .co-coupon-save { font-size:11.5px; color:rgba(74,222,128,0.65); }
        .co-coupon-remove { background:none; border:none; color:rgba(248,113,113,0.65); cursor:pointer; padding:3px; transition:color .2s; }
        .co-coupon-remove:hover { color:#f87171; }
        /* Coupon error in checkout */
        .co-coupon-err { font-size:12.5px; color:#f87171; background:rgba(239,68,68,0.10); border:1px solid rgba(239,68,68,0.22); border-radius:9px; padding:9px 12px; margin-bottom:12px; display:flex; align-items:center; gap:7px; }
        /* Validating indicator */
        .co-coupon-validating { font-size:12px; color:rgba(255,255,255,0.38); margin-bottom:10px; display:flex; align-items:center; gap:7px; }

        .co-cod { display:flex; align-items:center; justify-content:center; gap:7px; background:rgba(74,222,128,0.08); border:1px solid rgba(74,222,128,0.18); border-radius:11px; padding:11px; margin-bottom:18px; font-size:13px; font-weight:700; color:#4ade80; }
        .co-warn { display:flex; align-items:flex-start; gap:8px; background:rgba(251,191,36,0.07); border:1px solid rgba(251,191,36,0.20); border-radius:11px; padding:12px 14px; margin-bottom:18px; font-size:13px; color:rgba(251,191,36,0.88); }

        .co-btn-wrap { position: relative; margin-bottom: 12px; }
        .co-place-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 9px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none; border-radius: 14px;
          padding: 16px 20px; font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer; letter-spacing: .02em;
          transition: transform .22s, box-shadow .22s, filter .22s;
          box-shadow: 0 6px 24px rgba(234,88,12,0.35);
          position: relative; overflow: hidden;
        }
        .co-place-btn:hover:not(:disabled) { transform: translateY(-3px) scale(1.02); box-shadow: 0 14px 36px rgba(234,88,12,0.52); filter: brightness(1.06); }
        .co-place-btn:active:not(:disabled) { transform: scale(0.98); }
        .co-place-btn:disabled { opacity:.46; cursor:not-allowed; transform:none; }
        .co-btn-inner { position:relative; z-index:1; display:flex; align-items:center; gap:9px; }
        .co-btn-arrow { transition:transform .22s; }
        .co-place-btn:hover:not(:disabled) .co-btn-arrow { transform:translateX(5px); }
        .co-ripple { position:absolute; border-radius:50%; background:rgba(255,255,255,0.25); transform:scale(0); animation:rippleAnim .6s ease-out; pointer-events:none; }
        @keyframes rippleAnim { to{transform:scale(4);opacity:0;} }
        .co-secure-txt { text-align:center; font-size:11.5px; color:rgba(255,255,255,0.26); display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:18px; flex-wrap:wrap; }
        .co-secure-dot { color:rgba(255,255,255,0.15); }
        .co-trust { display:flex; flex-direction:column; gap:8px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.07); }
        .co-trust-item { display:flex; align-items:center; gap:9px; font-size:12.5px; font-weight:500; color:rgba(255,255,255,0.38); padding:6px 8px; border-radius:8px; transition:background .2s, color .2s; }
        .co-trust-item:hover { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.65); }

        @media (max-width:640px) {
          .co-header { padding:28px 0 20px; }
          .co-del-grid { grid-template-columns:1fr 1fr; }
          .co-sec-hdr { padding:15px 16px; }
          .co-sec-content { padding:0 16px 20px; }
          .co-summary { padding:20px 18px; }
        }
      `}</style>

      <div className="co-page">
        <div className="co-wrap">

          <div className="co-header">
            <p className="co-eyebrow">Place Your Order</p>
            <h1 className="co-title">Check<span className="co-title-accent">out</span></h1>
          </div>

          {/* ── ANIMATED STEPPER — unchanged ── */}
          <div className="co-stepper">
            {STEPS.map((step, i) => {
              const activeIdx  = STEP_ORDER.indexOf(activeStep ?? '');
              const thisIdx    = STEP_ORDER.indexOf(step.id);
              const isActive   = activeStep === step.id;
              const isComplete = thisIdx < activeIdx || (selectedAddress && step.id === 'address' && !isActive);
              const nextComplete = i < STEPS.length - 1 && STEP_ORDER.indexOf(STEPS[i + 1].id) <= activeIdx;
              return (
                <React.Fragment key={step.id}>
                  <div className={`co-step ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}>
                    <div className="co-step-num">
                      {isComplete
                        ? <span className="co-check-anim"><FiCheck size={13} /></span>
                        : step.num
                      }
                    </div>
                    {step.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`co-step-connector ${isComplete && nextComplete ? 'filled' : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="co-grid">
            <div>
              {/* STEP 1: ADDRESS — unchanged */}
              <Section stepId="address" num={1} label="Delivery Address" icon={FiMapPin} activeStep={activeStep} setActiveStep={setActiveStep} done={!!selectedAddress}>
                <AddressList selectable={true} onSelect={setSelectedAddress} returnUrl="/checkout" />
              </Section>

              {/* STEP 2: DELIVERY — unchanged */}
              <Section stepId="delivery" num={2} label="Delivery Information" icon={FiTruck} activeStep={activeStep} setActiveStep={setActiveStep} done={!!deliveryInfo && isLocationServiceable}>
                {selectedAddress && deliveryInfo ? (
                  !isLocationServiceable ? (
                    <div className="co-not-svc">
                      <FiAlertCircle size={20} color="#f87171" style={{ flexShrink:0, marginTop:2 }} />
                      <div>
                        <p style={{ fontWeight:700, color:'#fca5a5', marginBottom:4 }}>⚠️ Location Not Serviceable</p>
                        <p style={{ fontSize:13, color:'rgba(248,113,113,0.78)' }}>Maximum delivery distance: {DELIVERY_RULES.MAX_SERVICEABLE_DISTANCE} km</p>
                      </div>
                    </div>
                  ) : (
                    <div className="co-del-grid">
                      <div className="co-del-card">
                        <div className="co-del-ico" style={{ background:'rgba(234,88,12,0.12)' }}><FiMapPin size={18} color="#fb923c" /></div>
                        <p className="co-del-lbl">Distance</p>
                        <p className="co-del-val">{deliveryInfo.distance !== null ? formatDistance(deliveryInfo.distance) : 'N/A'}</p>
                      </div>
                      <div className="co-del-card">
                        <div className="co-del-ico" style={{ background:'rgba(59,130,246,0.12)' }}><FiTruck size={18} color="#60a5fa" /></div>
                        <p className="co-del-lbl">Delivery Charge</p>
                        <p className="co-del-val" style={{ color: deliveryInfo.isFree ? '#4ade80' : undefined }}>{deliveryInfo.isFree ? '🎉 FREE' : `₹${deliveryInfo.charge.toFixed(2)}`}</p>
                      </div>
                      <div className="co-del-card">
                        <div className="co-del-ico" style={{ background:'rgba(74,222,128,0.12)' }}><FiPackage size={18} color="#4ade80" /></div>
                        <p className="co-del-lbl">Estimated Time</p>
                        <p className="co-del-val">2–5 Days</p>
                      </div>
                    </div>
                  )
                ) : (
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.35)', padding:'8px 0' }}>Please select a delivery address first.</p>
                )}
              </Section>

              {/* STEP 3: PAYMENT — unchanged */}
              <Section stepId="payment" num={3} label="Payment Method" icon={FiCreditCard} activeStep={activeStep} setActiveStep={setActiveStep} done={!!selectedPayment}>
                <div>
                  {PAYMENT_OPTIONS.map((opt) => {
                    const isSel = selectedPayment === opt.id;
                    const isDis = !opt.available;
                    return (
                      <div key={opt.id} className={`co-pay-opt ${isSel ? 'sel' : ''} ${isDis ? 'dis' : ''}`} onClick={() => opt.available && setSelectedPayment(opt.id)}>
                        <div className="co-pay-radio">{isSel && !isDis && <div className="co-pay-dot" />}</div>
                        <div className="co-pay-icon">{opt.icon}</div>
                        <div style={{ flex:1 }}>
                          <p className="co-pay-name">{opt.label}</p>
                          <p className="co-pay-desc">{opt.description}</p>
                        </div>
                        {isDis ? <span className="co-pay-badge">Coming Soon</span> : isSel ? <span className="co-pay-sel-badge"><FiCheck size={11} /> Selected</span> : null}
                      </div>
                    );
                  })}
                  <div className="co-pay-secure"><FiLock size={12} color="#ea580c" /> Secure online payment options coming soon.</div>
                </div>
              </Section>

              {/* STEP 4: ORDER REVIEW — unchanged */}
              <Section stepId="items" num={4} label={`Order Review (${itemCount} item${itemCount !== 1 ? 's' : ''})`} icon={FiShoppingBag} activeStep={activeStep} setActiveStep={setActiveStep} done={itemCount > 0}>
                <div>
                  {cart.items.map((item) => (
                    <div key={item.product || item._id} className="co-item">
                      <img src={getImageUrl(item.images?.[0] || item.image)} alt={item.name} className="co-item-img" />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p className="co-item-name">{item.name}</p>
                        <p className="co-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="co-item-price">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  <Link to="/cart" className="co-edit-link"><FiEdit2 size={13} /> Edit Cart</Link>
                </div>
              </Section>
            </div>

            {/* ── STICKY SUMMARY ── */}
            <div className="co-summary">
              <h2 className="co-sum-title"><FiZap size={18} color="#fb923c" /> Order Summary</h2>

              {/* Coupon status in summary */}
              {couponError && (
                <div className="co-coupon-err">
                  <FiAlertCircle size={13} /> {couponError}
                </div>
              )}
              {validatingCoupon && (
                <div className="co-coupon-validating">
                  <svg style={{animation:'spin .75s linear infinite'}} width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity=".25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Verifying coupon...
                </div>
              )}
              {appliedCoupon && couponValid && !validatingCoupon && (
                <div className="co-coupon-applied">
                  <div className="co-coupon-applied-left">
                    <FiTag size={13} color="#4ade80" />
                    <div>
                      <p className="co-coupon-code">{appliedCoupon.code}</p>
                      <p className="co-coupon-save">−{formatPrice(discount)} saved</p>
                    </div>
                  </div>
                  <button className="co-coupon-remove" onClick={handleRemoveCoupon} title="Remove coupon">
                    <FiX size={14} />
                  </button>
                </div>
              )}

              <div className="co-sum-row">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                <span style={{ color:'#f1f5f9', fontWeight:600 }}>{formatPrice(subtotal)}</span>
              </div>
              <div className={`co-sum-row ${shipping === 0 ? 'free' : ''}`}>
                <span style={{ color: shipping === 0 ? '#4ade80' : undefined }}>Shipping</span>
                <span style={{ fontWeight:600 }}>{shipping === 0 ? '🎉 FREE' : formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="co-sum-row discount">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span style={{ fontWeight:700 }}>−{formatPrice(discount)}</span>
                </div>
              )}

              <div className="co-sum-div" />

              <div className="co-sum-total">
                <span className="co-sum-total-lbl">Total</span>
                <span className="co-sum-total-val">{formatPrice(total)}</span>
              </div>

              <div className="co-cod"><FiShield size={14} /> Cash on Delivery (COD)</div>

              {!selectedAddress && (
                <div className="co-warn">
                  <FiAlertCircle size={16} style={{ flexShrink:0, marginTop:1 }} />
                  Please select a delivery address
                </div>
              )}

              <div className="co-btn-wrap">
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddress || !isLocationServiceable}
                  className="co-place-btn"
                >
                  {ripples.map((r) => (
                    <span key={r.id} className="co-ripple" style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40 }} />
                  ))}
                  {loading ? (
                    <span className="co-btn-inner">
                      <svg style={{animation:'spin .75s linear infinite'}} width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity=".25"/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Placing Order...
                    </span>
                  ) : !isLocationServiceable ? (
                    <span className="co-btn-inner"><FiAlertCircle size={17} /> Not Serviceable</span>
                  ) : (
                    <span className="co-btn-inner">
                      <FiCheck size={17} /> Place Order (COD)
                      <FiArrowRight size={16} className="co-btn-arrow" />
                    </span>
                  )}
                </button>
              </div>

              <p className="co-secure-txt">
                <FiLock size={11} /> Secure
                <span className="co-secure-dot">•</span>
                Fast Delivery
                <span className="co-secure-dot">•</span>
                Trusted
              </p>

              <div className="co-trust">
                <div className="co-trust-item"><FiShield size={14} color="#4ade80" /> Secure Checkout — SSL Encrypted</div>
                <div className="co-trust-item"><FiTruck size={14} color="#60a5fa" /> Fast Delivery across India</div>
                <div className="co-trust-item"><FiPackage size={14} color="#c084fc" /> 7-Day Easy Returns</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;