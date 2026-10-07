// import React, { useState, useEffect } from 'react';
// import { adminAPI } from '../../services/api';
// import { Link } from 'react-router-dom';
// import {
//   FiSearch, FiEye, FiActivity, FiTruck,
//   FiDollarSign, FiXCircle, FiChevronDown,
//   FiTag,
// } from 'react-icons/fi';

// /* ── Status config ── */
// const STATUS_CFG = {
//   delivered:  { label:'Delivered',  color:'#4ade80', bg:'rgba(74,222,128,0.10)',  border:'rgba(74,222,128,0.22)',  dot:'#4ade80' },
//   processing: { label:'Processing', color:'#fbbf24', bg:'rgba(251,191,36,0.10)',  border:'rgba(251,191,36,0.22)',  dot:'#fbbf24', pulse:true },
//   packed:     { label:'Packed',     color:'#fb923c', bg:'rgba(249,115,22,0.10)',  border:'rgba(249,115,22,0.22)',  dot:'#fb923c', pulse:true },
//   shipped:    { label:'Shipped',    color:'#60a5fa', bg:'rgba(96,165,250,0.10)',  border:'rgba(96,165,250,0.22)',  dot:'#60a5fa' },
//   cancelled:  { label:'Cancelled',  color:'#f87171', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.20)',   dot:'#f87171', strike:true },
// };
// const getCfg = (s='') => STATUS_CFG[s.toLowerCase()] || STATUS_CFG.processing;

// const FILTERS = [
//   { val:'',           label:'All' },
//   { val:'processing', label:'Processing' },
//   { val:'packed',     label:'Packed' },
//   { val:'shipped',    label:'Shipped' },
//   { val:'delivered',  label:'Delivered' },
//   { val:'cancelled',  label:'Cancelled' },
// ];

// /* ── Status dropdown cell ── */
// const StatusDropdown = ({ order, onChange }) => {
//   const [open, setOpen] = useState(false);
//   const cfg = getCfg(order.orderStatus);

//   return (
//     <div style={{ position:'relative', display:'inline-block' }}>
//       <button
//         className="ao-status-btn"
//         style={{
//           background: cfg.bg,
//           border: `1px solid ${cfg.border}`,
//           color: cfg.color,
//           textDecoration: cfg.strike ? 'line-through' : 'none',
//         }}
//         onClick={() => setOpen(!open)}
//       >
//         {cfg.pulse && <span className="ao-pulse-dot" style={{ background: cfg.dot }} />}
//         {cfg.label}
//         <FiChevronDown size={11} style={{ transition:'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
//       </button>

//       {open && (
//         <div className="ao-status-drop" onClick={(e) => e.stopPropagation()}>
//           {Object.entries(STATUS_CFG).map(([val, c]) => (
//             <button
//               key={val}
//               className="ao-status-drop-item"
//               style={{ color: c.color }}
//               onClick={() => {
//                 onChange(order._id, val);
//                 setOpen(false);
//               }}
//             >
//               <span style={{ width:7, height:7, borderRadius:'50%', background:c.dot, display:'inline-block', flexShrink:0 }} />
//               {c.label}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const AdminOrders = () => {
//   const [orders, setOrders]   = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter]   = useState('');
//   const [search, setSearch]   = useState('');

//   useEffect(() => { fetchOrders(); }, [filter]);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const params = filter ? { status: filter } : {};
//       const response = await adminAPI.getAllOrders(params);
//       if (response.data.success) setOrders(response.data.orders);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusChange = async (orderId, newStatus) => {
//     try {
//       const response = await adminAPI.updateOrderStatus(orderId, newStatus);
//       if (response.data.success) {
//         alert('Order status updated successfully!');
//         fetchOrders();
//       }
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       alert('Failed to update order status');
//     }
//   };

//   const filteredOrders = orders.filter((order) =>
//     order._id.toLowerCase().includes(search.toLowerCase()) ||
//     order.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
//     order.user?.email?.toLowerCase().includes(search.toLowerCase())
//   );

//   const activeOrders    = orders.filter(o => !['delivered','cancelled'].includes(o.orderStatus)).length;
//   const pendingShipment = orders.filter(o => ['processing','packed'].includes(o.orderStatus)).length;
//   const todayRevenue    = orders
//     .filter(o => {
//       const d = new Date(o.createdAt);
//       const now = new Date();
//       return d.toDateString() === now.toDateString() && o.orderStatus !== 'cancelled';
//     })
//     .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
//   const cancelRate = orders.length
//     ? Math.round((orders.filter(o => o.orderStatus === 'cancelled').length / orders.length) * 100)
//     : 0;

//   if (loading) {
//     return (
//       <>
//         <style>{`.ao-load{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at top left,#0f172a,#000,#020617);}.ao-spin{width:44px;height:44px;border-radius:50%;border:3px solid rgba(249,115,22,0.18);border-top-color:#f97316;animation:aoSpin .75s linear infinite;}@keyframes aoSpin{to{transform:rotate(360deg)}}`}</style>
//         <div className="ao-load"><div className="ao-spin" /></div>
//       </>
//     );
//   }

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

