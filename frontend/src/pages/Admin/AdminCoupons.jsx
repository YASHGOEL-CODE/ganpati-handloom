import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
  FiSearch, FiTag, FiPercent, FiDollarSign, FiCalendar,
  FiUsers, FiActivity, FiX, FiCheck, FiAlertTriangle,
} from 'react-icons/fi';

// ── Coupon API — uses adminAPI (same axios instance as all admin pages) ──
const couponAPI = {
  getAll:  ()         => adminAPI.getAllCoupons(),
  create:  (data)     => adminAPI.createCoupon(data),
  update:  (id, data) => adminAPI.updateCoupon(id, data),
  remove:  (id)       => adminAPI.deleteCoupon(id),
  toggle:  (id)       => adminAPI.toggleCoupon(id),
};

const EMPTY_FORM = {
  code: '', discountType: 'percentage', discountValue: '',
  minOrderValue: '', maxDiscount: '', usageLimit: '',
  expiryDate: '', isActive: true, forNewUsers: false, description: '',
};

/* ── Status badge ── */
const StatusBadge = ({ isActive, expiryDate }) => {
  const expired = new Date() > new Date(expiryDate);
  if (expired)   return <span className="ac-badge ac-badge-expired">Expired</span>;
  if (isActive)  return <span className="ac-badge ac-badge-active">Active</span>;
  return          <span className="ac-badge ac-badge-inactive">Inactive</span>;
};

/* ── Format date ── */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

/* ── Modal field ── */
const Field = ({ label, children, required }) => (
  <div className="acm-field">
    <label className="acm-label">{label}{required && <span style={{color:'#f87171'}}> *</span>}</label>
    {children}
  </div>
);

