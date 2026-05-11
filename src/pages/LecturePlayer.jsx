import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Play, FileText, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Eye, ArrowLeft, Menu, X, ChevronLeft } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { CourseAccordion } from '../components/CourseAccordion';
import { useSubject } from '../hooks/useSubject';
import './LecturePlayer.css';

const LecturePlayer = () => {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const requestedChapter = searchParams.get('chapter');
  const currentLecture = searchParams.get('lecture');

  const { subject, chapters: topics = [], loading } = useSubject(`${subjectId}-lectures`);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openIndex, setOpenIndex] = useState(0);
  
  // Open the requested chapter automatically when data loads
  useEffect(() => {
    if (!topics.length) return;
    if (requestedChapter) {
      const idx = topics.findIndex(t => t.name === requestedChapter);
      if (idx !== -1) setOpenIndex(idx);
    }
  }, [topics, requestedChapter]);

  const subjectName = subjectId 
    ? subjectId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Course';

  return (
    <div className={`lecture-viewer-layout ${!isSidebarOpen ? 'course-sidebar-closed' : ''}`}>
      {/* Sidebar Navigation */}
      {isSidebarOpen && (
        <>
          <div className="sidebar-overlay hide-desktop" onClick={() => setIsSidebarOpen(false)}></div>
          <aside className="lecture-sidebar fade-in-left">
            <div className="sidebar-header">
              <h2>Course Content</h2>
              <button className="sidebar-close-mobile hide-desktop" onClick={() => setIsSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>
          <div className="sidebar-accordion-container">
            {topics.length > 0 ? (
              topics.map((chapter, index) => (
                <CourseAccordion 
                  key={index}
                  chapter={chapter}
                  index={index}
                  subjectId={subjectId}
                  navigate={navigate}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                  currentTopic={requestedChapter}
                  currentSubtest={currentLecture}
                  isSidebar={true}
                  type="lectures"
                  isFreeChapter={true}
                />
              ))
            ) : (
              <div className="empty-sidebar-msg">No chapters available.</div>
            )}
          </div>
        </aside>
        </>
      )}

      {/* Main Content Area */}
      <main className="lecture-main-area">
        <header className="lecture-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={20} />
            </button>
            <button className="back-to-course" onClick={() => navigate(`/courses/${subjectId}-lectures`)}>
              <ChevronLeft size={18} /> {subjectName} Lectures
            </button>
          </div>
          <div className="topbar-right hide-mobile">
            <span className="lecture-progress">Progress: 0 of {topics.length * 4} (0%)</span>
            <button className="mark-complete-btn">
              <CheckCircle2 size={16} /> Mark as Complete
            </button>
            <button className="close-lecture-btn" onClick={() => navigate(`/courses/${subjectId}-lectures`)}>
              <X size={20} />
            </button>
          </div>
        </header>
        
        <div className="lecture-content-wrapper">
          <div className="lecture-content-inner">
            <div className="course-main">
              <VideoPlayer 
                videoUrl="https://www.w3schools.com/html/mov_bbb.mp4" 
                videoId={subjectId} 
              />
              
              <div className="course-info">
                <div className="badge-premium-lecture">PREMIUM LECTURE</div>
                <h1>{requestedChapter ? requestedChapter : `${subjectName} Course Lectures`}</h1>
                <p className="course-description">
                  {currentLecture ? `Now Playing: ${currentLecture}` : `Welcome to the ${subjectName} course. This series covers the full PMDC syllabus with high-quality prerecorded lectures.`}
                </p>
              </div>
            </div>

            <div className="lecture-resources-footer">
              <h3>Study Materials</h3>
              <div className="resource-cards-grid">
                <div className="resource-item-card">
                  <FileText size={20} color="#4096EE" />
                  <div className="res-card-info">
                    <span>Chapter Notes (PDF)</span>
                    <small>High-yield quick revision</small>
                  </div>
                </div>
                <div className="resource-item-card">
                  <Play size={20} color="#10b981" />
                  <div className="res-card-info">
                    <span>Lecture Slides</span>
                    <small>Class presentations</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LecturePlayer;