//         .ao-page {
//           min-height: 100vh;
//           font-family: 'DM Sans', sans-serif;
//           background: radial-gradient(circle at top left, #0f172a 0%, #000000 50%, #020617 100%);
//           padding: 32px 28px 80px;
//         }
//         @media (max-width:640px) { .ao-page { padding: 18px 14px 60px; } }
//         .ao-wrap { max-width: 1400px; margin: 0 auto; }

//         .ao-header {
//           display: flex; align-items: flex-end; justify-content: space-between;
//           flex-wrap: wrap; gap: 14px;
//           background: rgba(255,255,255,0.04); backdrop-filter: blur(20px);
//           border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
//           padding: 22px 26px; margin-bottom: 18px;
//           box-shadow: 0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
//           position: relative;
//         }
//         .ao-header::before {
//           content:''; position:absolute; top:0; left:0; right:0; height:1.5px;
//           background: linear-gradient(90deg,#f97316,#ea580c,transparent);
//           border-radius:20px 20px 0 0;
//         }
//         .ao-eyebrow {
//           font-size:11px; font-weight:700; color:#f97316;
//           letter-spacing:.14em; text-transform:uppercase; margin-bottom:6px;
//           display:flex; align-items:center; gap:6px;
//         }
//         .ao-eyebrow::before { content:''; display:inline-block; width:12px; height:1.5px; background:#f97316; }
//         .ao-title {
//           font-size: clamp(22px,3vw,34px); font-weight:800; color:#fff; line-height:1.1;
//         }
//         .ao-total-badge {
//           display:inline-flex; align-items:center;
//           background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.22);
//           color:#fb923c; font-size:12px; font-weight:700;
//           padding:4px 12px; border-radius:999px; margin-left:12px;
//           vertical-align:middle;
//         }

//         .ao-metrics {
//           display: grid; grid-template-columns: repeat(4,1fr); gap:14px;
//           margin-bottom: 18px;
//         }
//         @media (max-width:900px) { .ao-metrics { grid-template-columns: repeat(2,1fr); } }
//         @media (max-width:480px) { .ao-metrics { grid-template-columns: 1fr 1fr; } }

//         .ao-metric {
//           background: rgba(255,255,255,0.04); backdrop-filter:blur(16px);
//           border: 1px solid rgba(255,255,255,0.07); border-radius:16px;
//           padding: 16px 18px;
//           display: flex; align-items: center; gap:13px;
//           transition: border-color .25s, box-shadow .25s;
//         }
//         .ao-metric:hover { border-color:rgba(255,255,255,0.14); box-shadow:0 8px 26px rgba(0,0,0,0.22); }
//         .ao-metric-ico {
//           width:40px; height:40px; border-radius:11px; flex-shrink:0;
//           display:flex; align-items:center; justify-content:center;
//         }
//         .ao-metric-val { font-size:20px; font-weight:800; color:#f1f5f9; line-height:1; margin-bottom:3px; }
//         .ao-metric-lbl { font-size:11px; font-weight:600; color:rgba(255,255,255,0.34); text-transform:uppercase; letter-spacing:.07em; }

//         .ao-controls {
//           background: rgba(255,255,255,0.04); backdrop-filter:blur(16px);
//           border: 1px solid rgba(255,255,255,0.07); border-radius:16px;
//           padding: 16px 18px; margin-bottom:18px;
//           display:flex; flex-direction:column; gap:14px;
//         }
//         .ao-search-wrap { position:relative; display:flex; align-items:center; }
//         .ao-search-ico { position:absolute; left:14px; color:rgba(255,255,255,0.28); pointer-events:none; }
//         .ao-search {
//           width:100%; background:rgba(0,0,0,0.30);
//           border:1.5px solid rgba(255,255,255,0.09); border-radius:11px;
//           padding:11px 14px 11px 42px;
//           color:#fff; font-size:14px; font-family:'DM Sans',sans-serif; outline:none;
//           transition:border-color .22s, box-shadow .22s;
//         }
//         .ao-search::placeholder { color:rgba(255,255,255,0.22); }
//         .ao-search:focus {
//           border-color:#f97316;
//           box-shadow:0 0 0 3px rgba(249,115,22,0.14), 0 2px 12px rgba(249,115,22,0.10);
//         }

