import React, { useState, useEffect } from 'react';
import { 
  Trophy, Medal, Award, Search, TrendingUp, TrendingDown, 
  Zap, Target, Flame, MapPin, ChevronDown, Activity, User
} from 'lucide-react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [subject, setSubject] = useState('overall');
  const [location, setLocation] = useState('all-pakistan');
  const [showFilters, setShowFilters] = useState(false);

  // Mock Activity Feed
  const [activities, setActivities] = useState([
    { id: 1, text: "Ayesha from Lahore just scored 98% in Biology Test!", icon: <Zap size={14} /> },
    { id: 2, text: "Umer earned the 'Sniper' badge for high accuracy!", icon: <Target size={14} /> },
    { id: 3, text: "Zainab is on a 15-day study streak! 🔥", icon: <Flame size={14} /> },
  ]);

  // Rotate activities
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const first = prev[0];
        return [...prev.slice(1), first];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const topThree = [
    { name: 'Umer Farooq', score: 2650, correct: 2650, attempted: 2800, accuracy: 94.6, avatar: 'UF', trend: 'up', badges: ['speed', 'streak'] },
    { name: 'Ayesha Khan', score: 2380, correct: 2380, attempted: 2500, accuracy: 95.2, avatar: 'AK', trend: 'stable', badges: ['sniper'] },
    { name: 'Zainab Bibi', score: 2100, correct: 2100, attempted: 2400, accuracy: 87.5, avatar: 'ZB', trend: 'down', badges: ['streak'] },
  ];

  const rankings = [
    { rank: 4, name: 'Bilal Ahmed', location: 'Lahore', correct: 1950, attempted: 2100, accuracy: 92.8, score: 1950, trend: 'up', badges: ['sniper'] },
    { rank: 5, name: 'Sana Malik', location: 'Karachi', correct: 1820, attempted: 2000, accuracy: 91.0, score: 1820, trend: 'up', badges: [] },
    { rank: 6, name: 'Hamza Sheikh', location: 'Islamabad', correct: 1750, attempted: 1950, accuracy: 89.7, score: 1750, trend: 'down', badges: ['speed'] },
    { rank: 7, name: 'Maryam Aziz', location: 'Peshawar', correct: 1680, attempted: 1900, accuracy: 88.4, score: 1680, trend: 'stable', badges: [] },
    { rank: 8, name: 'Ali Raza', location: 'Quetta', correct: 1550, attempted: 1800, accuracy: 86.1, score: 1550, trend: 'up', badges: ['streak'] },
    { rank: 9, name: 'Fatima Noor', location: 'Multan', correct: 1420, attempted: 1700, accuracy: 83.5, score: 1420, trend: 'down', badges: [] },
    { rank: 10, name: 'Usman Jamil', location: 'Faisalabad', correct: 1380, attempted: 1650, accuracy: 83.6, score: 1380, trend: 'stable', badges: [] },
  ];

  const renderBadge = (type) => {
    switch(type) {
      case 'speed': return <span className="badge-icon speed" title="Speed Demon"><Zap size={14} /></span>;
      case 'sniper': return <span className="badge-icon sniper" title="Sniper Accuracy"><Target size={14} /></span>;
      case 'streak': return <span className="badge-icon streak" title="On Fire"><Flame size={14} /></span>;
      default: return null;
    }
  };

  return (
    <div className="leaderboard-page-v2">
      {/* Activity Ticker */}
      <div className="activity-ticker">
        <div className="ticker-label"><Activity size={16} /> LIVE FEED</div>
        <div className="ticker-content">
          <div className="ticker-item fade-in-right">
            {activities[0].icon} {activities[0].text}
          </div>
        </div>
      </div>

      <div className="container">
        <header className="leaderboard-header">
          <div className="header-content">
            <h1>MDCAT <span>Hall of Fame</span></h1>
            <p>Compete, rank up, and earn your place among the best.</p>
          </div>
          
          <div className="header-controls">
            <div className="filter-group-main">
              <button className={timeframe === 'weekly' ? 'active' : ''} onClick={() => setTimeframe('weekly')}>Weekly</button>
              <button className={timeframe === 'monthly' ? 'active' : ''} onClick={() => setTimeframe('monthly')}>Monthly</button>
            </div>
            <button className="advanced-filter-btn" onClick={() => setShowFilters(!showFilters)}>
              Filters <ChevronDown size={18} />
            </button>
          </div>
        </header>

        {showFilters && (
          <div className="expanded-filters fade-in-down">
            <div className="filter-select-box">
              <label>Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="overall">Overall Excellence</option>
                <option value="biology">Biology Master</option>
                <option value="chemistry">Chemistry Pro</option>
                <option value="physics">Physics Expert</option>
              </select>
            </div>
            <div className="filter-select-box">
              <label>Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="all-pakistan">All Pakistan</option>
                <option value="punjab">Punjab</option>
                <option value="sindh">Sindh</option>
                <option value="kpk">KPK</option>
                <option value="balochistan">Balochistan</option>
              </select>
            </div>
          </div>
        )}

        {/* Podium */}
        <div className="podium-area">
          {topThree.map((user, idx) => {
            const positions = ['second', 'first', 'third'];
            const pos = positions[idx];
            return (
              <div key={idx} className={`podium-slot ${pos}`}>
                <div className="podium-user-box">
                  {pos === 'first' && <div className="gold-crown">👑</div>}
                  <div className={`avatar-circle ${pos}`}>
                    {user.avatar}
                    <div className="user-badges-mini">
                      {user.badges.map(b => renderBadge(b))}
                    </div>
                  </div>
                  <div className="podium-info">
                    <h4>{user.name}</h4>
                    <span className="p-score">{user.score.toLocaleString()} pts</span>
                    <div className="podium-detail-row">
                      <span className="p-detail-item">
                        <span className="p-detail-label">Accuracy</span>
                        <span className="p-detail-val">{user.accuracy}%</span>
                      </span>
                      <span className="p-detail-sep">·</span>
                      <span className="p-detail-item">
                        <span className="p-detail-label">MCQs</span>
                        <span className="p-detail-val">{user.attempted.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="podium-pillar">
                  <div className="p-rank">{pos === 'first' ? 1 : pos === 'second' ? 2 : 3}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Table */}
        <div className="rankings-box">
          <div className="table-top-bar">
            <div className="search-wrapper">
              <Search size={18} />
              <input type="text" placeholder="Find a student..." />
            </div>
            <div className="live-status">
              <span className="dot-pulse"></span> {rankings.length * 142} Students Online
            </div>
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Stats</th>
                  <th>Accuracy</th>
                  <th>Location</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((user) => (
                  <tr key={user.rank} className="table-row">
                    <td>
                      <div className="rank-cell">
                        <span className="r-num">#{user.rank}</span>
                        {user.trend === 'up' && <TrendingUp size={14} color="#10b981" />}
                        {user.trend === 'down' && <TrendingDown size={14} color="#ef4444" />}
                      </div>
                    </td>
                    <td>
                      <div className="student-cell">
                        <div className="s-avatar">{user.name.charAt(0)}</div>
                        <div className="s-details">
                          <span className="s-name">{user.name}</span>
                          <div className="s-badges">
                            {user.badges.map(b => renderBadge(b))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="stats-cell">
                        <span>{user.correct} / {user.attempted}</span>
                        <small>Correct / Total</small>
                      </div>
                    </td>
                    <td>
                      <div className="accuracy-cell">
                        <div className="acc-bar-bg">
                          <div className="acc-bar-fill" style={{ width: `${user.accuracy}%` }}></div>
                        </div>
                        <span>{user.accuracy}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="loc-cell">
                        <MapPin size={14} /> {user.location}
                      </div>
                    </td>
                    <td>
                      <div className="points-cell">
                        <strong>{user.score.toLocaleString()}</strong>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sticky User Bar */}
      <div className="user-sticky-bar">
        <div className="container user-sticky-inner">
          <div className="sticky-user-info">
            <div className="s-user-rank">#452</div>
            <div className="s-user-avatar"><User size={18} /></div>
            <div className="s-user-text">
              <strong>Your Current Rank</strong>
              <p>Top 15% of all students</p>
            </div>
          </div>
          <div className="sticky-stats">
            <div className="s-stat-item">
              <small>Points</small>
              <strong>1,240</strong>
            </div>
            <div className="s-stat-item">
              <small>Next Rank</small>
              <strong>+60 pts</strong>
            </div>
          </div>
          <button className="boost-btn">Boost Rank 🚀</button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
