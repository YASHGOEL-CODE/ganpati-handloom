import React, { useState, useEffect, useRef } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiCheck } from 'react-icons/fi';

const useScrollGlow = () => {
  const ref = useRef(null);
  const [state, setState] = useState('hidden');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setState('visible');
        else setState(entry.boundingClientRect.top < 0 ? 'past' : 'hidden');
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, state];
};

const GlowSection = ({ children, delay = 0, className = '', style = {} }) => {
  const [ref, state] = useScrollGlow();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        opacity:   state === 'visible' ? 1 : 0,
        transform: state === 'hidden' ? 'translateY(36px)' : state === 'past' ? 'translateY(-14px)' : 'translateY(0)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const CONTACT_INFO = [
  { icon: FiMapPin, label: 'Visit Us',        color: '#ea580c', bg: 'rgba(234,88,12,0.12)',  border: 'rgba(234,88,12,0.22)',  lines: ['123 Handloom Street', 'Textile City, India - 110001'] },
  { icon: FiPhone,  label: 'Call Us',         color: '#059669', bg: 'rgba(5,150,105,0.12)', border: 'rgba(5,150,105,0.22)', lines: ['+91 98765 43210', '+91 98765 43211'] },
  { icon: FiMail,   label: 'Email Us',        color: '#d97706', bg: 'rgba(217,119,6,0.12)', border: 'rgba(217,119,6,0.22)', lines: ['info@ganpatihandloom.com', 'support@ganpatihandloom.com'] },
  { icon: FiClock,  label: 'Business Hours',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',border: 'rgba(59,130,246,0.22)',lines: ['Monday - Saturday', '9:00 AM - 7:00 PM IST'] },
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [focused, setFocused]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        /* ── PAGE — updated to match design system ── */
        .ct-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 10%, rgba(249,115,22,0.07) 0%, transparent 55%),
            radial-gradient(circle at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 55%),
            linear-gradient(160deg, #0f172a 0%, #000000 50%, #020617 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 0 0 100px;
          overflow-x: hidden;
        }

        /* ── HERO — completely unchanged ── */
        .ct-hero {
          position: relative; text-align: center;
          padding: 100px 24px 80px; overflow: hidden;
        }
        .ct-hero::before {
          content: ''; position: absolute; z-index: 2;
          width: 650px; height: 650px; border-radius: 50%;
          background: radial-gradient(circle, rgba(234,88,12,0.13) 0%, transparent 70%);
          top: -180px; left: 50%; transform: translateX(-50%);
          pointer-events: none; animation: ctOrb 7s ease-in-out infinite alternate;
        }
        @keyframes ctOrb {
          from { transform: translateX(-50%) scale(1); }
          to   { transform: translateX(-50%) scale(1.12); }
        }
        .ct-hero-om {
          display: inline-flex; align-items: center; justify-content: center;
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          font-size: 20px; box-shadow: 0 0 40px rgba(234,88,12,0.45);
          margin-bottom: 28px; animation: omFloat 4s ease-in-out infinite;
        }
        @keyframes omFloat {
          0%,100% { transform: translateY(0); box-shadow: 0 0 40px rgba(234,88,12,0.45); }
          50%      { transform: translateY(-8px); box-shadow: 0 12px 50px rgba(234,88,12,0.60); }
        }
        .ct-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11.5px; font-weight: 700; color: #ea580c;
          letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 16px;
        }
        .ct-hero-eyebrow::before, .ct-hero-eyebrow::after {
          content: ''; display: inline-block; width: 20px; height: 1.5px; background: #ea580c;
        }
        .ct-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 5vw, 62px); font-weight: 800; color: #fff;
          line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 16px;
          animation: ctTitleIn 0.9s ease both;
        }
        @keyframes ctTitleIn {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .ct-hero-sub {
          font-size: clamp(15px, 2vw, 18px); color: rgba(255,255,255,0.48);
          max-width: 480px; margin: 0 auto; line-height: 1.7;
          animation: ctTitleIn 0.9s ease 0.2s both;
        }
        .ct-hero-line {
          width: 60px; height: 3px; border-radius: 3px;
          background: linear-gradient(90deg, transparent, #ea580c, transparent);
          margin: 22px auto 0; animation: ctTitleIn 0.9s ease 0.35s both;
        }

        /* ── WRAP ── */
        .ct-wrap { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
        @media (max-width: 640px) { .ct-wrap { padding: 0 16px; } }

        /* ── MAIN GRID ── */
        .ct-grid { display: grid; grid-template-columns: 1fr 1.7fr; gap: 24px; margin-bottom: 0; }
        @media (max-width: 900px) { .ct-grid { grid-template-columns: 1fr; } }

        /* ── INFO SIDEBAR ── */
        .ct-info-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px; padding: 32px 26px;
          display: flex; flex-direction: column; gap: 6px;
          height: fit-content; position: sticky; top: 88px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        }
        @media (max-width: 900px) { .ct-info-card { position: static; } }
        .ct-info-header { margin-bottom: 20px; }
        .ct-info-eyebrow {
          font-size: 10.5px; font-weight: 700; color: #f97316;
          letter-spacing: 0.15em; text-transform: uppercase;
          margin-bottom: 6px; display: flex; align-items: center; gap: 6px;
        }
        .ct-info-eyebrow::before { content: ''; display: inline-block; width: 14px; height: 1.5px; background: #f97316; }
        .ct-info-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #f1f5f9; }

        .ct-info-item {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 16px 14px; border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          transition: transform 0.26s ease, background 0.26s ease, border-color 0.26s ease;
          cursor: default; margin-bottom: 10px;
        }
        .ct-info-item:last-child { margin-bottom: 0; }
        .ct-info-item:hover { transform: translateX(5px); background: rgba(255,255,255,0.055); }
        .ct-info-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform 0.26s ease; }
        .ct-info-item:hover .ct-info-icon { transform: scale(1.12) rotate(-6deg); }
        .ct-info-label { font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 5px; }
        .ct-info-text  { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.65; }

        /* ── FORM CARD ── */
        .ct-form-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px; padding: 38px 36px;
          position: relative; overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        }
        .ct-form-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #f97316, #ea580c, transparent);
          border-radius: 22px 22px 0 0;
        }
        @media (max-width: 640px) { .ct-form-card { padding: 26px 20px; } }
        .ct-form-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
        .ct-form-sub   { font-size: 13.5px; color: rgba(255,255,255,0.38); margin-bottom: 30px; }

        /* Success banner */
        .ct-success {
          display: flex; align-items: center; gap: 12px;
          background: rgba(34,197,94,0.10); border: 1px solid rgba(34,197,94,0.25);
          border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;
          animation: ctTitleIn 0.4s ease;
        }
        .ct-success-ico { width: 32px; height: 32px; border-radius: 50%; background: rgba(34,197,94,0.18); border: 1px solid rgba(34,197,94,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ct-success-txt { font-size: 13.5px; font-weight: 500; color: #4ade80; line-height: 1.5; }

        /* Form fields */
        .ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
        @media (max-width: 580px) { .ct-row { grid-template-columns: 1fr; gap: 14px; } }
        .ct-field { margin-bottom: 18px; }
        .ct-field:last-child { margin-bottom: 0; }
        .ct-label { display: block; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.48); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px; }

        .ct-input, .ct-select, .ct-textarea {
          width: 100%; background: rgba(0,0,0,0.28); border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 11px; padding: 13px 16px; color: #fff;
          font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
        }
        .ct-input::placeholder, .ct-textarea::placeholder { color: rgba(255,255,255,0.22); }
        .ct-select { appearance: none; cursor: pointer; }
        .ct-select option { background: #1e293b; color: #fff; }
        .ct-textarea { resize: none; }
        .ct-input:hover:not(:focus), .ct-select:hover:not(:focus), .ct-textarea:hover:not(:focus) { border-color: rgba(255,255,255,0.18); background: rgba(0,0,0,0.35); }
        .ct-input:focus, .ct-select:focus, .ct-textarea:focus { border-color: #f97316; background: rgba(249,115,22,0.05); box-shadow: 0 0 0 3px rgba(249,115,22,0.13), 0 2px 12px rgba(249,115,22,0.08); }

        /* Submit button */
        .ct-submit {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 9px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none; border-radius: 12px; padding: 15px 24px;
          font-size: 15px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          cursor: pointer; letter-spacing: 0.02em;
          transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
          box-shadow: 0 6px 22px rgba(234,88,12,0.30); position: relative; overflow: hidden; margin-top: 6px;
        }
        .ct-submit::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, #f97316, #ea580c); opacity: 0; transition: opacity 0.22s; }
        .ct-submit:hover:not(:disabled)::after { opacity: 1; }
        .ct-submit:hover:not(:disabled) { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 32px rgba(234,88,12,0.46); filter: brightness(1.07); }
        .ct-submit:active:not(:disabled) { transform: scale(0.99); }
        .ct-submit:disabled { opacity: 0.48; cursor: not-allowed; }
        .ct-submit-inner { position: relative; z-index: 1; display: flex; align-items: center; gap: 9px; }

        /* ── FAQ STRIP ── */
        .ct-faq-section { margin-top: 72px; }
        .ct-faq-header  { text-align: center; margin-bottom: 36px; }
        .ct-faq-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; color: #f97316;
          letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 10px;
        }
        .ct-faq-eyebrow::before, .ct-faq-eyebrow::after { content: ''; display: inline-block; width: 16px; height: 1.5px; background: #f97316; }
        .ct-faq-title { font-family: 'Playfair Display', serif; font-size: clamp(22px, 3vw, 32px); font-weight: 700; color: #f1f5f9; }
        .ct-faq-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .ct-faq-card {
          background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 22px 20px;
          transition: transform 0.26s ease, box-shadow 0.26s ease, border-color 0.26s ease;
          cursor: default; position: relative; overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .ct-faq-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #f97316, transparent); border-radius: 16px 16px 0 0; opacity: 0; transition: opacity 0.26s; }
        .ct-faq-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.30), 0 0 0 1px rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.20); }
        .ct-faq-card:hover::before { opacity: 1; }
        .ct-faq-q { font-size: 14px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; line-height: 1.4; }
        .ct-faq-a { font-size: 13px; color: rgba(255,255,255,0.42); line-height: 1.65; }
      `}</style>

      <div className="ct-page">

        {/* ── HERO — completely unchanged ── */}
        <div className="ct-hero">
          <div className="ct-hero-om">✉️</div>
          <p className="ct-hero-eyebrow">Contact Us</p>
          <h1 className="ct-hero-title">Get In Touch</h1>
          <p className="ct-hero-sub">We'd love to hear from you. Reach out to us anytime!</p>
          <div className="ct-hero-line" />
        </div>

        {/* ── BODY ── */}
        <div className="ct-wrap">

          <GlowSection delay={0}>
            <div className="ct-grid">

              {/* INFO SIDEBAR */}
              <GlowSection delay={80}>
                <div className="ct-info-card">
                  <div className="ct-info-header">
                    <p className="ct-info-eyebrow">Reach Out</p>
                    <h2 className="ct-info-title">Contact Details</h2>
                  </div>
                  {CONTACT_INFO.map((info, i) => {
                    const Icon = info.icon;
                    return (
                      <div key={i} className="ct-info-item" style={{ borderColor: info.border }}>
                        <div className="ct-info-icon" style={{ background: info.bg, border: `1px solid ${info.border}` }}>
                          <Icon size={20} color={info.color} strokeWidth={2} />
                        </div>
                        <div>
                          <p className="ct-info-label">{info.label}</p>
                          {info.lines.map((line, j) => (
                            <p key={j} className="ct-info-text">{line}</p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlowSection>

              {/* FORM */}
              <GlowSection delay={160}>
                <div className="ct-form-card">
                  <h2 className="ct-form-title">Send Us a Message</h2>
                  <p className="ct-form-sub">Fill in the form and we'll respond within 24 hours</p>

                  {success && (
                    <div className="ct-success">
                      <div className="ct-success-ico"><FiCheck size={16} color="#4ade80" /></div>
                      <p className="ct-success-txt">Thank you for contacting us! We'll get back to you soon.</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="ct-row">
                      <div>
                        <label className="ct-label">Your Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="ct-input" placeholder="John Doe" onFocus={() => setFocused('name')} onBlur={() => setFocused('')} />
                      </div>
                      <div>
                        <label className="ct-label">Email Address *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="ct-input" placeholder="you@example.com" onFocus={() => setFocused('email')} onBlur={() => setFocused('')} />
                      </div>
                    </div>
                    <div className="ct-row">
                      <div>
                        <label className="ct-label">Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="ct-input" placeholder="+91 98765 43210" onFocus={() => setFocused('phone')} onBlur={() => setFocused('')} />
                      </div>
                      <div>
                        <label className="ct-label">Subject *</label>
                        <select name="subject" value={formData.subject} onChange={handleChange} required className="ct-select" onFocus={() => setFocused('subject')} onBlur={() => setFocused('')}>
                          <option value="">Select a subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="product">Product Question</option>
                          <option value="custom">Custom Order</option>
                          <option value="bulk">Bulk Order</option>
                          <option value="complaint">Complaint</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="ct-field">
                      <label className="ct-label">Your Message *</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} required rows="6" className="ct-textarea" placeholder="Tell us how we can help you..." onFocus={() => setFocused('message')} onBlur={() => setFocused('')} />
                    </div>
                    <button type="submit" disabled={loading} className="ct-submit">
                      {loading ? (
                        <span className="ct-submit-inner">
                          <svg className="animate-spin" width="17" height="17" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="ct-submit-inner"><FiSend size={17} /> Send Message</span>
                      )}
                    </button>
                  </form>
                </div>
              </GlowSection>
            </div>
          </GlowSection>

          {/* ── FAQ STRIP ── */}
          <GlowSection delay={0} className="ct-faq-section">
            <div className="ct-faq-header">
              <p className="ct-faq-eyebrow">Quick Answers</p>
              <h2 className="ct-faq-title">Frequently Asked Questions</h2>
            </div>
            <div className="ct-faq-grid">
              {[
                { q: 'How long does delivery take?',  a: 'Standard delivery takes 5–7 business days. Express delivery is available in 2–3 days.' },
                { q: 'Can I place a custom order?',   a: 'Yes! We accept custom orders for bulk quantities. Contact us with your requirements.' },
                { q: 'What is your return policy?',   a: 'We offer a 7-day hassle-free return policy on all products. No questions asked.' },
                { q: 'Do you ship internationally?',  a: 'Currently we ship across India. International shipping is coming soon.' },
              ].map((faq, i) => (
                <GlowSection key={i} delay={i * 80}>
                  <div className="ct-faq-card" style={{ height: '100%' }}>
                    <p className="ct-faq-q">{faq.q}</p>
                    <p className="ct-faq-a">{faq.a}</p>
                  </div>
                </GlowSection>
              ))}
            </div>
          </GlowSection>

        </div>
      </div>
    </>
  );
};

export default Contact;