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
    }, { threshold: 0.10 });
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

const banners = [
  { emoji:'🪔', title:'Diwali Sale',       desc:'Up to 40% off on festive collection',          link:'/products?collection=diwali',         btnText:'Shop Now', btnColor:'#c2410c', gradient:'linear-gradient(135deg,#f59e0b 0%,#ea580c 50%,#c2410c 100%)', glowColor:'rgba(234,88,12,0.40)' },
  { emoji:'💐', title:'Wedding Season',    desc:'Premium handloom for special occasions',        link:'/products?collection=wedding-special', btnText:'Explore',  btnColor:'#065f46', gradient:'linear-gradient(135deg,#059669 0%,#047857 50%,#065f46 100%)', glowColor:'rgba(5,150,105,0.40)'  },
  { emoji:'❄️', title:'Winter Collection', desc:'Cozy quilts and warm blankets',                link:'/products?collection=winter-quilt',   btnText:'Browse',   btnColor:'#1e3a5f', gradient:'linear-gradient(135deg,#64748b 0%,#334155 50%,#1e293b 100%)', glowColor:'rgba(51,65,85,0.40)'   },
];

const FestivalBanner = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      .fb-pg {
        padding:16px 24px 72px;
        background: radial-gradient(circle at 50% 0%, rgba(249,115,22,0.06) 0%, transparent 55%),
                    linear-gradient(160deg,#000 0%,#020617 60%,#0f172a 100%);
        font-family:'DM Sans',sans-serif;
      }
      .fb-inner { max-width:1280px; margin:0 auto; }
      .fb-hdr { text-align:center; margin-bottom:34px; }
      .fb-eyebrow {
        display:inline-flex; align-items:center; gap:8px;
        font-size:11px; font-weight:700; color:#f97316;
        letter-spacing:.15em; text-transform:uppercase; margin-bottom:12px;
      }
      .fb-eyebrow::before,.fb-eyebrow::after{content:'';display:inline-block;width:18px;height:1.5px;background:#f97316;}
      .fb-title {
        font-family:'Playfair Display',serif;
        font-size:clamp(24px,3vw,38px); font-weight:800; color:#fff;
      }
      .fb-grid { display:grid; grid-template-columns:1fr; gap:18px; }
      @media(min-width:768px){ .fb-grid{grid-template-columns:repeat(3,1fr);} }

      .fb-card {
        position:relative; overflow:hidden; border-radius:22px;
        padding:36px 28px; text-decoration:none; display:block; min-height:210px;
        border:1px solid rgba(255,255,255,0.08);
        transition:transform .30s,box-shadow .30s,border-color .30s;
      }
      .fb-card:hover { transform:translateY(-8px); border-color:rgba(255,255,255,0.18); }
      .fb-bg-emoji {
        position:absolute; right:-10px; top:-10px; font-size:130px;
        opacity:0.10; line-height:1; transition:transform .35s,opacity .35s;
        pointer-events:none;
      }
      .fb-card:hover .fb-bg-emoji { transform:scale(1.14) rotate(8deg); opacity:0.18; }
      .fb-shimmer {
        position:absolute; inset:0;
        background:linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.10) 50%,rgba(255,255,255,0) 60%);
        background-size:200% 100%; transition:background-position .6s;
      }
      .fb-card:hover .fb-shimmer { background-position:-100% 0; }
      /* Glass overlay strip */
      .fb-glass-strip {
        position:absolute; top:0; left:0; right:0; height:2px;
        background:rgba(255,255,255,0.25);
      }
      .fb-content { position:relative; z-index:2; }
      .fb-badge {
        display:inline-block; background:rgba(255,255,255,0.18); backdrop-filter:blur(6px);
        color:#fff; font-size:11px; font-weight:700; letter-spacing:.10em;
        text-transform:uppercase; padding:4px 12px; border-radius:999px;
        margin-bottom:14px; border:1px solid rgba(255,255,255,0.22);
      }
      .fb-card-title {
        font-family:'Playfair Display',serif;
        font-size:26px; font-weight:800; color:#fff; margin-bottom:8px;
        line-height:1.15; display:flex; align-items:center; gap:10px;
      }
      .fb-card-desc { font-size:14px; color:rgba(255,255,255,0.80); margin-bottom:22px; line-height:1.55; }
      .fb-btn {
        display:inline-flex; align-items:center; gap:6px; background:#fff;
        font-size:13px; font-weight:700; padding:10px 20px; border-radius:11px;
        transition:transform .2s,box-shadow .2s;
      }
      .fb-btn:hover { transform:scale(1.05); box-shadow:0 6px 18px rgba(0,0,0,0.25); }
      .fb-arrow { font-size:16px; transition:transform .2s; }
      .fb-card:hover .fb-arrow { transform:translateX(3px); }
    `}</style>
    <section className="fb-pg">
      <div className="fb-inner">
        <GlowSection>
          <div className="fb-hdr">
            <p className="fb-eyebrow">Special Offers</p>
            <h2 className="fb-title">Festive Collections</h2>
          </div>
        </GlowSection>
        <div className="fb-grid">
          {banners.map((b, i) => (
            <GlowSection key={i} delay={i * 80}>
              <Link to={b.link} className="fb-card" style={{ background:b.gradient, boxShadow:`0 8px 36px ${b.glowColor}` }}>
                <div className="fb-glass-strip" />
                <div className="fb-shimmer" />
                <div className="fb-bg-emoji">{b.emoji}</div>
                <div className="fb-content">
                  <span className="fb-badge">Limited Time</span>
                  <h3 className="fb-card-title"><span>{b.emoji}</span>{b.title}</h3>
                  <p className="fb-card-desc">{b.desc}</p>
                  <span className="fb-btn" style={{ color:b.btnColor }}>
                    {b.btnText}<span className="fb-arrow">→</span>
                  </span>
                </div>
              </Link>
            </GlowSection>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default FestivalBanner;