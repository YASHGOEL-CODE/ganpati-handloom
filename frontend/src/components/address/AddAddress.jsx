import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressAPI } from '../../services/api';
import MapLocationPicker from './MapLocationPicker';
import { FiMapPin, FiEdit, FiAlertCircle, FiCheck } from 'react-icons/fi';

const AddAddress = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Map, 2: Form, 3: Verify
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Map data
  const [mapLocation, setMapLocation] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    houseStreet: '',
    areaLandmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });

  // Verification state
  const [addressMismatch, setAddressMismatch] = useState(false);
  const [mismatchDetails, setMismatchDetails] = useState([]);

  // ── All handlers completely unchanged ──
  const handleMapLocationSelect = (location) => {
    setMapLocation(location);
    setFormData((prev) => ({
      ...prev,
      houseStreet: location.street || prev.houseStreet,
      areaLandmark: location.area || prev.areaLandmark,
      city: location.city || prev.city,
      state: location.state || prev.state,
      pincode: location.pincode || prev.pincode,
    }));
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinueToForm = () => {
    if (!mapLocation) {
      setError('Please select a location on the map');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleContinueToVerify = () => {
    if (!formData.fullName || !formData.phone || !formData.houseStreet || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill all required fields');
      return;
    }
    const mismatches = [];
    if (mapLocation.city && formData.city.toLowerCase() !== mapLocation.city.toLowerCase()) {
      mismatches.push(`City: Map shows "${mapLocation.city}", you entered "${formData.city}"`);
    }
    if (mapLocation.state && formData.state.toLowerCase() !== mapLocation.state.toLowerCase()) {
      mismatches.push(`State: Map shows "${mapLocation.state}", you entered "${formData.state}"`);
    }
    if (mapLocation.pincode && formData.pincode !== mapLocation.pincode) {
      mismatches.push(`Pincode: Map shows "${mapLocation.pincode}", you entered "${formData.pincode}"`);
    }
    if (mismatches.length > 0) {
      setAddressMismatch(true);
      setMismatchDetails(mismatches);
    } else {
      setAddressMismatch(false);
      setMismatchDetails([]);
    }
    setError('');
    setStep(3);
  };

  const handleSaveAddress = async () => {
    setLoading(true);
    setError('');
    try {
      const addressData = {
        ...formData,
        latitude: mapLocation.latitude,
        longitude: mapLocation.longitude,
        placeId: mapLocation.placeId,
        formattedAddress: mapLocation.formattedAddress,
      };
      await addressAPI.create(addressData);
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/profile?tab=addresses');
      }
    } catch (err) {
      console.error('Save address error:', err);
      setError(err.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .aa-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 10%, rgba(249,115,22,0.07) 0%, transparent 55%),
            radial-gradient(circle at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 55%),
            linear-gradient(160deg, #0f172a 0%, #000 50%, #020617 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 48px 24px 80px;
        }
        .aa-wrap {
          max-width: 860px; margin: 0 auto;
        }

        /* ── HEADER ── */
        .aa-header { margin-bottom: 36px; }
        .aa-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; color: #f97316;
          letter-spacing: .15em; text-transform: uppercase; margin-bottom: 10px;
        }
        .aa-eyebrow::before {
          content: ''; display: inline-block;
          width: 24px; height: 2px;
          background: linear-gradient(90deg, #f97316, transparent); border-radius: 2px;
        }
        .aa-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 3.5vw, 38px);
          font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 8px;
        }
        .aa-subtitle { font-size: 14px; color: rgba(255,255,255,0.42); line-height: 1.6; }

        /* ── STEPPER ── */
        .aa-stepper {
          display: flex; align-items: center; justify-content: center;
          gap: 0; margin-bottom: 36px;
        }
        .aa-step {
          display: flex; align-items: center; gap: 10px;
        }
        .aa-step-circle {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          border: 2px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.30);
          background: rgba(255,255,255,0.04);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .aa-step-circle.active {
          background: linear-gradient(135deg, #ea580c, #f97316);
          border-color: #f97316;
          color: #fff;
          box-shadow: 0 0 18px rgba(249,115,22,0.40);
        }
        .aa-step-circle.done {
          background: rgba(74,222,128,0.14);
          border-color: rgba(74,222,128,0.35);
          color: #4ade80;
        }
        .aa-step-label {
          font-size: 12.5px; font-weight: 600;
          color: rgba(255,255,255,0.30);
          display: none;
          transition: color 0.3s;
        }
        .aa-step-label.active { color: #fb923c; }
        .aa-step-label.done   { color: rgba(255,255,255,0.55); }
        @media (min-width: 480px) { .aa-step-label { display: block; } }
        .aa-step-line {
          width: 48px; height: 2px; margin: 0 8px;
          background: rgba(255,255,255,0.08); border-radius: 2px;
          transition: background 0.3s;
          flex-shrink: 0;
        }
        .aa-step-line.done { background: rgba(74,222,128,0.30); }
        .aa-step-line.active { background: rgba(249,115,22,0.30); }

        /* ── ERROR ── */
        .aa-error {
          display: flex; align-items: center; gap: 10px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.22);
          border-radius: 12px; padding: 13px 16px;
          margin-bottom: 20px;
          font-size: 13.5px; color: #f87171;
          animation: aaFadeIn 0.3s ease;
        }
        @keyframes aaFadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        /* ── CARD ── */
        .aa-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          padding: 36px 32px;
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.28);
          position: relative; overflow: hidden;
        }
        .aa-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #f97316, #ea580c, transparent);
          border-radius: 22px 22px 0 0;
        }
        @media (max-width: 640px) { .aa-card { padding: 24px 18px; } }

        /* ── STEP HEADING ── */
        .aa-step-head { margin-bottom: 24px; }
        .aa-step-title {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Playfair Display', serif;
          font-size: clamp(18px, 2.5vw, 24px);
          font-weight: 700; color: #fff; margin-bottom: 6px;
        }
        .aa-step-title-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(249,115,22,0.14);
          border: 1px solid rgba(249,115,22,0.25);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .aa-step-desc { font-size: 13.5px; color: rgba(255,255,255,0.40); }

        /* ── MAP AREA ── */
        .aa-map-wrap {
          border-radius: 14px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 20px;
          height: 420px;
        }
        @media (max-width: 640px) { .aa-map-wrap { height: 300px; } }

        /* ── FORM FIELDS ── */
        .aa-label-row {
          display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;
        }
        .aa-label-option {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 16px; border-radius: 99px; cursor: pointer;
          border: 1.5px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.50);
          transition: all 0.2s;
        }
        .aa-label-option input { display: none; }
        .aa-label-option.checked {
          border-color: rgba(249,115,22,0.40);
          background: rgba(249,115,22,0.12);
          color: #fb923c;
        }

        .aa-field { margin-bottom: 18px; }
        .aa-field-label {
          display: block; font-size: 11.5px; font-weight: 700;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase; letter-spacing: 0.07em;
          margin-bottom: 8px;
        }
        .aa-input {
          width: 100%; background: rgba(0,0,0,0.28);
          border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 11px; padding: 12px 16px;
          color: #fff; font-size: 14px;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color .22s, box-shadow .22s, background .22s;
          box-sizing: border-box;
        }
        .aa-input::placeholder { color: rgba(255,255,255,0.20); }
        .aa-input:hover:not(:focus) {
          border-color: rgba(255,255,255,0.16);
          background: rgba(0,0,0,0.35);
        }
        .aa-input:focus {
          border-color: #f97316;
          background: rgba(249,115,22,0.05);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.13);
        }
        .aa-grid-3 {
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;
        }
        @media (max-width: 580px) { .aa-grid-3 { grid-template-columns: 1fr; } }

        .aa-checkbox-row {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px; border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          cursor: pointer; margin-top: 4px;
        }
        .aa-checkbox-row input[type="checkbox"] {
          width: 16px; height: 16px; accent-color: #f97316; cursor: pointer;
        }
        .aa-checkbox-label {
          font-size: 13.5px; color: rgba(255,255,255,0.60); cursor: pointer;
        }

        /* ── VERIFY STEP ── */
        .aa-review-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 22px 20px;
          margin-bottom: 14px;
        }
        .aa-review-card-title {
          font-size: 11px; font-weight: 700; color: #f97316;
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
        }
        .aa-review-card-title::before {
          content: ''; display: inline-block;
          width: 14px; height: 1.5px; background: #f97316;
        }
        .aa-review-name  { font-size: 15px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .aa-review-line  { font-size: 13.5px; color: rgba(255,255,255,0.52); line-height: 1.6; }
        .aa-review-coord { font-size: 11.5px; color: rgba(255,255,255,0.28); margin-top: 6px; font-family: monospace; }

        .aa-mismatch {
          display: flex; gap: 12px; align-items: flex-start;
          background: rgba(251,191,36,0.07);
          border: 1px solid rgba(251,191,36,0.22);
          border-radius: 14px; padding: 16px 18px;
          margin-bottom: 20px;
        }
        .aa-mismatch-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(251,191,36,0.14);
          border: 1px solid rgba(251,191,36,0.25);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .aa-mismatch-title { font-size: 13.5px; font-weight: 700; color: #fbbf24; margin-bottom: 6px; }
        .aa-mismatch-item  { font-size: 12.5px; color: rgba(251,191,36,0.75); line-height: 1.6; }
        .aa-mismatch-note  { font-size: 12px; color: rgba(251,191,36,0.55); margin-top: 8px; }

        /* ── BUTTON ROW ── */
        .aa-btn-row {
          display: flex; justify-content: space-between; align-items: center;
          gap: 12px; margin-top: 28px; flex-wrap: wrap;
        }
        .aa-btn-row.end { justify-content: flex-end; }

        .aa-btn-back {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.60);
          border-radius: 11px; padding: 12px 22px;
          font-size: 13.5px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background .2s, border-color .2s, color .2s;
        }
        .aa-btn-back:hover {
          background: rgba(255,255,255,0.10);
          border-color: rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.85);
        }

        .aa-btn-next {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; border: none;
          border-radius: 11px; padding: 13px 28px;
          font-size: 14px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform .22s, box-shadow .22s, filter .22s;
          box-shadow: 0 5px 18px rgba(234,88,12,0.32);
        }
        .aa-btn-next:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 28px rgba(234,88,12,0.46);
          filter: brightness(1.07);
        }
        .aa-btn-next:disabled { opacity: 0.50; cursor: not-allowed; }

        .aa-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          animation: aaSpin .7s linear infinite;
        }
        @keyframes aaSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="aa-page">
        <div className="aa-wrap">

          {/* ── HEADER ── */}
          <div className="aa-header">
            <p className="aa-eyebrow">Delivery</p>
            <h1 className="aa-title">Add Delivery Address</h1>
            <p className="aa-subtitle">Please provide your delivery location for accurate order delivery</p>
          </div>

          {/* ── STEPPER ── */}
          <div className="aa-stepper">
            {/* Step 1 */}
            <div className="aa-step">
              <div className={`aa-step-circle ${step > 1 ? 'done' : step === 1 ? 'active' : ''}`}>
                {step > 1 ? <FiCheck size={14} /> : '1'}
              </div>
              <span className={`aa-step-label ${step > 1 ? 'done' : step === 1 ? 'active' : ''}`}>Select Location</span>
            </div>
            <div className={`aa-step-line ${step > 1 ? 'done' : step === 1 ? 'active' : ''}`} />
            {/* Step 2 */}
            <div className="aa-step">
              <div className={`aa-step-circle ${step > 2 ? 'done' : step === 2 ? 'active' : ''}`}>
                {step > 2 ? <FiCheck size={14} /> : '2'}
              </div>
              <span className={`aa-step-label ${step > 2 ? 'done' : step === 2 ? 'active' : ''}`}>Enter Details</span>
            </div>
            <div className={`aa-step-line ${step > 2 ? 'done' : step === 2 ? 'active' : ''}`} />
            {/* Step 3 */}
            <div className="aa-step">
              <div className={`aa-step-circle ${step === 3 ? 'active' : ''}`}>3</div>
              <span className={`aa-step-label ${step === 3 ? 'active' : ''}`}>Verify & Save</span>
            </div>
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div className="aa-error">
              <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* ── CARD ── */}
          <div className="aa-card">

            {/* ══ STEP 1: MAP ══ */}
            {step === 1 && (
              <div>
                <div className="aa-step-head">
                  <h2 className="aa-step-title">
                    <span className="aa-step-title-icon">
                      <FiMapPin size={17} color="#f97316" />
                    </span>
                    Select Your Location
                  </h2>
                  <p className="aa-step-desc">Use the map to pinpoint your exact delivery location</p>
                </div>

                <div className="aa-map-wrap">
                  <MapLocationPicker onLocationSelect={handleMapLocationSelect} />
                </div>

                <div className="aa-btn-row end">
                  <button className="aa-btn-next" onClick={handleContinueToForm}>
                    Continue to Address Details
                  </button>
                </div>
              </div>
            )}

            {/* ══ STEP 2: FORM ══ */}
            {step === 2 && (
              <div>
                <div className="aa-step-head">
                  <h2 className="aa-step-title">
                    <span className="aa-step-title-icon">
                      <FiEdit size={17} color="#f97316" />
                    </span>
                    Enter Address Details
                  </h2>
                  <p className="aa-step-desc">Please verify and complete your address information</p>
                </div>

                {/* Label selector */}
                <div className="aa-field">
                  <label className="aa-field-label">Address Label</label>
                  <div className="aa-label-row">
                    {['Home', 'Office', 'Other'].map((lbl) => (
                      <label key={lbl} className={`aa-label-option ${formData.label === lbl ? 'checked' : ''}`}>
                        <input
                          type="radio" name="label" value={lbl}
                          checked={formData.label === lbl}
                          onChange={handleFormChange}
                        />
                        {lbl}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="aa-field">
                  <label className="aa-field-label">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName}
                    onChange={handleFormChange} required className="aa-input"
                    placeholder="Enter your full name" />
                </div>

                <div className="aa-field">
                  <label className="aa-field-label">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone}
                    onChange={handleFormChange} required maxLength="10"
                    className="aa-input" placeholder="10-digit mobile number" />
                </div>

                <div className="aa-field">
                  <label className="aa-field-label">House No. / Street / Building *</label>
                  <input type="text" name="houseStreet" value={formData.houseStreet}
                    onChange={handleFormChange} required className="aa-input"
                    placeholder="Enter house/street address" />
                </div>

                <div className="aa-field">
                  <label className="aa-field-label">Area / Landmark</label>
                  <input type="text" name="areaLandmark" value={formData.areaLandmark}
                    onChange={handleFormChange} className="aa-input"
                    placeholder="Enter area or nearby landmark" />
                </div>

                <div className="aa-field">
                  <div className="aa-grid-3">
                    <div>
                      <label className="aa-field-label">City *</label>
                      <input type="text" name="city" value={formData.city}
                        onChange={handleFormChange} required className="aa-input" placeholder="City" />
                    </div>
                    <div>
                      <label className="aa-field-label">State *</label>
                      <input type="text" name="state" value={formData.state}
                        onChange={handleFormChange} required className="aa-input" placeholder="State" />
                    </div>
                    <div>
                      <label className="aa-field-label">Pincode *</label>
                      <input type="text" name="pincode" value={formData.pincode}
                        onChange={handleFormChange} required maxLength="6"
                        className="aa-input" placeholder="6-digit pincode" />
                    </div>
                  </div>
                </div>

                <label className="aa-checkbox-row">
                  <input type="checkbox" name="isDefault" checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} />
                  <span className="aa-checkbox-label">Make this my default delivery address</span>
                </label>

                <div className="aa-btn-row">
                  <button className="aa-btn-back" onClick={() => setStep(1)}>← Back to Map</button>
                  <button className="aa-btn-next" onClick={handleContinueToVerify}>
                    Continue to Verification
                  </button>
                </div>
              </div>
            )}

            {/* ══ STEP 3: VERIFY ══ */}
            {step === 3 && (
              <div>
                <div className="aa-step-head">
                  <h2 className="aa-step-title">
                    <span className="aa-step-title-icon">
                      <FiCheck size={17} color="#f97316" />
                    </span>
                    Verify Your Address
                  </h2>
                  <p className="aa-step-desc">Please confirm your delivery address details</p>
                </div>

                {/* Mismatch warning */}
                {addressMismatch && (
                  <div className="aa-mismatch">
                    <div className="aa-mismatch-icon">
                      <FiAlertCircle size={17} color="#fbbf24" />
                    </div>
                    <div>
                      <p className="aa-mismatch-title">Address Mismatch Detected</p>
                      {mismatchDetails.map((detail, i) => (
                        <p key={i} className="aa-mismatch-item">• {detail}</p>
                      ))}
                      <p className="aa-mismatch-note">Please verify your address is correct before proceeding.</p>
                    </div>
                  </div>
                )}

                {/* Address review */}
                <div className="aa-review-card">
                  <p className="aa-review-card-title">Your Address</p>
                  <p className="aa-review-name">{formData.fullName}</p>
                  <p className="aa-review-line">
                    {formData.houseStreet}
                    {formData.areaLandmark && `, ${formData.areaLandmark}`}
                  </p>
                  <p className="aa-review-line">
                    {formData.city}, {formData.state} — {formData.pincode}
                  </p>
                  <p className="aa-review-line" style={{ marginTop: 6 }}>
                    📞 {formData.phone}
                  </p>
                </div>

                <div className="aa-review-card">
                  <p className="aa-review-card-title">Map Location</p>
                  <p className="aa-review-line">{mapLocation.formattedAddress}</p>
                  <p className="aa-review-coord">
                    {mapLocation.latitude.toFixed(6)}, {mapLocation.longitude.toFixed(6)}
                  </p>
                </div>

                <div className="aa-btn-row">
                  <button className="aa-btn-back" onClick={() => setStep(2)}>← Edit Address</button>
                  <button className="aa-btn-next" onClick={handleSaveAddress} disabled={loading}>
                    {loading ? (
                      <><div className="aa-spinner" /> Saving...</>
                    ) : (
                      <><FiCheck size={15} /> Confirm & Save Address</>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AddAddress;