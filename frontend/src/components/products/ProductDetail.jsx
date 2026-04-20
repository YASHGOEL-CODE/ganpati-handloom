import FrequentlyBoughtTogether from '../recommendations/FrequentlyBoughtTogether';
import { useInteractionTracking } from '../../hooks/useInteractionTracking';
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, reviewsAPI } from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { formatPrice, generateStars } from '../../utils/helpers';
import Loader from '../common/Loader';
import ImageGallery from './ImageGallery';
import ReviewList from '../reviews/ReviewList';
import ReviewForm from '../reviews/ReviewForm';
import SimilarProducts from './SimilarProducts';
import RelatedProducts from './RelatedProducts';
import {
  FiShoppingCart, FiHeart, FiStar, FiCheck, FiTruck,
  FiHome, FiChevronRight, FiMinus, FiPlus, FiRefreshCw, FiShield,
} from 'react-icons/fi';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct]   = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const { addToCart } = useContext(CartContext);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { trackInteraction } = useInteractionTracking();

  // ── All data fetching completely unchanged ──
  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getProductReviews(id);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // ── All handlers completely unchanged ──
  const handleAddToCart = () => {
    addToCart(product, quantity);
    trackInteraction(product._id, 'add_to_cart', { quantity });
    alert('Product added to cart!');
  };

  const handleWishlistToggle = async () => {
    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
      trackInteraction(product._id, 'remove_from_wishlist');
    } else {
      await addToWishlist(product._id);
      trackInteraction(product._id, 'add_to_wishlist');
    }
  };

  if (loading) return <Loader />;
  if (!product)  return null;

  const stars    = generateStars(product.rating);
  const inWish   = isInWishlist(product._id);
  const inStock  = product.stock > 0;

  const TABS = [
    { key: 'description',    label: 'Description' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'care',           label: 'Care Instructions' },
  ];

  const TRUST = [
    { icon: FiCheck,      label: 'Authentic Handloom',  color: '#22c55e' },
    { icon: FiTruck,      label: 'Free Shipping',        color: '#3b82f6' },
    { icon: FiRefreshCw,  label: '7-Day Returns',        color: '#f97316' },
    { icon: FiShield,     label: 'Quality Assured',      color: '#a855f7' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .pd-page {
          min-height: 100vh;
          background: linear-gradient(160deg, #0a0f1e 0%, #111827 70%, #0a0f1e 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 28px 0 80px;
        }
        .pd-wrap {
          max-width: 1320px; margin: 0 auto;
          padding: 0 28px;
        }
        @media (max-width: 640px) { .pd-wrap { padding: 0 16px; } }

        /* ── BREADCRUMB ── */
        .pd-crumb {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.28);
          margin-bottom: 28px;
        }
        .pd-crumb a {
          color: rgba(255,255,255,0.28); text-decoration: none;
          display: flex; align-items: center; gap: 4px;
          transition: color 0.18s;
        }
        .pd-crumb a:hover { color: rgba(255,255,255,0.70); }
        .pd-crumb-active { color: rgba(255,255,255,0.60); }

        /* ── HERO GRID ── */
        .pd-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          margin-bottom: 64px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .pd-hero { grid-template-columns: 1fr; gap: 32px; }
        }

        /* ── IMAGE SIDE ── */
        .pd-img-wrap {
          position: sticky; top: 88px;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.50);
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.07);
          transition: box-shadow 0.3s ease;
        }
        .pd-img-wrap:hover {
          box-shadow: 0 32px 80px rgba(0,0,0,0.60);
        }
        @media (max-width: 900px) { .pd-img-wrap { position: static; } }

        /* ── INFO SIDE ── */
        .pd-info { display: flex; flex-direction: column; gap: 0; }

        /* Category */
        .pd-cat {
          font-size: 11px; font-weight: 700;
          color: #ea580c;
          letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 10px;
        }

        /* Title */
        .pd-title {
          font-size: clamp(24px, 3vw, 38px);
          font-weight: 800; color: #fff;
          line-height: 1.15; letter-spacing: -0.02em;
          margin-bottom: 14px;
        }

        /* Rating row */
        .pd-rating {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 18px;
        }
        .pd-stars { display: flex; align-items: center; gap: 2px; }
        .pd-rating-val {
          font-size: 13px; font-weight: 600; color: #fbbf24;
        }
        .pd-rating-count { font-size: 13px; color: rgba(255,255,255,0.32); }

        /* Badges */
        .pd-badges {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .pd-badge {
          font-size: 11px; font-weight: 700;
          padding: 4px 12px; border-radius: 999px;
          letter-spacing: 0.04em;
        }
        .pd-badge-premium  { background: linear-gradient(135deg,#f59e0b,#d97706); color:#fff; }
        .pd-badge-handmade { background: linear-gradient(135deg,#059669,#047857); color:#fff; }

        /* Price */
        .pd-price-row {
          display: flex; align-items: baseline; gap: 12px;
          margin-bottom: 22px;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .pd-price {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          background: linear-gradient(90deg, #fb923c, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .pd-orig {
          font-size: 18px; color: rgba(255,255,255,0.28);
          text-decoration: line-through;
        }
        .pd-discount {
          font-size: 13px; font-weight: 700;
          background: rgba(34,197,94,0.15);
          color: #4ade80;
          padding: 3px 10px; border-radius: 999px;
        }

        /* Attributes grid */
        .pd-attrs {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 22px;
        }
        .pd-attr {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 12px 14px;
        }
        .pd-attr-label {
          font-size: 10.5px; font-weight: 600;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 4px;
        }
        .pd-attr-val {
          font-size: 14px; font-weight: 600;
          color: #f1f5f9; text-transform: capitalize;
        }
        .pd-attr-val.stock-ok  { color: #4ade80; }
        .pd-attr-val.stock-out { color: #f87171; }

        /* Quantity stepper */
        .pd-qty-label {
          font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 10px;
        }
        .pd-qty {
          display: inline-flex; align-items: center;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.10);
          border-radius: 12px; overflow: hidden;
          margin-bottom: 22px;
        }
        .pd-qty-btn {
          width: 42px; height: 42px;
          background: transparent; border: none;
          color: rgba(255,255,255,0.65);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
        }
        .pd-qty-btn:hover:not(:disabled) {
          background: rgba(234,88,12,0.15); color: #fb923c;
        }
        .pd-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .pd-qty-val {
          min-width: 46px; text-align: center;
          font-size: 16px; font-weight: 700; color: #fff;
          border-left: 1px solid rgba(255,255,255,0.08);
          border-right: 1px solid rgba(255,255,255,0.08);
          padding: 0 4px;
        }

        /* Action buttons */
        .pd-actions {
          display: flex; gap: 12px; margin-bottom: 24px;
        }
        .pd-cart-btn {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none; border-radius: 14px;
          padding: 15px 24px;
          font-size: 15px; font-weight: 700;
          cursor: pointer; letter-spacing: 0.02em;
          transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
          box-shadow: 0 6px 22px rgba(234,88,12,0.32);
        }
        .pd-cart-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 32px rgba(234,88,12,0.48);
          filter: brightness(1.08);
        }
        .pd-cart-btn:disabled {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.30);
          box-shadow: none; cursor: not-allowed;
        }
        .pd-wish-btn {
          width: 52px; height: 52px; flex-shrink: 0;
          border-radius: 14px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.22s, border-color 0.22s, color 0.22s, transform 0.22s;
        }
        .pd-wish-btn:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.35); color: #f87171; transform: scale(1.06); }
        .pd-wish-btn.active { background: #ef4444; border-color: #ef4444; color: #fff; }

        /* Trust badges */
        .pd-trust {
          display: grid; grid-template-columns: repeat(2,1fr);
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .pd-trust-item {
          display: flex; align-items: center; gap: 9px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
        }
        .pd-trust-icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .pd-trust-lbl {
          font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.60);
        }

        /* ── TABS ── */
        .pd-tabs-section {
          margin-bottom: 64px;
        }
        .pd-tabs-bar {
          display: flex; gap: 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 28px;
          overflow-x: auto; scrollbar-width: none;
        }
        .pd-tabs-bar::-webkit-scrollbar { display: none; }
        .pd-tab-btn {
          padding: 13px 22px;
          font-size: 13.5px; font-weight: 600;
          color: rgba(255,255,255,0.38);
          background: transparent; border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer; white-space: nowrap;
          transition: color 0.2s, border-color 0.2s;
          margin-bottom: -1px;
        }
        .pd-tab-btn:hover:not(.active) { color: rgba(255,255,255,0.72); }
        .pd-tab-btn.active { color: #fff; border-bottom-color: #ea580c; }

        .pd-tab-content {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 28px 32px;
          animation: tabFade 0.3s ease;
        }
        @keyframes tabFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .pd-tab-text {
          font-size: 15px; color: rgba(255,255,255,0.60);
          line-height: 1.85;
        }
        .pd-spec-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr));
          gap: 12px;
        }
        .pd-spec-item {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 14px 16px;
        }
        .pd-spec-key {
          font-size: 11px; font-weight: 700;
          color: rgba(255,255,255,0.32);
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 5px;
        }
        .pd-spec-val {
          font-size: 14px; font-weight: 600;
          color: #f1f5f9; text-transform: capitalize;
        }
        .pd-care-box {
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.18);
          border-radius: 12px; padding: 18px 22px;
        }
        .pd-care-text {
          font-size: 14.5px; color: rgba(147,197,253,0.85);
          line-height: 1.75;
        }

        /* ── SECTION DIVIDER ── */
        .pd-section {
          margin-bottom: 64px;
        }
        .pd-section-header {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 28px;
        }
        .pd-section-title {
          font-size: clamp(20px, 2.5vw, 26px);
          font-weight: 700; color: #f1f5f9;
          white-space: nowrap;
        }
        .pd-section-line {
          flex: 1; height: 1px;
          background: linear-gradient(to right, rgba(255,255,255,0.10), transparent);
        }

        /* ── REVIEWS ── */
        .pd-reviews-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }
        @media (min-width: 1024px) {
          .pd-reviews-grid { grid-template-columns: 1fr 420px; }
        }
        .pd-review-form-wrap {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 28px;
        }
        .pd-review-form-title {
          font-size: 16px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        /* Child component overrides — make them visible on dark bg */
        .pd-page .bg-white,
        .pd-page .bg-gray-50 {
          background: rgba(255,255,255,0.04) !important;
        }
        .pd-page .dark\\:bg-gray-800,
        .pd-page .dark\\:bg-gray-900 {
          background: rgba(255,255,255,0.04) !important;
        }
        .pd-page .text-gray-900,
        .pd-page .dark\\:text-white {
          color: #f1f5f9 !important;
        }
        .pd-page .text-gray-600,
        .pd-page .dark\\:text-gray-400 {
          color: rgba(255,255,255,0.52) !important;
        }
        .pd-page .border-gray-200,
        .pd-page .dark\\:border-gray-700 {
          border-color: rgba(255,255,255,0.08) !important;
        }
        .pd-page .rounded-xl { border-radius: 14px !important; }
        .pd-page .shadow-md  { box-shadow: 0 8px 28px rgba(0,0,0,0.35) !important; }

        @media (max-width: 640px) {
          .pd-attrs   { grid-template-columns: 1fr 1fr; }
          .pd-trust   { grid-template-columns: 1fr 1fr; }
          .pd-actions { flex-wrap: wrap; }
          .pd-cart-btn { min-width: 0; }
          .pd-tab-content { padding: 20px 18px; }
        }
      `}</style>

      <div className="pd-page">
        <div className="pd-wrap">

          {/* ── BREADCRUMB ── */}
          <nav className="pd-crumb">
            <a href="/"><FiHome size={12} /> Home</a>
            <FiChevronRight size={11} style={{ opacity:0.3 }} />
            <a href="/products">Products</a>
            <FiChevronRight size={11} style={{ opacity:0.3 }} />
            <span className="pd-crumb-active">{product.name}</span>
          </nav>

          {/* ── HERO: IMAGE + INFO ── */}
          <div className="pd-hero">

            {/* LEFT — Image gallery */}
            <div className="pd-img-wrap">
              <ImageGallery images={product.images} />
            </div>

            {/* RIGHT — Product info */}
            <div className="pd-info">

              {/* Category */}
              <p className="pd-cat">{product.category?.name || 'Handloom'}</p>

              {/* Title */}
              <h1 className="pd-title">{product.name}</h1>

              {/* Rating */}
              <div className="pd-rating">
                <div className="pd-stars">
                  {stars.map((star, i) => (
                    <FiStar
                      key={i}
                      size={16}
                      style={{
                        fill:  star === 'full' ? '#fbbf24' : star === 'half' ? '#fde68a' : 'none',
                        color: star === 'empty' ? 'rgba(255,255,255,0.20)' : '#fbbf24',
                      }}
                    />
                  ))}
                </div>
                <span className="pd-rating-val">{product.rating?.toFixed(1) || '0.0'}</span>
                <span className="pd-rating-count">({product.numReviews || 0} reviews)</span>
              </div>

              {/* Badges */}
              {(product.isPremium || product.isHandmade) && (
                <div className="pd-badges">
                  {product.isPremium  && <span className="pd-badge pd-badge-premium">✦ Premium</span>}
                  {product.isHandmade && <span className="pd-badge pd-badge-handmade">✿ Handmade</span>}
                </div>
              )}

              {/* Price */}
              <div className="pd-price-row">
                <span className="pd-price">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="pd-orig">{formatPrice(product.originalPrice)}</span>
                    <span className="pd-discount">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>

              {/* Attributes */}
              <div className="pd-attrs">
                <div className="pd-attr">
                  <p className="pd-attr-label">Fabric</p>
                  <p className="pd-attr-val">{product.fabricType || '—'}</p>
                </div>
                <div className="pd-attr">
                  <p className="pd-attr-label">Size</p>
                  <p className="pd-attr-val">{product.size || '—'}</p>
                </div>
                <div className="pd-attr">
                  <p className="pd-attr-label">Color</p>
                  <p className="pd-attr-val">{product.color || '—'}</p>
                </div>
                <div className="pd-attr">
                  <p className="pd-attr-label">Availability</p>
                  <p className={`pd-attr-val ${inStock ? 'stock-ok' : 'stock-out'}`}>
                    {inStock ? `${product.stock} in stock` : 'Out of Stock'}
                  </p>
                </div>
              </div>

              {/* Quantity stepper */}
              {inStock && (
                <div style={{ marginBottom: 22 }}>
                  <p className="pd-qty-label">Quantity</p>
                  <div className="pd-qty">
                    <button
                      className="pd-qty-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <FiMinus size={15} />
                    </button>
                    <span className="pd-qty-val">{quantity}</span>
                    <button
                      className="pd-qty-btn"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <FiPlus size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pd-actions">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="pd-cart-btn"
                >
                  <FiShoppingCart size={18} />
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`pd-wish-btn ${inWish ? 'active' : ''}`}
                >
                  <FiHeart size={20} style={{ fill: inWish ? '#fff' : 'none' }} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="pd-trust">
                {TRUST.map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <div key={i} className="pd-trust-item">
                      <div
                        className="pd-trust-icon"
                        style={{ background: `${t.color}18`, border: `1px solid ${t.color}30` }}
                      >
                        <Icon size={15} color={t.color} />
                      </div>
                      <span className="pd-trust-lbl">{t.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── DESCRIPTION / SPECS / CARE TABS ── */}
          <div className="pd-tabs-section">
            <div className="pd-tabs-bar">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`pd-tab-btn ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <div className="pd-tab-content">
                <p className="pd-tab-text">{product.description || 'No description available.'}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="pd-tab-content">
                <div className="pd-spec-grid">
                  {[
                    { key: 'Fabric',    val: product.fabricType },
                    { key: 'Size',      val: product.size },
                    { key: 'Color',     val: product.color },
                    { key: 'Category',  val: product.category?.name },
                    { key: 'Stock',     val: product.stock > 0 ? `${product.stock} units` : 'Out of stock' },
                    { key: 'Rating',    val: `${product.rating?.toFixed(1) || '0.0'} / 5.0` },
                  ].filter(s => s.val).map((s, i) => (
                    <div key={i} className="pd-spec-item">
                      <p className="pd-spec-key">{s.key}</p>
                      <p className="pd-spec-val">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="pd-tab-content">
                {product.careInstructions ? (
                  <div className="pd-care-box">
                    <p className="pd-care-text">{product.careInstructions}</p>
                  </div>
                ) : (
                  <p className="pd-tab-text">No care instructions available for this product.</p>
                )}
              </div>
            )}
          </div>

          {/* ── FREQUENTLY BOUGHT TOGETHER ── */}
          <div className="pd-section">
            <div className="pd-section-header">
              <h2 className="pd-section-title">Frequently Bought Together</h2>
              <div className="pd-section-line" />
            </div>
            <FrequentlyBoughtTogether productId={product._id} currentProduct={product} />
          </div>

          {/* ── RELATED PRODUCTS ── */}
          <div className="pd-section">
            <div className="pd-section-header">
              <h2 className="pd-section-title">From the Same Category</h2>
              <div className="pd-section-line" />
            </div>
            <RelatedProducts
              categoryId={product.category?._id}
              currentProductId={product._id}
            />
          </div>

          {/* ── SIMILAR PRODUCTS ── */}
          <div className="pd-section">
            <div className="pd-section-header">
              <h2 className="pd-section-title">You May Also Like</h2>
              <div className="pd-section-line" />
            </div>
            <SimilarProducts productId={product._id} />
          </div>

          {/* ── REVIEWS ── */}
          <div className="pd-section">
            <div className="pd-section-header">
              <h2 className="pd-section-title">Customer Reviews</h2>
              <div className="pd-section-line" />
            </div>
            <div className="pd-reviews-grid">
              <ReviewList reviews={reviews} />
              <div className="pd-review-form-wrap">
                <p className="pd-review-form-title">Write a Review</p>
                <ReviewForm productId={product._id} onReviewAdded={fetchReviews} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProductDetail;