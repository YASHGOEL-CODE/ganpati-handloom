// frontend/src/components/user/ChangePasswordModal.jsx
import React, { useState } from 'react';
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
    newPwd: false,
    confirm: false,
  });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validations
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
      // Close modal after 2 seconds on success
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
        .cpw-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: cpwBgIn 0.22s ease;
        }
        @keyframes cpwBgIn { from{opacity:0} to{opacity:1} }

        .cpw-modal {
          width: 100%; max-width: 440px;
          background: rgba(13,20,38,0.97);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 22px;
          padding: 32px 30px;
          position: relative; overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06);
          animation: cpwCardIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes cpwCardIn {
          from { opacity:0; transform:scale(0.93) translateY(-12px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        .cpw-modal::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, transparent);
          border-radius: 22px 22px 0 0;
        }

        .cpw-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .cpw-header-left { display: flex; align-items: center; gap: 12px; }
        .cpw-header-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: rgba(99,102,241,0.14);
          border: 1px solid rgba(99,102,241,0.25);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cpw-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #f1f5f9;
        }
        .cpw-sub { font-size: 12.5px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .cpw-close {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.45);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s, color .2s, transform .2s;
          flex-shrink: 0;
        }
        .cpw-close:hover { background: rgba(239,68,68,0.15); color: #f87171; transform: scale(1.08); }

        .cpw-success {
          display: flex; align-items: center; gap: 10px;
          background: rgba(74,222,128,0.10); border: 1px solid rgba(74,222,128,0.22);
          border-radius: 12px; padding: 14px 16px;
          font-size: 14px; font-weight: 600; color: #4ade80;
          animation: cpwFadeIn .3s ease;
        }
        .cpw-error {
          display: flex; align-items: flex-start; gap: 9px;
          background: rgba(239,68,68,0.09); border: 1px solid rgba(239,68,68,0.22);
          border-radius: 12px; padding: 12px 14px; margin-bottom: 18px;
          font-size: 13.5px; color: #fca5a5; line-height: 1.5;
          animation: cpwFadeIn .25s ease;
        }
        @keyframes cpwFadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

        .cpw-field { margin-bottom: 18px; }
        .cpw-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 11.5px; font-weight: 700;
          color: rgba(255,255,255,0.40);
          text-transform: uppercase; letter-spacing: .09em;
          margin-bottom: 8px;
        }
        .cpw-input-wrap { position: relative; }
        .cpw-input {
          width: 100%;
          background: rgba(0,0,0,0.30);
          border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 12px 44px 12px 16px;
          color: #f1f5f9; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color .22s, background .22s, box-shadow .22s;
          box-sizing: border-box;
        }
        .cpw-input::placeholder { color: rgba(255,255,255,0.20); }
        .cpw-input:hover:not(:focus) {
          border-color: rgba(255,255,255,0.16);
          background: rgba(0,0,0,0.38);
        }
        .cpw-input:focus {
          border-color: #6366f1;
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.14);
        }
        .cpw-eye {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: rgba(255,255,255,0.30);
          cursor: pointer; display: flex; align-items: center;
          padding: 2px; transition: color .2s;
        }
        .cpw-eye:hover { color: rgba(255,255,255,0.65); }

        .cpw-btn-row { display: flex; gap: 11px; margin-top: 6px; }
        .cpw-submit {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; border: none; border-radius: 12px;
          padding: 13px; font-size: 14px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform .22s, box-shadow .22s, filter .22s;
          box-shadow: 0 4px 16px rgba(99,102,241,0.30);
        }
        .cpw-submit:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(99,102,241,0.48);
          filter: brightness(1.08);
        }
        .cpw-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .cpw-cancel {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.60);
          border-radius: 12px; padding: 13px;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background .2s, border-color .2s, color .2s;
        }
        .cpw-cancel:hover { background: rgba(255,255,255,0.10); border-color: rgba(255,255,255,0.20); color: #fff; }

        .cpw-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          animation: cpwSpin .7s linear infinite; flex-shrink: 0;
        }
        @keyframes cpwSpin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .cpw-modal { padding: 24px 18px; border-radius: 18px; }
          .cpw-btn-row { flex-direction: column; }
        }
      `}</style>

      {/* Overlay — click outside to close */}
      <div
        className="cpw-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="cpw-modal">

          {/* Header */}
          <div className="cpw-header">
            <div className="cpw-header-left">
              <div className="cpw-header-icon">
                <FiLock size={18} color="#818cf8" />
              </div>
              <div>
                <p className="cpw-title">Change Password</p>
                <p className="cpw-sub">Update your account password</p>
              </div>
            </div>
            <button className="cpw-close" onClick={onClose}>
              <FiX size={15} />
            </button>
          </div>

          {/* Success state */}
          {success ? (
            <div className="cpw-success">
              <FiCheck size={18} />
              Password updated successfully! Closing...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              {/* Error */}
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
                    placeholder="Enter current password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="cpw-eye"
                    onClick={() => setShow({ ...show, current: !show.current })}
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
                    placeholder="Min 6 characters"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="cpw-eye"
                    onClick={() => setShow({ ...show, newPwd: !show.newPwd })}
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
                  />
                  <button
                    type="button"
                    className="cpw-eye"
                    onClick={() => setShow({ ...show, confirm: !show.confirm })}
                  >
                    {show.confirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="cpw-btn-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="cpw-submit"
                >
                  {loading ? (
                    <><div className="cpw-spinner" /> Updating...</>
                  ) : (
                    <><FiCheck size={15} /> Update Password</>
                  )}
                </button>
                <button
                  type="button"
                  className="cpw-cancel"
                  onClick={onClose}
                  disabled={loading}
                >
                  <FiX size={15} /> Cancel
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