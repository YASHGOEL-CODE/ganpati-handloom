import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { festiveCollectionsAPI, recommendationsAPI } from '../../services/api';
import FestiveCard from './FestiveCard';

const BACKEND = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

/* ─────────────────────────────────────────────────
   Fallback product card — glass style matching site
───────────────────────────────────────────────── */
const FallbackProductCard = ({ product }) => {
  const [hov, setHov] = useState(false);
  const navigate = useNavigate();

  const imgSrc = product.images?.[0]
    ? (product.images[0].startsWith('http')
        ? product.images[0]
        : `${BACKEND}${product.images[0]}`)
    : null;

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:    'rgba(255,255,255,0.04)',
        backdropFilter:'blur(16px)',
        border:        `1px solid ${hov ? 'rgba(249,115,22,0.32)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius:   18, overflow: 'hidden', cursor: 'pointer',
        transform:      hov ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow:      hov ? '0 20px 44px rgba(249,115,22,0.14)' : '0 4px 18px rgba(0,0,0,0.25)',
        transition:    'all 0.3s ease',
      }}
    >
      <div style={{ height: 200, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg,rgba(249,115,22,0.18),rgba(139,92,246,0.12))' }}>
        {imgSrc && (
          <img src={imgSrc} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.07)' : 'scale(1)', transition: 'transform 0.5s ease' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, background: 'linear-gradient(to top,rgba(0,0,0,0.65),transparent)', pointerEvents: 'none' }} />
      </div>
      <div style={{ padding: '14px 16px 18px' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', margin: '0 0 12px' }}>
          {product.category?.name || product.fabricType || 'Handloom'}
        </p>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#f97316', margin: 0 }}>
          ₹{product.price?.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   Shared section header
───────────────────────────────────────────────── */
const SectionHeader = ({ eyebrow, title, subtitle }) => (
  <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fcsHeaderIn 0.55s ease both' }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ display: 'inline-block', width: 28, height: 2, background: 'linear-gradient(90deg, transparent, #f97316)', borderRadius: 2 }} />
      <p style={{ fontSize: 11, fontWeight: 800, color: '#f97316', letterSpacing: '.16em', textTransform: 'uppercase', margin: 0 }}>
        {eyebrow}
      </p>
      <span style={{ display: 'inline-block', width: 28, height: 2, background: 'linear-gradient(90deg, #f97316, transparent)', borderRadius: 2 }} />
    </div>
    <h2 style={{ fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 800, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>
      {title}
    </h2>
    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
      {subtitle}
    </p>
  </div>
);

/* ─────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────── */
const FestiveCollectionsSection = () => {
  const [collections, setCollections]           = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(false);
  const [fallbackProducts, setFallbackProducts] = useState([]);
  const [fallbackLoading, setFallbackLoading]   = useState(false);

  useEffect(() => {
    festiveCollectionsAPI.getAll()
      .then(res => {
        if (res.data?.success) {
          const sorted = [...(res.data.collections || [])].sort(
            (a, b) => a.priority - b.priority || new Date(b.createdAt) - new Date(a.createdAt)
          );
          setCollections(sorted);
        } else {
          setError(true);
        }
      })
      .catch(err => { console.error('FestiveCollectionsSection fetch error:', err); setError(true); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && (error || collections.length === 0)) {
      setFallbackLoading(true);
      recommendationsAPI.getTrending(30, 6)
        .then(res => {
          const products = res.data?.products || res.data?.recommendations || [];
          setFallbackProducts(products.slice(0, 6));
        })
        .catch(() => setFallbackProducts([]))
        .finally(() => setFallbackLoading(false));
    }
  }, [loading, error, collections.length]);

  /* ── Shared keyframes injected once ── */
  const keyframes = `
    @keyframes fcsHeaderIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fcsCardIn   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fcsSpinner  { to{transform:rotate(360deg)} }
    @keyframes fcsSkeleton { 0%,100%{opacity:.4} 50%{opacity:.8} }
  `;

  /* ── Responsive grid style injected once ── */
  const gridStyle = `
    .fcs-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 28px;
    }
    @media (max-width: 768px) {
      .fcs-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
    .fcs-fallback-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    @media (max-width: 900px) {
      .fcs-fallback-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
      .fcs-fallback-grid { grid-template-columns: 1fr; }
    }
  `;

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div style={{ padding: '64px 20px 72px' }}>
        <style>{keyframes + gridStyle}</style>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="fcs-grid">
            {[1, 2].map(i => (
              <div key={i} style={{
                aspectRatio: '16 / 10', borderRadius: 24,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                animation: `fcsSkeleton 1.8s ease-in-out ${i * 200}ms infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Fallback: no collections → Best Sellers ──
  if (error || collections.length === 0) {
    return (
      <div style={{
        padding: '64px 20px 72px',
        background: `
          radial-gradient(circle at 20% 50%, rgba(249,115,22,0.06) 0%, transparent 55%),
          radial-gradient(circle at 80% 50%, rgba(139,92,246,0.05) 0%, transparent 55%),
          linear-gradient(160deg, #0f172a 0%, #000 50%, #020617 100%)
        `,
      }}>
        <style>{keyframes + gridStyle}</style>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader eyebrow="Trending Now" title="Best Sellers" subtitle="Our most loved handloom products, trusted by thousands" />
          {fallbackLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(249,115,22,0.18)', borderTopColor: '#f97316', animation: 'fcsSpinner .75s linear infinite' }} />
            </div>
          ) : fallbackProducts.length > 0 ? (
            <>
              <div className="fcs-fallback-grid">
                {fallbackProducts.map((p, i) => (
                  <div key={p._id} style={{ animation: `fcsCardIn 0.5s ease ${i * 70}ms both` }}>
                    <FallbackProductCard product={p} />
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <Link to="/products"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.28)', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, color: '#fb923c', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.10)'; }}
                >
                  View All Products →
                </Link>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#ea580c,#f97316)', borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
                Browse All Products →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Full festive collections ──
  return (
    <div style={{
      padding: '64px 20px 72px',
      background: `
        radial-gradient(circle at 20% 50%, rgba(249,115,22,0.06) 0%, transparent 55%),
        radial-gradient(circle at 80% 50%, rgba(139,92,246,0.05) 0%, transparent 55%),
        linear-gradient(160deg, #0f172a 0%, #000 50%, #020617 100%)
      `,
    }}>
      <style>{keyframes + gridStyle}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <SectionHeader
          eyebrow="Festive Collections"
          title="Celebrate Every Occasion"
          subtitle="Discover our curated handloom collections crafted for India's most cherished festivals"
        />

        {/* ── Responsive 2-column grid, no hardcoded heights ── */}
        <div className="fcs-grid">
          {collections.map((col, i) => (
            <div key={col._id} style={{ animation: `fcsCardIn 0.55s ease ${i * 100}ms both` }}>
              <FestiveCard
                title={col.title}
                description={col.description}
                image={col.bannerImage}
                isActive={col.isActive}
                slug={col.slug}
                index={i}
              />
            </div>
          ))}
        </div>

        {/* View all */}
        {collections.some(c => c.isActive) && (
          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <Link to="/collections"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.28)', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, color: '#fb923c', textDecoration: 'none', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.18)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.22)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              View All Collections →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default FestiveCollectionsSection;