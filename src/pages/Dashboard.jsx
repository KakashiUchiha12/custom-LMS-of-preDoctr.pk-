import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { User, Book, Star, Clock, ChevronRight, Bookmark, PlayCircle, Trash2, X, Settings, Trophy, Activity, Target } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { profile } = useAuth();
  const [collections, setCollections] = useState([]);
  const [mcqStats, setMcqStats] = useState({});
  const [globalStats, setGlobalStats] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [cols, stats] = await Promise.all([
        api.get('/api/collections').catch(() => []),
        api.get('/api/tests/stats').catch(() => null)
      ]);
      setCollections(cols);
      const counts = {};
      cols.forEach(c => { counts[c.name] = c.mcq_count || 0; });
      setMcqStats(counts);
      if (stats) setGlobalStats(stats);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDeleteFolder = (folderName) => {
    setFolderToDelete(folderName);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteAction = async () => {
    if (!folderToDelete) return;
    try {
      await api.delete(`/api/collections/${folderToDelete.id}`);
      await loadData();
    } catch (err) {
      console.error('Failed to delete collection:', err.message);
    }
    setIsDeleteConfirmOpen(false);
    setFolderToDelete(null);
  };

  const recentCoursesToRender = (globalStats?.recent_subjects || []).slice(0, 2).map(sub => ({
    title: sub.subject,
    lastChapter: sub.topic || 'General Practice',
    progress: sub.total > 0 ? Math.round((sub.score / sub.total) * 100) : 0,
    slug: sub.subject.toLowerCase().replace(/ /g, '-').replace(/-mcqs$/, '') + '-mcqs'
  }));

  const fallbackCourses = [
    { title: 'Biology MCQs', progress: 0, lastChapter: 'Start learning', slug: 'biology-mcqs' },
  ];

  const displayCourses = recentCoursesToRender.length > 0 ? recentCoursesToRender : fallbackCourses;

  return (
    <div className="dashboard-page">
      <div className="container dashboard-container">
        <header className="dashboard-header">
          <div className="user-welcome">
            <div className="user-avatar" style={{ overflow: 'hidden' }}>
              {profile?.gender === 'Female' ? (
                <div style={{ width: '100%', height: '100%', background: '#fdf4ff', color: '#d946ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                    {/* Elegant minimalist hair bun */}
                    <path d="M10 3a2 2 0 0 1 4 0"/>
                  </svg>
                </div>
              ) : profile?.gender === 'Male' ? (
                <div style={{ width: '100%', height: '100%', background: '#eff6ff', color: '#4096EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              ) : (
                <User size={40} strokeWidth={2} />
              )}
            </div>
            <div>
              <h1>Welcome Back, {profile?.fullName || 'Future Doctor'}!</h1>
              <p>Your {profile?.targetYear} MDCAT preparation is 45% complete.</p>
              {profile?.full_access_until && new Date(profile.full_access_until) > new Date() && (
                <div className="premium-badge" style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  background: '#eff6ff', 
                  color: '#3b82f6', 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: '700',
                  marginTop: '0.5rem'
                }}>
                  <Clock size={14} /> 24h Full Access Active!
                </div>
              )}
            </div>
          </div>
          <div className="header-stats">
            <div className="h-stat">
              <span className="h-stat-val">{globalStats?.current_streak || 0}</span>
              <span className="h-stat-label">Days Streak</span>
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="dashboard-main">
            {/* Free Chapter Nudge */}
            <div className="free-nudge-card">
              <div className="free-nudge-left">
                <span className="free-nudge-pulse" />
                <div className="free-nudge-text">
                  <strong>🎁 Start with something free!</strong>
                  <span>Biology Chapter 1 — Lectures & MCQ tests — are 100% free. No payment required, ever.</span>
                </div>
              </div>
              <div className="free-nudge-actions">
                <a href="/courses/biology-lectures" className="free-nudge-btn lectures">▶ Free Lecture</a>
                <a href="/courses/biology-mcqs" className="free-nudge-btn mcqs">📝 Free MCQs</a>
              </div>
            </div>

            {/* Saved MCQ Collections */}
            <div className="section-title-row">
              <h2>My MCQ Collections</h2>
              <button onClick={() => setIsManageModalOpen(true)} className="manage-folders-btn">
                <Settings size={16} /> Manage Folders
              </button>
            </div>
            
            <div className="collections-grid">
              {collections.length > 0 ? (
                collections.map((col) => (
                  <div key={col.id} className="collection-card fade-in-up">
                    <div className="col-icon">
                      <Bookmark size={24} color="#4096EE" />
                    </div>
                    <div className="col-info">
                      <h3>{col.name}</h3>
                      <p>{col.mcq_count || 0} Saved MCQs</p>
                    </div>
                    <Link to={`/practice/saved/${col.name.replace(/ /g, '-')}`} className="start-col-btn">
                      <PlayCircle size={20} /> Start Quiz
                    </Link>
                  </div>
                ))
              ) : (
                <div className="empty-collections">
                  <Bookmark size={48} color="#e2e8f0" />
                  <p>You haven't saved any MCQs yet. Bookmark tough questions during tests to see them here!</p>
                </div>
              )}
            </div>

            <div className="section-title-row" style={{ marginTop: '3rem' }}>
              <h2>Continue Learning</h2>
              <a href="#" className="view-all">View All</a>
            </div>
            
            <div className="continue-cards">
              {displayCourses.map((course, index) => (
                <div key={index} className="continue-card">
                  <div className="c-card-info">
                    <h3>{course.title}</h3>
                    <p>Current: {course.lastChapter}</p>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <span>{course.progress}%</span>
                  </div>
                  <Link to={`/courses/${course.slug}`} className="resume-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    Resume <ChevronRight size={16} />
                  </Link>
                </div>
              ))}
            </div>

            <div className="section-title-row" style={{ marginTop: '3rem' }}>
              <h2>Recent Activity</h2>
              <a href="#" className="view-all">View All</a>
            </div>
            <div className="activity-feed" style={{ marginBottom: '2rem' }}>
              <div className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'white', borderRadius: '12px', marginBottom: '10px', border: '1px solid #f1f5f9' }}>
                <Activity size={20} color="#10b981" />
                <div style={{ flexGrow: 1 }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>Attempted Quiz: Biodiversity</p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Score: 8/10 • 2 hours ago</span>
                </div>
                <ChevronRight size={16} color="#cbd5e1" />
              </div>
              <div className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'white', borderRadius: '12px', marginBottom: '10px', border: '1px solid #f1f5f9' }}>
                <PlayCircle size={20} color="#3b82f6" />
                <div style={{ flexGrow: 1 }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>Watched Lecture: Acellular Life</p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Completed • Yesterday</span>
                </div>
                <ChevronRight size={16} color="#cbd5e1" />
              </div>
            </div>

            <div className="section-title-row" style={{ marginTop: '3rem' }}>
              <h2>Subject Progress</h2>
            </div>
            <div className="subject-progress-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '2rem' }}>
              <div className="sub-prog-card" style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1e293b' }}>🧬 Biology</h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                    <span style={{ color: '#64748b' }}>Lectures Watched</span>
                    <span style={{ fontWeight: '700', color: '#0f172a' }}>12 / 45</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(12/45)*100}%`, height: '100%', background: '#4096EE', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                    <span style={{ color: '#64748b' }}>Tests Attempted</span>
                    <span style={{ fontWeight: '700', color: '#0f172a' }}>5 / 20</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(5/20)*100}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>

              <div className="sub-prog-card" style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1e293b' }}>⚗️ Chemistry</h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                    <span style={{ color: '#64748b' }}>Lectures Watched</span>
                    <span style={{ fontWeight: '700', color: '#0f172a' }}>4 / 40</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(4/40)*100}%`, height: '100%', background: '#4096EE', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                    <span style={{ color: '#64748b' }}>Tests Attempted</span>
                    <span style={{ fontWeight: '700', color: '#0f172a' }}>2 / 15</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(2/15)*100}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>

              <div className="sub-prog-card" style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1e293b' }}>⚡ Physics</h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                    <span style={{ color: '#64748b' }}>Lectures Watched</span>
                    <span style={{ fontWeight: '700', color: '#0f172a' }}>0 / 35</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `0%`, height: '100%', background: '#4096EE', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                    <span style={{ color: '#64748b' }}>Tests Attempted</span>
                    <span style={{ fontWeight: '700', color: '#0f172a' }}>0 / 12</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `0%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="performance-overview">
              <h2>Performance Overview</h2>
              <div className="perf-grid">
                <div className="perf-card">
                  <Book className="perf-icon" />
                  <h4>Lectures Watched</h4>
                  <p>0 / 120</p>
                </div>
                <div className="perf-card">
                  <Star className="perf-icon" />
                  <h4>MCQs Solved</h4>
                  <p>{globalStats?.total_correct || 0}</p>
                </div>
                <div className="perf-card">
                  <Clock className="perf-icon" />
                  <h4>Study Time</h4>
                  <p>{globalStats?.total_study_seconds ? `${Math.floor(globalStats.total_study_seconds / 3600)}h ${Math.floor((globalStats.total_study_seconds % 3600) / 60)}m` : '0h 0m'}</p>
                </div>
                <div className="perf-card">
                  <Target className="perf-icon" />
                  <h4>Daily Goal</h4>
                  <p>15 / 50 MCQs</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="dashboard-sidebar">
            <div className="sidebar-card leaderboard-card" style={{ background: 'linear-gradient(135deg, #fffbeb, #fff)', border: '1px solid #fef08a' }}>
              <h3 style={{ color: '#854d0e' }}>Leaderboard Rank</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                <Trophy size={32} color="#f59e0b" fill="#fef08a" />
                <div>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>#12</span>
                  <span style={{ color: '#64748b', fontSize: '0.9rem', marginLeft: '4px' }}>of 1,420 students</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>You need 150 more points to reach Top 10!</p>
              <Link to="/leaderboard" className="sidebar-btn" style={{ background: '#fef08a', color: '#854d0e', border: 'none', marginTop: '10px', textDecoration: 'none', display: 'inline-block', textAlign: 'center', padding: '8px 12px', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem' }}>View Full Leaderboard</Link>
            </div>

            <div className="sidebar-card notice-card">
              <h3>Important Notice</h3>
              <p>MDCAT Registration is now open. Don't forget to verify your documents!</p>
              <button className="sidebar-btn">Read More</button>
            </div>
            
            <div className="sidebar-card quick-links">
              <h3>Quick Links</h3>
              <ul>
                <li>Past Papers</li>
                <li>MDCAT Syllabus</li>
                <li>Aggregate Calculator</li>
                <li>Contact Support</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Manage Folders Modal */}
      {isManageModalOpen && (
        <div className="modal-overlay">
          <div className="manage-modal fade-in-up">
            <div className="manage-modal-header">
              <h3>Manage Your Collections</h3>
              <button className="close-btn" onClick={() => setIsManageModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="manage-modal-body">
              <p className="manage-desc">View and delete your MCQ folders. Deleting a folder will also remove all MCQs saved inside it.</p>
              
              <div className="folder-manage-list">
                {collections.length > 0 ? (
                  collections.map((col) => (
                    <div key={col.id} className="folder-manage-item">
                      <div className="f-item-info">
                        <Bookmark size={20} color="#4096EE" />
                        <div>
                          <span className="f-name">{col.name}</span>
                          <span className="f-count">{col.mcq_count || 0} questions</span>
                        </div>
                      </div>
                      <button
                        className="delete-folder-btn"
                        onClick={() => handleDeleteFolder(col)}
                        title="Delete Folder"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-folders">No folders found.</p>
                )}
              </div>
            </div>
            <div className="manage-modal-footer">
              <button className="done-btn" onClick={() => setIsManageModalOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="modal-overlay delete-confirm-overlay">
          <div className="confirm-modal fade-in-up">
            <div className="confirm-icon">
              <Trash2 size={48} color="#ef4444" />
            </div>
            <h3>Delete Folder?</h3>
            <p>Are you sure you want to delete <strong>"{folderToDelete}"</strong>? This will permanently remove all MCQs inside this collection.</p>
            
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setIsDeleteConfirmOpen(false)}>No, Keep It</button>
              <button className="confirm-btn-danger" onClick={confirmDeleteAction}>Yes, Delete Folder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
