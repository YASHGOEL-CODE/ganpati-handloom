import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import SearchBar from './SearchBar';
import {
  FiShoppingCart, FiHeart, FiMenu, FiX, FiSearch,
  FiLogOut, FiSettings, FiPackage, FiChevronDown,
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  console.log('Navbar: Current user:', user);
  const { cart }     = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const navigate     = useNavigate();
  const location     = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [scrolled,       setScrolled]       = useState(false);

  // ── All original effects unchanged ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
    if (searchOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const cartItemsCount     = cart?.items?.length || 0;
  const wishlistItemsCount = wishlist?.products?.length || 0;
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Avatar initials + color
  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };
  const AVATAR_COLORS = ['#ea580c','#7c3aed','#0891b2','#059669','#d97706'];
  const avatarColor = user
    ? AVATAR_COLORS[(user.fullName?.charCodeAt(0) || 0) % AVATAR_COLORS.length]
    : '#ea580c';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .navbar-root {
          position: sticky; top: 0; z-index: 50;
          background: #111827;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: background 0.3s ease, box-shadow 0.3s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .navbar-root.scrolled {
          background: rgba(10,15,30,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 4px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.05);
        }
        .navbar-root::after {
          content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.5) 40%, rgba(234,88,12,0.5) 60%, transparent 100%);
          opacity: 0; transition: opacity 0.3s;
        }
        .navbar-root.scrolled::after { opacity: 1; }

        .nav-link {
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.58); text-decoration: none;
          transition: color 0.2s ease; padding: 6px 4px;
          position: relative; white-space: nowrap;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: -2px; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg, #f97316, #ea580c);
          border-radius: 2px; transition: width 0.22s ease;
        }
        .nav-link:hover, .nav-link.active { color: #fb923c; }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }

        .nav-icon-btn {
          padding: 8px; color: rgba(255,255,255,0.55);
          background: transparent; border: none; border-radius: 10px;
          cursor: pointer; transition: color 0.2s, background 0.2s, transform 0.2s;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; position: relative;
        }
        .nav-icon-btn:hover { color: #fb923c; background: rgba(249,115,22,0.10); transform: scale(1.10); }
        .nav-icon-btn.heart:hover { color: #f87171; background: rgba(248,113,113,0.10); }

        .nav-badge {
          position: absolute; top: -3px; right: -3px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; font-size: 9.5px; font-weight: 800;
          border-radius: 9999px; min-width: 17px; height: 17px;
          display: flex; align-items: center; justify-content: center; padding: 0 3px;
          box-shadow: 0 0 8px rgba(234,88,12,0.55);
          animation: nbPulse 2s ease-in-out infinite;
        }
        .nav-badge.red { background: linear-gradient(135deg,#dc2626,#ef4444); box-shadow: 0 0 8px rgba(220,38,38,0.55); }
        @keyframes nbPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.18)} }

        .nav-user-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 6px 10px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.04);
          cursor: pointer; transition: all 0.2s ease; margin-left: 2px;
          color: inherit; font-family: inherit;
        }
        .nav-user-btn:hover { border-color: rgba(249,115,22,0.30); background: rgba(249,115,22,0.07); }
        .nav-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0;
          box-shadow: 0 0 10px rgba(249,115,22,0.30);
        }
        .nav-user-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75); }
        .nav-chevron { color: rgba(255,255,255,0.35); transition: transform 0.22s ease; }
        .nav-chevron.open { transform: rotate(180deg); }

        .nav-dropdown {
          position: absolute; right: 0; top: calc(100% + 10px); width: 240px;
          background: rgba(15,23,42,0.97); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.09); border-radius: 16px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04);
          padding: 6px 0; animation: dropIn 0.18s ease; overflow: hidden; z-index: 100;
        }
        .nav-dropdown::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #f97316, #ea580c, transparent);
          border-radius: 16px 16px 0 0;
        }
        @keyframes dropIn { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .nav-dropdown-header { padding: 14px 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.07); margin-bottom: 4px; }
        .nav-dropdown-header .dd-name { font-size: 13.5px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .nav-dropdown-header .dd-email { font-size: 11.5px; color: rgba(255,255,255,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
        .nav-dropdown-item {
          display: flex; align-items: center; gap: 11px; padding: 11px 16px;
          font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.65);
          text-decoration: none; background: transparent; border: none; width: 100%;
          cursor: pointer; transition: background 0.18s, color 0.18s, padding-left 0.18s;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-dropdown-item:hover { background: rgba(255,255,255,0.05); color: #fff; padding-left: 20px; }
        .nav-dropdown-item .dd-icon { width: 30px; height: 30px; border-radius: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.18s; }
        .nav-dropdown-item:hover .dd-icon { background: rgba(249,115,22,0.14); }
        .nav-dropdown-item.admin { color: #fb923c; }
        .nav-dropdown-item.admin:hover { background: rgba(249,115,22,0.08); color: #fdba74; }
        .nav-dropdown-item.admin .dd-icon { background: rgba(249,115,22,0.12); }
        .nav-dropdown-item.logout { color: #f87171; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 4px; }
        .nav-dropdown-item.logout:hover { background: rgba(248,113,113,0.07); color: #fca5a5; }
        .nav-dropdown-item.logout .dd-icon { background: rgba(248,113,113,0.10); }

        .nav-signin-btn {
          font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.60);
          text-decoration: none; padding: 8px 14px; border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.08);
          transition: color 0.2s, background 0.2s, border-color 0.2s;
        }
        .nav-signin-btn:hover { color: #fb923c; background: rgba(249,115,22,0.07); border-color: rgba(249,115,22,0.22); }
        .nav-signup-btn {
          font-size: 13.5px; font-weight: 700; color: #fff;
          background: linear-gradient(135deg, #ea580c, #f97316);
          text-decoration: none; padding: 8px 20px; border-radius: 9px;
          transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
          box-shadow: 0 4px 14px rgba(234,88,12,0.30);
        }
        .nav-signup-btn:hover { transform: translateY(-1px) scale(1.03); box-shadow: 0 7px 22px rgba(234,88,12,0.45); filter: brightness(1.08); }

        .nav-mobile {
          background: rgba(10,15,30,0.97); backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.07);
          animation: mobileIn 0.2s ease;
        }
        @keyframes mobileIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .nav-mobile-link {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.60);
          text-decoration: none; padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: color 0.2s, padding-left 0.2s;
        }
        .nav-mobile-link:last-child { border-bottom: none; }
        .nav-mobile-link:hover { color: #fb923c; padding-left: 6px; }
        .nav-mobile-link.active { color: #fb923c; }

        .search-modal-bg {
          position: fixed; inset: 0; background: rgba(0,0,0,0.75);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          z-index: 9999; display: flex; align-items: flex-start; justify-content: center;
          padding: 72px 16px 40px; animation: smBgIn 0.22s ease both;
        }
        @keyframes smBgIn { from{opacity:0} to{opacity:1} }
        .search-modal-card {
          width: 100%; max-width: 680px;
          background: rgba(15,23,42,0.97); border: 1px solid rgba(255,255,255,0.10);
          border-radius: 22px; padding: 22px 24px 20px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06);
          animation: smCardIn 0.26s cubic-bezier(0.34,1.56,0.64,1) both;
          max-height: calc(100vh - 120px); overflow-y: auto; scrollbar-width: none;
          position: relative;
        }
        .search-modal-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #f97316, #ea580c, transparent);
          border-radius: 22px 22px 0 0;
        }
        .search-modal-card::-webkit-scrollbar { display: none; }
        @keyframes smCardIn { from{opacity:0;transform:scale(0.94) translateY(-12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .sm-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.07); }
        .sm-header-left { display:flex; align-items:center; gap:8px; }
        .sm-header-title { font-size:13px; font-weight:700; color:rgba(255,255,255,0.40); text-transform:uppercase; letter-spacing:0.12em; }
        .sm-header-dot { width:6px; height:6px; border-radius:50%; background:#ea580c; animation:smDotPulse 2s ease-in-out infinite; }
        @keyframes smDotPulse { 0%,100%{box-shadow:0 0 0 0 rgba(234,88,12,0.4)} 50%{box-shadow:0 0 0 5px rgba(234,88,12,0)} }
        .sm-close-btn { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.10); color:rgba(255,255,255,0.50); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.18s,color 0.18s,transform 0.18s; }
        .sm-close-btn:hover { background:rgba(234,88,12,0.18); color:#fb923c; transform:scale(1.08); }
        .sm-esc-hint { font-size:11px; color:rgba(255,255,255,0.22); display:flex; align-items:center; gap:4px; }
        .sm-esc-key { display:inline-block; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:4px; padding:1px 5px; font-size:10px; font-weight:600; color:rgba(255,255,255,0.35); }

        #nav-hamburger { display: none !important; }
        @media (max-width: 767px) { #nav-hamburger { display: flex !important; } }
        @media (max-width: 640px) {
          .search-modal-bg { padding: 60px 12px 24px; }
          .search-modal-card { padding: 18px 16px 16px; border-radius: 18px; }
        }
      `}</style>

      <nav className={`navbar-root${scrolled ? ' scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2 group z-50" onClick={() => setMobileMenuOpen(false)}>
              <span className="text-3xl transform group-hover:scale-110 transition-transform duration-200"
                style={{ filter:'drop-shadow(0 0 8px rgba(249,115,22,0.40))' }}>🕉️</span>
              <span className="text-xl font-bold"
                style={{ background:'linear-gradient(90deg,#f97316,#ea580c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Ganpati Handloom
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-7">
              {[
                { to: '/products',    label: 'Products' },
                { to: '/collections', label: 'Collections' },
                { to: '/about',       label: 'About' },
                { to: '/contact',     label: 'Contact' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className={`nav-link${isActive(to) ? ' active' : ''}`}>{label}</Link>
              ))}
            </div>

            {/* RIGHT ICONS */}
            <div className="flex items-center gap-1">

              {/* Search */}
              <button onClick={() => setSearchOpen(true)} className="nav-icon-btn" aria-label="Search">
                <FiSearch size={19} />
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="nav-icon-btn heart relative" aria-label="Wishlist">
                <FiHeart size={19} />
                {wishlistItemsCount > 0 && <span className="nav-badge red">{wishlistItemsCount}</span>}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="nav-icon-btn relative" aria-label="Cart">
                <FiShoppingCart size={19} />
                {cartItemsCount > 0 && <span className="nav-badge">{cartItemsCount}</span>}
              </Link>

              {/* User menu / Auth */}
              {user ? (
                <div className="relative user-menu-container">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="nav-user-btn">
                    <div className="nav-avatar" style={{ background: avatarColor }}>
                      {getInitials(user.fullName || user.name || 'U')}
                    </div>
                    <span className="nav-user-name hidden lg:block">
                      {(user.fullName || user.name || '').split(' ')[0]}
                    </span>
                    <FiChevronDown size={13} className={`nav-chevron${userMenuOpen ? ' open' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="nav-dropdown">
                      <div className="nav-dropdown-header">
                        <p className="dd-name">{user.fullName || user.name}</p>
                        <p className="dd-email">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="nav-dropdown-item">
                        <span className="dd-icon"><FiSettings size={14} /></span>
                        Profile Settings
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="nav-dropdown-item">
                        <span className="dd-icon"><FiPackage size={14} /></span>
                        My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="nav-dropdown-item admin">
                          <span className="dd-icon"><FiSettings size={14} /></span>
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout} className="nav-dropdown-item logout">
                        <span className="dd-icon"><FiLogOut size={14} /></span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2" style={{ marginLeft: 6 }}>
                  <Link to="/signin" className="nav-signin-btn">Sign In</Link>
                  <Link to="/signup" className="nav-signup-btn">Sign Up</Link>
                </div>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="nav-icon-btn"
                style={{ marginLeft: 4, display: 'none' }}
                id="nav-hamburger"
              >
                {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="nav-mobile md:hidden">
            <div className="px-4 py-4">
              {[
                { to: '/products',    label: 'Products' },
                { to: '/collections', label: 'Collections' },
                { to: '/about',       label: 'About' },
                { to: '/contact',     label: 'Contact' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}
                  className={`nav-mobile-link${isActive(to) ? ' active' : ''}`}>
                  {label}
                  {isActive(to) && <span style={{ width:6, height:6, borderRadius:'50%', background:'#f97316', display:'inline-block' }} />}
                </Link>
              ))}
              {!user && (
                <>
                  <Link to="/signin" onClick={() => setMobileMenuOpen(false)} className="nav-mobile-link">Sign In</Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="nav-mobile-link" style={{ color:'#fb923c', fontWeight:600 }}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* SEARCH MODAL — completely unchanged */}
      {searchOpen && (
        <div className="search-modal-bg" onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}>
          <div className="search-modal-card">
            <div className="sm-header">
              <div className="sm-header-left">
                <div className="sm-header-dot" />
                <span className="sm-header-title">Search</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span className="sm-esc-hint hidden md:flex">
                  <span className="sm-esc-key">ESC</span> to close
                </span>
                <button className="sm-close-btn" onClick={() => setSearchOpen(false)}>
                  <FiX size={15} />
                </button>
              </div>
            </div>
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;