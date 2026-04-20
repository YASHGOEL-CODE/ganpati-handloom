import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { notificationsAPI } from '../../services/api';
import Loader from '../common/Loader';
import {
  FiBell, FiTag, FiTruck, FiCheckCircle, FiAlertCircle,
  FiShoppingBag, FiUsers, FiAlertTriangle, FiInfo,
  FiCheck, FiArrowRight, FiPackage, FiRefreshCw,
} from 'react-icons/fi';

/* ─────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────── */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'Just now';
  if (mins  < 60)  return `${mins} min ago`;
  if (hours < 24)  return `${hours} hr ago`;
  if (days  === 1) return 'Yesterday';
  if (days  < 7)   return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
};

const getDateGroup = (dateStr) => {
  const date = new Date(dateStr);
  const now  = new Date();
  const isToday     = date.toDateString() === now.toDateString();
  const yesterday   = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isToday)     return 'Today';
  if (isYesterday) return 'Yesterday';
  return 'Older';
};

const TYPE_CONFIG = {
  order:   { icon: FiShoppingBag, color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)',  label: 'Order' },
  payment: { icon: FiCheckCircle, color: '#4ade80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.22)',  label: 'Payment' },
  offer:   { icon: FiTag,         color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.22)',  label: 'Offer' },
  stock:   { icon: FiAlertTriangle,color:'#f87171', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.22)',   label: 'Stock' },
  user:    { icon: FiUsers,        color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.22)', label: 'User' },
  system:  { icon: FiInfo,         color: '#c084fc', bg: 'rgba(192,132,252,0.10)',border: 'rgba(192,132,252,0.22)',label: 'System' },
};
const getTypeCfg = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.system;

const FILTER_TABS = [
  { key: 'all',     label: 'All' },
  { key: 'order',   label: 'Orders' },
  { key: 'offer',   label: 'Offers' },
  { key: 'payment', label: 'Payments' },
  { key: 'system',  label: 'System' },
];

