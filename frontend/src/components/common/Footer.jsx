import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiHeart, FiArrowRight, FiShield, FiTruck, FiSend } from 'react-icons/fi';

const Footer = () => {
  const [email, setEmail]       = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3500);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        /* ── ROOT ── */
        .footer-root {
          background:
            radial-gradient(circle at 20% 0%, rgba(249,115,22,0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 100%, rgba(139,92,246,0.04) 0%, transparent 50%),
            linear-gradient(180deg, #0d1117 0%, #060a10 60%, #020508 100%);
          border-top: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.55);
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        /* Subtle grid texture */
        .footer-root::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.012'%3E%3Crect x='0' y='0' width='1' height='40'/%3E%3Crect x='20' y='0' width='1' height='40'/%3E%3Crect x='0' y='0' width='40' height='1'/%3E%3Crect x='0' y='20' width='40' height='1'/%3E%3C/g%3E%3C/svg%3E");
        }

        /* ── NEWSLETTER SECTION ── */
        .footer-newsletter {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
          padding: 48px 24px 0;
        }
        .footer-nl-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px; padding: 36px 40px;
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 28px;
          backdrop-filter: blur(16px);
        }
        .footer-nl-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #f97316, #ea580c, transparent);
          border-radius: 22px 22px 0 0;
        }
        /* Ambient glow */
        .footer-nl-card::after {
          content: ''; position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%);
          pointer-events: none;
        }
        .footer-nl-eyebrow {
          font-size: 11px; font-weight: 700; color: #f97316;
          letter-spacing: .15em; text-transform: uppercase;
          margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
        }
        .footer-nl-eyebrow::before { content: ''; display: inline-block; width: 18px; height: 1.5px; background: #f97316; }
        .footer-nl-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(20px, 2.5vw, 28px); font-weight: 800; color: #fff;
          margin-bottom: 6px;
        }
        .footer-nl-sub { font-size: 14px; color: rgba(255,255,255,0.40); line-height: 1.6; }
        .footer-nl-form {
          display: flex; gap: 10px; flex-wrap: wrap;
          min-width: 300px; flex: 1; max-width: 440px;
          position: relative; z-index: 1;
        }
        .footer-nl-input {
          flex: 1; min-width: 180px;
          background: rgba(0,0,0,0.30); border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 11px; padding: 12px 16px; color: #fff;
          font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color .22s, box-shadow .22s;
        }
        .footer-nl-input::placeholder { color: rgba(255,255,255,0.22); }
        .footer-nl-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.13); }
        .footer-nl-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none; border-radius: 11px;
          padding: 12px 22px; font-size: 14px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform .22s, box-shadow .22s, filter .22s;
          box-shadow: 0 4px 16px rgba(234,88,12,0.30); white-space: nowrap;
        }
        .footer-nl-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 8px 24px rgba(234,88,12,0.46); filter: brightness(1.08); }
        .footer-nl-success {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 600; color: #4ade80;
          background: rgba(74,222,128,0.10); border: 1px solid rgba(74,222,128,0.22);
          border-radius: 11px; padding: 12px 18px;
          animation: nlSuccessIn 0.3s ease;
        }
        @keyframes nlSuccessIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

        /* ── TRUST BADGES ── */
        .footer-trust {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto; padding: 32px 24px 0;
        }
        .footer-trust-inner {
          display: flex; align-items: center; justify-content: center;
          flex-wrap: wrap; gap: 12px;
          padding: 18px 24px; border-radius: 14px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .footer-trust-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 99px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.55);
          transition: border-color .2s, color .2s;
        }
        .footer-trust-badge:hover { border-color: rgba(249,115,22,0.28); color: #fb923c; }
        .footer-trust-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.08); }
        @media (max-width: 480px) { .footer-trust-sep { display: none; } }

        /* ── MAIN GRID ── */
        .footer-main {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
          padding: 44px 24px 0;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1.2fr;
          gap: 40px; margin-bottom: 44px;
        }
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }

        /* Brand col */
        .footer-brand-name {
          font-size: 18px; font-weight: 700;
          background: linear-gradient(90deg, #f97316, #ea580c);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          display: inline-block;
        }
        .footer-tagline {
          font-size: 13px; color: rgba(255,255,255,0.38);
          line-height: 1.70; margin: 10px 0 16px; max-width: 230px;
        }
        .footer-tagline-quote {
          font-size: 11.5px; color: rgba(255,255,255,0.20);
          font-style: italic; margin-top: 12px;
        }

        /* Social icons */
        .footer-socials { display: flex; gap: 10px; margin-top: 18px; }
        .footer-social-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.45); text-decoration: none;
          transition: all 0.22s ease; font-size: 15px;
        }
        .footer-social-btn:hover {
          transform: translateY(-3px) scale(1.10);
          background: rgba(249,115,22,0.12);
          border-color: rgba(249,115,22,0.28);
          color: #fb923c;
          box-shadow: 0 6px 18px rgba(249,115,22,0.22);
        }

        /* Column titles */
        .footer-col-title {
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.80);
          letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 18px;
          display: flex; align-items: center; gap: 8px;
        }
        .footer-col-title::before {
          content: ''; display: inline-block; width: 16px; height: 2px;
          background: linear-gradient(90deg, #f97316, transparent); border-radius: 2px;
        }

        /* Links */
        .footer-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 13.5px; color: rgba(255,255,255,0.42);
          text-decoration: none; margin-bottom: 11px;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .footer-link .fl-arrow { opacity: 0; transition: opacity .2s, transform .2s; }
        .footer-link:hover { color: #fb923c; transform: translateX(4px); }
        .footer-link:hover .fl-arrow { opacity: 1; transform: translateX(2px); }

        /* Contact rows */
        .footer-contact-row {
          display: flex; align-items: flex-start; gap: 10px;
          margin-bottom: 12px; font-size: 13px; color: rgba(255,255,255,0.40);
        }
        .footer-contact-icon {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: rgba(249,115,22,0.10); border: 1px solid rgba(249,115,22,0.18);
          display: flex; align-items: center; justify-content: center;
          margin-top: -2px;
        }

        /* ── DIVIDER ── */
        .footer-divider {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto; padding: 0 24px;
        }
        .footer-divider hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* ── BOTTOM ── */
        .footer-bottom {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
          padding: 20px 24px 28px;
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .footer-copy { font-size: 12.5px; color: rgba(255,255,255,0.25); }
        .footer-made {
          font-size: 12px; color: rgba(255,255,255,0.20);
          display: flex; align-items: center; gap: 4px;
        }
        .footer-bottom-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .footer-bottom-link {
          font-size: 12px; color: rgba(255,255,255,0.25);
          text-decoration: none; transition: color .2s;
        }
        .footer-bottom-link:hover { color: #fb923c; }
      `}</style>

      <footer className="footer-root">

        {/* ── NEWSLETTER ── */}
        <div className="footer-newsletter">
          <div className="footer-nl-card">
            <div>
              <p className="footer-nl-eyebrow">Stay Updated</p>
              <h3 className="footer-nl-title">Get Exclusive Offers</h3>
              <p className="footer-nl-sub">Subscribe for handloom stories, new arrivals & special discounts.</p>
            </div>
            {subscribed ? (
              <div className="footer-nl-success">
                ✓ You're subscribed! Welcome to the family.
              </div>
            ) : (
              <form className="footer-nl-form" onSubmit={handleSubscribe}>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="footer-nl-input" placeholder="Enter your email address"
                  required
                />
                <button type="submit" className="footer-nl-btn">
                  <FiSend size={14} /> Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── TRUST BADGES ── */}
        <div className="footer-trust">
          <div className="footer-trust-inner">
            <span className="footer-trust-badge">
              <FiShield size={13} style={{ color:'#4ade80' }} /> Secure Payment
            </span>
            <div className="footer-trust-sep" />
            <span className="footer-trust-badge">
              <FiTruck size={13} style={{ color:'#60a5fa' }} /> Fast Delivery
            </span>
            <div className="footer-trust-sep" />
            <span className="footer-trust-badge">
              <span style={{ fontSize:13 }}>🇮🇳</span> Made in India
            </span>
            <div className="footer-trust-sep" />
            <span className="footer-trust-badge">
              <span style={{ fontSize:13 }}>🧵</span> 100% Handmade
            </span>
            <div className="footer-trust-sep" />
            <span className="footer-trust-badge">
              <span style={{ fontSize:13 }}>♻️</span> Eco-Friendly
            </span>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="footer-main">
          <div className="footer-grid">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize:26, filter:'drop-shadow(0 0 6px rgba(249,115,22,0.35))' }}>🕉️</span>
                <span className="footer-brand-name">Ganpati Handloom</span>
              </div>
              <p className="footer-tagline">
                Authentic handloom products crafted with love by skilled artisans from across India.
              </p>
              <p className="footer-tagline-quote">"Shubharambh with Ganpati Handloom"</p>

              {/* Social icons */}
              <div className="footer-socials">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Twitter / X">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p className="footer-col-title">Quick Links</p>
              <Link to="/products"    className="footer-link">Products    <FiArrowRight size={11} className="fl-arrow" /></Link>
              <Link to="/collections" className="footer-link">Collections <FiArrowRight size={11} className="fl-arrow" /></Link>
              <Link to="/about"       className="footer-link">About Us    <FiArrowRight size={11} className="fl-arrow" /></Link>
              <Link to="/contact"     className="footer-link">Contact     <FiArrowRight size={11} className="fl-arrow" /></Link>
            </div>

            {/* Customer Service */}
            <div>
              <p className="footer-col-title">Customer Service</p>
              <Link to="/orders"   className="footer-link">Track Order <FiArrowRight size={11} className="fl-arrow" /></Link>
              <Link to="/faq"      className="footer-link">FAQ         <FiArrowRight size={11} className="fl-arrow" /></Link>
              <Link to="/services" className="footer-link">Services    <FiArrowRight size={11} className="fl-arrow" /></Link>
            </div>

            {/* Contact */}
            <div>
              <p className="footer-col-title">Contact</p>
              <div className="footer-contact-row">
                <span className="footer-contact-icon"><FiMapPin size={13} color="#f97316" /></span>
                <span>Greater Noida, UP, India</span>
              </div>
              <div className="footer-contact-row">
                <span className="footer-contact-icon"><FiPhone size={13} color="#f97316" /></span>
                <span>+91 98765 43210</span>
              </div>
              <div className="footer-contact-row">
                <span className="footer-contact-icon"><FiMail size={13} color="#f97316" /></span>
                <span>info@ganpatihandloom.com</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="footer-divider"><hr /></div>

        {/* ── BOTTOM ── */}
        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} Ganpati Handloom. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy"  className="footer-bottom-link">Privacy Policy</Link>
            <Link to="/terms"    className="footer-bottom-link">Terms & Conditions</Link>
            <Link to="/refunds"  className="footer-bottom-link">Refund Policy</Link>
          </div>
          <p className="footer-made">Made with <FiHeart size={11} style={{ color:'#ea580c' }} /> in India</p>
        </div>

      </footer>
    </>
  );
};

export default Footer;