import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCoupons from '../../hooks/useCoupons';
import { FiArrowRight, FiZap, FiCopy, FiCheck } from 'react-icons/fi';

const HeroBanner = () => {
  const { bestCoupon, loading, discountLabel } = useCoupons(1);
  const [copied, setCopied]   = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (bestCoupon) setTimeout(() => setVisible(true), 80);
  }, [bestCoupon]);

  const handleCopy = () => {
    if (!bestCoupon?.code) return;
    navigator.clipboard.writeText(bestCoupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  if (loading || !bestCoupon) return null;

  const label    = discountLabel(bestCoupon);
  const minOrder = bestCoupon.minOrderValue || 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');

        .hb-outer {
          padding: 24px 28px 0;
          max-width: 1280px; margin: 0 auto;
          opacity: 0; transform: translateY(-12px);
          transition: opacity .55s ease, transform .55s ease;
        }
        .hb-outer.hb-visible { opacity:1; transform:translateY(0); }
        @media(max-width:640px){ .hb-outer { padding: 16px 14px 0; } }

        /* ── CARD ── */
        .hb-card {
          position: relative; overflow: hidden;
          border-radius: 22px;
          background:
            radial-gradient(ellipse 80% 60% at 0% 50%, rgba(249,115,22,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 60% 80% at 100% 20%, rgba(139,92,246,0.10) 0%, transparent 60%),
            rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(249,115,22,0.22);
          box-shadow:
            0 0 0 1px rgba(249,115,22,0.08),
            0 8px 40px rgba(249,115,22,0.14),
            0 24px 64px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.06);
          padding: 28px 36px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
          cursor: default;
          transition: box-shadow .35s, border-color .35s;
        }
        .hb-card:hover {
          border-color: rgba(249,115,22,0.38);
          box-shadow:
            0 0 0 1px rgba(249,115,22,0.16),
            0 8px 48px rgba(249,115,22,0.22),
            0 28px 72px rgba(0,0,0,0.40),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        /* Animated orb */
        .hb-orb {
          position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
        }
        .hb-orb-1 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(249,115,22,0.20) 0%, transparent 70%);
          top: -80px; left: -60px;
          animation: hbFloat1 8s ease-in-out infinite alternate;
        }
        .hb-orb-2 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
          bottom: -60px; right: 120px;
          animation: hbFloat2 11s ease-in-out infinite alternate;
        }
        @keyframes hbFloat1 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(24px,16px) scale(1.12); }
        }
        @keyframes hbFloat2 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(-18px,-12px) scale(1.08); }
        }

        /* Shine sweep on hover */
        .hb-card::before {
          content: ''; position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%);
          opacity: 0; transition: opacity .35s;
        }
        .hb-card:hover::before { opacity: 1; }

        /* Top border line */
        .hb-card::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 2;
          background: linear-gradient(90deg, #f97316 0%, #ea580c 40%, #c084fc 80%, transparent 100%);
          border-radius: 22px 22px 0 0;
        }

        /* ── CONTENT ── */
        .hb-left { position: relative; z-index: 3; flex: 1; min-width: 220px; }

        .hb-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase;
          color: #f97316;
          background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.25);
          padding: 4px 12px; border-radius: 999px; margin-bottom: 14px;
        }
        .hb-tag-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #f97316;
          animation: hbPing 1.5s ease-in-out infinite;
        }
        @keyframes hbPing {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(1.6); opacity:.5; }
        }

        .hb-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 3vw, 36px);
          font-weight: 900; color: #fff; line-height: 1.1;
          margin-bottom: 10px;
        }
        .hb-headline-accent {
          background: linear-gradient(90deg, #f97316, #fb923c, #fbbf24);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .hb-sub {
          font-size: 14px; color: rgba(255,255,255,0.48); line-height: 1.6;
          margin-bottom: 20px; max-width: 420px;
        }
        .hb-sub strong { color: rgba(255,255,255,0.72); font-weight: 700; }

        /* Code pill */
        .hb-code-row {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .hb-code {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(0,0,0,0.40); border: 1.5px dashed rgba(249,115,22,0.40);
          border-radius: 10px; padding: 8px 16px;
          font-family: monospace; font-size: 16px; font-weight: 900;
          color: #fb923c; letter-spacing: .10em;
          user-select: all; cursor: pointer;
          transition: background .2s, border-color .2s;
        }
        .hb-code:hover { background:rgba(249,115,22,0.10); border-color:rgba(249,115,22,0.65); }
        .hb-copy-btn {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(249,115,22,0.10); border: 1px solid rgba(249,115,22,0.22);
          color: #fb923c; border-radius: 8px; padding: 7px 13px;
          font-size: 12.5px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all .2s; white-space: nowrap;
        }
        .hb-copy-btn:hover  { background:rgba(249,115,22,0.20); border-color:rgba(249,115,22,0.40); }
        .hb-copy-btn.copied { background:rgba(74,222,128,0.12); border-color:rgba(74,222,128,0.30); color:#4ade80; }

        /* ── RIGHT ── */
        .hb-right {
          position: relative; z-index: 3;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          flex-shrink: 0;
        }

        /* Big discount circle */
        .hb-disc-ring {
          width: 110px; height: 110px; border-radius: 50%;
          background: conic-gradient(from 0deg, #ea580c, #f97316, #fbbf24, #f97316, #ea580c);
          padding: 2.5px;
          animation: hbSpin 12s linear infinite;
          flex-shrink: 0;
        }
        @keyframes hbSpin { to { transform: rotate(360deg); } }
        .hb-disc-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: #0d0d14;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0;
        }
        .hb-disc-val {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 900;
          background: linear-gradient(135deg, #fb923c, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          line-height: 1;
        }
        .hb-disc-off {
          font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.50);
          letter-spacing: .10em; text-transform: uppercase;
        }

        /* CTA */
        .hb-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; text-decoration: none;
          padding: 12px 26px; border-radius: 12px;
          font-size: 14px; font-weight: 800; letter-spacing: .03em;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 0 0 0 rgba(249,115,22,0.50);
          transition: transform .22s, filter .22s;
          animation: hbCtaPulse 2.5s ease-in-out infinite;
          white-space: nowrap;
        }
        @keyframes hbCtaPulse {
          0%,100% { box-shadow: 0 4px 18px rgba(249,115,22,0.35); }
          50%      { box-shadow: 0 4px 28px rgba(249,115,22,0.60); }
        }
        .hb-cta:hover { transform: translateY(-2px) scale(1.04); filter: brightness(1.10); }
        .hb-cta-arrow { transition: transform .22s; }
        .hb-cta:hover .hb-cta-arrow { transform: translateX(4px); }

        @media(max-width:640px){
          .hb-card { padding: 22px 18px; }
          .hb-disc-ring { width:80px; height:80px; }
          .hb-disc-val  { font-size:16px; }
        }
      `}</style>

      <div className={`hb-outer ${visible ? 'hb-visible' : ''}`}>
        <div className="hb-card">
          {/* Floating orbs */}
          <div className="hb-orb hb-orb-1" />
          <div className="hb-orb hb-orb-2" />

          {/* ── LEFT: Text content ── */}
          <div className="hb-left">
            <div className="hb-tag">
              <span className="hb-tag-dot" />
              <FiZap size={11} /> Limited Time Offer
            </div>

            <h2 className="hb-headline">
              <span className="hb-headline-accent">{label}</span>
              <br />on Your Order
            </h2>

            <p className="hb-sub">
              Use code <strong>{bestCoupon.code}</strong>
              {minOrder > 0 && <> on orders above <strong>₹{minOrder.toLocaleString()}</strong></>}
            </p>

            <div className="hb-code-row">
              <span className="hb-code" onClick={handleCopy}>
                {bestCoupon.code}
              </span>
              <button className={`hb-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                {copied
                  ? <><FiCheck size={12} /> Copied!</>
                  : <><FiCopy  size={12} /> Copy Code</>
                }
              </button>
            </div>
          </div>

          {/* ── RIGHT: Disc + CTA ── */}
          <div className="hb-right">
            <div className="hb-disc-ring">
              <div className="hb-disc-inner">
                <span className="hb-disc-val">{label}</span>
                <span className="hb-disc-off">discount</span>
              </div>
            </div>
            <Link to="/products" className="hb-cta">
              Shop Now <FiArrowRight size={14} className="hb-cta-arrow" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroBanner;