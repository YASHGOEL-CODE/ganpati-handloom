import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { FiX, FiGift, FiCopy, FiCheck, FiArrowRight } from 'react-icons/fi';

/*
  Shows ONCE per user:
  - After 7 seconds on the page
  - Only if a valid forNewUsers coupon exists
  - Tracks seen state in localStorage per user id
  - Does NOT break any existing coupon/cart logic
*/
const CouponPopup = () => {
  const { user }              = useAuth();
  const [coupon,  setCoupon]  = useState(null);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    const init = async () => {
      // Key uses user id if logged in, else 'guest'
      const uid    = user?._id || user?.id || 'guest';
      const seenKey = `gh_cpopup_${uid}`;
      if (localStorage.getItem(seenKey)) return;

      try {
        const res = await api.get('/coupons/welcome');
        if (res.data.success && res.data.coupon) {
          setCoupon(res.data.coupon);
          // Show after 7s delay
          setTimeout(() => setVisible(true), 7000);
        }
      } catch (_) {
        // Non-critical — silent fail
      }
    };
    init();
  }, [user]);

  const markSeen = () => {
    const uid    = user?._id || user?.id || 'guest';
    localStorage.setItem(`gh_cpopup_${uid}`, '1');
  };

  const handleClose = () => {
    setExiting(true);
    markSeen();
    setTimeout(() => { setVisible(false); setExiting(false); }, 300);
  };

  const handleCopy = () => {
    if (!coupon?.code) return;
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  if (!coupon || !visible) return null;

  const val      = coupon.discountValue || coupon.discount || 0;
  const label    = coupon.discountType === 'percentage' ? `${val}% OFF` : `₹${val} OFF`;
  const minOrder = coupon.minOrderValue || 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');

        .cpop-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.72); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: cpopFadeIn .30s ease both;
        }
        .cpop-overlay.cpop-exit { animation: cpopFadeOut .28s ease both; }
        @keyframes cpopFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes cpopFadeOut { from{opacity:1} to{opacity:0} }

        .cpop-modal {
          position: relative; z-index: 1;
          width: 100%; max-width: 420px;
          border-radius: 24px; overflow: hidden;
          background:
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(249,115,22,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 60% 70% at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 55%),
            rgba(10,18,35,0.98);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(249,115,22,0.28);
          box-shadow:
            0 0 0 1px rgba(249,115,22,0.10),
            0 32px 80px rgba(0,0,0,0.55),
            0 0 60px rgba(249,115,22,0.10);
          padding: 36px 32px 30px;
          text-align: center;
          animation: cpopSlideUp .35s cubic-bezier(.2,.8,.2,1) both;
        }
        .cpop-overlay.cpop-exit .cpop-modal {
          animation: cpopSlideDown .28s ease both;
        }
        @keyframes cpopSlideUp   { from{opacity:0;transform:translateY(28px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cpopSlideDown { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(14px) scale(.97)} }

        /* Gradient top border */
        .cpop-modal::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #f97316, #ea580c, #c084fc);
          border-radius: 24px 24px 0 0;
        }

        /* Close button */
        .cpop-close {
          position: absolute; top: 14px; right: 14px;
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.45); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s, color .2s;
        }
        .cpop-close:hover { background:rgba(239,68,68,0.15); color:#f87171; }

        /* Icon */
        .cpop-icon {
          width: 68px; height: 68px; border-radius: 50%; margin: 0 auto 18px;
          background: rgba(249,115,22,0.14); border: 1px solid rgba(249,115,22,0.28);
          display: flex; align-items: center; justify-content: center;
          animation: cpopIconBounce 2.2s ease-in-out infinite;
        }
        @keyframes cpopIconBounce {
          0%,100%{transform:translateY(0);box-shadow:0 0 0 0 rgba(249,115,22,0.20);}
          50%{transform:translateY(-5px);box-shadow:0 0 0 10px rgba(249,115,22,0);}
        }

        /* Heading */
        .cpop-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(20px, 4vw, 24px); font-weight: 900; color: #fff;
          margin-bottom: 8px; line-height: 1.15;
        }
        .cpop-sub {
          font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.6;
          margin-bottom: 24px; max-width: 320px; margin-left: auto; margin-right: auto;
        }

        /* Coupon code box */
        .cpop-code-box {
          background: rgba(249,115,22,0.08); border: 1.5px dashed rgba(249,115,22,0.38);
          border-radius: 16px; padding: 20px; margin-bottom: 22px;
          cursor: pointer; transition: background .2s;
        }
        .cpop-code-box:hover { background: rgba(249,115,22,0.14); }
        .cpop-code-lbl {
          font-size: 10.5px; font-weight: 800; color: rgba(255,255,255,0.32);
          text-transform: uppercase; letter-spacing: .12em; margin-bottom: 8px;
        }
        .cpop-code {
          font-family: monospace; font-size: 30px; font-weight: 900; color: #f97316;
          letter-spacing: .12em; line-height: 1;
          background: linear-gradient(135deg, #f97316, #fbbf24);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin-bottom: 6px;
          filter: drop-shadow(0 0 12px rgba(249,115,22,0.35));
        }
        .cpop-code-desc {
          font-size: 13px; color: rgba(255,255,255,0.50); margin-bottom: 3px;
        }
        .cpop-code-min  {
          font-size: 11.5px; color: rgba(255,255,255,0.28);
        }

        /* Buttons */
        .cpop-btns { display: flex; gap: 10px; }
        .cpop-copy {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.65); border-radius: 13px; padding: 13px;
          font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background .2s, color .2s;
        }
        .cpop-copy:hover { background:rgba(255,255,255,0.10); color:#fff; }
        .cpop-copy.copied { background:rgba(74,222,128,0.12); border-color:rgba(74,222,128,0.28); color:#4ade80; }
        .cpop-shop {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
          background: linear-gradient(135deg, #ea580c, #f97316); color: #fff; border: none;
          border-radius: 13px; padding: 13px;
          font-size: 14px; font-weight: 800; font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          transition: transform .22s, box-shadow .22s;
          box-shadow: 0 4px 16px rgba(249,115,22,0.32);
        }
        .cpop-shop:hover { transform:translateY(-1px) scale(1.02); box-shadow:0 8px 24px rgba(249,115,22,0.48); }

        .cpop-skip {
          margin-top: 14px; font-size: 12px; color: rgba(255,255,255,0.24);
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: color .2s;
        }
        .cpop-skip:hover { color: rgba(255,255,255,0.50); }

        @media(max-width:480px){
          .cpop-modal { padding:28px 20px 22px; }
          .cpop-btns  { flex-direction:column; }
        }
      `}</style>

      <div
        className={`cpop-overlay ${exiting ? 'cpop-exit' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <div className="cpop-modal">
          <button className="cpop-close" onClick={handleClose}><FiX size={14} /></button>

          <div className="cpop-icon">
            <FiGift size={30} color="#f97316" strokeWidth={1.5} />
          </div>

          <h2 className="cpop-heading">🎁 Special Offer Just for You!</h2>
          <p className="cpop-sub">
            Here's an exclusive discount to get started.
            Use it on your very first order.
          </p>

          <div className="cpop-code-box" onClick={handleCopy}>
            <p className="cpop-code-lbl">Your exclusive code</p>
            <p className="cpop-code">{coupon.code}</p>
            <p className="cpop-code-desc">Get {label} on your first order</p>
            {minOrder > 0 && (
              <p className="cpop-code-min">Min. order: ₹{minOrder.toLocaleString()}</p>
            )}
          </div>

          <div className="cpop-btns">
            <button
              className={`cpop-copy ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied
                ? <><FiCheck size={14} /> Copied!</>
                : <><FiCopy  size={14} /> Copy Code</>
              }
            </button>
            <Link to="/products" className="cpop-shop" onClick={handleClose}>
              Shop Now <FiArrowRight size={14} />
            </Link>
          </div>

          <button className="cpop-skip" onClick={handleClose}>
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
};

export default CouponPopup;