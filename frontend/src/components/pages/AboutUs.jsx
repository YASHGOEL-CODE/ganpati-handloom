import React, { useEffect, useRef, useState } from 'react';
import { FiHeart, FiUsers, FiAward, FiGlobe, FiFeather, FiShield, FiZap, FiDroplet } from 'react-icons/fi';

const useScrollGlow = () => {
  const ref = useRef(null);
  const [state, setState] = useState('hidden');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setState('visible');
        else if (entry.boundingClientRect.top < 0) setState('past');
        else setState('hidden');
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, state];
};

const GlowSection = ({ children, delay = 0, className = '' }) => {
  const [ref, state] = useScrollGlow();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        opacity:   state === 'visible' ? 1 : 0,
        transform: state === 'hidden' ? 'translateY(36px)' : state === 'past' ? 'translateY(-16px)' : 'translateY(0)',
      }}
    >
      {children}
    </div>
  );
};

const AboutUs = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        /* ── PAGE — updated to match design system ── */
        .ab-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 10%, rgba(249,115,22,0.07) 0%, transparent 55%),
            radial-gradient(circle at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 55%),
            linear-gradient(160deg, #0f172a 0%, #000000 50%, #020617 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 0 0 100px;
          overflow-x: hidden;
        }

        /* ── HERO — completely unchanged ── */
        .ab-hero {
          position: relative; text-align: center;
          padding: 100px 24px 80px; overflow: hidden;
        }
        .ab-hero-bg {
          position: absolute; inset: 0;
          background-image: url('https://images.unsplash.com/photo-1600166898405-da9535204843?w=1400&q=85');
          background-size: cover; background-position: center;
          animation: heroBgZoom 22s ease-in-out infinite alternate; z-index: 0;
        }
        @keyframes heroBgZoom { from { transform: scale(1); } to { transform: scale(1.07); } }
        .ab-hero-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(160deg, rgba(6,11,23,0.91) 0%, rgba(13,21,37,0.84) 50%, rgba(6,11,23,0.93) 100%);
        }
        .ab-hero::before {
          content: ''; position: absolute;
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(234,88,12,0.14) 0%, transparent 70%);
          top: -200px; left: 50%; transform: translateX(-50%);
          pointer-events: none; z-index: 2;
          animation: heroPulse 6s ease-in-out infinite alternate;
        }
        @keyframes heroPulse {
          from { transform: translateX(-50%) scale(1); opacity: 0.8; }
          to   { transform: translateX(-50%) scale(1.15); opacity: 1; }
        }
        .ab-hero > *:not(.ab-hero-bg):not(.ab-hero-overlay) { position: relative; z-index: 3; }
        .ab-hero-om {
          display: inline-flex; align-items: center; justify-content: center;
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          font-size: 20px; box-shadow: 0 0 40px rgba(234,88,12,0.45);
          margin-bottom: 28px; animation: omFloat 4s ease-in-out infinite;
        }
        @keyframes omFloat {
          0%,100% { transform: translateY(0); box-shadow: 0 0 40px rgba(234,88,12,0.45); }
          50%      { transform: translateY(-8px); box-shadow: 0 12px 50px rgba(234,88,12,0.60); }
        }
        .ab-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11.5px; font-weight: 700; color: #ea580c;
          letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 16px;
        }
        .ab-hero-eyebrow::before, .ab-hero-eyebrow::after {
          content: ''; display: inline-block; width: 20px; height: 1.5px; background: #ea580c;
        }
        .ab-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 5vw, 64px); font-weight: 800; color: #fff;
          line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 18px;
          animation: heroTitleIn 0.9s ease both;
        }
        @keyframes heroTitleIn {
          from { opacity:0; transform: translateY(32px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .ab-hero-sub {
          font-size: clamp(15px, 2vw, 19px); color: rgba(255,255,255,0.48);
          max-width: 520px; margin: 0 auto; line-height: 1.7;
          animation: heroTitleIn 0.9s ease 0.2s both;
        }
        .ab-hero-line {
          width: 60px; height: 3px; border-radius: 3px;
          background: linear-gradient(90deg, transparent, #ea580c, transparent);
          margin: 24px auto 0; animation: heroTitleIn 0.9s ease 0.35s both;
        }

        /* ── WRAP ── */
        .ab-wrap { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
        @media (max-width: 640px) { .ab-wrap { padding: 0 16px; } }
        .ab-section { margin-bottom: 80px; }

        /* ── SECTION HEADERS ── */
        .ab-sec-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; color: #f97316;
          letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 10px;
        }
        .ab-sec-eyebrow::before {
          content: ''; display: inline-block; width: 20px; height: 2px;
          background: linear-gradient(90deg, #f97316, transparent); border-radius: 2px;
        }
        .ab-sec-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 3vw, 38px); font-weight: 800; color: #fff;
          line-height: 1.12; margin-bottom: 8px;
        }
        .ab-sec-sub { font-size: 15px; color: rgba(255,255,255,0.40); margin-bottom: 40px; line-height: 1.65; }
        .ab-sec-header-center { text-align: center; }

        /* ── STATS STRIP ── */
        .ab-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 80px; }
        @media (max-width: 768px) { .ab-stats { grid-template-columns: repeat(2,1fr); } }
        .ab-stat {
          text-align: center;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 28px 16px;
          position: relative; overflow: hidden;
          transition: transform 0.28s, box-shadow 0.28s, border-color 0.28s;
          backdrop-filter: blur(12px);
        }
        .ab-stat::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #f97316, transparent);
          border-radius: 18px 18px 0 0; opacity: 0; transition: opacity 0.28s;
        }
        .ab-stat:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(249,115,22,0.18); border-color: rgba(249,115,22,0.25); }
        .ab-stat:hover::before { opacity: 1; }
        .ab-stat-val {
          font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 800;
          background: linear-gradient(90deg, #fb923c, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          line-height: 1; margin-bottom: 8px;
        }
        .ab-stat-lbl { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.40); text-transform: uppercase; letter-spacing: 0.06em; }

        /* ── DIVIDER ── */
        .ab-divider { height: 1px; margin: 0 0 80px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent); }

        /* ── MISSION / VISION CARDS ── */
        .ab-mv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
        @media (max-width: 768px) { .ab-mv-grid { grid-template-columns: 1fr; } }
        .ab-mv-card {
          background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px; padding: 36px 32px; position: relative; overflow: hidden;
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
          backdrop-filter: blur(16px);
        }
        .ab-mv-card:hover { transform: translateY(-6px); }
        .ab-mv-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 22px 22px 0 0; opacity: 0; transition: opacity 0.28s; }
        .ab-mv-card:hover::before { opacity: 1; }
        .ab-mv-card.orange::before { background: linear-gradient(90deg, #ea580c, transparent); }
        .ab-mv-card.orange:hover   { border-color: rgba(234,88,12,0.28); box-shadow: 0 24px 56px rgba(0,0,0,0.40), 0 0 0 1px rgba(234,88,12,0.14); }
        .ab-mv-card.green::before  { background: linear-gradient(90deg, #059669, transparent); }
        .ab-mv-card.green:hover    { border-color: rgba(5,150,105,0.28); box-shadow: 0 24px 56px rgba(0,0,0,0.40), 0 0 0 1px rgba(5,150,105,0.14); }
        .ab-mv-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 22px; transition: transform 0.28s ease; }
        .ab-mv-card:hover .ab-mv-icon { transform: scale(1.12) rotate(-6deg); }
        .ab-mv-icon.orange { background: rgba(234,88,12,0.14); border: 1px solid rgba(234,88,12,0.25); box-shadow: 0 0 20px rgba(234,88,12,0.12); }
        .ab-mv-icon.green  { background: rgba(5,150,105,0.14); border: 1px solid rgba(5,150,105,0.25); box-shadow: 0 0 20px rgba(5,150,105,0.12); }
        .ab-mv-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 14px; }
        .ab-mv-text  { font-size: 15px; color: rgba(255,255,255,0.52); line-height: 1.80; }

        /* ── CORE VALUES ── */
        .ab-values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 768px) { .ab-values-grid { grid-template-columns: 1fr; } }
        @media (min-width: 480px) and (max-width: 768px) { .ab-values-grid { grid-template-columns: repeat(3,1fr); } }
        .ab-val-card {
          background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 32px 24px; text-align: center;
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
          position: relative; overflow: hidden; backdrop-filter: blur(12px);
        }
        .ab-val-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 20px 20px 0 0; opacity: 0; transition: opacity 0.28s; }
        .ab-val-card::after  { content: ''; position: absolute; inset: 0; border-radius: 20px; opacity: 0; transition: opacity 0.28s; pointer-events: none; }
        .ab-val-card:hover { transform: translateY(-7px); }
        .ab-val-card:hover::before, .ab-val-card:hover::after { opacity: 1; }
        .ab-val-card.orange::before { background: linear-gradient(90deg, #ea580c, transparent); }
        .ab-val-card.orange:hover   { box-shadow: 0 20px 48px rgba(234,88,12,0.20); border-color: rgba(234,88,12,0.28); }
        .ab-val-card.orange::after  { background: radial-gradient(circle at 50% 100%, rgba(234,88,12,0.07), transparent); }
        .ab-val-card.green::before  { background: linear-gradient(90deg, #059669, transparent); }
        .ab-val-card.green:hover    { box-shadow: 0 20px 48px rgba(5,150,105,0.20); border-color: rgba(5,150,105,0.28); }
        .ab-val-card.green::after   { background: radial-gradient(circle at 50% 100%, rgba(5,150,105,0.07), transparent); }
        .ab-val-card.gold::before   { background: linear-gradient(90deg, #d97706, transparent); }
        .ab-val-card.gold:hover     { box-shadow: 0 20px 48px rgba(217,119,6,0.20); border-color: rgba(217,119,6,0.28); }
        .ab-val-card.gold::after    { background: radial-gradient(circle at 50% 100%, rgba(217,119,6,0.07), transparent); }
        .ab-val-icon { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; transition: transform 0.28s ease, box-shadow 0.28s ease; }
        .ab-val-card:hover .ab-val-icon { transform: scale(1.15) rotate(-8deg); }
        .ab-val-icon.orange { background: linear-gradient(135deg, rgba(234,88,12,0.22), rgba(249,115,22,0.12)); border: 1px solid rgba(234,88,12,0.28); }
        .ab-val-card:hover .ab-val-icon.orange { box-shadow: 0 0 28px rgba(234,88,12,0.32); }
        .ab-val-icon.green  { background: linear-gradient(135deg, rgba(5,150,105,0.22), rgba(16,185,129,0.12)); border: 1px solid rgba(5,150,105,0.28); }
        .ab-val-card:hover .ab-val-icon.green  { box-shadow: 0 0 28px rgba(5,150,105,0.32); }
        .ab-val-icon.gold   { background: linear-gradient(135deg, rgba(217,119,6,0.22), rgba(245,158,11,0.12)); border: 1px solid rgba(217,119,6,0.28); }
        .ab-val-card:hover .ab-val-icon.gold   { box-shadow: 0 0 28px rgba(217,119,6,0.32); }
        .ab-val-title { font-size: 17px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; }
        .ab-val-text  { font-size: 13.5px; color: rgba(255,255,255,0.45); line-height: 1.65; }

        /* ── QUALITY PROMISE ── */
        .ab-quality-card {
          position: relative; overflow: hidden; border-radius: 24px; padding: 56px 52px;
          background: linear-gradient(135deg, #ea580c 0%, #f97316 45%, #d97706 100%);
          box-shadow: 0 20px 60px rgba(234,88,12,0.38);
        }
        .ab-quality-card::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Crect x='0' y='0' width='1' height='40'/%3E%3Crect x='20' y='0' width='1' height='40'/%3E%3Crect x='0' y='0' width='40' height='1'/%3E%3Crect x='0' y='20' width='40' height='1'/%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
        .ab-quality-title { font-family: 'Playfair Display', serif; font-size: clamp(24px, 3vw, 34px); font-weight: 800; color: #fff; text-align: center; margin-bottom: 40px; position: relative; z-index: 1; }
        .ab-quality-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; position: relative; z-index: 1; }
        @media (max-width: 640px) { .ab-quality-grid { grid-template-columns: 1fr; } }
        .ab-quality-item { display: flex; align-items: flex-start; gap: 14px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.20); border-radius: 14px; padding: 18px 20px; backdrop-filter: blur(8px); transition: background 0.22s, transform 0.22s; }
        .ab-quality-item:hover { background: rgba(255,255,255,0.20); transform: translateY(-3px); }
        .ab-quality-check { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; font-weight: 800; color: #fff; }
        .ab-quality-item-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .ab-quality-item-text  { font-size: 13px; color: rgba(255,255,255,0.80); line-height: 1.55; }
        @media (max-width: 640px) { .ab-quality-card { padding: 36px 22px; } }

        /* ── SUSTAINABILITY ── */
        .ab-sus-intro { font-size: 16px; color: rgba(255,255,255,0.48); line-height: 1.80; margin-bottom: 32px; }
        .ab-sus-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        @media (max-width: 640px) { .ab-sus-grid { grid-template-columns: 1fr; } }
        .ab-sus-card {
          border-radius: 18px; padding: 26px 24px; position: relative; overflow: hidden;
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
          background: rgba(22,163,74,0.06); border: 1px solid rgba(22,163,74,0.18);
          backdrop-filter: blur(12px);
        }
        .ab-sus-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(22,163,74,0.16), 0 0 0 1px rgba(22,163,74,0.25); border-color: rgba(22,163,74,0.35); }
        .ab-sus-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #16a34a, transparent); border-radius: 18px 18px 0 0; opacity: 0; transition: opacity 0.28s; }
        .ab-sus-card:hover::before { opacity: 1; }
        .ab-sus-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(22,163,74,0.15); border: 1px solid rgba(22,163,74,0.25); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; transition: transform 0.28s, box-shadow 0.28s; }
        .ab-sus-card:hover .ab-sus-icon { transform: scale(1.12) rotate(-6deg); box-shadow: 0 0 18px rgba(22,163,74,0.28); }
        .ab-sus-title { font-size: 16px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
        .ab-sus-text  { font-size: 13.5px; color: rgba(255,255,255,0.48); line-height: 1.65; }
      `}</style>

      <div className="ab-page">

        {/* ── HERO — completely unchanged ── */}
        <div className="ab-hero">
          <div className="ab-hero-bg" />
          <div className="ab-hero-overlay" />
          <div className="ab-hero-om">🕉️</div>
          <p className="ab-hero-eyebrow">Our Story</p>
          <h1 className="ab-hero-title">About Ganpati Handloom</h1>
          <p className="ab-hero-sub">Weaving traditions, creating futures — one thread at a time</p>
          <div className="ab-hero-line" />
        </div>

        <div className="ab-wrap">

          {/* ── STATS STRIP ── */}
          <GlowSection delay={0}>
            <div className="ab-stats" style={{ marginTop: 56 }}>
              {[
                { val: '200+',  lbl: 'Skilled Artisans' },
                { val: '5000+', lbl: 'Products' },
                { val: '25+',   lbl: 'Years of Heritage' },
                { val: '50K+',  lbl: 'Happy Customers' },
              ].map((s, i) => (
                <div key={i} className="ab-stat">
                  <div className="ab-stat-val">{s.val}</div>
                  <div className="ab-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </GlowSection>

          <div className="ab-divider" style={{ height:1, margin:'0 0 80px', background:'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)' }} />

          {/* ── MISSION & VISION ── */}
          <GlowSection delay={0} className="ab-section">
            <p className="ab-sec-eyebrow">Who We Are</p>
            <h2 className="ab-sec-title">Mission & Vision</h2>
            <p className="ab-sec-sub">Driven by purpose, guided by heritage</p>
            <div className="ab-mv-grid">
              <GlowSection delay={80}>
                <div className="ab-mv-card orange" style={{ height: '100%' }}>
                  <div className="ab-mv-icon orange"><FiHeart size={26} color="#ea580c" strokeWidth={2} /></div>
                  <h3 className="ab-mv-title">Our Mission</h3>
                  <p className="ab-mv-text">To preserve and promote India's rich handloom heritage by connecting skilled artisans with conscious consumers, ensuring fair trade, sustainable practices, and the continuation of traditional craftsmanship for generations to come.</p>
                </div>
              </GlowSection>
              <GlowSection delay={160}>
                <div className="ab-mv-card green" style={{ height: '100%' }}>
                  <div className="ab-mv-icon green"><FiGlobe size={26} color="#059669" strokeWidth={2} /></div>
                  <h3 className="ab-mv-title">Our Vision</h3>
                  <p className="ab-mv-text">To become India's most trusted handloom brand, recognized globally for authentic products, ethical practices, and positive social impact. We envision a future where every home celebrates the beauty of handcrafted textiles.</p>
                </div>
              </GlowSection>
            </div>
          </GlowSection>

          {/* ── CORE VALUES ── */}
          <GlowSection delay={0} className="ab-section">
            <div className="ab-sec-header-center">
              <p className="ab-sec-eyebrow" style={{ justifyContent:'center' }}>What We Stand For</p>
              <h2 className="ab-sec-title">Our Core Values</h2>
              <p className="ab-sec-sub">The principles that guide every thread we weave</p>
            </div>
            <div className="ab-values-grid">
              {[
                { icon: FiAward, color: 'orange', iconColor: '#ea580c', title: 'Authenticity',   text: '100% genuine handloom products crafted by skilled artisans using traditional techniques' },
                { icon: FiUsers, color: 'green',  iconColor: '#059669', title: 'Fair Trade',     text: 'Fair wages and safe working conditions for all our artisan partners' },
                { icon: FiHeart, color: 'gold',   iconColor: '#d97706', title: 'Sustainability', text: 'Eco-friendly production methods with zero carbon footprint and biodegradable materials' },
              ].map((v, i) => {
                const Icon = v.icon;
                return (
                  <GlowSection key={i} delay={i * 100}>
                    <div className={`ab-val-card ${v.color}`} style={{ height: '100%' }}>
                      <div className={`ab-val-icon ${v.color}`}><Icon size={30} color={v.iconColor} strokeWidth={2} /></div>
                      <h3 className="ab-val-title">{v.title}</h3>
                      <p className="ab-val-text">{v.text}</p>
                    </div>
                  </GlowSection>
                );
              })}
            </div>
          </GlowSection>

          {/* ── QUALITY PROMISE ── */}
          <GlowSection delay={0} className="ab-section">
            <div className="ab-quality-card">
              <h2 className="ab-quality-title">Our Quality Promise</h2>
              <div className="ab-quality-grid">
                {[
                  { title: 'Premium Materials',     text: 'Only the finest natural fibers – cotton, silk, wool – sourced ethically' },
                  { title: 'Expert Craftsmanship',  text: 'Every product inspected by master artisans before shipping' },
                  { title: 'Durability Guaranteed', text: 'Handloom products that last for years with proper care' },
                  { title: 'Customer Satisfaction', text: '7-day return policy and dedicated customer support' },
                ].map((q, i) => (
                  <div key={i} className="ab-quality-item">
                    <div className="ab-quality-check">✓</div>
                    <div>
                      <p className="ab-quality-item-title">{q.title}</p>
                      <p className="ab-quality-item-text">{q.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlowSection>

          {/* ── SUSTAINABILITY ── */}
          <GlowSection delay={0} className="ab-section">
            <p className="ab-sec-eyebrow">Going Green</p>
            <h2 className="ab-sec-title">Sustainability & Eco-Friendly Practices</h2>
            <p className="ab-sus-intro">At Ganpati Handloom, sustainability isn't just a buzzword — it's woven into everything we do. Our commitment to the environment goes hand-in-hand with our dedication to traditional craftsmanship.</p>
            <div className="ab-sus-grid">
              {[
                { icon: FiZap,     title: 'Zero Waste Production',   text: 'Our handloom process generates minimal waste. Fabric scraps are repurposed into smaller products or composted naturally.' },
                { icon: FiDroplet, title: 'Natural Dyes',            text: 'We prioritize natural, plant-based dyes that are biodegradable and free from harmful chemicals.' },
                { icon: FiFeather, title: 'Carbon Neutral Shipping', text: 'We offset 100% of our shipping emissions through verified carbon credit programs.' },
                { icon: FiShield,  title: 'Plastic-Free Packaging',  text: 'All our products are packaged in biodegradable materials – no plastic, ever.' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <GlowSection key={i} delay={i * 80}>
                    <div className="ab-sus-card" style={{ height: '100%' }}>
                      <div className="ab-sus-icon"><Icon size={18} color="#4ade80" strokeWidth={2} /></div>
                      <h3 className="ab-sus-title">{s.title}</h3>
                      <p className="ab-sus-text">{s.text}</p>
                    </div>
                  </GlowSection>
                );
              })}
            </div>
          </GlowSection>

        </div>
      </div>
    </>
  );
};

export default AboutUs;