import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList, Clock, BookOpen, HelpCircle } from 'lucide-react';
import { SUBJECT_TOPICS } from '../data/courseData';
import { CourseAccordion } from '../components/CourseAccordion';
import './TestDetail.css';

const TestDetail = ({ subjectId: propSubjectId }) => {
  const { subjectId: paramSubjectId } = useParams();
  const subjectId = (paramSubjectId || propSubjectId || '').replace('-mcqs', '').replace('-lectures', '');
  const navigate = useNavigate();
  const location = useLocation();
  
  const topics = SUBJECT_TOPICS[subjectId] || [];
  
  const [openIndex, setOpenIndex] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const topicParam = searchParams.get('topic');
    if (topicParam && topics.length > 0) {
      const idx = topics.findIndex(t => t.name === topicParam);
      if (idx !== -1) return idx;
    }
    return 0; // Default to first open
  });

  const subjectName = subjectId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const stats = [
    { label: 'Total MCQs', value: subjectId === 'biology' ? '2,400+' : '1,250+', icon: <HelpCircle size={20} /> },
    { label: 'Chapters', value: topics.length, icon: <BookOpen size={20} /> },
    { label: 'Avg. Time', value: '45s / MCQ', icon: <Clock size={20} /> },
  ];

  return (
    <div className="test-detail-page">
      <div className="container test-container">
        <div className="test-header-card">
          <div className="test-icon-large">
            <ClipboardList size={48} color="white" />
          </div>
          <div className="test-info-header">
            <h1>{subjectName} Practice Tests</h1>
            <p>Master every chapter with topic-wise MCQs, board book questions, and past papers.</p>
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
                const currentTopic = searchParams.get('topic');
                const currentSubtest = searchParams.get('subtest');
                
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
                      // Clear URL parameters when user manually interacts to remove highlighting
                      if (location.search) {
                        navigate(location.pathname, { replace: true });
                      }
                    }}
                    currentTopic={currentTopic}
                    currentSubtest={currentSubtest}
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

export default TestDetail;
