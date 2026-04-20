import React from 'react';
import HeroSection from './HeroSection';
import CategoryNavigation from './CategoryNavigation';
import WhyChooseUs from './WhyChooseUs';
import PersonalizedRecommendations from '../recommendations/PersonalizedRecommendations';
import TrendingProducts from '../recommendations/TrendingProducts';
import AnimatedBackground from './AnimatedBackground';
import WelcomeCouponPopup from '../coupons/WelcomeCouponPopup';
import CouponsSection from '../coupons/CouponsSection';
import CouponPopup from '../coupons/CouponPopup';
import FestiveCollectionsSection from './FestiveCollectionsSection';
import { useAuth } from '../../hooks/useAuth';
import useScrollGlow from './useScrollGlow';

/* ─────────────────────────────────────────────────
   ScrollGlowSection — completely unchanged
───────────────────────────────────────────────── */
const ScrollGlowSection = ({ children, delay = 0, offset = 44 }) => {
  const [ref, state] = useScrollGlow(0.10);

  const styles = {
    transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms, filter 0.65s ease ${delay}ms`,
    ...(state === 'sg-hidden' && {
      opacity: 0,
      transform: `translateY(${offset}px)`,
      filter: 'brightness(0.7)',
    }),
    ...(state === 'sg-visible' && {
      opacity: 1,
      transform: 'translateY(0px)',
      filter: 'brightness(1)',
    }),
    ...(state === 'sg-past' && {
      opacity: 0,
      transform: `translateY(-${Math.round(offset * 0.4)}px)`,
      filter: 'brightness(0.85)',
    }),
  };

  return (
    <div ref={ref} style={styles}>
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────────
   Home
   Changes from original:
   - FestivalBanner removed (replaced by FestiveCollectionsSection)
   - FestiveCollectionsSection added in its place
   - All other sections completely unchanged
───────────────────────────────────────────────── */
const Home = () => {
  const { user } = useAuth();

  return (
    <>
      <style>{`
        @keyframes sectionGlowIn {
          from { filter: brightness(0.75) saturate(0.9); }
          to   { filter: brightness(1)    saturate(1); }
        }
      `}</style>

      {/* Welcome coupon popup — unchanged */}
      <WelcomeCouponPopup />

      {/* Timed coupon popup — unchanged */}
      <CouponPopup />

      <div className="relative">
        <AnimatedBackground />

        {/* HeroSection — unchanged */}
        <HeroSection />

        {/* CouponsSection — unchanged */}
        <ScrollGlowSection delay={0} offset={28}>
          <CouponsSection />
        </ScrollGlowSection>

        {/* WhyChooseUs — unchanged */}
        <ScrollGlowSection delay={0} offset={48}>
          <WhyChooseUs />
        </ScrollGlowSection>

        {/* ── FestiveCollectionsSection replaces old FestivalBanner ──
            When collections exist in DB → shows admin-controlled cards
            When no collections → falls back to Best Sellers product grid */}
        <ScrollGlowSection delay={60} offset={44}>
          <FestiveCollectionsSection />
        </ScrollGlowSection>

        {/* CategoryNavigation — unchanged */}
        <ScrollGlowSection delay={0} offset={44}>
          <CategoryNavigation />
        </ScrollGlowSection>

        {/* TrendingProducts — unchanged */}
        <ScrollGlowSection delay={0} offset={52}>
          <TrendingProducts days={7} limit={8} />
        </ScrollGlowSection>

        {/* PersonalizedRecommendations — unchanged, login-gated */}
        {user && (
          <ScrollGlowSection delay={0} offset={44}>
            <PersonalizedRecommendations />
          </ScrollGlowSection>
        )}
      </div>
    </>
  );
};

export default Home;