import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Eye, Lock, Loader2 } from 'lucide-react';
import { SubtestIcon } from '../data/courseData';
import { useChapterLessons } from '../hooks/useSubject';
import './CourseAccordion.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripEmoji(str = '') {
  return str.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/gu, '').replace(/\s+/g, ' ').trim();
}

function getLessonDisplayName(lesson) {
  const bracketMatch = lesson.title ? lesson.title.match(/\[(.*?)\]/) : null;
  const prefix = bracketMatch ? `[${bracketMatch[1]}] ` : '';

  let baseName = '';
  switch (lesson.lesson_type) {
    case 'notes':        baseName = lesson.title ? `📝 ${stripEmoji(lesson.title)} 📚 NOTES` : '📝 Chapter Notes 📚'; break;
    case 'shortlisting': baseName = lesson.title ? `📝 ${stripEmoji(lesson.title)} 📝 SHORTLISTINGS` : '📝 Shortlisting 📝'; break;
    case 'test':         baseName = lesson.lesson_sub ? `📝 Test ${lesson.lesson_sub} 📖` : `📝 ${stripEmoji(lesson.title) || 'Test'} 📖`; break;
    case 'board_book':   baseName = `📚 ${lesson.lesson_sub || ''} Board Book MCQs 📚`; break;
    case 'past_paper':   baseName = `📄 ${lesson.lesson_sub || ''} Past Papers`; break;
    case 'ocr':          baseName = '📄 OCR Sheet Based Test'; break;
    case 'video':        baseName = `🎥 ${stripEmoji(lesson.title) || 'Lecture'}`; break;
    default:             baseName = stripEmoji(lesson.title) || lesson.lesson_type; break;
  }

  if (['test', 'board_book', 'past_paper', 'notes', 'shortlisting', 'ocr'].includes(lesson.lesson_type)) {
      return (prefix + baseName).trim();
  }
  return baseName.trim();
}

function getLessonIconType(lesson_type) {
  switch (lesson_type) {
    case 'notes':
    case 'shortlisting': return 'notes';
    case 'test':         return 'test';
    case 'board_book':   return 'board';
    case 'past_paper':
    case 'ocr':          return 'past';
    case 'video':        return 'video';
    default:             return 'test';
  }
}

// Groups config: which lesson_types belong together, their label/color
const LESSON_GROUP_DEFS = [
  { types: ['notes', 'shortlisting'], label: 'Notes & Shortlisting', color: '#3b82f6' },
  { types: ['test'],                   label: 'Chapter Tests',        color: '#10b981' },
  { types: ['board_book'],             label: 'Board Book MCQs',      color: '#f59e0b' },
  { types: ['past_paper', 'ocr'],      label: 'Past Papers',          color: '#8b5cf6' },
  { types: ['video'],                  label: 'Video Lectures',       color: '#6366f1' },
];

// ── LessonGroup — one expandable group inside an accordion ───────────────────

const LessonGroup = ({ def, lessons, chapterName, chapterId, subjectSlug, subjectId,
                        navigate, isFreeChapter, onLockedItemClick, type, currentTopic, currentSubtest }) => {
  
  const isAnyActive = lessons.some(lesson => {
    const displayName = getLessonDisplayName(lesson);
    return isFreeChapter && currentTopic === chapterName && currentSubtest === displayName;
  });

  const [isOpen, setIsOpen] = useState(isAnyActive);

  // Auto-open if an item inside becomes active
  useEffect(() => {
    if (isAnyActive) {
      setIsOpen(true);
    }
  }, [isAnyActive]);

  if (!lessons?.length) return null;

  const handleItemClick = (lesson) => {
    if (!isFreeChapter) {
      onLockedItemClick?.(chapterName);
      return;
    }
    const displayName = getLessonDisplayName(lesson);
    const baseParams  = `topic=${encodeURIComponent(chapterName)}&subtest=${encodeURIComponent(displayName)}&chapterId=${chapterId}&lessonId=${lesson.id}`;

    if (type === 'lectures') {
      navigate(`/lectures/${subjectId}/watch?chapter=${encodeURIComponent(chapterName)}&lecture=${encodeURIComponent(displayName)}&${baseParams}`);
    } else {
      navigate(`/practice/${subjectId}/start?${baseParams}`);
    }
  };

  return (
    <div className={`subtest-group ${isOpen ? 'open' : ''}`}>
      <div
        className="subtest-group-header"
        style={{ '--group-color': def.color, cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="group-header-left">
          <span className="group-header-dot" style={{ background: def.color }} />
          <span className="group-header-label">{def.label}</span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '4px' }}>({lessons.length})</span>
        </div>
        {isOpen ? <ChevronDown size={14} className="group-chevron" /> : <ChevronRight size={14} className="group-chevron" />}
      </div>

      {isOpen && (
        <div className="subtest-items-list">
          {lessons.map((lesson) => {
            const displayName = getLessonDisplayName(lesson);
            const iconType    = getLessonIconType(lesson.lesson_type);
            const isActive    = isFreeChapter && currentTopic === chapterName && currentSubtest === displayName;

            return (
              <div
                key={lesson.id}
                className={`subtest-item ${isActive ? 'active' : ''} ${!isFreeChapter ? 'locked-item' : ''}`}
                onClick={() => handleItemClick(lesson)}
              >
                <div className="subtest-left">
                  <SubtestIcon type={iconType} color={!isFreeChapter ? '#94a3b8' : def.color} />
                  <span className="subtest-label" style={{ color: !isFreeChapter ? '#94a3b8' : undefined }}>
                    {displayName}
                  </span>
                </div>
                {!isFreeChapter ? (
                  <Lock size={14} className="subtest-lock-icon" />
                ) : isActive ? (
                  <span className="active-indicator" style={{ backgroundColor: def.color }} />
                ) : (
                  <Eye size={15} className="subtest-eye" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── CourseAccordion — one chapter row ─────────────────────────────────────────

export const CourseAccordion = ({
  chapter,
  index,
  subjectSlug,
  subjectId,
  navigate,
  isOpen,
  onToggle,
  currentTopic,
  currentSubtest,
  isSidebar,
  type = 'mcqs',
  isFreeChapter = false,
  onLockedItemClick,
}) => {
  // Fetch lessons lazily when accordion is open
  const { grouped, loading: lessonsLoading } = useChapterLessons(isOpen ? chapter.id : null);

  // Show the correct count based on content type
  // For MCQ subjects → mcq_count; for lecture subjects → lesson_count
  const rawCount = type === 'lectures'
    ? (chapter.lesson_count || 0)
    : (chapter.mcq_count || 0);
  const countLabel = type === 'lectures' ? 'lectures' : 'MCQs';
  const totalFetched = Object.values(grouped).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  return (
    <div className={`chapter-accordion ${isOpen ? 'open' : ''} ${isSidebar ? 'sidebar-variant' : ''}`}>
      <button className="chapter-accordion-header" onClick={onToggle}>
        <div className="chapter-header-left">
          <span className="chapter-emoji">{chapter.emoji}</span>
          <span className="chapter-accordion-name">{chapter.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSidebar && rawCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {rawCount.toLocaleString()} {countLabel}
            </span>
          )}
          {isOpen ? <ChevronDown size={isSidebar ? 16 : 20} className="accordion-chevron" /> : <ChevronRight size={isSidebar ? 16 : 20} className="accordion-chevron" />}
        </div>
      </button>

      {isOpen && (
        <div className="chapter-subtests">
          {lessonsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', color: '#64748b', fontSize: '0.875rem' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Loading content...
            </div>
          ) : Object.values(grouped).flat().length === 0 ? (
            <div style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.875rem' }}>
              No content available yet.
            </div>
          ) : (
            LESSON_GROUP_DEFS.flatMap(def => {
              const lessons = def.types.flatMap(t => grouped[t] || []);
              return lessons.map(lesson => {
                const displayName = getLessonDisplayName(lesson);
                const iconType    = getLessonIconType(lesson.lesson_type);
                const isActive    = isFreeChapter && currentTopic === chapter.name && currentSubtest === displayName;

                return (
                  <div
                    key={lesson.id}
                    className={`subtest-item ${isActive ? 'active' : ''} ${!isFreeChapter ? 'locked-item' : ''}`}
                    onClick={() => {
                      if (!isFreeChapter) {
                        onLockedItemClick?.(chapter.name);
                        return;
                      }
                      const baseParams  = `topic=${encodeURIComponent(chapter.name)}&subtest=${encodeURIComponent(displayName)}&chapterId=${chapter.id}&lessonId=${lesson.id}`;
                      if (type === 'lectures') {
                        navigate(`/lectures/${subjectId}/watch?chapter=${encodeURIComponent(chapter.name)}&lecture=${encodeURIComponent(displayName)}&${baseParams}`);
                      } else {
                        navigate(`/practice/${subjectId}/start?${baseParams}`);
                      }
                    }}
                  >
                    <div className="subtest-left">
                      <SubtestIcon type={iconType} color={!isFreeChapter ? '#94a3b8' : def.color} />
                      <span className="subtest-label" style={{ color: !isFreeChapter ? '#94a3b8' : undefined }}>
                        {displayName}
                      </span>
                    </div>
                    <div className="subtest-right">
                      <div className="completion-circle"></div>
                    </div>
                  </div>
                );
              });
            })
          )}
        </div>
      )}
    </div>
  );
};
