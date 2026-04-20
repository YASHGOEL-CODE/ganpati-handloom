import React, { useState, useEffect, useContext } from 'react';
import { getImageUrl } from '../../utils/imageHelper';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import RevenueLineChart from '../../components/admin/RevenueLineChart';
import OrderStatusPieChart from '../../components/admin/OrderStatusPieChart';
import LowStockAlert from '../../components/admin/LowStockAlert';
import {
  FiDollarSign, FiTrendingUp, FiShoppingBag,
  FiClock, FiCheckCircle, FiXCircle, FiAward,
  FiAlertTriangle, FiBarChart2, FiFilter,
} from 'react-icons/fi';

/* ─────────────────────────────────────────────────
   HELPER — how many labels to skip based on count
───────────────────────────────────────────────── */
const getLabelStep = (count) => {
  if (count <= 7)  return 1;   // show every label
  if (count <= 14) return 2;   // every 2nd
  if (count <= 31) return 4;   // every 4th  (~8 labels for 30 days)
  return 9;                    // every 9th  (~10 labels for 90 days)
};

/* ─────────────────────────────────────────────────
   SVG BAR CHART — solid rects, thinned x labels
───────────────────────────────────────────────── */
const SvgBarChart = ({ data, max, days, color, label }) => {
  const [hovIdx, setHovIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.25)', fontSize:13 }}>
        No data available for this period
      </div>
    );
  }

  const W       = 500;
  const H       = 160;
  const LABEL_H = 20;
  const BAR_H   = H - LABEL_H;
  const safeMax = Math.max(max || 0, ...data, 1);
  const n       = data.length;
  const gap     = n > 20 ? 3 : 6;
  const barW    = (W - gap * (n + 1)) / n;
  const step    = getLabelStep(n);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width:'100%', height:'auto', display:'block', overflow:'visible' }}
    >
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((pct, i) => (
        <line key={i}
          x1={0} y1={BAR_H - pct * BAR_H}
          x2={W} y2={BAR_H - pct * BAR_H}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4"
        />
      ))}
      {/* Baseline */}
      <line x1={0} y1={BAR_H} x2={W} y2={BAR_H} stroke="rgba(255,255,255,0.09)" strokeWidth="1" />

      {data.map((val, i) => {
        const isHov    = hovIdx === i;
        const x        = gap + i * (barW + gap);
        const filledH  = val > 0 ? Math.max((val / safeMax) * BAR_H, 5) : 2;
        const emptyH   = BAR_H - filledH;
        const barFill  = isHov ? color : color + '99';
        const trackFill = isHov ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)';
        const showLabel = i % step === 0;

        return (
          <g key={i}>
            {/* Track */}
            <rect x={x} y={0} width={barW} height={BAR_H} fill={trackFill} rx="4" />
            {/* Bar */}
            <rect x={x} y={emptyH} width={barW} height={filledH} fill={barFill} rx="3" />

            {/* Tooltip */}
            {isHov && val > 0 && (
              <g>
                <rect
                  x={Math.min(x + barW / 2 - 34, W - 72)}
                  y={Math.max(emptyH - 36, 2)}
                  width={68} height={28} rx="7"
                  fill="rgba(8,16,32,0.97)"
                  stroke={color} strokeWidth="1" strokeOpacity="0.55"
                />
                <text
                  x={Math.min(x + barW / 2, W - 38)}
                  y={Math.max(emptyH - 36, 2) + 19}
                  textAnchor="middle"
                  fontSize="12" fontWeight="700" fill={color}
                  fontFamily="DM Sans, sans-serif"
                >
                  {label === 'Revenue' ? `₹${val.toLocaleString()}` : String(val)}
                </text>
              </g>
            )}

            {/* X label — only shown every `step` bars */}
            {showLabel && (
              <text
                x={x + barW / 2} y={H - 4}
                textAnchor="middle"
                fontSize="9" fontWeight="600"
                fill={isHov ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.30)'}
                fontFamily="DM Sans, sans-serif"
              >
                {days[i] || ''}
              </text>
            )}

            {/* Hit area */}
            <rect
              x={x} y={0} width={barW} height={H}
              fill="transparent" style={{ cursor:'default' }}
              onMouseEnter={() => setHovIdx(i)}
              onMouseLeave={() => setHovIdx(null)}
            />
          </g>
        );
      })}
    </svg>
  );
};

