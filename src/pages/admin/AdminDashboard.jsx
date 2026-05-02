import React, { useState } from 'react';
import { 
  Users, 
  Eye, 
  Globe, 
  MessageSquare, 
  Flag, 
  Database, 
  TrendingUp, 
  UserCheck, 
  Clock,
  ArrowUpRight,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [chartPeriod, setChartPeriod] = useState('weekly');

  const stats = [
    { title: 'New Registered Today', value: '142', icon: <Users size={20} />, trend: '+12%', color: '#3b82f6' },
    { title: 'Daily Page Views', value: '12,450', icon: <Eye size={20} />, trend: '+5%', color: '#10b981' },
    { title: 'Active Trial Users', value: '850', icon: <Clock size={20} />, trend: '+18%', color: '#f59e0b' },
    { title: 'Flagged MCQs', value: '24', icon: <Flag size={20} />, trend: '-2', color: '#ef4444' },
  ];

  const weeklyData = [
    { name: 'Mon', users: 45, views: 1200 },
    { name: 'Tue', users: 52, views: 1450 },
    { name: 'Wed', users: 38, views: 1100 },
    { name: 'Thu', users: 65, views: 1800 },
    { name: 'Fri', users: 48, views: 1300 },
    { name: 'Sat', users: 70, views: 2100 },
    { name: 'Sun', users: 55, views: 1600 },
  ];

  const monthlyData = [
    { name: 'Week 1', users: 320, views: 9800 },
    { name: 'Week 2', users: 410, views: 12400 },
    { name: 'Week 3', users: 290, views: 8900 },
    { name: 'Week 4', users: 450, views: 14200 },
  ];

  const activeData = chartPeriod === 'weekly' ? weeklyData : monthlyData;

  const topSources = [
    { source: 'Direct', views: '4,200', share: '42%' },
    { source: 'Google Search', views: '3,100', share: '31%' },
    { source: 'WhatsApp / Social', views: '2,400', share: '24%' },
    { source: 'Referral', views: '300', share: '3%' },
  ];

  const geoData = [
    { city: 'Lahore', students: '3,200', trend: 'high' },
    { city: 'Karachi', students: '2,800', trend: 'stable' },
    { city: 'Islamabad', students: '1,500', trend: 'high' },
    { city: 'Faisalabad', students: '900', trend: 'stable' },
    { city: 'Peshawar', students: '650', trend: 'low' },
  ];

  const trialActivity = [
    { name: 'Ahmed Khan', whatsapp: '+92 300 1234567', action: 'Attempted Biology Test', time: '2 mins ago' },
    { name: 'Sara Malik', whatsapp: '+92 321 7654321', action: 'Watched Physics Lecture', time: '15 mins ago' },
    { name: 'Bilal Ahmed', whatsapp: '+92 333 9876543', action: 'Started Trial', time: '45 mins ago' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Command Center</h1>
          <p>Welcome back, Admin. Here's what's happening at preDoctr.pk today.</p>
        </div>
        <div className="admin-actions">
          <button className="btn-secondary">Export Report</button>
          <button className="btn-primary">Launch Offer</button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <div className="stat-value-row">
                <span className="value">{stat.value}</span>
                <span className={`trend ${stat.trend.startsWith('+') ? 'up' : 'down'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-row chart-row">
        <div className="dashboard-card growth-chart">
          <div className="card-header">
            <div>
              <h3>User Growth & Views</h3>
              <p className="card-subtitle">Showing performance metrics for {chartPeriod}</p>
            </div>
            <div className="chart-toggles">
              <button 
                className={`toggle-btn ${chartPeriod === 'weekly' ? 'active' : ''}`}
                onClick={() => setChartPeriod('weekly')}
              >
                Weekly
              </button>
              <button 
                className={`toggle-btn ${chartPeriod === 'monthly' ? 'active' : ''}`}
                onClick={() => setChartPeriod('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
          
          <div className="chart-container" style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                  }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" height={36} />
                <Bar 
                  dataKey="users" 
                  name="New Users" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32} 
                />
                <Bar 
                  dataKey="views" 
                  name="Page Views" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card traffic-sources">
          <div className="card-header">
            <h3>Traffic Sources</h3>
            <ExternalLink size={16} />
          </div>
          <div className="source-list">
            {topSources.map((s, i) => (
              <div key={i} className="source-item">
                <div className="source-info">
                  <span className="source-name">{s.source}</span>
                  <span className="source-views">{s.views}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: s.share }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card geo-details">
          <div className="card-header">
            <h3>Student Geography</h3>
            <MapPin size={16} />
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Students</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {geoData.map((city, i) => (
                <tr key={i}>
                  <td>{city.city}</td>
                  <td>{city.students}</td>
                  <td>
                    <span className={`badge-trend ${city.trend}`}>{city.trend}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dashboard-card trial-activity">
          <div className="card-header">
            <h3>Recent Trial Activity</h3>
            <button className="view-all">View All Users</button>
          </div>
          <div className="activity-list">
            {trialActivity.map((act, i) => (
              <div key={i} className="activity-item">
                <div className="user-avatar">{act.name.charAt(0)}</div>
                <div className="user-details">
                  <div className="user-name-row">
                    <strong>{act.name}</strong>
                    <span className="wa-number">{act.whatsapp}</span>
                  </div>
                  <p>{act.action} • <span className="time">{act.time}</span></p>
                </div>
                <button className="btn-chat">WhatsApp</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
