import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiClock, FiTrendingUp, FiArrowRight, FiArrowUpLeft } from 'react-icons/fi';
import { useDebounce } from '../../hooks/useDebounce';
import { productsAPI } from '../../services/api';
import { getImageUrl } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/helpers';

const TRENDING = [
  'Blanket', 'Bedsheet', 'Quilt', 'Curtains', 'Sofa Cover', 'Pillow Cover', 'Cotton', 'Handmade',
];

const RECENT_KEY = 'gh_recent_searches';

const getRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
};
const addRecent = (query) => {
  try {
    const prev = getRecent().filter((q) => q !== query);
    localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...prev].slice(0, 6)));
  } catch {}
};
const clearRecent = () => {
  try { localStorage.removeItem(RECENT_KEY); } catch {}
};

const SearchBar = ({ onClose }) => {
  const [query, setQuery]             = useState('');
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recent, setRecent]           = useState(getRecent());
  const navigate  = useNavigate();
  const inputRef  = useRef(null);
  const resultsRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  // Auto-focus on open
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // ── Search logic completely unchanged ──
  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }
      setLoading(true);
      try {
        const response = await productsAPI.getAll({ keyword: debouncedQuery, limit: 6 });
        setResults(response.data.products);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    searchProducts();
  }, [debouncedQuery]);

  // ── All handlers completely unchanged ──
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      addRecent(query.trim());
      setRecent(getRecent());
      navigate(`/products?keyword=${encodeURIComponent(query)}`);
      setShowResults(false);
      if (onClose) onClose();
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    setShowResults(false);
    if (onClose) onClose();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleTrendingClick = (term) => {
    setQuery(term);
    addRecent(term);
    setRecent(getRecent());
    navigate(`/products?keyword=${encodeURIComponent(term)}`);
    if (onClose) onClose();
  };

  const handleRecentClick = (term) => {
    setQuery(term);
    addRecent(term);
    setRecent(getRecent());
    navigate(`/products?keyword=${encodeURIComponent(term)}`);
    if (onClose) onClose();
  };

  const handleClearRecent = (e) => {
    e.stopPropagation();
    clearRecent();
    setRecent([]);
  };

  const isEmpty = query.trim().length === 0;
  const noResults = showResults && !loading && results.length === 0 && query.trim().length >= 2;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .sb-wrap {
          font-family: 'DM Sans', sans-serif;
          width: 100%;
        }

        /* ── INPUT ── */
        .sb-form { position: relative; margin-bottom: 0; }
        .sb-input-wrap {
          position: relative;
          display: flex; align-items: center;
        }
        .sb-search-ico {
          position: absolute; left: 18px;
          color: rgba(255,255,255,0.35);
          transition: color 0.2s ease;
          pointer-events: none;
          z-index: 1;
        }
        .sb-input-wrap:focus-within .sb-search-ico { color: #ea580c; }

        .sb-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.10);
          border-radius: 14px;
          padding: 15px 52px 15px 52px;
          color: #fff;
          font-size: 16px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          outline: none;
          transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
          letter-spacing: 0.01em;
        }
        .sb-input::placeholder { color: rgba(255,255,255,0.28); font-weight: 400; }
        .sb-input:focus {
          border-color: #ea580c;
          background: rgba(234,88,12,0.06);
          box-shadow: 0 0 0 3px rgba(234,88,12,0.14), 0 2px 20px rgba(234,88,12,0.10);
        }

        .sb-right-icons {
          position: absolute; right: 14px;
          display: flex; align-items: center; gap: 6px;
        }
        .sb-clear-btn {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.10);
          border: none; color: rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.18s, color 0.18s, transform 0.18s;
        }
        .sb-clear-btn:hover { background: rgba(234,88,12,0.20); color: #fb923c; transform: scale(1.1); }

        .sb-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(234,88,12,0.22);
          border-top-color: #ea580c;
          animation: sbSpin 0.7s linear infinite;
        }
        @keyframes sbSpin { to { transform: rotate(360deg); } }

        /* ── PANEL (below input) ── */
        .sb-panel {
          margin-top: 12px;
          animation: sbPanelIn 0.22s ease both;
        }
        @keyframes sbPanelIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* Section headers */
        .sb-sec-title {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 11px; font-weight: 700;
          color: rgba(255,255,255,0.32);
          text-transform: uppercase; letter-spacing: 0.12em;
          margin-bottom: 10px; padding: 0 2px;
        }
        .sb-sec-clear {
          font-size: 11px; font-weight: 600;
          color: #ea580c; cursor: pointer; background: none; border: none;
          transition: color 0.18s;
        }
        .sb-sec-clear:hover { color: #fdba74; }

        /* Recent searches */
        .sb-recent { margin-bottom: 22px; }
        .sb-recent-list { display: flex; flex-direction: column; gap: 2px; }
        .sb-recent-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          cursor: pointer; background: transparent; border: none;
          text-align: left; width: 100%;
          transition: background 0.18s;
          color: rgba(255,255,255,0.70);
          font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
        }
        .sb-recent-item:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        .sb-recent-ico { color: rgba(255,255,255,0.28); flex-shrink: 0; }
        .sb-recent-fill { flex: 1; }
        .sb-recent-arrow { color: rgba(255,255,255,0.18); transition: color 0.18s, transform 0.18s; }
        .sb-recent-item:hover .sb-recent-arrow { color: #ea580c; transform: translate(2px,-2px); }

        /* Trending */
        .sb-trending { margin-bottom: 22px; }
        .sb-trending-pills {
          display: flex; flex-wrap: wrap; gap: 8px;
        }
        .sb-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 999px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.60);
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; border: none;
          transition: background 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .sb-pill:hover {
          background: rgba(234,88,12,0.14);
          color: #fb923c;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(234,88,12,0.18);
          border: none;
        }

        /* Divider */
        .sb-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 18px 0;
        }

        /* Live results */
        .sb-results { }
        .sb-result-item {
          display: flex; align-items: center; gap: 14px;
          padding: 10px 12px; border-radius: 12px;
          cursor: pointer; background: transparent; border: none;
          text-align: left; width: 100%;
          transition: background 0.18s, transform 0.18s;
          margin-bottom: 4px;
          animation: sbResultIn 0.3s ease both;
        }
        .sb-result-item:nth-child(1) { animation-delay: 0.04s; }
        .sb-result-item:nth-child(2) { animation-delay: 0.08s; }
        .sb-result-item:nth-child(3) { animation-delay: 0.12s; }
        .sb-result-item:nth-child(4) { animation-delay: 0.16s; }
        .sb-result-item:nth-child(5) { animation-delay: 0.20s; }
        .sb-result-item:nth-child(6) { animation-delay: 0.24s; }
        @keyframes sbResultIn {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .sb-result-item:hover {
          background: rgba(255,255,255,0.055);
          transform: translateX(3px);
        }
        .sb-result-img {
          width: 52px; height: 52px; border-radius: 10px;
          object-fit: cover; flex-shrink: 0;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .sb-result-name {
          font-size: 14px; font-weight: 600;
          color: #f1f5f9;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 3px;
          transition: color 0.18s;
        }
        .sb-result-item:hover .sb-result-name { color: #fb923c; }
        .sb-result-cat {
          font-size: 11.5px; color: rgba(255,255,255,0.35);
          margin-bottom: 3px;
        }
        .sb-result-price {
          font-size: 13px; font-weight: 700;
          background: linear-gradient(90deg, #fb923c, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sb-result-body { flex: 1; min-width: 0; }

        /* See all */
        .sb-see-all {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; padding: 12px;
          background: rgba(234,88,12,0.08);
          border: 1px solid rgba(234,88,12,0.18);
          border-radius: 11px;
          color: #fb923c; font-size: 13.5px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          margin-top: 8px;
        }
        .sb-see-all:hover { background: rgba(234,88,12,0.14); transform: translateY(-1px); }

        /* Empty + No results */
        .sb-empty {
          text-align: center; padding: 28px 16px;
          color: rgba(255,255,255,0.28);
          font-size: 14px; line-height: 1.6;
        }
        .sb-empty-icon {
          font-size: 32px; margin-bottom: 10px; display: block;
          animation: sbBounce 2s ease-in-out infinite;
        }
        @keyframes sbBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        .sb-no-results {
          text-align: center; padding: 24px 16px;
        }
        .sb-no-results-title {
          font-size: 15px; font-weight: 600; color: #f1f5f9;
          margin-bottom: 6px;
        }
        .sb-no-results-sub {
          font-size: 13px; color: rgba(255,255,255,0.35);
          margin-bottom: 16px;
        }
        .sb-no-results-pills {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 7px;
        }
      `}</style>

      <div className="sb-wrap">
        {/* ── INPUT ── */}
        <form onSubmit={handleSearch} className="sb-form">
          <div className="sb-input-wrap">
            <FiSearch size={18} className="sb-search-ico" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search handloom products..."
              className="sb-input"
              autoComplete="off"
            />
            <div className="sb-right-icons">
              {loading && <div className="sb-spinner" />}
              {query && (
                <button type="button" onClick={handleClear} className="sb-clear-btn">
                  <FiX size={13} />
                </button>
              )}
            </div>
          </div>
        </form>

        {/* ── PANEL ── */}
        <div className="sb-panel">

          {/* EMPTY STATE — no query typed yet */}
          {isEmpty && (
            <>
              {/* Recent Searches */}
              {recent.length > 0 && (
                <div className="sb-recent">
                  <div className="sb-sec-title">
                    <span>Recent Searches</span>
                    <button className="sb-sec-clear" onClick={handleClearRecent}>Clear</button>
                  </div>
                  <div className="sb-recent-list">
                    {recent.map((term, i) => (
                      <button key={i} className="sb-recent-item" onClick={() => handleRecentClick(term)}>
                        <FiClock size={14} className="sb-recent-ico" />
                        <span className="sb-recent-fill">{term}</span>
                        <FiArrowUpLeft size={13} className="sb-recent-arrow" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider only if recent exists */}
              {recent.length > 0 && <div className="sb-divider" />}

              {/* Trending */}
              <div className="sb-trending">
                <div className="sb-sec-title">
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <FiTrendingUp size={11} /> Trending Searches
                  </span>
                </div>
                <div className="sb-trending-pills">
                  {TRENDING.map((term, i) => (
                    <button key={i} className="sb-pill" onClick={() => handleTrendingClick(term)}>
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start typing hint */}
              {recent.length === 0 && (
                <div className="sb-empty">
                  <span className="sb-empty-icon">🔍</span>
                  Start typing to discover handloom products
                </div>
              )}
            </>
          )}

          {/* TYPING — show live results */}
          {!isEmpty && (
            <>
              {/* Results */}
              {results.length > 0 && (
                <div className="sb-results">
                  <div className="sb-sec-title" style={{ marginBottom: 10 }}>
                    <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
                  </div>
                  {results.map((product) => (
                    <button
                      key={product._id}
                      className="sb-result-item"
                      onClick={() => handleProductClick(product._id)}
                    >
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="sb-result-img"
                      />
                      <div className="sb-result-body">
                        <p className="sb-result-name">{product.name}</p>
                        <p className="sb-result-cat">{product.category?.name || 'Handloom'}</p>
                        <p className="sb-result-price">{formatPrice(product.price)}</p>
                      </div>
                      <FiArrowRight size={14} style={{ color:'rgba(255,255,255,0.20)', flexShrink:0 }} />
                    </button>
                  ))}

                  {/* See all */}
                  <button className="sb-see-all" onClick={handleSearch}>
                    <FiSearch size={14} />
                    See all results for "{query}"
                    <FiArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* No results */}
              {noResults && (
                <div className="sb-no-results">
                  <p className="sb-no-results-title">No results for "{query}"</p>
                  <p className="sb-no-results-sub">Try one of these popular searches</p>
                  <div className="sb-no-results-pills">
                    {TRENDING.slice(0, 5).map((term, i) => (
                      <button key={i} className="sb-pill" onClick={() => handleTrendingClick(term)}>
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && results.length === 0 && (
                <div style={{ padding:'12px 0' }}>
                  {[1,2,3].map((i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', gap:14,
                      padding:'10px 12px', borderRadius:12, marginBottom:4,
                    }}>
                      <div style={{ width:52, height:52, borderRadius:10, background:'rgba(255,255,255,0.07)', animation:'sbPulse 1.4s ease infinite', animationDelay:`${i*0.15}s` }} />
                      <div style={{ flex:1 }}>
                        <div style={{ height:13, borderRadius:6, background:'rgba(255,255,255,0.07)', marginBottom:7, width:'65%', animation:'sbPulse 1.4s ease infinite' }} />
                        <div style={{ height:11, borderRadius:6, background:'rgba(255,255,255,0.05)', width:'40%', animation:'sbPulse 1.4s ease infinite', animationDelay:'0.2s' }} />
                      </div>
                    </div>
                  ))}
                  <style>{`@keyframes sbPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchBar;