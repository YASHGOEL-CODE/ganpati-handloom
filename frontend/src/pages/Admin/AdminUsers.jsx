import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiSearch, FiLock, FiUnlock, FiTrash2, FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';

/* ── Avatar with gradient initials ── */
const Avatar = ({ name }) => {
  const initials = (name || '?')
    .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = [
    ['#ea580c','#f97316'], ['#2563eb','#3b82f6'], ['#7c3aed','#8b5cf6'],
    ['#059669','#10b981'], ['#d97706','#f59e0b'], ['#dc2626','#ef4444'],
  ];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  const [c1, c2] = colors[idx];
  return (
    <div style={{
      width:38, height:38, borderRadius:'50%', flexShrink:0,
      background:`linear-gradient(135deg,${c1},${c2})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:13, fontWeight:800, color:'#fff',
      boxShadow:`0 0 12px ${c1}55`,
    }}>
      {initials}
    </div>
  );
};

const AdminUsers = () => {
  // ── All state completely unchanged ──
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ── All useEffects & handlers completely unchanged ──
  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      if (response.data.success) setUsers(response.data.users);
    } catch (error) { console.error('Error fetching users:', error); }
    finally { setLoading(false); }
  };

  const handleToggleBlock = async (userId) => {
    try {
      const response = await adminAPI.toggleUserBlock(userId);
      if (response.data.success) { alert(response.data.message); fetchUsers(); }
    } catch (error) {
      console.error('Error toggling user block:', error);
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const response = await adminAPI.deleteUser(userId);
      if (response.data.success) { alert('User deleted successfully!'); fetchUsers(); }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  // ── Filter logic completely unchanged ──
  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Quick stats
  const activeCount  = users.filter(u => u.isActive).length;
  const blockedCount = users.filter(u => !u.isActive).length;
  const weekAgo      = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek  = users.filter(u => new Date(u.createdAt) > weekAgo).length;

  if (loading) {
    return (
      <>
        <style>{`.au-load{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at top left,#0f172a,#000,#020617);}.au-spin{width:44px;height:44px;border-radius:50%;border:3px solid rgba(249,115,22,0.18);border-top-color:#f97316;animation:auSpin .75s linear infinite;}@keyframes auSpin{to{transform:rotate(360deg)}}`}</style>
        <div className="au-load"><div className="au-spin" /></div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .au-page { min-height:100vh; font-family:'DM Sans',sans-serif; background:radial-gradient(circle at top left,#0f172a 0%,#000 50%,#020617 100%); padding:32px 28px 80px; }
        @media(max-width:640px){ .au-page{padding:18px 14px 60px;} }
        .au-wrap { max-width:1320px; margin:0 auto; }

        /* Header */
        .au-header { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:14px; background:rgba(255,255,255,0.04); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:22px 26px; margin-bottom:18px; position:relative; }
        .au-header::before { content:''; position:absolute; top:0; left:0; right:0; height:1.5px; background:linear-gradient(90deg,#f97316,#ea580c,transparent); border-radius:20px 20px 0 0; }
        .au-eyebrow { font-size:11px; font-weight:700; color:#f97316; letter-spacing:.14em; text-transform:uppercase; margin-bottom:6px; display:flex; align-items:center; gap:6px; }
        .au-eyebrow::before { content:''; display:inline-block; width:12px; height:1.5px; background:#f97316; }
        .au-title { font-size:clamp(22px,3vw,34px); font-weight:800; color:#fff; line-height:1.1; }
        .au-total { display:inline-flex; align-items:center; background:rgba(249,115,22,0.12); border:1px solid rgba(249,115,22,0.22); color:#fb923c; font-size:12px; font-weight:700; padding:4px 12px; border-radius:999px; margin-left:12px; vertical-align:middle; }

        /* Quick stats */
        .au-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:18px; }
        @media(max-width:640px){ .au-stats{grid-template-columns:1fr 1fr 1fr;} }
        .au-stat { background:rgba(255,255,255,0.04); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:16px 18px; display:flex; align-items:center; gap:13px; transition:border-color .25s,box-shadow .25s; }
        .au-stat:hover { border-color:rgba(255,255,255,0.14); box-shadow:0 8px 26px rgba(0,0,0,0.22); }
        .au-stat-ico { width:40px; height:40px; border-radius:11px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .au-stat-val { font-size:22px; font-weight:800; color:#f1f5f9; line-height:1; margin-bottom:3px; }
        .au-stat-lbl { font-size:11px; font-weight:600; color:rgba(255,255,255,0.34); text-transform:uppercase; letter-spacing:.07em; }

        /* Search */
        .au-search-wrap { background:rgba(255,255,255,0.04); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:14px 18px; margin-bottom:18px; position:relative; }
        .au-search-ico { position:absolute; left:30px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.28); pointer-events:none; }
        .au-search { width:100%; background:rgba(0,0,0,0.30); border:1.5px solid rgba(255,255,255,0.09); border-radius:11px; padding:11px 14px 11px 42px; color:#fff; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color .22s,box-shadow .22s; }
        .au-search::placeholder { color:rgba(255,255,255,0.22); }
        .au-search:focus { border-color:#f97316; box-shadow:0 0 0 3px rgba(249,115,22,0.14); }

        /* Glass table */
        .au-table-card { background:rgba(255,255,255,0.04); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.08); border-radius:20px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.28); }
        .au-table-scroll { overflow-x:auto; scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.10) transparent; }
        .au-table { width:100%; border-collapse:collapse; }
        .au-thead-row { background:rgba(0,0,0,0.30); border-bottom:1px solid rgba(255,255,255,0.07); }
        .au-th { text-align:left; padding:13px 18px; font-size:10.5px; font-weight:800; color:rgba(255,255,255,0.28); text-transform:uppercase; letter-spacing:.10em; white-space:nowrap; }
        .au-row { border-bottom:1px solid rgba(255,255,255,0.05); border-left:3px solid transparent; transition:background .2s,border-left-color .2s; animation:auRowIn .45s ease both; }
        .au-row:last-child { border-bottom:none; }
        .au-row:hover { background:rgba(255,255,255,0.06); border-left-color:#f97316; }
        @keyframes auRowIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .au-td { padding:13px 18px; vertical-align:middle; }

        /* Name cell */
        .au-name-cell { display:flex; align-items:center; gap:11px; }
        .au-name-text { font-size:14px; font-weight:700; color:#f1f5f9; }

        /* Email/phone */
        .au-muted { font-size:12.5px; color:rgba(255,255,255,0.40); }

        /* Status badge */
        .au-badge { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:800; padding:4px 11px; border-radius:999px; white-space:nowrap; }
        .au-badge-active { background:rgba(74,222,128,0.12); border:1px solid rgba(74,222,128,0.25); color:#4ade80; box-shadow:0 0 8px rgba(74,222,128,0.18); }
        .au-badge-blocked { background:rgba(239,68,68,0.10); border:1px solid rgba(239,68,68,0.22); color:#f87171; }
        .au-badge-dot { width:6px; height:6px; border-radius:50%; }

        /* Date */
        .au-date { font-size:12.5px; color:rgba(255,255,255,0.35); white-space:nowrap; }

        /* Action buttons */
        .au-act { width:32px; height:32px; border-radius:9px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .2s,border-color .2s,color .2s,transform .2s; }
        .au-act:hover { transform:scale(1.10); }
        .au-act.lock:hover   { background:rgba(239,68,68,0.14); border-color:rgba(239,68,68,0.28); color:#f87171; }
        .au-act.unlock:hover { background:rgba(74,222,128,0.12); border-color:rgba(74,222,128,0.25); color:#4ade80; }
        .au-act.del:hover    { background:rgba(239,68,68,0.14); border-color:rgba(239,68,68,0.28); color:#f87171; }

        /* Empty */
        .au-empty { text-align:center; padding:52px 20px; font-size:14px; color:rgba(255,255,255,0.28); }
      `}</style>

      <div className="au-page">
        <div className="au-wrap">

          {/* Header */}
          <div className="au-header">
            <div>
              <p className="au-eyebrow">Admin Panel</p>
              <h1 className="au-title">
                Manage Users
                <span className="au-total">{users.length} total</span>
              </h1>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="au-stats">
            <div className="au-stat">
              <div className="au-stat-ico" style={{ background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.22)' }}>
                <FiUsers size={18} color="#f97316" />
              </div>
              <div><p className="au-stat-val">{users.length}</p><p className="au-stat-lbl">Total Users</p></div>
            </div>
            <div className="au-stat">
              <div className="au-stat-ico" style={{ background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.22)' }}>
                <FiUserCheck size={18} color="#4ade80" />
              </div>
              <div><p className="au-stat-val" style={{ color:'#4ade80' }}>{activeCount}</p><p className="au-stat-lbl">Active</p></div>
            </div>
            <div className="au-stat">
              <div className="au-stat-ico" style={{ background:'rgba(96,165,250,0.12)', border:'1px solid rgba(96,165,250,0.22)' }}>
                <FiUsers size={18} color="#60a5fa" />
              </div>
              <div><p className="au-stat-val" style={{ color:'#60a5fa' }}>{newThisWeek}</p><p className="au-stat-lbl">New This Week</p></div>
            </div>
          </div>

          {/* Search */}
          <div className="au-search-wrap">
            <FiSearch size={16} className="au-search-ico" style={{ left:30 }} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="au-search"
            />
          </div>

          {/* Glass table */}
          <div className="au-table-card">
            <div className="au-table-scroll">
              <table className="au-table">
                <thead>
                  <tr className="au-thead-row">
                    <th className="au-th">User</th>
                    <th className="au-th">Email</th>
                    <th className="au-th">Phone</th>
                    <th className="au-th">Status</th>
                    <th className="au-th">Joined</th>
                    <th className="au-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, i) => (
                    <tr key={user._id} className="au-row" style={{ animationDelay:`${i*40}ms` }}>
                      <td className="au-td">
                        <div className="au-name-cell">
                          <Avatar name={user.fullName} />
                          <span className="au-name-text">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="au-td"><span className="au-muted">{user.email}</span></td>
                      <td className="au-td"><span className="au-muted">{user.phone || 'N/A'}</span></td>
                      <td className="au-td">
                        <span className={`au-badge ${user.isActive ? 'au-badge-active' : 'au-badge-blocked'}`}>
                          <span className="au-badge-dot" style={{ background: user.isActive ? '#4ade80' : '#f87171' }} />
                          {user.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="au-td"><span className="au-date">{new Date(user.createdAt).toLocaleDateString()}</span></td>
                      <td className="au-td">
                        <div style={{ display:'flex', gap:7 }}>
                          <button
                            className={`au-act ${user.isActive ? 'lock' : 'unlock'}`}
                            onClick={() => handleToggleBlock(user._id)}
                            title={user.isActive ? 'Block User' : 'Unblock User'}
                            style={{ color:user.isActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.35)' }}
                          >
                            {user.isActive ? <FiLock size={14}/> : <FiUnlock size={14}/>}
                          </button>
                          <button className="au-act del" onClick={() => handleDelete(user._id)} title="Delete" style={{ color:'rgba(255,255,255,0.35)' }}>
                            <FiTrash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="au-empty">No users found</div>}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminUsers;