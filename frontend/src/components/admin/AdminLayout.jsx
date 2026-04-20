import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiPackage, FiShoppingBag, FiUsers,
  FiBarChart2, FiMenu, FiX, FiTag, FiStar,
} from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/admin',                      icon: FiHome,      label: 'Dashboard',           exact: true },
    { path: '/admin/products',             icon: FiPackage,   label: 'Products' },
    { path: '/admin/orders',               icon: FiShoppingBag, label: 'Orders' },
    { path: '/admin/users',                icon: FiUsers,     label: 'Users' },
    { path: '/admin/categories',           icon: FiTag,       label: 'Categories' },
    { path: '/admin/coupons',              icon: FiTag,       label: 'Coupons' },
    // ✅ NEW
    { path: '/admin/festive-collections',  icon: FiStar,      label: 'Festive Collections' },
    { path: '/admin/analytics',            icon: FiBarChart2, label: 'Analytics' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        html, body { overflow-y: auto; overflow-x: hidden; }

        .adm-root {
          display: flex;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #070d1a;
          background-image:
            radial-gradient(ellipse 70% 50% at 15% 10%, rgba(234,88,12,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 60%),
            linear-gradient(160deg, #070d1a 0%, #0d1a2e 55%, #070d1a 100%);
        }

        .adm-sidebar {
          width: 240px; flex-shrink: 0;
          background: rgba(13,26,46,0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          position: sticky; top: 0;
          height: 100vh;
          overflow-y: auto; scrollbar-width: none;
        }
        .adm-sidebar::-webkit-scrollbar { display: none; }

        .adm-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 22px 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 10px; flex-shrink: 0;
        }
        .adm-logo-icon { font-size: 26px; filter: drop-shadow(0 0 8px rgba(234,88,12,0.45)); }
        .adm-logo-text { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -.01em; }
        .adm-logo-badge {
          font-size: 9px; font-weight: 700;
          background: rgba(234,88,12,0.18); border: 1px solid rgba(234,88,12,0.28);
          color: #fb923c; padding: 2px 6px; border-radius: 4px;
          letter-spacing: .06em; text-transform: uppercase; margin-left: auto;
        }

        .adm-nav-label {
          font-size: 9.5px; font-weight: 800; letter-spacing: .14em;
          text-transform: uppercase; color: rgba(255,255,255,0.22);
          padding: 10px 20px 6px;
        }

        .adm-nav { padding: 0 10px; flex: 1; }
        .adm-nav-item {
          display: flex; align-items: center; gap: 11px;
          padding: 11px 14px; border-radius: 12px;
          font-size: 13.5px; font-weight: 600;
          color: rgba(255,255,255,0.45);
          text-decoration: none; margin-bottom: 3px;
          position: relative; overflow: hidden;
          transition: color .2s, background .2s;
          border: 1px solid transparent;
        }
        .adm-nav-item:hover:not(.adm-nav-active) {
          color: rgba(255,255,255,0.80);
          background: rgba(255,255,255,0.05);
        }
        .adm-nav-item.adm-nav-active {
          color: #fff;
          background: linear-gradient(135deg, rgba(234,88,12,0.18), rgba(249,115,22,0.10));
          border-color: rgba(234,88,12,0.22);
          box-shadow: 0 4px 14px rgba(234,88,12,0.12);
        }
        .adm-nav-item.adm-nav-active::before {
          content: '';
          position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 3px 3px 0;
          background: linear-gradient(to bottom, #ea580c, #f97316);
        }
        .adm-nav-icon { flex-shrink: 0; transition: transform .2s; }
        .adm-nav-item:hover .adm-nav-icon { transform: scale(1.12); }
        .adm-nav-item.adm-nav-active .adm-nav-icon { color: #fb923c; }

        .adm-sidebar-footer {
          padding: 14px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 11px; color: rgba(255,255,255,0.22);
          flex-shrink: 0;
        }

        .adm-mobile-overlay {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(0,0,0,0.70); backdrop-filter: blur(4px);
        }
        .adm-mobile-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; width: 260px; z-index: 51;
          background: rgba(10,20,38,0.98); border-right: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px); display: flex; flex-direction: column;
          overflow-y: auto; scrollbar-width: none; animation: slideInLeft .22s ease;
        }
        .adm-mobile-sidebar::-webkit-scrollbar { display: none; }
        @keyframes slideInLeft { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        .adm-mob-close {
          position: absolute; top: 14px; right: -50px;
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18);
          color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer;
        }

        .adm-topbar {
          display: none; align-items: center; justify-content: space-between;
          background: rgba(13,26,46,0.95); backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 12px 16px; position: sticky; top: 0; z-index: 30;
        }
        @media (max-width: 767px) { .adm-topbar { display: flex; } }
        @media (min-width: 768px) { .adm-sidebar { display: flex !important; } }

        .adm-topbar-menu {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.70);
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .adm-topbar-title { font-size: 15px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 7px; }

        .adm-main { flex: 1; min-width: 0; }

        @media (max-width: 767px) { .adm-sidebar { display: none; } }
      `}</style>

      <div className="adm-root">

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="adm-sidebar">
          <div className="adm-logo">
            <span className="adm-logo-icon">🕉️</span>
            <span className="adm-logo-text">Admin Panel</span>
            <span className="adm-logo-badge">Pro</span>
          </div>

          <p className="adm-nav-label">Navigation</p>

          <nav className="adm-nav">
            {menuItems.map((item) => {
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`adm-nav-item ${active ? 'adm-nav-active' : ''}`}
                >
                  <item.icon size={17} className="adm-nav-icon" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="adm-sidebar-footer">Ganpati Handloom © 2025</div>
        </aside>

        {/* ── MOBILE OVERLAY + SIDEBAR ── */}
        {sidebarOpen && (
          <>
            <div className="adm-mobile-overlay" onClick={() => setSidebarOpen(false)} />
            <div className="adm-mobile-sidebar">
              <button className="adm-mob-close" onClick={() => setSidebarOpen(false)}>
                <FiX size={16} />
              </button>
              <div className="adm-logo">
                <span className="adm-logo-icon">🕉️</span>
                <span className="adm-logo-text">Admin Panel</span>
              </div>
              <p className="adm-nav-label">Navigation</p>
              <nav className="adm-nav">
                {menuItems.map((item) => {
                  const active = isActive(item.path, item.exact);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`adm-nav-item ${active ? 'adm-nav-active' : ''}`}
                    >
                      <item.icon size={17} className="adm-nav-icon" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </>
        )}

        {/* ── MAIN CONTENT ── */}
        <div className="adm-main">
          <div className="adm-topbar">
            <button className="adm-topbar-menu" onClick={() => setSidebarOpen(true)}>
              <FiMenu size={18} />
            </button>
            <span className="adm-topbar-title"><span>🕉️</span> Admin Panel</span>
            <div style={{ width: 38 }} />
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export default AdminLayout;