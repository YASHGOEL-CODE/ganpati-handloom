import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';
import { useInteractionTracking } from '../../hooks/useInteractionTracking';
import LazyImage from '../common/LazyImage';
import { getImageUrl } from '../../utils/imageHelper';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { trackInteraction } = useInteractionTracking();
  const [isAddingToCart, setIsAddingToCart]         = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const inWishlist = isInWishlist(product._id);

  // ── All handlers completely unchanged ──
  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    setIsTogglingWishlist(true);
    if (inWishlist) {
      await removeFromWishlist(product._id);
      trackInteraction(product._id, 'remove_from_wishlist');
    } else {
      await addToWishlist(product._id);
      trackInteraction(product._id, 'add_to_wishlist');
    }
    setTimeout(() => setIsTogglingWishlist(false), 300);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    addToCart(product);
    trackInteraction(product._id, 'add_to_cart');
    setTimeout(() => setIsAddingToCart(false), 600);
  };

  const handleCardClick = () => {
    trackInteraction(product._id, 'click');
    navigate(`/products/${product._id}`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // ════════════════════
  //  LIST VIEW
  // ════════════════════
  if (viewMode === 'list') {
    return (
      <>
        <style>{`
          .pcl-card {
            display: flex; align-items: center; gap: 18px;
            background: #1e293b;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 16px; overflow: hidden;
            cursor: pointer; padding: 14px;
            transition: transform 0.26s ease, box-shadow 0.26s ease, border-color 0.26s ease;
          }
          .pcl-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 14px 36px rgba(0,0,0,0.35);
            border-color: rgba(234,88,12,0.28);
          }
          .pcl-img-wrap {
            width: 170px; height: 170px; flex-shrink: 0;
            border-radius: 11px; overflow: hidden; background: #0f172a;
          }
          @media (max-width: 500px) { .pcl-img-wrap { width: 100px; height: 100px; } }
          .pcl-img {
            width: 100%; height: 100%; object-fit: cover;
            transition: transform 0.45s ease;
          }
          .pcl-card:hover .pcl-img { transform: scale(1.06); }
          .pcl-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 7px; }
          .pcl-cat {
            font-size: 10.5px; font-weight: 700;
            color: #fb923c; text-transform: uppercase; letter-spacing: 0.12em;
          }
          /* Name + price inline row */
          .pcl-name-row {
            display: flex; align-items: flex-start;
            justify-content: space-between; gap: 12px;
          }
          .pcl-name {
            font-size: 16px; font-weight: 700; color: #f1f5f9;
            line-height: 1.35; flex: 1;
            display: -webkit-box; -webkit-line-clamp: 2;
            -webkit-box-orient: vertical; overflow: hidden;
            transition: color 0.2s;
          }
          .pcl-card:hover .pcl-name { color: #fb923c; }
          .pcl-price-wrap { flex-shrink: 0; text-align: right; }
          .pcl-price { font-size: 20px; font-weight: 800; color: #fb923c; display: block; }
          .pcl-orig  { font-size: 12px; color: rgba(255,255,255,0.32); text-decoration: line-through; }

          .pcl-rating {
            display: flex; align-items: center; gap: 5px;
          }
          .pcl-stars { font-size: 12.5px; font-weight: 700; color: #fbbf24; display: flex; align-items: center; gap: 3px; }
          .pcl-rcount { font-size: 12px; color: rgba(255,255,255,0.32); }
          .pcl-tags { display: flex; gap: 6px; flex-wrap: wrap; }
          .pcl-tag {
            font-size: 11px; font-weight: 500;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.09);
            color: rgba(255,255,255,0.5);
            padding: 3px 10px; border-radius: 999px;
          }
          .pcl-foot {
            display: flex; align-items: center; gap: 10px; margin-top: 4px;
          }
          /* Always visible Add to Cart */
          .pcl-cart {
            flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
            background: linear-gradient(135deg, #ea580c, #f97316);
            color: #fff; border: none; border-radius: 10px;
            padding: 11px 18px; font-size: 13.5px; font-weight: 700;
            cursor: pointer; letter-spacing: 0.02em;
            transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
            box-shadow: 0 4px 14px rgba(234,88,12,0.25);
          }
          .pcl-cart:hover:not(:disabled) {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 24px rgba(234,88,12,0.44);
            filter: brightness(1.08);
          }
          .pcl-cart:disabled { opacity: 0.5; cursor: not-allowed; }
          .pcl-cart.oos {
            background: rgba(255,255,255,0.07);
            color: rgba(255,255,255,0.38);
            box-shadow: none;
          }
          .pcl-cart.added { background: linear-gradient(135deg, #059669, #10b981); }
          .pcl-wish {
            width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
            background: rgba(255,255,255,0.05);
            border: 1.5px solid rgba(255,255,255,0.10);
            color: rgba(255,255,255,0.5);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
          }
          .pcl-wish:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.3); color: #f87171; transform: scale(1.08); }
          .pcl-wish.active { background: #ef4444; border-color: #ef4444; color: #fff; }
        `}</style>

        <div className="pcl-card" onClick={handleCardClick}>
          <div className="pcl-img-wrap">
            <LazyImage src={getImageUrl(product.images?.[0])} alt={product.name} className="pcl-img" />
          </div>

          <div className="pcl-body">
            <p className="pcl-cat">{product.category?.name || 'Handloom'}</p>

            {/* Name + Price inline */}
            <div className="pcl-name-row">
              <h3 className="pcl-name">{product.name}</h3>
              <div className="pcl-price-wrap">
                <span className="pcl-price">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="pcl-orig">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>

            <div className="pcl-rating">
              <span className="pcl-stars">
                <FiStar size={12} style={{ fill:'#fbbf24', color:'#fbbf24' }} />
                {product.rating?.toFixed(1) || '5.0'}
              </span>
              <span className="pcl-rcount">({product.numReviews || 0} reviews)</span>
            </div>

            <div className="pcl-tags">
              {product.fabricType && <span className="pcl-tag">{product.fabricType}</span>}
              {product.size       && <span className="pcl-tag">{product.size}</span>}
              {discount           && <span className="pcl-tag" style={{ color:'#4ade80', borderColor:'rgba(74,222,128,0.25)' }}>{discount}% off</span>}
            </div>

            {/* Always visible Add to Cart + Wishlist */}
            <div className="pcl-foot" onClick={(e) => e.stopPropagation()}>
              <button
                className={`pcl-cart ${product.stock === 0 ? 'oos' : isAddingToCart ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
              >
                {product.stock === 0 ? 'Out of Stock'
                  : isAddingToCart ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Added!
                    </>
                  ) : (
                    <><FiShoppingCart size={14} /> Add to Cart</>
                  )
                }
              </button>
              <button
                className={`pcl-wish ${inWishlist ? 'active' : ''}`}
                onClick={handleWishlistToggle}
                disabled={isTogglingWishlist}
              >
                <FiHeart size={16} style={{ fill: inWishlist ? '#fff' : 'none' }} />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ════════════════════
  //  GRID VIEW
  // ════════════════════
  return (
    <>
      <style>{`
        .pcg-card {
          position: relative;
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; overflow: hidden;
          cursor: pointer;
          transition: transform 0.26s ease, box-shadow 0.26s ease, border-color 0.26s ease;
          display: flex; flex-direction: column;
          height: 100%;
        }
        .pcg-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.42);
          border-color: rgba(234,88,12,0.28);
        }

        /* Image */
        .pcg-img-wrap {
          position: relative;
          width: 100%; height: 230px;
          overflow: hidden; background: #0f172a;
          flex-shrink: 0;
        }
        .pcg-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.55s ease;
        }
        .pcg-card:hover .pcg-img { transform: scale(1.07); }

        /* Badges */
        .pcg-badges {
          position: absolute; top: 10px; left: 10px;
          display: flex; flex-direction: column; gap: 5px; z-index: 2;
        }
        .pcg-badge {
          font-size: 10px; font-weight: 800;
          padding: 3px 9px; border-radius: 999px; white-space: nowrap;
        }
        .pcg-badge-premium  { background: linear-gradient(135deg,#f59e0b,#d97706); color:#fff; }
        .pcg-badge-handmade { background: linear-gradient(135deg,#059669,#047857); color:#fff; }
        .pcg-badge-stock    { background: #ef4444; color:#fff; }
        .pcg-discount {
          position: absolute; top: 10px; right: 10px; z-index: 2;
          background: linear-gradient(135deg,#16a34a,#15803d);
          color: #fff; font-size: 10px; font-weight: 800;
          padding: 3px 9px; border-radius: 999px;
        }

        /* Wishlist button — top right, always visible */
        .pcg-wish {
          position: absolute; top: 10px; right: 10px; z-index: 3;
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(15,23,42,0.80);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.65);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .pcg-wish:hover { transform: scale(1.12); background: rgba(239,68,68,0.18); color: #f87171; }
        .pcg-wish.active { background: #ef4444; color: #fff; border-color: #ef4444; }

        /* Info section */
        .pcg-info {
          padding: 14px 14px 0;
          display: flex; flex-direction: column; gap: 6px;
          flex: 1;
        }
        .pcg-cat {
          font-size: 10.5px; font-weight: 700;
          color: #fb923c; text-transform: uppercase; letter-spacing: 0.12em;
        }

        /* ── NAME + PRICE INLINE ROW ── */
        .pcg-name-price {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }
        .pcg-name {
          font-size: 14px; font-weight: 700; color: #f1f5f9;
          line-height: 1.4; flex: 1;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          min-height: 2.8em;
          transition: color 0.2s;
        }
        .pcg-card:hover .pcg-name { color: #fb923c; }
        .pcg-price-col {
          flex-shrink: 0;
          display: flex; flex-direction: column; align-items: flex-end;
        }
        .pcg-price {
          font-size: 17px; font-weight: 800; color: #fb923c;
          white-space: nowrap;
        }
        .pcg-orig {
          font-size: 11.5px; color: rgba(255,255,255,0.30);
          text-decoration: line-through; white-space: nowrap;
        }

        /* Rating */
        .pcg-rating {
          display: flex; align-items: center; gap: 5px;
        }
        .pcg-stars { font-size: 12px; font-weight: 700; color: #fbbf24; display: flex; align-items: center; gap: 3px; }
        .pcg-rcount { font-size: 11.5px; color: rgba(255,255,255,0.30); }

        /* Tags */
        .pcg-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .pcg-tag {
          font-size: 10.5px; font-weight: 500;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.45);
          padding: 2px 9px; border-radius: 999px;
        }

        /* ── ADD TO CART — always visible at bottom ── */
        .pcg-cart-wrap {
          padding: 12px 14px 14px;
          margin-top: auto;
        }
        .pcg-cart {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none; border-radius: 11px;
          padding: 12px;
          font-size: 13.5px; font-weight: 700;
          cursor: pointer; letter-spacing: 0.02em;
          transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
          box-shadow: 0 4px 14px rgba(234,88,12,0.22);
        }
        /* Hover effect on button */
        .pcg-cart:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 26px rgba(234,88,12,0.46);
          filter: brightness(1.10);
        }
        .pcg-cart:active:not(:disabled) { transform: scale(0.98); }
        .pcg-cart:disabled { opacity: 0.46; cursor: not-allowed; }
        .pcg-cart.oos {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.36);
          box-shadow: none;
        }
        .pcg-cart.added {
          background: linear-gradient(135deg, #059669, #10b981);
        }
      `}</style>

      <div className="pcg-card" onClick={handleCardClick}>

        {/* Image */}
        <div className="pcg-img-wrap">
          <LazyImage
            src={getImageUrl(product.images?.[0])}
            alt={product.name}
            className="pcg-img"
          />

          {/* Badges */}
          <div className="pcg-badges">
            {product.isPremium  && <span className="pcg-badge pcg-badge-premium">Premium</span>}
            {product.isHandmade && <span className="pcg-badge pcg-badge-handmade">Handmade</span>}
            {product.stock < 5 && product.stock > 0 && (
              <span className="pcg-badge pcg-badge-stock">Only {product.stock} left</span>
            )}
          </div>
          {discount && !inWishlist && <span className="pcg-discount">{discount}% off</span>}

          {/* Wishlist — top right of image */}
          <button
            className={`pcg-wish ${inWishlist ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleWishlistToggle(e); }}
            disabled={isTogglingWishlist}
          >
            <FiHeart size={15} style={{ fill: inWishlist ? '#fff' : 'none' }} />
          </button>
        </div>

        {/* Info */}
        <div className="pcg-info">
          <p className="pcg-cat">{product.category?.name || 'Handloom'}</p>

          {/* ── Name on left, Price on right ── */}
          <div className="pcg-name-price">
            <h3 className="pcg-name">{product.name}</h3>
            <div className="pcg-price-col">
              <span className="pcg-price">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="pcg-orig">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
          </div>

          <div className="pcg-rating">
            <span className="pcg-stars">
              <FiStar size={11} style={{ fill:'#fbbf24', color:'#fbbf24' }} />
              {product.rating?.toFixed(1) || '5.0'}
            </span>
            <span className="pcg-rcount">({product.numReviews || 0})</span>
          </div>

          <div className="pcg-tags">
            {product.fabricType && <span className="pcg-tag">{product.fabricType}</span>}
            {product.size       && <span className="pcg-tag">{product.size}</span>}
          </div>
        </div>

        {/* ── Always visible Add to Cart ── */}
        <div className="pcg-cart-wrap" onClick={(e) => e.stopPropagation()}>
          <button
            className={`pcg-cart ${product.stock === 0 ? 'oos' : isAddingToCart ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
          >
            {product.stock === 0
              ? 'Out of Stock'
              : isAddingToCart
              ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Added to Cart!
                </>
              )
              : (
                <><FiShoppingCart size={15} /> Add to Cart</>
              )
            }
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductCard;