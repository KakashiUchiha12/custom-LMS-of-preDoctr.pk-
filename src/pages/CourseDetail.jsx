import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PlayCircle, Clock, BookOpen, Video, Gift, Loader2, AlertCircle } from 'lucide-react';
import { CourseAccordion } from '../components/CourseAccordion';
import UpgradeModal from '../components/UpgradeModal';
import { useSubject } from '../hooks/useSubject';
import './CourseDetail.css';

const CourseDetail = ({ subjectSlug: propSlug }) => {
  const params   = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Accept full slug (e.g. 'biology-lectures') or legacy param
  const slug      = propSlug || params.subjectSlug || location.pathname.split('/').pop() || '';
  const subjectId = slug.replace('-lectures', '').replace('-mcqs', '');

  const { subject, chapters, loading, error } = useSubject(slug);

  const [openIndex, setOpenIndex] = useState(0);

  // Open chapter from URL param on first load
  useEffect(() => {
    if (!chapters.length) return;
    const chapterParam = new URLSearchParams(location.search).get('chapter');
    if (chapterParam) {
      const idx = chapters.findIndex(c => c.name === chapterParam);
      if (idx !== -1) setOpenIndex(idx);
    }
  }, [chapters, location.search]);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedChapterName, setLockedChapterName] = useState('');

  const handleLockedItemClick = (chapterName) => {
    setLockedChapterName(chapterName);
    setShowUpgradeModal(true);
  };

  const subjectName = subject?.name || subjectId
    .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const isBiology = subjectId === 'biology' || slug === 'biology-lectures';
  const totalLectures = chapters.reduce((s, c) => s + (c.lesson_count || 0), 0);

  const stats = [
    { label: 'Total Lectures', value: totalLectures || '—', icon: <Video size={20} />    },
    { label: 'Chapters',       value: chapters.length || '—', icon: <BookOpen size={20} /> },
    { label: 'Total Hours',    value: '45+ Hrs',             icon: <Clock size={20} />    },
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

        {isBiology && (
          <div className="free-preview-banner">
            <div className="free-banner-left">
              <span className="free-banner-dot" />
              <Gift size={18} />
              <div>
                <strong>Chapter 1 is FREE — no payment needed!</strong>
                <span>Try Biodiversity lectures right now to see the quality yourself.</span>
              </div>
            </div>
            <button
              className="free-banner-cta"
              onClick={() => { setOpenIndex(0); document.querySelector('.accordion-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
            >
              Try Free Chapter →
            </button>
          </div>
        )}

        <div className="test-stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
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

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '60px', color: '#64748b' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Loading chapters...</span>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '40px', color: '#ef4444', justifyContent: 'center' }}>
              <AlertCircle size={24} />
              <span>Failed to load chapters. Please try again.</span>
            </div>
          ) : (
            <div className="accordion-list">
              {chapters.length > 0 ? chapters.map((chapter, index) => {
                const searchParams    = new URLSearchParams(location.search);
                const currentChapter  = searchParams.get('chapter');
                const currentLecture  = searchParams.get('lecture');
                const isFreeChapter   = true;

                return (
                  <CourseAccordion
                    key={chapter.id}
                    chapter={chapter}
                    index={index}
                    subjectSlug={slug}
                    subjectId={subjectId}
                    navigate={navigate}
                    isOpen={openIndex === index}
                    onToggle={() => {
                      setOpenIndex(openIndex === index ? null : index);
                      if (location.search) navigate(location.pathname, { replace: true });
                    }}
                    currentTopic={currentChapter}
                    currentSubtest={currentLecture}
                    type="lectures"
                    isFreeChapter={isFreeChapter}
                    onLockedItemClick={handleLockedItemClick}
                  />
                );
              }) : (
                <div className="empty-topics">No chapters available for this subject yet.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        chapterName={lockedChapterName}
      />
    </div>
  );
};

export default CourseDetail;
