import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const FEATURES = [
  { icon: '🧵', text: 'Premium handmade products' },
  { icon: '🚚', text: 'Fast & reliable delivery' },
  { icon: '⭐', text: 'Trusted by thousands of customers' },
];

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setNeedsVerification(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setNeedsVerification(false);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        if (result.requiresVerification) {
          setNeedsVerification(true);
          setUserEmail(result.email || formData.email);
          setError(result.message || 'Please verify your email before logging in.');
        } else {
          setError(result.message || 'Invalid email or password.');
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .si-page {
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: row;
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        /* LEFT */
        .si-left {
          width: 50%;
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 52px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .si-bg {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=85');
          background-size: cover;
          background-position: center;
          animation: zoomBg 22s ease-in-out infinite alternate;
        }
        @keyframes zoomBg {
          from { transform: scale(1); }
          to   { transform: scale(1.06); }
        }
        .si-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(148deg, rgba(20,8,0,0.75) 0%, rgba(28,10,0,0.70) 45%, rgba(8,5,18,0.88) 100%);
        }
        .si-orb1 {
          position: absolute;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(234,88,12,0.2) 0%, transparent 70%);
          top: -100px; left: -100px;
          animation: orbF 9s ease-in-out infinite;
        }
        .si-orb2 {
          position: absolute;
          width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 70%);
          bottom: -60px; right: -60px;
          animation: orbF 12s ease-in-out infinite reverse;
        }
        @keyframes orbF {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(16px,-16px) scale(1.08); }
        }
        .si-lc {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 400px;
        }
        .si-brand {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 36px;
        }
        .si-brand-ico {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #ea580c, #c2410c);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          box-shadow: 0 8px 22px rgba(234,88,12,0.38);
          flex-shrink: 0;
        }
        .si-brand-lbl {
          color: #fb923c;
          font-size: 12.5px; font-weight: 600;
          letter-spacing: 0.13em; text-transform: uppercase;
        }
        .si-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 2.8vw, 42px);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 14px;
        }
        .si-h1-acc {
          background: linear-gradient(90deg, #fb923c, #ea580c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .si-sub {
          color: rgba(255,255,255,0.46);
          font-size: 14.5px; line-height: 1.68;
          margin-bottom: 34px;
        }
        .si-feats { display: flex; flex-direction: column; gap: 9px; }
        .si-feat {
          display: flex; align-items: center; gap: 11px;
          padding: 11px 15px;
          background: rgba(255,255,255,0.048);
          border: 1px solid rgba(255,255,255,0.085);
          border-radius: 11px;
          backdrop-filter: blur(6px);
          transition: background 0.24s, border-color 0.24s, transform 0.24s;
          animation: featIn 0.55s ease both;
          opacity: 0; transform: translateX(-14px);
          cursor: default;
        }
        .si-feat:nth-child(1){animation-delay:0.28s}
        .si-feat:nth-child(2){animation-delay:0.44s}
        .si-feat:nth-child(3){animation-delay:0.60s}
        @keyframes featIn { to { opacity:1; transform:translateX(0); } }
        .si-feat:hover {
          background: rgba(234,88,12,0.13);
          border-color: rgba(234,88,12,0.3);
          transform: translateX(5px);
        }
        .si-feat-ico { font-size: 17px; flex-shrink: 0; }
        .si-feat-txt { color: rgba(255,255,255,0.76); font-size: 13px; font-weight: 500; }
        .si-quote {
          margin-top: 34px;
          color: rgba(255,255,255,0.18);
          font-size: 11.5px; font-style: italic; letter-spacing: 0.03em;
        }

        /* RIGHT */
        .si-right {
          width: 50%;
          min-height: 100vh;
          background: #0d0d0d;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 44px;
          flex-shrink: 0;
        }
        .si-card {
          width: 100%; max-width: 410px;
          background: rgba(255,255,255,0.032);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px;
          padding: 38px 36px;
          backdrop-filter: blur(24px);
          box-shadow: 0 28px 65px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.065);
          animation: cardIn 0.42s ease both;
          opacity: 0; transform: translateY(16px);
        }
        @keyframes cardIn { to { opacity:1; transform:translateY(0); } }

        .si-ttl {
          font-family: 'Playfair Display', serif;
          font-size: 27px; font-weight: 700;
          color: #fff; margin-bottom: 5px;
        }
        .si-desc { font-size: 13px; color: rgba(255,255,255,0.36); margin-bottom: 26px; }

        .si-err {
          background: rgba(239,68,68,0.088);
          border: 1px solid rgba(239,68,68,0.26);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px; color: #fca5a5;
          margin-bottom: 18px;
          animation: errShake 0.28s ease;
        }
        @keyframes errShake {
          0%,100%{transform:translateX(0)}30%{transform:translateX(-5px)}70%{transform:translateX(5px)}
        }

        .si-fld { margin-bottom: 16px; }
        .si-lbl {
          display: block;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.5);
          margin-bottom: 7px; letter-spacing: 0.02em;
        }
        .si-iw { position: relative; }
        .si-inp {
          width: 100%;
          background: rgba(255,255,255,0.042);
          border: 1.5px solid rgba(255,255,255,0.085);
          border-radius: 10px;
          padding: 12px 14px 12px 40px;
          color: #fff; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color .22s, background .22s, box-shadow .22s;
        }
        .si-inp::placeholder { color: rgba(255,255,255,0.2); }
        .si-inp:hover:not(:focus) {
          border-color: rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.06);
        }
        .si-inp:focus {
          border-color: #ea580c;
          background: rgba(234,88,12,0.052);
          box-shadow: 0 0 0 3px rgba(234,88,12,0.13);
        }
        .si-inp-pr { padding-right: 40px; }
        .si-ico {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.26);
          width: 16px; height: 16px;
          pointer-events: none;
          transition: color .2s;
        }
        .si-iw:focus-within .si-ico { color: #ea580c; }
        .si-eye-btn {
          position: absolute; right: 11px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: rgba(255,255,255,0.26);
          cursor: pointer; display: flex; align-items: center;
          padding: 2px; transition: color .2s;
        }
        .si-eye-btn:hover { color: rgba(255,255,255,0.58); }

        .si-row-mid {
          display: flex; align-items: center; justify-content: space-between;
          margin: 6px 0 20px;
        }
        .si-rem { display: flex; align-items: center; gap: 7px; cursor: pointer; }
        .si-rem input { accent-color: #ea580c; width: 13px; height: 13px; cursor: pointer; }
        .si-rem span { font-size: 12.5px; color: rgba(255,255,255,0.42); user-select: none; }
        .si-frg {
          font-size: 12.5px; font-weight: 500;
          color: #fb923c; text-decoration: none;
          transition: color .2s;
        }
        .si-frg:hover { color: #fdba74; }

        .si-btn {
          width: 100%;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none; border-radius: 10px;
          padding: 13px;
          font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: transform .22s, box-shadow .22s;
          position: relative; overflow: hidden;
        }
        .si-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #f97316, #ea580c);
          opacity: 0; transition: opacity .22s;
        }
        .si-btn:hover:not(:disabled)::after { opacity: 1; }
        .si-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(234,88,12,0.36);
        }
        .si-btn:active:not(:disabled) { transform: translateY(0); }
        .si-btn:disabled { opacity: 0.44; cursor: not-allowed; }
        .si-btn-in { position: relative; z-index: 1; display: flex; align-items: center; gap: 7px; }

        .si-div {
          display: flex; align-items: center; gap: 11px;
          margin: 20px 0;
        }
        .si-dline { flex: 1; height: 1px; background: rgba(255,255,255,0.075); }
        .si-dtxt { font-size: 11px; color: rgba(255,255,255,0.26); letter-spacing: 0.1em; }

        .si-soc {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          padding: 11px 14px; border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.085);
          background: rgba(255,255,255,0.022);
          color: rgba(255,255,255,0.62);
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background .2s, border-color .2s, transform .2s;
          margin-bottom: 9px;
        }
        .si-soc:last-child { margin-bottom: 0; }
        .si-soc:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(255,255,255,0.16);
          transform: translateY(-1px);
        }

        .si-ft {
          margin-top: 22px; text-align: center;
          font-size: 13px; color: rgba(255,255,255,0.3);
        }
        .si-ft a { color: #fb923c; font-weight: 600; text-decoration: none; transition: color .2s; }
        .si-ft a:hover { color: #fdba74; }

        /* Responsive */
        @media (max-width: 768px) {
          .si-page { flex-direction: column; }
          .si-left  { width: 100%; min-height: auto; padding: 32px 22px; }
          .si-right { width: 100%; min-height: auto; padding: 32px 18px; }
          .si-feats, .si-quote { display: none; }
          .si-card  { padding: 26px 20px; border-radius: 18px; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .si-left  { padding: 36px 32px; }
          .si-right { padding: 36px 26px; }
        }
      `}</style>

      <div className="si-page">

        {/* LEFT */}
        <div className="si-left">
          <div className="si-bg" />
          <div className="si-overlay" />
          <div className="si-orb1" />
          <div className="si-orb2" />
          <div className="si-lc">
            <div className="si-brand">
              <div className="si-brand-ico">🕉️</div>
              <span className="si-brand-lbl">Ganpati Handloom</span>
            </div>
            <h1 className="si-h1">
              Welcome to<br />
              <span className="si-h1-acc">Ganpati</span> Handloom
            </h1>
            <p className="si-sub">Experience authentic handcrafted products from the heart of India</p>
            <div className="si-feats">
              {FEATURES.map((f, i) => (
                <div key={i} className="si-feat">
                  <span className="si-feat-ico">{f.icon}</span>
                  <span className="si-feat-txt">{f.text}</span>
                </div>
              ))}
            </div>
            <p className="si-quote">"Shubharambh with Ganpati Handloom"</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="si-right">
          <div className="si-card">
            <h2 className="si-ttl">Sign In</h2>
            <p className="si-desc">Enter your credentials to access your account</p>

            {error && (
              <div className="si-err">
                <p>{error}</p>
                {needsVerification && (
                  <Link to="/resend-verification" state={{ email: userEmail }}
                    style={{ display:'inline-flex', alignItems:'center', gap:4, color:'#fb923c', fontWeight:600, marginTop:8, fontSize:12 }}>
                    📧 Resend verification email →
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="si-fld">
                <label htmlFor="si-email" className="si-lbl">Email Address</label>
                <div className="si-iw">
                  <FiMail className="si-ico" />
                  <input id="si-email" name="email" type="email" required
                    value={formData.email} onChange={handleChange}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')}
                    className="si-inp" placeholder="you@example.com" disabled={loading} />
                </div>
              </div>

              <div className="si-fld">
                <label htmlFor="si-password" className="si-lbl">Password</label>
                <div className="si-iw">
                  <FiLock className="si-ico" />
                  <input id="si-password" name="password"
                    type={showPassword ? 'text' : 'password'} required
                    value={formData.password} onChange={handleChange}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')}
                    className="si-inp si-inp-pr" placeholder="••••••••" disabled={loading} />
                  <button type="button" className="si-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div className="si-row-mid">
                <label className="si-rem">
                  <input type="checkbox" id="remember-me" name="remember-me" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="si-frg">Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading} className="si-btn">
                {loading ? (
                  <span className="si-btn-in">
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="si-btn-in">Sign In <FiArrowRight size={15} /></span>
                )}
              </button>
            </form>

            <div className="si-div">
              <div className="si-dline" /><span className="si-dtxt">OR</span><div className="si-dline" />
            </div>

            <button type="button" className="si-soc">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button type="button" className="si-soc">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </button>

            <p className="si-ft">
              Don't have an account? <Link to="/signup">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;