import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
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
  ExternalLink,
  Star
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [chartPeriod, setChartPeriod] = useState('weekly');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '2026-05-05', to: '2026-05-11' });
  const [activePreset, setActivePreset] = useState('7days');
  
  // New Analytics State
  const [granularity, setGranularity] = useState('days');
  const [chartType, setChartType] = useState('bar');
  const [activeTab, setActiveTab] = useState('views');
  const [showViews, setShowViews] = useState(true);
  const [showVisitors, setShowVisitors] = useState(true);
  const [showNewUsers, setShowNewUsers] = useState(true);

  const handlePresetClick = (preset) => {
    setActivePreset(preset);
    const today = new Date('2026-05-11');
    let fromDate = new Date('2026-05-11');
    
    if (preset === 'today') {
      setGranularity('hours');
      setDateRange({ from: '2026-05-11', to: '2026-05-11' });
    } else if (preset === '7days') {
      setGranularity('days');
      fromDate.setDate(today.getDate() - 7);
      setDateRange({ from: fromDate.toISOString().split('T')[0], to: '2026-05-11' });
    } else if (preset === '30days') {
      setGranularity('days');
      fromDate.setDate(today.getDate() - 30);
      setDateRange({ from: fromDate.toISOString().split('T')[0], to: '2026-05-11' });
    } else if (preset === 'mtd') {
      setGranularity('days');
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateRange({ from: fromDate.toISOString().split('T')[0], to: '2026-05-11' });
    } else if (preset === '12m') {
      setGranularity('days');
      fromDate.setFullYear(today.getFullYear() - 1);
      setDateRange({ from: fromDate.toISOString().split('T')[0], to: '2026-05-11' });
    }
  };

  const stats = [
    { title: 'New Registered Today', value: '142', icon: <Users size={20} />, trend: '+12%', color: '#3b82f6' },
    { title: 'Daily Page Views', value: '12,450', icon: <Eye size={20} />, trend: '+5%', color: '#10b981' },
    { title: 'Active Trial Users', value: '850', icon: <Clock size={20} />, trend: '+18%', color: '#f59e0b' },
    { title: 'Flagged MCQs', value: '24', icon: <Flag size={20} />, trend: '-2', color: '#ef4444' },
  ];

  const getActiveData = () => {
    const today = new Date('2026-05-11');
    const data = [];
    
    if (granularity === 'hours') {
      return Array.from({ length: 24 }, (_, i) => ({
        name: `${i.toString().padStart(2, '0')}:00`,
        views: Math.floor(Math.random() * 10),
        visitors: Math.floor(Math.random() * 5),
        newUsers: Math.floor(Math.random() * 3),
      }));
    }
    
    if (activePreset === '12m') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(m => ({
        name: m,
        views: Math.floor(Math.random() * 1000) + 200,
        visitors: Math.floor(Math.random() * 500) + 100,
        newUsers: Math.floor(Math.random() * 100) + 10,
      }));
    }
    
    let days = 7;
    if (activePreset === '30days') days = 30;
    if (activePreset === 'mtd') days = today.getDate();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const name = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data.push({
        name,
        views: Math.floor(Math.random() * 50) + 10,
        visitors: Math.floor(Math.random() * 20) + 5,
        newUsers: Math.floor(Math.random() * 10) + 1,
      });
    }
    return data;
  };

  const [chartData, setChartData] = useState([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoadingChart(true);
      try {
        // We use relative path because of Vite proxy
        const data = await api.get(`/api/analytics/stats?from=${dateRange.from}&to=${dateRange.to}&granularity=${granularity}`);
        if (data && data.length > 0) {
          setChartData(data);
        } else {
          // Fallback to mock data if no real data yet
          setChartData(getActiveData());
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        setChartData(getActiveData());
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchChartData();
  }, [dateRange, granularity, activePreset]);

  const activeData = chartData; // Reference for JSX

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
        
        {/* Date Range Picker */}
        <div className="date-picker-container">
          <div className="date-picker-trigger" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
            <Clock size={16} />
            <span>{dateRange.from} - {dateRange.to}</span>
          </div>
          
          {isDatePickerOpen && (
            <div className="date-picker-dropdown">
              <div className="picker-body">
                <div className="custom-range-selector">
                  <div className="date-inputs">
                    <div className="input-group">
                      <label>FROM</label>
                      <input type="date" value={dateRange.from} onChange={(e) => setDateRange(p => ({...p, from: e.target.value}))} />
                    </div>
                    <div className="input-group">
                      <label>TO</label>
                      <input type="date" value={dateRange.to} onChange={(e) => setDateRange(p => ({...p, to: e.target.value}))} />
                    </div>
                  </div>
                  <div className="calendar-placeholder">
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Native date pickers are active in the inputs above.</p>
                  </div>
                </div>
                <div className="presets-sidebar">
                  <button className={activePreset === 'today' ? 'active' : ''} onClick={() => handlePresetClick('today')}>Today</button>
                  <button className={activePreset === '7days' ? 'active' : ''} onClick={() => handlePresetClick('7days')}>Last 7 Days</button>
                  <button className={activePreset === '30days' ? 'active' : ''} onClick={() => handlePresetClick('30days')}>Last 30 Days</button>
                  <button className={activePreset === 'mtd' ? 'active' : ''} onClick={() => handlePresetClick('mtd')}>Month to date</button>
                  <button className={activePreset === '12m' ? 'active' : ''} onClick={() => handlePresetClick('12m')}>Last 12 months</button>
                </div>
              </div>
              <div className="picker-footer">
                <button className="btn-cancel" onClick={() => setIsDatePickerOpen(false)}>Cancel</button>
                <button className="btn-apply" onClick={() => setIsDatePickerOpen(false)}>Apply</button>
              </div>
            </div>
          )}
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
          <div className="card-header" style={{ alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h3>
            </div>
            <div className="chart-controls" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div className="checkbox-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showViews} onChange={(e) => setShowViews(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#10b981' }} />
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px', display: 'inline-block' }}></span> Views
                </label>
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showVisitors} onChange={(e) => setShowVisitors(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#047857' }} />
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#047857', borderRadius: '3px', display: 'inline-block' }}></span> Visitors
                </label>
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showNewUsers} onChange={(e) => setShowNewUsers(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '3px', display: 'inline-block' }}></span> New Users
                </label>
              </div>
              <select 
                value={granularity} 
                onChange={(e) => setGranularity(e.target.value)} 
                className="granularity-select"
                style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}
              >
                <option value="days">Days</option>
                <option value="hours">Hours</option>
              </select>
              <div className="chart-type-toggles" style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '8px' }}>
                <button 
                  className={chartType === 'line' ? 'active' : ''} 
                  onClick={() => setChartType('line')}
                  style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: 'none', background: chartType === 'line' ? 'white' : 'transparent', color: chartType === 'line' ? '#10b981' : '#64748b', cursor: 'pointer', boxShadow: chartType === 'line' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                >
                  <TrendingUp size={16} />
                </button>
                <button 
                  className={chartType === 'bar' ? 'active' : ''} 
                  onClick={() => setChartType('bar')}
                  style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: 'none', background: chartType === 'bar' ? 'white' : 'transparent', color: chartType === 'bar' ? '#10b981' : '#64748b', cursor: 'pointer', boxShadow: chartType === 'bar' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                >
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="chart-container" style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={activeData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ stroke: '#10b981', strokeWidth: 1 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  {showViews && <Line type="monotone" dataKey="views" name="Views" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
                  {showVisitors && <Line type="monotone" dataKey="visitors" name="Visitors" stroke="#047857" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
                  {showNewUsers && <Line type="monotone" dataKey="newUsers" name="New Users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
                </LineChart>
              ) : (
                <BarChart data={activeData} barGap={0} barCategoryGap={5} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  {showViews && <Bar dataKey="views" name="Views" fill="#10b981" radius={[2, 2, 0, 0]} barSize={activePreset === '30days' ? 4 : 15} />}
                  {showVisitors && <Bar dataKey="visitors" name="Visitors" fill="#047857" radius={[2, 2, 0, 0]} barSize={activePreset === '30days' ? 4 : 15} />}
                  {showNewUsers && <Bar dataKey="newUsers" name="New Users" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={activePreset === '30days' ? 4 : 15} />}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Footer Tabs */}
          <div className="chart-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <div 
              className={`chart-tab ${activeTab === 'views' ? 'active' : ''}`} 
              onClick={() => setActiveTab('views')}
              style={{ padding: '1rem', borderRadius: '12px', border: '1px solid', borderColor: activeTab === 'views' ? '#10b981' : '#e2e8f0', background: activeTab === 'views' ? '#f0fdf4' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div className="tab-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: activeTab === 'views' ? '#10b981' : '#64748b', marginBottom: '0.5rem' }}>
                <Eye size={14} /> Views
              </div>
              <div className="tab-value" style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                361 <span className="tab-trend up" style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>↑ 100%</span>
              </div>
            </div>
            <div 
              className={`chart-tab ${activeTab === 'visitors' ? 'active' : ''}`} 
              onClick={() => setActiveTab('visitors')}
              style={{ padding: '1rem', borderRadius: '12px', border: '1px solid', borderColor: activeTab === 'visitors' ? '#10b981' : '#e2e8f0', background: activeTab === 'visitors' ? '#f0fdf4' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div className="tab-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: activeTab === 'visitors' ? '#10b981' : '#64748b', marginBottom: '0.5rem' }}>
                <Users size={14} /> Visitors
              </div>
              <div className="tab-value" style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                107 <span className="tab-trend up" style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>↑ 100%</span>
              </div>
            </div>
            <div 
              className={`chart-tab ${activeTab === 'newUsers' ? 'active' : ''}`} 
              onClick={() => setActiveTab('newUsers')}
              style={{ padding: '1rem', borderRadius: '12px', border: '1px solid', borderColor: activeTab === 'newUsers' ? '#10b981' : '#e2e8f0', background: activeTab === 'newUsers' ? '#f0fdf4' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div className="tab-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: activeTab === 'newUsers' ? '#10b981' : '#64748b', marginBottom: '0.5rem' }}>
                <Users size={14} /> New Users
              </div>
              <div className="tab-value" style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                45 <span className="tab-trend up" style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>↑ 12%</span>
              </div>
            </div>
            <div 
              className={`chart-tab ${activeTab === 'comments' ? 'active' : ''}`} 
              onClick={() => setActiveTab('comments')}
              style={{ padding: '1rem', borderRadius: '12px', border: '1px solid', borderColor: activeTab === 'comments' ? '#10b981' : '#e2e8f0', background: activeTab === 'comments' ? '#f0fdf4' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div className="tab-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: activeTab === 'comments' ? '#10b981' : '#64748b', marginBottom: '0.5rem' }}>
                <MessageSquare size={14} /> Comments
              </div>
              <div className="tab-value" style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>0</div>
            </div>
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
