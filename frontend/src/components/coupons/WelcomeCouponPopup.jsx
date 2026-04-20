import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { FiX, FiGift, FiCopy, FiCheck } from 'react-icons/fi';

const WelcomeCouponPopup = () => {
  const { user }              = useAuth();
  const [coupon, setCoupon]   = useState(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    if (!user) return;

    // Only show once per user — track in localStorage
    const seenKey = `gh_welcome_popup_${user._id || user.id}`;
    if (localStorage.getItem(seenKey)) return;

    const fetchWelcomeCoupon = async () => {
      try {
        const res = await api.get('/coupons/welcome');
        if (res.data.success && res.data.coupon) {
          setCoupon(res.data.coupon);
          // Show with slight delay for better UX
          setTimeout(() => setVisible(true), 1200);
        }
      } catch (_) {
        // Non-critical — silently fail
      }
    };
    fetchWelcomeCoupon();
  }, [user]);

  const handleClose = () => {
    setVisible(false);
    if (user) {
      const seenKey = `gh_welcome_popup_${user._id || user.id}`;
      localStorage.setItem(seenKey, '1');
    }
  };

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
        .wcp-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: wcpFadeIn .3s ease;
        }
        @keyframes wcpFadeIn { from{opacity:0} to{opacity:1} }

        .wcp-modal {
          background:
            radial-gradient(circle at 20% 20%, rgba(249,115,22,0.12) 0%, transparent 60%),
            rgba(13,26,46,0.98);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(249,115,22,0.25);
          border-radius: 24px; padding: 40px 36px;
          max-width: 420px; width: 100%; text-align: center;
          position: relative;
          box-shadow: 0 32px 80px rgba(0,0,0,0.50), 0 0 0 1px rgba(249,115,22,0.15);
          animation: wcpSlideUp .35s ease;
        }
        @keyframes wcpSlideUp {
          from { opacity:0; transform:translateY(28px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .wcp-modal::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,#f97316,#ea580c,#c084fc);
          border-radius:24px 24px 0 0;
        }
        .wcp-close {
          position: absolute; top:14px; right:14px;
          width:30px; height:30px; border-radius:50%;
          background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12);
          color:rgba(255,255,255,0.50); display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:background .2s,color .2s;
        }
        .wcp-close:hover { background:rgba(255,255,255,0.12); color:#fff; }

        .wcp-icon {
          width:72px; height:72px; border-radius:50%; margin:0 auto 20px;
          background:rgba(249,115,22,0.14); border:1px solid rgba(249,115,22,0.28);
          display:flex; align-items:center; justify-content:center;
          animation:wcpBounce 2s ease-in-out infinite;
        }
        @keyframes wcpBounce {
          0%,100%{transform:translateY(0);box-shadow:0 0 0 0 rgba(249,115,22,0.20);}
          50%{transform:translateY(-5px);box-shadow:0 0 0 10px rgba(249,115,22,0);}
        }
        .wcp-title {
          font-family:'Playfair Display',serif;
          font-size:22px; font-weight:800; color:#fff; margin-bottom:8px;
        }
        .wcp-sub {
          font-size:14px; color:rgba(255,255,255,0.48); margin-bottom:28px; line-height:1.6;
        }

        /* Coupon code box */
        .wcp-code-box {
          background:rgba(249,115,22,0.10); border:1.5px dashed rgba(249,115,22,0.35);
          border-radius:14px; padding:20px; margin-bottom:24px;
        }
        .wcp-code-label { font-size:11px; font-weight:700; color:rgba(255,255,255,0.38); text-transform:uppercase; letter-spacing:.12em; margin-bottom:8px; }
        .wcp-code {
          font-family:monospace; font-size:28px; font-weight:900; color:#f97316;
          letter-spacing:.10em;
          text-shadow:0 0 20px rgba(249,115,22,0.35);
          margin-bottom:6px;
        }
        .wcp-code-desc { font-size:13px; color:rgba(255,255,255,0.55); }
        .wcp-code-min  { font-size:12px; color:rgba(255,255,255,0.35); margin-top:3px; }

        /* Buttons */
        .wcp-btn-row { display:flex; gap:10px; }
        .wcp-copy-btn {
          flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
          background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12);
          color:rgba(255,255,255,0.70); border-radius:12px; padding:12px;
          font-size:14px; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer;
          transition:background .2s,color .2s;
        }
        .wcp-copy-btn:hover { background:rgba(255,255,255,0.10); color:#fff; }
        .wcp-copy-btn.copied { background:rgba(74,222,128,0.12); border-color:rgba(74,222,128,0.25); color:#4ade80; }
        .wcp-shop-btn {
          flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
          background:linear-gradient(135deg,#ea580c,#f97316); color:#fff; border:none;
          border-radius:12px; padding:12px; font-size:14px; font-weight:700;
          font-family:'DM Sans',sans-serif; cursor:pointer; text-decoration:none;
          transition:transform .22s,box-shadow .22s;
          box-shadow:0 4px 16px rgba(234,88,12,0.30);
        }
        .wcp-shop-btn:hover { transform:translateY(-1px) scale(1.02); box-shadow:0 8px 22px rgba(234,88,12,0.44); }

        .wcp-skip {
          margin-top:14px; font-size:12px; color:rgba(255,255,255,0.28);
          cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif;
          transition:color .2s;
        }
        .wcp-skip:hover { color:rgba(255,255,255,0.55); }
      `}</style>

      <div className="wcp-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
        <div className="wcp-modal">
          <button className="wcp-close" onClick={handleClose}><FiX size={14} /></button>

          <div className="wcp-icon">
            <FiGift size={32} color="#f97316" strokeWidth={1.5} />
          </div>

          <h2 className="wcp-title">🎁 Welcome to Ganpati Handloom!</h2>
          <p className="wcp-sub">
            Here's an exclusive discount just for you.<br />Use this code on your first order.
          </p>

          <div className="wcp-code-box">
            <p className="wcp-code-label">Your exclusive code</p>
            <p className="wcp-code">{coupon.code}</p>
            <p className="wcp-code-desc">{coupon.description || buildDesc(coupon)}</p>
            {coupon.minOrderValue > 0 && (
              <p className="wcp-code-min">Min. order: ₹{coupon.minOrderValue}</p>
            )}
          </div>

          <div className="wcp-btn-row">
            <button
              className={`wcp-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? <><FiCheck size={14} /> Copied!</> : <><FiCopy size={14} /> Copy Code</>}
            </button>
            <Link to="/products" className="wcp-shop-btn" onClick={handleClose}>
              Shop Now →
            </Link>
          </div>

          <button className="wcp-skip" onClick={handleClose}>
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
};

const buildDesc = (c) => {
  const val = c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`;
  return `Get ${val} on your first order`;
};

export default WelcomeCouponPopup;