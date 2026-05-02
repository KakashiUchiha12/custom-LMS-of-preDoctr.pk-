import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Book, Star, Clock, ChevronRight, Bookmark, PlayCircle, Trash2, X, Settings } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { profile } = useAuth();
  const [collections, setCollections] = useState([]);
  const [mcqStats, setMcqStats] = useState({});
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

  const loadData = () => {
    const savedCols = JSON.parse(localStorage.getItem('predoctr-collections') || '[]');
    const savedMcqs = JSON.parse(localStorage.getItem('predoctr-saved-mcqs') || '[]');
    
    const counts = {};
    savedMcqs.forEach(mcq => {
      counts[mcq.folder] = (counts[mcq.folder] || 0) + 1;
    });
    
    setCollections(savedCols);
    setMcqStats(counts);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteFolder = (folderName) => {
    setFolderToDelete(folderName);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteAction = () => {
    if (!folderToDelete) return;
    
    // 1. Remove from collections
    const savedCols = JSON.parse(localStorage.getItem('predoctr-collections') || '[]');
    const updatedCols = savedCols.filter(c => c !== folderToDelete);
    localStorage.setItem('predoctr-collections', JSON.stringify(updatedCols));

    // 2. Remove all MCQs in this folder
    const savedMcqs = JSON.parse(localStorage.getItem('predoctr-saved-mcqs') || '[]');
    const updatedMcqs = savedMcqs.filter(m => m.folder !== folderToDelete);
    localStorage.setItem('predoctr-saved-mcqs', JSON.stringify(updatedMcqs));

    // 3. Refresh state and close
    loadData();
    setIsDeleteConfirmOpen(false);
    setFolderToDelete(null);
  };

  const recentCourses = [
    { title: 'Biology Lectures', progress: 65, lastChapter: 'Biological Molecules' },
    { title: 'Chemistry MCQs', progress: 20, lastChapter: 'Atomic Structure' },
  ];

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
            </div>
          </div>
          <div className="header-stats">
            <div className="h-stat">
              <span className="h-stat-val">12</span>
              <span className="h-stat-label">Days Streak</span>
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="dashboard-main">
            {/* Saved MCQ Collections */}
            <div className="section-title-row">
              <h2>My MCQ Collections</h2>
              <button onClick={() => setIsManageModalOpen(true)} className="manage-folders-btn">
                <Settings size={16} /> Manage Folders
              </button>
            </div>
            
            <div className="collections-grid">
              {collections.length > 0 ? (
                collections.map((folder, index) => (
                  <div key={index} className="collection-card fade-in-up">
                    <div className="col-icon">
                      <Bookmark size={24} color="#4096EE" />
                    </div>
                    <div className="col-info">
                      <h3>{folder}</h3>
                      <p>{mcqStats[folder] || 0} Saved MCQs</p>
                    </div>
                    <Link to={`/practice/saved/${folder.replace(/ /g, '-')}`} className="start-col-btn">
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
              {recentCourses.map((course, index) => (
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
                  <button className="resume-btn">Resume <ChevronRight size={16} /></button>
                </div>
              ))}
            </div>

            <div className="performance-overview">
              <h2>Performance Overview</h2>
              <div className="perf-grid">
                <div className="perf-card">
                  <Book className="perf-icon" />
                  <h4>Lectures Watched</h4>
                  <p>48 / 120</p>
                </div>
                <div className="perf-card">
                  <Star className="perf-icon" />
                  <h4>MCQs Solved</h4>
                  <p>{Object.values(mcqStats).reduce((a, b) => a + b, 0) + 1240}</p>
                </div>
                <div className="perf-card">
                  <Clock className="perf-icon" />
                  <h4>Study Time</h4>
                  <p>32h 15m</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="dashboard-sidebar">
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
                  collections.map((folder, index) => (
                    <div key={index} className="folder-manage-item">
                      <div className="f-item-info">
                        <Bookmark size={20} color="#4096EE" />
                        <div>
                          <span className="f-name">{folder}</span>
                          <span className="f-count">{mcqStats[folder] || 0} questions</span>
                        </div>
                      </div>
                      <button 
                        className="delete-folder-btn" 
                        onClick={() => handleDeleteFolder(folder)}
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
