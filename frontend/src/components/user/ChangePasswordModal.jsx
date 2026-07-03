import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
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

  // Disable body scroll + ESC key
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      await userAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword:     formData.newPassword,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    // Only close if the overlay itself is clicked — not children
    if (e.target === e.currentTarget) onClose();
  };

  const modalContent = (
    <div
      style={{
        // ── Portal root styles — these bypass ALL stacking contexts ──
        position:        'fixed',
        inset:           0,
        zIndex:          999999,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.80)',
        backdropFilter:  'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation:       'cpwOverlayIn 0.22s ease both',
      }}
      onClick={handleOverlayClick}
    >
      <style>{`
        @keyframes cpwOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cpwModalIn {
          from { opacity: 0; transform: scale(0.88) translateY(-20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes cpwFadeUp {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cpwSpin {
          to { transform: rotate(360deg); }
        }

        .cpw-modal-box {
          width: 100%;
          max-width: 460px;
          background: linear-gradient(145deg, rgba(13,20,40,0.98), rgba(8,14,30,0.99));
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 24px;
          padding: 34px 32px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(234,88,12,0.14),
            0 40px 100px rgba(0,0,0,0.75),
            inset 0 1px 0 rgba(255,255,255,0.08);
          animation: cpwModalIn 0.30s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        /* Top orange glow line */
        .cpw-modal-box::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #ea580c, #f97316, rgba(192,132,252,0.6), transparent);
          border-radius: 24px 24px 0 0;
        }

        /* Ambient top-right glow */
        .cpw-modal-box::after {
          content: '';
          position: absolute; top: -80px; right: -60px;
          width: 240px; height: 240px; border-radius: 50%;
          background: radial-gradient(circle, rgba(234,88,12,0.09) 0%, transparent 70%);
          pointer-events: none;
        }

        .cpw-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 26px; position: relative; z-index: 1;
        }
        .cpw-header-left { display: flex; align-items: center; gap: 14px; }
        .cpw-icon-wrap {
          width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
          background: rgba(234,88,12,0.12);
          border: 1px solid rgba(234,88,12,0.28);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(234,88,12,0.15);
        }
        .cpw-title {
          font-family: 'Playfair Display', serif;
          font-size: 21px; font-weight: 800; color: #fff;
          margin-bottom: 2px; line-height: 1.1;
        }
        .cpw-subtitle { font-size: 12.5px; color: rgba(255,255,255,0.35); }
        .cpw-close-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.40);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
        }
        .cpw-close-btn:hover {
          background: rgba(239,68,68,0.16);
          border-color: rgba(239,68,68,0.30);
          color: #f87171;
          transform: scale(1.08);
        }

        /* Success */
        .cpw-success-box {
          display: flex; align-items: center; gap: 12px;
          background: rgba(74,222,128,0.10);
          border: 1px solid rgba(74,222,128,0.25);
          border-radius: 14px; padding: 16px 18px;
          position: relative; z-index: 1;
          animation: cpwFadeUp 0.3s ease;
        }
        .cpw-success-ico {
          width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
          background: rgba(74,222,128,0.14);
          border: 1px solid rgba(74,222,128,0.26);
          display: flex; align-items: center; justify-content: center;
        }
        .cpw-success-text {
          font-size: 14px; font-weight: 600; color: #4ade80; line-height: 1.4;
        }

        /* Error */
        .cpw-error-box {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(239,68,68,0.09);
          border: 1px solid rgba(239,68,68,0.24);
          border-radius: 12px; padding: 13px 15px; margin-bottom: 20px;
          font-size: 13.5px; color: #fca5a5; line-height: 1.55;
          position: relative; z-index: 1;
          animation: cpwFadeUp 0.25s ease;
        }

        /* Field */
        .cpw-field {
          margin-bottom: 18px;
          position: relative; z-index: 1;
        }
        .cpw-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 10.5px; font-weight: 800;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase; letter-spacing: 0.10em;
          margin-bottom: 8px;
        }
        .cpw-input-wrap { position: relative; }
        .cpw-input {
          width: 100%; box-sizing: border-box;
          background: rgba(0,0,0,0.35);
          border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 13px 46px 13px 16px;
          color: #f1f5f9;
          font-size: 14.5px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
        }
        .cpw-input::placeholder { color: rgba(255,255,255,0.18); }
        .cpw-input:hover:not(:focus):not(:disabled) {
          border-color: rgba(255,255,255,0.16);
          background: rgba(0,0,0,0.42);
        }
        .cpw-input:focus {
          border-color: #ea580c;
          background: rgba(234,88,12,0.06);
          box-shadow: 0 0 0 3px rgba(234,88,12,0.14);
        }
        .cpw-input:disabled { opacity: 0.50; cursor: not-allowed; }
        .cpw-eye-btn {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none;
          color: rgba(255,255,255,0.28);
          cursor: pointer; display: flex; align-items: center; padding: 4px;
          transition: color 0.2s;
        }
        .cpw-eye-btn:hover { color: rgba(255,255,255,0.68); }

        /* Divider */
        .cpw-divider {
          height: 1px; background: rgba(255,255,255,0.07);
          margin: 22px 0; position: relative; z-index: 1;
        }

        /* Buttons */
        .cpw-btn-row {
          display: flex; gap: 12px;
          position: relative; z-index: 1;
        }
        .cpw-btn-submit {
          flex: 1.4;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none; border-radius: 13px;
          padding: 14px; font-size: 14.5px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform 0.22s, box-shadow 0.22s, filter 0.22s;
          box-shadow: 0 5px 18px rgba(234,88,12,0.32);
          position: relative; overflow: hidden;
        }
        .cpw-btn-submit::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #f97316, #ea580c);
          opacity: 0; transition: opacity 0.22s;
        }
        .cpw-btn-submit:hover:not(:disabled)::after { opacity: 1; }
        .cpw-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 28px rgba(234,88,12,0.50);
          filter: brightness(1.06);
        }
        .cpw-btn-submit:active:not(:disabled) { transform: scale(0.98); }
        .cpw-btn-submit:disabled { opacity: 0.46; cursor: not-allowed; transform: none; filter: none; }
        .cpw-btn-submit-inner { position: relative; z-index: 1; display: flex; align-items: center; gap: 8px; }

        .cpw-btn-cancel {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.55);
          border-radius: 13px; padding: 14px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
        }
        .cpw-btn-cancel:hover:not(:disabled) {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.18);
          color: #fff; transform: translateY(-1px);
        }
        .cpw-btn-cancel:disabled { opacity: 0.44; cursor: not-allowed; }

        .cpw-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.22);
          border-top-color: #fff;
          animation: cpwSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .cpw-modal-box  { padding: 26px 18px; border-radius: 20px; }
          .cpw-btn-row    { flex-direction: column-reverse; }
          .cpw-btn-submit,
          .cpw-btn-cancel { flex: unset; }
        }
      `}</style>

      {/* Modal box — stopPropagation prevents overlay click closing when clicking inside */}
      <div
        className="cpw-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cpw-header">
          <div className="cpw-header-left">
            <div className="cpw-icon-wrap">
              <FiLock size={20} color="#f97316" />
            </div>
            <div>
              <p className="cpw-title">Change Password</p>
              <p className="cpw-subtitle">Update your account password securely</p>
            </div>
          </div>
          <button
            className="cpw-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Success */}
        {success ? (
          <div className="cpw-success-box">
            <div className="cpw-success-ico">
              <FiCheck size={18} color="#4ade80" />
            </div>
            <div>
              <p className="cpw-success-text">Password updated successfully!</p>
              <p style={{ fontSize: 12.5, color: 'rgba(74,222,128,0.60)', marginTop: 3 }}>Closing in a moment...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>

            {/* Error */}
            {error && (
              <div className="cpw-error-box">
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
                  className="cpw-eye-btn"
                  onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                  tabIndex={-1}
                  aria-label="Toggle current password visibility"
                >
                  {show.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
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
                  className="cpw-eye-btn"
                  onClick={() => setShow((s) => ({ ...s, newPwd: !s.newPwd }))}
                  tabIndex={-1}
                  aria-label="Toggle new password visibility"
                >
                  {show.newPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
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
                  className="cpw-eye-btn"
                  onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                  tabIndex={-1}
                  aria-label="Toggle confirm password visibility"
                >
                  {show.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="cpw-divider" />

            {/* Buttons */}
            <div className="cpw-btn-row">
              <button
                type="submit"
                disabled={loading}
                className="cpw-btn-submit"
              >
                {loading ? (
                  <span className="cpw-btn-submit-inner">
                    <div className="cpw-spinner" />
                    Updating...
                  </span>
                ) : (
                  <span className="cpw-btn-submit-inner">
                    <FiCheck size={15} /> Update Password
                  </span>
                )}
              </button>
              <button
                type="button"
                className="cpw-btn-cancel"
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
  );

  // ── React Portal: renders directly into document.body ──
  // This completely bypasses backdrop-filter/transform stacking contexts
  return ReactDOM.createPortal(modalContent, document.body);
};

export default ChangePasswordModal;