//         .ao-chips { display:flex; flex-wrap:wrap; gap:8px; }
//         .ao-chip {
//           display:inline-flex; align-items:center;
//           padding:7px 16px; border-radius:999px;
//           font-size:12.5px; font-weight:700;
//           border: 1.5px solid rgba(255,255,255,0.09);
//           background: rgba(255,255,255,0.04);
//           color: rgba(255,255,255,0.45);
//           cursor:pointer; font-family:'DM Sans',sans-serif;
//           transition:all .2s ease;
//         }
//         .ao-chip:hover:not(.active) { border-color:rgba(255,255,255,0.18); color:rgba(255,255,255,0.80); }
//         .ao-chip.active {
//           background:linear-gradient(135deg,#ea580c,#f97316);
//           border-color:transparent; color:#fff;
//           box-shadow:0 3px 12px rgba(249,115,22,0.30);
//           transform:translateY(-1px);
//         }

//         .ao-table-card {
//           background: rgba(255,255,255,0.04); backdrop-filter:blur(20px);
//           border: 1px solid rgba(255,255,255,0.08); border-radius:20px;
//           overflow:hidden;
//           box-shadow: 0 12px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
//         }
//         .ao-table-scroll { overflow-x:auto; scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.10) transparent; }
//         .ao-table-scroll::-webkit-scrollbar { height:5px; }
//         .ao-table-scroll::-webkit-scrollbar-track { background:transparent; }
//         .ao-table-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.10); border-radius:3px; }

//         .ao-table { width:100%; border-collapse:collapse; }

//         .ao-thead-row { background:rgba(0,0,0,0.30); border-bottom:1px solid rgba(255,255,255,0.07); }
//         .ao-th {
//           text-align:left; padding:13px 18px;
//           font-size:10.5px; font-weight:800;
//           color:rgba(255,255,255,0.28);
//           text-transform:uppercase; letter-spacing:.10em;
//           white-space:nowrap;
//         }

//         .ao-row {
//           border-bottom:1px solid rgba(255,255,255,0.05);
//           border-left:3px solid transparent;
//           transition:background .2s, border-left-color .2s;
//           animation:aoRowIn .45s ease both;
//         }
//         .ao-row:last-child { border-bottom:none; }
//         .ao-row:hover {
//           background:rgba(255,255,255,0.06);
//           border-left-color:#f97316;
//         }
//         @keyframes aoRowIn {
//           from { opacity:0; transform:translateY(14px); }
//           to   { opacity:1; transform:translateY(0); }
//         }
//         .ao-td { padding:14px 18px; vertical-align:middle; }

//         .ao-order-token {
//           display:inline-flex; align-items:center;
//           font-family:monospace; font-size:12px; font-weight:700;
//           color:rgba(255,255,255,0.60);
//           background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10);
//           padding:3px 10px; border-radius:7px; letter-spacing:.06em;
//           white-space:nowrap;
//         }

//         .ao-cust-name { font-size:14px; font-weight:700; color:#f1f5f9; margin-bottom:2px; }
//         .ao-cust-email { font-size:11.5px; color:rgba(255,255,255,0.35); }

//         /* Price cell — with optional coupon badge */
//         .ao-price-cell { display:flex; flex-direction:column; gap:3px; }
//         .ao-price {
//           font-size:14.5px; font-weight:800; white-space:nowrap;
//           background:linear-gradient(90deg,#fb923c,#f97316);
//           -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
//         }
//         /* Small coupon tag under price */
//         .ao-coupon-tag {
//           display:inline-flex; align-items:center; gap:4px;
//           font-size:10px; font-weight:700; font-family:monospace;
//           color:#4ade80;
//           background:rgba(74,222,128,0.08); border:1px solid rgba(74,222,128,0.18);
//           padding:1px 6px; border-radius:5px;
//           white-space:nowrap;
//         }

//         .ao-date { font-size:12.5px; color:rgba(255,255,255,0.38); white-space:nowrap; }

//         .ao-status-btn {
//           display:inline-flex; align-items:center; gap:6px;
//           font-size:11.5px; font-weight:800; padding:5px 12px; border-radius:999px;
//           cursor:pointer; border:none; font-family:'DM Sans',sans-serif;
//           transition:box-shadow .2s, filter .2s;
//           white-space:nowrap;
//         }
//         .ao-status-btn:hover { filter:brightness(1.12); }
//         .ao-pulse-dot {
//           width:7px; height:7px; border-radius:50%; flex-shrink:0;
//           animation:aoDotPulse 1.5s ease-in-out infinite;
//         }
//         @keyframes aoDotPulse {
//           0%,100% { opacity:1; transform:scale(1); }
//           50%      { opacity:0.5; transform:scale(1.4); }
//         }

//         .ao-status-drop {
//           position:absolute; top:calc(100% + 6px); left:0; z-index:50;
//           background:rgba(10,20,38,0.96); backdrop-filter:blur(20px);
//           border:1px solid rgba(255,255,255,0.12); border-radius:13px;
//           padding:6px; min-width:150px;
//           box-shadow:0 16px 40px rgba(0,0,0,0.50);
//           animation:dropIn .18s ease;
//         }
//         @keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
//         .ao-status-drop-item {
//           display:flex; align-items:center; gap:8px;
//           width:100%; padding:9px 13px; border-radius:9px;
//           font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif;
//           background:transparent; border:none; cursor:pointer; text-align:left;
//           transition:background .18s;
//         }
//         .ao-status-drop-item:hover { background:rgba(255,255,255,0.07); }

//         .ao-view-btn {
//           display:inline-flex; align-items:center; gap:6px;
//           font-size:12.5px; font-weight:700; color:#fb923c;
//           background:rgba(249,115,22,0.10); border:1px solid rgba(249,115,22,0.22);
//           padding:7px 14px; border-radius:9px; text-decoration:none;
//           transition:background .2s, box-shadow .2s, transform .2s;
//         }
//         .ao-view-btn:hover {
//           background:rgba(249,115,22,0.18);
//           box-shadow:0 4px 14px rgba(249,115,22,0.22);
//           transform:scale(1.03);
//         }
//         .ao-view-btn:active { transform:scale(0.97); }

//         .ao-phone { font-size:13px; color:rgba(255,255,255,0.45); white-space:nowrap; }

//         .ao-empty {
//           text-align:center; padding:60px 20px;
//           font-size:14px; color:rgba(255,255,255,0.28);
//         }

//         @media (max-width:640px) {
//           .ao-th, .ao-td { padding:11px 12px; }
//           .ao-header { padding:16px 14px; }
//         }
//       `}</style>

//       <div className="ao-page">
//         <div className="ao-wrap">

//           {/* ── HEADER ── */}
//           <div className="ao-header">
//             <div>
//               <p className="ao-eyebrow">Command Center</p>
//               <h1 className="ao-title">
//                 Manage Orders
//                 {orders.length > 0 && (
//                   <span className="ao-total-badge">{orders.length} total</span>
//                 )}
//               </h1>
//             </div>
//           </div>

//           {/* ── LIVE METRICS ── */}
//           <div className="ao-metrics">
//             <div className="ao-metric">
//               <div className="ao-metric-ico" style={{ background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.22)' }}>
//                 <FiActivity size={18} color="#f97316" />
//               </div>
//               <div>
//                 <p className="ao-metric-val">{activeOrders}</p>
//                 <p className="ao-metric-lbl">Active Orders</p>
//               </div>
//             </div>
//             <div className="ao-metric">
//               <div className="ao-metric-ico" style={{ background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.22)' }}>
//                 <FiTruck size={18} color="#fbbf24" />
//               </div>
//               <div>
//                 <p className="ao-metric-val">{pendingShipment}</p>
//                 <p className="ao-metric-lbl">Pending Shipment</p>
//               </div>
//             </div>
//             <div className="ao-metric">
//               <div className="ao-metric-ico" style={{ background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.22)' }}>
//                 <FiDollarSign size={18} color="#4ade80" />
//               </div>
//               <div>
//                 <p className="ao-metric-val" style={{ color:'#4ade80', fontSize:16 }}>₹{todayRevenue.toLocaleString()}</p>
//                 <p className="ao-metric-lbl">Revenue Today</p>
//               </div>
//             </div>
//             <div className="ao-metric">
//               <div className="ao-metric-ico" style={{ background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.20)' }}>
//                 <FiXCircle size={18} color="#f87171" />
//               </div>
//               <div>
//                 <p className="ao-metric-val" style={{ color: cancelRate > 20 ? '#f87171' : '#f1f5f9' }}>{cancelRate}%</p>
//                 <p className="ao-metric-lbl">Cancelled Rate</p>
//               </div>
//             </div>
//           </div>

//           {/* ── SEARCH + FILTER CHIPS ── */}
//           <div className="ao-controls">
//             <div className="ao-search-wrap">
//               <FiSearch size={16} className="ao-search-ico" />
//               <input
//                 type="text"
//                 placeholder="Search by Order ID, Customer name or email..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="ao-search"
//               />
//             </div>
//             <div className="ao-chips">
//               {FILTERS.map((f) => (
//                 <button
//                   key={f.val}
//                   className={`ao-chip ${filter === f.val ? 'active' : ''}`}
//                   onClick={() => setFilter(f.val)}
//                 >
//                   {f.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* ── GLASS TABLE ── */}
//           <div className="ao-table-card">
//             <div className="ao-table-scroll">
//               <table className="ao-table">
//                 <thead>
//                   <tr className="ao-thead-row">
//                     <th className="ao-th">Order ID</th>
//                     <th className="ao-th">Customer</th>
//                     <th className="ao-th">Phone</th>
//                     <th className="ao-th">Total</th>
//                     <th className="ao-th">Status</th>
//                     <th className="ao-th">Date</th>
//                     <th className="ao-th">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredOrders.map((order, i) => (
//                     <tr
//                       key={order._id}
//                       className="ao-row"
//                       style={{ animationDelay: `${i * 45}ms` }}
//                     >
//                       {/* Order ID token */}
//                       <td className="ao-td">
//                         <span className="ao-order-token">#{order._id.slice(-8).toUpperCase()}</span>
//                       </td>

