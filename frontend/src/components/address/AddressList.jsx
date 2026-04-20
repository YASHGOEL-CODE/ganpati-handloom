import React, { useState, useEffect } from 'react';
import { addressAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiEdit2, FiTrash2, FiCheck, FiPlus, FiHome, FiBriefcase } from 'react-icons/fi';

const AddressList = ({ selectable = false, onSelect, returnUrl = null }) => {
  const [addresses, setAddresses]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchAddresses(); }, []);

  // ── All logic completely unchanged ──
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressAPI.getAll();
      console.log('📍 Addresses fetched:', response.data.addresses);
      setAddresses(response.data.addresses);
      if (selectable) {
        const defaultAddr = response.data.addresses.find((addr) => addr.isDefault);
        if (defaultAddr) {
          setSelectedId(defaultAddr._id);
          if (onSelect) onSelect(defaultAddr);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (address) => {
    if (selectable) {
      setSelectedId(address._id);
      if (onSelect) onSelect(address);
    }
  };

  const handleEdit = (id, e) => {
    if (e) e.stopPropagation();
    if (returnUrl) {
      navigate(`/edit-address/${id}?returnUrl=${returnUrl}`);
    } else {
      navigate(`/edit-address/${id}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await addressAPI.delete(id);
      fetchAddresses();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressAPI.setDefault(id);
      fetchAddresses();
    } catch (error) {
      console.error('Set default error:', error);
      alert('Failed to set default address');
    }
  };

  if (loading) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'40px 0' }}>
        <div style={{
          width:36, height:36, borderRadius:'50%',
          border:'3px solid rgba(234,88,12,0.20)',
          borderTopColor:'#ea580c',
          animation:'addrSpin .8s linear infinite',
        }} />
        <style>{`@keyframes addrSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <>
        <style>{`
          .al-empty { text-align:center; padding:40px 20px; }
          .al-empty-icon { width:72px; height:72px; border-radius:50%; background:rgba(234,88,12,0.08); border:1px solid rgba(234,88,12,0.18); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }
          .al-empty-txt { font-size:14px; color:rgba(255,255,255,0.40); margin-bottom:18px; }
          .al-add-btn { display:inline-flex; align-items:center; gap:7px; background:linear-gradient(135deg,#ea580c,#f97316); color:#fff; border:none; border-radius:10px; padding:11px 20px; font-size:13.5px; font-weight:700; cursor:pointer; transition:transform .2s,box-shadow .2s; box-shadow:0 4px 14px rgba(234,88,12,0.28); font-family:inherit; }
          .al-add-btn:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(234,88,12,0.42); }
        `}</style>
        <div className="al-empty">
          <div className="al-empty-icon"><FiMapPin size={28} color="#fb923c" /></div>
          <p className="al-empty-txt">No addresses added yet</p>
          <button className="al-add-btn" onClick={() => navigate('/add-address')}>
            <FiPlus size={15} /> Add Your First Address
          </button>
        </div>
      </>
    );
  }

  const getLabelIcon = (label) => {
    if (label === 'Home')   return <FiHome size={12} />;
    if (label === 'Office') return <FiBriefcase size={12} />;
    return <FiMapPin size={12} />;
  };

  const getLabelColor = (label) => {
    if (label === 'Home')   return { bg:'rgba(59,130,246,0.15)', border:'rgba(59,130,246,0.25)', color:'#93c5fd' };
    if (label === 'Office') return { bg:'rgba(167,139,250,0.15)', border:'rgba(167,139,250,0.25)', color:'#c4b5fd' };
    return { bg:'rgba(255,255,255,0.08)', border:'rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.55)' };
  };

  return (
    <>
      <style>{`
        .al-list { display:flex; flex-direction:column; gap:12px; }

        .al-card {
          border-radius:16px; padding:18px 16px;
          border: 1.5px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          transition: border-color .25s, background .25s, transform .25s, box-shadow .25s;
          position: relative;
        }
        .al-card.selectable { cursor:pointer; }
        .al-card.selectable:hover {
          border-color: rgba(234,88,12,0.28);
          background: rgba(234,88,12,0.04);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.20);
        }
        .al-card.selected {
          border-color: #ea580c !important;
          background: rgba(234,88,12,0.07) !important;
          box-shadow: 0 0 0 3px rgba(234,88,12,0.12);
        }
        /* Selected indicator line */
        .al-card.selected::before {
          content:''; position:absolute; top:0; left:0; bottom:0;
          width:3px; border-radius:16px 0 0 16px;
          background:linear-gradient(to bottom,#ea580c,#f97316);
        }

        .al-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .al-card-body { flex:1; min-width:0; }

        .al-badges { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
        .al-badge {
          display:inline-flex; align-items:center; gap:4px;
          font-size:10.5px; font-weight:700;
          padding:3px 9px; border-radius:999px;
          border:1px solid transparent;
        }
        .al-badge-default { background:rgba(74,222,128,0.12); border-color:rgba(74,222,128,0.22); color:#4ade80; }
        .al-badge-selected { background:rgba(234,88,12,0.14); border-color:rgba(234,88,12,0.25); color:#fb923c; }

        .al-name { font-size:15px; font-weight:700; color:#f1f5f9; margin-bottom:3px; }
        .al-phone { font-size:12.5px; color:rgba(255,255,255,0.40); margin-bottom:8px; }
        .al-address { font-size:13.5px; color:rgba(255,255,255,0.55); line-height:1.55; margin-bottom:10px; }

        .al-meta { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:8px; }
        .al-meta-item { display:flex; align-items:center; gap:5px; font-size:12px; color:rgba(255,255,255,0.38); }
        .al-meta-item strong { color:rgba(255,255,255,0.65); font-weight:700; }

        .al-delivery-badge {
          display:inline-flex; align-items:center; gap:5px;
          font-size:11px; font-weight:700;
          padding:3px 10px; border-radius:999px;
        }
        .al-delivery-free { background:rgba(74,222,128,0.12); border:1px solid rgba(74,222,128,0.22); color:#4ade80; }
        .al-delivery-paid { background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.22); color:#93c5fd; }

        /* Action buttons */
        .al-actions { display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
        .al-action-btn {
          width:32px; height:32px; border-radius:9px;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
          color:rgba(255,255,255,0.40); display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:background .2s,border-color .2s,color .2s;
        }
        .al-action-btn.edit:hover    { background:rgba(234,88,12,0.14); border-color:rgba(234,88,12,0.28); color:#fb923c; }
        .al-action-btn.default:hover { background:rgba(74,222,128,0.12); border-color:rgba(74,222,128,0.25); color:#4ade80; }
        .al-action-btn.delete:hover  { background:rgba(239,68,68,0.12); border-color:rgba(239,68,68,0.25); color:#f87171; }

        /* Add address button */
        .al-add-new {
          display:flex; align-items:center; justify-content:center; gap:9px;
          background:rgba(255,255,255,0.03); border:1.5px dashed rgba(255,255,255,0.12);
          color:rgba(255,255,255,0.40); border-radius:16px; padding:16px;
          cursor:pointer; font-size:13.5px; font-weight:600; font-family:inherit;
          width:100%; transition:border-color .2s,color .2s,background .2s;
        }
        .al-add-new:hover { border-color:rgba(234,88,12,0.35); color:#fb923c; background:rgba(234,88,12,0.04); }
      `}</style>

      <div className="al-list">
        {addresses.map((address) => {
          const lc = getLabelColor(address.label);
          const isSelected = selectable && selectedId === address._id;
          return (
            <div
              key={address._id}
              className={`al-card ${selectable ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(address)}
            >
              <div className="al-card-top">
                <div className="al-card-body">
                  {/* Badges row */}
                  <div className="al-badges">
                    <span className="al-badge" style={{ background:lc.bg, borderColor:lc.border, color:lc.color }}>
                      {getLabelIcon(address.label)} {address.label}
                    </span>
                    {address.isDefault && (
                      <span className="al-badge al-badge-default">
                        <FiCheck size={10} /> Default
                      </span>
                    )}
                    {isSelected && (
                      <span className="al-badge al-badge-selected">
                        <FiCheck size={10} /> Selected
                      </span>
                    )}
                  </div>

                  {/* Name + Phone */}
                  <p className="al-name">{address.fullName}</p>
                  <p className="al-phone">{address.phone}</p>

                  {/* Full address */}
                  <p className="al-address">
                    {address.houseStreet}
                    {address.areaLandmark && `, ${address.areaLandmark}`}
                    <br />
                    {address.city}, {address.state} — {address.pincode}
                  </p>

                  {/* Distance + ETA */}
                  {address.distanceFromStore !== null && address.distanceFromStore !== undefined && (
                    <div className="al-meta">
                      <span className="al-meta-item">
                        <FiMapPin size={12} color="#fb923c" />
                        <strong>{address.distanceFromStore.toFixed(1)} km</strong> from store
                      </span>
                      {address.estimatedDeliveryTime && (
                        <span className="al-meta-item">
                          • Delivery in <strong>{Math.ceil(address.estimatedDeliveryTime / 24)} day(s)</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Delivery charge badge */}
                  {address.deliveryCharge !== null && address.deliveryCharge !== undefined && (
                    <span className={`al-delivery-badge ${address.deliveryCharge === 0 ? 'al-delivery-free' : 'al-delivery-paid'}`}>
                      {address.deliveryCharge === 0
                        ? <><FiCheck size={10} /> FREE Delivery</>
                        : <>Delivery: ₹{address.deliveryCharge.toFixed(2)}</>
                      }
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="al-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="al-action-btn edit" onClick={(e) => handleEdit(address._id, e)} title="Edit">
                    <FiEdit2 size={13} />
                  </button>
                  {!selectable && (
                    <>
                      {!address.isDefault && (
                        <button className="al-action-btn default" onClick={() => handleSetDefault(address._id)} title="Set as default">
                          <FiCheck size={13} />
                        </button>
                      )}
                      <button className="al-action-btn delete" onClick={() => handleDelete(address._id)} title="Delete">
                        <FiTrash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add new address */}
        {!selectable && (
          <button className="al-add-new" onClick={() => navigate('/add-address')}>
            <FiPlus size={16} /> Add New Address
          </button>
        )}
      </div>
    </>
  );
};

export default AddressList;