const AdminCoupons = () => {
  const [coupons, setCoupons]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('all'); // all | active | inactive | expired
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null); // { msg, type }
  const [deleting, setDeleting]     = useState(null);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponAPI.getAll();
      setCoupons(res.data.coupons || []);
    } catch (e) {
      showToast('Failed to fetch coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setForm({
      code:          coupon.code,
      discountType:  coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || '',
      maxDiscount:   coupon.maxDiscount || '',
      usageLimit:    coupon.usageLimit || '',
      expiryDate:    coupon.expiryDate ? coupon.expiryDate.substring(0, 10) : '',
      isActive:      coupon.isActive,
      forNewUsers:   coupon.forNewUsers || false,
      description:   coupon.description || '',
    });
    setEditingId(coupon._id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue || !form.expiryDate) {
      showToast('Please fill all required fields', 'error'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        code:          form.code.toUpperCase().trim(),
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscount:   form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit:    form.usageLimit ? Number(form.usageLimit) : null,
      };
      if (editingId) {
        await couponAPI.update(editingId, payload);
        showToast('Coupon updated successfully');
      } else {
        await couponAPI.create(payload);
        showToast('Coupon created successfully');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await couponAPI.toggle(coupon._id);
      showToast(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}`);
      fetchCoupons();
    } catch {
      showToast('Failed to toggle coupon', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await couponAPI.remove(id);
      showToast('Coupon deleted');
      fetchCoupons();
    } catch {
      showToast('Failed to delete', 'error');
    } finally {
      setDeleting(null);
    }
  };

  // ── Derived stats ──
  const now = new Date();
  const totalCoupons  = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive && new Date(c.expiryDate) > now).length;
  const totalUsage    = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);
  const expiredCount  = coupons.filter(c => new Date(c.expiryDate) <= now).length;

  // ── Filtered list ──
  const filtered = coupons.filter(c => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const expired     = new Date(c.expiryDate) <= now;
    if (filterStatus === 'active')   return matchSearch && c.isActive && !expired;
    if (filterStatus === 'inactive') return matchSearch && !c.isActive && !expired;
    if (filterStatus === 'expired')  return matchSearch && expired;
    return matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        /* ── PAGE ── */
        .ac-page {
          min-height:100vh; font-family:'DM Sans',sans-serif;
          background:radial-gradient(circle at 15% 10%,rgba(249,115,22,0.07) 0%,transparent 55%),
            radial-gradient(circle at 85% 90%,rgba(139,92,246,0.05) 0%,transparent 55%),
            linear-gradient(160deg,#0f172a 0%,#000 50%,#020617 100%);
          padding:32px 28px 80px;
        }
        @media(max-width:640px){.ac-page{padding:18px 14px 60px;}}
        .ac-wrap{max-width:1320px;margin:0 auto;}

        /* ── HEADER ── */
        .ac-header{
          display:flex;align-items:flex-end;justify-content:space-between;
          flex-wrap:wrap;gap:14px;
          background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.08);border-radius:20px;
          padding:22px 26px;margin-bottom:18px;position:relative;
        }
        .ac-header::before{
          content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,#f97316,#ea580c,transparent);
          border-radius:20px 20px 0 0;
        }
        .ac-eyebrow{font-size:11px;font-weight:700;color:#f97316;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:6px;}
        .ac-eyebrow::before{content:'';display:inline-block;width:12px;height:1.5px;background:#f97316;}
        .ac-title{font-family:'Playfair Display',serif;font-size:clamp(22px,3vw,34px);font-weight:800;color:#fff;line-height:1.1;}
        .ac-add-btn{
          display:inline-flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;border:none;
          border-radius:12px;padding:11px 22px;font-size:14px;font-weight:700;
          font-family:'DM Sans',sans-serif;cursor:pointer;
          transition:transform .22s,box-shadow .22s;
          box-shadow:0 4px 16px rgba(249,115,22,0.30);white-space:nowrap;
        }
        .ac-add-btn:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 8px 22px rgba(249,115,22,0.46);}

        /* ── STATS ── */
        .ac-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px;}
        @media(max-width:900px){.ac-stats{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:480px){.ac-stats{grid-template-columns:1fr 1fr;}}
        .ac-stat{
          background:rgba(255,255,255,0.04);backdrop-filter:blur(16px);
          border:1px solid rgba(255,255,255,0.07);border-radius:16px;
          padding:16px 18px;display:flex;align-items:center;gap:13px;
          transition:border-color .25s,box-shadow .25s;
        }
        .ac-stat:hover{border-color:rgba(255,255,255,0.14);box-shadow:0 8px 26px rgba(0,0,0,0.22);}
        .ac-stat-ico{width:40px;height:40px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
        .ac-stat-val{font-size:22px;font-weight:800;color:#f1f5f9;line-height:1;margin-bottom:3px;}
        .ac-stat-lbl{font-size:11px;font-weight:600;color:rgba(255,255,255,0.34);text-transform:uppercase;letter-spacing:.07em;}

        /* ── CONTROLS ── */
        .ac-controls{
          background:rgba(255,255,255,0.04);backdrop-filter:blur(16px);
          border:1px solid rgba(255,255,255,0.07);border-radius:16px;
          padding:14px 18px;margin-bottom:18px;
          display:flex;gap:12px;flex-wrap:wrap;align-items:center;
        }
        .ac-search-wrap{position:relative;display:flex;align-items:center;flex:1;min-width:200px;}
        .ac-search-ico{position:absolute;left:13px;color:rgba(255,255,255,0.28);pointer-events:none;}
        .ac-search{
          width:100%;background:rgba(0,0,0,0.30);border:1.5px solid rgba(255,255,255,0.09);
          border-radius:11px;padding:10px 14px 10px 40px;color:#fff;
          font-size:14px;font-family:'DM Sans',sans-serif;outline:none;
          transition:border-color .22s,box-shadow .22s;
        }
        .ac-search::placeholder{color:rgba(255,255,255,0.22);}
        .ac-search:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,0.14);}
        .ac-chips{display:flex;gap:8px;flex-wrap:wrap;}
        .ac-chip{
          display:inline-flex;align-items:center;padding:7px 16px;border-radius:999px;
          font-size:12.5px;font-weight:700;border:1.5px solid rgba(255,255,255,0.09);
          background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.45);
          cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s ease;
        }
        .ac-chip:hover:not(.active-chip){border-color:rgba(255,255,255,0.18);color:rgba(255,255,255,0.80);}
        .ac-chip.active-chip{background:linear-gradient(135deg,#ea580c,#f97316);border-color:transparent;color:#fff;box-shadow:0 3px 12px rgba(249,115,22,0.30);}

        /* ── GLASS TABLE ── */
        .ac-table-card{
          background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.08);border-radius:20px;
          overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.28);
        }
        .ac-table-scroll{overflow-x:auto;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.10) transparent;}
        .ac-table{width:100%;border-collapse:collapse;}
        .ac-thead-row{background:rgba(0,0,0,0.30);border-bottom:1px solid rgba(255,255,255,0.07);}
        .ac-th{text-align:left;padding:13px 16px;font-size:10.5px;font-weight:800;color:rgba(255,255,255,0.28);text-transform:uppercase;letter-spacing:.10em;white-space:nowrap;}
        .ac-row{border-bottom:1px solid rgba(255,255,255,0.05);border-left:3px solid transparent;transition:background .2s,border-left-color .2s;animation:acRowIn .4s ease both;}
        .ac-row:last-child{border-bottom:none;}
        .ac-row:hover{background:rgba(255,255,255,0.05);border-left-color:#f97316;}
        @keyframes acRowIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .ac-td{padding:13px 16px;vertical-align:middle;}
        .ac-code{font-family:monospace;font-size:13px;font-weight:800;color:#fb923c;background:rgba(249,115,22,0.10);border:1px solid rgba(249,115,22,0.20);padding:3px 10px;border-radius:7px;white-space:nowrap;}
        .ac-val{font-size:13.5px;font-weight:600;color:#f1f5f9;white-space:nowrap;}
        .ac-muted{font-size:12.5px;color:rgba(255,255,255,0.42);}
        .ac-usage-bar{width:80px;height:5px;border-radius:999px;background:rgba(255,255,255,0.08);overflow:hidden;margin-top:4px;}
        .ac-usage-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#f97316,#ea580c);transition:width .4s;}

        /* Status badges */
        .ac-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:999px;white-space:nowrap;}
        .ac-badge-active  {background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.25);color:#4ade80;}
        .ac-badge-inactive{background:rgba(239,68,68,0.10);border:1px solid rgba(239,68,68,0.22);color:#f87171;}
        .ac-badge-expired {background:rgba(107,114,128,0.15);border:1px solid rgba(107,114,128,0.25);color:#9ca3af;}

        /* Action buttons */
        .ac-acts{display:flex;gap:7px;}
        .ac-act{width:32px;height:32px;border-radius:9px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s,border-color .2s,color .2s;color:rgba(255,255,255,0.40);}
        .ac-act.edit:hover{background:rgba(59,130,246,0.14);border-color:rgba(59,130,246,0.28);color:#60a5fa;}
        .ac-act.del:hover{background:rgba(239,68,68,0.14);border-color:rgba(239,68,68,0.28);color:#f87171;}
        .ac-act.tog:hover{background:rgba(74,222,128,0.12);border-color:rgba(74,222,128,0.25);color:#4ade80;}
        .ac-act:disabled{opacity:0.4;cursor:not-allowed;}

        /* Empty */
        .ac-empty{text-align:center;padding:56px 20px;font-size:14px;color:rgba(255,255,255,0.28);}

        /* ── MODAL ── */
        .acm-overlay{
          position:fixed;inset:0;z-index:100;
          background:rgba(0,0,0,0.70);backdrop-filter:blur(6px);
          display:flex;align-items:center;justify-content:center;padding:20px;
          animation:acmFade .2s ease;
        }
        @keyframes acmFade{from{opacity:0}to{opacity:1}}
        .acm-box{
          background:rgba(10,20,38,0.97);backdrop-filter:blur(24px);
          border:1px solid rgba(249,115,22,0.22);border-radius:22px;
          padding:30px 28px;width:100%;max-width:540px;position:relative;
          box-shadow:0 32px 80px rgba(0,0,0,0.55);
          animation:acmSlide .28s ease;
          max-height:90vh;overflow-y:auto;scrollbar-width:thin;
        }
        @keyframes acmSlide{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .acm-box::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#f97316,#ea580c,transparent);border-radius:22px 22px 0 0;}
        .acm-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;}
        .acm-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#f1f5f9;}
        .acm-close{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.50);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s,color .2s;}
        .acm-close:hover{background:rgba(239,68,68,0.15);color:#f87171;}
        .acm-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        @media(max-width:480px){.acm-grid{grid-template-columns:1fr;}}
        .acm-full{grid-column:1/-1;}
        .acm-field{display:flex;flex-direction:column;gap:6px;}
        .acm-label{font-size:11.5px;font-weight:700;color:rgba(255,255,255,0.38);text-transform:uppercase;letter-spacing:.09em;}
        .acm-input,.acm-select{
          background:rgba(0,0,0,0.30);border:1.5px solid rgba(255,255,255,0.09);
          border-radius:11px;padding:11px 14px;color:#fff;
          font-size:14px;font-family:'DM Sans',sans-serif;outline:none;width:100%;
          transition:border-color .22s,box-shadow .22s;
        }
        .acm-input::placeholder{color:rgba(255,255,255,0.22);}
        .acm-input:focus,.acm-select:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,0.14);}
        .acm-select option{background:#1e293b;color:#fff;}
        .acm-check-row{display:flex;align-items:center;gap:8px;font-size:13.5px;color:rgba(255,255,255,0.55);cursor:pointer;}
        .acm-check-row input{accent-color:#f97316;width:16px;height:16px;cursor:pointer;}
        .acm-btn-row{display:flex;gap:10px;margin-top:22px;}
        .acm-save{
          flex:1;display:flex;align-items:center;justify-content:center;gap:8px;
          background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;border:none;
          border-radius:12px;padding:13px;font-size:14px;font-weight:700;
          font-family:'DM Sans',sans-serif;cursor:pointer;
          transition:transform .2s,box-shadow .2s;box-shadow:0 4px 14px rgba(234,88,12,0.28);
        }
        .acm-save:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 22px rgba(234,88,12,0.42);}
        .acm-save:disabled{opacity:0.5;cursor:not-allowed;}
        .acm-cancel{
          flex:1;display:flex;align-items:center;justify-content:center;gap:8px;
          background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.10);
          color:rgba(255,255,255,0.60);border-radius:12px;padding:13px;
          font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;
          transition:background .2s,color .2s;
        }
        .acm-cancel:hover{background:rgba(255,255,255,0.10);color:#fff;}

        /* ── TOAST ── */
        .ac-toast{
          position:fixed;bottom:28px;right:28px;z-index:200;
          padding:13px 20px;border-radius:12px;font-size:14px;font-weight:600;
          font-family:'DM Sans',sans-serif;display:flex;align-items:center;gap:9px;
          animation:toastIn .3s ease both;
          box-shadow:0 8px 28px rgba(0,0,0,0.40);
        }
        @keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .ac-toast.success{background:rgba(74,222,128,0.14);border:1px solid rgba(74,222,128,0.28);color:#4ade80;}
        .ac-toast.error  {background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.28);color:#f87171;}

        /* Loader */
        .ac-loader{display:flex;align-items:center;justify-content:center;padding:60px;gap:12px;font-size:14px;color:rgba(255,255,255,0.38);}
        .ac-spin{width:22px;height:22px;border-radius:50%;border:2.5px solid rgba(249,115,22,0.20);border-top-color:#f97316;animation:acSpin .75s linear infinite;}
        @keyframes acSpin{to{transform:rotate(360deg)}}
      `}</style>

      <div className="ac-page">
        <div className="ac-wrap">

          {/* ── HEADER ── */}
          <div className="ac-header">
            <div>
              <p className="ac-eyebrow">Admin Panel</p>
              <h1 className="ac-title">Coupon Management</h1>
            </div>
            <button className="ac-add-btn" onClick={openCreate}>
              <FiPlus size={15} /> Create Coupon
            </button>
          </div>

          {/* ── STATS ── */}
          <div className="ac-stats">
            <div className="ac-stat">
              <div className="ac-stat-ico" style={{background:'rgba(249,115,22,0.12)',border:'1px solid rgba(249,115,22,0.22)'}}>
                <FiTag size={18} color="#f97316" />
              </div>
              <div><p className="ac-stat-val">{totalCoupons}</p><p className="ac-stat-lbl">Total Coupons</p></div>
            </div>
            <div className="ac-stat">
              <div className="ac-stat-ico" style={{background:'rgba(74,222,128,0.12)',border:'1px solid rgba(74,222,128,0.22)'}}>
                <FiActivity size={18} color="#4ade80" />
              </div>
              <div><p className="ac-stat-val" style={{color:'#4ade80'}}>{activeCoupons}</p><p className="ac-stat-lbl">Active</p></div>
            </div>
            <div className="ac-stat">
              <div className="ac-stat-ico" style={{background:'rgba(96,165,250,0.12)',border:'1px solid rgba(96,165,250,0.22)'}}>
                <FiUsers size={18} color="#60a5fa" />
              </div>
              <div><p className="ac-stat-val" style={{color:'#60a5fa'}}>{totalUsage}</p><p className="ac-stat-lbl">Total Usage</p></div>
            </div>
            <div className="ac-stat">
              <div className="ac-stat-ico" style={{background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.20)'}}>
                <FiCalendar size={18} color="#f87171" />
              </div>
              <div><p className="ac-stat-val" style={{color:'#f87171'}}>{expiredCount}</p><p className="ac-stat-lbl">Expired</p></div>
            </div>
          </div>

          {/* ── SEARCH + FILTER ── */}
          <div className="ac-controls">
            <div className="ac-search-wrap">
              <FiSearch size={15} className="ac-search-ico" />
              <input
                className="ac-search"
                placeholder="Search by coupon code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="ac-chips">
              {[['all','All'],['active','Active'],['inactive','Inactive'],['expired','Expired']].map(([v,l]) => (
                <button key={v} className={`ac-chip ${filterStatus===v?'active-chip':''}`} onClick={() => setFilter(v)}>{l}</button>
              ))}
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="ac-table-card">
            {loading ? (
              <div className="ac-loader"><div className="ac-spin" /> Loading coupons...</div>
            ) : (
              <div className="ac-table-scroll">
                <table className="ac-table">
                  <thead>
                    <tr className="ac-thead-row">
                      <th className="ac-th">Code</th>
                      <th className="ac-th">Type</th>
                      <th className="ac-th">Value</th>
                      <th className="ac-th">Min Order</th>
                      <th className="ac-th">Usage</th>
                      <th className="ac-th">Expiry</th>
                      <th className="ac-th">Status</th>
                      <th className="ac-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? filtered.map((c, i) => {
                      const usagePct = c.usageLimit ? (c.usedCount / c.usageLimit) * 100 : 0;
                      return (
                        <tr key={c._id} className="ac-row" style={{animationDelay:`${i*35}ms`}}>
                          <td className="ac-td"><span className="ac-code">{c.code}</span></td>
                          <td className="ac-td">
                            <span className="ac-val">
                              {c.discountType === 'percentage' ? <FiPercent size={12} style={{display:'inline',marginRight:3}}/> : <FiDollarSign size={12} style={{display:'inline',marginRight:3}}/>}
                              {c.discountType === 'percentage' ? 'Percent' : 'Flat'}
                            </span>
                          </td>
                          <td className="ac-td">
                            <span className="ac-val" style={{color:'#f97316'}}>
                              {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                            </span>
                            {c.maxDiscount && <p className="ac-muted">max ₹{c.maxDiscount}</p>}
                          </td>
                          <td className="ac-td"><span className="ac-val">₹{c.minOrderValue || 0}</span></td>
                          <td className="ac-td">
                            <span className="ac-val">{c.usedCount || 0} uses</span>
                            <p className="ac-muted">{c.usageLimit ? `${c.usageLimit}× per user` : 'Unlimited per user'}</p>
                          </td>
                          <td className="ac-td"><span className="ac-val">{fmtDate(c.expiryDate)}</span></td>
                          <td className="ac-td"><StatusBadge isActive={c.isActive} expiryDate={c.expiryDate} /></td>
                          <td className="ac-td">
                            <div className="ac-acts">
                              <button className="ac-act edit" onClick={() => openEdit(c)} title="Edit"><FiEdit2 size={13}/></button>
                              <button className="ac-act tog" onClick={() => handleToggle(c)} title={c.isActive ? 'Deactivate' : 'Activate'}>
                                {c.isActive ? <FiToggleRight size={14}/> : <FiToggleLeft size={14}/>}
                              </button>
                              <button className="ac-act del" onClick={() => handleDelete(c._id)} disabled={deleting === c._id} title="Delete"><FiTrash2 size={13}/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={8}><div className="ac-empty">No coupons found</div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {showModal && (
        <div className="acm-overlay" onClick={e => { if(e.target===e.currentTarget) setShowModal(false); }}>
          <div className="acm-box">
            <div className="acm-hdr">
              <h2 className="acm-title">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button className="acm-close" onClick={() => setShowModal(false)}><FiX size={14}/></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="acm-grid">

                <Field label="Coupon Code" required>
                  <input className="acm-input" placeholder="e.g. SUMMER10"
                    value={form.code} onChange={e => setForm(f=>({...f,code:e.target.value.toUpperCase()}))}
                    disabled={!!editingId}
                  />
                </Field>

                <Field label="Discount Type" required>
                  <select className="acm-select" value={form.discountType}
                    onChange={e => setForm(f=>({...f,discountType:e.target.value}))}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </Field>

                <Field label={form.discountType==='percentage' ? 'Discount (%)' : 'Discount (₹)'} required>
                  <input className="acm-input" type="number" min="1" placeholder="e.g. 10"
                    value={form.discountValue} onChange={e => setForm(f=>({...f,discountValue:e.target.value}))} />
                </Field>

                <Field label="Min Order Value (₹)">
                  <input className="acm-input" type="number" min="0" placeholder="e.g. 500"
                    value={form.minOrderValue} onChange={e => setForm(f=>({...f,minOrderValue:e.target.value}))} />
                </Field>

                {form.discountType === 'percentage' && (
                  <Field label="Max Discount (₹)">
                    <input className="acm-input" type="number" min="0" placeholder="e.g. 300"
                      value={form.maxDiscount} onChange={e => setForm(f=>({...f,maxDiscount:e.target.value}))} />
                  </Field>
                )}

                <Field label="Usage Limit (per user)">
                  <input className="acm-input" type="number" min="1" placeholder="Uses per user (empty = unlimited)"
                    value={form.usageLimit} onChange={e => setForm(f=>({...f,usageLimit:e.target.value}))} />
                </Field>

                <Field label="Expiry Date" required>
                  <input className="acm-input" type="date"
                    value={form.expiryDate} onChange={e => setForm(f=>({...f,expiryDate:e.target.value}))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Field>

                <Field label="Description">
                  <input className="acm-input" placeholder="e.g. 10% OFF on orders above ₹1000"
                    value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
                </Field>

                <div className="acm-full" style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                  <label className="acm-check-row">
                    <input type="checkbox" checked={form.isActive}
                      onChange={e => setForm(f=>({...f,isActive:e.target.checked}))} />
                    Active
                  </label>
                  <label className="acm-check-row">
                    <input type="checkbox" checked={form.forNewUsers}
                      onChange={e => setForm(f=>({...f,forNewUsers:e.target.checked}))} />
                    New Users Only
                  </label>
                </div>

              </div>

              <div className="acm-btn-row">
                <button type="button" className="acm-cancel" onClick={() => setShowModal(false)}>
                  <FiX size={14}/> Cancel
                </button>
                <button type="submit" className="acm-save" disabled={saving}>
                  {saving ? <><div className="ac-spin" style={{width:16,height:16,borderWidth:2}}/> Saving...</> : <><FiCheck size={14}/> {editingId ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`ac-toast ${toast.type}`}>
          {toast.type === 'success' ? <FiCheck size={15}/> : <FiAlertTriangle size={15}/>}
          {toast.msg}
        </div>
      )}
    </>
  );
};

export default AdminCoupons;