//                       {/* Customer — two-line */}
//                       <td className="ao-td">
//                         <p className="ao-cust-name">{order.user?.fullName || 'N/A'}</p>
//                         <p className="ao-cust-email">{order.user?.email || 'N/A'}</p>
//                       </td>

//                       {/* Phone */}
//                       <td className="ao-td">
//                         <span className="ao-phone">{order.phone || 'N/A'}</span>
//                       </td>

//                       {/* Price — with coupon indicator if applied */}
//                       <td className="ao-td">
//                         <div className="ao-price-cell">
//                           <span className="ao-price">₹{order.totalPrice?.toLocaleString()}</span>
//                           {order.couponCode && order.discountAmount > 0 && (
//                             <span className="ao-coupon-tag">
//                               <FiTag size={9} />
//                               {order.couponCode} −₹{order.discountAmount}
//                             </span>
//                           )}
//                         </div>
//                       </td>

//                       {/* Status dropdown — fully functional, unchanged logic */}
//                       <td className="ao-td">
//                         <StatusDropdown order={order} onChange={handleStatusChange} />
//                       </td>

//                       {/* Date */}
//                       <td className="ao-td">
//                         <span className="ao-date">{new Date(order.createdAt).toLocaleDateString()}</span>
//                       </td>

//                       {/* View details */}
//                       <td className="ao-td">
//                         <Link to={`/orders/${order._id}`} className="ao-view-btn">
//                           <FiEye size={13} /> View
//                         </Link>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {filteredOrders.length === 0 && (
//                 <div className="ao-empty">No orders found</div>
//               )}
//             </div>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// };

// export default AdminOrders;









import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { FiEye, FiChevronDown, FiSearch, FiPackage, FiTruck, FiCheck, FiX, FiClock, FiRefreshCw } from 'react-icons/fi';

const STATUS_OPTIONS = ['Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_STYLE = {
  processing: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.28)', dot: '#fbbf24' },
  packed:     { color: '#fb923c', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.28)', dot: '#fb923c' },
  shipped:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.28)', dot: '#60a5fa' },
  delivered:  { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.28)', dot: '#4ade80' },
  cancelled:  { color: '#f87171', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.25)',  dot: '#f87171' },
};

const getStyle = (status = '') => STATUS_STYLE[status.toLowerCase()] || STATUS_STYLE.processing;

