import React, { useState } from 'react';
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
  Download
} from 'lucide-react';
import './UserManager.css';

const UserManager = () => {
  const [filter, setFilter] = useState('all');
  
  // Mock users data
  const users = [
    { 
      id: 1, 
      name: 'Ahmed Khan', 
      whatsapp: '+92 300 1234567', 
      email: 'ahmed.k@example.com',
      status: 'Trial',
      activity: 'Attempted Biology Test',
      lastActive: '2 mins ago',
      level: 'Free',
      joined: 'May 1, 2024'
    },
    { 
      id: 2, 
      name: 'Sara Malik', 
      whatsapp: '+92 321 7654321', 
      email: 'sara.m@example.com',
      status: 'Paid',
      activity: 'Watched Physics Lecture',
      lastActive: '15 mins ago',
      level: 'Lectures Only',
      joined: 'April 28, 2024'
    },
    { 
      id: 3, 
      name: 'Bilal Ahmed', 
      whatsapp: '+92 333 9876543', 
      email: 'bilal.a@example.com',
      status: 'Trial',
      activity: 'Signed up',
      lastActive: '45 mins ago',
      level: 'Free',
      joined: 'May 1, 2024'
    },
    { 
      id: 4, 
      name: 'Zainab Qureshi', 
      whatsapp: '+92 345 6789012', 
      email: 'zainab.q@example.com',
      status: 'Paid',
      activity: 'Attempted Chemistry Mock',
      lastActive: '1 hour ago',
      level: 'Pro (Full Access)',
      joined: 'April 25, 2024'
    },
    { 
      id: 5, 
      name: 'Usman Ali', 
      whatsapp: '+92 311 2233445', 
      email: 'usman.ali@example.com',
      status: 'Trial',
      activity: 'Watched English Intro',
      lastActive: '3 hours ago',
      level: 'Free',
      joined: 'May 1, 2024'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#10b981';
      case 'Trial': return '#f59e0b';
      default: return '#64748b';
    }
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
          <input type="text" placeholder="Search by name, email, or WhatsApp..." />
        </div>
        <div className="filter-group">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Users</button>
          <button className={`filter-btn ${filter === 'trial' ? 'active' : ''}`} onClick={() => setFilter('trial')}>Trial Accounts</button>
          <button className={`filter-btn ${filter === 'paid' ? 'active' : ''}`} onClick={() => setFilter('paid')}>Paid Members</button>
          <button className="btn-advanced"><Filter size={18} /> More Filters</button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Contact</th>
              <th>Recent Activity</th>
              <th>Access Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="student-cell">
                    <div className="avatar">{user.name.charAt(0)}</div>
                    <div className="info">
                      <span className="name">{user.name}</span>
                      <span className="joined">Joined: {user.joined}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: `${getStatusColor(user.status)}15`, color: getStatusColor(user.status) }}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="contact-cell">
                    <div className="contact-item">
                      <Smartphone size={14} />
                      <span>{user.whatsapp}</span>
                    </div>
                    <div className="contact-item">
                      <ExternalLink size={14} />
                      <span className="email">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="activity-cell">
                    <span className="activity-text">{user.activity}</span>
                    <span className="last-active"><Clock size={12} /> {user.lastActive}</span>
                  </div>
                </td>
                <td>
                  <div className="level-cell">
                    <Award size={16} color={user.level === 'Free' ? '#94a3b8' : '#3b82f6'} />
                    <span>{user.level}</span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-upgrade">Upgrade</button>
                    <button className="btn-icon"><MoreVertical size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span>Showing 5 of 1,240 users</span>
        <div className="page-controls">
          <button className="btn-page"><ChevronLeft size={18} /></button>
          <button className="btn-page active">1</button>
          <button className="btn-page">2</button>
          <button className="btn-page">3</button>
          <button className="btn-page">...</button>
          <button className="btn-page">24</button>
          <button className="btn-page"><ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
