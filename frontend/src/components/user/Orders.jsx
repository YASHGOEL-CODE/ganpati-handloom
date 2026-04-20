import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { formatPrice, formatDate, getOrderStatusColor } from '../../utils/helpers';
import { getImageUrl } from '../../utils/imageHelper';
import Loader from '../common/Loader';
import {
  FiPackage, FiArrowRight, FiCalendar,
  FiHash, FiShoppingBag, FiCheck, FiX,
  FiClock, FiTruck, FiRefreshCw, FiTag,
} from 'react-icons/fi';

/* \u2500\u2500 Status config \u2014 purely visual, no logic change \u2500\u2500 */
const STATUS_CONFIG = {
  delivered: {
    label: 'Delivered',
    icon: FiCheck,
    bg: 'rgba(74,222,128,0.12)',
    border: 'rgba(74,222,128,0.25)',
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.20)',
  },
  cancelled: {
    label: 'Cancelled',
    icon: FiX,
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.25)',
    color: '#f87171',
    glow: 'rgba(239,68,68,0.18)',
  },
  shipped: {
    label: 'Shipped',
    icon: FiTruck,
    bg: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.25)',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.18)',
  },
  processing: {
    label: 'Processing',
    icon: FiRefreshCw,
    bg: 'rgba(251,191,36,0.10)',
    border: 'rgba(251,191,36,0.25)',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.18)',
  },
  pending: {
    label: 'Pending',
    icon: FiClock,
    bg: 'rgba(234,88,12,0.10)',
    border: 'rgba(234,88,12,0.25)',
    color: '#fb923c',
    glow: 'rgba(234,88,12,0.18)',
  },
};

const getStatusCfg = (status = '') => {
  const key = status.toLowerCase();
  return STATUS_CONFIG[key] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    icon: FiPackage,
    bg: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.14)',
    color: 'rgba(255,255,255,0.60)',
    glow: 'transparent',
  };
};

/* \u2500\u2500 Single order card \u2500\u2500 */
const OrderCard = ({ order }) => {
  const [hovered, setHovered] = useState(false);
  const cfg = getStatusCfg(order.orderStatus);
  const Icon = cfg.icon;
  const previewItems = order.orderItems.slice(0, 3);
  const extraCount  = order.orderItems.length - 3;

  return (
    <Link
      to={`/orders/${order._id}`}
      className="ord-card"
      style={{
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 52px rgba(0,0,0,0.38), 0 0 0 1px rgba(234,88,12,0.18), ${cfg.glow} 0 0 40px`
          : '0 8px 28px rgba(0,0,0,0.22)',
        borderColor: hovered ? 'rgba(234,88,12,0.28)' : 'rgba(255,255,255,0.08)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* \u2500\u2500 TOP ROW \u2500\u2500 */}
      <div className="ord-top">

        {/* LEFT: Images */}
        <div className="ord-images">
          {previewItems.map((item, i) => (
            <div key={i} className="ord-img-wrap">
              <img
                src={getImageUrl(item.image) || 'https://via.placeholder.com/80x80?text=Product'}
                alt={item.name}
                className="ord-img"
                style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
              />
            </div>
          ))}
          {extraCount > 0 && (
            <div className="ord-img-more">
              +{extraCount}
            </div>
          )}
        </div>

        {/* CENTER: Meta */}
        <div className="ord-meta">
          <div className="ord-meta-row">
            <FiHash size={11} style={{ color:'rgba(255,255,255,0.28)', flexShrink:0 }} />
            <span className="ord-id">{order._id.slice(-10).toUpperCase()}</span>
          </div>
          <div className="ord-meta-row" style={{ marginTop:5 }}>
            <FiCalendar size={11} style={{ color:'rgba(255,255,255,0.28)', flexShrink:0 }} />
            <span className="ord-date">{formatDate(order.createdAt)}</span>
          </div>
          <div className="ord-meta-row" style={{ marginTop:5 }}>
            <FiShoppingBag size={11} style={{ color:'rgba(255,255,255,0.28)', flexShrink:0 }} />
            <span className="ord-items">
              {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* RIGHT: Status + Price + CTA */}
        <div className="ord-right">
          {/* Status badge */}
          <div
            className="ord-badge"
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              color: cfg.color,
              boxShadow: hovered ? `0 0 12px ${cfg.glow}` : 'none',
            }}
          >
            <Icon size={12} style={{ flexShrink: 0 }} />
            {cfg.label}
          </div>

          {/* Price — totalPrice is already the discounted amount */}
          <p className="ord-price">{formatPrice(order.totalPrice)}</p>
          {order.couponCode && order.discountAmount > 0 && (
            <span className="ord-coupon-tag">
              <FiTag size={9} /> {order.couponCode} −{formatPrice(order.discountAmount)}
            </span>
          )}

          {/* View details button */}
          <div
            className="ord-view-btn"
            style={{
              background: hovered
                ? 'linear-gradient(135deg,#ea580c,#f97316)'
                : 'rgba(234,88,12,0.08)',
              borderColor: hovered
                ? 'transparent'
                : 'rgba(234,88,12,0.25)',
              color: '#fb923c',
              boxShadow: hovered ? '0 4px 14px rgba(234,88,12,0.32)' : 'none',
            }}
          >
            View Details
            <FiArrowRight
              size={13}
              style={{ transition:'transform .2s', transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}
            />
          </div>
        </div>
      </div>

      {/* \u2500\u2500 BOTTOM: Order ID full \u2500\u2500 */}
      <div className="ord-bottom">
        <span className="ord-full-id">Order #{order._id}</span>
        <span className="ord-total-label">
          {order.couponCode && order.discountAmount > 0
            ? `Saved ₹${order.discountAmount}`
            : 'Total paid'
          }
        </span>
      </div>
    </Link>
  );
};

/* \u2500\u2500 Main Orders component \u2014 all logic unchanged \u2500\u2500 */
const Orders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  // \u2500\u2500 Completely unchanged \u2500\u2500
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .ord-page {
          min-height: 100vh;
          background: #070d1a;
          background-image:
            radial-gradient(ellipse 70% 50% at 15% 10%, rgba(234,88,12,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 60%),
            linear-gradient(160deg, #070d1a 0%, #0d1a2e 50%, #070d1a 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 0 0 100px;
        }
        .ord-wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        @media (max-width: 640px) { .ord-wrap { padding: 0 14px; } }

        /* \u2500\u2500 HEADER \u2500\u2500 */
        .ord-header {
          padding: 44px 0 32px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 36px;
          display: flex; align-items: flex-end; justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .ord-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; color: #ea580c;
          letter-spacing: .15em; text-transform: uppercase; margin-bottom: 8px;
        }
        .ord-eyebrow::before { content:''; display:inline-block; width:14px; height:1.5px; background:#ea580c; }
        .ord-page-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px,3.5vw,40px); font-weight: 800;
          color: #fff; line-height: 1.1; letter-spacing: -.02em;
        }
        .ord-count-badge {
          display: inline-flex; align-items: center;
          background: rgba(234,88,12,0.14); border: 1px solid rgba(234,88,12,0.25);
          color: #fb923c; font-size: 12px; font-weight: 700;
          padding: 4px 12px; border-radius: 999px;
        }

        /* \u2500\u2500 ORDER CARD \u2500\u2500 */
        .ord-card {
          display: block; text-decoration: none;
          background: rgba(13,26,46,0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 16px;
          transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease;
          position: relative; overflow: hidden;
        }
        /* Subtle top gradient line */
        .ord-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1.5px;
          background: linear-gradient(90deg, transparent, rgba(234,88,12,0.30), transparent);
          border-radius: 20px 20px 0 0;
          transition: opacity .28s;
        }

        /* \u2500\u2500 TOP ROW \u2500\u2500 */
        .ord-top {
          display: flex; align-items: center; gap: 20px;
          flex-wrap: wrap;
        }

        /* Images */
        .ord-images {
          display: flex; gap: 8px; flex-shrink: 0;
          align-items: center;
        }
        .ord-img-wrap {
          width: 72px; height: 72px; border-radius: 12px;
          overflow: hidden; flex-shrink: 0;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.07);
        }
        @media (max-width: 480px) { .ord-img-wrap { width: 56px; height: 56px; } }
        .ord-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .4s ease;
        }
        .ord-img-more {
          width: 72px; height: 72px; border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: rgba(255,255,255,0.50);
          flex-shrink: 0;
        }
        @media (max-width: 480px) { .ord-img-more { width: 56px; height: 56px; font-size: 12px; } }

        /* Meta */
        .ord-meta { flex: 1; min-width: 140px; }
        .ord-meta-row {
          display: flex; align-items: center; gap: 6px;
        }
        .ord-id {
          font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.50);
          font-family: 'Courier New', monospace; letter-spacing: .05em;
        }
        .ord-date { font-size: 13px; color: rgba(255,255,255,0.40); font-weight: 500; }
        .ord-items { font-size: 13px; color: rgba(255,255,255,0.40); font-weight: 500; }

        /* Right column */
        .ord-right {
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 10px; flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .ord-right { flex-direction: row; align-items: center; flex-wrap: wrap; width: 100%; justify-content: space-between; }
        }

        /* Status badge */
        .ord-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11.5px; font-weight: 700;
          padding: 5px 12px; border-radius: 999px;
          transition: box-shadow .28s;
          white-space: nowrap;
        }

        /* Price */
        .ord-price {
          font-size: clamp(18px,2.5vw,24px); font-weight: 800;
          background: linear-gradient(90deg, #fb923c, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; white-space: nowrap;
        }

        /* View details button */
        .ord-view-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 700;
          padding: 8px 16px; border-radius: 9px;
          border: 1.5px solid rgba(234,88,12,0.25);
          background: rgba(234,88,12,0.08);
          color: #fb923c; white-space: nowrap;
          transition: background .22s, border-color .22s, box-shadow .22s;
        }

        /* Bottom strip */
        .ord-bottom {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 18px; padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .ord-full-id {
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.20);
          font-family: 'Courier New', monospace;
          letter-spacing: .04em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 60%;
        }
        .ord-total-label {
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.20); text-transform: uppercase; letter-spacing: .08em;
        }
        /* Coupon tag under price */
        .ord-coupon-tag {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 700;
          color: #4ade80;
          background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.18);
          padding: 2px 7px; border-radius: 5px;
          white-space: nowrap; margin-top: 3px;
        }

        /* \u2500\u2500 EMPTY STATE \u2500\u2500 */
        .ord-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 100px 20px; text-align: center;
        }
        .ord-empty-icon {
          width: 110px; height: 110px; border-radius: 50%;
          background: rgba(234,88,12,0.08); border: 1px solid rgba(234,88,12,0.18);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px;
          animation: emptyPulse 2.5s ease-in-out infinite;
        }
        @keyframes emptyPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(234,88,12,0.14); }
          50%      { box-shadow: 0 0 0 16px rgba(234,88,12,0); }
        }
        .ord-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px,3vw,32px); font-weight: 700;
          color: #f1f5f9; margin-bottom: 10px;
        }
        .ord-empty-sub {
          font-size: 15px; color: rgba(255,255,255,0.38);
          max-width: 320px; margin: 0 auto 28px; line-height: 1.65;
        }
        .ord-empty-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; text-decoration: none;
          padding: 14px 32px; border-radius: 13px;
          font-size: 14.5px; font-weight: 700;
          transition: transform .22s, box-shadow .22s;
          box-shadow: 0 6px 20px rgba(234,88,12,0.30);
          letter-spacing: .02em;
        }
        .ord-empty-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 32px rgba(234,88,12,0.46);
        }
        .ord-empty-btn .arrow { transition: transform .22s; }
        .ord-empty-btn:hover .arrow { transform: translateX(4px); }

        @media (max-width: 640px) {
          .ord-card { padding: 16px; }
          .ord-top  { gap: 14px; }
        }
      `}</style>

      <div className="ord-page">
        <div className="ord-wrap">

          {/* \u2500\u2500 HEADER \u2500\u2500 */}
          <div className="ord-header">
            <div>
              <p className="ord-eyebrow">Account</p>
              <h1 className="ord-page-title">My Orders</h1>
            </div>
            {orders.length > 0 && (
              <span className="ord-count-badge">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            )}
          </div>

          {/* \u2500\u2500 ORDER LIST or EMPTY \u2500\u2500 */}
          {orders.length > 0 ? (
            <div>
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          ) : (
            <div className="ord-empty">
              <div className="ord-empty-icon">
                <FiPackage size={48} color="#fb923c" strokeWidth={1.5} />
              </div>
              <h2 className="ord-empty-title">No orders yet</h2>
              <p className="ord-empty-sub">
                You haven't placed any orders yet. Explore our collection and find something you love!
              </p>
              <Link to="/products" className="ord-empty-btn">
                <FiShoppingBag size={16} />
                Start Shopping
                <FiArrowRight size={16} className="arrow" />
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Orders;