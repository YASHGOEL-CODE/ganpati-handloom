// frontend/src/pages/Admin/AdminNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../services/api';
import { FiBell, FiMail, FiPackage, FiCreditCard, FiAlertTriangle, FiUser, FiSettings, FiGift, FiArrowRight, FiCheck } from 'react-icons/fi';

const timeAgo = (dateStr) => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const TYPE_CONFIG = {
  contact: { icon: FiMail,          color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)',  emoji: '✉️'  },
  order:   { icon: FiPackage,        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  emoji: '📦'  },
  payment: { icon: FiCreditCard,     color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',   emoji: '💳'  },
  stock:   { icon: FiAlertTriangle,  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  emoji: '⚠️'  },
  user:    { icon: FiUser,           color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.25)',  emoji: '👤'  },
  offer:   { icon: FiGift,           color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.25)',  emoji: '🎁'  },
  system:  { icon: FiSettings,       color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.25)', emoji: '⚙️'  },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.system;

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [markingAll,    setMarkingAll]    = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationsAPI.getAll({ limit: 20, type: 'contact' });
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('❌ Fetch notifications error:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('❌ Mark all read error:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .an-page { min-height: 100vh; font-family: 'DM Sans', sans-serif; background: radial-gradient(circle at 15% 10%, rgba(249,115,22,0.07) 0%, transparent 55%), radial-gradient(circle at 85% 90%, rgba(139,92,246,0.06) 0%, transparent 55%), linear-gradient(160deg, #060c1a 0%, #0a1628 50%, #060c1a 100%); padding: 32px 28px 100px; }
        @media (max-width: 640px) { .an-page { padding: 18px 14px 80px; } }
        .an-wrap { max-width: 900px; margin: 0 auto; }

        .an-header { background: rgba(255,255,255,0.04); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; padding: 26px 30px; margin-bottom: 20px; position: relative; overflow: hidden; }
        .an-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #f97316, #ea580c, transparent); border-radius: 22px 22px 0 0; }
        .an-header-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
        .an-header-left { display: flex; align-items: center; gap: 14px; }
        .an-header-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(249,115,22,0.14); border: 1px solid rgba(249,115,22,0.28); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .an-title { font-family: 'Playfair Display', serif; font-size: clamp(20px, 3vw, 28px); font-weight: 800; color: #fff; margin-bottom: 4px; }
        .an-sub { font-size: 13px; color: rgba(255,255,255,0.38); }
        .an-unread-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(234,88,12,0.16); border: 1px solid rgba(234,88,12,0.30); color: #fb923c; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 999px; white-space: nowrap; }
        .an-mark-all-btn { display: inline-flex; align-items: center; gap: 7px; background: rgba(74,222,128,0.10); border: 1px solid rgba(74,222,128,0.22); color: #4ade80; font-size: 13px; font-weight: 700; padding: 9px 18px; border-radius: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.2s, transform 0.2s; }
        .an-mark-all-btn:hover { background: rgba(74,222,128,0.17); transform: translateY(-1px); }
        .an-mark-all-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .an-list { display: flex; flex-direction: column; gap: 10px; }

        .an-item { display: flex; align-items: flex-start; gap: 14px; padding: 18px 20px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; cursor: pointer; transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease; position: relative; overflow: hidden; animation: anItemIn 0.4s ease both; }
        @keyframes anItemIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .an-item.unread { background: rgba(249,115,22,0.04); border-color: rgba(249,115,22,0.15); }
        .an-item:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.30); border-color: rgba(249,115,22,0.30); background: rgba(249,115,22,0.06); }
        .an-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 16px 0 0 16px; transition: opacity 0.2s; }
        .an-item.unread::before { opacity: 1; }
        .an-item:not(.unread)::before { opacity: 0; }

        .an-type-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; }
        .an-body { flex: 1; min-width: 0; }
        .an-item-title { font-size: 14px; font-weight: 700; color: #f1f5f9; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .an-item-msg { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px; }
        .an-item-footer { display: flex; align-items: center; gap: 10px; }
        .an-item-time { font-size: 11.5px; color: rgba(255,255,255,0.25); font-weight: 500; }
        .an-type-badge { font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
        .an-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #f97316; box-shadow: 0 0 6px rgba(249,115,22,0.55); flex-shrink: 0; margin-top: 4px; }
        .an-arrow { color: rgba(255,255,255,0.20); flex-shrink: 0; transition: transform 0.2s, color 0.2s; margin-top: 2px; }
        .an-item:hover .an-arrow { transform: translateX(4px); color: #fb923c; }

        .an-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 20px; gap: 14px; color: rgba(255,255,255,0.35); font-size: 14px; }
        .an-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22); border-radius: 14px; padding: 16px 20px; color: #fca5a5; font-size: 14px; text-align: center; }
        .an-empty { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 56px 20px; text-align: center; }
        .an-empty-icon { width: 60px; height: 60px; border-radius: 18px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 16px; }
        .an-empty-text { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.40); margin-bottom: 6px; }
        .an-empty-sub  { font-size: 13px; color: rgba(255,255,255,0.22); }
      `}</style>

      <div className="an-page">
        <div className="an-wrap">

          {/* Header */}
          <div className="an-header">
            <div className="an-header-inner">
              <div className="an-header-left">
                <div className="an-header-icon">
                  <FiBell size={22} color="#f97316" />
                </div>
                <div>
                  <h1 className="an-title">Notifications</h1>
                  <p className="an-sub">Latest 20 admin notifications</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {unreadCount > 0 && (
                  <span className="an-unread-pill">
                    🔴 {unreadCount} unread
                  </span>
                )}
                {unreadCount > 0 && (
                  <button
                    className="an-mark-all-btn"
                    onClick={handleMarkAllRead}
                    disabled={markingAll}
                  >
                    <FiCheck size={14} />
                    {markingAll ? 'Marking...' : 'Mark all read'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="an-loading">
              <svg style={{ animation: 'spin .75s linear infinite' }} width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="4" strokeOpacity=".25"/>
                <path fill="#f97316" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading notifications...
            </div>
          ) : error ? (
            <div className="an-error">⚠️ {error}</div>
          ) : notifications.length === 0 ? (
            <div className="an-empty">
              <div className="an-empty-icon">🔔</div>
              <p className="an-empty-text">No notifications yet</p>
              <p className="an-empty-sub">Notifications will appear here when users take actions</p>
            </div>
          ) : (
            <div className="an-list">
              {notifications.map((notif, i) => {
                const cfg = getTypeConfig(notif.type);
                return (
                  <div
                    key={notif._id}
                    className={`an-item${!notif.isRead ? ' unread' : ''}`}
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => navigate(`/admin/notifications/${notif._id}`)}
                  >
                    {/* Left accent bar color */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: cfg.color, borderRadius: '16px 0 0 16px', opacity: notif.isRead ? 0 : 1 }} />

                    {/* Type icon */}
                    <div
                      className="an-type-icon"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                    >
                      {cfg.emoji}
                    </div>

                    {/* Body */}
                    <div className="an-body">
                      <p className="an-item-title">{notif.title}</p>
                      <p className="an-item-msg">
                        {notif.message.length > 100
                          ? notif.message.substring(0, 100) + '...'
                          : notif.message}
                      </p>
                      <div className="an-item-footer">
                        <span className="an-item-time">{timeAgo(notif.createdAt)}</span>
                        <span
                          className="an-type-badge"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                        >
                          {notif.type}
                        </span>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!notif.isRead && <div className="an-unread-dot" />}

                    {/* Arrow */}
                    <FiArrowRight size={16} className="an-arrow" />
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AdminNotifications;