/* ─────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────── */
const Notifications = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState('all');
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(false);
  const [loadingMore,   setLoadingMore]   = useState(false);

  // Auth guard
  useEffect(() => {
    if (!user) navigate('/signin');
  }, [user, navigate]);

  const fetchNotifications = useCallback(async (pageNum = 1, tab = activeTab, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const params = { page: pageNum, limit: 15 };
      if (tab !== 'all') params.type = tab;

      const res = await notificationsAPI.getAll(params);
      const data = res.data.notifications || [];

      setNotifications(prev => append ? [...prev, ...data] : data);
      setUnreadCount(res.data.unreadCount || 0);
      setHasMore(res.data.pagination?.page < res.data.pagination?.pages);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setPage(1);
    fetchNotifications(1, activeTab, false);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, activeTab, true);
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  const handleNotifClick = (notif) => {
    if (!notif.isRead) handleMarkRead(notif._id);
    if (notif.actionLink) navigate(notif.actionLink);
  };

  // Group by date
  const grouped = notifications.reduce((acc, n) => {
    const group = getDateGroup(n.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});
  const groupOrder = ['Today', 'Yesterday', 'Older'];

  if (!user) return <Loader />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .np-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 10%, rgba(249,115,22,0.07) 0%, transparent 55%),
            radial-gradient(circle at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 55%),
            linear-gradient(160deg, #0f172a 0%, #000000 50%, #020617 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 0 0 80px;
        }

        /* ── HERO HEADER ── */
        .np-hero {
          position: relative; overflow: hidden;
          padding: 48px 24px 44px;
        }
        .np-hero::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(circle at 70% 50%, rgba(249,115,22,0.08) 0%, transparent 55%),
            radial-gradient(circle at 10% 80%, rgba(139,92,246,0.05) 0%, transparent 45%);
          pointer-events: none;
        }
        .np-hero-inner {
          max-width: 860px; margin: 0 auto;
          position: relative; z-index: 2;
          display: flex; align-items: flex-end;
          justify-content: space-between; flex-wrap: wrap; gap: 14px;
          animation: npFadeUp 0.55s ease both;
        }
        @keyframes npFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .np-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; color: #f97316;
          letter-spacing: .15em; text-transform: uppercase; margin-bottom: 10px;
        }
        .np-eyebrow::before { content: ''; display: inline-block; width: 22px; height: 2px; background: linear-gradient(90deg, #f97316, transparent); border-radius: 2px; }
        .np-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 4px;
        }
        .np-hero-line { width: 44px; height: 3px; border-radius: 3px; background: linear-gradient(90deg, #f97316, #f9731644); margin-top: 10px; }
        .np-unread-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.25);
          color: #fb923c; font-size: 13px; font-weight: 700;
          padding: 8px 16px; border-radius: 99px; white-space: nowrap;
        }
        .np-mark-all-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 10px; cursor: pointer;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .np-mark-all-btn:hover { color: #fb923c; border-color: rgba(249,115,22,0.28); background: rgba(249,115,22,0.07); }

        /* ── BODY ── */
        .np-body { max-width: 860px; margin: 0 auto; padding: 0 24px; }
        @media (max-width: 640px) { .np-body { padding: 0 14px; } }

        /* ── FILTER TABS ── */
        .np-tabs {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-bottom: 28px;
          padding: 5px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; width: fit-content;
          backdrop-filter: blur(12px);
        }
        .np-tab {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          background: transparent; border: none;
          color: rgba(255,255,255,0.45);
          transition: all 0.2s ease; font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .np-tab:hover:not(.active) { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.80); }
        .np-tab.active {
          background: linear-gradient(135deg, rgba(249,115,22,0.20), rgba(234,88,12,0.12));
          border: 1px solid rgba(249,115,22,0.28); color: #fb923c;
        }

        /* ── DATE GROUP ── */
        .np-group-label {
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.30);
          text-transform: uppercase; letter-spacing: .12em;
          padding: 0 4px; margin-bottom: 10px; margin-top: 24px;
          display: flex; align-items: center; gap: 10px;
        }
        .np-group-label::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(to right, rgba(255,255,255,0.06), transparent);
        }
        .np-group-label:first-child { margin-top: 0; }

        /* ── NOTIFICATION CARD ── */
        .np-notif-card {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 16px 18px; margin-bottom: 8px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; cursor: pointer;
          transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s, background 0.22s;
          position: relative; overflow: hidden;
          animation: npCardIn 0.35s ease both;
        }
        @keyframes npCardIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .np-notif-card.unread {
          background: rgba(249,115,22,0.04);
          border-color: rgba(249,115,22,0.14);
        }
        .np-notif-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.32), 0 0 0 1px rgba(249,115,22,0.18);
          border-color: rgba(249,115,22,0.22);
          background: rgba(255,255,255,0.055);
        }
        /* Orange top accent on unread */
        .np-notif-card.unread::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #f97316, transparent);
          border-radius: 16px 16px 0 0;
        }
        /* Unread dot */
        .np-unread-dot {
          position: absolute; top: 20px; right: 18px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #f97316; box-shadow: 0 0 7px rgba(249,115,22,0.7);
          flex-shrink: 0;
        }
        .np-notif-icon {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .np-notif-body { flex: 1; min-width: 0; padding-right: 14px; }
        .np-notif-title {
          font-size: 14px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 4px; line-height: 1.4;
        }
        .np-notif-card:not(.unread) .np-notif-title { color: rgba(255,255,255,0.60); font-weight: 600; }
        .np-notif-msg {
          font-size: 13px; color: rgba(255,255,255,0.45);
          line-height: 1.55; margin-bottom: 8px;
        }
        .np-notif-meta {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .np-notif-time { font-size: 11.5px; color: rgba(255,255,255,0.25); }
        .np-notif-type-pill {
          font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px;
          text-transform: uppercase; letter-spacing: .05em;
        }
        .np-notif-action {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 600; color: #fb923c;
          margin-top: 2px;
        }

        /* ── EMPTY STATE ── */
        .np-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 20px; text-align: center;
        }
        .np-empty-icon {
          width: 90px; height: 90px; border-radius: 50%;
          background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.18);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px;
          animation: emptyPulse 2.5s ease-in-out infinite;
        }
        @keyframes emptyPulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.14)} 50%{box-shadow:0 0 0 16px rgba(249,115,22,0)} }
        .np-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 800; color: #f1f5f9; margin-bottom: 8px;
        }
        .np-empty-sub { font-size: 14px; color: rgba(255,255,255,0.38); max-width: 300px; line-height: 1.6; }

        /* ── LOAD MORE ── */
        .np-load-more {
          display: flex; justify-content: center; margin-top: 24px;
        }
        .np-load-more-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.55); font-size: 13.5px; font-weight: 600;
          padding: 11px 24px; border-radius: 11px; cursor: pointer;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .np-load-more-btn:hover { color: #fb923c; border-color: rgba(249,115,22,0.28); background: rgba(249,115,22,0.07); }
        .np-load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .np-spinner { width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(249,115,22,0.20); border-top-color: #f97316; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .np-hero { padding: 36px 18px 32px; }
          .np-tabs { gap: 4px; }
          .np-tab { padding: 7px 12px; font-size: 12px; }
        }
      `}</style>

      <div className="np-page">

        {/* ── HERO ── */}
        <div className="np-hero">
          <div className="np-hero-inner">
            <div>
              <p className="np-eyebrow">Account</p>
              <h1 className="np-title">Notifications</h1>
              <div className="np-hero-line" />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              {unreadCount > 0 && (
                <>
                  <span className="np-unread-badge">
                    <FiBell size={13} /> {unreadCount} unread
                  </span>
                  <button className="np-mark-all-btn" onClick={handleMarkAllRead}>
                    <FiCheck size={13} /> Mark all read
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="np-body">

          {/* Filter tabs */}
          <div className="np-tabs">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                className={`np-tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <Loader />
          ) : notifications.length === 0 ? (
            <div className="np-empty">
              <div className="np-empty-icon">
                <FiBell size={36} color="#fb923c" strokeWidth={1.5} />
              </div>
              <h2 className="np-empty-title">No notifications</h2>
              <p className="np-empty-sub">
                {activeTab === 'all'
                  ? "You're all caught up! We'll notify you about orders, offers and more."
                  : `No ${activeTab} notifications yet.`}
              </p>
            </div>
          ) : (
            <>
              {groupOrder.map(group => {
                const items = grouped[group];
                if (!items || items.length === 0) return null;
                return (
                  <div key={group}>
                    <p className="np-group-label">{group}</p>
                    {items.map((notif, idx) => {
                      const cfg = getTypeCfg(notif.type);
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={notif._id}
                          className={`np-notif-card${!notif.isRead ? ' unread' : ''}`}
                          style={{ animationDelay: `${idx * 40}ms` }}
                          onClick={() => handleNotifClick(notif)}
                        >
                          {!notif.isRead && <span className="np-unread-dot" />}

                          <div className="np-notif-icon" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                            <Icon size={20} color={cfg.color} />
                          </div>

                          <div className="np-notif-body">
                            <p className="np-notif-title">{notif.title}</p>
                            <p className="np-notif-msg">{notif.message}</p>
                            <div className="np-notif-meta">
                              <span className="np-notif-time">{timeAgo(notif.createdAt)}</span>
                              <span
                                className="np-notif-type-pill"
                                style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                              >
                                {cfg.label}
                              </span>
                              {notif.actionLink && (
                                <span className="np-notif-action">
                                  View <FiArrowRight size={11} />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {hasMore && (
                <div className="np-load-more">
                  <button
                    className="np-load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <><div className="np-spinner" /> Loading...</>
                    ) : (
                      <>Load more notifications <FiArrowRight size={13} /></>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;