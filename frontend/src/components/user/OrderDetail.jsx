import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { formatPrice, formatDate, getOrderStatusColor } from '../../utils/helpers';
import { getImageUrl } from '../../utils/imageHelper';
import Loader from '../common/Loader';
import {
  FiPackage, FiTruck, FiCheckCircle, FiMapPin,
  FiClock, FiXCircle, FiRefreshCw, FiArrowLeft,
  FiShield, FiCreditCard, FiCalendar, FiTag,
} from 'react-icons/fi';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => { fetchOrderDetails(); }, [id]);

  useEffect(() => {
    if (!order) return;
    const finalStates = ['delivered', 'cancelled'];
    if (finalStates.includes(order.orderStatus)) return;
    const intervalId = setInterval(() => { fetchOrderDetails(true); }, 1200000);
    return () => clearInterval(intervalId);
  }, [order?.orderStatus, id]);

  const fetchOrderDetails = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) { setIsRefreshing(true); }
      else { setLoading(true); }
      setError(null);
      const response = await ordersAPI.getById(id);
      if (response.data.success) { setOrder(response.data.order); }
      else if (response.data._id) { setOrder(response.data); }
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (!isAutoRefresh) setError(error.response?.data?.message || 'Failed to load order details');
    } finally {
      if (isAutoRefresh) { setIsRefreshing(false); }
      else { setLoading(false); }
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <>
        <style>{`.od-err{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at top left,#0f172a,#000,#020617);font-family:'DM Sans',sans-serif;gap:16px;}.od-err-title{font-size:20px;font-weight:700;color:#f1f5f9;}.od-back-link{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:600;color:#fb923c;text-decoration:none;}`}</style>
        <div className="od-err">
          <FiXCircle size={52} color="#f87171" />
          <p className="od-err-title">{error}</p>
          <Link to="/orders" className="od-back-link"><FiArrowLeft size={14}/> Back to Orders</Link>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <style>{`.od-err{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at top left,#0f172a,#000,#020617);font-family:'DM Sans',sans-serif;gap:16px;}.od-err-title{font-size:20px;font-weight:700;color:#f1f5f9;}.od-back-link{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:600;color:#fb923c;text-decoration:none;}`}</style>
        <div className="od-err">
          <FiPackage size={52} color="rgba(255,255,255,0.20)" />
          <p className="od-err-title">Order not found</p>
          <Link to="/orders" className="od-back-link"><FiArrowLeft size={14}/> Back to Orders</Link>
        </div>
      </>
    );
  }

  const statusSteps = [
    { key: 'processing', label: 'Processing', icon: FiClock },
    { key: 'packed',     label: 'Packed',     icon: FiPackage },
    { key: 'shipped',    label: 'Shipped',     icon: FiTruck },
    { key: 'delivered',  label: 'Delivered',   icon: FiCheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.orderStatus);
  const isCancelled      = order.orderStatus === 'cancelled';
  const progressPct      = currentStepIndex >= 0
    ? ((currentStepIndex + 1) / statusSteps.length) * 100
    : 0;

  const STATUS_GLOW = {
    delivered:  { color:'#4ade80', bg:'rgba(74,222,128,0.14)',  border:'rgba(74,222,128,0.30)' },
    processing: { color:'#fbbf24', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.28)' },
    packed:     { color:'#fb923c', bg:'rgba(249,115,22,0.12)',  border:'rgba(249,115,22,0.28)' },
    shipped:    { color:'#60a5fa', bg:'rgba(96,165,250,0.12)',  border:'rgba(96,165,250,0.28)' },
    cancelled:  { color:'#f87171', bg:'rgba(239,68,68,0.10)',   border:'rgba(239,68,68,0.25)' },
  };
  const statusGlow = STATUS_GLOW[order.orderStatus] || STATUS_GLOW.processing;

  // ── Coupon discount ──
  const hasDiscount  = order.couponCode && order.discountAmount > 0;
  // Correct subtotal: totalPrice is already discounted, so add discount back to get original
  // Prefer stored subtotal from DB; fallback to reverse-engineering if subtotal field is old/missing
  const subtotalDisplay = (order.subtotal && order.subtotal > 0)
    ? order.subtotal
    : order.totalPrice + (order.discountAmount || 0) - (order.shippingPrice || 0) - (order.taxPrice || 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .od-page {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: radial-gradient(circle at top left, #0f172a 0%, #000000 50%, #020617 100%);
          padding: 0 0 100px;
        }
        .od-wrap { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
        @media (max-width: 640px) { .od-wrap { padding: 0 14px; } }

        .od-topbar {
          padding: 28px 0 0;
          margin-bottom: 22px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .od-back {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,0.45);
          text-decoration: none; padding: 8px 14px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          transition: color .2s, background .2s, border-color .2s, transform .2s;
        }
        .od-back:hover { color: #fff; background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.18); transform: translateX(-2px); }

        .od-refresh {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: rgba(255,255,255,0.35);
        }

        .od-header-card {
          background: rgba(255,255,255,0.04); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
          padding: 24px 28px; margin-bottom: 18px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
          position: relative;
        }
        .od-header-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #f97316, #ea580c, transparent);
          border-radius: 20px 20px 0 0;
        }
        .od-eyebrow {
          font-size:11px; font-weight:700; color:#ea580c;
          letter-spacing:.14em; text-transform:uppercase; margin-bottom:7px;
          display:flex; align-items:center; gap:6px;
        }
        .od-eyebrow::before { content:''; display:inline-block; width:12px; height:1.5px; background:#ea580c; }
        .od-order-id {
          font-family: monospace; font-size: clamp(18px,2.5vw,26px); font-weight:800;
          color:#fff; letter-spacing:.04em;
        }
        .od-date {
          font-size:13px; color:rgba(255,255,255,0.38); margin-top:5px;
          display:flex; align-items:center; gap:6px;
        }
        .od-status-badge {
          display:inline-flex; align-items:center; gap:7px;
          font-size:12px; font-weight:800;
          padding:8px 18px; border-radius:999px;
          letter-spacing:.06em; text-transform:uppercase;
        }
        .od-status-pulse {
          width:8px; height:8px; border-radius:50%; flex-shrink:0;
          animation:odPulse 2s ease-in-out infinite;
        }
        @keyframes odPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(1.4); }
        }

        .od-tracking-card {
          background: rgba(255,255,255,0.04); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
          padding: 28px; margin-bottom: 22px;
        }
        .od-tracking-title {
          font-size:16px; font-weight:700; color:#f1f5f9;
          margin-bottom:28px; display:flex; align-items:center; gap:10px;
        }
        .od-tracking-sub {
          font-size:11px; font-weight:600; color:rgba(255,255,255,0.28);
          letter-spacing:.05em; text-transform:uppercase;
        }

        .od-progress-track { position:relative; margin-bottom:0; }
        .od-progress-line-bg {
          position:absolute; top:20px; left:calc(12.5%); right:calc(12.5%);
          height:3px; background:rgba(255,255,255,0.08); border-radius:3px;
          z-index:0;
        }
        .od-progress-line-fill {
          height:100%; border-radius:3px;
          background: linear-gradient(90deg, #ea580c, #f97316);
          box-shadow: 0 0 12px rgba(249,115,22,0.45);
          transition: width 1.2s cubic-bezier(.4,0,.2,1);
        }

        .od-steps { display:grid; grid-template-columns:repeat(4,1fr); position:relative; z-index:1; }
        .od-step { display:flex; flex-direction:column; align-items:center; gap:10px; }
        .od-step-circle {
          width:42px; height:42px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          transition:all .4s ease; flex-shrink:0;
          position:relative;
        }
        .od-step-circle.done {
          background: linear-gradient(135deg,#ea580c,#f97316);
          box-shadow: 0 0 0 4px rgba(249,115,22,0.18), 0 0 18px rgba(249,115,22,0.40);
        }
        .od-step-circle.current {
          background: linear-gradient(135deg,#ea580c,#f97316);
          box-shadow: 0 0 0 6px rgba(249,115,22,0.14), 0 0 24px rgba(249,115,22,0.50);
          animation: odStepGlow 2.5s ease-in-out infinite;
        }
        @keyframes odStepGlow {
          0%,100% { box-shadow: 0 0 0 6px rgba(249,115,22,0.14), 0 0 20px rgba(249,115,22,0.40); }
          50%      { box-shadow: 0 0 0 8px rgba(249,115,22,0.08), 0 0 32px rgba(249,115,22,0.60); }
        }
        .od-step-circle.pending {
          background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.12);
        }
        .od-step-label {
          font-size:12px; font-weight:700; text-align:center;
          transition:color .3s;
        }
        .od-step-label.done    { color:#f1f5f9; }
        .od-step-label.current { color:#fb923c; }
        .od-step-label.pending { color:rgba(255,255,255,0.28); }
        .od-step-date { font-size:10.5px; color:rgba(255,255,255,0.30); text-align:center; }

        .od-cancelled {
          background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.22);
          border-radius:16px; padding:32px 20px; text-align:center;
        }
        .od-cancelled-title { font-size:18px; font-weight:700; color:#fca5a5; margin:12px 0 6px; }
        .od-cancelled-sub   { font-size:13px; color:rgba(248,113,113,0.70); }

        .od-info-strip {
          background: rgba(74,222,128,0.07); border: 1px solid rgba(74,222,128,0.18);
          border-radius:12px; padding:12px 18px; margin-top:18px;
          font-size:13px; color:#4ade80; display:flex; align-items:center; gap:8px;
        }
        .od-info-strip.blue {
          background: rgba(96,165,250,0.07); border-color:rgba(96,165,250,0.18); color:#60a5fa;
        }

        .od-grid {
          display:grid; grid-template-columns:1fr 360px; gap:20px; align-items:start;
        }
        @media (max-width:900px) { .od-grid { grid-template-columns:1fr; } }

        .od-card {
          background: rgba(255,255,255,0.04); backdrop-filter:blur(20px);
          border: 1px solid rgba(255,255,255,0.08); border-radius:20px;
          padding:24px; margin-bottom:18px;
          animation: odCardIn .5s ease both;
        }
        @keyframes odCardIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .od-card:nth-child(2) { animation-delay:.10s; }
        .od-card:nth-child(3) { animation-delay:.20s; }
        .od-card-title {
          font-size:15px; font-weight:700; color:#f1f5f9;
          margin-bottom:18px; display:flex; align-items:center; gap:9px;
          padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.06);
        }

        .od-items-grid { display:flex; flex-direction:column; gap:14px; }
        .od-item {
          display:flex; gap:14px; align-items:flex-start;
          padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.05);
        }
        .od-item:last-child { border-bottom:none; padding-bottom:0; }
        .od-item-img-wrap {
          width:76px; height:76px; border-radius:13px; overflow:hidden; flex-shrink:0;
          background:#0f172a; border:1px solid rgba(255,255,255,0.07);
        }
        .od-item-img {
          width:100%; height:100%; object-fit:cover;
          transition:transform .4s ease;
        }
        .od-item-img-wrap:hover .od-item-img { transform:scale(1.07); }
        .od-item-name {
          font-size:14.5px; font-weight:700; color:#f1f5f9; margin-bottom:5px; line-height:1.35;
        }
        .od-item-qty { font-size:12.5px; color:rgba(255,255,255,0.38); margin-bottom:6px; }
        .od-item-price {
          font-size:16px; font-weight:800;
          background:linear-gradient(90deg,#fb923c,#f97316);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }

        .od-addr-line { font-size:13.5px; color:rgba(255,255,255,0.52); line-height:1.65; }
        .od-addr-name { font-size:15px; font-weight:700; color:#f1f5f9; margin-bottom:6px; }
        .od-addr-phone {
          display:inline-flex; align-items:center; gap:6px;
          font-size:13px; font-weight:600; color:rgba(255,255,255,0.50);
          margin-top:10px;
        }

        .od-sum-row {
          display:flex; justify-content:space-between; align-items:center;
          font-size:13.5px; color:rgba(255,255,255,0.50); font-weight:500;
          margin-bottom:11px; font-variant-numeric:tabular-nums;
        }
        .od-sum-row.free-ship { color:#4ade80; }
        .od-sum-row.discount  { color:#4ade80; }
        .od-sum-divider { height:1px; background:rgba(255,255,255,0.07); margin:14px 0; }
        .od-sum-total {
          display:flex; justify-content:space-between; align-items:baseline;
          margin-bottom:18px;
        }
        .od-sum-total-lbl { font-size:16px; font-weight:700; color:#f1f5f9; }
        .od-sum-total-val {
          font-size:26px; font-weight:800;
          background:linear-gradient(90deg,#fb923c,#f97316);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text; font-variant-numeric:tabular-nums;
        }

        /* Coupon badge in summary */
        .od-coupon-badge {
          display:inline-flex; align-items:center; gap:5px;
          font-family:monospace; font-size:11px; font-weight:800;
          background:rgba(74,222,128,0.10); border:1px solid rgba(74,222,128,0.22);
          color:#4ade80; padding:2px 8px; border-radius:6px;
        }

        .od-payment {
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
          border-radius:12px; padding:14px 16px; margin-top:6px;
        }
        .od-payment-lbl { font-size:11px; font-weight:700; color:rgba(255,255,255,0.28); text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; }
        .od-payment-val { font-size:14px; font-weight:600; color:#f1f5f9; display:flex; align-items:center; gap:7px; }
        .od-payment-sub { font-size:11.5px; color:rgba(255,255,255,0.30); margin-top:3px; }

        @media (max-width:640px) {
          .od-steps { grid-template-columns:repeat(4,1fr); gap:0; }
          .od-step-label { font-size:10px; }
          .od-step-circle { width:34px; height:34px; }
          .od-header-card { padding:18px; }
          .od-tracking-card, .od-card { padding:18px; }
        }
      `}</style>

      <div className="od-page">
        <div className="od-wrap">

          <div className="od-topbar">
            <Link to="/orders" className="od-back">
              <FiArrowLeft size={15} /> Back to Orders
            </Link>
            {isRefreshing && (
              <div className="od-refresh">
                <FiRefreshCw size={13} style={{ animation:'spin 1s linear infinite' }} />
                Checking for updates...
              </div>
            )}
          </div>

          <div className="od-header-card">
            <div>
              <p className="od-eyebrow">Order Receipt</p>
              <p className="od-order-id">#{order._id.slice(-8).toUpperCase()}</p>
              <p className="od-date">
                <FiCalendar size={12} />
                Placed on {formatDate(order.createdAt)}
                {!isCancelled && order.orderStatus !== 'delivered' && (
                  <span style={{ marginLeft:10, fontSize:11, color:'rgba(255,255,255,0.22)' }}>
                    · Auto-updates every 20 min
                  </span>
                )}
              </p>
            </div>
            <div
              className="od-status-badge"
              style={{
                background: statusGlow.bg,
                border: `1px solid ${statusGlow.border}`,
                color: statusGlow.color,
                boxShadow: `0 0 18px ${statusGlow.bg}`,
              }}
            >
              {!isCancelled && order.orderStatus !== 'delivered' && (
                <span className="od-status-pulse" style={{ background: statusGlow.color }} />
              )}
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </div>
          </div>

          <div className="od-tracking-card">
            <p className="od-tracking-title">
              <FiTruck size={17} color="#fb923c" />
              Order Tracking
              {!isCancelled && order.orderStatus !== 'delivered' && (
                <span className="od-tracking-sub">Live</span>
              )}
            </p>

            {isCancelled ? (
              <div className="od-cancelled">
                <FiXCircle size={44} color="#f87171" />
                <p className="od-cancelled-title">Order Cancelled</p>
                <p className="od-cancelled-sub">This order has been cancelled</p>
                {order.statusHistory?.find(h => h.status === 'cancelled') && (
                  <p style={{ fontSize:12, color:'rgba(248,113,113,0.55)', marginTop:8 }}>
                    Cancelled on {formatDate(order.statusHistory.find(h => h.status === 'cancelled').timestamp)}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="od-progress-track">
                  <div className="od-progress-line-bg">
                    <div
                      className="od-progress-line-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="od-steps">
                    {statusSteps.map((step, index) => {
                      const Icon        = step.icon;
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent   = index === currentStepIndex;
                      const stateClass  = isCurrent ? 'current' : isCompleted ? 'done' : 'pending';
                      const historyItem = order.statusHistory?.find(h => h.status === step.key);

                      return (
                        <div key={step.key} className="od-step">
                          <div className={`od-step-circle ${stateClass}`}>
                            <Icon
                              size={18}
                              color={isCompleted ? '#fff' : 'rgba(255,255,255,0.25)'}
                              strokeWidth={2.2}
                            />
                          </div>
                          <p className={`od-step-label ${stateClass}`}>{step.label}</p>
                          {historyItem && (
                            <p className="od-step-date">{formatDate(historyItem.timestamp)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {order.estimatedDelivery && order.orderStatus !== 'delivered' && (
                  <div className="od-info-strip blue" style={{ marginTop:22 }}>
                    <FiCalendar size={14} />
                    <strong>Estimated Delivery:</strong>&nbsp;{formatDate(order.estimatedDelivery)}
                  </div>
                )}

                {order.deliveredAt && (
                  <div className="od-info-strip" style={{ marginTop:22 }}>
                    <FiCheckCircle size={14} />
                    <strong>Delivered on:</strong>&nbsp;{formatDate(order.deliveredAt)}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="od-grid">

            {/* LEFT: Order Items */}
            <div>
              <div className="od-card">
                <h2 className="od-card-title">
                  <FiPackage size={16} color="#fb923c" />
                  Order Items
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.30)', fontWeight:500, marginLeft:'auto' }}>
                    {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                  </span>
                </h2>
                <div className="od-items-grid">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="od-item">
                      <div className="od-item-img-wrap">
                        <img
                          src={getImageUrl(item.image) || 'https://via.placeholder.com/80x80?text=Product'}
                          alt={item.name}
                          className="od-item-img"
                        />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p className="od-item-name">{item.name}</p>
                        <p className="od-item-qty">Qty: {item.quantity}</p>
                        <p className="od-item-price">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Address + Summary */}
            <div>
              {/* Shipping Address */}
              <div className="od-card" style={{ animationDelay:'.08s' }}>
                <h2 className="od-card-title">
                  <FiMapPin size={16} color="#fb923c" />
                  Shipping Address
                </h2>
                <p className="od-addr-name">{order.user?.fullName}</p>
                <p className="od-addr-line">{order.shippingAddress?.houseStreet}</p>
                {order.shippingAddress?.areaLandmark && (
                  <p className="od-addr-line">{order.shippingAddress.areaLandmark}</p>
                )}
                <p className="od-addr-line">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                </p>
                {order.phone && (
                  <p className="od-addr-phone">
                    📞 {order.phone}
                  </p>
                )}
              </div>

              {/* Order Summary */}
              <div className="od-card" style={{ animationDelay:'.16s' }}>
                <h2 className="od-card-title">
                  <FiShield size={16} color="#fb923c" />
                  Order Summary
                </h2>

                {/* Subtotal — add back discount to show original product price */}
                <div className="od-sum-row">
                  <span>Subtotal</span>
                  <span style={{ color:'#f1f5f9', fontWeight:600 }}>
                    {formatPrice(subtotalDisplay)}
                  </span>
                </div>

                {/* Shipping */}
                <div className={`od-sum-row ${order.shippingPrice === 0 ? 'free-ship' : ''}`}>
                  <span style={{ color: order.shippingPrice === 0 ? '#4ade80' : undefined }}>Shipping</span>
                  <span style={{ fontWeight:600 }}>
                    {order.shippingPrice === 0
                      ? '🎉 FREE'
                      : formatPrice(order.shippingPrice)
                    }
                  </span>
                </div>

                {/* Tax */}
                {order.taxPrice > 0 && (
                  <div className="od-sum-row">
                    <span>Tax (GST)</span>
                    <span style={{ fontWeight:600 }}>{formatPrice(order.taxPrice)}</span>
                  </div>
                )}

                {/* ── Coupon Discount Row ── */}
                {hasDiscount && (
                  <div className="od-sum-row discount">
                    <span style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <FiTag size={12} />
                      <span className="od-coupon-badge">{order.couponCode}</span>
                      Coupon Discount
                    </span>
                    <span style={{ fontWeight:700 }}>−{formatPrice(order.discountAmount)}</span>
                  </div>
                )}

                <div className="od-sum-divider" />

                <div className="od-sum-total">
                  <span className="od-sum-total-lbl">Total</span>
                  <span className="od-sum-total-val">{formatPrice(order.totalPrice)}</span>
                </div>

                {/* Payment method */}
                <div className="od-payment">
                  <p className="od-payment-lbl">Payment Method</p>
                  <p className="od-payment-val">
                    <FiCreditCard size={15} color="rgba(255,255,255,0.40)" />
                    {order.paymentMethod}
                    {order.isPaid && <span style={{ color:'#4ade80', fontSize:12 }}>✓ Paid</span>}
                  </p>
                  {order.isPaid && order.paidAt && (
                    <p className="od-payment-sub">Paid on {formatDate(order.paidAt)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetail;