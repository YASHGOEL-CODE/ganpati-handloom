import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI, clearCache } from '../../services/api';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiPackage, FiAlertTriangle, FiDollarSign, FiCommand } from 'react-icons/fi';
import AddProduct from '../../components/admin/AddProduct';
import EditProduct from '../../components/admin/EditProduct';
import { getImageUrl } from '../../utils/imageHelper';

/* ─────────────────────────────────────
   Product Card — hover action hub
───────────────────────────────────── */
const ProductCard = ({ product, index, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const isLowStock = product.stock <= 5;

  return (
    <div
      className="ap-card"
      style={{
        animationDelay: `${index * 60}ms`,
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 48px rgba(249,115,22,0.18), 0 0 0 1px rgba(249,115,22,0.22)'
          : '0 4px 20px rgba(0,0,0,0.25)',
        borderColor: hovered ? 'rgba(249,115,22,0.28)' : 'rgba(255,255,255,0.08)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── IMAGE + HOVER ACTION HUB ── */}
      <div className="ap-img-wrap">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.name}
          className="ap-img"
          style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
        />

        {/* Dark gradient overlay at bottom for readability */}
        <div className="ap-img-gradient" />

        {/* Inactive badge */}
        {!product.isActive && (
          <div className="ap-inactive-badge">Inactive</div>
        )}

        {/* Stock badge */}
        <div className={`ap-stock-badge ${isLowStock ? 'low' : 'ok'}`}>
          {isLowStock && <span className="ap-pulse-dot" />}
          Stock: {product.stock}
        </div>

        {/* Hover action overlay */}
        <div className={`ap-action-overlay ${hovered ? 'visible' : ''}`}>
          <button
            className="ap-action-btn edit"
            onClick={() => onEdit(product._id)}
          >
            <FiEdit2 size={15} /> Edit
          </button>
          <button
            className="ap-action-btn delete"
            onClick={() => onDelete(product._id)}
          >
            <FiTrash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="ap-body">
        <h3 className="ap-product-name">{product.name}</h3>
        <p className="ap-product-desc">{product.description}</p>

        <div className="ap-price-row">
          <span className="ap-price">₹{product.price?.toLocaleString()}</span>
          <span className={`ap-stock-text ${isLowStock ? 'low' : ''}`}>
            {isLowStock ? '⚠ Low Stock' : `${product.stock} in stock`}
          </span>
        </div>

        {/* Category / fabric pill */}
        {(product.category?.name || product.fabricType) && (
          <div className="ap-pills">
            {product.category?.name && <span className="ap-pill">{product.category.name}</span>}
            {product.fabricType && <span className="ap-pill">{product.fabricType}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────
   Main AdminProducts — all logic unchanged
───────────────────────────────────── */
const AdminProducts = () => {
  // ── All state completely unchanged ──
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // ── All useEffects completely unchanged ──
  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && products.length > 0) {
      handleEdit(editId);
      setSearchParams({});
    }
  }, [searchParams, products]);

  // ── All handlers completely unchanged ──
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllProducts();
      if (response.data.success) setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (productId) => {
    try {
      console.log('🔍 Fetching fresh product data for:', productId);
      clearCache();
      const response = await adminAPI.getAllProducts();
      if (response.data.success) {
        const freshProduct = response.data.products.find(p => p._id === productId);
        if (freshProduct) {
          console.log('✅ Fresh product found:', freshProduct.name, 'Stock:', freshProduct.stock);
          setEditingProduct(freshProduct);
        } else {
          console.error('❌ Product not found in fresh data');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching fresh product:', error);
      const productFromList = products.find(p => p._id === productId);
      if (productFromList) setEditingProduct(productFromList);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await adminAPI.deleteProduct(productId);
      if (response.data.success) {
        alert('Product deleted successfully!');
        clearCache();
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  // ── Filter logic completely unchanged ──
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Quick stats
  const totalValue    = products.reduce((sum, p) => sum + (p.price * p.stock || 0), 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  if (loading) {
    return (
      <>
        <style>{`
          .ap-loader {
            min-height:100vh; display:flex; align-items:center; justify-content:center;
            background:radial-gradient(circle at top left, #0f172a, #000, #020617);
          }
          .ap-spin {
            width:44px; height:44px; border-radius:50%;
            border:3px solid rgba(249,115,22,0.18); border-top-color:#f97316;
            animation:apSpin .75s linear infinite;
          }
          @keyframes apSpin { to{transform:rotate(360deg)} }
        `}</style>
        <div className="ap-loader"><div className="ap-spin" /></div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        /* ── PAGE ── */
        .ap-page {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: radial-gradient(circle at top left, #0f172a 0%, #000000 50%, #020617 100%);
          padding: 32px 28px 80px;
        }
        @media (max-width: 640px) { .ap-page { padding: 20px 14px 60px; } }
        .ap-wrap { max-width: 1320px; margin: 0 auto; }

        /* ── FLOATING GLASS HEADER ── */
        .ap-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 22px 26px;
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative;
        }
        .ap-header::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1.5px;
          background: linear-gradient(90deg, #f97316, #ea580c, transparent);
          border-radius:20px 20px 0 0;
        }
        .ap-header-eyebrow {
          font-size:11px; font-weight:700; color:#f97316;
          letter-spacing:.14em; text-transform:uppercase; margin-bottom:6px;
          display:flex; align-items:center; gap:6px;
        }
        .ap-header-eyebrow::before { content:''; display:inline-block; width:12px; height:1.5px; background:#f97316; }
        .ap-header-title {
          font-size: clamp(22px, 3vw, 34px); font-weight:800; color:#fff; line-height:1.1;
        }
        .ap-add-btn {
          display:inline-flex; align-items:center; gap:8px;
          background:linear-gradient(135deg,#ea580c,#f97316); color:#fff; border:none;
          border-radius:12px; padding:12px 22px; font-size:14px; font-weight:700;
          font-family:'DM Sans',sans-serif; cursor:pointer;
          transition:transform .22s, box-shadow .22s, filter .22s;
          box-shadow:0 4px 16px rgba(249,115,22,0.32); white-space:nowrap;
        }
        .ap-add-btn:hover { transform:translateY(-2px) scale(1.03); box-shadow:0 8px 24px rgba(249,115,22,0.48); filter:brightness(1.07); }

        /* ── QUICK STATS ── */
        .ap-stats {
          display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px;
        }
        @media (max-width:640px) { .ap-stats { grid-template-columns:1fr; } }
        .ap-stat {
          background:rgba(255,255,255,0.04); backdrop-filter:blur(16px);
          border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:18px 20px;
          display:flex; align-items:center; gap:14px;
          transition:border-color .25s, box-shadow .25s;
        }
        .ap-stat:hover { border-color:rgba(255,255,255,0.14); box-shadow:0 8px 26px rgba(0,0,0,0.22); }
        .ap-stat-ico {
          width:42px; height:42px; border-radius:12px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
        }
        .ap-stat-val { font-size:22px; font-weight:800; color:#f1f5f9; line-height:1; margin-bottom:3px; }
        .ap-stat-lbl { font-size:11.5px; font-weight:600; color:rgba(255,255,255,0.36); text-transform:uppercase; letter-spacing:.07em; }

        /* ── SEARCH ── */
        .ap-search-wrap {
          background:rgba(255,255,255,0.04); backdrop-filter:blur(16px);
          border:1px solid rgba(255,255,255,0.08); border-radius:16px;
          padding:16px 20px; margin-bottom:24px; position:relative;
        }
        .ap-search-inner { position:relative; display:flex; align-items:center; gap:12px; }
        .ap-search-ico { color:rgba(255,255,255,0.30); flex-shrink:0; }
        .ap-search-input {
          flex:1; background:rgba(0,0,0,0.30); border:1.5px solid rgba(255,255,255,0.09);
          border-radius:11px; padding:11px 16px;
          color:#fff; font-size:14.5px; font-family:'DM Sans',sans-serif; outline:none;
          transition:border-color .22s, background .22s, box-shadow .22s;
        }
        .ap-search-input::placeholder { color:rgba(255,255,255,0.22); }
        .ap-search-input:focus {
          border-color:#f97316; background:rgba(249,115,22,0.06);
          box-shadow:0 0 0 3px rgba(249,115,22,0.14), 0 2px 12px rgba(249,115,22,0.10);
        }
        .ap-search-shortcut {
          display:flex; align-items:center; gap:4px; flex-shrink:0;
          font-size:11px; font-weight:600; color:rgba(255,255,255,0.22);
          background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10);
          border-radius:6px; padding:3px 7px;
        }

        /* ── PRODUCTS GRID ── */
        .ap-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
          gap:20px;
        }

        /* ── PRODUCT CARD ── */
        .ap-card {
          background:rgba(255,255,255,0.04); backdrop-filter:blur(16px);
          border:1px solid rgba(255,255,255,0.08); border-radius:20px;
          overflow:hidden;
          transition:transform .28s ease, box-shadow .28s ease, border-color .28s ease;
          animation:apCardIn .55s ease both;
        }
        @keyframes apCardIn {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* Image area */
        .ap-img-wrap { position:relative; height:210px; overflow:hidden; background:#0f172a; }
        .ap-img { width:100%; height:100%; object-fit:cover; transition:transform .5s ease; }

        /* Bottom dark gradient on image */
        .ap-img-gradient {
          position:absolute; bottom:0; left:0; right:0; height:70px;
          background:linear-gradient(to top, rgba(0,0,0,0.70), transparent);
          pointer-events:none;
        }

        /* Inactive badge */
        .ap-inactive-badge {
          position:absolute; top:10px; right:10px;
          background:rgba(220,38,38,0.85); backdrop-filter:blur(6px);
          color:#fff; font-size:10.5px; font-weight:800;
          padding:3px 10px; border-radius:999px;
          border:1px solid rgba(239,68,68,0.40);
        }

        /* Stock badge */
        .ap-stock-badge {
          position:absolute; top:10px; left:10px;
          display:flex; align-items:center; gap:5px;
          font-size:10.5px; font-weight:800;
          padding:4px 11px; border-radius:999px;
          backdrop-filter:blur(8px);
        }
        .ap-stock-badge.ok {
          background:rgba(74,222,128,0.18); border:1px solid rgba(74,222,128,0.28); color:#4ade80;
        }
        .ap-stock-badge.low {
          background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.30); color:#f87171;
        }
        /* Pulsing dot for low stock */
        .ap-pulse-dot {
          width:7px; height:7px; border-radius:50%; background:#f87171; flex-shrink:0;
          animation:apDotPulse 1.5s ease-in-out infinite;
        }
        @keyframes apDotPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(248,113,113,0.50); }
          50%      { box-shadow:0 0 0 5px rgba(248,113,113,0); }
        }

        /* Hover action overlay */
        .ap-action-overlay {
          position:absolute; inset:0;
          background:rgba(0,0,0,0.55); backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center; gap:12px;
          opacity:0; transition:opacity .25s ease;
        }
        .ap-action-overlay.visible { opacity:1; }

        .ap-action-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:10px 18px; border-radius:11px;
          font-size:13.5px; font-weight:700; font-family:'DM Sans',sans-serif;
          border:none; cursor:pointer;
          transition:transform .2s, box-shadow .2s, filter .2s;
        }
        .ap-action-btn:hover { transform:scale(1.05); filter:brightness(1.10); }
        .ap-action-btn.edit {
          background:linear-gradient(135deg,#2563eb,#3b82f6); color:#fff;
          box-shadow:0 4px 14px rgba(59,130,246,0.38);
        }
        .ap-action-btn.delete {
          background:linear-gradient(135deg,#dc2626,#ef4444); color:#fff;
          box-shadow:0 4px 14px rgba(239,68,68,0.38);
        }

        /* Card body */
        .ap-body { padding:16px 18px 18px; }
        .ap-product-name {
          font-size:16px; font-weight:700; color:#f1f5f9; line-height:1.35;
          margin-bottom:5px;
          display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;
          text-shadow:0 0 20px rgba(249,115,22,0);
          transition:text-shadow .28s;
        }
        .ap-card:hover .ap-product-name { text-shadow:0 0 20px rgba(249,115,22,0.18); }
        .ap-product-desc {
          font-size:13px; color:rgba(255,255,255,0.38); line-height:1.55; margin-bottom:12px;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .ap-price-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .ap-price {
          font-size:20px; font-weight:800;
          color:#f97316;
          text-shadow:0 0 14px rgba(249,115,22,0.35);
        }
        .ap-stock-text { font-size:12px; font-weight:700; color:rgba(255,255,255,0.40); }
        .ap-stock-text.low { color:#f87171; }

        /* Pill tags */
        .ap-pills { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; }
        .ap-pill {
          font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:999px;
          background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.09);
          color:rgba(255,255,255,0.42); text-transform:capitalize;
        }

        /* ── EMPTY STATE ── */
        .ap-empty {
          grid-column:1/-1; text-align:center; padding:72px 20px;
          color:rgba(255,255,255,0.30); font-size:15px;
        }
        .ap-empty-icon {
          width:72px; height:72px; border-radius:50%;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          display:flex; align-items:center; justify-content:center;
          margin:0 auto 16px;
        }

        @media (max-width:640px) {
          .ap-grid { grid-template-columns:1fr; }
          .ap-header { padding:18px 16px; }
        }
      `}</style>

      <div className="ap-page">
        <div className="ap-wrap">

          {/* ── FLOATING GLASS HEADER ── */}
          <div className="ap-header">
            <div>
              <p className="ap-header-eyebrow">Admin Panel</p>
              <h1 className="ap-header-title">Manage Products</h1>
            </div>
            <button className="ap-add-btn" onClick={() => setShowAddModal(true)}>
              <FiPlus size={16} /> Add Product
            </button>
          </div>

          {/* ── QUICK STATS ── */}
          <div className="ap-stats">
            <div className="ap-stat">
              <div className="ap-stat-ico" style={{ background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.22)' }}>
                <FiPackage size={20} color="#f97316" />
              </div>
              <div>
                <p className="ap-stat-val">{products.length}</p>
                <p className="ap-stat-lbl">Total Products</p>
              </div>
            </div>
            <div className="ap-stat">
              <div className="ap-stat-ico" style={{ background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.22)' }}>
                <FiAlertTriangle size={20} color="#f87171" />
              </div>
              <div>
                <p className="ap-stat-val" style={{ color: lowStockCount > 0 ? '#f87171' : '#f1f5f9' }}>{lowStockCount}</p>
                <p className="ap-stat-lbl">Low Stock Items</p>
              </div>
            </div>
            <div className="ap-stat">
              <div className="ap-stat-ico" style={{ background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.22)' }}>
                <FiDollarSign size={20} color="#4ade80" />
              </div>
              <div>
                <p className="ap-stat-val" style={{ color:'#4ade80', fontSize:18 }}>₹{totalValue.toLocaleString()}</p>
                <p className="ap-stat-lbl">Inventory Value</p>
              </div>
            </div>
          </div>

          {/* ── FUTURISTIC SEARCH BAR ── */}
          <div className="ap-search-wrap">
            <div className="ap-search-inner">
              <FiSearch size={17} className="ap-search-ico" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ap-search-input"
              />
              <div className="ap-search-shortcut">
                <FiCommand size={11} /> K
              </div>
            </div>
          </div>

          {/* ── PRODUCTS GRID ── */}
          <div className="ap-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="ap-empty">
                <div className="ap-empty-icon">
                  <FiPackage size={28} color="rgba(255,255,255,0.20)" />
                </div>
                No products found
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Add Product Modal — completely unchanged */}
      {showAddModal && (
        <AddProduct
          onClose={() => setShowAddModal(false)}
          onProductAdded={() => { fetchProducts(); setShowAddModal(false); }}
        />
      )}

      {/* Edit Product Modal — completely unchanged */}
      {editingProduct && (
        <EditProduct
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onProductUpdated={(updatedProduct) => {
            console.log('✅ Product updated:', updatedProduct);
            setProducts(prevProducts =>
              prevProducts.map(p => p._id === updatedProduct._id ? updatedProduct : p)
            );
            setEditingProduct(null);
            clearCache();
          }}
        />
      )}
    </>
  );
};

export default AdminProducts;