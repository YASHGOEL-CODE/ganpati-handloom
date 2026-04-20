import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const useScrollGlow = () => {
  const ref = useRef(null);
  const [state, setState] = useState('hidden');
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setState('visible');
      else setState(e.boundingClientRect.top < 0 ? 'past' : 'hidden');
    }, { threshold: 0.12 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, state];
};

const GlowSection = ({ children, delay = 0 }) => {
  const [ref, state] = useScrollGlow();
  return (
    <div ref={ref} style={{
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      opacity: state === 'visible' ? 1 : 0,
      transform: state === 'hidden' ? 'translateY(36px)' : state === 'past' ? 'translateY(-14px)' : 'translateY(0)',
    }}>{children}</div>
  );
};

const categories = [
  { name:'Bedsheets',   icon:'🛏️', link:'/products?productType=bedsheet' },
  { name:'Pillows',     icon:'🛋️', link:'/products?productType=pillow' },
  { name:'Sofa Covers', icon:'🪑', link:'/products?productType=sofa-cover' },
  { name:'Blankets',    icon:'🧣', link:'/products?productType=blanket' },
  { name:'Quilts',      icon:'🛌', link:'/products?productType=quilt' },
  { name:'Curtains',    icon:'🪟', link:'/products?productType=curtain' },
  { name:'Door Mats',   icon:'🚪', link:'/products?productType=door-mat' },
  { name:'View All',    icon:'🔍', link:'/products' },
];

const CategoryNavigation = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      .cat-pg {
        padding:72px 24px;
        background: radial-gradient(circle at 70% 30%, rgba(249,115,22,0.05) 0%, transparent 50%),
                    linear-gradient(160deg,#020617 0%,#000 50%,#0f172a 100%);
        font-family:'DM Sans',sans-serif;
      }
      .cat-inner { max-width:1280px; margin:0 auto; }
      .cat-hdr { text-align:center; margin-bottom:42px; }
      .cat-eyebrow {
        display:inline-flex; align-items:center; gap:8px;
        font-size:11px; font-weight:700; color:#f97316;
        letter-spacing:.15em; text-transform:uppercase; margin-bottom:12px;
      }
      .cat-eyebrow::before,.cat-eyebrow::after{content:'';display:inline-block;width:18px;height:1.5px;background:#f97316;}
      .cat-title {
        font-family:'Playfair Display',serif;
        font-size:clamp(24px,3vw,38px); font-weight:800; color:#fff; line-height:1.15; margin-bottom:8px;
      }
      .cat-sub { font-size:14.5px; color:rgba(255,255,255,0.40); }
      .cat-grid {
        display:grid; grid-template-columns:repeat(2,1fr); gap:14px;
      }
      @media(min-width:480px){ .cat-grid{grid-template-columns:repeat(4,1fr);} }
      @media(min-width:1024px){ .cat-grid{grid-template-columns:repeat(8,1fr);} }

      .cat-card {
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        padding:22px 12px; text-decoration:none;
        background:rgba(255,255,255,0.04); backdrop-filter:blur(16px);
        border:1px solid rgba(255,255,255,0.07); border-radius:18px;
        transition:transform .28s,box-shadow .28s,border-color .28s,background .28s;
        position:relative; overflow:hidden;
      }
      .cat-card::before {
        content:''; position:absolute; top:0; left:0; right:0; height:2px;
        background:linear-gradient(90deg,#f97316,transparent);
        border-radius:18px 18px 0 0; opacity:0; transition:opacity .28s;
      }
      .cat-card:hover {
        transform:translateY(-7px) scale(1.04);
        box-shadow:0 18px 44px rgba(0,0,0,0.40), 0 0 0 1px rgba(249,115,22,0.22), 0 0 24px rgba(249,115,22,0.10);
        border-color:rgba(249,115,22,0.30);
        background:rgba(249,115,22,0.06);
      }
      .cat-card:hover::before { opacity:1; }
      .cat-icon {
        font-size:36px; margin-bottom:10px;
        transition:transform .28s; line-height:1;
      }
      .cat-card:hover .cat-icon { transform:scale(1.22) rotate(-4deg); }
      .cat-name {
        font-size:12.5px; font-weight:700; color:rgba(255,255,255,0.60);
        text-align:center; line-height:1.3; transition:color .2s;
      }
      .cat-card:hover .cat-name { color:#fb923c; }
    `}</style>
    <section className="cat-pg">
      <div className="cat-inner">
        <GlowSection>
          <div className="cat-hdr">
            <p className="cat-eyebrow">Browse</p>
            <h2 className="cat-title">Shop by Category</h2>
            <p className="cat-sub">Find exactly what you're looking for</p>
          </div>
        </GlowSection>
        <GlowSection delay={80}>
          <div className="cat-grid">
            {categories.map((cat, i) => (
              <Link key={i} to={cat.link} className="cat-card">
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </GlowSection>
      </div>
    </section>
  </>
);

export default CategoryNavigation;