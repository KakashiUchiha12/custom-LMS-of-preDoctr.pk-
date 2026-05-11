import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Smartphone, 
  Clock, 
  Award,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Download,
  XCircle
} from 'lucide-react';
import { api } from '../../utils/api';
import './UserManager.css';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    has_mcq_access: false,
    has_lecture_access: false,
    give_full_access_24h: false
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/admin/users?search=${search}&filter=${filter}&page=${page}&limit=${limit}`);
      setUsers(data.users);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, filter, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleOpenUpgradeModal = (user) => {
    setCurrentUser(user);
    setFormData({
      has_mcq_access: user.has_mcq_access || false,
      has_lecture_access: user.has_lecture_access || false,
      give_full_access_24h: false
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, checked, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : e.target.value }));
  };

  const handleSaveAccess = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/admin/users/${currentUser.id}/access`, formData);
      setIsModalOpen(false);
      fetchUsers(); // Refresh
    } catch (err) {
      console.error('Failed to update access:', err);
      alert('Failed to update access');
    }
  };

  const getStatusColor = (user) => {
    if (user.full_access_until && new Date(user.full_access_until) > new Date()) return '#10b981'; // Active 24h
    if (user.access_level === 'paid') return '#10b981';
    return '#64748b';
  };

  const getAccessLevelText = (user) => {
    if (user.full_access_until && new Date(user.full_access_until) > new Date()) return 'Pro (24h Access)';
    if (user.has_mcq_access && user.has_lecture_access) return 'Pro (Full Access)';
    if (user.has_mcq_access) return 'Question Bank Only';
    if (user.has_lecture_access) return 'Lectures Only';
    return 'Free';
  };

  return (
    <div className="user-manager">
      <div className="manager-header">
        <div>
          <h1>User Management</h1>
          <p>View, track, and upgrade your student accounts.</p>
        </div>
        <button className="btn-export">
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Filters & Search */}
      <div className="manager-controls">
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or WhatsApp..." 
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-group">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => handleFilterChange('all')}>All Users</button>
          <button className={`filter-btn ${filter === 'free' ? 'active' : ''}`} onClick={() => handleFilterChange('free')}>Free Accounts</button>
          <button className={`filter-btn ${filter === 'paid' ? 'active' : ''}`} onClick={() => handleFilterChange('paid')}>Paid Members</button>
          <button className="btn-advanced"><Filter size={18} /> More Filters</button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Joined</th>
                <th>Access Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="student-cell">
                      <div className="avatar">{user.name?.charAt(0) || 'U'}</div>
                      <div className="info">
                        <span className="name">{user.name}</span>
                        <span className="joined">ID: {user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: `${getStatusColor(user)}15`, color: getStatusColor(user) }}>
                      {user.access_level === 'paid' ? 'Paid' : 'Free'}
                    </span>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <div className="contact-item">
                        <Smartphone size={14} />
                        <span>{user.whatsapp || 'N/A'}</span>
                      </div>
                      <div className="contact-item">
                        <ExternalLink size={14} />
                        <span className="email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="level-cell">
                      <Award size={16} color={getAccessLevelText(user) === 'Free' ? '#94a3b8' : '#3b82f6'} />
                      <span>{getAccessLevelText(user)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-upgrade" onClick={() => handleOpenUpgradeModal(user)}>Grant Access</button>
                      <button className="btn-icon"><MoreVertical size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span>Showing {users.length} of {total} users</span>
        <div className="page-controls">
          <button 
            className="btn-page" 
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={18} />
          </button>
          <button className="btn-page active">{page}</button>
          <button 
            className="btn-page" 
            disabled={page >= Math.ceil(total / limit)} 
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Upgrade Access Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Grant Access to {currentUser?.name}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleSaveAccess}>
              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="has_mcq_access" 
                    checked={formData.has_mcq_access} 
                    onChange={handleFormChange} 
                  />
                  <span>Question Bank MCQs Access</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="has_lecture_access" 
                    checked={formData.has_lecture_access} 
                    onChange={handleFormChange} 
                  />
                  <span>Lectures Access</span>
                </label>
              </div>
              <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />
              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="give_full_access_24h" 
                    checked={formData.give_full_access_24h} 
                    onChange={handleFormChange} 
                  />
                  <span>Give Full Access for 24 Hours</span>
                </label>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  This will override other settings and grant full access for exactly 24 hours.
                </p>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
