import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCopy, FiCheck, FiArrowRight, FiClock, FiTag } from 'react-icons/fi';

/*
  Props:
    coupon        — coupon object from API
    discountLabel — function(coupon) → string e.g. "₹100 OFF"
    isNearExpiry  — function(coupon) → boolean
    index         — for stagger animation delay
*/
const CouponCard = ({ coupon, discountLabel, isNearExpiry, index = 0 }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const nearExpiry  = isNearExpiry(coupon);
  const label       = discountLabel(coupon);
  const minOrder    = coupon.minOrderValue || 0;
  const expiryDate  = coupon.expiryDate
    ? new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
    : null;

  // Color tokens by state
  const accentClr  = nearExpiry ? '#fbbf24' : '#f97316';
  const accentRgb  = nearExpiry ? '251,191,36' : '249,115,22';
  const glowClr    = nearExpiry
    ? 'rgba(251,191,36,0.22)'
    : 'rgba(249,115,22,0.18)';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes ccardIn {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes ccardBorderSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes ccardShine {
          0%   { left: -100%; }
          100% { left: 200%; }
        }

        .cc-wrap {
          animation: ccardIn .5s ease both;
          position: relative;
        }

        /* Animated gradient border ring */
        .cc-border-ring {
          position: absolute; inset: -1px; border-radius: 19px; z-index: 0;
          background: conic-gradient(
            from var(--cc-angle, 0deg),
            transparent 0%, transparent 60%,
            rgba(${accentRgb}, 0.55) 70%,
            rgba(${accentRgb}, 0.80) 80%,
            rgba(${accentRgb}, 0.55) 90%,
            transparent 100%
          );
          opacity: 0;
          transition: opacity .35s;
        }
        .cc-wrap:hover .cc-border-ring { opacity: 1; animation: ccardBorderSpin 3.5s linear infinite; }

        .cc-card {
          position: relative; z-index: 1;
          border-radius: 18px; overflow: hidden;
          background:
            radial-gradient(ellipse 70% 60% at 0% 0%, rgba(${accentRgb}, 0.10) 0%, transparent 60%),
            rgba(255,255,255,0.04);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(${accentRgb}, 0.18);
          box-shadow: 0 6px 28px rgba(0,0,0,0.28);
          transition: transform .30s cubic-bezier(.2,.8,.2,1), box-shadow .30s, border-color .30s;
          cursor: default;
          padding: 22px 20px 18px;
        }
        .cc-wrap:hover .cc-card {
          transform: translateY(-7px) scale(1.025);
          box-shadow: 0 18px 48px rgba(0,0,0,0.38), 0 0 32px ${glowClr};
          border-color: rgba(${accentRgb}, 0.38);
        }

        /* Shine sweep on hover */
        .cc-card::before {
          content: ''; position: absolute; top: 0; bottom: 0; width: 50%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          transform: skewX(-18deg);
          left: -100%; transition: none;
        }
        .cc-wrap:hover .cc-card::before {
          animation: ccardShine .65s ease forwards;
        }

        /* Orange top accent */
        .cc-card::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, ${accentClr}, transparent 75%);
          border-radius: 18px 18px 0 0;
        }

        /* ── BADGE ROW ── */
        .cc-badge-row { display:flex; align-items:center; gap:7px; margin-bottom:14px; }
        .cc-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 800; padding: 3px 9px;
          border-radius: 999px; text-transform: uppercase; letter-spacing: .07em;
        }
        .cc-badge-avail {
          background: rgba(74,222,128,0.12); border:1px solid rgba(74,222,128,0.25); color:#4ade80;
        }
        .cc-badge-soon {
          background: rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.28); color:#fbbf24;
        }
        .cc-badge-dot {
          width:5px; height:5px; border-radius:50%;
          animation: ccardDotPulse 1.5s ease-in-out infinite;
        }
        @keyframes ccardDotPulse { 0%,100%{opacity:1} 50%{opacity:.3} }

        /* ── DISCOUNT BIG TEXT ── */
        .cc-discount {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 4vw, 34px); font-weight: 900;
          background: linear-gradient(135deg, ${accentClr}, #fff 120%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          line-height: 1; margin-bottom: 6px;
        }

        /* ── CODE PILL ── */
        .cc-code-row { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
        .cc-code {
          font-family: monospace; font-size: 14px; font-weight: 900;
          background: rgba(0,0,0,0.35); border: 1.5px dashed rgba(${accentRgb}, 0.38);
          color: ${accentClr}; padding: 5px 12px; border-radius: 8px;
          letter-spacing: .08em; user-select: all; flex: 1;
          transition: background .2s;
        }
        .cc-code:hover { background: rgba(${accentRgb}, 0.10); }
        .cc-copy {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: rgba(${accentRgb}, 0.10); border: 1px solid rgba(${accentRgb}, 0.22);
          color: ${accentClr};
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s;
        }
        .cc-copy:hover  { background: rgba(${accentRgb}, 0.22); }
        .cc-copy.copied { background: rgba(74,222,128,0.12); border-color:rgba(74,222,128,0.28); color:#4ade80; }

        /* ── META ── */
        .cc-meta { font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.6; margin-bottom: 14px; }
        .cc-meta span { color: rgba(255,255,255,0.55); font-weight: 600; }

        /* ── FOOTER ── */
        .cc-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .cc-expiry {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: rgba(255,255,255,0.28); font-weight: 500;
        }
        .cc-expiry.soon { color: rgba(251,191,36,0.70); }
        .cc-shop {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12.5px; font-weight: 700; color: ${accentClr};
          text-decoration: none; font-family: 'DM Sans', sans-serif;
          transition: gap .2s;
        }
        .cc-shop:hover { gap: 8px; }
      `}</style>

      <div className="cc-wrap" style={{ animationDelay: `${index * 90}ms` }}>
        <div className="cc-border-ring" style={{ '--cc-angle': '0deg' }} />
        <div className="cc-card">

          {/* Badge row */}
          <div className="cc-badge-row">
            {nearExpiry ? (
              <span className="cc-badge cc-badge-soon">
                <span className="cc-badge-dot" style={{ background:'#fbbf24' }} />
                Ending Soon
              </span>
            ) : (
              <span className="cc-badge cc-badge-avail">
                <span className="cc-badge-dot" style={{ background:'#4ade80' }} />
                Available
              </span>
            )}
            <FiTag size={11} color="rgba(255,255,255,0.20)" />
          </div>

          {/* Big discount */}
          <p className="cc-discount">{label}</p>

          {/* Code + copy */}
          <div className="cc-code-row">
            <span className="cc-code">{coupon.code}</span>
            <button className={`cc-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
              {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
            </button>
          </div>

          {/* Meta */}
          <p className="cc-meta">
            {minOrder > 0
              ? <>Min. order: <span>₹{minOrder.toLocaleString()}</span></>
              : 'Valid on all orders'
            }
            {coupon.maxDiscount && (
              <> &nbsp;·&nbsp; Max: <span>₹{coupon.maxDiscount}</span></>
            )}
          </p>

          {/* Footer */}
          <div className="cc-footer">
            {expiryDate ? (
              <div className={`cc-expiry ${nearExpiry ? 'soon' : ''}`}>
                <FiClock size={11} />
                {nearExpiry ? 'Ends' : 'Valid till'} {expiryDate}
              </div>
            ) : (
              <div className="cc-expiry">No expiry</div>
            )}
            <Link to="/products" className="cc-shop">
              Shop <FiArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CouponCard;