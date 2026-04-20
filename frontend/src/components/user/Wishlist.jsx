import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import Loader from '../common/Loader';
import { getImageUrl } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/helpers';
import {
  FiHeart, FiShoppingCart, FiEye, FiTrash2,
  FiArrowRight, FiPackage, FiStar,
} from 'react-icons/fi';

/* ─────────────────────────────────────
   Individual Wishlist Card
   — all wishlist/cart logic unchanged
───────────────────────────────────── */
const WishlistCard = ({ item, onRemove, onMoveToCart, removing }) => {
  const [hovered, setHovered]   = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const navigate = useNavigate();
  const product = item.product;

  const handleMoveToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCartAdded(true);
    onMoveToCart(product);
    setTimeout(() => setCartAdded(false), 1800);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(product._id);
  };

  const handleView = (e) => {
    e.preventDefault();
    navigate(`/products/${product._id}`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div
      className={`wl-card ${removing ? 'removing' : ''} ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="wl-card-img-wrap">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.name}
          className="wl-card-img"
        />

        {/* Badges */}
        <div className="wl-badges">
          {product.isPremium  && <span className="wl-badge wl-badge-premium">Premium</span>}
          {product.isHandmade && <span className="wl-badge wl-badge-handmade">Handmade</span>}
          {discount           && <span className="wl-badge wl-badge-discount">{discount}% off</span>}
        </div>

        {/* Remove button top-right */}
        <button
          className="wl-remove-btn"
          onClick={handleRemove}
          title="Remove from wishlist"
        >
          <FiTrash2 size={14} />
        </button>

        {/* Hover overlay */}
        <div className={`wl-overlay ${hovered ? 'visible' : ''}`}>
          <button className="wl-overlay-btn view" onClick={handleView}>
            <FiEye size={15} /> View Product
          </button>
          <button
            className={`wl-overlay-btn cart ${cartAdded ? 'added' : ''}`}
            onClick={handleMoveToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? (
              'Out of Stock'
            ) : cartAdded ? (
              <><FiShoppingCart size={15} /> Added!</>
            ) : (
              <><FiShoppingCart size={15} /> Move to Cart</>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="wl-card-info">
        <p className="wl-card-cat">{product.category?.name || 'Handloom'}</p>

        {/* Name + price row */}
        <div className="wl-card-name-row">
          <h3 className="wl-card-name">{product.name}</h3>
          <div className="wl-card-price-col">
            <span className="wl-card-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="wl-card-orig">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="wl-card-rating">
          <FiStar size={11} style={{ fill:'#fbbf24', color:'#fbbf24' }} />
          <span className="wl-card-rating-val">{product.rating?.toFixed(1) || '5.0'}</span>
          <span className="wl-card-rating-count">({product.numReviews || 0})</span>
        </div>

        {/* Move to cart — always visible at bottom */}
        <button
          className={`wl-card-cart-btn ${cartAdded ? 'added' : ''} ${product.stock === 0 ? 'oos' : ''}`}
          onClick={handleMoveToCart}
          disabled={product.stock === 0 || cartAdded}
        >
          {product.stock === 0 ? 'Out of Stock'
            : cartAdded
            ? <><FiShoppingCart size={14} /> Added to Cart!</>
            : <><FiShoppingCart size={14} /> Move to Cart</>
          }
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   Main Wishlist Page
───────────────────────────────────── */
const Wishlist = () => {
  // ── All context usage completely unchanged ──
  const { wishlistItems, loading, removeFromWishlist, fetchWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [removing, setRemoving] = useState(null);
  const [allMoving, setAllMoving] = useState(false);

  // ✅ FIX: Fetch wishlist on mount — auto-fetching is disabled in context
  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    setRemoving(productId);
    setTimeout(async () => {
      await removeFromWishlist(productId);
      setRemoving(null);
    }, 350);
  };

  const handleMoveToCart = (product) => {
    addToCart(product);
  };

  const handleMoveAll = () => {
    setAllMoving(true);
    wishlistItems.forEach(({ product }) => addToCart(product));
    setTimeout(() => setAllMoving(false), 1800);
  };

  if (loading) return <Loader />;

  const count = wishlistItems.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .wl-page {
          min-height: 100vh;
          background: linear-gradient(160deg, #060b17 0%, #0d1525 50%, #060b17 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 0 0 120px;
        }
        .wl-wrap { max-width: 1320px; margin: 0 auto; padding: 0 28px; }
        @media (max-width: 640px) { .wl-wrap { padding: 0 16px; } }

        /* ── HEADER ── */
        .wl-header {
          padding: 52px 0 36px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 40px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .wl-header-left {}
        .wl-header-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700;
          color: #ea580c;
          letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 10px;
        }
        .wl-header-eyebrow::before {
          content: ''; display: inline-block;
          width: 18px; height: 1.5px; background: #ea580c;
        }
        .wl-header-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 46px);
          font-weight: 800; color: #fff;
          line-height: 1.1; letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        .wl-header-sub {
          font-size: 15px; color: rgba(255,255,255,0.40);
          display: flex; align-items: center; gap: 10px;
        }
        .wl-count-badge {
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(234,88,12,0.15);
          border: 1px solid rgba(234,88,12,0.28);
          color: #fb923c;
          font-size: 12px; font-weight: 700;
          padding: 2px 10px; border-radius: 999px;
        }
        .wl-header-actions {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .wl-move-all-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none; border-radius: 11px;
          padding: 12px 22px; font-size: 13.5px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform 0.22s, box-shadow 0.22s, filter 0.22s;
          box-shadow: 0 4px 16px rgba(234,88,12,0.28);
          letter-spacing: 0.02em;
        }
        .wl-move-all-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 26px rgba(234,88,12,0.44);
          filter: brightness(1.08);
        }
        .wl-move-all-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .wl-move-all-btn.success { background: linear-gradient(135deg, #059669, #10b981); }

        /* ── GRID ── */
        .wl-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
        }
        @media (max-width: 1200px) { .wl-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 900px)  { .wl-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
        @media (max-width: 480px)  { .wl-grid { grid-template-columns: 1fr; } }

        /* ── WISHLIST CARD ── */
        .wl-card {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; overflow: hidden;
          display: flex; flex-direction: column;
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
          position: relative;
        }
        .wl-card.hovered {
          transform: translateY(-7px);
          box-shadow: 0 24px 56px rgba(0,0,0,0.45);
          border-color: rgba(234,88,12,0.22);
        }
        .wl-card.removing {
          opacity: 0;
          transform: scale(0.92) translateY(10px);
          transition: opacity 0.35s ease, transform 0.35s ease;
        }

        /* Image */
        .wl-card-img-wrap {
          position: relative; width: 100%; height: 230px;
          overflow: hidden; background: #0f172a; flex-shrink: 0;
        }
        .wl-card-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.55s ease;
        }
        .wl-card.hovered .wl-card-img { transform: scale(1.07); }

        /* Badges */
        .wl-badges {
          position: absolute; top: 10px; left: 10px;
          display: flex; flex-direction: column; gap: 5px; z-index: 2;
        }
        .wl-badge {
          font-size: 10px; font-weight: 800;
          padding: 3px 9px; border-radius: 999px; white-space: nowrap;
        }
        .wl-badge-premium  { background: linear-gradient(135deg,#f59e0b,#d97706); color:#fff; }
        .wl-badge-handmade { background: linear-gradient(135deg,#059669,#047857); color:#fff; }
        .wl-badge-discount { background: linear-gradient(135deg,#16a34a,#15803d); color:#fff; }

        /* Remove button */
        .wl-remove-btn {
          position: absolute; top: 10px; right: 10px; z-index: 4;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(15,23,42,0.80);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.50);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .wl-remove-btn:hover {
          background: rgba(239,68,68,0.20);
          border-color: rgba(239,68,68,0.35);
          color: #f87171;
          transform: scale(1.12);
        }

        /* Hover overlay */
        .wl-overlay {
          position: absolute; inset: 0; z-index: 3;
          background: linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.20) 60%, transparent 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-end;
          padding: 16px;
          gap: 8px;
          opacity: 0; transition: opacity 0.28s ease;
        }
        .wl-overlay.visible { opacity: 1; }

        .wl-overlay-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; border: none;
          transition: transform 0.2s, filter 0.2s;
          letter-spacing: 0.02em;
        }
        .wl-overlay-btn:hover:not(:disabled) { transform: scale(1.02); filter: brightness(1.08); }
        .wl-overlay-btn.view {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.22);
          color: #fff;
        }
        .wl-overlay-btn.view:hover { background: rgba(255,255,255,0.22); }
        .wl-overlay-btn.cart {
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff;
        }
        .wl-overlay-btn.cart.added { background: linear-gradient(135deg, #059669, #10b981); }
        .wl-overlay-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Info */
        .wl-card-info {
          padding: 14px 15px 16px;
          display: flex; flex-direction: column; gap: 6px;
          flex: 1;
        }
        .wl-card-cat {
          font-size: 10.5px; font-weight: 700;
          color: #fb923c; text-transform: uppercase; letter-spacing: 0.12em;
        }
        .wl-card-name-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 10px;
        }
        .wl-card-name {
          font-size: 14px; font-weight: 700; color: #f1f5f9;
          line-height: 1.4; flex: 1;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          min-height: 2.8em;
          transition: color 0.2s;
        }
        .wl-card.hovered .wl-card-name { color: #fb923c; }
        .wl-card-price-col { flex-shrink: 0; text-align: right; }
        .wl-card-price {
          display: block; font-size: 16px; font-weight: 800;
          color: #fb923c;
        }
        .wl-card-orig {
          display: block; font-size: 11.5px;
          color: rgba(255,255,255,0.30);
          text-decoration: line-through;
        }
        .wl-card-rating {
          display: flex; align-items: center; gap: 4px;
        }
        .wl-card-rating-val  { font-size: 12px; font-weight: 700; color: #fbbf24; }
        .wl-card-rating-count { font-size: 11.5px; color: rgba(255,255,255,0.28); }

        /* Always-visible cart button */
        .wl-card-cart-btn {
          width: 100%; margin-top: auto;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none; border-radius: 10px;
          padding: 11px; font-size: 13px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform 0.22s, box-shadow 0.22s, filter 0.22s;
          box-shadow: 0 3px 12px rgba(234,88,12,0.20);
          letter-spacing: 0.02em;
        }
        .wl-card-cart-btn:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 6px 20px rgba(234,88,12,0.38);
          filter: brightness(1.08);
        }
        .wl-card-cart-btn.added { background: linear-gradient(135deg,#059669,#10b981); }
        .wl-card-cart-btn.oos {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.35);
          box-shadow: none; cursor: not-allowed;
        }
        .wl-card-cart-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── EMPTY STATE ── */
        .wl-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 100px 20px; text-align: center;
        }
        .wl-empty-icon-wrap {
          width: 100px; height: 100px; border-radius: 50%;
          background: rgba(234,88,12,0.08);
          border: 1px solid rgba(234,88,12,0.18);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
          animation: wlHeartPulse 2.5s ease-in-out infinite;
        }
        @keyframes wlHeartPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(234,88,12,0.15); }
          50%      { box-shadow: 0 0 0 14px rgba(234,88,12,0); }
        }
        .wl-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 3vw, 30px);
          font-weight: 700; color: #f1f5f9;
          margin-bottom: 10px;
        }
        .wl-empty-sub {
          font-size: 15px; color: rgba(255,255,255,0.40);
          max-width: 320px; margin: 0 auto 28px;
          line-height: 1.65;
        }
        .wl-empty-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; text-decoration: none;
          padding: 14px 32px; border-radius: 12px;
          font-size: 14.5px; font-weight: 700;
          transition: transform 0.22s, box-shadow 0.22s;
          box-shadow: 0 6px 20px rgba(234,88,12,0.30);
          letter-spacing: 0.02em;
        }
        .wl-empty-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 32px rgba(234,88,12,0.46);
        }
        .wl-empty-btn .arrow { transition: transform 0.22s; }
        .wl-empty-btn:hover .arrow { transform: translateX(4px); }

        /* ── STICKY BOTTOM BAR ── */
        .wl-bottom-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 40;
          background: rgba(13,21,37,0.95);
          backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 14px 28px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
          box-shadow: 0 -8px 32px rgba(0,0,0,0.35);
          animation: barSlideUp 0.35s ease both;
        }
        @keyframes barSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 640px) { .wl-bottom-bar { padding: 12px 16px; } }
        .wl-bar-left {
          font-size: 13.5px; color: rgba(255,255,255,0.50); font-weight: 500;
        }
        .wl-bar-left strong { color: #f1f5f9; font-weight: 700; }
        .wl-bar-right { display: flex; align-items: center; gap: 10px; }
        .wl-bar-btn-sec {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.60);
          font-size: 13px; font-weight: 600;
          padding: 10px 18px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .wl-bar-btn-sec:hover { background: rgba(255,255,255,0.10); color: #fff; }
        .wl-bar-btn-pri {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none;
          font-size: 13px; font-weight: 700;
          padding: 10px 22px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
          box-shadow: 0 4px 14px rgba(234,88,12,0.28);
        }
        .wl-bar-btn-pri:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 7px 20px rgba(234,88,12,0.42);
          filter: brightness(1.07);
        }
        .wl-bar-btn-pri.success { background: linear-gradient(135deg,#059669,#10b981); }
        .wl-bar-btn-pri:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="wl-page">
        <div className="wl-wrap">

          {/* ── HEADER ── */}
          <div className="wl-header">
            <div className="wl-header-left">
              <p className="wl-header-eyebrow">My Collection</p>
              <h1 className="wl-header-title">Your Wishlist</h1>
              <p className="wl-header-sub">
                Saved items for later
                {count > 0 && (
                  <span className="wl-count-badge">{count} {count === 1 ? 'item' : 'items'}</span>
                )}
              </p>
            </div>

            {count > 0 && (
              <div className="wl-header-actions">
                <button
                  className={`wl-move-all-btn ${allMoving ? 'success' : ''}`}
                  onClick={handleMoveAll}
                  disabled={allMoving}
                >
                  <FiShoppingCart size={15} />
                  {allMoving ? 'All Added!' : 'Move All to Cart'}
                </button>
              </div>
            )}
          </div>

          {/* ── GRID or EMPTY ── */}
          {count > 0 ? (
            <div className="wl-grid">
              {wishlistItems.map((item) => (
                <WishlistCard
                  key={item.product._id}
                  item={item}
                  onRemove={handleRemove}
                  onMoveToCart={handleMoveToCart}
                  removing={removing === item.product._id}
                />
              ))}
            </div>
          ) : (
            <div className="wl-empty">
              <div className="wl-empty-icon-wrap">
                <FiHeart size={42} color="#fb923c" strokeWidth={1.5} />
              </div>
              <h2 className="wl-empty-title">Your wishlist is empty</h2>
              <p className="wl-empty-sub">
                Save your favourite handloom products here and come back anytime.
              </p>
              <Link to="/products" className="wl-empty-btn">
                Explore Products
                <FiArrowRight size={16} className="arrow" />
              </Link>
            </div>
          )}
        </div>

        {/* ── STICKY BOTTOM BAR ── */}
        {count > 0 && (
          <div className="wl-bottom-bar">
            <p className="wl-bar-left">
              <strong>{count}</strong> saved {count === 1 ? 'item' : 'items'}
            </p>
            <div className="wl-bar-right">
              <button
                className={`wl-bar-btn-pri ${allMoving ? 'success' : ''}`}
                onClick={handleMoveAll}
                disabled={allMoving}
              >
                <FiShoppingCart size={14} />
                {allMoving ? 'All Added to Cart!' : 'Move All to Cart'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;