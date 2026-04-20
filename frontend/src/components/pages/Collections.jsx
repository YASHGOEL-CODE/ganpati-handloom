import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI, clearCache } from '../../services/api';
import ProductCard from '../products/ProductCard';
import Loader from '../common/Loader';
import {
  FiCheck,
  FiFeather,
  FiStar,
  FiHeart,
  FiPackage,
  FiShield,
  FiTrendingUp,
  FiArrowRight,
  FiHome,
  FiGrid,
} from 'react-icons/fi';

const collectionsData = {
  'rajasthan-handloom': {
    title: 'Rajasthan Handloom Collection',
    description: 'Vibrant colors and traditional patterns from the royal state of Rajasthan',
    accent: '#ea580c',
    accentLight: 'rgba(234,88,12,0.15)',
    heroGradient: 'linear-gradient(135deg, rgba(15,5,0,0.92) 0%, rgba(30,12,0,0.80) 50%, rgba(120,40,0,0.45) 100%)',
    story: 'Our Rajasthan Handloom Collection celebrates the rich textile heritage of Rajasthan. Each product is handcrafted using traditional weaving techniques and vibrant colors inspired by the royal palaces and desert landscapes. These handloom products combine cultural craftsmanship with modern comfort, making them perfect for everyday home use.',
    highlights: [
      { icon: FiFeather, title: '100% Handwoven',  desc: 'Traditional weaving techniques' },
      { icon: FiStar,    title: 'Royal Designs',   desc: 'Inspired by Rajasthan palaces' },
      { icon: FiHeart,   title: 'Artisan Made',    desc: 'Supporting local craftsmen' },
      { icon: FiShield,  title: 'Premium Quality', desc: 'Durable and long-lasting' },
    ],
  },
  'winter-quilt': {
    title: 'Winter Quilt Collection',
    description: 'Stay warm and cozy with our handcrafted quilts and blankets',
    accent: '#3b82f6',
    accentLight: 'rgba(59,130,246,0.15)',
    heroGradient: 'linear-gradient(135deg, rgba(0,5,20,0.92) 0%, rgba(0,15,40,0.80) 50%, rgba(0,40,80,0.45) 100%)',
    story: 'Our Winter Quilt Collection is designed to keep you warm during cold nights. Each quilt is carefully crafted with multiple layers of soft cotton and filled with premium materials. Perfect for winter comfort, these quilts combine warmth with beautiful traditional designs.',
    highlights: [
      { icon: FiPackage, title: 'Multi-Layer',      desc: 'Extra warmth & comfort' },
      { icon: FiFeather, title: 'Soft Cotton',      desc: 'Breathable fabric' },
      { icon: FiCheck,   title: 'Machine Washable', desc: 'Easy to maintain' },
      { icon: FiHeart,   title: 'Handcrafted',      desc: 'Made with love' },
    ],
  },
  'wedding-special': {
    title: 'Wedding Special Collection',
    description: 'Premium handloom products perfect for weddings and special occasions',
    accent: '#059669',
    accentLight: 'rgba(5,150,105,0.15)',
    heroGradient: 'linear-gradient(135deg, rgba(0,10,5,0.92) 0%, rgba(0,25,15,0.80) 50%, rgba(0,60,30,0.45) 100%)',
    story: 'Our Wedding Special Collection features luxurious handloom products perfect for celebrations. Each piece is crafted with intricate designs, vibrant colors, and premium materials. These products make beautiful gifts and add elegance to any wedding or special occasion.',
    highlights: [
      { icon: FiStar,    title: 'Premium Luxury',    desc: 'Best quality materials' },
      { icon: FiFeather, title: 'Intricate Designs', desc: 'Detailed craftsmanship' },
      { icon: FiHeart,   title: 'Perfect Gift',      desc: 'Memorable keepsakes' },
      { icon: FiShield,  title: 'Long-Lasting',      desc: 'Heirloom quality' },
    ],
  },
  'eco-friendly-cotton': {
    title: 'Eco-Friendly Cotton Collection',
    description: '100% organic cotton products for conscious living',
    accent: '#16a34a',
    accentLight: 'rgba(22,163,74,0.15)',
    heroGradient: 'linear-gradient(135deg, rgba(0,10,0,0.92) 0%, rgba(0,25,10,0.80) 50%, rgba(0,60,20,0.45) 100%)',
    story: 'Our Eco-Friendly Cotton Collection is made from 100% organic cotton, grown without harmful pesticides or chemicals. We believe in sustainable production that respects both nature and artisans. These products are gentle on your skin and kind to the environment.',
    highlights: [
      { icon: FiFeather, title: '100% Organic',  desc: 'Chemical-free cotton' },
      { icon: FiCheck,   title: 'Eco-Friendly',  desc: 'Sustainable production' },
      { icon: FiHeart,   title: 'Skin-Friendly', desc: 'Hypoallergenic fabric' },
      { icon: FiShield,  title: 'Certified',     desc: 'Organic certification' },
    ],
  },
  'premium-handmade': {
    title: 'Premium Handmade Series',
    description: 'Luxury handloom products crafted by master artisans',
    accent: '#d97706',
    accentLight: 'rgba(217,119,6,0.15)',
    heroGradient: 'linear-gradient(135deg, rgba(10,5,0,0.92) 0%, rgba(30,15,0,0.80) 50%, rgba(80,40,0,0.45) 100%)',
    story: 'Our Premium Handmade Series represents the pinnacle of handloom craftsmanship. Each product is created by master artisans with decades of experience. These limited-edition pieces feature the finest materials, intricate designs, and exceptional attention to detail.',
    highlights: [
      { icon: FiStar,       title: 'Master Crafted',    desc: 'Expert artisans' },
      { icon: FiFeather,    title: 'Premium Materials', desc: 'Finest quality' },
      { icon: FiTrendingUp, title: 'Limited Edition',   desc: 'Exclusive designs' },
      { icon: FiShield,     title: 'Lifetime Quality',  desc: 'Investment pieces' },
    ],
  },
};

