import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import ProductCard from './ProductCard';
import Loader from '../common/Loader';
import { FiGrid, FiList, FiSearch, FiTruck } from 'react-icons/fi';
import { formatPrice } from '../../utils/helpers';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [sort, setSort]                 = useState('');
  const [viewMode, setViewMode]         = useState('grid');
  const [search, setSearch]             = useState(searchParams.get('keyword') || '');

  useEffect(() => {
    fetchProducts();
  }, [searchParams, sort]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchParams.get('keyword'))     params.keyword     = searchParams.get('keyword');
      if (searchParams.get('category'))    params.category    = searchParams.get('category');
      if (searchParams.get('productType')) params.productType = searchParams.get('productType');
      if (searchParams.get('collection'))  params.collection  = searchParams.get('collection');
      if (sort) params.sort = sort;
      const response = await productsAPI.getAll(params);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (search) p.set('keyword', search);
    else p.delete('keyword');
    setSearchParams(p);
  };

  const subtotal = products.reduce((s, p) => s + p.price, 0);
  const FREE_THRESHOLD = 500;
  const progressPct = Math.min((subtotal / FREE_THRESHOLD) * 100, 100);

  if (loading) return <Loader />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .pl-page {
          min-height:100vh;
          background: radial-gradient(circle at 15% 10%, rgba(249,115,22,0.07) 0%, transparent 55%),
                      radial-gradient(circle at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 55%),
                      linear-gradient(160deg,#0f172a 0%,#000 50%,#020617 100%);
          font-family:'DM Sans',sans-serif;
          padding:36px 24px 80px;
        }
        .pl-wrap { max-width:1320px; margin:0 auto; }

        /* Header */
        .pl-hdr {
          background:rgba(255,255,255,0.04); backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.08); border-radius:20px;
          padding:22px 26px; margin-bottom:20px; position:relative;
          display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:14px;
        }
        .pl-hdr::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,#f97316,#ea580c,transparent); border-radius:20px 20px 0 0;
        }
        .pl-eyebrow {
          font-size:11px; font-weight:700; color:#f97316;
          letter-spacing:.15em; text-transform:uppercase; margin-bottom:7px;
          display:flex; align-items:center; gap:6px;
        }
        .pl-eyebrow::before{content:'';display:inline-block;width:12px;height:1.5px;background:#f97316;}
        .pl-title {
          font-family:'Playfair Display',serif;
          font-size:clamp(22px,3vw,34px); font-weight:800; color:#fff; line-height:1.1;
        }
        .pl-count { font-size:12px; color:rgba(255,255,255,0.35); margin-top:4px; }

        /* Controls */
        .pl-controls {
          background:rgba(255,255,255,0.04); backdrop-filter:blur(16px);
          border:1px solid rgba(255,255,255,0.07); border-radius:16px;
          padding:14px 18px; margin-bottom:20px;
          display:flex; gap:12px; flex-wrap:wrap; align-items:center;
        }
        .pl-search-wrap { position:relative; display:flex; align-items:center; flex:1; min-width:200px; }
        .pl-search-ico  { position:absolute; left:13px; color:rgba(255,255,255,0.28); pointer-events:none; }
        .pl-search {
          width:100%; background:rgba(0,0,0,0.30); border:1.5px solid rgba(255,255,255,0.09);
          border-radius:11px; padding:10px 14px 10px 40px; color:#fff;
          font-size:14px; font-family:'DM Sans',sans-serif; outline:none;
          transition:border-color .22s,box-shadow .22s;
        }
        .pl-search::placeholder { color:rgba(255,255,255,0.22); }
        .pl-search:focus { border-color:#f97316; box-shadow:0 0 0 3px rgba(249,115,22,0.14); }
        .pl-search-btn {
          background:linear-gradient(135deg,#ea580c,#f97316); color:#fff; border:none;
          border-radius:10px; padding:10px 18px; font-size:13px; font-weight:700;
          font-family:'DM Sans',sans-serif; cursor:pointer;
          transition:transform .2s,box-shadow .2s;
        }
        .pl-search-btn:hover { transform:translateY(-1px); box-shadow:0 5px 14px rgba(234,88,12,0.35); }
        .pl-sort {
          background:rgba(0,0,0,0.30); border:1.5px solid rgba(255,255,255,0.09);
          border-radius:11px; padding:10px 14px; color:#fff;
          font-size:13.5px; font-family:'DM Sans',sans-serif; outline:none; cursor:pointer;
          transition:border-color .22s;
        }
        .pl-sort:focus { border-color:#f97316; }
        .pl-sort option { background:#1e293b; }
        .pl-view-toggle { display:flex; gap:6px; }
        .pl-view-btn {
          width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09);
          color:rgba(255,255,255,0.40); cursor:pointer; transition:background .2s,border-color .2s,color .2s;
        }
        .pl-view-btn.active {
          background:rgba(249,115,22,0.14); border-color:rgba(249,115,22,0.28); color:#fb923c;
        }

        /* Shipping progress */
        .pl-ship {
          background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.18);
          border-radius:14px; padding:13px 18px; margin-bottom:20px;
        }
        .pl-ship-txt { font-size:13px; font-weight:600; color:rgba(147,197,253,0.90); margin-bottom:7px; }
        .pl-ship-txt span { color:#60a5fa; font-weight:800; }
        .pl-ship-bg  { height:5px; border-radius:999px; background:rgba(255,255,255,0.08); overflow:hidden; }
        .pl-ship-fill{ height:100%; border-radius:999px; background:linear-gradient(90deg,#3b82f6,#60a5fa); transition:width .5s ease; }
        .pl-ship-free{ font-size:13px; font-weight:700; color:#4ade80; display:flex; align-items:center; gap:6px; }

        /* Grid */
        .pl-grid-4 { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:18px; }
        .pl-grid-1 { display:flex; flex-direction:column; gap:12px; }

        /* Empty */
        .pl-empty {
          text-align:center; padding:80px 20px;
          font-size:14px; color:rgba(255,255,255,0.30);
        }
        .pl-empty-icon {
          width:80px; height:80px; border-radius:50%;
          background:rgba(249,115,22,0.07); border:1px solid rgba(249,115,22,0.15);
          display:flex; align-items:center; justify-content:center; margin:0 auto 16px;
          font-size:32px;
        }
      `}</style>

      <div className="pl-page">
        <div className="pl-wrap">

          {/* Header */}
          <div className="pl-hdr">
            <div>
              <p className="pl-eyebrow">Catalogue</p>
              <h1 className="pl-title">Our Products</h1>
              <p className="pl-count">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>

          {/* Controls */}
          <div className="pl-controls">
            <form onSubmit={handleSearch} className="pl-search-wrap">
              <FiSearch size={15} className="pl-search-ico" />
              <input
                className="pl-search"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </form>
            <button className="pl-search-btn" onClick={handleSearch}>Search</button>
            <select className="pl-sort" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="">Sort: Default</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Best Rated</option>
            </select>
            <div className="pl-view-toggle">
              <button className={`pl-view-btn ${viewMode==='grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><FiGrid size={15}/></button>
              <button className={`pl-view-btn ${viewMode==='list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><FiList size={15}/></button>
            </div>
          </div>

          {/* Shipping progress */}
          <div className="pl-ship">
            {progressPct >= 100 ? (
              <p className="pl-ship-free"><FiTruck size={14}/> Free shipping unlocked!</p>
            ) : (
              <>
                <p className="pl-ship-txt">Add <span>{formatPrice(FREE_THRESHOLD - subtotal)}</span> more for free shipping</p>
                <div className="pl-ship-bg"><div className="pl-ship-fill" style={{ width:`${progressPct}%` }} /></div>
              </>
            )}
          </div>

          {/* Grid */}
          {products.length > 0 ? (
            <div className={viewMode === 'grid' ? 'pl-grid-4' : 'pl-grid-1'}>
              {products.map((p, i) => (
                <div key={p._id} style={{ animationDelay:`${i*40}ms` }}>
                  <ProductCard product={p} viewMode={viewMode} />
                </div>
              ))}
            </div>
          ) : (
            <div className="pl-empty">
              <div className="pl-empty-icon">🔍</div>
              No products found
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ProductList;