// frontend/src/components/user/ChangePasswordModal.jsx
import React, { useState, useEffect } from 'react';
import { FiLock, FiEye, FiEyeOff, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { userAPI } from '../../services/api';

const ChangePasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({
    current: false,
    newPwd:  false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  // ── Disable body scroll + ESC key handler ──
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      await userAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword:     formData.newPassword,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .cpw-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: cpwBgIn 0.22s ease both;
        }
        @keyframes cpwBgIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .cpw-modal {
          width: 100%;
          max-width: 460px;
          background: rgba(10, 16, 30, 0.97);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 24px;
          padding: 34px 32px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(234, 88, 12, 0.12),
            0 32px 80px rgba(0, 0, 0, 0.70),
            inset 0 1px 0 rgba(255, 255, 255, 0.07);
          animation: cpwCardIn 0.30s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes cpwCardIn {
          from { opacity: 0; transform: scale(0.90) translateY(-16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }

        /* Top accent line — orange glow */
        .cpw-modal::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #ea580c, #f97316, #c084fc, transparent);
          border-radius: 24px 24px 0 0;
        }

        /* Ambient corner glow */
        .cpw-modal::after {
          content: '';
          position: absolute; z-index: 0;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%);
          top: -80px; right: -60px; pointer-events: none;
        }

        /* ── HEADER ── */
        .cpw-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 26px; position: relative; z-index: 1;
        }
        .cpw-header-left { display: flex; align-items: center; gap: 14px; }
        .cpw-header-icon {
          width: 46px; height: 46px; border-radius: 13px;
          background: rgba(234, 88, 12, 0.12);
          border: 1px solid rgba(234, 88, 12, 0.28);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 18px rgba(234, 88, 12, 0.15);
        }
        .cpw-title {
          font-family: 'Playfair Display', serif;
          font-size: 21px; font-weight: 800; color: #fff;
          line-height: 1.1; margin-bottom: 3px;
        }
        .cpw-sub { font-size: 12.5px; color: rgba(255, 255, 255, 0.35); }
        .cpw-close {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: rgba(255, 255, 255, 0.42);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: background .2s, color .2s, transform .2s, border-color .2s;
        }
        .cpw-close:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.28);
          color: #f87171;
          transform: scale(1.08);
        }

        /* ── SUCCESS ── */
        .cpw-success {
          display: flex; align-items: center; gap: 11px;
          background: rgba(74, 222, 128, 0.10);
          border: 1px solid rgba(74, 222, 128, 0.24);
          border-radius: 13px; padding: 16px 18px;
          font-size: 14px; font-weight: 600; color: #4ade80;
          position: relative; z-index: 1;
          animation: cpwFadeIn .3s ease;
        }
        .cpw-success-icon {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(74, 222, 128, 0.14);
          border: 1px solid rgba(74, 222, 128, 0.25);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── ERROR ── */
        .cpw-error {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(239, 68, 68, 0.09);
          border: 1px solid rgba(239, 68, 68, 0.22);
          border-radius: 12px; padding: 13px 15px; margin-bottom: 20px;
          font-size: 13.5px; color: #fca5a5; line-height: 1.55;
          position: relative; z-index: 1;
          animation: cpwFadeIn .25s ease;
        }
        @keyframes cpwFadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── FIELDS ── */
        .cpw-field {
          margin-bottom: 18px;
          position: relative; z-index: 1;
        }
        .cpw-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 800;
          color: rgba(255, 255, 255, 0.38);
          text-transform: uppercase; letter-spacing: .10em;
          margin-bottom: 8px;
        }
        .cpw-input-wrap { position: relative; }
        .cpw-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.32);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 13px 46px 13px 16px;
          color: #f1f5f9;
          font-size: 14.5px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color .22s, background .22s, box-shadow .22s;
          box-sizing: border-box;
        }
        .cpw-input::placeholder { color: rgba(255, 255, 255, 0.18); }
        .cpw-input:hover:not(:focus):not(:disabled) {
          border-color: rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.40);
        }
        .cpw-input:focus {
          border-color: #ea580c;
          background: rgba(234, 88, 12, 0.06);
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.13), 0 2px 12px rgba(234, 88, 12, 0.08);
        }
        .cpw-input:disabled { opacity: .50; cursor: not-allowed; }
        .cpw-eye {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: rgba(255, 255, 255, 0.28);
          cursor: pointer; display: flex; align-items: center;
          padding: 4px; transition: color .2s;
        }
        .cpw-eye:hover { color: rgba(255, 255, 255, 0.65); }

        /* ── DIVIDER ── */
        .cpw-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.07);
          margin: 22px 0;
          position: relative; z-index: 1;
        }

        /* ── BUTTONS ── */
        .cpw-btn-row {
          display: flex; gap: 12px;
          position: relative; z-index: 1;
        }
        .cpw-submit {
          flex: 1.4;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none; border-radius: 13px;
          padding: 14px; font-size: 14.5px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform .22s, box-shadow .22s, filter .22s;
          box-shadow: 0 5px 18px rgba(234, 88, 12, 0.32);
          position: relative; overflow: hidden;
        }
        .cpw-submit::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #f97316, #ea580c);
          opacity: 0; transition: opacity .22s;
        }
        .cpw-submit:hover:not(:disabled)::after { opacity: 1; }
        .cpw-submit:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 28px rgba(234, 88, 12, 0.50);
        }
        .cpw-submit:active:not(:disabled) { transform: scale(0.98); }
        .cpw-submit:disabled { opacity: .48; cursor: not-allowed; transform: none; }
        .cpw-submit-inner { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; }

        .cpw-cancel {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.09);
          color: rgba(255, 255, 255, 0.55);
          border-radius: 13px; padding: 14px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background .2s, border-color .2s, color .2s, transform .2s;
        }
        .cpw-cancel:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.18);
          color: #fff;
          transform: translateY(-1px);
        }
        .cpw-cancel:disabled { opacity: .45; cursor: not-allowed; }

        .cpw-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2.5px solid rgba(255, 255, 255, 0.25);
          border-top-color: #fff;
          animation: cpwSpin .7s linear infinite; flex-shrink: 0;
        }
        @keyframes cpwSpin { to { transform: rotate(360deg); } }

        /* ── MOBILE ── */
        @media (max-width: 480px) {
          .cpw-modal  { padding: 26px 20px; border-radius: 20px; }
          .cpw-btn-row { flex-direction: column-reverse; }
          .cpw-submit, .cpw-cancel { flex: unset; }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="cpw-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="cpw-modal">

          {/* Header */}
          <div className="cpw-header">
            <div className="cpw-header-left">
              <div className="cpw-header-icon">
                <FiLock size={20} color="#f97316" />
              </div>
              <div>
                <p className="cpw-title">Change Password</p>
                <p className="cpw-sub">Update your account password securely</p>
              </div>
            </div>
            <button className="cpw-close" onClick={onClose} aria-label="Close">
              <FiX size={16} />
            </button>
          </div>

          {/* Success state */}
          {success ? (
            <div className="cpw-success">
              <div className="cpw-success-icon">
                <FiCheck size={17} color="#4ade80" />
              </div>
              Password updated successfully! Closing...
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>

              {/* Error banner */}
              {error && (
                <div className="cpw-error">
                  <FiAlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  {error}
                </div>
              )}

              {/* Current Password */}
              <div className="cpw-field">
                <label className="cpw-label">
                  <FiLock size={11} /> Current Password
                </label>
                <div className="cpw-input-wrap">
                  <input
                    type={show.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="cpw-input"
                    placeholder="Enter your current password"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="cpw-eye"
                    onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                    tabIndex={-1}
                  >
                    {show.current ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="cpw-field">
                <label className="cpw-label">
                  <FiLock size={11} /> New Password
                </label>
                <div className="cpw-input-wrap">
                  <input
                    type={show.newPwd ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="cpw-input"
                    placeholder="Minimum 6 characters"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="cpw-eye"
                    onClick={() => setShow((s) => ({ ...s, newPwd: !s.newPwd }))}
                    tabIndex={-1}
                  >
                    {show.newPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="cpw-field">
                <label className="cpw-label">
                  <FiLock size={11} /> Confirm New Password
                </label>
                <div className="cpw-input-wrap">
                  <input
                    type={show.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="cpw-input"
                    placeholder="Re-enter new password"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="cpw-eye"
                    onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                    tabIndex={-1}
                  >
                    {show.confirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div className="cpw-divider" />

              {/* Buttons */}
              <div className="cpw-btn-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="cpw-submit"
                >
                  {loading ? (
                    <span className="cpw-submit-inner">
                      <div className="cpw-spinner" /> Updating...
                    </span>
                  ) : (
                    <span className="cpw-submit-inner">
                      <FiCheck size={15} /> Update Password
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className="cpw-cancel"
                  onClick={onClose}
                  disabled={loading}
                >
                  <FiX size={14} /> Cancel
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </>
  );
};

export default ChangePasswordModal;