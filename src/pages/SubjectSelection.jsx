import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, HelpCircle, ChevronRight } from 'lucide-react';
import './SubjectSelection.css';

// Import subject images
const SUBJECTS = [
  { id: 'biology', name: 'Biology', mcqImage: '/Biology-MCQs.png', lectureImage: '/BIOLOGY-LECTURES.png', color: '#10b981', chapters: 24, questions: '2,400+' },
  { id: 'chemistry', name: 'Chemistry', mcqImage: '/Chemistry-MCQs-1024x576-1.png', lectureImage: '/CHEMISTRY-LECTURES.png', color: '#f59e0b', chapters: 18, questions: '1,800+' },
  { id: 'physics', name: 'Physics', mcqImage: '/Physics-mcqS.png', lectureImage: '/PHYSICS-LECTURES.png', color: '#3b82f6', chapters: 20, questions: '2,000+' },
  { id: 'english', name: 'English', mcqImage: '/English-MCQs.png', lectureImage: '/ENGLISH-LECTURES.png', color: '#8b5cf6', chapters: 12, questions: '800+' },
  { id: 'logical-reasoning', name: 'Logical Reasoning', mcqImage: '/Logical-Reasoning-MCQs.png', lectureImage: '/LOGICAL-REASONING-LECTURES.png', color: '#ec4899', chapters: 8, questions: '500+' },
];

const SubjectSelection = ({ type }) => {
  const isLectures = type === 'lectures';
  const title = isLectures ? 'Academic Lectures' : 'Question Bank';
  const subtitle = isLectures 
    ? 'Master every concept with high-quality video lectures from top educators.' 
    : 'Ace your MDCAT with our comprehensive database of practice questions.';

  return (
    <div className="subject-selection-page">
      <div className="selection-bg-accent"></div>
      <div className="container">
        <header className="selection-header text-center">
          <span className="badge-premium">{isLectures ? 'LMS Content' : 'Practice Engine'}</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        <div className="premium-subjects-grid">
          {SUBJECTS.map((subject) => (
            <Link 
              key={subject.id} 
              to={isLectures ? `/courses/${subject.id}-lectures` : `/courses/${subject.id}-mcqs`}
              className="premium-subject-card"
              style={{ '--subject-color': subject.color }}
            >
              <div className="p-card-image-wrap">
                <img src={isLectures ? subject.lectureImage : subject.mcqImage} alt={subject.name} className="p-card-img" />
                <div className="p-card-overlay"></div>
                <div className="p-card-tag">{subject.name}</div>
              </div>
              
              <div className="p-card-body">
                <div className="p-card-stats">
                  <span>{isLectures ? `${subject.chapters} Chapters` : `${subject.questions} MCQs`}</span>
                  <div className="dot-sep"></div>
                  <span>High Yield</span>
                </div>
                <h3>{isLectures ? `${subject.name} Lectures` : `${subject.name} Prep`}</h3>
                <div className="p-card-footer">
                  <span className="p-card-cta">{isLectures ? 'Start Learning' : 'Start Practice'}</span>
                  <div className="p-card-arrow">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectSelection;
