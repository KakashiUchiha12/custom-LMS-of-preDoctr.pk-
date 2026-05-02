import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Send, Flag, CheckCircle2, HelpCircle, Bookmark, FolderPlus, X, Map, Menu, Maximize, Minimize } from 'lucide-react';
import { SUBJECT_TOPICS } from '../data/courseData';
import { CourseAccordion } from '../components/CourseAccordion';
import './TestInterface.css';

const PLACEHOLDER_QUESTIONS = [
  {
    id: 1,
    text: "Which of the following is the primary site of photosynthesis in plants?",
    options: ["Mitochondria", "Chloroplast", "Ribosomes", "Golgi Apparatus"],
    correct: 1,
    explanation: "Photosynthesis occurs in the chloroplasts, which contain chlorophyll."
  },
  {
    id: 2,
    text: "The 'Fluid Mosaic Model' was proposed to explain the structure of:",
    options: ["Cell Wall", "Plasma Membrane", "Nucleus", "Endoplasmic Reticulum"],
    correct: 1,
    explanation: "Singer and Nicolson proposed the Fluid Mosaic Model for the cell membrane in 1972."
  },
  {
    id: 3,
    text: "Which molecule serves as the 'energy currency' of the cell?",
    options: ["DNA", "RNA", "ATP", "Glucose"],
    correct: 2,
    explanation: "ATP (Adenosine Triphosphate) provides energy for most cellular processes."
  },
  {
    id: 4,
    text: "The breakdown of glucose in the absence of oxygen is known as:",
    options: ["Aerobic Respiration", "Fermentation", "Glycolysis", "Krebs Cycle"],
    correct: 1,
    explanation: "Fermentation is the anaerobic breakdown of organic substances by microorganisms."
  },
  {
    id: 5,
    text: "Which organelle is known as the 'Powerhouse of the Cell'?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Lysosome"],
    correct: 2,
    explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions."
  }
];

const TestInterface = () => {
  const { subjectId, folderName } = useParams();
  const navigate = useNavigate();

  // Derive questions synchronously - no async needed since localStorage is sync
  const questions = useMemo(() => {
    if (folderName) {
      const savedMcqs = JSON.parse(localStorage.getItem('predoctr-saved-mcqs') || '[]');
      const actualFolder = folderName.replace(/-/g, ' ');
      return savedMcqs.filter(m => m.folder === actualFolder);
    }
    return PLACEHOLDER_QUESTIONS;
  }, [folderName]);

  const cleanSubject = folderName
    ? folderName.replace(/-/g, ' ')
    : (subjectId ? subjectId.replace('-mcqs', '').replace(/-/g, ' ') : 'Practice');

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTopic = searchParams.get('topic');
  const currentSubtest = searchParams.get('subtest');

  const rawSubjectId = subjectId ? subjectId.replace('-mcqs', '').replace('-lectures', '') : '';
  const topics = SUBJECT_TOPICS[rawSubjectId] || [];
  
  const [openAccordionIndex, setOpenAccordionIndex] = useState(() => {
    if (currentTopic) {
      const idx = topics.findIndex(t => t.name === currentTopic);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  // All state hooks - MUST be before any early returns
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isCleanupSuccessModalOpen, setIsCleanupSuccessModalOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'correct', 'wrong'
  const [savedCollections, setSavedCollections] = useState(() => {
    const saved = localStorage.getItem('predoctr-collections');
    return saved ? JSON.parse(saved) : ['Difficult Biology', 'Organic Chemistry Revision'];
  });
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isQuestionMapOpen, setIsQuestionMapOpen] = useState(false);
  const [isCourseSidebarOpen, setIsCourseSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef(null);

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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
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

  const handleSaveConfirm = () => {
    const finalFolderName = newFolderName || selectedFolder;
    if (!finalFolderName) return;

    if (newFolderName && !savedCollections.includes(newFolderName)) {
      const updated = [...savedCollections, newFolderName];
      setSavedCollections(updated);
      localStorage.setItem('predoctr-collections', JSON.stringify(updated));
    }

    const savedMCQs = JSON.parse(localStorage.getItem('predoctr-saved-mcqs') || '[]');
    savedMCQs.push({ ...questions[currentQuestion], folder: finalFolderName });
    localStorage.setItem('predoctr-saved-mcqs', JSON.stringify(savedMCQs));

    setSaveSuccess(true);
    setNewFolderName('');
    setSelectedFolder('');

    setTimeout(() => {
      setIsSaveModalOpen(false);
      setSaveSuccess(false);
    }, 2000);
  };

  const handleFinish = () => {
    setIsSubmitModalOpen(true);
    
    // Auto-save mistakes logic
    const wrongIndices = questions.map((_, i) => i).filter(i => selectedAnswers[i] !== questions[i].correct);
    if (wrongIndices.length > 0) {
      const savedMcqs = JSON.parse(localStorage.getItem('predoctr-saved-mcqs') || '[]');
      const mistakesFolder = 'Mistakes';
      
      wrongIndices.forEach(idx => {
        const q = questions[idx];
        // Check if already in mistakes
        const exists = savedMcqs.some(m => m.id === q.id && m.folder === mistakesFolder);
        if (!exists) {
          savedMcqs.push({ ...q, folder: mistakesFolder });
        }
      });
      
      localStorage.setItem('predoctr-saved-mcqs', JSON.stringify(savedMcqs));
      
      // Ensure 'Mistakes' is in collections
      const collections = JSON.parse(localStorage.getItem('predoctr-collections') || '[]');
      if (!collections.includes(mistakesFolder)) {
        collections.push(mistakesFolder);
        localStorage.setItem('predoctr-collections', JSON.stringify(collections));
      }
    }
  };

  const confirmSubmit = () => {
    setIsSubmitModalOpen(false);
    setIsFinished(true);
  };

  const handleRemoveMastered = () => {
    const savedMcqs = JSON.parse(localStorage.getItem('predoctr-saved-mcqs') || '[]');
    const correctIds = questions
      .filter((q, idx) => selectedAnswers[idx] === q.correct)
      .map(q => q.id);
      
    const updated = savedMcqs.filter(m => {
      if (m.folder === 'Mistakes' && correctIds.includes(m.id)) return false;
      return true;
    });
    
    localStorage.setItem('predoctr-saved-mcqs', JSON.stringify(updated));
    setIsCleanupSuccessModalOpen(true);
    
    // Auto-close and navigate after 2.5 seconds
    setTimeout(() => {
      setIsCleanupSuccessModalOpen(false);
      navigate('/student-dashboard');
    }, 2500);
  };

  // --- Early returns AFTER all hooks ---

  // Wrapper for the layout so the sidebar is always present
  const renderLayout = (content) => (
    <div ref={viewerRef} className={`lesson-viewer-layout ${!isCourseSidebarOpen ? 'course-sidebar-closed' : ''} ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Sidebar Navigation */}
      {isCourseSidebarOpen && (
        <aside className="lesson-sidebar hide-mobile fade-in-left">
          <div className="sidebar-header">
            <h2>Course Content</h2>
          </div>
          <div className="sidebar-accordion-container">
            {topics.length > 0 ? (
              topics.map((chapter, index) => (
                <CourseAccordion
                  key={index}
                  chapter={chapter}
                  index={index}
                  subjectId={rawSubjectId}
                  navigate={navigate}
                  isOpen={openAccordionIndex === index}
                  onToggle={() => setOpenAccordionIndex(openAccordionIndex === index ? null : index)}
                  currentTopic={currentTopic}
                  currentSubtest={currentSubtest}
                  isSidebar={true}
                />
              ))
            ) : (
              <div className="empty-sidebar-msg">No chapters found.</div>
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
            <button className="back-to-course" onClick={() => navigate(`/courses/${rawSubjectId}-mcqs`)}>
              <ChevronLeft size={18} /> {cleanSubject} MCQs
            </button>
          </div>
          <div className="topbar-right">
            <span className="lesson-progress">Your Progress: 0 of 242 (0%)</span>
            <button className="mark-complete-btn">
              <CheckCircle2 size={16} /> Mark as Complete
            </button>
            <button className="close-lesson-btn" onClick={() => navigate(`/courses/${rawSubjectId}-mcqs`)}>
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

  if (questions.length === 0) {
    return renderLayout(
      <div className="test-interface-v2 empty-state">
        <div className="container empty-container">
          <Bookmark size={64} color="#e2e8f0" />
          <h2>No Questions Found</h2>
          <p>This folder is currently empty. Bookmark tough questions during practice tests to see them here!</p>
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

            <h2 className="question-text">{q.text}</h2>

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
                    <div className="option-content">{option}</div>
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
                <p>{q.explanation}</p>
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
                        key={folder}
                        className={`folder-item ${selectedFolder === folder ? 'selected' : ''}`}
                        onClick={() => { setSelectedFolder(folder); setNewFolderName(''); }}
                      >
                        <span>{folder}</span>
                        {selectedFolder === folder && <CheckCircle2 size={16} />}
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
                  disabled={!newFolderName && !selectedFolder}
                  onClick={handleSaveConfirm}
                >
                  Save Question
                </button>
              </div>
            )}
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
