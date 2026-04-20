import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import {
  FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
  FiImage, FiZap, FiUpload, FiX,
} from 'react-icons/fi';

const BACKEND = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const ACCENTS = [
  { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.22)' },
  { color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.22)' },
  { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.22)' },
  { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.22)' },
  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.22)' },
];

/* ── Resolve stored path to full src ── */
const toSrc = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads/')) return `${BACKEND}${url}`;
  return url;
};

/* ─────────────────────────────────────────────────
   ImageUploadField
   Lets admin either:
     A) Upload an image from their computer
     B) Paste a direct image URL
───────────────────────────────────────────────── */
const ImageUploadField = ({ value, onChange }) => {
  const fileRef                     = useRef(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadErr, setUploadErr]   = useState('');
  const [mode, setMode]             = useState('upload'); // 'upload' | 'url'

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await adminAPI.uploadFestiveImage(fd);
      if (res.data?.success) {
        onChange(res.data.url);          // e.g. /uploads/festive/festive-12345.jpg
      } else {
        setUploadErr('Upload failed. Try again.');
      }
    } catch (err) {
      setUploadErr('Upload error: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      e.target.value = '';               // reset so same file can be re-selected
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(0,0,0,0.30)',
    border: '1.5px solid rgba(255,255,255,0.10)',
    borderRadius: 11, padding: '11px 14px',
    color: '#fff', fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color .22s',
  };

  const previewSrc = toSrc(value);

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {['upload', 'url'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{
              padding: '5px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12.5,
              fontWeight: 700, fontFamily: "'DM Sans',sans-serif", border: 'none',
              background: mode === m ? 'linear-gradient(135deg,#ea580c,#f97316)' : 'rgba(255,255,255,0.07)',
              color: mode === m ? '#fff' : 'rgba(255,255,255,0.45)',
              transition: 'all .2s',
            }}>
            {m === 'upload' ? '📁 Upload from computer' : '🔗 Paste URL'}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {mode === 'upload' && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              width: '100%', padding: '14px', borderRadius: 11, cursor: uploading ? 'not-allowed' : 'pointer',
              background: uploading ? 'rgba(249,115,22,0.10)' : 'rgba(255,255,255,0.04)',
              border: '2px dashed rgba(249,115,22,0.30)',
              color: uploading ? '#fb923c' : 'rgba(255,255,255,0.50)',
              fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans',sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .22s',
            }}
            onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = 'rgba(249,115,22,0.60)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.30)'; }}
          >
            {uploading
              ? <><span style={{ width:16, height:16, border:'2px solid rgba(249,115,22,0.3)', borderTopColor:'#f97316', borderRadius:'50%', animation:'afcSpin .7s linear infinite', display:'inline-block' }} /> Uploading…</>
              : <><FiUpload size={16} /> Click to choose image from your computer</>
            }
          </button>
          {uploadErr && (
            <p style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>{uploadErr}</p>
          )}
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.28)', marginTop: 6 }}>
            Supported: JPG, PNG, WEBP, GIF · Max 5 MB
          </p>
        </div>
      )}

      {/* URL tab */}
      {mode === 'url' && (
        <div>
          <input
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg  (must end in .jpg / .png / .webp)"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#f97316'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.10)'}
          />
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.28)', marginTop: 6 }}>
            💡 Tip: Right-click any image online → "Copy image address" — the URL must end in .jpg / .png / .webp
          </p>
        </div>
      )}

      {/* Preview — shown whenever there's a value */}
      {previewSrc && (
        <div style={{ marginTop: 12, position: 'relative', display: 'inline-block' }}>
          <img
            src={previewSrc}
            alt="Banner preview"
            style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', display: 'block' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          {/* Clear button */}
          <button
            onClick={() => onChange('')}
            style={{
              position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(0,0,0,0.70)', border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Remove image"
          >
            <FiX size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Add / Edit Modal ── */
const CollectionModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState({
    title:       initial?.title       || '',
    slug:        initial?.slug        || '',
    description: initial?.description || '',
    bannerImage: initial?.bannerImage || '',
    priority:    initial?.priority    ?? 0,
    isActive:    initial?.isActive    ?? false,
  });
  const [saving, setSaving] = useState(false);

  const autoSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'title' && !initial ? { slug: autoSlug(value) } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      alert('Title and slug are required');
      return;
    }
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(0,0,0,0.30)',
    border: '1.5px solid rgba(255,255,255,0.10)',
    borderRadius: 11, padding: '11px 14px',
    color: '#fff', fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color .22s',
  };
  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 700,
    color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
    letterSpacing: '.08em', marginBottom: 6,
  };

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflowY:'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width:'100%', maxWidth:580, background:'rgba(10,18,38,0.98)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:22, boxShadow:'0 32px 80px rgba(0,0,0,0.65)', fontFamily:"'DM Sans',sans-serif", display:'flex', flexDirection:'column', maxHeight:'92vh', margin:'auto' }}>

        {/* Header */}
        <div style={{ padding:'20px 26px', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg,rgba(249,115,22,0.08),transparent)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, borderRadius:'22px 22px 0 0', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#f97316,#ea580c,transparent)', borderRadius:'22px 22px 0 0' }} />
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:'#f97316', letterSpacing:'.14em', textTransform:'uppercase', margin:'0 0 4px' }}>
              {initial ? 'Edit Collection' : 'New Collection'}
            </p>
            <h3 style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>
              {initial ? initial.title : 'Create Festive Collection'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:10, width:36, height:36, color:'rgba(255,255,255,0.50)', cursor:'pointer', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding:'24px 26px', display:'flex', flexDirection:'column', gap:18, overflowY:'auto', flex:1 }}>

          <div>
            <label style={labelStyle}>Title *</label>
            <input value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Diwali Sale" style={inputStyle}
              onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.10)'} />
          </div>

          <div>
            <label style={labelStyle}>Slug * (URL path)</label>
            <input value={form.slug} onChange={e => handleChange('slug', e.target.value)} placeholder="e.g. diwali-sale" style={{ ...inputStyle, fontFamily:'monospace' }}
              onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.10)'} />
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.28)', margin:'5px 0 0' }}>
              Will link to /collections/{form.slug || '...'}
            </p>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Short description..." rows={3}
              style={{ ...inputStyle, resize:'vertical', minHeight:80 }}
              onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.10)'} />
          </div>

          {/* ── Image upload field ── */}
          <div>
            <label style={{ ...labelStyle, marginBottom: 10 }}>Banner Image</label>
            <ImageUploadField
              value={form.bannerImage}
              onChange={url => handleChange('bannerImage', url)}
            />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={labelStyle}>Priority (lower = first)</label>
              <input type="number" min={0} value={form.priority} onChange={e => handleChange('priority', Number(e.target.value))} style={inputStyle}
                onFocus={e => e.target.style.borderColor='#f97316'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.10)'} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <div onClick={() => handleChange('isActive', !form.isActive)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:11, cursor:'pointer', background: form.isActive ? 'rgba(74,222,128,0.10)' : 'rgba(255,255,255,0.05)', border:`1.5px solid ${form.isActive ? 'rgba(74,222,128,0.28)' : 'rgba(255,255,255,0.10)'}`, transition:'all .22s', userSelect:'none' }}>
                {form.isActive ? <FiToggleRight size={20} color="#4ade80" /> : <FiToggleLeft size={20} color="rgba(255,255,255,0.30)" />}
                <span style={{ fontSize:13.5, fontWeight:700, color: form.isActive ? '#4ade80' : 'rgba(255,255,255,0.40)' }}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 26px 22px', display:'flex', gap:10, justifyContent:'flex-end', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0, background:'rgba(10,18,38,0.98)', borderRadius:'0 0 22px 22px' }}>
          <button onClick={onClose} style={{ padding:'10px 22px', borderRadius:11, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.55)', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding:'10px 26px', borderRadius:11, background: saving ? 'rgba(249,115,22,0.50)' : 'linear-gradient(135deg,#ea580c,#f97316)', border:'none', color:'#fff', fontWeight:700, fontSize:14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow: saving ? 'none' : '0 4px 14px rgba(249,115,22,0.35)', display:'flex', alignItems:'center', gap:7 }}>
            {saving
              ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'afcSpin .7s linear infinite', display:'inline-block' }} /> Saving…</>
              : (initial ? '✓ Save Changes' : '+ Create Collection')}
          </button>
        </div>
        <style>{`@keyframes afcSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   MAIN PAGE — all logic unchanged
════════════════════════════════════════ */
const AdminFestiveCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showAdd, setShowAdd]         = useState(false);
  const [editing, setEditing]         = useState(null);
  const [toggling, setToggling]       = useState(null);

  useEffect(() => { fetchCollections(); }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllFestiveCollections();
      if (res.data?.success) setCollections(res.data.collections || []);
    } catch (err) {
      console.error('Error fetching festive collections:', err);
      setCollections([]);
    } finally { setLoading(false); }
  };

  const handleCreate = async (formData) => {
    try {
      const res = await adminAPI.createFestiveCollection(formData);
      if (res.data?.success) { alert('✅ Collection created!'); setShowAdd(false); fetchCollections(); }
    } catch (err) { alert('❌ ' + (err.response?.data?.message || err.message)); }
  };

  const handleUpdate = async (formData) => {
    try {
      const res = await adminAPI.updateFestiveCollection(editing._id, formData);
      if (res.data?.success) { alert('✅ Collection updated!'); setEditing(null); fetchCollections(); }
    } catch (err) { alert('❌ ' + (err.response?.data?.message || err.message)); }
  };

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const res = await adminAPI.toggleFestiveCollection(id);
      if (res.data?.success) setCollections(prev => prev.map(c => c._id === id ? { ...c, isActive: res.data.isActive } : c));
    } catch (err) { alert('❌ ' + (err.response?.data?.message || err.message)); }
    finally { setToggling(null); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      const res = await adminAPI.deleteFestiveCollection(id);
      if (res.data?.success) { alert('✅ Deleted'); fetchCollections(); }
    } catch (err) { alert('❌ ' + (err.response?.data?.message || err.message)); }
  };

  if (loading) {
    return (
      <>
        <style>{`.afc-load{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at top left,#0f172a,#000,#020617)}.afc-spin{width:44px;height:44px;border-radius:50%;border:3px solid rgba(249,115,22,0.18);border-top-color:#f97316;animation:afcSpin .75s linear infinite}@keyframes afcSpin{to{transform:rotate(360deg)}}`}</style>
        <div className="afc-load"><div className="afc-spin" /></div>
      </>
    );
  }

  const activeCount = collections.filter(c => c.isActive).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .afc-page{min-height:100vh;font-family:'DM Sans',sans-serif;background:radial-gradient(circle at top left,#0f172a 0%,#000 50%,#020617 100%);padding:32px 28px 80px}
        @media(max-width:640px){.afc-page{padding:18px 14px 60px}}
        .afc-wrap{max-width:1200px;margin:0 auto}
        .afc-header{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:14px;background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:22px 26px;margin-bottom:24px;position:relative}
        .afc-header::before{content:'';position:absolute;top:0;left:0;right:0;height:1.5px;background:linear-gradient(90deg,#f97316,#ea580c,transparent);border-radius:20px 20px 0 0}
        .afc-eyebrow{font-size:11px;font-weight:700;color:#f97316;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:6px}
        .afc-eyebrow::before{content:'';display:inline-block;width:12px;height:1.5px;background:#f97316}
        .afc-title{font-size:clamp(22px,3vw,34px);font-weight:800;color:#fff;line-height:1.1}
        .afc-sub{font-size:13px;color:rgba(255,255,255,0.35);margin-top:4px}
        .afc-add-btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;border:none;border-radius:12px;padding:11px 22px;font-size:14px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:transform .22s,box-shadow .22s;box-shadow:0 4px 14px rgba(249,115,22,0.30);white-space:nowrap}
        .afc-add-btn:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 8px 22px rgba(249,115,22,0.46)}
        .afc-stats{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}
        .afc-stat-pill{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);font-size:13px;font-weight:700;color:rgba(255,255,255,0.55)}
        .afc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}
        .afc-card{background:rgba(255,255,255,0.04);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;transition:transform .28s,box-shadow .28s,border-color .28s;animation:afcIn .5s ease both}
        .afc-card:hover{transform:translateY(-5px);box-shadow:0 18px 44px rgba(0,0,0,0.32);border-color:rgba(249,115,22,0.20)}
        @keyframes afcIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .afc-card-img{position:relative;height:140px;overflow:hidden;background:#0a1628}
        .afc-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
        .afc-card:hover .afc-card-img img{transform:scale(1.06)}
        .afc-card-img-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(249,115,22,0.10),rgba(139,92,246,0.08))}
        .afc-card-body{padding:16px 18px}
        .afc-card-title{font-size:16px;font-weight:800;color:#f1f5f9;margin-bottom:3px}
        .afc-card-slug{font-size:11px;color:rgba(255,255,255,0.30);font-family:monospace;margin-bottom:8px}
        .afc-card-desc{font-size:13px;color:rgba(255,255,255,0.40);line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.4em;margin-bottom:12px}
        .afc-status{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:800}
        .afc-status.active{background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.25);color:#4ade80}
        .afc-status.inactive{background:rgba(239,68,68,0.10);border:1px solid rgba(239,68,68,0.22);color:#f87171}
        .afc-status-dot{width:6px;height:6px;border-radius:50%}
        .afc-status.active .afc-status-dot{background:#4ade80;animation:afcDotPulse 2s ease-in-out infinite}
        .afc-status.inactive .afc-status-dot{background:#f87171}
        @keyframes afcDotPulse{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.4)}50%{box-shadow:0 0 0 5px rgba(74,222,128,0)}}
        .afc-actions{display:flex;gap:8px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)}
        .afc-act{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 10px;border-radius:10px;font-size:12.5px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;border:none;transition:transform .2s}
        .afc-act:hover{transform:translateY(-1px)}
        .afc-act:active{transform:scale(0.97)}
        .afc-act.toggle-on{background:rgba(74,222,128,0.10);border:1px solid rgba(74,222,128,0.22);color:#4ade80}
        .afc-act.toggle-off{background:rgba(249,115,22,0.10);border:1px solid rgba(249,115,22,0.22);color:#fb923c}
        .afc-act.toggle-on:hover{background:rgba(74,222,128,0.18)}
        .afc-act.toggle-off:hover{background:rgba(249,115,22,0.18)}
        .afc-act.edit{background:rgba(59,130,246,0.10);border:1px solid rgba(59,130,246,0.22);color:#60a5fa}
        .afc-act.edit:hover{background:rgba(59,130,246,0.18)}
        .afc-act.del{background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.18);color:#f87171}
        .afc-act.del:hover{background:rgba(239,68,68,0.15)}
        .afc-act:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .afc-empty{text-align:center;padding:80px 20px;background:rgba(255,255,255,0.03);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.07);border-radius:20px}
        .afc-empty-icon{width:90px;height:90px;border-radius:50%;background:rgba(249,115,22,0.07);border:1px solid rgba(249,115,22,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:afcPulse 2.5s ease-in-out infinite}
        @keyframes afcPulse{0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.12)}50%{box-shadow:0 0 0 14px rgba(249,115,22,0)}}
        .afc-empty-title{font-size:20px;font-weight:700;color:#f1f5f9;margin-bottom:8px}
        .afc-empty-sub{font-size:14px;color:rgba(255,255,255,0.35);margin-bottom:22px}
      `}</style>

      <div className="afc-page">
        <div className="afc-wrap">

          <div className="afc-header">
            <div>
              <p className="afc-eyebrow">Admin Panel</p>
              <h1 className="afc-title">Festive Collections</h1>
              <p className="afc-sub">Manage homepage festive collection cards</p>
            </div>
            <button className="afc-add-btn" onClick={() => setShowAdd(true)}>
              <FiPlus size={15} /> Add Collection
            </button>
          </div>

          <div className="afc-stats">
            <div className="afc-stat-pill"><span style={{ color:'#f1f5f9' }}>{collections.length}</span> Total</div>
            <div className="afc-stat-pill" style={{ color:'#4ade80', borderColor:'rgba(74,222,128,0.18)' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', display:'inline-block' }} />
              {activeCount} Active
            </div>
            <div className="afc-stat-pill" style={{ color:'#f87171', borderColor:'rgba(239,68,68,0.18)' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#f87171', display:'inline-block' }} />
              {collections.length - activeCount} Inactive
            </div>
          </div>

          {collections.length > 0 ? (
            <div className="afc-grid">
              {collections.map((col, i) => {
                const isToggling = toggling === col._id;
                const imgSrc = toSrc(col.bannerImage);
                return (
                  <div key={col._id} className="afc-card" style={{ animationDelay:`${i * 55}ms` }}>
                    <div className="afc-card-img">
                      {imgSrc ? (
                        <img src={imgSrc} alt={col.title} onError={e => { e.target.style.display='none'; }} />
                      ) : (
                        <div className="afc-card-img-placeholder"><FiImage size={32} color="rgba(255,255,255,0.18)" /></div>
                      )}
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(to top,rgba(7,13,26,0.85),transparent)', pointerEvents:'none' }} />
                      <div style={{ position:'absolute', top:10, left:10, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, padding:'2px 8px', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.50)' }}>
                        #{col.priority}
                      </div>
                    </div>
                    <div className="afc-card-body">
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:3 }}>
                        <p className="afc-card-title">{col.title}</p>
                        <span className={`afc-status ${col.isActive ? 'active' : 'inactive'}`}>
                          <span className="afc-status-dot" />{col.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="afc-card-slug">/{col.slug}</p>
                      <p className="afc-card-desc">{col.description || 'No description.'}</p>
                      <div className="afc-actions">
                        <button className={`afc-act ${col.isActive ? 'toggle-on' : 'toggle-off'}`} onClick={() => handleToggle(col._id)} disabled={isToggling}>
                          {isToggling ? '…' : col.isActive ? <><FiToggleRight size={13}/> Deactivate</> : <><FiToggleLeft size={13}/> Activate</>}
                        </button>
                        <button className="afc-act edit" onClick={() => setEditing(col)}><FiEdit2 size={12}/> Edit</button>
                        <button className="afc-act del" onClick={() => handleDelete(col._id, col.title)}><FiTrash2 size={12}/> Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="afc-empty">
              <div className="afc-empty-icon"><FiZap size={36} color="#f97316" /></div>
              <p className="afc-empty-title">No festive collections yet</p>
              <p className="afc-empty-sub">Create your first collection to display on the homepage</p>
              <button className="afc-add-btn" onClick={() => setShowAdd(true)}><FiPlus size={15}/> Create Collection</button>
            </div>
          )}
        </div>
      </div>

      {showAdd  && <CollectionModal onClose={() => setShowAdd(false)} onSave={handleCreate} />}
      {editing  && <CollectionModal initial={editing} onClose={() => setEditing(null)} onSave={handleUpdate} />}
    </>
  );
};

export default AdminFestiveCollections;