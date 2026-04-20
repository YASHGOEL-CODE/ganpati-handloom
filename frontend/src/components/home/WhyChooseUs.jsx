import React, { useEffect, useRef, useState } from 'react';
import { FiTruck, FiRefreshCw, FiAward, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const useScrollGlow = () => {
  const ref = useRef(null);
  const [state, setState] = useState('hidden');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setState('visible');
      else setState(entry.boundingClientRect.top < 0 ? 'past' : 'hidden');
    }, { threshold: 0.12 });
    observer.observe(el);
    return () => observer.disconnect();
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
    }}>
      {children}
    </div>
  );
};

const features = [
  { icon: FiTruck,     title: 'Free Delivery',       desc: 'Free shipping on orders above ₹499. Fast and reliable delivery to your doorstep across India.',  accent: '#f97316', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.22)' },
  { icon: FiAward,     title: 'Authentic Handloom',   desc: 'Every product is handcrafted by certified artisans using traditional weaving techniques.',         accent: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.22)'  },
  { icon: FiRefreshCw, title: 'Easy Returns',          desc: "7-day hassle-free return policy. Not satisfied? We'll make it right, no questions asked.",        accent: '#4ade80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.22)'  },
  { icon: FiHeart,     title: 'Made in India',         desc: "Proudly supporting 200+ local artisans and preserving India's rich handloom heritage.",           accent: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.22)'  },
];

const WhyChooseUs = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      .wcu-pg {
        padding: 80px 24px;
        background: radial-gradient(circle at 20% 50%, rgba(249,115,22,0.06) 0%, transparent 55%),
                    radial-gradient(circle at 80% 50%, rgba(139,92,246,0.05) 0%, transparent 55%),
                    linear-gradient(160deg,#0f172a 0%,#000 50%,#020617 100%);
        font-family: 'DM Sans', sans-serif;
      }
      .wcu-inner { max-width:1280px; margin:0 auto; }
      .wcu-hdr { text-align:center; margin-bottom:52px; }
      .wcu-eyebrow {
        display:inline-flex; align-items:center; gap:8px;
        font-size:11px; font-weight:700; color:#f97316;
        letter-spacing:.15em; text-transform:uppercase; margin-bottom:12px;
      }
      .wcu-eyebrow::before,.wcu-eyebrow::after{content:'';display:inline-block;width:18px;height:1.5px;background:#f97316;}
      .wcu-title {
        font-family:'Playfair Display',serif;
        font-size:clamp(26px,3.5vw,40px); font-weight:800; color:#fff;
        line-height:1.15; margin-bottom:12px;
      }
      .wcu-sub { font-size:15px; color:rgba(255,255,255,0.42); max-width:480px; margin:0 auto; line-height:1.7; }
      .wcu-grid {
        display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:18px;
      }
      .wcu-card {
        background:rgba(255,255,255,0.04); backdrop-filter:blur(20px);
        border:1px solid rgba(255,255,255,0.08); border-radius:20px;
        padding:28px 22px; position:relative; overflow:hidden;
        transition:transform .28s,box-shadow .28s,border-color .28s;
        cursor:default;
      }
      .wcu-card::before {
        content:''; position:absolute; top:0; left:0; right:0; height:2px;
        border-radius:20px 20px 0 0; opacity:0; transition:opacity .28s;
      }
      .wcu-card:hover { transform:translateY(-6px); }
      .wcu-card:hover::before { opacity:1; }
      .wcu-icon-wrap {
        width:52px; height:52px; border-radius:14px;
        display:flex; align-items:center; justify-content:center;
        margin-bottom:18px; transition:transform .28s,box-shadow .28s;
      }
      .wcu-card:hover .wcu-icon-wrap { transform:scale(1.12) rotate(-5deg); }
      .wcu-card-title { font-size:17px; font-weight:700; color:#f1f5f9; margin-bottom:10px; }
      .wcu-card-desc  { font-size:14px; color:rgba(255,255,255,0.46); line-height:1.65; }

      .wcu-cta {
        margin-top:52px; text-align:center; padding:34px;
        background:rgba(255,255,255,0.03); backdrop-filter:blur(16px);
        border:1px solid rgba(249,115,22,0.18); border-radius:20px;
        position:relative; overflow:hidden;
      }
      .wcu-cta::before {
        content:''; position:absolute; top:0; left:0; right:0; height:2px;
        background:linear-gradient(90deg,#f97316,#ea580c,transparent);
      }
      .wcu-cta-txt { font-size:18px; font-weight:700; color:#f1f5f9; margin-bottom:16px; }
      .wcu-cta-link {
        display:inline-flex; align-items:center; gap:8px;
        background:linear-gradient(135deg,#ea580c,#f97316); color:#fff; text-decoration:none;
        padding:13px 30px; border-radius:12px; font-size:14px; font-weight:700;
        transition:transform .22s,box-shadow .22s;
        box-shadow:0 6px 20px rgba(234,88,12,0.32);
      }
      .wcu-cta-link:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 10px 28px rgba(234,88,12,0.48); }
    `}</style>

    <section className="wcu-pg">
      <div className="wcu-inner">
        <GlowSection>
          <div className="wcu-hdr">
            <p className="wcu-eyebrow">Our Promise</p>
            <h2 className="wcu-title">Why Choose Ganpati Handloom?</h2>
            <p className="wcu-sub">We're committed to bringing you the finest handloom products with unmatched quality and service.</p>
          </div>
        </GlowSection>

        <div className="wcu-grid">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <GlowSection key={i} delay={i * 80}>
                <div
                  className="wcu-card"
                  style={{ height:'100%' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = f.border;
                    e.currentTarget.style.boxShadow = `0 20px 48px rgba(0,0,0,0.35), 0 0 24px ${f.bg}`;
                    e.currentTarget.querySelector('.wcu-icon-wrap').style.boxShadow = `0 0 20px ${f.bg}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.querySelector('.wcu-icon-wrap').style.boxShadow = 'none';
                  }}
                >
                  <div className="wcu-card" style={{ position:'absolute',top:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,${f.accent},transparent)`,borderRadius:'20px 20px 0 0',opacity:0,transition:'opacity .28s',pointerEvents:'none' }} />
                  <div className="wcu-icon-wrap" style={{ background:f.bg, border:`1px solid ${f.border}` }}>
                    <Icon size={24} color={f.accent} strokeWidth={2} />
                  </div>
                  <h3 className="wcu-card-title">{f.title}</h3>
                  <p className="wcu-card-desc">{f.desc}</p>
                </div>
              </GlowSection>
            );
          })}
        </div>

        <GlowSection delay={100}>
          <div className="wcu-cta">
            <p className="wcu-cta-txt">Ready to explore authentic handloom products?</p>
            <Link to="/products" className="wcu-cta-link">Browse Our Collection →</Link>
          </div>
        </GlowSection>
      </div>
    </section>
  </>
);

export default WhyChooseUs;