const tabLabel = (key, title) =>
  title.replace(' Collection', '').replace(' Series', '');

const useInView = (threshold = 0.10) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const Collections = () => {
  const { collectionName } = useParams();

  // ✅ FIX 1: Compute activeCollectionName ONCE here so it's stable
  const activeCollectionName = (collectionName && collectionsData[collectionName])
    ? collectionName
    : 'rajasthan-handloom';

  const currentCollection = collectionsData[activeCollectionName];
  const accent      = currentCollection.accent;
  const accentLight = currentCollection.accentLight;

  const [products, setProducts] = useState([]);   // ✅ FIX 2: single state, no split
  const [loading, setLoading]   = useState(true);

  const [featRef,      featInView]  = useInView();
  const [aboutRef,     aboutInView] = useInView();
  const [highlightRef, hlInView]    = useInView();

  // ── Collection → productType fallback map ──
  // Used when products don't have the `collections` field populated in DB.
  const COLLECTION_PRODUCT_TYPES = {
    'rajasthan-handloom': ['bedsheet', 'sofa-cover', 'curtain', 'door-mat', 'other'],
    'winter-quilt':       ['quilt', 'blanket'],
    'wedding-special':    ['bedsheet', 'quilt', 'pillow', 'sofa-cover'],
    'eco-friendly-cotton':['bedsheet', 'pillow', 'blanket', 'curtain'],
    'premium-handmade':   ['bedsheet', 'quilt', 'sofa-cover', 'blanket', 'pillow'],
  };

  // ── Collection → extra attribute filters ──
  const COLLECTION_EXTRA_FILTERS = {
    'rajasthan-handloom': { isHandmade: true },
    'winter-quilt':       {},
    'wedding-special':    { isPremium: true },
    'eco-friendly-cotton':{ fabricType: 'cotton' },
    'premium-handmade':   { isPremium: true },
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setProducts([]);
        clearCache();

        // Step 1: debug active collection
        console.log("ACTIVE COLLECTION:", activeCollectionName);

        // Step 2: extractProducts — handles all API response shapes
        const extractProducts = (res) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (Array.isArray(res.products)) return res.products;
          if (Array.isArray(res.data)) return res.data;
          return [];
        };

        // ── Strategy 1: collection-specific endpoint ──
        let collectionData = [];
        try {
          const r1 = await productsAPI.getByCollection(activeCollectionName);
          collectionData = extractProducts(r1.data);
          console.log("COLLECTION API RESPONSE:", collectionData);
        } catch (_) {
          collectionData = [];
        }

        if (collectionData.length > 0) {
          setProducts(collectionData);
          return;
        }

        // ── Strategy 2: fetch ALL — no filtering (Step 3: force show) ──
        const allRes = await productsAPI.getAll({});
        const allProducts = extractProducts(allRes.data);
        console.log("ALL PRODUCTS RESPONSE:", allProducts);

        // Step 3: set directly — no filtering so we can confirm data arrives
        setProducts(allProducts);

      } catch (error) {
        console.error("❌ API ERROR:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCollectionName]);

  if (loading) return <Loader />;
  console.log("FINAL PRODUCTS STATE:", products);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        /* ── PAGE BASE — exact admin/home bg system ── */
        .col-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 10%, rgba(249,115,22,0.07) 0%, transparent 55%),
            radial-gradient(circle at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 55%),
            linear-gradient(160deg, #0f172a 0%, #000000 50%, #020617 100%);
          font-family: 'DM Sans', sans-serif;
        }

        /* ── HEADER CARD — glass card with orange top border (admin pattern) ── */
        .col-header-card {
          max-width: 1280px; margin: 0 auto;
          padding: 28px 28px 0;
        }
        .col-header-inner {
          background: rgba(255,255,255,0.04); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
          padding: 26px 30px; position: relative; overflow: hidden;
          animation: colHeaderIn .55s ease both;
        }
        @keyframes colHeaderIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .col-header-inner::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #f97316, #ea580c, transparent);
          border-radius: 20px 20px 0 0;
        }
        /* breadcrumb */
        .col-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 16px;
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.32);
        }
        .col-breadcrumb a {
          color: rgba(255,255,255,0.32); text-decoration: none;
          display: flex; align-items: center; gap: 4px;
          transition: color .2s;
        }
        .col-breadcrumb a:hover { color: rgba(255,255,255,0.70); }
        .col-breadcrumb-sep { opacity:.25; }
        .col-breadcrumb-current { color: rgba(255,255,255,0.55); }

        /* Eyebrow + title */
        .col-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; color: #f97316;
          letter-spacing: .15em; text-transform: uppercase; margin-bottom: 10px;
        }
        .col-hero-eyebrow::before {
          content:''; display:inline-block; width:14px; height:1.5px; background:#f97316;
        }
        .col-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 3.5vw, 40px);
          font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 8px;
        }
        .col-hero-desc {
          font-size: 14.5px; color: rgba(255,255,255,0.42); line-height: 1.65; max-width: 600px;
        }

        /* ── BODY ── */
        .col-body {
          max-width: 1280px; margin: 0 auto;
          padding: 24px 28px 80px;
        }
        @media (max-width: 640px) { .col-body { padding: 18px 14px 60px; } }

        /* ── TABS — admin filter chip style ── */
        .col-tabs-wrap {
          overflow-x: auto; margin-bottom: 28px;
          padding-bottom: 4px; scrollbar-width: none;
        }
        .col-tabs-wrap::-webkit-scrollbar { display: none; }
        .col-tabs {
          display: flex; gap: 8px; width: max-content;
          padding: 5px;
          background: rgba(255,255,255,0.04); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 14px;
        }
        .col-tab {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 10px;
          font-size: 13px; font-weight: 700;
          white-space: nowrap; text-decoration: none;
          transition: all .22s ease;
          color: rgba(255,255,255,0.45);
          background: transparent;
        }
        .col-tab:hover:not(.active) {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.85);
          transform: translateY(-1px);
        }
        .col-tab.active {
          background: linear-gradient(135deg, #ea580c, #f97316);
          border-color: transparent; color: #fff;
          box-shadow: 0 4px 16px rgba(234,88,12,0.35);
          transform: translateY(-1px);
        }

        /* ── SECTION HEADER — admin eyebrow + Playfair pattern ── */
        .col-section-header { margin-bottom: 24px; }
        .col-section-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; color: #f97316;
          letter-spacing: .14em; text-transform: uppercase; margin-bottom: 8px;
        }
        .col-section-eyebrow::before {
          content:''; display:inline-block; width:12px; height:1.5px; background:#f97316;
        }
        .col-section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px,2.8vw,32px); font-weight: 800;
          color: #fff; line-height: 1.15;
        }
        .col-section-sub {
          font-size: 14px; color: rgba(255,255,255,0.38); margin-top: 4px; line-height: 1.6;
        }

        /* ── PRODUCT CARD STAGGER ── */
        .col-feat-section {
          margin-bottom: 32px;
          transition: opacity .6s ease, transform .6s ease;
        }
        .col-feat-section.hidden  { opacity:1; transform:none; }
        .col-feat-section.visible { opacity:1; transform:translateY(0); }
        .col-feat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px,1fr));
          gap: 18px;
        }
        @media (max-width: 640px) { .col-feat-grid { grid-template-columns: repeat(2,1fr); gap:12px; } }
        @media (max-width: 380px) { .col-feat-grid { grid-template-columns: 1fr; } }
        .col-card-item { animation: colCardIn .45s ease both; }
        @keyframes colCardIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        /* ── ABOUT CARD — glass with orange top border (admin pattern) ── */
        .col-about-section {
          margin-bottom: 28px;
          transition: opacity .65s ease .1s, transform .65s ease .1s;
        }
        .col-about-section.hidden  { opacity:1; transform:none; }
        .col-about-section.visible { opacity:1; transform:translateY(0); }
        .col-about-card {
          background: rgba(255,255,255,0.04); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
          padding: 30px 32px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative; overflow: hidden;
        }
        .col-about-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, ${accent}, ${accent}88, transparent);
          border-radius: 20px 20px 0 0;
        }
        .col-about-card::after {
          content:''; position:absolute; top:-60px; right:-60px;
          width:240px; height:240px; border-radius:50%;
          background: radial-gradient(circle, ${accentLight} 0%, transparent 70%);
          pointer-events:none;
        }
        .col-about-inner { position:relative; z-index:1; }
        .col-about-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; color: ${accent};
          letter-spacing: .14em; text-transform: uppercase; margin-bottom: 12px;
        }
        .col-about-label::before { content:'🕉️'; font-size:16px; }
        .col-about-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(18px,2.2vw,24px); font-weight: 800;
          color: #f1f5f9; margin-bottom: 14px;
        }
        .col-about-text {
          font-size: 15px; color: rgba(255,255,255,0.50); line-height: 1.85; max-width: 800px;
        }
        @media (max-width: 640px) { .col-about-card { padding: 22px 18px; } }

        /* ── HIGHLIGHT CARDS — admin glass card pattern ── */
        .col-hl-section {
          margin-bottom: 28px;
          transition: opacity .65s ease .15s, transform .65s ease .15s;
        }
        .col-hl-section.hidden  { opacity:1; transform:none; }
        .col-hl-section.visible { opacity:1; transform:translateY(0); }
        .col-hl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px,1fr));
          gap: 16px;
        }
        @media (max-width: 640px) { .col-hl-grid { grid-template-columns: repeat(2,1fr); gap:12px; } }
        .col-hl-card {
          background: rgba(255,255,255,0.04); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 18px;
          padding: 22px 20px; position: relative; overflow: hidden;
          transition: transform .28s, box-shadow .28s, border-color .28s;
          cursor: default;
        }
        .col-hl-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 44px rgba(0,0,0,0.35), 0 0 0 1px ${accent}33;
          border-color: ${accent}44;
        }
        .col-hl-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, ${accent}, transparent);
          border-radius: 18px 18px 0 0;
          opacity: 0; transition: opacity .28s;
        }
        .col-hl-card:hover::before { opacity:1; }
        .col-hl-icon-wrap {
          width:48px; height:48px; border-radius:13px;
          background: ${accentLight}; border: 1px solid ${accent}33;
          display:flex; align-items:center; justify-content:center;
          margin-bottom: 16px;
          transition: transform .28s, box-shadow .28s;
        }
        .col-hl-card:hover .col-hl-icon-wrap {
          transform: scale(1.12) rotate(-5deg);
          box-shadow: 0 0 18px ${accentLight};
        }
        .col-hl-title { font-size:14.5px; font-weight:700; color:#f1f5f9; margin-bottom:6px; }
        .col-hl-desc  { font-size:12.5px; color:rgba(255,255,255,0.40); line-height:1.55; }

        /* ── CTA BUTTON ── */
        .col-cta-wrap { text-align:center; margin-top: 20px; padding: 28px 20px; }
        .col-cta-btn {
          display:inline-flex; align-items:center; gap:10px;
          background:linear-gradient(135deg,#ea580c,#f97316);
          color:#fff; text-decoration:none;
          padding:13px 32px; border-radius:13px;
          font-size:14.5px; font-weight:700;
          transition:transform .22s,box-shadow .22s,filter .22s;
          box-shadow:0 6px 22px rgba(234,88,12,0.32);
        }
        .col-cta-btn:hover {
          transform:translateY(-3px) scale(1.03);
          box-shadow:0 14px 36px rgba(234,88,12,0.50);
          filter:brightness(1.08);
        }
        .col-cta-arrow { transition:transform .22s; }
        .col-cta-btn:hover .col-cta-arrow { transform:translateX(5px); }

        /* ── EMPTY STATE ── */
        .col-empty {
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          padding:80px 20px; text-align:center;
        }
        .col-empty-icon {
          width:80px; height:80px; border-radius:50%;
          background:rgba(249,115,22,0.10); border:1px solid rgba(249,115,22,0.22);
          display:flex; align-items:center; justify-content:center;
          margin-bottom:20px;
          animation: colEmptyPulse 2.5s ease-in-out infinite;
        }
        @keyframes colEmptyPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(249,115,22,0.12); }
          50%      { box-shadow:0 0 0 12px rgba(249,115,22,0); }
        }
        .col-empty-title { font-size:20px; font-weight:700; color:#f1f5f9; margin-bottom:8px; }
        .col-empty-sub   { font-size:14px; color:rgba(255,255,255,0.40); margin-bottom:24px; max-width:340px; line-height:1.6; }
        .col-empty-btn {
          display:inline-flex; align-items:center; gap:7px;
          background:linear-gradient(135deg,#ea580c,#f97316); color:#fff; text-decoration:none;
          padding:11px 26px; border-radius:11px; font-size:14px; font-weight:700;
          transition:transform .2s, box-shadow .2s;
          box-shadow:0 4px 14px rgba(234,88,12,0.28);
        }
        .col-empty-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(234,88,12,0.44); }

        @media (max-width:768px) {
          .col-header-card { padding:18px 14px 0; }
          .col-header-inner { padding:18px 16px; }
        }
      `}</style>

      <div className="col-page">

        {/* ══ HEADER GLASS CARD — matches admin/home pattern ══ */}
        <div className="col-header-card">
          <div className="col-header-inner">
            <nav className="col-breadcrumb" aria-label="breadcrumb">
              <Link to="/"><FiHome size={11} /> Home</Link>
              <span className="col-breadcrumb-sep">›</span>
              <Link to="/products"><FiGrid size={11} /> Products</Link>
              <span className="col-breadcrumb-sep">›</span>
              <span className="col-breadcrumb-current">Collections</span>
            </nav>
            <p className="col-hero-eyebrow">Ganpati Handloom</p>
            <h1 className="col-hero-title">{currentCollection.title}</h1>
            <p className="col-hero-desc">{currentCollection.description}</p>
          </div>
        </div>

        {/* ══ BODY ══ */}
        <div className="col-body">

          {/* ── TABS ── */}
          <div className="col-tabs-wrap">
            <div className="col-tabs">
              {Object.keys(collectionsData).map((key) => (
                <Link
                  key={key}
                  to={`/collections/${key}`}
                  className={`col-tab ${activeCollectionName === key ? 'active' : ''}`}
                >
                  {tabLabel(key, collectionsData[key].title)}
                </Link>
              ))}
            </div>
          </div>

          {/* ✅ FIX 5: Use single `products` state — no dual-state race condition */}
          {products.length > 0 ? (
            <>
              {/* ── FEATURED PRODUCTS ── */}
              <section
                className="col-feat-section visible"
              >
                <div className="col-section-header">
                  <p className="col-section-eyebrow">Handpicked for You</p>
                  <h2 className="col-section-title">Featured Products</h2>
                  <p className="col-section-sub">Explore our finest pieces from this collection</p>
                </div>
                {/* Step 5: failsafe count — visible above grid */}
                <h2 style={{ color:'white', fontSize:14, marginBottom:12, opacity:0.5 }}>
                  Products Count: {products.length}
                </h2>
                <div className="col-feat-grid">
                  {/* Step 4: safe rendering with per-product debug log */}
                  {products.map((product, index) => {
                    console.log("RENDERING PRODUCT:", product);
                    if (!product) return null;
                    return (
                      <div
                        key={product._id || product.id || index}
                        className="col-card-item"
                        style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
                      >
                        <ProductCard product={product} viewMode="grid" />
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ── ABOUT COLLECTION ── */}
              <section
                className="col-about-section visible"
              >
                <div className="col-about-card">
                  <div className="col-about-inner">
                    <p className="col-about-label">About This Collection</p>
                    <h2 className="col-about-title">{currentCollection.title}</h2>
                    <p className="col-about-text">{currentCollection.story}</p>
                  </div>
                </div>
              </section>

              {/* ── COLLECTION HIGHLIGHTS ── */}
              <section
                className="col-hl-section visible"
              >
                <div className="col-section-header">
                  <p className="col-section-eyebrow">Why This Collection</p>
                  <h2 className="col-section-title">Collection Highlights</h2>
                  <p className="col-section-sub">What makes this collection special</p>
                </div>
                <div className="col-hl-grid">
                  {currentCollection.highlights.map((hl, i) => {
                    const Icon = hl.icon;
                    return (
                      <div key={i} className="col-hl-card">
                        <div className="col-hl-icon-wrap">
                          <Icon size={22} color={accent} strokeWidth={2} />
                        </div>
                        <h3 className="col-hl-title">{hl.title}</h3>
                        <p className="col-hl-desc">{hl.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ── VIEW ALL BUTTON ── */}
              <div className="col-cta-wrap">
                <Link to="/products" className="col-cta-btn">
                  View All Products
                  <FiArrowRight size={17} className="col-cta-arrow" />
                </Link>
              </div>
            </>
          ) : (
            /* ── EMPTY STATE ── */
            <div className="col-empty">
              <div className="col-empty-icon">
                <FiPackage size={34} color="#fb923c" />
              </div>
              <h3 className="col-empty-title">No Products Found</h3>
              <p className="col-empty-sub">
                This collection is being curated. Check back soon!
              </p>
              <Link to="/products" className="col-empty-btn">
                Browse All Products <FiArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Collections;