import React, { useState, useEffect, useContext } from 'react';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiUsers, FiShoppingBag, FiPackage, FiDollarSign,
  FiClock, FiCheck, FiPlus, FiEye, FiBarChart2,
  FiArrowRight, FiZap, FiActivity,
} from 'react-icons/fi';

const STAT_CONFIG = [
  { key:'totalUsers',      label:'Total Users',      icon:FiUsers,       color:'#60a5fa', bg:'rgba(96,165,250,0.12)',  border:'rgba(96,165,250,0.25)',  glow:'rgba(96,165,250,0.22)'  },
  { key:'totalOrders',     label:'Total Orders',     icon:FiShoppingBag, color:'#fb923c', bg:'rgba(249,115,22,0.12)',  border:'rgba(249,115,22,0.28)',  glow:'rgba(249,115,22,0.22)'  },
  { key:'totalProducts',   label:'Total Products',   icon:FiPackage,     color:'#c084fc', bg:'rgba(192,132,252,0.12)', border:'rgba(192,132,252,0.28)', glow:'rgba(192,132,252,0.18)' },
  { key:'totalRevenue',    label:'Total Revenue',    icon:FiDollarSign,  color:'#f97316', bg:'rgba(249,115,22,0.14)',  border:'rgba(249,115,22,0.32)',  glow:'rgba(249,115,22,0.30)', pulse:true },
  { key:'pendingOrders',   label:'Pending Orders',   icon:FiClock,       color:'#fbbf24', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.28)',  glow:'rgba(251,191,36,0.20)', amber:true },
  { key:'deliveredOrders', label:'Delivered',        icon:FiCheck,       color:'#4ade80', bg:'rgba(74,222,128,0.12)',  border:'rgba(74,222,128,0.28)',  glow:'rgba(74,222,128,0.22)'  },
];

