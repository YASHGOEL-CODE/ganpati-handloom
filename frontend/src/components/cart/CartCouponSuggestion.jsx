import React, { useState, useEffect } from 'react';
import { FiGift, FiZap, FiUnlock, FiArrowRight, FiAlertCircle, FiClock } from 'react-icons/fi';

/*
  Props:
    subtotal         — current cart subtotal (number)
    availableCoupons — array from API: { code, discount, minOrderValue,
                        eligible, shortfall, isActive, expiryDate,
                        discountType, discountValue, description }
    onApply          — function(code) — calls existing handleApplyCoupon
*/

/* No local fallback — only show coupons from backend API. */

/* ── Determine coupon status ── */
const getStatus = (c) => {
  if (c.isActive === false)                                 return 'inactive';
  if (c.expiryDate && new Date() > new Date(c.expiryDate)) return 'expired';
  return 'active';
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
  : '';

const CartCouponSuggestion = ({ subtotal = 0, availableCoupons = [], onApply }) => {
  const [activeIdx,   setActiveIdx]   = useState(0);
  const [justApplied, setJustApplied] = useState(false);

  // Only use coupons from the backend — never inject hardcoded fallbacks.
  // Backend already filters: isActive=true, expiryDate > now, usageLimit not exceeded.
  const coupons = availableCoupons.map(c => ({
    code:          c.code,
    discountType:  c.discountType || 'flat',
    discount:      c.discountType === 'percentage' ? c.discountValue : (c.discount || c.discountValue || 0),
    minOrderValue: c.minOrderValue || 0,
    isActive:      c.isActive !== false,
    expiryDate:    c.expiryDate || null,
    description:   c.description || '',
  }));

  // Cycle only among active coupons — disabled ones stay put
  useEffect(() => {
    if (coupons.length <= 1) return;
    const timer = setInterval(() => setActiveIdx(i => (i + 1) % coupons.length), 4000);
    return () => clearInterval(timer);
  }, [coupons.length]);

  // If no coupons from API, render nothing — no hardcoded fallback
  if (coupons.length === 0) return null;
  const coupon = coupons[Math.min(activeIdx, coupons.length - 1)] || coupons[0];
  if (!coupon) return null;

  const status       = getStatus(coupon);
  const isInactive   = status === 'inactive';
  const isExpired    = status === 'expired';
  const isDisabled   = isInactive || isExpired;

  const minAmt        = coupon.minOrderValue || 0;
  const remaining     = Math.max(0, minAmt - subtotal);
  const progress      = minAmt > 0 ? Math.min((subtotal / minAmt) * 100, 100) : 100;
  const isUnlocked    = !isDisabled && subtotal >= minAmt;
  const isAlmost      = !isDisabled && !isUnlocked && progress >= 80;
  const discountLabel = coupon.discountType === 'percentage' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`;

  const handleApply = () => {
    if (isDisabled || !isUnlocked || !onApply) return;
    onApply(coupon.code);
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 2000);
  };

  // Visual tokens per state
  const borderClr   = isDisabled ? 'rgba(255,255,255,0.06)'
                    : isUnlocked ? 'rgba(74,222,128,0.28)'
                    : isAlmost   ? 'rgba(249,115,22,0.35)'
                    :              'rgba(255,255,255,0.08)';
  const glowShadow  = isUnlocked ? '0 0 20px rgba(74,222,128,0.12)'
                    : isAlmost   ? '0 0 20px rgba(249,115,22,0.14)'
                    :              'none';
  const topGradient = isDisabled ? 'linear-gradient(90deg,rgba(239,68,68,0.35),transparent)'
                    : isUnlocked ? 'linear-gradient(90deg,#4ade80,transparent)'
                    : isAlmost   ? 'linear-gradient(90deg,#f97316,transparent)'
                    :              'linear-gradient(90deg,rgba(255,255,255,0.12),transparent)';
  const iconBg      = isDisabled ? 'rgba(255,255,255,0.05)'
                    : isUnlocked ? 'rgba(74,222,128,0.14)'
                    : isAlmost   ? 'rgba(249,115,22,0.14)'
                    :              'rgba(255,255,255,0.06)';

  return (
    <>
      <style>{`
        @keyframes ccsIn   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ccsGlow { 0%,100%{box-shadow:0 0 16px rgba(249,115,22,0.14)} 50%{box-shadow:0 0 28px rgba(249,115,22,0.28)} }
        @keyframes ccsBeat { 0%,100%{opacity:1} 50%{opacity:0.68} }

        .ccs-wrap { animation:ccsIn .45s ease both; margin-bottom:14px; }

        .ccs-card {
          border-radius:14px; padding:14px 16px;
          background:rgba(255,255,255,0.04); backdrop-filter:blur(16px);
          position:relative; overflow:hidden;
          transition:border-color .3s,box-shadow .3s,opacity .3s;
        }
        .ccs-card.almost { animation:ccsGlow 2.5s ease-in-out infinite; }
        .ccs-card.disabled-card { opacity:0.55; pointer-events:auto; }

        /* Hatch pattern behind disabled cards */
        .ccs-hatch {
          position:absolute; inset:0; border-radius:14px; pointer-events:none; z-index:0;
          background:repeating-linear-gradient(
            -45deg,transparent,transparent 8px,rgba(255,255,255,0.015) 8px,rgba(255,255,255,0.015) 9px
          );
        }

        .ccs-inner { position:relative; z-index:1; }
        .ccs-top   { display:flex; align-items:flex-start; gap:11px; margin-bottom:10px; }
        .ccs-icon  { width:34px; height:34px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }

        .ccs-headline { font-size:13px; font-weight:700; color:#f1f5f9; margin-bottom:3px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
        .ccs-code-active   { font-family:monospace; font-size:12.5px; font-weight:800; padding:2px 8px; border-radius:6px; background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.22); color:#fb923c; }
        .ccs-code-disabled { font-family:monospace; font-size:12.5px; font-weight:800; padding:2px 8px; border-radius:6px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.35); text-decoration:line-through; }

        .ccs-badge-row  { display:flex; align-items:center; gap:6px; margin-bottom:3px; }
        .ccs-badge      { display:inline-flex; align-items:center; gap:3px; font-size:9.5px; font-weight:800; padding:2px 7px; border-radius:999px; text-transform:uppercase; letter-spacing:.07em; }
        .ccs-badge-exp  { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.25); color:#f87171; }
        .ccs-badge-inac { background:rgba(107,114,128,0.18); border:1px solid rgba(107,114,128,0.28); color:#9ca3af; }

        .ccs-sub          { font-size:12px; color:rgba(255,255,255,0.45); line-height:1.55; }
        .ccs-sub.almost   { color:rgba(249,115,22,0.82); animation:ccsBeat 2s ease-in-out infinite; }
        .ccs-sub.unlocked { color:rgba(74,222,128,0.82); }
        .ccs-sub.disabled { color:rgba(255,255,255,0.30); }

        .ccs-progress-wrap   { margin-top:10px; }
        .ccs-progress-labels { display:flex; justify-content:space-between; font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); margin-bottom:5px; }
        .ccs-progress-bg     { height:5px; border-radius:999px; background:rgba(255,255,255,0.07); overflow:hidden; }
        .ccs-progress-fill   { height:100%; border-radius:999px; transition:width .6s cubic-bezier(.4,0,.2,1),background .3s; }
        .ccs-fill-locked   { background:linear-gradient(90deg,rgba(255,255,255,0.22),rgba(255,255,255,0.10)); }
        .ccs-fill-almost   { background:linear-gradient(90deg,#ea580c,#f97316); }
        .ccs-fill-unlocked { background:linear-gradient(90deg,#059669,#4ade80); }

        .ccs-btn {
          width:100%; margin-top:11px; display:flex; align-items:center; justify-content:center; gap:7px;
          border:none; border-radius:10px; padding:10px; font-size:13px; font-weight:700;
          font-family:'DM Sans',sans-serif; cursor:pointer; transition:transform .2s,box-shadow .2s,filter .2s;
        }
        .ccs-btn-apply   { background:linear-gradient(135deg,#059669,#10b981); color:#fff; box-shadow:0 4px 14px rgba(5,150,105,0.28); }
        .ccs-btn-apply:hover { transform:translateY(-1px) scale(1.02); box-shadow:0 7px 20px rgba(5,150,105,0.40); filter:brightness(1.08); }
        .ccs-btn-done    { background:linear-gradient(135deg,#1d4ed8,#3b82f6); color:#fff; }
        .ccs-btn-blocked { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.10); color:rgba(255,255,255,0.28); cursor:not-allowed; }

        .ccs-dots { display:flex; justify-content:center; gap:5px; margin-top:10px; }
        .ccs-dot  { width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,0.20); transition:background .25s,transform .25s; cursor:pointer; }
        .ccs-dot.on { background:#f97316; transform:scale(1.3); }
      `}</style>

      <div className="ccs-wrap">
        <div
          className={`ccs-card ${isAlmost && !isDisabled ? 'almost' : ''} ${isDisabled ? 'disabled-card' : ''}`}
          style={{ border:`1px solid ${borderClr}`, boxShadow:glowShadow }}
        >
          {isDisabled && <div className="ccs-hatch" />}

          {/* Top colour line */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:topGradient, borderRadius:'14px 14px 0 0' }} />

          <div className="ccs-inner">
            <div className="ccs-top">
              {/* Icon */}
              <div className="ccs-icon" style={{ background:iconBg }}>
                {isDisabled   ? <FiAlertCircle size={16} color="rgba(255,255,255,0.28)" />
                : isUnlocked  ? <FiUnlock      size={16} color="#4ade80" />
                : isAlmost    ? <FiZap         size={16} color="#f97316" />
                :               <FiGift        size={16} color="rgba(255,255,255,0.40)" />}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                {/* Badge row for disabled */}
                {isDisabled && (
                  <div className="ccs-badge-row">
                    {isExpired  && <span className="ccs-badge ccs-badge-exp"><FiClock size={8} /> Expired</span>}
                    {isInactive && <span className="ccs-badge ccs-badge-inac">Inactive</span>}
                  </div>
                )}

                {/* Headline */}
                <p className="ccs-headline">
                  {isExpired   ? '❌'
                  : isInactive ? '🚫'
                  : isUnlocked ? '🎉'
                  : isAlmost   ? '🔥'
                  : '💡'}
                  {isDisabled
                    ? <span className="ccs-code-disabled">{coupon.code}</span>
                    : isUnlocked
                    ? <>You unlocked <strong style={{color:'#4ade80'}}>{discountLabel}</strong>!</>
                    : <>Save <strong style={{color:'#fb923c'}}>{discountLabel}</strong> using <span className="ccs-code-active">{coupon.code}</span></>
                  }
                </p>

                {/* Sub text */}
                <p className={`ccs-sub ${isDisabled ? 'disabled' : isUnlocked ? 'unlocked' : isAlmost ? 'almost' : ''}`}>
                  {isExpired   ? `This offer expired on ${fmtDate(coupon.expiryDate)}`
                  : isInactive ? 'This offer is no longer available'
                  : isUnlocked ? `Use code ${coupon.code} — click Apply to save`
                  : isAlmost   ? `Just ₹${remaining.toLocaleString()} away from ${discountLabel} with ${coupon.code}`
                  :              `Add ₹${remaining.toLocaleString()} more to unlock this offer`
                  }
                </p>
              </div>
            </div>

            {/* Progress bar — active + not yet unlocked only */}
            {!isDisabled && !isUnlocked && minAmt > 0 && (
              <div className="ccs-progress-wrap">
                <div className="ccs-progress-labels">
                  <span>₹{subtotal.toLocaleString()}</span>
                  <span>₹{minAmt.toLocaleString()} needed</span>
                </div>
                <div className="ccs-progress-bg">
                  <div className={`ccs-progress-fill ${isAlmost ? 'ccs-fill-almost' : 'ccs-fill-locked'}`} style={{ width:`${progress}%` }} />
                </div>
              </div>
            )}

            {/* Action button */}
            {isDisabled ? (
              <button className="ccs-btn ccs-btn-blocked" disabled>
                <FiAlertCircle size={13} />
                {isExpired ? 'Coupon Expired' : 'Coupon Inactive'}
              </button>
            ) : isUnlocked ? (
              <button className={`ccs-btn ${justApplied ? 'ccs-btn-done' : 'ccs-btn-apply'}`} onClick={handleApply}>
                {justApplied
                  ? <>✓ Coupon Applied!</>
                  : <>Apply {coupon.code} &amp; Save {discountLabel} <FiArrowRight size={13} /></>
                }
              </button>
            ) : null}
          </div>
        </div>

        {/* Dot indicators */}
        {coupons.length > 1 && (
          <div className="ccs-dots">
            {coupons.map((_, i) => (
              <div key={i} className={`ccs-dot ${i === activeIdx ? 'on' : ''}`} onClick={() => setActiveIdx(i)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CartCouponSuggestion;