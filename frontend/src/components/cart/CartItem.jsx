import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/helpers';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageHelper';

const CartItem = ({ item }) => {
  // ── All logic completely unchanged ──
  const { updateQuantity, removeFromCart } = useCart();
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => removeFromCart(item._id), 340);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .ci-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; padding: 18px;
          display: flex; gap: 18px;
          align-items: flex-start;
          font-family: 'DM Sans', sans-serif;
          transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease, opacity .34s ease;
          position: relative; overflow: hidden;
        }
        .ci-card.removing {
          opacity: 0;
          transform: translateX(20px) scale(0.97);
        }
        .ci-card:hover {
          border-color: rgba(255,255,255,0.13);
          box-shadow: 0 12px 36px rgba(0,0,0,0.28);
        }
        /* Subtle left accent on hover */
        .ci-card::before {
          content: '';
          position: absolute; top: 0; left: 0; bottom: 0;
          width: 3px; border-radius: 18px 0 0 18px;
          background: linear-gradient(to bottom, #ea580c, #f97316);
          opacity: 0; transition: opacity .28s;
        }
        .ci-card:hover::before { opacity: 1; }

        /* Image */
        .ci-img-link { flex-shrink: 0; display: block; }
        .ci-img-wrap {
          width: 110px; height: 110px; border-radius: 14px;
          overflow: hidden; background: #0f172a;
          border: 1px solid rgba(255,255,255,0.07);
          transition: box-shadow .28s;
        }
        .ci-card:hover .ci-img-wrap { box-shadow: 0 6px 20px rgba(0,0,0,0.35); }
        .ci-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .50s ease;
        }
        .ci-card:hover .ci-img { transform: scale(1.07); }

        /* Body */
        .ci-body { flex: 1; min-width: 0; }
        .ci-cat {
          font-size: 10.5px; font-weight: 700;
          color: #fb923c; text-transform: uppercase;
          letter-spacing: .12em; margin-bottom: 5px;
        }
        .ci-name {
          font-size: 15px; font-weight: 700;
          color: #f1f5f9; line-height: 1.35;
          text-decoration: none; display: block;
          margin-bottom: 5px;
          transition: color .2s;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ci-name:hover { color: #fb923c; }
        .ci-meta {
          font-size: 12px; color: rgba(255,255,255,0.35);
          margin-bottom: 14px;
        }
        .ci-price {
          font-size: 17px; font-weight: 800;
          background: linear-gradient(90deg,#fb923c,#f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 14px; display: block;
        }

        /* Bottom row: qty + remove */
        .ci-bottom {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 10px;
        }

        /* Qty stepper */
        .ci-qty {
          display: inline-flex; align-items: center;
          background: rgba(0,0,0,0.30);
          border: 1.5px solid rgba(255,255,255,0.10);
          border-radius: 11px; overflow: hidden;
        }
        .ci-qty-btn {
          width: 36px; height: 36px;
          background: transparent; border: none;
          color: rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background .18s, color .18s;
        }
        .ci-qty-btn:hover:not(:disabled) {
          background: rgba(234,88,12,0.15); color: #fb923c;
        }
        .ci-qty-btn:disabled { opacity: .35; cursor: not-allowed; }
        .ci-qty-val {
          min-width: 40px; text-align: center;
          font-size: 14px; font-weight: 700; color: #fff;
          border-left: 1px solid rgba(255,255,255,0.08);
          border-right: 1px solid rgba(255,255,255,0.08);
          padding: 0 4px;
        }

        /* Remove button */
        .ci-remove {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.30);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background .2s, border-color .2s, color .2s, transform .2s;
        }
        .ci-remove:hover {
          background: rgba(239,68,68,0.14);
          border-color: rgba(239,68,68,0.30);
          color: #f87171;
          transform: scale(1.08);
        }

        /* Subtotal (right column) */
        .ci-subtotal { text-align: right; flex-shrink: 0; }
        .ci-subtotal-label {
          font-size: 10.5px; font-weight: 600;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase; letter-spacing: .08em;
          margin-bottom: 4px;
        }
        .ci-subtotal-val {
          font-size: 18px; font-weight: 800; color: #f1f5f9;
        }

        @media (max-width: 560px) {
          .ci-card { flex-wrap: wrap; }
          .ci-img-wrap { width: 80px; height: 80px; }
          .ci-subtotal { display: none; }
        }
      `}</style>

      <div className={`ci-card ${removing ? 'removing' : ''}`}>

        {/* Image */}
        <Link to={`/products/${item._id}`} className="ci-img-link">
          <div className="ci-img-wrap">
            <img
              src={getImageUrl(item.images?.[0])}
              alt={item.name}
              className="ci-img"
            />
          </div>
        </Link>

        {/* Body */}
        <div className="ci-body">
          <p className="ci-cat">{item.category?.name || 'Handloom'}</p>
          <Link to={`/products/${item._id}`} className="ci-name">{item.name}</Link>
          <p className="ci-meta">
            {[item.fabricType, item.size, item.color].filter(Boolean).join(' · ')}
          </p>
          <span className="ci-price">{formatPrice(item.price)}</span>

          <div className="ci-bottom">
            {/* Qty stepper */}
            <div className="ci-qty">
              <button
                className="ci-qty-btn"
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
              >
                <FiMinus size={13} />
              </button>
              <span className="ci-qty-val">{item.quantity}</span>
              <button
                className="ci-qty-btn"
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
              >
                <FiPlus size={13} />
              </button>
            </div>

            {/* Remove */}
            <button className="ci-remove" onClick={handleRemove} title="Remove item">
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="ci-subtotal">
          <p className="ci-subtotal-label">Subtotal</p>
          <p className="ci-subtotal-val">{formatPrice(item.price * item.quantity)}</p>
        </div>

      </div>
    </>
  );
};

export default CartItem;