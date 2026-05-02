import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PlayCircle, Clock, BookOpen, Video, HelpCircle } from 'lucide-react';
import { LECTURE_TOPICS } from '../data/courseData';
import { CourseAccordion } from '../components/CourseAccordion';
import './CourseDetail.css';

const CourseDetail = ({ subjectId: propSubjectId }) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract subjectId from either prop (passed by CourseRouter) or URL params or pathname
  const rawId = propSubjectId || params.subjectSlug || params.subjectId || location.pathname.split('/').pop() || "";
  const subjectId = rawId.replace('-lectures', '').replace('-mcqs', '');
  
  const topics = LECTURE_TOPICS[subjectId] || [];

  const [openIndex, setOpenIndex] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const chapterParam = searchParams.get('chapter');
    if (chapterParam && topics.length > 0) {
      const idx = topics.findIndex(t => t.name === chapterParam);
      if (idx !== -1) return idx;
    }
    return 0; // Default to first open
  });

  const subjectName = subjectId 
    ? subjectId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Course';

  const stats = [
    { label: 'Total Lectures', value: topics.length * 4, icon: <Video size={20} /> },
    { label: 'Chapters', value: topics.length, icon: <BookOpen size={20} /> },
    { label: 'Total Hours', value: '45+ Hrs', icon: <Clock size={20} /> },
  ];

  return (
    <div className="course-detail-page test-detail-page">
      <div className="container test-container">
        <div className="test-header-card" style={{ background: 'linear-gradient(135deg, #4096EE, #3b82f6)' }}>
          <div className="test-icon-large">
            <PlayCircle size={48} color="white" />
          </div>
          <div className="test-info-header">
            <h1>{subjectName} Lectures</h1>
            <p>Master every chapter with high-quality prerecorded video lectures and interactive Q&A sessions.</p>
          </div>
        </div>

        <div className="test-stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="course-content-section">
          <h2 className="course-content-title">Course Content</h2>
          <div className="accordion-list">
            {topics.length > 0 ? (
              topics.map((chapter, index) => {
                const searchParams = new URLSearchParams(location.search);
                const currentChapter = searchParams.get('chapter');
                const currentLecture = searchParams.get('lecture');
                
                return (
                  <CourseAccordion
                    key={index}
                    chapter={chapter}
                    index={index}
                    subjectId={subjectId}
                    navigate={navigate}
                    isOpen={openIndex === index}
                    onToggle={() => {
                      setOpenIndex(openIndex === index ? null : index);
                      if (location.search) {
                        navigate(location.pathname, { replace: true });
                      }
                    }}
                    currentTopic={currentChapter}
                    currentSubtest={currentLecture}
                    type="lectures"
                  />
                );
              })
            ) : (
              <div className="empty-topics">No chapters available for this subject yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
