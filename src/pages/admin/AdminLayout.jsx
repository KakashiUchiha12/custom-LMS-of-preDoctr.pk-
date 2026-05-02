import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Database, 
  Flag, 
  MessageSquare, 
  Zap, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'User Management', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'MCQ Database', path: '/admin/mcqs', icon: <Database size={20} /> },
    { name: 'Flagged Content', path: '/admin/flags', icon: <Flag size={20} /> },
    { name: 'Comments', path: '/admin/comments', icon: <MessageSquare size={20} /> },
    { name: 'Marketing & Offers', path: '/admin/marketing', icon: <Zap size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className={`admin-layout ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon">PD</div>
          <span className="brand-name">preDoctr Admin</span>
          <button className="sidebar-toggle-mobile" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <NavLink 
              key={index} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.path === '/admin'}
            >
              <span className="link-icon">{item.icon}</span>
              <span className="link-text">{item.name}</span>
              {location.pathname === item.path && <ChevronRight size={14} className="active-indicator" />}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Admin Header / Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={20} />
            </button>
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search students or MCQs..." />
            </div>
          </div>
          
          <div className="topbar-right">
            <button className="icon-btn notification-btn">
              <Bell size={20} />
              <span className="badge"></span>
            </button>
            <div className="admin-profile">
              <div className="admin-avatar">A</div>
              <div className="admin-info">
                <span className="admin-name">Master Admin</span>
                <span className="admin-role">System Controller</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
