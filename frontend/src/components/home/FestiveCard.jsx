import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

/* ── Fallback gradients when no image ── */
const GRADIENTS = [
  'linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #7c3aed 100%)',
  'linear-gradient(135deg, #0a001a 0%, #1a003d 40%, #ea580c 100%)',
  'linear-gradient(135deg, #001a1a 0%, #003d3d 40%, #2563eb 100%)',
  'linear-gradient(135deg, #001a00 0%, #003d1a 40%, #7c3aed 100%)',
];

/* ── Resolve image URL (local uploads + direct URLs) ── */
const resolveImageSrc = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith('/uploads/')) return `${BACKEND}${t}`;
  if (t.includes('imgurl=')) {
    try {
      const params = new URL(t.startsWith('http') ? t : `https://x.com/?${t}`).searchParams;
      const u = params.get('imgurl');
      if (u) return decodeURIComponent(u);
    } catch { /* fall through */ }
  }
  const directExt = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(t);
  const knownCdn  = [
    'images.unsplash.com','cdn.pixabay.com','images.pexels.com',
    'marketplace.canva.com','i.imgur.com','upload.wikimedia.org',
    'res.cloudinary.com','firebasestorage.googleapis.com','storage.googleapis.com',
  ].some(h => t.includes(h));
  if (directExt || knownCdn) return t;
  return null;
};