/* ─────────────────────────────────────────────────
   GLOW BAR CHART (Orders Per Day) — thinned labels
───────────────────────────────────────────────── */
const GlowBarChart = ({ data, color, label }) => {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.25)', fontSize:13 }}>
        No data available for this period
      </div>
    );
  }

  const getValue = (d) => d.count ?? d.orders ?? 0;
  const max  = Math.max(...data.map(getValue), 1);
  const step = getLabelStep(data.length);

  return (
    <div style={{ width:'100%' }}>
      {/* Bar area */}
      <div style={{ display:'flex', alignItems:'flex-end', gap: data.length > 20 ? 2 : 5, height:140 }}>
        {data.map((day, i) => {
          const val  = getValue(day);
          const pct  = Math.max((val / max) * 100, val > 0 ? 3 : 0);
          const isHov = hovered === i;
          return (
            <div
              key={i}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative', cursor:'default', height:'100%' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              {isHov && (
                <div style={{ position:'absolute', bottom:'calc(100% + 4px)', left:'50%', transform:'translateX(-50%)', background:'rgba(10,20,38,0.97)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:9, padding:'5px 10px', fontSize:11, fontWeight:700, color:'#f1f5f9', whiteSpace:'nowrap', zIndex:10, animation:'ttFade .15s ease', pointerEvents:'none' }}>
                  {val} {label}
                  <style>{`@keyframes ttFade{from{opacity:0;transform:translateX(-50%) translateY(4px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
                </div>
              )}
              {/* Track */}
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'flex-end', background:'rgba(255,255,255,0.04)', borderRadius:6, overflow:'hidden' }}>
                <div style={{ width:'100%', height:`${pct}%`, minHeight: val > 0 ? 3 : 0, background: isHov ? `linear-gradient(to top,${color},${color}cc)` : `linear-gradient(to top,${color}88,${color}44)`, borderRadius:'4px 4px 0 0', boxShadow: isHov ? `0 0 14px ${color}55` : 'none', transition:'height .5s cubic-bezier(.4,0,.2,1),background .2s,box-shadow .2s' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* X labels — thinned */}
      <div style={{ display:'flex', gap: data.length > 20 ? 2 : 5, marginTop:6 }}>
        {data.map((day, i) => (
          <div key={i} style={{ flex:1, textAlign:'center', fontSize: 9, fontWeight:600, color: hovered === i ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)', minWidth:0, overflow:'hidden' }}>
            {i % step === 0 ? (day.day || '') : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── KPI Card (unchanged) ── */
const KpiCard = ({ label, value, sub, icon: Icon, color, bg, border, delay = 0 }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(16px)', border:`1px solid ${hov ? border : 'rgba(255,255,255,0.08)'}`, borderRadius:18, padding:'20px 22px', transition:'transform .28s,box-shadow .28s,border-color .28s', transform: hov ? 'translateY(-5px)' : 'translateY(0)', boxShadow: hov ? `0 18px 44px rgba(0,0,0,0.32),0 0 0 1px ${border}` : '0 4px 18px rgba(0,0,0,0.18)', animation:`kpiIn .5s ease ${delay}ms both`, cursor:'default' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <style>{`@keyframes kpiIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ width:44, height:44, borderRadius:12, background:bg, border:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, transition:'box-shadow .28s', boxShadow: hov ? `0 0 18px ${bg}` : 'none' }}>
        <Icon size={20} color={color} />
      </div>
      <p style={{ fontSize:'clamp(22px,2.8vw,30px)', fontWeight:800, color, lineHeight:1, marginBottom:5, fontVariantNumeric:'tabular-nums' }}>{value}</p>
      <p style={{ fontSize:12.5, fontWeight:600, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom: sub ? 4 : 0 }}>{label}</p>
      {sub && <p style={{ fontSize:11.5, color:'rgba(255,255,255,0.28)' }}>{sub}</p>}
    </div>
  );
};

const AdminAnalytics = () => {
  const { user }   = useContext(AuthContext);
  const navigate   = useNavigate();

  const [loading, setLoading]                   = useState(true);
  const [dateRange, setDateRange]               = useState('7');
  const [overview, setOverview]                 = useState(null);
  const [revenueTrend, setRevenueTrend]         = useState([]);
  const [ordersTrend, setOrdersTrend]           = useState([]);
  const [statusBreakdown, setStatusBreakdown]   = useState([]);
  const [topProducts, setTopProducts]           = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [weeklyData, setWeeklyData]             = useState([]);

  useEffect(() => {
    if (!user) { navigate('/signin'); return; }
    if (user.role !== 'admin') { alert('Access denied. Admin only.'); navigate('/'); return; }
    fetchAnalyticsData();
  }, [user, navigate, dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [overviewRes, revenueTrendRes, ordersTrendRes, statusRes, topProductsRes, stockRes, weeklyRes] =
        await Promise.all([
          adminAPI.getAnalyticsOverview(),
          adminAPI.getRevenueTrend(dateRange),
          adminAPI.getOrdersTrend(dateRange),
          adminAPI.getOrderStatusBreakdown(),
          adminAPI.getTopSellingProducts(5),
          adminAPI.getLowStockProducts(),
          adminAPI.getWeeklyAnalytics(),
        ]);
      if (overviewRes.data.success)     setOverview(overviewRes.data.overview);
      if (revenueTrendRes.data.success) setRevenueTrend(revenueTrendRes.data.trend);
      if (ordersTrendRes.data.success)  setOrdersTrend(ordersTrendRes.data.trend);
      if (statusRes.data.success)       setStatusBreakdown(statusRes.data.breakdown);
      if (topProductsRes.data.success)  setTopProducts(topProductsRes.data.products);
      if (stockRes.data.success)        setLowStockProducts(stockRes.data.products);
      if (weeklyRes.data?.analytics)    setWeeklyData(weeklyRes.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartDays = weeklyData.map(d => d.day     || '');
  const chartRev  = weeklyData.map(d => d.revenue || 0);
  const chartOrds = weeklyData.map(d => d.orders  || 0);
  const maxRev    = Math.max(...chartRev,  1);
  const maxOrd    = Math.max(...chartOrds, 1);

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'radial-gradient(circle at top left,#0f172a,#000,#020617)', fontFamily:'DM Sans,sans-serif' }}>
        <div style={{ textAlign:'center', padding:32, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20 }}>
          <p style={{ fontSize:20, fontWeight:800, color:'#f1f5f9', marginBottom:8 }}>Access Denied</p>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.38)' }}>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <style>{`.an-load{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at top left,#0f172a,#000,#020617);}.an-spin{width:44px;height:44px;border-radius:50%;border:3px solid rgba(249,115,22,0.18);border-top-color:#f97316;animation:anSpin .75s linear infinite;}@keyframes anSpin{to{transform:rotate(360deg)}}`}</style>
        <div className="an-load"><div className="an-spin" /></div>
      </>
    );
  }

  const avgOrderVal = overview?.orders?.total > 0
    ? Math.round((overview?.revenue?.total || 0) / overview.orders.total) : 0;
  const cancelRate = overview?.orders?.total > 0
    ? Math.round(((overview?.orders?.cancelled || 0) / overview.orders.total) * 100) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .an-page { min-height:100vh; font-family:'DM Sans',sans-serif; background:radial-gradient(circle at top left,#0f172a 0%,#000 50%,#020617 100%); padding:32px 28px 80px; }
        @media(max-width:640px){ .an-page{padding:18px 14px 60px;} }
        .an-wrap { max-width:1320px; margin:0 auto; }

        .an-header { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:14px; background:rgba(255,255,255,0.04); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:22px 26px; margin-bottom:22px; position:relative; }
        .an-header::before { content:''; position:absolute; top:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,#f97316,#ea580c,transparent); border-radius:20px 20px 0 0; }
        .an-eyebrow { font-size:11px; font-weight:700; color:#f97316; letter-spacing:.14em; text-transform:uppercase; margin-bottom:6px; display:flex; align-items:center; gap:6px; }
        .an-eyebrow::before { content:''; display:inline-block; width:12px; height:1.5px; background:#f97316; }
        .an-title { font-size:clamp(22px,3vw,34px); font-weight:800; color:#fff; line-height:1.1; display:flex; align-items:center; gap:10px; }
        .an-sub { font-size:13px; color:rgba(255,255,255,0.35); margin-top:4px; }
        .an-date-wrap { display:flex; align-items:center; gap:9px; }
        .an-date-ico { color:rgba(255,255,255,0.35); }
        .an-date-select { background:rgba(0,0,0,0.35); border:1.5px solid rgba(255,255,255,0.10); border-radius:11px; padding:9px 14px; color:#fff; font-size:13.5px; font-family:'DM Sans',sans-serif; outline:none; cursor:pointer; transition:border-color .22s; }
        .an-date-select:focus { border-color:#f97316; }
        .an-date-select option { background:#1e293b; color:#fff; }

        .an-sec-title { font-size:15px; font-weight:800; color:#f1f5f9; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
        .an-card { background:rgba(255,255,255,0.04); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:24px; margin-bottom:20px; }
        .an-card-title { font-size:15px; font-weight:700; color:#f1f5f9; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:8px; }
        .an-card-sub { font-size:12px; color:rgba(255,255,255,0.30); margin-top:-12px; margin-bottom:16px; }

        .an-kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
        @media(max-width:900px){ .an-kpi-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:480px){ .an-kpi-grid{grid-template-columns:1fr 1fr;} }

        .an-ord-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
        @media(max-width:900px){ .an-ord-grid{grid-template-columns:repeat(2,1fr);} }

        .an-daily-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
        @media(max-width:860px){ .an-daily-grid{grid-template-columns:1fr;} }

        .an-two-col { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:20px; }
        @media(max-width:860px){ .an-two-col{grid-template-columns:1fr;} }

        .an-prod-row { display:flex; align-items:center; gap:13px; padding:12px; border-radius:12px; transition:background .2s; margin-bottom:8px; }
        .an-prod-row:last-child { margin-bottom:0; }
        .an-prod-row:hover { background:rgba(255,255,255,0.05); }
        .an-prod-rank { width:30px; height:30px; border-radius:50%; background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.22); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; color:#fb923c; flex-shrink:0; }
        .an-prod-img { width:48px; height:48px; border-radius:10px; object-fit:cover; flex-shrink:0; border:1px solid rgba(255,255,255,0.07); background:#0f172a; }
        .an-prod-name { font-size:14px; font-weight:700; color:#f1f5f9; margin-bottom:2px; }
        .an-prod-units { font-size:12px; color:rgba(255,255,255,0.38); }
        .an-prod-rev { font-size:14.5px; font-weight:800; color:#4ade80; white-space:nowrap; }
        .an-prod-rev-lbl { font-size:10.5px; color:rgba(255,255,255,0.28); text-align:right; }
        .an-no-data { text-align:center; padding:32px; font-size:14px; color:rgba(255,255,255,0.28); }
      `}</style>

      <div className="an-page">
        <div className="an-wrap">

          {/* Header */}
          <div className="an-header">
            <div>
              <p className="an-eyebrow">Admin Panel</p>
              <h1 className="an-title"><FiBarChart2 size={24} color="#f97316" /> Analytics Dashboard</h1>
              <p className="an-sub">Comprehensive insights into your store performance</p>
            </div>
            <div className="an-date-wrap">
              <FiFilter size={15} className="an-date-ico" />
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="an-date-select">
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 3 Months</option>
              </select>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="an-kpi-grid">
            <KpiCard label="Total Revenue"     value={`₹${(overview?.revenue?.total   || 0).toLocaleString()}`} sub="Lifetime"  icon={FiDollarSign}  color="#4ade80" bg="rgba(74,222,128,0.12)"  border="rgba(74,222,128,0.22)"  delay={0} />
            <KpiCard label="Today's Revenue"   value={`₹${(overview?.revenue?.today   || 0).toLocaleString()}`}               icon={FiTrendingUp}  color="#60a5fa" bg="rgba(96,165,250,0.12)"  border="rgba(96,165,250,0.22)"  delay={60} />
            <KpiCard label="Avg Order Value"   value={`₹${avgOrderVal.toLocaleString()}`}                                      icon={FiShoppingBag} color="#c084fc" bg="rgba(192,132,252,0.12)" border="rgba(192,132,252,0.22)" delay={120} />
            <KpiCard label="Cancellation Rate" value={`${cancelRate}%`}                                                        icon={FiXCircle}     color={cancelRate > 20 ? '#f87171' : '#fbbf24'} bg={cancelRate > 20 ? 'rgba(239,68,68,0.10)' : 'rgba(251,191,36,0.10)'} border={cancelRate > 20 ? 'rgba(239,68,68,0.22)' : 'rgba(251,191,36,0.22)'} delay={180} />
          </div>

          {/* Revenue line chart */}
          <div className="an-card">
            <p className="an-card-title"><FiDollarSign size={16} color="#4ade80" /> Revenue Trend</p>
            <RevenueLineChart data={revenueTrend} />
          </div>

          {/* Orders KPI row */}
          <div className="an-ord-grid">
            <KpiCard label="Total Orders" value={overview?.orders?.total     || 0} icon={FiShoppingBag} color="#60a5fa" bg="rgba(96,165,250,0.10)"  border="rgba(96,165,250,0.20)"  delay={0} />
            <KpiCard label="Pending"      value={overview?.orders?.pending   || 0} icon={FiClock}       color="#fbbf24" bg="rgba(251,191,36,0.10)"  border="rgba(251,191,36,0.20)"  delay={50} />
            <KpiCard label="Delivered"    value={overview?.orders?.delivered || 0} icon={FiCheckCircle} color="#4ade80" bg="rgba(74,222,128,0.10)"  border="rgba(74,222,128,0.20)"  delay={100} />
            <KpiCard label="Cancelled"    value={overview?.orders?.cancelled || 0} icon={FiXCircle}     color="#f87171" bg="rgba(239,68,68,0.08)"   border="rgba(239,68,68,0.20)"   delay={150} />
          </div>

          {/* Daily Revenue + Daily Orders (7-day fixed) */}
          <div className="an-daily-grid">
            <div className="an-card" style={{ marginBottom:0 }}>
              <p className="an-card-title"><FiDollarSign size={16} color="#f97316" /> Daily Revenue</p>
              <p className="an-card-sub">Last 7 days · Hover for value</p>
              <SvgBarChart data={chartRev} max={maxRev} days={chartDays} color="#f97316" label="Revenue" />
            </div>
            <div className="an-card" style={{ marginBottom:0 }}>
              <p className="an-card-title"><FiShoppingBag size={16} color="#60a5fa" /> Daily Orders</p>
              <p className="an-card-sub">Last 7 days · Hover for value</p>
              <SvgBarChart data={chartOrds} max={maxOrd} days={chartDays} color="#60a5fa" label="Orders" />
            </div>
          </div>
          <div style={{ marginBottom:20 }} />

          {/* Orders Per Day (respects date filter) */}
          <div className="an-card">
            <p className="an-card-title"><FiBarChart2 size={16} color="#60a5fa" /> Orders Per Day</p>
            <GlowBarChart data={ordersTrend} color="#60a5fa" label="orders" />
          </div>

          {/* Pie + top products */}
          <div className="an-two-col">
            <div className="an-card" style={{ marginBottom:0 }}>
              <p className="an-card-title"><FiShoppingBag size={16} color="#f97316" /> Order Status Breakdown</p>
              <OrderStatusPieChart data={statusBreakdown} />
            </div>
            <div className="an-card" style={{ marginBottom:0 }}>
              <p className="an-card-title"><FiAward size={16} color="#fbbf24" /> Top Selling Products</p>
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => {
                  const rawImage = Array.isArray(product.image) ? product.image[0] : product.image;
                  return (
                    <div key={product._id || index} className="an-prod-row">
                      <div className="an-prod-rank">{index + 1}</div>
                      <img src={getImageUrl(rawImage) || 'https://via.placeholder.com/60'} alt={product.productName} className="an-prod-img" />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p className="an-prod-name">{product.productName}</p>
                        <p className="an-prod-units">{product.unitsSold} units sold</p>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p className="an-prod-rev">₹{product.revenue.toLocaleString()}</p>
                        <p className="an-prod-rev-lbl">Revenue</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="an-no-data">No sales data available</div>
              )}
            </div>
          </div>

          {/* Low stock */}
          <div style={{ marginTop:20 }}>
            <p className="an-sec-title" style={{ marginBottom:12 }}>
              <FiAlertTriangle size={16} color="#fbbf24" /> Inventory Alert
            </p>
            <LowStockAlert products={lowStockProducts} />
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;