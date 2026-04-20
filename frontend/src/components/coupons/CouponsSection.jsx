import React from 'react';
import useCoupons from '../../hooks/useCoupons';
import HeroBanner from './HeroBanner';
import CouponCard from './CouponCard';

/*
  CouponsSection:
  - Renders HeroBanner (best coupon)
  - Renders up to 3 coupon cards below it
  - Horizontal scroll on mobile, 3-col grid on desktop
  - Returns null when no valid coupons — zero layout shift
*/
const CouponsSection = () => {
  const { coupons, loading, discountLabel, isNearExpiry } = useCoupons(3);

  if (loading || coupons.length === 0) return null;

  // Cards exclude the best coupon shown in HeroBanner (already shown there)
  const cardCoupons = coupons.slice(1);

  return (
    <>
      <style>{`
        .ccs-section {
          max-width: 1280px; margin: 0 auto;
          padding: 20px 28px 0;
        }
        @media(max-width:640px){ .ccs-section { padding: 16px 14px 0; } }

        /* Section header */
        .ccs-hdr { margin-bottom: 18px; }
        .ccs-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; color: #f97316;
          letter-spacing: .14em; text-transform: uppercase; margin-bottom: 8px;
        }
        .ccs-eyebrow::before {
          content: ''; display: inline-block;
          width: 12px; height: 1.5px; background: #f97316;
        }
        .ccs-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(20px, 2.5vw, 28px); font-weight: 800;
          color: #fff; line-height: 1.15;
        }
        .ccs-sub {
          font-size: 13.5px; color: rgba(255,255,255,0.36);
          margin-top: 4px;
        }

        /* Cards grid / scroll */
        .ccs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }
        @media(max-width:640px){
          .ccs-grid {
            display: flex; gap: 14px;
            overflow-x: auto; scrollbar-width: none;
            padding-bottom: 6px;
            scroll-snap-type: x mandatory;
          }
          .ccs-grid::-webkit-scrollbar { display:none; }
          .ccs-grid > * {
            min-width: 230px; scroll-snap-align: start;
          }
        }
      `}</style>

      {/* Hero banner always shows the best coupon */}
      <HeroBanner />

      {/* Additional coupon cards — only when 2+ coupons exist */}
      {cardCoupons.length > 0 && (
        <div className="ccs-section">
          <div className="ccs-hdr">
            <p className="ccs-eyebrow">More Offers</p>
            <h2 className="ccs-title">More Ways to Save</h2>
            <p className="ccs-sub">Apply these codes at checkout</p>
          </div>
          <div className="ccs-grid">
            {cardCoupons.map((coupon, i) => (
              <CouponCard
                key={coupon.code}
                coupon={coupon}
                discountLabel={discountLabel}
                isNearExpiry={isNearExpiry}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CouponsSection;