const FILTERS = ['All', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('All');
  const [search,        setSearch]        = useState('');
  const [stats,         setStats]         = useState({});
  const [openDropdown,  setOpenDropdown]  = useState(null);
  const [updatingId,    setUpdatingId]    = useState(null);
  const dropdownRef                        = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllOrders({ limit: 100 });
      const list = res.data?.orders || [];
      setOrders(list);

      const s = { total: list.length, active: 0, pendingShipment: 0, revenueToday: 0, cancelledRate: 0 };
      let cancelled = 0;
      const today = new Date().toDateString();
      list.forEach(o => {
        const st = (o.orderStatus || '').toLowerCase();
        if (!['delivered','cancelled'].includes(st)) s.active++;
        if (st === 'packed') s.pendingShipment++;
        if (st === 'cancelled') cancelled++;
        if (new Date(o.createdAt).toDateString() === today) s.revenueToday += o.totalPrice || 0;
      });
      s.cancelledRate = list.length ? Math.round((cancelled / list.length) * 100) : 0;
      setStats(s);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setOpenDropdown(null);
    try {
      await adminAPI.updateOrderStatus(orderId, { orderStatus: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'All' || o.orderStatus?.toLowerCase() === filter.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o._id?.toLowerCase().includes(q) ||
      o.user?.fullName?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .ao-page {
          min-height: 100vh;
          background: radial-gradient(circle at 15% 10%, rgba(249,115,22,0.07) 0%, transparent 55%),
                      radial-gradient(circle at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 55%),
                      linear-gradient(160deg, #0f172a 0%, #000 50%, #020617 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 28px 24px 80px;
        }
        @media(max-width:640px){ .ao-page { padding: 14px 12px 60px; } }
        .ao-wrap { max-width: 1380px; margin: 0 auto; }

        .ao-header {
          background: rgba(255,255,255,0.04); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
          padding: 22px 28px; margin-bottom: 20px; position: relative;
        }
        .ao-header::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg,#f97316,#ea580c,transparent);
          border-radius: 20px 20px 0 0;
        }
        .ao-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; color: #ea580c;
          letter-spacing: .15em; text-transform: uppercase; margin-bottom: 6px;
        }
        .ao-eyebrow::before { content:''; width:14px; height:1.5px; background:#ea580c; display:inline-block; }
        .ao-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px,3vw,36px); font-weight: 800; color:#fff; line-height:1.1;
        }

        .ao-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; margin-bottom:20px; }
        .ao-stat {
          background: rgba(255,255,255,0.04); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08); border-radius:16px; padding:18px 16px;
          transition: transform .25s, box-shadow .25s;
        }
        .ao-stat:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(0,0,0,0.32); }
        .ao-stat-ico {
          width:38px; height:38px; border-radius:11px;
          display:flex; align-items:center; justify-content:center; margin-bottom:12px;
        }
        .ao-stat-val {
          font-size: 26px; font-weight: 800; font-family: monospace;
          background: linear-gradient(90deg,#fb923c,#f97316);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          line-height:1; margin-bottom:4px;
        }
        .ao-stat-lbl { font-size:10.5px; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:.08em; }

        .ao-toolbar {
          background: rgba(255,255,255,0.03); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.07); border-radius:16px;
          padding:16px 20px; margin-bottom:16px;
          display:flex; align-items:center; gap:14px; flex-wrap:wrap;
        }
        .ao-search-wrap { flex:1; min-width:220px; position:relative; }
        .ao-search-ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.28); }
        .ao-search {
          width:100%; background:rgba(0,0,0,0.28); border:1.5px solid rgba(255,255,255,0.09);
          border-radius:11px; padding:11px 14px 11px 38px; color:#f1f5f9;
          font-size:13.5px; font-family:'DM Sans',sans-serif; outline:none;
          transition: border-color .2s, box-shadow .2s;
        }
        .ao-search::placeholder { color:rgba(255,255,255,0.22); }
        .ao-search:focus { border-color:#ea580c; box-shadow:0 0 0 3px rgba(234,88,12,0.13); }
        .ao-refresh {
          display:flex; align-items:center; gap:7px; padding:10px 18px;
          background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10);
          border-radius:11px; color:rgba(255,255,255,0.60); font-size:13px; font-weight:600;
          font-family:'DM Sans',sans-serif; cursor:pointer; transition:background .2s,color .2s;
          white-space:nowrap;
        }
        .ao-refresh:hover { background:rgba(255,255,255,0.10); color:#fff; }

        .ao-filters { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
        .ao-filter {
          padding:8px 18px; border-radius:999px; font-size:13px; font-weight:600;
          border:1.5px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.04);
          color:rgba(255,255,255,0.45); cursor:pointer; transition:all .2s; white-space:nowrap;
        }
        .ao-filter:hover:not(.active) { border-color:rgba(255,255,255,0.18); color:rgba(255,255,255,0.80); }
        .ao-filter.active { background:linear-gradient(135deg,#ea580c,#f97316); border-color:transparent; color:#fff; box-shadow:0 4px 14px rgba(234,88,12,0.30); }

        .ao-table-wrap {
          background: rgba(255,255,255,0.03); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.07); border-radius:18px;
          overflow: visible; /* ── CHANGED: was hidden, now visible so dropdowns overflow correctly ── */
        }
        .ao-table { width:100%; border-collapse:collapse; }
        .ao-th {
          font-size:10.5px; font-weight:800; color:rgba(255,255,255,0.35);
          text-transform:uppercase; letter-spacing:.10em;
          padding:14px 16px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.07);
          background:rgba(255,255,255,0.02); white-space:nowrap;
        }
        .ao-th:first-child { border-radius:18px 0 0 0; }
        .ao-th:last-child  { border-radius:0 18px 0 0; }

        .ao-tr {
          border-bottom:1px solid rgba(255,255,255,0.05);
          transition:background .18s;
          position: relative; /* ── ADDED: so z-index works on rows ── */
        }
        .ao-tr:last-child { border-bottom:none; }
        .ao-tr:hover { background:rgba(255,255,255,0.03); }
        .ao-tr.has-open-dropdown { z-index: 100; } /* ── ADDED ── */

        .ao-td { padding:14px 16px; font-size:13.5px; color:rgba(255,255,255,0.70); vertical-align:middle; }

        .ao-order-id {
          font-family:monospace; font-size:12px; font-weight:700;
          color:rgba(255,255,255,0.50); background:rgba(255,255,255,0.07);
          border:1px solid rgba(255,255,255,0.10); padding:3px 10px; border-radius:7px;
          white-space:nowrap;
        }
        .ao-cust-name  { font-size:14px; font-weight:700; color:#f1f5f9; margin-bottom:2px; }
        .ao-cust-email { font-size:11.5px; color:rgba(255,255,255,0.35); }
        .ao-phone      { font-size:13px; color:rgba(255,255,255,0.55); white-space:nowrap; }
        .ao-price {
          font-family:monospace; font-size:15px; font-weight:800;
          background:linear-gradient(90deg,#fb923c,#f97316);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          white-space:nowrap;
        }
        .ao-date { font-size:12.5px; color:rgba(255,255,255,0.38); white-space:nowrap; }

        /* ── STATUS DROPDOWN — KEY FIX ── */
        .ao-status-wrap {
          position: relative;
          display: inline-block;
        }
        .ao-status-btn {
          display:inline-flex; align-items:center; gap:6px;
          font-size:12px; font-weight:700; padding:5px 11px;
          border-radius:999px; border:1px solid transparent;
          cursor:pointer; transition:filter .18s, transform .18s;
          background:none; font-family:'DM Sans',sans-serif;
          white-space:nowrap;
        }
        .ao-status-btn:hover:not(:disabled) { filter:brightness(1.15); transform:scale(1.03); }
        .ao-status-btn:disabled { opacity:.55; cursor:not-allowed; }
        .ao-status-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }

        /* ── CHANGED: fixed positioning so dropdown never clips behind table ── */
        .ao-status-dropdown {
          position: fixed; /* was absolute — fixed escapes table overflow */
          min-width: 160px;
          background: rgba(15,23,42,0.99);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 13px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04);
          z-index: 99999;
          overflow: hidden;
          animation: aoDropIn .16s ease;
        }
        @keyframes aoDropIn { from{opacity:0;transform:scale(0.96) translateY(-4px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .ao-status-dropdown::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,#f97316,#ea580c,transparent);
          border-radius:13px 13px 0 0;
        }
        .ao-dd-item {
          display:flex; align-items:center; gap:9px;
          padding:11px 14px; font-size:13px; font-weight:600;
          color:rgba(255,255,255,0.65); cursor:pointer;
          transition:background .15s, color .15s, padding-left .15s;
          border:none; background:none; width:100%; text-align:left;
          font-family:'DM Sans',sans-serif;
        }
        .ao-dd-item:hover { background:rgba(255,255,255,0.06); color:#fff; padding-left:18px; }
        .ao-dd-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

        .ao-view-btn {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(234,88,12,0.10); border:1px solid rgba(234,88,12,0.22);
          color:#fb923c; font-size:12.5px; font-weight:700; padding:7px 14px;
          border-radius:9px; cursor:pointer; font-family:'DM Sans',sans-serif;
          transition:background .18s, box-shadow .18s;
          text-decoration:none;
        }
        .ao-view-btn:hover { background:rgba(234,88,12,0.18); box-shadow:0 4px 14px rgba(234,88,12,0.22); }

        .ao-empty { text-align:center; padding:60px 20px; }
        .ao-empty-ico {
          width:70px; height:70px; border-radius:50%;
          background:rgba(249,115,22,0.08); border:1px solid rgba(249,115,22,0.18);
          display:flex; align-items:center; justify-content:center; margin:0 auto 16px;
        }
        .ao-empty-title { font-size:17px; font-weight:700; color:#f1f5f9; margin-bottom:6px; }
        .ao-empty-sub   { font-size:13.5px; color:rgba(255,255,255,0.35); }

        .ao-loading { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px; font-size:14px; color:rgba(255,255,255,0.38); }
        .ao-spin { width:22px; height:22px; border-radius:50%; border:2.5px solid rgba(249,115,22,0.20); border-top-color:#f97316; animation:aoSpin .75s linear infinite; }
        @keyframes aoSpin { to{transform:rotate(360deg)} }

        @media(max-width:900px) {
          .ao-th.hide-md, .ao-td.hide-md { display:none; }
        }
        @media(max-width:640px) {
          .ao-th.hide-sm, .ao-td.hide-sm { display:none; }
          .ao-td { padding:10px 10px; }
        }
      `}</style>

      <div className="ao-page">
        <div className="ao-wrap">

          {/* HEADER */}
          <div className="ao-header" style={{ marginBottom:20 }}>
            <p className="ao-eyebrow">Admin Panel</p>
            <h1 className="ao-title">Manage Orders</h1>
          </div>

          {/* STATS */}
          <div className="ao-stats">
            {[
              { icon:<FiPackage size={18} color="#fb923c"/>, ico_bg:'rgba(249,115,22,0.12)', ico_border:'rgba(249,115,22,0.22)', val:stats.total||0,            lbl:'Total Orders'      },
              { icon:<FiClock   size={18} color="#60a5fa"/>, ico_bg:'rgba(96,165,250,0.12)', ico_border:'rgba(96,165,250,0.22)',  val:stats.active||0,           lbl:'Active Orders'     },
              { icon:<FiTruck   size={18} color="#a78bfa"/>, ico_bg:'rgba(167,139,250,0.12)',ico_border:'rgba(167,139,250,0.22)',val:stats.pendingShipment||0,   lbl:'Pending Shipment'  },
              { icon:<FiCheck   size={18} color="#4ade80"/>, ico_bg:'rgba(74,222,128,0.12)', ico_border:'rgba(74,222,128,0.22)', val:formatPrice(stats.revenueToday||0), lbl:'Revenue Today' },
              { icon:<FiX      size={18} color="#f87171"/>, ico_bg:'rgba(239,68,68,0.10)',  ico_border:'rgba(239,68,68,0.22)',  val:`${stats.cancelledRate||0}%`, lbl:'Cancelled Rate'   },
            ].map((s,i) => (
              <div key={i} className="ao-stat">
                <div className="ao-stat-ico" style={{ background:s.ico_bg, border:`1px solid ${s.ico_border}` }}>{s.icon}</div>
                <p className="ao-stat-val">{s.val}</p>
                <p className="ao-stat-lbl">{s.lbl}</p>
              </div>
            ))}
          </div>

          {/* TOOLBAR */}
          <div className="ao-toolbar">
            <div className="ao-search-wrap">
              <FiSearch className="ao-search-ico" size={15} />
              <input className="ao-search" placeholder="Search by Order ID, Customer name or email..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="ao-refresh" onClick={fetchOrders}>
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* FILTERS */}
          <div className="ao-filters">
            {FILTERS.map(f => (
              <button key={f} className={`ao-filter${filter===f?' active':''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>

          {/* TABLE */}
          <div className="ao-table-wrap">
            {loading ? (
              <div className="ao-loading"><div className="ao-spin"/> Loading orders...</div>
            ) : filtered.length === 0 ? (
              <div className="ao-empty">
                <div className="ao-empty-ico"><FiPackage size={28} color="#fb923c"/></div>
                <p className="ao-empty-title">No orders found</p>
                <p className="ao-empty-sub">{search || filter !== 'All' ? 'Try adjusting your filters' : 'No orders yet'}</p>
              </div>
            ) : (
              <table className="ao-table">
                <thead>
                  <tr>
                    <th className="ao-th">Order ID</th>
                    <th className="ao-th">Customer</th>
                    <th className="ao-th hide-sm">Phone</th>
                    <th className="ao-th">Total</th>
                    <th className="ao-th">Status</th>
                    <th className="ao-th hide-md">Date</th>
                    <th className="ao-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const sc   = getStyle(order.orderStatus);
                    const isOpen = openDropdown === order._id;
                    return (
                      <tr
                        key={order._id}
                        className={`ao-tr${isOpen ? ' has-open-dropdown' : ''}`}
                      >
                        <td className="ao-td">
                          <span className="ao-order-id">#{order._id.slice(-8).toUpperCase()}</span>
                        </td>
                        <td className="ao-td">
                          <p className="ao-cust-name">{order.user?.fullName || 'Guest'}</p>
                          <p className="ao-cust-email">{order.user?.email || ''}</p>
                        </td>
                        <td className="ao-td hide-sm">
                          <span className="ao-phone">{order.shippingAddress?.phone || order.user?.phone || '—'}</span>
                        </td>
                        <td className="ao-td">
                          <span className="ao-price">{formatPrice(order.totalPrice)}</span>
                        </td>
                        <td className="ao-td">
                          {/* ── STATUS DROPDOWN with fixed positioning ── */}
                          <StatusDropdown
                            order={order}
                            isOpen={isOpen}
                            updatingId={updatingId}
                            onToggle={(id) => setOpenDropdown(prev => prev === id ? null : id)}
                            onSelect={handleStatusUpdate}
                            sc={sc}
                          />
                        </td>
                        <td className="ao-td hide-md">
                          <span className="ao-date">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                          </span>
                        </td>
                        <td className="ao-td">
                          <a href={`/admin/orders/${order._id}`} className="ao-view-btn">
                            <FiEye size={13}/> View
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

// ── Separate component so we can use useRef + getBoundingClientRect for fixed positioning ──
const StatusDropdown = ({ order, isOpen, updatingId, onToggle, onSelect, sc }) => {
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const handleToggle = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top:  rect.bottom + window.scrollY + 4,
        left: rect.left  + window.scrollX,
      });
    }
    onToggle(order._id);
  };

  return (
    <div className="ao-status-wrap" ref={btnRef}>
      <button
        className="ao-status-btn"
        style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}
        onClick={handleToggle}
        disabled={updatingId === order._id}
      >
        {updatingId === order._id ? (
          <><div style={{ width:7, height:7, borderRadius:'50%', border:`2px solid ${sc.color}`, borderTopColor:'transparent', animation:'aoSpin .7s linear infinite' }}/> Updating...</>
        ) : (
          <><div className="ao-status-dot" style={{ background: sc.dot }}/>{order.orderStatus}<FiChevronDown size={11}/></>
        )}
      </button>

      {isOpen && (
        <div
          className="ao-status-dropdown"
          style={{ top: pos.top, left: pos.left }}
        >
          {STATUS_OPTIONS.map(opt => {
            const s = getStyle(opt);
            return (
              <button
                key={opt}
                className="ao-dd-item"
                onClick={() => onSelect(order._id, opt)}
              >
                <div className="ao-dd-dot" style={{ background: s.dot }}/>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;