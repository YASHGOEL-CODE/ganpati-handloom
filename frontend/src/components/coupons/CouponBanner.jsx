import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { FiX, FiTag, FiZap } from 'react-icons/fi';

const CouponBanner = () => {
  const { user }            = useAuth();
  const [coupon, setCoupon] = useState(null);
  const [visible, setVisible] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    const fetchBestCoupon = async () => {
      try {
        if (user) {
          // Logged in — fetch personalised available coupons
          const res = await api.get('/coupons/available?cartTotal=0');
          if (res.data.success && res.data.coupons.length > 0) {
            // Show the first coupon (sorted best first by backend)
            setCoupon(res.data.coupons[0]);
          }
        } else {
          // Guest — fetch public welcome coupon
          const res = await api.get('/coupons/welcome');
          if (res.data.success && res.data.coupon) {
            setCoupon(res.data.coupon);
          }
        }
      } catch (_) {
        // Banner is non-critical — silently fail
      }
    };
    fetchBestCoupon();
  }, [user]);

  const handleCopy = () => {
    if (!coupon?.code) return;
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!coupon || !visible) return null;

  return (
    <>
      <style>{`
        .cpn-banner {
          width: 100%;
          background: linear-gradient(135deg, #ea580c 0%, #f97316 50%, #c2410c 100%);
          padding: 10px 16px;
          display: flex; align-items: center; justify-content: center;
          gap: 12px; flex-wrap: wrap;
          position: relative; z-index: 50;
          animation: cpnSlideDown .4s ease both;
        }
        @keyframes cpnSlideDown {
          from { opacity:0; transform:translateY(-100%); }
          to   { opacity:1; transform:translateY(0); }
        }
        .cpn-banner-icon {
          display: flex; align-items: center;
          animation: cpnZap 1.5s ease-in-out infinite;
        }
        @keyframes cpnZap {
          0%,100% { transform:scale(1); }
          50%      { transform:scale(1.18); }
        }
        .cpn-banner-text {
          font-size: 13.5px; font-weight: 600; color: #fff;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          justify-content: center;
        }
        .cpn-banner-code {
          background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.35);
          color: #fff; font-size: 13px; font-weight: 800;
          padding: 2px 10px; border-radius: 6px;
          font-family: monospace; letter-spacing: .05em;
          cursor: pointer; transition: background .2s;
          user-select: all;
        }
        .cpn-banner-code:hover { background: rgba(255,255,255,0.32); }
        .cpn-banner-copy {
          background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.30);
          color: #fff; border-radius: 7px; padding: 4px 11px;
          font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background .2s;
        }
        .cpn-banner-copy:hover { background: rgba(255,255,255,0.28); }
        .cpn-banner-shop {
          background: #fff; color: #ea580c; border-radius: 7px;
          padding: 4px 12px; font-size: 12px; font-weight: 800;
          text-decoration: none; transition: transform .2s, box-shadow .2s;
          white-space: nowrap;
        }
        .cpn-banner-shop:hover { transform: scale(1.04); box-shadow: 0 3px 10px rgba(0,0,0,0.20); }
        .cpn-banner-close {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.18); border: none; color: #fff;
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s;
        }
        .cpn-banner-close:hover { background: rgba(255,255,255,0.30); }
      `}</style>

      <div className="cpn-banner">
        <span className="cpn-banner-icon"><FiZap size={15} color="#fff" fill="#fff" /></span>
        <div className="cpn-banner-text">
          🔥 {coupon.description || `Use code`}&nbsp;
          <span className="cpn-banner-code" onClick={handleCopy} title="Click to copy">
            {coupon.code}
          </span>
          {coupon.minOrderValue > 0 && (
            <span style={{ opacity:.85 }}>on orders above ₹{coupon.minOrderValue}</span>
          )}
        </div>
        <button className="cpn-banner-copy" onClick={handleCopy}>
          {copied ? '✓ Copied!' : 'Copy Code'}
        </button>
        <Link to="/products" className="cpn-banner-shop">Shop Now →</Link>
        <button className="cpn-banner-close" onClick={() => setVisible(false)}>
          <FiX size={13} />
        </button>
      </div>
    </>
  );
};

export default CouponBanner;