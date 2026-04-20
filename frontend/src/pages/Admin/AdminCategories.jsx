import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiFolder } from 'react-icons/fi';
import AddCategory from '../../components/admin/AddCategory';
import EditCategory from '../../components/admin/EditCategory';

/* ── Folder icon colors cycling ── */
const FOLDER_COLORS = [
  { icon:'#f97316', bg:'rgba(249,115,22,0.12)', border:'rgba(249,115,22,0.22)' },
  { icon:'#60a5fa', bg:'rgba(96,165,250,0.12)',  border:'rgba(96,165,250,0.22)' },
  { icon:'#c084fc', bg:'rgba(192,132,252,0.12)', border:'rgba(192,132,252,0.22)' },
  { icon:'#4ade80', bg:'rgba(74,222,128,0.12)',  border:'rgba(74,222,128,0.22)' },
  { icon:'#fbbf24', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.22)' },
  { icon:'#f87171', bg:'rgba(239,68,68,0.10)',   border:'rgba(239,68,68,0.22)' },
];

const AdminCategories = () => {
  // ── All state completely unchanged ──
  const [categories, setCategories]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // ── All useEffects & handlers completely unchanged ──
  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCategories();
      console.log('Categories response:', response.data);
      if (response.data.success)             setCategories(response.data.categories);
      else if (response.data.categories)     setCategories(response.data.categories);
      else if (Array.isArray(response.data)) setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally { setLoading(false); }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category may be affected.')) return;
    try {
      const response = await adminAPI.deleteCategory(categoryId);
      if (response.data.success) { alert('✅ Category deleted successfully!'); fetchCategories(); }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('❌ Failed to delete category. It may have products associated with it.');
    }
  };

  if (loading) {
    return (
      <>
        <style>{`.ac-load{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at top left,#0f172a,#000,#020617);}.ac-spin{width:44px;height:44px;border-radius:50%;border:3px solid rgba(249,115,22,0.18);border-top-color:#f97316;animation:acSpin .75s linear infinite;}@keyframes acSpin{to{transform:rotate(360deg)}}`}</style>
        <div className="ac-load"><div className="ac-spin" /></div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .ac-page { min-height:100vh; font-family:'DM Sans',sans-serif; background:radial-gradient(circle at top left,#0f172a 0%,#000 50%,#020617 100%); padding:32px 28px 80px; }
        @media(max-width:640px){ .ac-page{padding:18px 14px 60px;} }
        .ac-wrap { max-width:1200px; margin:0 auto; }

        /* Header */
        .ac-header { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:14px; background:rgba(255,255,255,0.04); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:22px 26px; margin-bottom:24px; position:relative; }
        .ac-header::before { content:''; position:absolute; top:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,#f97316,#ea580c,transparent); border-radius:20px 20px 0 0; }
        .ac-eyebrow { font-size:11px; font-weight:700; color:#f97316; letter-spacing:.14em; text-transform:uppercase; margin-bottom:6px; display:flex; align-items:center; gap:6px; }
        .ac-eyebrow::before { content:''; display:inline-block; width:12px; height:1.5px; background:#f97316; }
        .ac-title { font-size:clamp(22px,3vw,34px); font-weight:800; color:#fff; line-height:1.1; }
        .ac-sub { font-size:13px; color:rgba(255,255,255,0.35); margin-top:4px; }
        .ac-add-btn { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#ea580c,#f97316); color:#fff; border:none; border-radius:12px; padding:11px 22px; font-size:14px; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer; transition:transform .22s,box-shadow .22s; box-shadow:0 4px 14px rgba(249,115,22,0.30); white-space:nowrap; }
        .ac-add-btn:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 8px 22px rgba(249,115,22,0.46); }

        /* Grid */
        .ac-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:18px; }

        /* Category card */
        .ac-card { background:rgba(255,255,255,0.04); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:22px; position:relative; overflow:hidden; transition:transform .28s,box-shadow .28s,border-color .28s; animation:acCardIn .5s ease both; cursor:default; }
        .ac-card:hover { transform:translateY(-5px); box-shadow:0 18px 44px rgba(0,0,0,0.32); border-color:rgba(249,115,22,0.22); }
        @keyframes acCardIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        /* Folder icon */
        .ac-folder { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; margin-bottom:16px; transition:transform .28s; }
        .ac-card:hover .ac-folder { transform:rotate(-6deg) scale(1.10); }

        .ac-cat-name { font-size:17px; font-weight:800; color:#f1f5f9; margin-bottom:4px; }
        .ac-cat-slug { font-size:11.5px; color:rgba(255,255,255,0.30); font-family:monospace; margin-bottom:8px; }
        .ac-cat-desc { font-size:13px; color:rgba(255,255,255,0.42); line-height:1.55; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:2.5em; }

        /* Actions row */
        .ac-actions { display:flex; gap:8px; margin-top:16px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.06); }
        .ac-act { flex:1; display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:9px 12px; border-radius:10px; font-size:13px; font-weight:700; font-family:'DM Sans',sans-serif; cursor:pointer; border:none; transition:transform .2s,box-shadow .2s,filter .2s; }
        .ac-act:active { transform:scale(0.97); }
        .ac-act.edit { background:rgba(59,130,246,0.14); border:1px solid rgba(59,130,246,0.25); color:#60a5fa; }
        .ac-act.edit:hover { background:rgba(59,130,246,0.22); box-shadow:0 4px 14px rgba(59,130,246,0.22); }
        .ac-act.del  { background:rgba(239,68,68,0.10); border:1px solid rgba(239,68,68,0.20); color:#f87171; }
        .ac-act.del:hover  { background:rgba(239,68,68,0.18); box-shadow:0 4px 14px rgba(239,68,68,0.18); }

        /* Empty state */
        .ac-empty { text-align:center; padding:80px 20px; background:rgba(255,255,255,0.03); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.07); border-radius:20px; }
        .ac-empty-icon { width:90px; height:90px; border-radius:50%; background:rgba(249,115,22,0.07); border:1px solid rgba(249,115,22,0.15); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; animation:acPulse 2.5s ease-in-out infinite; }
        @keyframes acPulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.12)} 50%{box-shadow:0 0 0 14px rgba(249,115,22,0)} }
        .ac-empty-title { font-size:20px; font-weight:700; color:#f1f5f9; margin-bottom:8px; }
        .ac-empty-sub   { font-size:14px; color:rgba(255,255,255,0.35); margin-bottom:22px; }
      `}</style>

      <div className="ac-page">
        <div className="ac-wrap">

          {/* Header */}
          <div className="ac-header">
            <div>
              <p className="ac-eyebrow">Admin Panel</p>
              <h1 className="ac-title">Manage Categories</h1>
              <p className="ac-sub">Organize your products with categories</p>
            </div>
            <button className="ac-add-btn" onClick={() => setShowAddModal(true)}>
              <FiPlus size={15} /> Add Category
            </button>
          </div>

          {/* Grid or Empty */}
          {categories.length > 0 ? (
            <div className="ac-grid">
              {categories.map((category, i) => {
                const fc = FOLDER_COLORS[i % FOLDER_COLORS.length];
                return (
                  <div key={category._id} className="ac-card" style={{ animationDelay:`${i*55}ms` }}>
                    <div className="ac-folder" style={{ background:fc.bg, border:`1px solid ${fc.border}` }}>
                      <FiFolder size={26} color={fc.icon} />
                    </div>
                    <p className="ac-cat-name">{category.name}</p>
                    {category.slug && <p className="ac-cat-slug">/{category.slug}</p>}
                    <p className="ac-cat-desc">{category.description || 'No description provided.'}</p>
                    <div className="ac-actions">
                      <button className="ac-act edit" onClick={() => setEditingCategory(category)}>
                        <FiEdit2 size={13} /> Edit
                      </button>
                      <button className="ac-act del" onClick={() => handleDelete(category._id)}>
                        <FiTrash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ac-empty">
              <div className="ac-empty-icon"><FiTag size={36} color="#f97316" /></div>
              <p className="ac-empty-title">No categories yet</p>
              <p className="ac-empty-sub">Create your first category to organize products</p>
              <button className="ac-add-btn" onClick={() => setShowAddModal(true)}>
                <FiPlus size={15} /> Create Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals — completely unchanged */}
      {showAddModal && (
        <AddCategory
          onClose={() => setShowAddModal(false)}
          onCategoryAdded={() => { fetchCategories(); setShowAddModal(false); }}
        />
      )}
      {editingCategory && (
        <EditCategory
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onCategoryUpdated={() => { fetchCategories(); setEditingCategory(null); }}
        />
      )}
    </>
  );
};

export default AdminCategories;