const StatCard = ({ stat, val, idx }) => {
  const [hov, setHov] = useState(false);
  const Icon = stat.icon;
  return (
    <div
      className={`mc-stat ${stat.pulse ? 'mc-stat-pulse' : ''} ${stat.amber ? 'mc-stat-amber' : ''}`}
      style={{
        animationDelay: `${idx * 80}ms`,
        borderColor: hov ? stat.border : 'rgba(255,255,255,0.08)',
        transform: hov ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hov
          ? `0 20px 48px rgba(0,0,0,0.40), 0 0 0 1px ${stat.border}, 0 0 32px ${stat.glow}`
          : `0 4px 20px rgba(0,0,0,0.22)`,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="mc-stat-ico" style={{ background:stat.bg, border:`1px solid ${stat.border}`, boxShadow: hov ? `0 0 22px ${stat.glow}` : 'none' }}>
        <Icon size={22} color={stat.color} />
      </div>
      <p className="mc-stat-val" style={{ color: stat.color }}>{val ?? '—'}</p>
      <p className="mc-stat-lbl">{stat.label}</p>
      <div className="mc-stat-line" style={{ background: stat.color, opacity: hov ? 0.55 : 0 }} />
    </div>
  );
};

const STATUS = {
  delivered:  { color:'#4ade80', bg:'rgba(74,222,128,0.12)',  border:'rgba(74,222,128,0.25)'  },
  cancelled:  { color:'#f87171', bg:'rgba(239,68,68,0.10)',   border:'rgba(239,68,68,0.22)'   },
  pending:    { color:'#fbbf24', bg:'rgba(251,191,36,0.10)',  border:'rgba(251,191,36,0.22)'  },
  processing: { color:'#60a5fa', bg:'rgba(96,165,250,0.10)',  border:'rgba(96,165,250,0.22)'  },
  shipped:    { color:'#a78bfa', bg:'rgba(167,139,250,0.10)', border:'rgba(167,139,250,0.22)' },
  packed:     { color:'#fb923c', bg:'rgba(249,115,22,0.10)',  border:'rgba(249,115,22,0.22)'  },
};
const getStatus = (s = '') => STATUS[s.toLowerCase()] || STATUS.pending;

const AdminDashboard = () => {
  const { user }  = useContext(AuthContext);
  const navigate  = useNavigate();

  const [stats,        setStats]        = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [dataLoading,  setDataLoading]  = useState(true);

  useEffect(() => {
    if (!user) { navigate('/signin'); return; }
    if (user.role !== 'admin') { alert('Access denied. Admin only.'); navigate('/'); return; }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchData = async () => {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getRecentOrders(5),
        ]);
        if (dashRes.data?.stats)    setStats(dashRes.data.stats);
        if (ordersRes.data?.orders) setRecentOrders(ordersRes.data.orders);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getStatVal = (key) => {
    if (!stats) return '—';
    if (key === 'totalRevenue') return formatPrice(stats.totalRevenue || 0);
    return String(stats[key] ?? 0);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'radial-gradient(circle at top left,#0f172a,#000,#020617)' }}>
        <div style={{ textAlign:'center', padding:32, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20 }}>
          <p style={{ fontSize:20, fontWeight:800, color:'#f1f5f9', marginBottom:8 }}>Access Denied</p>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.38)' }}>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const firstName = user?.fullName?.split(' ')[0] || 'Admin';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .mc-page { min-height:100vh; font-family:'DM Sans',sans-serif; background:radial-gradient(circle at 15% 10%,rgba(249,115,22,0.08) 0%,transparent 55%),radial-gradient(circle at 85% 90%,rgba(139,92,246,0.07) 0%,transparent 55%),linear-gradient(160deg,#060c1a 0%,#0a1628 50%,#060c1a 100%); padding:32px 28px 100px; }
        @media(max-width:640px){ .mc-page{padding:18px 14px 80px;} }
        .mc-wrap { max-width:1320px; margin:0 auto; }

        .mc-welcome { background:rgba(255,255,255,0.04); backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.08); border-radius:22px; padding:26px 30px; margin-bottom:20px; position:relative; overflow:hidden; }
        .mc-welcome::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#f97316,#ea580c,#c084fc,transparent); }
        .mc-welcome::after  { content:''; position:absolute; z-index:0; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(249,115,22,0.07) 0%,transparent 70%); top:-100px; right:-60px; pointer-events:none; }
        .mc-welcome-inner { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .mc-greeting-sm  { font-size:11.5px; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:.13em; margin-bottom:6px; }
        .mc-greeting     { font-family:'Playfair Display',serif; font-size:clamp(22px,3vw,34px); font-weight:800; color:#fff; line-height:1.1; }
        .mc-greeting-name { color:#f97316; }
        .mc-greeting-sub { font-size:13px; color:rgba(255,255,255,0.35); margin-top:5px; }
        .mc-live { display:inline-flex; align-items:center; gap:7px; background:rgba(74,222,128,0.10); border:1px solid rgba(74,222,128,0.22); color:#4ade80; font-size:12px; font-weight:800; padding:7px 14px; border-radius:999px; white-space:nowrap; }
        .mc-live-dot { width:8px; height:8px; border-radius:50%; background:#4ade80; animation:mcLivePulse 2s ease-in-out infinite; }
        @keyframes mcLivePulse { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4)} 50%{box-shadow:0 0 0 5px rgba(74,222,128,0)} }

        .mc-dock { background:rgba(255,255,255,0.04); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:14px 20px; margin-bottom:20px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .mc-dock-label { font-size:10.5px; font-weight:800; color:rgba(255,255,255,0.22); text-transform:uppercase; letter-spacing:.12em; margin-right:4px; white-space:nowrap; }
        .mc-dock-sep { width:1px; height:28px; background:rgba(255,255,255,0.08); margin:0 4px; }
        .mc-dock-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:11px; font-size:13px; font-weight:700; text-decoration:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:transform .22s,box-shadow .22s,filter .22s; white-space:nowrap; }
        .mc-dock-btn:hover { transform:translateY(-2px) scale(1.04); filter:brightness(1.10); }
        .mc-dock-btn:active { transform:scale(0.97); }
        .mc-btn-orange { background:linear-gradient(135deg,#ea580c,#f97316); color:#fff; box-shadow:0 4px 14px rgba(249,115,22,0.30); }
        .mc-btn-blue   { background:linear-gradient(135deg,#2563eb,#3b82f6); color:#fff; box-shadow:0 4px 14px rgba(59,130,246,0.25); }
        .mc-btn-purple { background:linear-gradient(135deg,#7c3aed,#8b5cf6); color:#fff; box-shadow:0 4px 14px rgba(139,92,246,0.25); }
        .mc-btn-orange:hover { box-shadow:0 8px 22px rgba(249,115,22,0.48); }
        .mc-btn-blue:hover   { box-shadow:0 8px 22px rgba(59,130,246,0.44); }
        .mc-btn-purple:hover { box-shadow:0 8px 22px rgba(139,92,246,0.44); }

        .mc-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:14px; margin-bottom:20px; }
        .mc-stat { background:rgba(255,255,255,0.04); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,0.08); border-radius:18px; padding:20px 18px; position:relative; overflow:hidden; transition:transform .28s ease,box-shadow .28s ease,border-color .28s ease; cursor:default; animation:mcStatIn .55s ease both; }
        @keyframes mcStatIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .mc-stat-pulse { animation:mcStatIn .55s ease both,mcHeartbeat 3s ease-in-out 1s infinite; }
        @keyframes mcHeartbeat { 0%,90%,100%{box-shadow:0 4px 20px rgba(0,0,0,0.22)} 95%{box-shadow:0 4px 20px rgba(0,0,0,0.22),0 0 28px rgba(249,115,22,0.22)} }
        .mc-stat-amber .mc-stat-ico { animation:mcAmberPulse 2.5s ease-in-out infinite; }
        @keyframes mcAmberPulse { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 16px rgba(251,191,36,0.40)} }
        .mc-stat-ico { width:46px; height:46px; border-radius:13px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; transition:box-shadow .28s; }
        .mc-stat-val { font-size:clamp(24px,3vw,32px); font-weight:800; font-family:monospace; line-height:1; margin-bottom:5px; }
        .mc-stat-lbl { font-size:11.5px; font-weight:700; color:rgba(255,255,255,0.34); text-transform:uppercase; letter-spacing:.08em; }
        .mc-stat-line { position:absolute; bottom:0; left:0; right:0; height:2px; transition:opacity .28s; }

        .mc-info-card { background:rgba(255,255,255,0.03); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,0.07); border-radius:18px; padding:24px; margin-bottom:20px; animation:mcStatIn .55s ease .3s both; position:relative; overflow:hidden; }
        .mc-info-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#f97316,transparent); border-radius:18px 18px 0 0; }
        .mc-info-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:#f1f5f9; margin-bottom:6px; }
        .mc-info-sub   { font-size:14px; color:rgba(255,255,255,0.42); line-height:1.6; margin-bottom:14px; }
        .mc-quick-links { display:flex; gap:9px; flex-wrap:wrap; }
        .mc-ql { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:rgba(255,255,255,0.45); text-decoration:none; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); padding:6px 12px; border-radius:9px; transition:color .2s,border-color .2s,background .2s; }
        .mc-ql:hover { color:#fff; border-color:rgba(249,115,22,0.30); background:rgba(249,115,22,0.08); }

        .mc-orders-card { background:rgba(255,255,255,0.04); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,0.08); border-radius:18px; padding:22px; animation:mcStatIn .55s ease .4s both; }
        .mc-orders-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; flex-wrap:wrap; gap:10px; }
        .mc-orders-title-row { display:flex; align-items:center; gap:10px; }
        .mc-orders-title { font-size:15px; font-weight:700; color:#f1f5f9; }
        .mc-feed-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.22); color:#fb923c; font-size:10.5px; font-weight:800; padding:3px 9px; border-radius:999px; }
        .mc-view-all { display:inline-flex; align-items:center; gap:5px; font-size:12.5px; font-weight:700; color:#fb923c; text-decoration:none; transition:gap .2s; }
        .mc-view-all:hover { gap:8px; }

        .mc-order-row { display:flex; align-items:center; gap:14px; padding:11px 12px; border-radius:12px; margin-bottom:4px; border:1px solid transparent; border-left:3px solid transparent; transition:background .2s,border-left-color .2s,border-color .2s; cursor:default; animation:mcRowIn .4s ease both; }
        .mc-order-row:last-child { margin-bottom:0; }
        .mc-order-row:hover { background:rgba(249,115,22,0.06); border-left-color:#f97316; border-color:rgba(249,115,22,0.12); }
        @keyframes mcRowIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .mc-order-id    { font-family:monospace; font-size:11.5px; font-weight:700; color:rgba(255,255,255,0.38); background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.09); padding:2px 9px; border-radius:6px; flex-shrink:0; white-space:nowrap; }
        .mc-order-cust  { flex:1; min-width:0; }
        .mc-order-name  { font-size:13.5px; font-weight:700; color:#f1f5f9; }
        .mc-order-email { font-size:11.5px; color:rgba(255,255,255,0.32); }
        .mc-order-badge { display:inline-flex; align-items:center; gap:5px; font-size:10.5px; font-weight:800; padding:3px 10px; border-radius:999px; white-space:nowrap; flex-shrink:0; }
        .mc-order-price { font-family:monospace; font-size:13.5px; font-weight:800; white-space:nowrap; background:linear-gradient(90deg,#fb923c,#f97316); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .mc-orders-empty { text-align:center; padding:36px 20px; font-size:14px; color:rgba(255,255,255,0.28); }

        @media(max-width:640px){ .mc-stats{grid-template-columns:repeat(2,1fr);} .mc-welcome{padding:18px;} .mc-dock{padding:12px 14px;} }
      `}</style>

      <div className="mc-page">
        <div className="mc-wrap">

          {/* WELCOME HEADER */}
          <div className="mc-welcome" style={{ marginBottom:18 }}>
            <div className="mc-welcome-inner">
              <div>
                <p className="mc-greeting-sm">{greeting}</p>
                <h1 className="mc-greeting">Welcome back, <span className="mc-greeting-name">{firstName}</span>!</h1>
                <p className="mc-greeting-sub">Here's what's happening in your store today.</p>
              </div>
              <div className="mc-live"><div className="mc-live-dot" /> Store Live</div>
            </div>
          </div>

          {/* COMMAND DOCK */}
          <div className="mc-dock">
            <span className="mc-dock-label">Quick Actions</span>
            <div className="mc-dock-sep" />
            <Link to="/admin/products/add" className="mc-dock-btn mc-btn-orange"><FiPlus size={14} /> Add Product</Link>
            <Link to="/admin/orders"       className="mc-dock-btn mc-btn-blue"  ><FiEye size={14} /> View Orders</Link>
            <Link to="/admin/analytics"    className="mc-dock-btn mc-btn-purple"><FiBarChart2 size={14} /> Analytics</Link>
          </div>

          {/* STAT CARDS */}
          <div className="mc-stats">
            {STAT_CONFIG.map((s, i) => (
              <StatCard key={s.key} stat={s} val={getStatVal(s.key)} idx={i} />
            ))}
          </div>

          {/* MISSION CONTROL INFO */}
          <div className="mc-info-card">
            <p className="mc-info-title">Mission Control</p>
            <p className="mc-info-sub">Manage all aspects of Ganpati Handloom from one place. Use the sidebar to navigate between sections.</p>
            <div className="mc-quick-links">
              {[
                { to:'/admin/products',   icon:FiPackage,     label:'Products'   },
                { to:'/admin/orders',     icon:FiShoppingBag, label:'Orders'     },
                { to:'/admin/users',      icon:FiUsers,       label:'Users'      },
                { to:'/admin/categories', icon:FiZap,         label:'Categories' },
                { to:'/admin/analytics',  icon:FiBarChart2,   label:'Analytics'  },
              ].map(q => (
                <Link key={q.to} to={q.to} className="mc-ql">
                  <q.icon size={12} /> {q.label} <FiArrowRight size={11} />
                </Link>
              ))}
            </div>
          </div>

          {/* RECENT ORDERS */}
          <div className="mc-orders-card">
            <div className="mc-orders-hdr">
              <div className="mc-orders-title-row">
                <p className="mc-orders-title">Recent Orders</p>
                <span className="mc-feed-badge"><FiActivity size={10} /> Live Feed</span>
              </div>
              <Link to="/admin/orders" className="mc-view-all">View All <FiArrowRight size={13} /></Link>
            </div>

            {recentOrders.length > 0 ? (
              <div>
                {recentOrders.map((order, i) => {
                  const sc = getStatus(order.orderStatus);
                  return (
                    <div key={order._id} className="mc-order-row" style={{ animationDelay:`${i*60}ms` }}>
                      <span className="mc-order-id">#{order._id.slice(-6).toUpperCase()}</span>
                      <div className="mc-order-cust">
                        <p className="mc-order-name">{order.user?.fullName || 'Guest'}</p>
                        <p className="mc-order-email">{order.user?.email || ''}</p>
                      </div>
                      <span className="mc-order-badge" style={{ background:sc.bg, border:`1px solid ${sc.border}`, color:sc.color }}>
                        {order.orderStatus}
                      </span>
                      <span className="mc-order-price">{formatPrice(order.totalPrice)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mc-orders-empty">
                <FiShoppingBag size={32} style={{ color:'rgba(255,255,255,0.12)', margin:'0 auto 10px', display:'block' }} />
                {dataLoading ? 'Loading orders...' : 'No recent orders yet'}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminDashboard;