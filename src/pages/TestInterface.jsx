import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Send, Flag, CheckCircle2, HelpCircle, Bookmark, FolderPlus, X, Map, Menu, Maximize, Minimize, Loader2 } from 'lucide-react';
import { CourseAccordion } from '../components/CourseAccordion';
import { useSubject } from '../hooks/useSubject';
import { useChapterMcqs, useCollectionMcqs } from '../hooks/useChapterMcqs';
import { api } from '../utils/api';
import './TestInterface.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const renderTextWithMath = (text) => {
  if (!text) return null;
  const parts = text.split('$');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <span
          key={index}
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(part, { throwOnError: false })
          }}
        />
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const TestInterface = () => {
  const { subjectId, folderName } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTopic   = searchParams.get('topic');
  const currentSubtest = searchParams.get('subtest');
  const chapterId      = searchParams.get('chapterId'); // numeric DB chapter ID
  const lessonId       = searchParams.get('lessonId');  // numeric DB lesson ID

  const rawSubjectId = subjectId ? subjectId.replace('-mcqs', '').replace('-lectures', '') : '';
  const subjectSlug  = rawSubjectId ? `${rawSubjectId}-mcqs` : '';
  const { chapters: topics, subject } = useSubject(subjectSlug);

  // ── Source of truth: is this a saved-folder practice or a chapter test? ──
  const actualFolderName = folderName ? folderName.replace(/-/g, ' ') : null;

  // For folder-based practice (Mistakes, custom collections)
  const {
    questions: folderQuestions,
    loading:   folderLoading,
    collectionId: mistakesCollectionId,
  } = useCollectionMcqs(actualFolderName);

  // For chapter-based tests
  const {
    questions: chapterQuestions,
    loading:   chapterLoading,
    total:     chapterTotal,
  } = useChapterMcqs(actualFolderName ? null : chapterId, actualFolderName ? null : lessonId);

  // Final questions array
  const questions = actualFolderName ? folderQuestions : chapterQuestions;
  const isLoadingQuestions = actualFolderName ? folderLoading : chapterLoading;

  const cleanSubject = actualFolderName
    ? actualFolderName
    : (subjectId ? subjectId.replace('-mcqs', '').replace(/-/g, ' ') : 'Practice');

  const [openAccordionIndex, setOpenAccordionIndex] = useState(0);

  // Open the chapter matching the URL ?topic= param once chapters load
  useEffect(() => {
    if (!currentTopic || !topics.length) return;
    const idx = topics.findIndex(t => t.name === currentTopic);
    if (idx >= 0) setOpenAccordionIndex(idx);
  }, [currentTopic, topics]);

  // ── All state hooks - MUST be before any early returns ──
  const [currentQuestion,          setCurrentQuestion]          = useState(0);
  const [selectedAnswers,          setSelectedAnswers]          = useState({});
  const [flaggedQuestions,         setFlaggedQuestions]         = useState({});
  const [timeLeft,                 setTimeLeft]                 = useState(3600);
  const [isFinished,               setIsFinished]               = useState(false);
  const [isSaveModalOpen,          setIsSaveModalOpen]          = useState(false);
  const [isSubmitModalOpen,        setIsSubmitModalOpen]        = useState(false);
  const [isCleanupSuccessModalOpen,setIsCleanupSuccessModalOpen]= useState(false);
  const [reviewFilter,             setReviewFilter]             = useState('all');
  const [savedCollections,         setSavedCollections]         = useState([]);
  const [newFolderName,            setNewFolderName]            = useState('');
  const [selectedFolder,           setSelectedFolder]           = useState('');
  const [selectedFolderId,         setSelectedFolderId]         = useState(null);
  const [saveSuccess,              setSaveSuccess]              = useState(false);
  const [isQuestionMapOpen,        setIsQuestionMapOpen]        = useState(false);
  const [isCourseSidebarOpen,      setIsCourseSidebarOpen]      = useState(true);
  const [isFullscreen,             setIsFullscreen]             = useState(false);
  const [isSaving,                 setIsSaving]                 = useState(false);
  const [subjectMcqProgress,       setSubjectMcqProgress]       = useState({ solved: 0, total: 0 });
  const viewerRef = useRef(null);

  const [isLeavingModalOpen, setIsLeavingModalOpen] = useState(false);
  const [pendingNavigateTo, setPendingNavigateTo] = useState(null);

  // Reset state when moving to a different test/folder
  useEffect(() => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setTimeLeft(3600);
    setIsFinished(false);
    setIsSubmitModalOpen(false);
    setIsSaveModalOpen(false);
    setReviewFilter('all');
  }, [lessonId, chapterId, folderName, currentSubtest]);

  const handleInterceptNavigate = (to) => {
    if (!isFinished && Object.keys(selectedAnswers).length > 0) {
      setPendingNavigateTo(to);
      setIsLeavingModalOpen(true);
    } else {
      navigate(to);
    }
  };

  // Load collections from DB for the Save MCQ modal
  useEffect(() => {
    api.get('/api/collections')
      .then(cols => setSavedCollections(cols))
      .catch(() => {});
  }, []);

  // Load subject MCQ progress (how many tests done for this subject)
  useEffect(() => {
    if (!rawSubjectId) return;
    api.get('/api/tests/stats')
      .then(stats => {
        // total_mcqs_attempted across all tests for this subject
        const subjectTests = (stats.recent_subjects || []).filter(
          s => s.subject?.toLowerCase() === cleanSubject.toLowerCase()
        );
        const solved = subjectTests.reduce((a, s) => a + (s.score || 0), 0);
        // total = chapter MCQ count from useSubject
        const total = topics.reduce((a, c) => a + (c.mcq_count || 0), 0);
        setSubjectMcqProgress({ solved, total: total || chapterTotal });
      })
      .catch(() => {});
  }, [rawSubjectId, cleanSubject, topics, chapterTotal]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Timer effect - ALL hooks before early returns
  useEffect(() => {
    if (isFinished || questions.length === 0) return;
    if (timeLeft <= 0) {
      setIsFinished(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isFinished, questions.length]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (viewerRef.current) {
        viewerRef.current.requestFullscreen().catch((err) => {
          console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const playSound = (isCorrect) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (isCorrect) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.setValueAtTime(100, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.log('Audio not supported', e);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    if (selectedAnswers[currentQuestion] !== undefined) return;
    
    const isCorrect = optionIndex === questions[currentQuestion].correct;
    playSound(isCorrect);
    
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion]: optionIndex }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => ({ ...prev, [currentQuestion]: !prev[currentQuestion] }));
  };

  // ── Save MCQ to DB collection ─────────────────────────────────────────────
  const handleSaveConfirm = useCallback(async () => {
    const finalFolderName = newFolderName.trim() || (selectedFolder ? selectedFolder.name : '');
    if (!finalFolderName) return;

    setIsSaving(true);
    try {
      // Find or create the collection
      let colId = selectedFolderId;
      if (newFolderName.trim()) {
        const col = await api.post('/api/collections/by-name', { name: newFolderName.trim() });
        colId = col.id;
      }
      if (!colId) return;

      // Save the MCQ as JSONB
      const q = questions[currentQuestion];
      await api.post(`/api/collections/${colId}/mcqs`, {
        mcq_data: {
          id:          q.id || q.dbId,
          dbId:        q.dbId || q.id,
          text:        q.text,
          options:     q.options,
          correct:     q.correct,
          explanation: q.explanation || '',
          imageUrl:    q.imageUrl    || null,
        },
      });

      // Refresh collections list
      const cols = await api.get('/api/collections');
      setSavedCollections(cols);
      setSaveSuccess(true);
    } catch (err) {
      console.error('Failed to save MCQ:', err);
    } finally {
      setIsSaving(false);
      setNewFolderName('');
      setSelectedFolder('');
      setSelectedFolderId(null);
    }

    setTimeout(() => {
      setIsSaveModalOpen(false);
      setSaveSuccess(false);
    }, 2000);
  }, [newFolderName, selectedFolder, selectedFolderId, currentQuestion, questions]);

  // ── Finish test: show modal, save result + mistakes to DB ─────────────────
  const handleFinish = useCallback(() => {
    setIsSubmitModalOpen(true);
  }, []);

  const confirmSubmit = useCallback(async () => {
    setIsSubmitModalOpen(false);
    setIsFinished(true);

    const timeTaken = 3600 - timeLeft;
    const correctCount = questions.reduce((acc, q, idx) =>
      acc + (selectedAnswers[idx] === q.correct ? 1 : 0), 0);
    const wrongIndices = questions.map((_, i) => i)
      .filter(i => selectedAnswers[i] !== undefined && selectedAnswers[i] !== questions[i].correct);

    // 1. Save test result to DB
    try {
      await api.post('/api/tests/results', {
        subject:             cleanSubject,
        topic:               currentTopic || cleanSubject,
        score:               correctCount,
        total:               questions.length,
        time_taken_seconds:  timeTaken,
        chapter_id:          chapterId ? parseInt(chapterId, 10) : null,
      });
    } catch (err) {
      console.error('Failed to save test result:', err);
    }

    // 2. Auto-save mistakes to 'Mistakes' DB collection (skip for folder practice)
    if (!actualFolderName && wrongIndices.length > 0) {
      try {
        const mistakesCol = await api.post('/api/collections/by-name', { name: 'Mistakes' });
        // Fetch existing mistake question IDs to avoid duplicates
        const existing = await api.get(`/api/collections/${mistakesCol.id}/mcqs`);
        const existingIds = new Set(existing.map(m => m.dbId || m.id));

        for (const idx of wrongIndices) {
          const q = questions[idx];
          if (existingIds.has(q.dbId || q.id)) continue;
          await api.post(`/api/collections/${mistakesCol.id}/mcqs`, {
            mcq_data: {
              id:          q.id || q.dbId,
              dbId:        q.dbId || q.id,
              text:        q.text,
              options:     q.options,
              correct:     q.correct,
              explanation: q.explanation || '',
              imageUrl:    q.imageUrl    || null,
            },
          });
        }
      } catch (err) {
        console.error('Failed to save mistakes:', err);
      }
    }
  }, [timeLeft, questions, selectedAnswers, cleanSubject, currentTopic, chapterId, actualFolderName]);

  // ── Remove mastered questions from Mistakes folder ────────────────────────
  const handleRemoveMastered = useCallback(async () => {
    const correctlySolvedIds = questions
      .filter((q, idx) => selectedAnswers[idx] === q.correct)
      .map(q => q._savedId)
      .filter(Boolean);

    if (correctlySolvedIds.length > 0 && mistakesCollectionId) {
      try {
        await api.delete(`/api/collections/${mistakesCollectionId}/mcqs/bulk`, {
          saved_ids: correctlySolvedIds,
        });
      } catch (err) {
        console.error('Failed to remove mastered questions:', err);
      }
    }

    setIsCleanupSuccessModalOpen(true);
    setTimeout(() => {
      setIsCleanupSuccessModalOpen(false);
      navigate('/student-dashboard');
    }, 2500);
  }, [questions, selectedAnswers, mistakesCollectionId, navigate]);

  // --- Early returns AFTER all hooks ---

  // Wrapper for the layout so the sidebar is always present
  const renderLayout = (content) => (
    <div ref={viewerRef} className={`lesson-viewer-layout ${!isCourseSidebarOpen ? 'course-sidebar-closed' : ''} ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Sidebar Navigation */}
      {isCourseSidebarOpen && (
        <aside className="lesson-sidebar mobile-open fade-in-left">
          {/* Mobile Top Bar inside Sidebar */}
          <div className="sidebar-mobile-topbar hide-desktop" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#4096EE' }}>preDoctr.pk</span>
              <span style={{ color: '#94a3b8', marginLeft: '4px', fontSize: '0.9rem' }}>LMS</span>
            </div>
            <button onClick={() => setIsCourseSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#475569' }}>
              <Menu size={20} />
            </button>
          </div>

          <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Course Content</h2>
            <button onClick={() => setIsCourseSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8' }}>
              <X size={20} />
            </button>
          </div>
          <div className="sidebar-accordion-container">
            {topics.length > 0 ? (
              topics.map((chapter, index) => (
                <CourseAccordion
                  key={chapter.id || index}
                  chapter={chapter}
                  index={index}
                  subjectSlug={subjectSlug}
                  subjectId={rawSubjectId}
                  navigate={handleInterceptNavigate}
                  isOpen={openAccordionIndex === index}
                  onToggle={() => setOpenAccordionIndex(openAccordionIndex === index ? null : index)}
                  currentTopic={currentTopic}
                  currentSubtest={currentSubtest}
                  isSidebar={true}
                  isFreeChapter={true}
                />
              ))
            ) : (
              <div className="empty-sidebar-msg">Loading chapters...</div>
            )}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="lesson-main-area">
        <header className="lesson-topbar hide-mobile">
          <div className="topbar-left">
            <button className="sidebar-toggle-btn" onClick={() => setIsCourseSidebarOpen(!isCourseSidebarOpen)}>
              <Menu size={20} />
            </button>
            <button className="back-to-course" onClick={() => handleInterceptNavigate(`/courses/${rawSubjectId}-mcqs`)}>
              <ChevronLeft size={18} /> {cleanSubject} MCQs
            </button>
          </div>
          <div className="topbar-right">
            <span className="lesson-progress">
              Your Progress: {subjectMcqProgress.solved} of {subjectMcqProgress.total} ({subjectMcqProgress.total > 0 ? Math.round((subjectMcqProgress.solved / subjectMcqProgress.total) * 100) : 0}%)
            </span>
            <button className="mark-complete-btn">
              <CheckCircle2 size={16} /> Mark as Complete
            </button>
            <button className="close-lesson-btn" onClick={() => handleInterceptNavigate(`/courses/${rawSubjectId}-mcqs`)}>
              <X size={20} />
            </button>
          </div>
        </header>
        
        <div className="lesson-content-wrapper">
          {content}
        </div>
      </main>
    </div>
  );

  const isNotesOrShortlisting = currentSubtest?.toLowerCase().includes('notes') || currentSubtest?.toLowerCase().includes('shortlisting');

  if (isNotesOrShortlisting) {
    return renderLayout(
      <div className="test-interface-v2 empty-state">
        <div className="container empty-container">
          <h2>{currentSubtest}</h2>
          <p>This content is text-based and currently under development. Please check back later!</p>
          <button className="primary-btn" onClick={() => navigate(`/courses/${rawSubjectId}-mcqs`)}>
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingQuestions) {
    return renderLayout(
      <div className="test-interface-v2 empty-state">
        <div className="container empty-container">
          <Loader2 size={64} className="animate-spin" color="#4096EE" />
          <h2>Loading Questions...</h2>
          <p>Please wait while we fetch your MCQs.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return renderLayout(
      <div className="test-interface-v2 empty-state">
        <div className="container empty-container">
          <Bookmark size={64} color="#e2e8f0" />
          <h2>No Questions Found</h2>
          <p>This folder is currently empty. [Debug: chapterId={chapterId}, lessonId={lessonId}]</p>
          <button className="primary-btn" onClick={() => navigate('/student-dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;
    const correctCount = questions.reduce((acc, q, idx) => acc + (selectedAnswers[idx] === q.correct ? 1 : 0), 0);
    const wrongCount = answeredCount - correctCount;
    const unansweredCount = totalQuestions - answeredCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    return renderLayout(
      <div className="test-result-page">
        {/* ... (existing result page content) ... */}
        <div className="container result-container">
          {/* Summary Header */}
          <div className="result-card fade-in-up">
            <div className="result-icon-success">
              {percentage >= 50 ? <CheckCircle2 size={64} color="#10b981" /> : <X size={64} color="#ef4444" />}
            </div>
            <h2>{percentage >= 50 ? 'Well Done, Doctor!' : 'Keep Practicing!'}</h2>
            <p className="result-subtext">Detailed performance report for {cleanSubject}</p>
            
            <div className="score-summary-grid">
              <div className="score-main-box">
                <span className="score-val">{correctCount} / {totalQuestions}</span>
                <span className="score-label">Marks Obtained</span>
              </div>
              <div className="score-main-box">
                <span className="score-val">{percentage}%</span>
                <span className="score-label">Percentage</span>
              </div>
              <div className="score-main-box">
                <span className="score-val">{formatTime(3600 - timeLeft)}</span>
                <span className="score-label">Time Taken</span>
              </div>
            </div>

            <div className="result-stats-bar">
              <div className="s-bar-item correct">
                <div className="s-dot"></div>
                <span>{correctCount} Correct</span>
              </div>
              <div className="s-bar-item wrong">
                <div className="s-dot"></div>
                <span>{wrongCount} Wrong</span>
              </div>
              <div className="s-bar-item skipped">
                <div className="s-dot"></div>
                <span>{unansweredCount} Skipped</span>
              </div>
            </div>

            <div className="result-actions">
              <button className="primary-btn" onClick={() => navigate('/student-dashboard')}>Return to Dashboard</button>
              <button className="secondary-btn" onClick={() => window.location.reload()}>Retake Test</button>
            </div>

            {folderName === 'Mistakes' && correctCount > 0 && (
              <div className="mistake-cleanup-box fade-in-up">
                <div className="cleanup-info">
                  <CheckCircle2 size={24} color="#10b981" />
                  <div>
                    <h4>Cleanup your Mistakes folder?</h4>
                    <p>You got {correctCount} questions correct. Want to remove them from your Mistakes folder?</p>
                  </div>
                </div>
                <button className="cleanup-btn" onClick={handleRemoveMastered}>
                  Remove Mastered Questions
                </button>
              </div>
            )}

            {!folderName && wrongCount > 0 && (
              <p className="mistake-tip">
                💡 {wrongCount} mistakes were automatically saved to your <strong>Mistakes</strong> folder for later review.
              </p>
            )}
          </div>

          {/* Detailed Review Section */}
          <div className="review-section fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="review-header-flex">
              <h2 className="review-title">Questions Review</h2>
              <div className="review-filters">
                <button 
                  className={`filter-chip ${reviewFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setReviewFilter('all')}
                >
                  All ({totalQuestions})
                </button>
                <button 
                  className={`filter-chip wrong ${reviewFilter === 'wrong' ? 'active' : ''}`}
                  onClick={() => setReviewFilter('wrong')}
                >
                  Incorrect ({wrongCount + unansweredCount})
                </button>
                <button 
                  className={`filter-chip correct ${reviewFilter === 'correct' ? 'active' : ''}`}
                  onClick={() => setReviewFilter('correct')}
                >
                  Correct ({correctCount})
                </button>
              </div>
            </div>

            <div className="review-list">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correct;
                const isSkipped = userAns === undefined;

                // Apply Filter
                if (reviewFilter === 'wrong' && isCorrect) return null;
                if (reviewFilter === 'correct' && !isCorrect) return null;

                return (
                  <div key={idx} className={`review-item-card ${isCorrect ? 'correct' : (isSkipped ? 'skipped' : 'wrong')}`}>
                    <div className="review-q-header">
                      <span className="q-num">Question {idx + 1}</span>
                      <span className={`q-status-badge ${isCorrect ? 'correct' : (isSkipped ? 'skipped' : 'wrong')}`}>
                        {isCorrect ? 'Correct' : (isSkipped ? 'Skipped' : 'Incorrect')}
                      </span>
                    </div>
                    
                    <h3 className="review-q-text">{q.text}</h3>
                    
                    <div className="review-options">
                      {q.options.map((opt, oIdx) => {
                        let statusClass = '';
                        if (oIdx === q.correct) statusClass = 'correct-option';
                        if (userAns === oIdx && !isCorrect) statusClass = 'wrong-option';

                        return (
                          <div key={oIdx} className={`review-opt-box ${statusClass}`}>
                            <span className="opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                            <span className="opt-text">{opt}</span>
                            {oIdx === q.correct && <CheckCircle2 size={16} className="status-icon" />}
                            {userAns === oIdx && !isCorrect && <X size={16} className="status-icon" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="explanation-box">
                        <div className="exp-header">
                          <HelpCircle size={16} />
                          <span>Explanation</span>
                        </div>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return renderLayout(
    <div className={`test-interface-v2 ${isQuestionMapOpen ? 'map-open' : 'map-closed'}`}>
      {/* Consolidated Mobile Header */}
      <header className="mobile-test-header hide-desktop">
        <div className="mobile-header-top">
          <div className="m-header-left">
            <button className="m-sidebar-toggle" onClick={() => setIsCourseSidebarOpen(!isCourseSidebarOpen)} style={{ marginRight: '10px', background: 'none', border: 'none', color: '#475569', display: 'flex', alignItems: 'center' }}>
              <Menu size={20} />
            </button>
            <button className="m-back-btn" onClick={() => navigate(`/courses/${rawSubjectId}-mcqs${currentTopic ? `?topic=${encodeURIComponent(currentTopic)}${currentSubtest ? `&subtest=${encodeURIComponent(currentSubtest)}` : ''}` : ''}`)}>
              <ChevronLeft size={20} />
            </button>
            <span className="m-subject-title">{cleanSubject} MCQs</span>
          </div>
          <div className="m-header-right">
            <button className="m-map-toggle" onClick={() => setIsQuestionMapOpen(true)}>
              <Map size={18} />
            </button>
            <div className="mobile-timer">
              <span className={timeLeft < 300 ? 'timer-warning' : ''}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        <div className="mobile-progress-line">
          <div className="progress-fill" style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}></div>
        </div>
      </header>

      {/* Main Toolbar (Integrated - Desktop Only) */}
      <div className="test-toolbar hide-mobile">
        <div className="container toolbar-inner">
          <button 
            className={`toolbar-btn ${isQuestionMapOpen ? 'active' : ''}`}
            onClick={() => setIsQuestionMapOpen(!isQuestionMapOpen)}
          >
            <Map size={18} />
            <span className="hide-mobile">Question Map</span>
          </button>

          <div className="toolbar-center">
            <div className="desktop-timer">
              <Clock size={18} />
              <span className={timeLeft < 300 ? 'timer-warning' : ''}>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="toolbar-right">
            <button className="toolbar-btn" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button className="finish-btn" onClick={handleFinish}>
              Finish Test <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="container test-content-layout">
        {/* Question Map Sidebar / Overlay */}
        <aside className={`question-map-sidebar ${isQuestionMapOpen ? 'open' : ''}`}>
          <div className="sidebar-inner">
            <div className="sidebar-header-mobile hide-desktop">
              <h3>Question Map</h3>
              <button onClick={() => setIsQuestionMapOpen(false)}><X size={20} /></button>
            </div>
            <div className="q-map-grid">
              {questions.map((qItem, idx) => {
                const isAns = selectedAnswers[idx] !== undefined;
                const isCorr = isAns && selectedAnswers[idx] === qItem.correct;
                const isWrng = isAns && selectedAnswers[idx] !== qItem.correct;
                
                return (
                  <button
                    key={idx}
                    className={`q-map-btn ${currentQuestion === idx ? 'active' : ''} ${isCorr ? 'map-correct' : ''} ${isWrng ? 'map-wrong' : ''} ${!isAns && flaggedQuestions[idx] ? 'flagged' : ''}`}
                    onClick={() => {
                      setCurrentQuestion(idx);
                      if (window.innerWidth <= 768) setIsQuestionMapOpen(false);
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="map-legend">
              <div className="legend-item"><span className="l-dot active"></span> Current</div>
              <div className="legend-item"><span className="l-dot correct"></span> Correct</div>
              <div className="legend-item"><span className="l-dot wrong"></span> Wrong</div>
              <div className="legend-item"><span className="l-dot flagged"></span> Flagged</div>
            </div>
          </div>
        </aside>

        {/* Main Question Display */}
        <main className="question-display-area">
          <div className="question-card fade-in-up">
            <div className="q-header-row">
              <div className="q-badge">Question {currentQuestion + 1} of {questions.length}</div>
              <div className="q-utility-actions">
                <button 
                  className={`util-icon-btn ${flaggedQuestions[currentQuestion] ? 'active' : ''}`}
                  onClick={toggleFlag}
                  title="Flag for review"
                >
                  <Flag size={18} /> <span className="hide-mobile">Flag</span>
                </button>
                <button className="util-icon-btn" onClick={() => setIsSaveModalOpen(true)} title="Save MCQ">
                  <Bookmark size={18} /> <span className="hide-mobile">Save</span>
                </button>
              </div>
            </div>

            <h2 className="question-text">{renderTextWithMath(q.text)}</h2>

            {q.imageUrl && (
              <div className="question-image">
                <img src={q.imageUrl} alt="Context" loading="lazy" />
              </div>
            )}

            <div className="options-list">
              {q.options.map((option, index) => {
                const isAnswered = selectedAnswers[currentQuestion] !== undefined;
                const isSelected = selectedAnswers[currentQuestion] === index;
                const isCorrectOption = q.correct === index;
                
                let stateClass = '';
                if (isAnswered) {
                  if (isCorrectOption) stateClass = 'correct';
                  else if (isSelected) stateClass = 'wrong';
                  else stateClass = 'neutral';
                }

                return (
                  <button
                    key={index}
                    className={`option-row ${stateClass} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isAnswered}
                  >
                    <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                    <div className="option-content">{renderTextWithMath(option)}</div>
                    {isAnswered && isCorrectOption && <CheckCircle2 size={18} className="indicator-icon" />}
                    {isAnswered && isSelected && !isCorrectOption && <X size={18} className="indicator-icon" />}
                  </button>
                );
              })}
            </div>

            {selectedAnswers[currentQuestion] !== undefined && q.explanation && (
              <div className="explanation-card fade-in-up">
                <div className="exp-label">
                  <HelpCircle size={16} /> Explanation
                </div>
                <p>{renderTextWithMath(q.explanation)}</p>
              </div>
            )}
          </div>

          <div className="test-navigation">
            <button
              className="nav-btn prev"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
            >
              <ChevronLeft size={20} /> <span className="nav-text hide-mobile">Previous</span>
            </button>

            <button
              className="nav-btn next"
              onClick={() => {
                if (currentQuestion < questions.length - 1) {
                  setCurrentQuestion(currentQuestion + 1);
                } else {
                  handleFinish();
                }
              }}
            >
              <span className="nav-text">{currentQuestion === questions.length - 1 ? 'Finish Test' : 'Next Question'}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </main>
      </div>

      {/* Save MCQ Modal */}
      {isSaveModalOpen && (
        <div className="modal-overlay">
          <div className="save-mcq-modal fade-in-up">
            <div className="modal-header">
              <div className="modal-title-group">
                <Bookmark size={24} color="#4096EE" />
                <h3>Save this MCQ</h3>
              </div>
              <button className="close-modal" onClick={() => setIsSaveModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {saveSuccess ? (
                <div className="save-success-view fade-in-up">
                  <div className="success-check-circle">
                    <CheckCircle2 size={48} color="#10b981" />
                  </div>
                  <h3>MCQ Saved Successfully!</h3>
                  <p>This question has been added to your collection and is ready for review later.</p>
                </div>
              ) : (
                <>
                  <p>Choose a folder or create a new one to organize your saved MCQs.</p>

                  <div className="modal-input-group">
                    <label>Create New Folder</label>
                    <div className="folder-input-wrapper">
                      <FolderPlus size={18} />
                      <input
                        type="text"
                        placeholder="e.g. Physics Formulas"
                        value={newFolderName}
                        onChange={(e) => { setNewFolderName(e.target.value); setSelectedFolder(''); }}
                      />
                    </div>
                  </div>

                  <div className="modal-divider"><span>OR SELECT EXISTING</span></div>

                  <div className="existing-folders-list">
                    {savedCollections.map(folder => (
                      <div
                        key={folder.id}
                        className={`folder-item ${selectedFolder?.id === folder.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedFolder(folder); setSelectedFolderId(folder.id); setNewFolderName(''); }}
                      >
                        <span>{folder.name}</span>
                        {selectedFolder?.id === folder.id && <CheckCircle2 size={16} />}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {!saveSuccess && (
              <div className="modal-footer">
                <button className="modal-cancel-btn" onClick={() => setIsSaveModalOpen(false)}>Cancel</button>
                <button
                  className="modal-save-btn"
                  disabled={(!newFolderName && !selectedFolder) || isSaving}
                  onClick={handleSaveConfirm}
                >
                  {isSaving ? <><Loader2 size={16} className="animate-spin" style={{ display: 'inline', marginRight: '8px' }} /> Saving...</> : 'Save Question'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Leaving Test Confirmation Modal */}
      {isLeavingModalOpen && (
        <div className="modal-overlay">
          <div className="save-mcq-modal fade-in-up">
            <div className="modal-header">
              <div className="modal-title-group">
                <Send size={24} color="#4096EE" />
                <h3>Leaving Test?</h3>
              </div>
            </div>
            
            <div className="modal-body">
              <p style={{ textAlign: 'center' }}>
                Do you want to save your quiz progress by finishing, or quit and lose all progress?
              </p>
            </div>

            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setIsLeavingModalOpen(false)}>
                Cancel
              </button>
              <button className="modal-save-btn" style={{ backgroundColor: '#ef4444' }} onClick={() => {
                setIsLeavingModalOpen(false);
                navigate(pendingNavigateTo);
              }}>
                Quit & Lose Progress
              </button>
              <button className="modal-save-btn" onClick={async () => {
                await confirmSubmit();
                setIsLeavingModalOpen(false);
                navigate(pendingNavigateTo);
              }}>
                Finish & Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="modal-overlay">
          <div className="save-mcq-modal fade-in-up submit-modal">
            <div className="modal-header">
              <div className="modal-title-group">
                <Send size={24} color="#4096EE" />
                <h3>Submit Test?</h3>
              </div>
              <button className="close-modal" onClick={() => setIsSubmitModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="submit-summary">
                <div className="sum-item">
                  <span className="sum-label">Answered</span>
                  <span className="sum-val">{Object.keys(selectedAnswers).length} / {questions.length}</span>
                </div>
                <div className="sum-item">
                  <span className="sum-label">Time Remaining</span>
                  <span className="sum-val">{formatTime(timeLeft)}</span>
                </div>
              </div>
              <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                Are you sure you want to finish your assessment? You won't be able to change your answers after submitting.
              </p>
            </div>

            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setIsSubmitModalOpen(false)}>Continue Test</button>
              <button className="modal-save-btn submit-btn" onClick={confirmSubmit}>
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Cleanup Success Modal */}
      {isCleanupSuccessModalOpen && (
        <div className="modal-overlay">
          <div className="save-mcq-modal fade-in-up cleanup-success-modal">
            <div className="modal-body">
              <div className="save-success-view">
                <div className="success-check-circle large">
                  <CheckCircle2 size={80} color="#10b981" />
                </div>
                <h2>Folder Cleaned!</h2>
                <p>Great job! The mastered questions have been removed. Your Mistakes folder is now up to date.</p>
                <div className="redirect-hint">Redirecting to Dashboard...</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestInterface;
