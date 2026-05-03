// frontend/src/pages/Admin/AdminNotificationDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../services/api';
import { FiBell, FiArrowLeft, FiClock, FiTag, FiMail, FiPackage, FiCreditCard, FiAlertTriangle, FiUser, FiSettings, FiGift } from 'react-icons/fi';

const TYPE_CONFIG = {
  contact: { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)',  emoji: '✉️'  },
  order:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  emoji: '📦'  },
  payment: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',   emoji: '💳'  },
  stock:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  emoji: '⚠️'  },
  user:    { color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.25)',  emoji: '👤'  },
  offer:   { color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.25)',  emoji: '🎁'  },
  system:  { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.25)', emoji: '⚙️'  },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.system;

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const AdminNotificationDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [notif,   setNotif]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetchNotification();
  }, [id]);

  const fetchNotification = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationsAPI.getById(id);
      setNotif(res.data.notification);

      // Mark as read silently on open
      if (!res.data.notification.isRead) {
        notificationsAPI.markAsRead(id).catch(() => {});
      }
    } catch (err) {
      console.error('❌ Fetch notification error:', err);
      setError(
        err.response?.status === 404
          ? 'Notification not found.'
          : 'Failed to load notification. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .and-page { min-height: 100vh; font-family: 'DM Sans', sans-serif; background: radial-gradient(circle at 15% 10%, rgba(249,115,22,0.07) 0%, transparent 55%), radial-gradient(circle at 85% 90%, rgba(139,92,246,0.06) 0%, transparent 55%), linear-gradient(160deg, #060c1a 0%, #0a1628 50%, #060c1a 100%); padding: 32px 28px 100px; }
        @media (max-width: 640px) { .and-page { padding: 18px 14px 80px; } }
        .and-wrap { max-width: 760px; margin: 0 auto; }

        .and-back-btn { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); padding: 9px 16px; border-radius: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.2s; margin-bottom: 22px; }
        .and-back-btn:hover { color: #fff; background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.16); transform: translateX(-3px); }

        .and-card { background: rgba(255,255,255,0.04); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; overflow: hidden; animation: andCardIn 0.4s ease both; }
        @keyframes andCardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .and-card-top { padding: 28px 30px 22px; border-bottom: 1px solid rgba(255,255,255,0.07); position: relative; }
        .and-card-top::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 22px 22px 0 0; }
        .and-type-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .and-type-icon { width: 52px; height: 52px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .and-type-badge { font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 999px; letter-spacing: 0.06em; text-transform: uppercase; }
        .and-unread-badge { font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 999px; background: rgba(249,115,22,0.14); border: 1px solid rgba(249,115,22,0.28); color: #fb923c; }
        .and-read-badge { font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 999px; background: rgba(74,222,128,0.10); border: 1px solid rgba(74,222,128,0.22); color: #4ade80; }

        .and-title { font-family: 'Playfair Display', serif; font-size: clamp(20px, 3vw, 28px); font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 0; }

        .and-meta { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; padding: 16px 30px; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.02); }
        .and-meta-item { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: rgba(255,255,255,0.38); font-weight: 500; }
        .and-meta-item svg { flex-shrink: 0; }

        .and-body { padding: 28px 30px; }
        .and-body-label { font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.28); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 14px; }
        .and-message { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.80; white-space: pre-line; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px 22px; }

        .and-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; gap: 14px; color: rgba(255,255,255,0.35); font-size: 14px; }
        .and-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22); border-radius: 16px; padding: 28px 20px; color: #fca5a5; font-size: 14px; text-align: center; }

        @media (max-width: 640px) {
          .and-card-top { padding: 20px; }
          .and-body { padding: 20px; }
          .and-meta { padding: 14px 20px; }
        }
      `}</style>

      <div className="and-page">
        <div className="and-wrap">

          {/* Back button */}
          <button className="and-back-btn" onClick={() => navigate('/admin/notifications')}>
            <FiArrowLeft size={15} /> Back to Notifications
          </button>

          {loading ? (
            <div className="and-loading">
              <svg style={{ animation: 'spin .75s linear infinite' }} width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="4" strokeOpacity=".25"/>
                <path fill="#f97316" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading notification...
            </div>
          ) : error ? (
            <div className="and-error">⚠️ {error}</div>
          ) : notif ? (() => {
            const cfg = getTypeConfig(notif.type);
            return (
              <div className="and-card">

                {/* Top section */}
                <div className="and-card-top" style={{ '--accent': cfg.color }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${cfg.color}, transparent)`, borderRadius: '22px 22px 0 0' }} />

                  <div className="and-type-row">
                    <div className="and-type-icon" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      {cfg.emoji}
                    </div>
                    <span className="and-type-badge" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                      {notif.type}
                    </span>
                    <span className={notif.isRead ? 'and-read-badge' : 'and-unread-badge'}>
                      {notif.isRead ? '✓ Read' : '● Unread'}
                    </span>
                  </div>

                  <h1 className="and-title">{notif.title}</h1>
                </div>

                {/* Meta row */}
                <div className="and-meta">
                  <div className="and-meta-item">
                    <FiClock size={13} color={cfg.color} />
                    {formatDate(notif.createdAt)}
                  </div>
                  <div className="and-meta-item">
                    <FiTag size={13} color={cfg.color} />
                    Type: {notif.type}
                  </div>
                  {notif.actionLink && (
                    <div className="and-meta-item">
                      <FiBell size={13} color={cfg.color} />
                      {notif.actionLink}
                    </div>
                  )}
                </div>

                {/* Message body */}
                <div className="and-body">
                  <p className="and-body-label">Message</p>
                  <div className="and-message">{notif.message}</div>
                </div>

              </div>
            );
          })() : null}

        </div>
      </div>
    </>
  );
};

export default AdminNotificationDetail;