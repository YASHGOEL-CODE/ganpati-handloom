import React, { useState, useContext, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { userAPI, addressAPI, ordersAPI, wishlistAPI } from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { formatPrice, formatDate } from '../../utils/helpers';
import { getImageUrl } from '../../utils/imageHelper';
import MapLocationPicker from '../address/MapLocationPicker';
import {
  FiUser, FiMail, FiPhone, FiEdit2, FiSave,
  FiMapPin, FiTrash2, FiCheck, FiPlus, FiX,
  FiPackage, FiHeart, FiLock, FiLogOut, FiAlertTriangle,
  FiShield, FiChevronRight, FiClock, FiTruck, FiStar, FiShoppingCart,
} from 'react-icons/fi';
import { isValidEmail, isValidPhone } from '../../utils/helpers';

const Profile = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const { user, logout } = useAuth();
  const { addToCart } = useContext(CartContext);
  const {
    wishlistItems: contextWishlistItems,
    removeFromWishlist: contextRemoveFromWishlist,
    fetchWishlist,
  } = useContext(WishlistContext);
  const [editMode, setEditMode]   = useState(false);
  const [formData, setFormData]   = useState({ fullName: '', email: '', phone: '' });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  // Address states — all unchanged
  const [addresses, setAddresses]               = useState([]);
  const [showAddressForm, setShowAddressForm]   = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [mapLocation, setMapLocation]           = useState(null);
  const [addressLoading, setAddressLoading]     = useState(false);

  // Orders state
  const [orders, setOrders]           = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderCount, setOrderCount]   = useState(0);

  // Wishlist — sourced from WishlistContext (same data as navbar badge)
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addressFormData, setAddressFormData]   = useState({
    label: 'Home', fullName: user?.fullName || '', phone: user?.phone || '',
    houseStreet: '', areaLandmark: '', city: '', state: '', pincode: '', isDefault: false,
  });

  // ── All useEffects completely unchanged ──
  useEffect(() => {
    if (user) {
      setFormData({ fullName: user.fullName || '', email: user.email || '', phone: user.phone || '' });
      setAddressFormData((prev) => ({ ...prev, fullName: user.fullName || '', phone: user.phone || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'addresses') fetchAddresses();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'wishlist') {
      setWishlistLoading(true);
      fetchWishlist().finally(() => setWishlistLoading(false));
    }
  }, [activeTab]);

  useEffect(() => {
    // Fetch counts for stats on mount
    fetchOrderCount();
    fetchWishlistCount();
  }, []);

  // ── All handlers completely unchanged ──
  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll();
      setAddresses(response.data.addresses);
    } catch (error) { console.error('Fetch addresses error:', error); }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await ordersAPI.getMyOrders();
      const fetched = response.data.orders || response.data || [];
      setOrders(fetched);
    } catch (error) {
      console.error('Fetch orders error:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderCount = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      const fetched = response.data.orders || response.data || [];
      setOrderCount(fetched.length);
    } catch (error) { console.error('Order count error:', error); }
  };

  const fetchWishlistCount = async () => {
    // Count comes from WishlistContext — no separate API call needed
  };

  const fetchWishlistItems = async () => {
    // Items come from WishlistContext — no separate API call needed
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await contextRemoveFromWishlist(productId);
    } catch (error) {
      console.error('Remove wishlist error:', error);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim())    newErrors.email    = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.phone && !isValidPhone(formData.phone)) newErrors.phone = 'Invalid phone number';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      await userAPI.updateProfile(formData);
      setSuccess(true); setEditMode(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Failed to update profile' });
    } finally { setLoading(false); }
  };

  const handleMapLocationSelect = (location) => {
    setMapLocation(location);
    setAddressFormData((prev) => ({
      ...prev, fullName: prev.fullName, phone: prev.phone, label: prev.label, isDefault: prev.isDefault,
      houseStreet: location.street || prev.houseStreet, areaLandmark: location.area || prev.areaLandmark,
      city: location.city || prev.city, state: location.state || prev.state, pincode: location.pincode || prev.pincode,
    }));
  };

  const handleAddressFormChange = (e) => {
    setAddressFormData({ ...addressFormData, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault(); setAddressLoading(true);
    try {
      const addressData = { ...addressFormData, latitude: mapLocation?.latitude, longitude: mapLocation?.longitude, placeId: mapLocation?.placeId, formattedAddress: mapLocation?.formattedAddress };
      if (editingAddressId) { await addressAPI.update(editingAddressId, addressData); }
      else { await addressAPI.create(addressData); }
      setShowAddressForm(false); setEditingAddressId(null); setMapLocation(null);
      setAddressFormData({ label: 'Home', fullName: user?.fullName || '', phone: user?.phone || '', houseStreet: '', areaLandmark: '', city: '', state: '', pincode: '', isDefault: false });
      fetchAddresses();
    } catch (error) { alert(error.response?.data?.message || 'Failed to save address'); }
    finally { setAddressLoading(false); }
  };

  const handleEditAddress = async (address) => {
    setEditingAddressId(address._id);
    setAddressFormData({ label: address.label, fullName: address.fullName, phone: address.phone, houseStreet: address.houseStreet, areaLandmark: address.areaLandmark || '', city: address.city, state: address.state, pincode: address.pincode, isDefault: address.isDefault });
    if (address.latitude && address.longitude) setMapLocation({ latitude: address.latitude, longitude: address.longitude, placeId: address.placeId, formattedAddress: address.formattedAddress });
    setShowAddressForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try { await addressAPI.delete(id); fetchAddresses(); }
    catch (error) { alert('Failed to delete address'); }
  };

  const handleSetDefaultAddress = async (id) => {
    try { await addressAPI.setDefault(id); fetchAddresses(); }
    catch (error) { alert('Failed to set default address'); }
  };

  const handleCancelForm = () => {
    setShowAddressForm(false); setEditingAddressId(null); setMapLocation(null);
    setAddressFormData({ label: 'Home', fullName: user?.fullName || '', phone: user?.phone || '', houseStreet: '', areaLandmark: '', city: '', state: '', pincode: '', isDefault: false });
  };

  const tabs = [
    { id: 'profile',   label: 'Profile',    icon: FiUser },
    { id: 'addresses', label: 'Addresses',   icon: FiMapPin },
    { id: 'orders',    label: 'Orders',      icon: FiPackage },
    { id: 'wishlist',  label: 'Wishlist',    icon: FiHeart },
  ];

  // Initials avatar
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .pr-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 10%, rgba(249,115,22,0.07) 0%, transparent 55%),
            radial-gradient(circle at 85% 90%, rgba(139,92,246,0.05) 0%, transparent 55%),
            linear-gradient(160deg, #0f172a 0%, #000000 50%, #020617 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 0 0 100px;
        }
        .pr-wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        @media (max-width: 640px) { .pr-wrap { padding: 0 14px; } }

        /* ── PAGE HEADER ── */
        .pr-header {
          padding: 28px 0 22px;
          margin-bottom: 20px;
        }
        .pr-header-card {
          background: rgba(255,255,255,0.04); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
          padding: 22px 28px; margin-bottom: 18px; position: relative;
        }
        .pr-header-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #f97316, #ea580c, transparent);
          border-radius: 20px 20px 0 0;
        }
        .pr-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; color: #ea580c;
          letter-spacing: .15em; text-transform: uppercase; margin-bottom: 8px;
        }
        .pr-eyebrow::before { content:''; display:inline-block; width:14px; height:1.5px; background:#ea580c; }
        .pr-page-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 3.5vw, 40px); font-weight: 800;
          color: #fff; line-height: 1.1; letter-spacing: -.02em;
        }

        /* ── PROFILE HERO CARD ── */
        .pr-hero-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px; padding: 28px 28px;
          margin-bottom: 24px;
          display: flex; align-items: center; gap: 24px;
          position: relative; overflow: hidden;
          flex-wrap: wrap;
        }
        .pr-hero-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #ea580c, #f97316, #c084fc);
          border-radius: 22px 22px 0 0;
        }
        /* Ambient glow */
        .pr-hero-card::after {
          content:''; position:absolute; z-index:0;
          width:200px; height:200px; border-radius:50%;
          background: radial-gradient(circle, rgba(234,88,12,0.09) 0%, transparent 70%);
          top:-60px; right:-30px; pointer-events:none;
        }

        /* Avatar */
        .pr-avatar {
          width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #ea580c, #f97316);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 800; color: #fff;
          box-shadow: 0 0 0 4px rgba(234,88,12,0.18), 0 8px 24px rgba(234,88,12,0.28);
          position: relative; z-index: 1;
        }
        .pr-avatar-ring {
          width: 88px; height: 88px; border-radius: 50%; flex-shrink: 0;
          padding: 4px;
          background: linear-gradient(135deg, #ea580c, #c084fc);
          position: relative; z-index: 1;
        }
        .pr-avatar-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: linear-gradient(135deg, #ea580c, #f97316);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 800; color: #fff;
        }

        .pr-hero-info { flex: 1; min-width: 200px; position: relative; z-index: 1; }
        .pr-hero-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(20px, 2.5vw, 26px); font-weight: 700;
          color: #f1f5f9; margin-bottom: 4px;
        }
        .pr-hero-email { font-size: 13.5px; color: rgba(255,255,255,0.42); margin-bottom: 12px; }
        .pr-hero-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(74,222,128,0.12); border: 1px solid rgba(74,222,128,0.22);
          color: #4ade80; font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 999px;
        }

        /* Stats */
        .pr-stats {
          display: flex; gap: 0; position: relative; z-index: 1;
          border-left: 1px solid rgba(255,255,255,0.07);
          padding-left: 24px;
          flex-wrap: wrap; gap: 20px;
        }
        @media (max-width: 640px) { .pr-stats { border-left: none; padding-left: 0; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 16px; width: 100%; } }
        .pr-stat { text-align: center; }
        .pr-stat-val {
          font-size: 22px; font-weight: 800;
          background: linear-gradient(90deg, #fb923c, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          line-height: 1; margin-bottom: 4px;
        }
        .pr-stat-lbl { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: .07em; }

        /* ── TABS ── */
        .pr-tabs {
          display: flex; gap: 8px; margin-bottom: 24px;
          overflow-x: auto; scrollbar-width: none; padding-bottom: 2px;
        }
        .pr-tabs::-webkit-scrollbar { display: none; }
        .pr-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 999px;
          font-size: 13.5px; font-weight: 600; white-space: nowrap;
          border: 1.5px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.45); cursor: pointer;
          transition: all .22s ease;
        }
        .pr-tab:hover:not(.active) {
          border-color: rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.80);
          background: rgba(255,255,255,0.07);
          transform: translateY(-1px);
        }
        .pr-tab.active {
          background: linear-gradient(135deg, #ea580c, #f97316);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 4px 16px rgba(234,88,12,0.35);
          transform: translateY(-1px);
        }
        .pr-tab-ico { flex-shrink: 0; }

        /* ── CONTENT CARD ── */
        .pr-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px; padding: 32px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06);
          position: relative; overflow: hidden;
        }
        .pr-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: linear-gradient(90deg, #f97316, #ea580c, transparent);
          border-radius: 22px 22px 0 0;
        }
        @media (max-width: 640px) { .pr-card { padding: 20px 16px; } }

        /* ── SECTION TITLES ── */
        .pr-sec-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 24px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        /* Edit button */
        .pr-edit-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: #fb923c;
          background: rgba(234,88,12,0.10); border: 1px solid rgba(234,88,12,0.22);
          padding: 7px 14px; border-radius: 10px; cursor: pointer;
          transition: background .2s, box-shadow .2s, transform .2s;
        }
        .pr-edit-btn:hover { background: rgba(234,88,12,0.18); box-shadow: 0 0 12px rgba(234,88,12,0.22); transform: scale(1.04); }

        /* Success banner */
        .pr-success {
          display: flex; align-items: center; gap: 10px;
          background: rgba(74,222,128,0.10); border: 1px solid rgba(74,222,128,0.22);
          border-radius: 12px; padding: 13px 16px; margin-bottom: 22px;
          font-size: 13.5px; font-weight: 500; color: #4ade80;
          animation: prFadeIn .35s ease;
        }
        @keyframes prFadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        /* Error */
        .pr-error-banner {
          background: rgba(239,68,68,0.10); border: 1px solid rgba(239,68,68,0.22);
          border-radius: 12px; padding: 12px 16px; margin-bottom: 18px;
          font-size: 13.5px; color: #fca5a5;
        }
        .pr-field-err { font-size: 12px; color: #f87171; margin-top: 5px; }

        /* ── FORM FIELDS ── */
        .pr-field { margin-bottom: 20px; }
        .pr-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 11.5px; font-weight: 700;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase; letter-spacing: .09em;
          margin-bottom: 8px;
        }
        .pr-input {
          width: 100%;
          background: rgba(0,0,0,0.28);
          border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 12px; padding: 13px 16px;
          color: #f1f5f9; font-size: 14.5px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color .22s, background .22s, box-shadow .22s;
        }
        .pr-input::placeholder { color: rgba(255,255,255,0.22); }
        .pr-input:disabled { opacity: .55; cursor: not-allowed; }
        .pr-input:focus {
          border-color: #ea580c;
          background: rgba(234,88,12,0.06);
          box-shadow: 0 0 0 3px rgba(234,88,12,0.14), 0 2px 12px rgba(234,88,12,0.10);
        }
        .pr-input:hover:not(:disabled):not(:focus) {
          border-color: rgba(255,255,255,0.18);
        }

        /* Save / Cancel buttons */
        .pr-btn-row { display: flex; gap: 12px; margin-top: 6px; }
        .pr-save-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #ea580c, #f97316); color: #fff; border: none;
          border-radius: 12px; padding: 13px; font-size: 14px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform .22s, box-shadow .22s;
          box-shadow: 0 4px 16px rgba(234,88,12,0.28);
        }
        .pr-save-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 24px rgba(234,88,12,0.44); }
        .pr-save-btn:disabled { opacity: .5; cursor: not-allowed; }
        .pr-cancel-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.60); border-radius: 12px; padding: 13px;
          font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background .2s, border-color .2s, color .2s;
        }
        .pr-cancel-btn:hover { background: rgba(255,255,255,0.10); border-color: rgba(255,255,255,0.20); color: #fff; }

        /* ── ADDRESS FORM ── */
        .pr-addr-form-wrap {
          margin-bottom: 28px; padding: 24px;
          background: rgba(255,255,255,0.04); backdrop-filter: blur(16px);
          border: 1.5px solid rgba(234,88,12,0.28);
          border-radius: 18px;
        }
        .pr-addr-form-hdr {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .pr-addr-form-title { font-size: 16px; font-weight: 700; color: #f1f5f9; }
        .pr-addr-close {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.50); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s, color .2s;
        }
        .pr-addr-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }
        .pr-map-wrap {
          height: 380px; border-radius: 14px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08); margin-bottom: 20px;
        }
        .pr-radio-row { display: flex; gap: 16px; flex-wrap: wrap; }
        .pr-radio-label {
          display: flex; align-items: center; gap: 7px; cursor: pointer;
          font-size: 13.5px; color: rgba(255,255,255,0.60);
        }
        .pr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pr-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        @media (max-width: 640px) { .pr-grid-2 { grid-template-columns: 1fr; } .pr-grid-3 { grid-template-columns: 1fr; } }
        .pr-checkbox-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 13.5px; color: rgba(255,255,255,0.55);
        }
        .pr-addr-btn-row { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; }
        .pr-addr-save-btn {
          display: flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, #ea580c, #f97316); color: #fff; border: none;
          border-radius: 11px; padding: 10px 22px; font-size: 13.5px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform .2s, box-shadow .2s;
        }
        .pr-addr-save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(234,88,12,0.38); }
        .pr-addr-save-btn:disabled { opacity: .5; cursor: not-allowed; }
        .pr-addr-cancel-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.55); border-radius: 11px; padding: 10px 22px;
          font-size: 13.5px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background .2s, color .2s;
        }
        .pr-addr-cancel-btn:hover { background: rgba(255,255,255,0.10); color: #fff; }

        /* ── ADDRESS CARDS ── */
        .pr-addr-list { display: flex; flex-direction: column; gap: 12px; }
        .pr-addr-card {
          background: rgba(255,255,255,0.04); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 18px 16px;
          display: flex; align-items: flex-start; gap: 14px;
          transition: border-color .25s, box-shadow .25s, transform .25s;
        }
        .pr-addr-card:hover { border-color: rgba(249,115,22,0.22); transform: translateY(-3px); box-shadow: 0 14px 36px rgba(0,0,0,0.32), 0 0 0 1px rgba(249,115,22,0.12); }
        .pr-addr-body { flex: 1; min-width: 0; }
        .pr-addr-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
        .pr-addr-badge {
          font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px;
          border: 1px solid transparent;
        }
        .pr-addr-badge-label { background: rgba(234,88,12,0.14); border-color: rgba(234,88,12,0.25); color: #fb923c; }
        .pr-addr-badge-default { background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.22); color: #4ade80; }
        .pr-addr-name { font-size: 15px; font-weight: 700; color: #f1f5f9; margin-bottom: 2px; }
        .pr-addr-phone { font-size: 12.5px; color: rgba(255,255,255,0.38); margin-bottom: 7px; }
        .pr-addr-text { font-size: 13.5px; color: rgba(255,255,255,0.52); line-height: 1.55; margin-bottom: 8px; }
        .pr-addr-dist { font-size: 12px; color: rgba(255,255,255,0.35); }
        .pr-addr-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
        .pr-addr-act {
          width: 32px; height: 32px; border-radius: 9px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.40); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s, border-color .2s, color .2s;
        }
        .pr-addr-act.edit:hover    { background: rgba(234,88,12,0.15); border-color: rgba(234,88,12,0.28); color: #fb923c; }
        .pr-addr-act.def:hover     { background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.25); color: #4ade80; }
        .pr-addr-act.del:hover     { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.25); color: #f87171; }

        /* Add address button */
        .pr-add-addr-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #ea580c, #f97316); color: #fff; border: none;
          border-radius: 11px; padding: 10px 20px; font-size: 13.5px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform .2s, box-shadow .2s;
          box-shadow: 0 4px 14px rgba(234,88,12,0.28);
        }
        .pr-add-addr-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(234,88,12,0.42); }

        /* Empty states */
        .pr-empty {
          text-align: center; padding: 60px 20px;
        }
        .pr-empty-icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(249,115,22,0.10); border: 1px solid rgba(249,115,22,0.22);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
          animation: emptyPulse 2.5s ease-in-out infinite;
        }
        @keyframes emptyPulse { 0%,100%{box-shadow:0 0 0 0 rgba(234,88,12,0.12)} 50%{box-shadow:0 0 0 10px rgba(234,88,12,0)} }
        .pr-empty-title { font-size: 18px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
        .pr-empty-sub { font-size: 14px; color: rgba(255,255,255,0.38); margin-bottom: 22px; }

        /* ── ACCOUNT ACTIONS ── */
        .pr-actions-section {
          margin-top: 28px;
          background: rgba(255,255,255,0.04); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; overflow: hidden;
        }
        .pr-action-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          cursor: pointer; transition: background .2s;
        }
        .pr-action-item:last-child { border-bottom: none; }
        .pr-action-item:hover { background: rgba(255,255,255,0.06); }
        .pr-action-item.danger:hover { background: rgba(239,68,68,0.06); }
        .pr-action-left { display: flex; align-items: center; gap: 12px; }
        .pr-action-ico {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .pr-action-title { font-size: 14px; font-weight: 600; color: #f1f5f9; }
        .pr-action-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 1px; }
        .pr-action-item.danger .pr-action-title { color: #f87171; }
        .pr-action-arrow { color: rgba(255,255,255,0.22); }
        .pr-action-item.danger .pr-action-arrow { color: rgba(248,113,113,0.35); }

        @media (max-width: 640px) {
          .pr-hero-card { gap: 16px; }
          .pr-stats { gap: 16px; }
        }

        /* ── WISHLIST ITEMS IN PROFILE ── */
        .prwl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .prwl-card {
          background: rgba(255,255,255,0.04); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; overflow: hidden;
          display: flex; flex-direction: column;
          transition: transform .28s, box-shadow .28s, border-color .28s;
        }
        .prwl-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 44px rgba(0,0,0,0.35), 0 0 0 1px rgba(249,115,22,0.20);
          border-color: rgba(249,115,22,0.22);
        }
        .prwl-img-wrap {
          position: relative; height: 180px; overflow: hidden; background: #0f172a;
          flex-shrink: 0;
        }
        .prwl-img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
        .prwl-card:hover .prwl-img { transform: scale(1.07); }
        .prwl-img-grad {
          position: absolute; bottom: 0; left: 0; right: 0; height: 60px;
          background: linear-gradient(to top, rgba(0,0,0,0.65), transparent);
          pointer-events: none;
        }
        .prwl-remove {
          position: absolute; top: 9px; right: 9px; z-index: 3;
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(10,20,40,0.80); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.50); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s, color .2s, transform .2s;
        }
        .prwl-remove:hover {
          background: rgba(239,68,68,0.20); border-color: rgba(239,68,68,0.35);
          color: #f87171; transform: scale(1.12);
        }
        .prwl-info { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .prwl-cat { font-size: 10px; font-weight: 700; color: #f97316; text-transform: uppercase; letter-spacing: .12em; }
        .prwl-name {
          font-size: 13.5px; font-weight: 700; color: #f1f5f9; line-height: 1.35;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .prwl-price {
          font-size: 16px; font-weight: 800; color: #f97316;
          text-shadow: 0 0 14px rgba(249,115,22,0.28);
        }
        .prwl-cart-btn {
          width: 100%; margin-top: auto;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: linear-gradient(135deg, #ea580c, #f97316); color: #fff; border: none;
          border-radius: 10px; padding: 10px; font-size: 12.5px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: transform .2s, box-shadow .2s;
          box-shadow: 0 3px 12px rgba(234,88,12,0.20);
        }
        .prwl-cart-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(234,88,12,0.38); }
        .prwl-cart-btn.oos { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.32); box-shadow: none; cursor: not-allowed; }
        .prwl-loader {
          display: flex; align-items: center; justify-content: center;
          padding: 60px 20px; gap: 12px;
          font-size: 14px; color: rgba(255,255,255,0.40);
        }

        /* ── ORDER CARDS ── */
        .pr-order-card {
          background: rgba(255,255,255,0.04); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; overflow: hidden; margin-bottom: 14px;
          transition: border-color .25s, box-shadow .25s, transform .25s;
        }
        .pr-order-card:last-child { margin-bottom: 0; }
        .pr-order-card:hover {
          border-color: rgba(249,115,22,0.28);
          box-shadow: 0 14px 36px rgba(0,0,0,0.32), 0 0 0 1px rgba(249,115,22,0.10);
          transform: translateY(-3px);
        }
        .pr-order-hdr {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 18px; flex-wrap: wrap; gap: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .pr-order-id {
          font-family: monospace; font-size: 12px; font-weight: 700;
          color: rgba(255,255,255,0.50);
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10);
          padding: 3px 10px; border-radius: 7px;
        }
        .pr-order-date { font-size: 12px; color: rgba(255,255,255,0.35); }
        .pr-order-status {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 800; padding: 4px 11px; border-radius: 999px;
          white-space: nowrap;
        }
        .pr-order-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .pr-order-body { padding: 16px 18px; }
        .pr-order-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
        .pr-order-item {
          display: flex; align-items: center; gap: 12px;
        }
        .pr-order-item-img {
          width: 54px; height: 54px; border-radius: 10px; object-fit: cover; flex-shrink: 0;
          background: #0f172a; border: 1px solid rgba(255,255,255,0.07);
        }
        .pr-order-item-name { font-size: 13.5px; font-weight: 600; color: #f1f5f9; margin-bottom: 2px; }
        .pr-order-item-qty  { font-size: 12px; color: rgba(255,255,255,0.38); }
        .pr-order-item-price {
          margin-left: auto; flex-shrink: 0;
          font-size: 14px; font-weight: 800; color: #f97316;
        }
        .pr-order-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap; gap: 8px;
        }
        .pr-order-total-lbl { font-size: 12px; color: rgba(255,255,255,0.35); }
        .pr-order-total-val {
          font-size: 18px; font-weight: 800;
          background: linear-gradient(90deg,#fb923c,#f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .pr-order-track-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(249,115,22,0.10); border: 1px solid rgba(249,115,22,0.22);
          color: #fb923c; font-size: 12.5px; font-weight: 700;
          padding: 7px 14px; border-radius: 9px; text-decoration: none;
          transition: background .2s, box-shadow .2s;
        }
        .pr-order-track-btn:hover {
          background: rgba(249,115,22,0.18);
          box-shadow: 0 4px 14px rgba(249,115,22,0.22);
        }
        .pr-orders-loader {
          display: flex; align-items: center; justify-content: center;
          padding: 60px 20px; gap: 12px;
          font-size: 14px; color: rgba(255,255,255,0.38);
        }
        .pr-spin {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2.5px solid rgba(249,115,22,0.20); border-top-color: #f97316;
          animation: prSpin .75s linear infinite; flex-shrink: 0;
        }
        @keyframes prSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="pr-page">
        <div className="pr-wrap">

          {/* ── PAGE HEADER ── */}
          <div className="pr-header">
            <div className="pr-header-card">
              <p className="pr-eyebrow">Dashboard</p>
              <h1 className="pr-page-title">My Account</h1>
            </div>
          </div>

          {/* ── PROFILE HERO CARD ── */}
          <div className="pr-hero-card">
            <div className="pr-avatar-ring">
              <div className="pr-avatar-inner">{initials}</div>
            </div>
            <div className="pr-hero-info">
              <h2 className="pr-hero-name">{user?.fullName || 'User'}</h2>
              <p className="pr-hero-email">{user?.email || ''}</p>
              <span className="pr-hero-badge">
                <FiShield size={11} /> Verified Account
              </span>
            </div>
            <div className="pr-stats">
              <div className="pr-stat">
                <p className="pr-stat-val">{orderCount}</p>
                <p className="pr-stat-lbl">Orders</p>
              </div>
              <div className="pr-stat">
                <p className="pr-stat-val">{addresses.length}</p>
                <p className="pr-stat-lbl">Addresses</p>
              </div>
              <div className="pr-stat">
                <p className="pr-stat-val">{contextWishlistItems.length}</p>
                <p className="pr-stat-lbl">Wishlist</p>
              </div>
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="pr-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`pr-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={15} className="pr-tab-ico" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── CONTENT CARD ── */}
          <div className="pr-card">

            {/* ─── PROFILE TAB ─── */}
            {activeTab === 'profile' && (
              <div>
                {success && (
                  <div className="pr-success">
                    <FiCheck size={16} /> Profile updated successfully!
                  </div>
                )}
                {errors.general && (
                  <div className="pr-error-banner">{errors.general}</div>
                )}

                <div className="pr-sec-title">
                  Personal Information
                  {!editMode && (
                    <button className="pr-edit-btn" onClick={() => setEditMode(true)}>
                      <FiEdit2 size={13} /> Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className="pr-field">
                    <label className="pr-label"><FiUser size={12} /> Full Name</label>
                    <input
                      type="text" value={formData.fullName} disabled={!editMode}
                      className="pr-input"
                      onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); setErrors({ ...errors, fullName: '' }); }}
                    />
                    {errors.fullName && <p className="pr-field-err">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div className="pr-field">
                    <label className="pr-label"><FiMail size={12} /> Email Address</label>
                    <input
                      type="email" value={formData.email} disabled={!editMode}
                      className="pr-input"
                      onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                    />
                    {errors.email && <p className="pr-field-err">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div className="pr-field">
                    <label className="pr-label"><FiPhone size={12} /> Phone Number</label>
                    <input
                      type="tel" value={formData.phone} disabled={!editMode}
                      placeholder="9876543210" className="pr-input"
                      onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                    />
                    {errors.phone && <p className="pr-field-err">{errors.phone}</p>}
                  </div>

                  {editMode && (
                    <div className="pr-btn-row">
                      <button type="submit" disabled={loading} className="pr-save-btn">
                        <FiSave size={15} /> {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button" className="pr-cancel-btn"
                        onClick={() => {
                          setEditMode(false); setErrors({});
                          if (user) setFormData({ fullName: user.fullName || '', email: user.email || '', phone: user.phone || '' });
                        }}
                      >
                        <FiX size={15} /> Cancel
                      </button>
                    </div>
                  )}
                </form>

                {/* Account Actions */}
                <div style={{ marginTop: 32 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'.10em', marginBottom:12 }}>
                    Account Actions
                  </p>
                  <div className="pr-actions-section">
                    <div className="pr-action-item" onClick={() => alert('Change password coming soon')}>
                      <div className="pr-action-left">
                        <div className="pr-action-ico" style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.22)' }}>
                          <FiLock size={16} color="#818cf8" />
                        </div>
                        <div>
                          <p className="pr-action-title">Change Password</p>
                          <p className="pr-action-sub">Update your account password</p>
                        </div>
                      </div>
                      <FiChevronRight size={16} className="pr-action-arrow" />
                    </div>

                    {logout && (
                      <div className="pr-action-item" onClick={() => logout()}>
                        <div className="pr-action-left">
                          <div className="pr-action-ico" style={{ background:'rgba(234,88,12,0.10)', border:'1px solid rgba(234,88,12,0.20)' }}>
                            <FiLogOut size={16} color="#fb923c" />
                          </div>
                          <div>
                            <p className="pr-action-title">Sign Out</p>
                            <p className="pr-action-sub">Log out of your account</p>
                          </div>
                        </div>
                        <FiChevronRight size={16} className="pr-action-arrow" />
                      </div>
                    )}

                    <div className="pr-action-item danger" onClick={() => alert('Please contact support to delete your account')}>
                      <div className="pr-action-left">
                        <div className="pr-action-ico" style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.18)' }}>
                          <FiAlertTriangle size={16} color="#f87171" />
                        </div>
                        <div>
                          <p className="pr-action-title">Delete Account</p>
                          <p className="pr-action-sub" style={{ color:'rgba(248,113,113,0.50)' }}>Permanently remove your account</p>
                        </div>
                      </div>
                      <FiChevronRight size={16} className="pr-action-arrow" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── ADDRESSES TAB ─── */}
            {activeTab === 'addresses' && (
              <div>
                <div className="pr-sec-title">
                  Delivery Addresses
                  {!showAddressForm && (
                    <button className="pr-add-addr-btn" onClick={() => setShowAddressForm(true)}>
                      <FiPlus size={14} /> Add Address
                    </button>
                  )}
                </div>

                {/* Address form */}
                {showAddressForm && (
                  <div className="pr-addr-form-wrap">
                    <div className="pr-addr-form-hdr">
                      <p className="pr-addr-form-title">{editingAddressId ? 'Edit Address' : 'Add New Address'}</p>
                      <button className="pr-addr-close" onClick={handleCancelForm}><FiX size={14} /></button>
                    </div>

                    <div className="pr-map-wrap">
                      <MapLocationPicker
                        onLocationSelect={handleMapLocationSelect}
                        initialLocation={mapLocation?.latitude && mapLocation?.longitude ? { lat: mapLocation.latitude, lng: mapLocation.longitude } : null}
                      />
                    </div>

                    <form onSubmit={handleSaveAddress}>
                      {/* Label */}
                      <div className="pr-field">
                        <label className="pr-label">Address Label</label>
                        <div className="pr-radio-row">
                          {['Home','Office','Other'].map((lbl) => (
                            <label key={lbl} className="pr-radio-label">
                              <input type="radio" name="label" value={lbl} checked={addressFormData.label === lbl} onChange={handleAddressFormChange} className="accent-orange-500" />
                              {lbl}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Name + Phone */}
                      <div className="pr-grid-2">
                        <div className="pr-field">
                          <label className="pr-label">Full Name *</label>
                          <input type="text" name="fullName" value={addressFormData.fullName} onChange={handleAddressFormChange} required className="pr-input" />
                        </div>
                        <div className="pr-field">
                          <label className="pr-label">Phone *</label>
                          <input type="tel" name="phone" value={addressFormData.phone} onChange={handleAddressFormChange} required maxLength="10" className="pr-input" />
                        </div>
                      </div>

                      {/* House/Street */}
                      <div className="pr-field">
                        <label className="pr-label">House No. / Street *</label>
                        <input type="text" name="houseStreet" value={addressFormData.houseStreet} onChange={handleAddressFormChange} required className="pr-input" />
                      </div>

                      {/* Area */}
                      <div className="pr-field">
                        <label className="pr-label">Area / Landmark</label>
                        <input type="text" name="areaLandmark" value={addressFormData.areaLandmark} onChange={handleAddressFormChange} className="pr-input" />
                      </div>

                      {/* City State Pincode */}
                      <div className="pr-grid-3">
                        <div className="pr-field">
                          <label className="pr-label">City *</label>
                          <input type="text" name="city" value={addressFormData.city} onChange={handleAddressFormChange} required className="pr-input" />
                        </div>
                        <div className="pr-field">
                          <label className="pr-label">State *</label>
                          <input type="text" name="state" value={addressFormData.state} onChange={handleAddressFormChange} required className="pr-input" />
                        </div>
                        <div className="pr-field">
                          <label className="pr-label">Pincode *</label>
                          <input type="text" name="pincode" value={addressFormData.pincode} onChange={handleAddressFormChange} required maxLength="6" className="pr-input" />
                        </div>
                      </div>

                      {/* Default checkbox */}
                      <div className="pr-checkbox-row" style={{ marginBottom: 16 }}>
                        <input type="checkbox" checked={addressFormData.isDefault} onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })} className="accent-orange-500 w-4 h-4" />
                        Make this my default address
                      </div>

                      <div className="pr-addr-btn-row">
                        <button type="button" onClick={handleCancelForm} className="pr-addr-cancel-btn">Cancel</button>
                        <button type="submit" disabled={addressLoading} className="pr-addr-save-btn">
                          {addressLoading
                            ? <><svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Saving...</>
                            : <><FiCheck size={14} /> {editingAddressId ? 'Update Address' : 'Save Address'}</>
                          }
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Address list */}
                {addresses.length === 0 && !showAddressForm ? (
                  <div className="pr-empty">
                    <div className="pr-empty-icon"><FiMapPin size={30} color="#fb923c" /></div>
                    <p className="pr-empty-title">No addresses yet</p>
                    <p className="pr-empty-sub">Add a delivery address to get started</p>
                    <button className="pr-add-addr-btn" onClick={() => setShowAddressForm(true)}>
                      <FiPlus size={14} /> Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="pr-addr-list">
                    {addresses.map((addr) => (
                      <div key={addr._id} className="pr-addr-card">
                        <div className="pr-addr-body">
                          <div className="pr-addr-badges">
                            <span className="pr-addr-badge pr-addr-badge-label">{addr.label}</span>
                            {addr.isDefault && <span className="pr-addr-badge pr-addr-badge-default"><FiCheck size={10} /> Default</span>}
                          </div>
                          <p className="pr-addr-name">{addr.fullName}</p>
                          <p className="pr-addr-phone">{addr.phone}</p>
                          <p className="pr-addr-text">
                            {addr.houseStreet}{addr.areaLandmark && `, ${addr.areaLandmark}`}<br />
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                          {addr.distanceFromStore && (
                            <p className="pr-addr-dist">
                              📍 {addr.distanceFromStore.toFixed(1)} km · Delivery in {Math.ceil(addr.estimatedDeliveryTime / 24)} days
                            </p>
                          )}
                        </div>
                        <div className="pr-addr-actions">
                          <button className="pr-addr-act edit" onClick={() => handleEditAddress(addr)} title="Edit"><FiEdit2 size={13} /></button>
                          {!addr.isDefault && <button className="pr-addr-act def" onClick={() => handleSetDefaultAddress(addr._id)} title="Set default"><FiCheck size={13} /></button>}
                          <button className="pr-addr-act del" onClick={() => handleDeleteAddress(addr._id)} title="Delete"><FiTrash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── ORDERS TAB ─── */}
            {activeTab === 'orders' && (
              <div>
                <div className="pr-sec-title">Order History</div>

                {ordersLoading ? (
                  <div className="pr-orders-loader">
                    <div className="pr-spin" />
                    Loading your orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="pr-empty">
                    <div className="pr-empty-icon"><FiPackage size={30} color="#fb923c" /></div>
                    <p className="pr-empty-title">No orders yet</p>
                    <p className="pr-empty-sub">Your order history will appear here</p>
                    <Link to="/products" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'linear-gradient(135deg,#ea580c,#f97316)', color:'#fff', textDecoration:'none', padding:'11px 22px', borderRadius:11, fontSize:14, fontWeight:700 }}>
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div>
                    {orders.map((order) => {
                      // Status style config
                      const STATUS_STYLE = {
                        delivered:  { color:'#4ade80', bg:'rgba(74,222,128,0.12)',  border:'rgba(74,222,128,0.22)'  },
                        processing: { color:'#fbbf24', bg:'rgba(251,191,36,0.10)',  border:'rgba(251,191,36,0.22)'  },
                        packed:     { color:'#fb923c', bg:'rgba(249,115,22,0.10)',  border:'rgba(249,115,22,0.22)'  },
                        shipped:    { color:'#a78bfa', bg:'rgba(167,139,250,0.10)', border:'rgba(167,139,250,0.22)' },
                        cancelled:  { color:'#f87171', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.20)'   },
                      };
                      const sc = STATUS_STYLE[order.orderStatus?.toLowerCase()] || STATUS_STYLE.processing;

                      return (
                        <div key={order._id} className="pr-order-card">
                          {/* Order header */}
                          <div className="pr-order-hdr">
                            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                              <span className="pr-order-id">#{order._id.slice(-8).toUpperCase()}</span>
                              <span className="pr-order-date">
                                <FiClock size={11} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                            <span
                              className="pr-order-status"
                              style={{ background:sc.bg, border:`1px solid ${sc.border}`, color:sc.color }}
                            >
                              <span className="pr-order-status-dot" style={{ background:sc.color }} />
                              {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                            </span>
                          </div>

                          {/* Order items */}
                          <div className="pr-order-body">
                            <div className="pr-order-items">
                              {(order.orderItems || []).slice(0, 3).map((item, idx) => (
                                <div key={idx} className="pr-order-item">
                                  <img
                                    src={getImageUrl(item.image) || 'https://via.placeholder.com/54x54?text=Product'}
                                    alt={item.name}
                                    className="pr-order-item-img"
                                    onError={e => { e.target.src = 'https://via.placeholder.com/54x54?text=Product'; }}
                                  />
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <p className="pr-order-item-name">{item.name}</p>
                                    <p className="pr-order-item-qty">Qty: {item.quantity}</p>
                                  </div>
                                  <span className="pr-order-item-price">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                              {(order.orderItems || []).length > 3 && (
                                <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.35)', paddingLeft:2 }}>
                                  + {order.orderItems.length - 3} more item{order.orderItems.length - 3 > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="pr-order-footer">
                              <div>
                                <p className="pr-order-total-lbl">Order Total</p>
                                <p className="pr-order-total-val">{formatPrice(order.totalPrice)}</p>
                              </div>
                              <Link to={`/orders/${order._id}`} className="pr-order-track-btn">
                                <FiTruck size={13} /> Track Order
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── WISHLIST TAB ─── */}
            {activeTab === 'wishlist' && (
              <div>
                <div className="pr-sec-title">
                  Saved Items
                  {contextWishlistItems.length > 0 && (
                    <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.38)', fontFamily:'DM Sans,sans-serif' }}>
                      {contextWishlistItems.length} {contextWishlistItems.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>

                {wishlistLoading ? (
                  <div className="prwl-loader">
                    <div className="pr-spin" />
                    Loading your wishlist...
                  </div>
                ) : contextWishlistItems.length === 0 ? (
                  <div className="pr-empty">
                    <div className="pr-empty-icon"><FiHeart size={30} color="#fb923c" /></div>
                    <p className="pr-empty-title">Your wishlist is empty</p>
                    <p className="pr-empty-sub">Save items you love to find them later</p>
                    <Link to="/products" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'linear-gradient(135deg,#ea580c,#f97316)', color:'#fff', textDecoration:'none', padding:'11px 22px', borderRadius:11, fontSize:14, fontWeight:700 }}>
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  <div className="prwl-grid">
                    {contextWishlistItems.map((item) => {
                      const product = item.product || item;
                      if (!product?._id) return null;
                      return (
                        <div key={product._id} className="prwl-card">
                          {/* Image */}
                          <div className="prwl-img-wrap">
                            <img
                              src={getImageUrl(product.images?.[0])}
                              alt={product.name}
                              className="prwl-img"
                              onError={e => { e.target.src = 'https://via.placeholder.com/220x180?text=Product'; }}
                            />
                            <div className="prwl-img-grad" />
                            <button
                              className="prwl-remove"
                              onClick={() => handleRemoveFromWishlist(product._id)}
                              title="Remove from wishlist"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>

                          {/* Info */}
                          <div className="prwl-info">
                            <p className="prwl-cat">{product.category?.name || 'Handloom'}</p>
                            <p className="prwl-name">{product.name}</p>
                            <p className="prwl-price">{formatPrice(product.price)}</p>
                            <Link
                              to={`/products/${product._id}`}
                              style={{ fontSize:12, color:'rgba(255,255,255,0.38)', textDecoration:'none', marginBottom:4 }}
                            >
                              View Details →
                            </Link>
                            <button
                              className={`prwl-cart-btn ${product.stock === 0 ? 'oos' : ''}`}
                              disabled={product.stock === 0}
                              onClick={() => { addToCart(product, 1); }}
                            >
                              <FiShoppingCart size={13} />
                              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;