const FestiveCard = ({ title, description, image, isActive, slug, index = 0 }) => {
  const [hovered,   setHovered]   = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const navigate = useNavigate();

  const resolvedImg = resolveImageSrc(image);
  const showImg     = resolvedImg && !imgFailed;
  const gradient    = GRADIENTS[index % GRADIENTS.length];

  const handleClick = () => { if (isActive) navigate(`/collections/${slug}`); };

  return (
    <>
      <style>{`
        @keyframes fcLiveDot {
          0%, 100% { opacity: 1;  transform: scale(1);    box-shadow: 0 0 0 0 rgba(249,115,22,0.7); }
          50%       { opacity: 0.7; transform: scale(1.2); box-shadow: 0 0 0 5px rgba(249,115,22,0); }
        }
        @keyframes fcComingSoon {
          0%, 100% { opacity: 0.70; }
          50%       { opacity: 0.95; }
        }
        @keyframes fcShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>

      {/* ── OUTER WRAPPER: handles scale + aura on hover ── */}
      <div
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          /* Scale-up the whole card on hover */
          transform:  hovered && isActive ? 'scale(1.025)' : 'scale(1)',
          /* Orange aura on hover */
          boxShadow:  hovered && isActive
            ? '0 0 38px rgba(249,115,22,0.22), 0 24px 60px rgba(0,0,0,0.60)'
            : '0 8px 32px rgba(0,0,0,0.45)',
          borderRadius: 24,
          /* overflow:hidden keeps image scale inside rounded corners */
          overflow:     'hidden',
          transition:   'transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease',
          cursor:        isActive ? 'pointer' : 'default',
          /* Thin border */
          border: `1px solid ${
            hovered && isActive
              ? 'rgba(249,115,22,0.45)'
              : 'rgba(255,255,255,0.09)'
          }`,
          /* ── ASPECT RATIO 16/9 — no hardcoded height ── */
          aspectRatio: '16 / 9',
          width:       '100%',
          /* Stacking context for all absolute children */
          position:    'relative',
        }}
      >

        {/* ── LAYER 1: Gradient background (always present) ── */}
        <div style={{ position: 'absolute', inset: 0, background: gradient }} />

        {/* ── LAYER 2: Image (scales independently on hover) ── */}
        {showImg && (
          <img
            src={resolvedImg}
            alt={title}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            style={{
              position:       'absolute',
              inset:           0,
              width:           '100%',
              height:          '100%',
              objectFit:      'cover',
              objectPosition: 'center',
              /* Image scales slightly more than card for a "zoom into frame" feel */
              transform:  hovered && isActive ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
              filter:      isActive ? 'none' : 'blur(4px) brightness(0.40) saturate(0.35)',
            }}
          />
        )}

        {/* ── LAYER 3: Sophisticated gradient mask ──
            from-black covers baked-in bottom text in images
            via-black/40 creates smooth mid transition
            to-transparent reveals image at top              ── */}
        <div style={{
          position:   'absolute',
          inset:       0,
          /* Dark bottom-up gradient — hides baked-in image text + ensures readability */
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.42) 38%, rgba(0,0,0,0.06) 70%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* ── LAYER 4: Coming Soon overlay (inactive only) ── */}
        {!isActive && (
          <div style={{
            position:       'absolute',
            inset:           0,
            background:     'rgba(5,8,22,0.50)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            animation:      'fcComingSoon 2.5s ease-in-out infinite',
          }}>
            <div style={{
              background:     'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border:         '1px solid rgba(255,255,255,0.12)',
              borderRadius:    18,
              padding:        '12px 28px',
            }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                Coming Soon
              </p>
            </div>
          </div>
        )}

        {/* ── LAYER 5: LIVE badge — minimalist glowing dot ── */}
        <div style={{
          position:       'absolute',
          top:             14,
          right:           14,
          display:        'flex',
          alignItems:     'center',
          gap:             6,
          background:     'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border:         `1px solid ${isActive ? 'rgba(249,115,22,0.40)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius:    999,
          padding:        '5px 12px 5px 10px',
          fontSize:        11,
          fontWeight:      800,
          color:          isActive ? '#fff' : 'rgba(255,255,255,0.55)',
          letterSpacing:  '.08em',
          textTransform:  'uppercase',
        }}>
          {/* Glowing dot */}
          <span style={{
            width:      8,
            height:     8,
            borderRadius: '50%',
            background:  isActive ? '#f97316' : 'rgba(255,255,255,0.28)',
            display:    'inline-block',
            flexShrink:  0,
            animation:   isActive ? 'fcLiveDot 2s ease-in-out infinite' : 'none',
          }} />
          {isActive ? 'LIVE' : 'Soon'}
        </div>

        {/* ── LAYER 6: Content overlay — bottom-left, luxury typography ── */}
        <div style={{
          position: 'absolute',
          bottom:    0,
          left:      0,
          right:     0,
          padding:  '0 26px 24px',
          filter:    isActive ? 'none' : 'brightness(0.55)',
        }}>

          {/* Luxury title */}
          <h3 style={{
            fontSize:      'clamp(16px, 2vw, 22px)',
            fontWeight:     900,
            color:         '#fff',
            margin:        '0 0 5px',
            lineHeight:     1.2,
            /* tracking-widest + uppercase = luxury brand feel */
            textTransform: 'uppercase',
            letterSpacing: '.12em',
            /* Orange drop-shadow glow */
            textShadow:    isActive
              ? '0 0 12px rgba(249,115,22,0.75), 0 2px 8px rgba(0,0,0,0.80)'
              : '0 2px 8px rgba(0,0,0,0.80)',
          }}>
            {title}
          </h3>

          {/* Subtitle */}
          {description && (
            <p style={{
              fontSize:   13,
              color:      'rgba(255,255,255,0.68)',
              margin:     '0 0 16px',
              lineHeight:  1.5,
              textShadow: '0 1px 6px rgba(0,0,0,0.70)',
              display:    '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow:   'hidden',
              letterSpacing: '.01em',
            }}>
              {description}
            </p>
          )}

          {/* ── Ghost-glass button (active) / Shimmer button (inactive) ── */}
          {isActive ? (
            <button style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:             8,
              /* Ghost glass base */
              background:     hovered ? 'rgba(249,115,22,0.90)' : 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border:         `1px solid ${hovered ? 'rgba(249,115,22,0.80)' : 'rgba(255,255,255,0.22)'}`,
              borderRadius:    11,
              padding:        '10px 22px',
              fontSize:        13,
              fontWeight:      700,
              color:          '#fff',
              cursor:         'pointer',
              fontFamily:     "'DM Sans', sans-serif",
              letterSpacing:  '.03em',
              boxShadow:       hovered ? '0 6px 22px rgba(249,115,22,0.50)' : 'none',
              transition:     'background 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease',
              whiteSpace:     'nowrap',
            }}>
              Explore Collection →
            </button>
          ) : (
            <button disabled style={{
              display:         'inline-flex',
              alignItems:      'center',
              gap:              8,
              background:      'rgba(255,255,255,0.06)',
              border:          '1px solid rgba(255,255,255,0.12)',
              borderRadius:     11,
              padding:         '10px 22px',
              fontSize:         13,
              fontWeight:       700,
              color:           'rgba(255,255,255,0.30)',
              cursor:          'not-allowed',
              fontFamily:      "'DM Sans', sans-serif",
              backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)',
              backgroundSize:  '200% auto',
              animation:       'fcShimmer 2.5s linear infinite',
            }}>
              🔔 Stay Tuned
            </button>
          )}

        </div>
      </div>
    </>
  );
};

export default FestiveCard;