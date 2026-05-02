import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { SUBTEST_GROUPS, LECTURE_GROUPS, SubtestIcon } from '../data/courseData';
import './CourseAccordion.css';

const SubtestGroup = ({ group, chapterName, subjectId, navigate, currentTopic, currentSubtest, type }) => {
  const isActiveGroup = currentTopic === chapterName && group.items.some(item => item.label === currentSubtest);
  const [isOpen, setIsOpen] = useState(isActiveGroup);

  const handleItemClick = (item) => {
    if (type === 'lectures') {
      navigate(`/lectures/${subjectId}/watch?chapter=${encodeURIComponent(chapterName)}&lecture=${encodeURIComponent(item.label)}`);
    } else {
      navigate(`/practice/${subjectId}/start?topic=${encodeURIComponent(chapterName)}&subtest=${encodeURIComponent(item.label)}`);
    }
  };

  return (
    <div key={group.group} className={`subtest-group ${isOpen ? 'open' : ''}`}>
      {/* Group Sub-Header */}
      <div 
        className="subtest-group-header" 
        style={{ '--group-color': group.color, cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="group-header-left">
          <span className="group-header-dot" style={{ background: group.color }}></span>
          <span className="group-header-label">{group.group}</span>
        </div>
        {isOpen ? <ChevronDown size={14} className="group-chevron" /> : <ChevronRight size={14} className="group-chevron" />}
      </div>

      {/* Group Items */}
      {isOpen && (
        <div className="subtest-items-list">
          {group.items.map((item, si) => {
            const isActive = currentTopic === chapterName && currentSubtest === item.label;
            return (
              <div 
                key={si} 
                className={`subtest-item ${isActive ? 'active' : ''}`} 
                onClick={() => handleItemClick(item)}
              >
                <div className="subtest-left">
                  <SubtestIcon type={item.icon} color={group.color} />
                  <span className="subtest-label">{item.label}</span>
                </div>
                {isActive ? (
                  <span className="active-indicator" style={{ backgroundColor: group.color }}></span>
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

export const CourseAccordion = ({ 
  chapter, 
  index, 
  subjectId, 
  navigate, 
  isOpen, 
  onToggle, 
  currentTopic, 
  currentSubtest, 
  isSidebar,
  type = 'mcqs'
}) => {
  const groups = type === 'lectures' ? LECTURE_GROUPS : SUBTEST_GROUPS;
  const totalItems = groups.reduce((acc, group) => acc + group.items.length, 0);
  
  return (
    <div className={`chapter-accordion ${isOpen ? 'open' : ''} ${isSidebar ? 'sidebar-variant' : ''}`}>
      <button className="chapter-accordion-header" onClick={onToggle}>
        <div className="chapter-header-left">
          <span className="chapter-emoji">{chapter.emoji}</span>
          <span className="chapter-accordion-name">{chapter.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSidebar && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>0/{totalItems}</span>}
          {isOpen ? <ChevronDown size={isSidebar ? 16 : 20} className="accordion-chevron" /> : <ChevronRight size={isSidebar ? 16 : 20} className="accordion-chevron" />}
        </div>
      </button>

      {isOpen && (
        <div className="chapter-subtests">
          {groups.map((group) => (
            <SubtestGroup 
              key={group.group} 
              group={group} 
              chapterName={chapter.name} 
              subjectId={subjectId} 
              navigate={navigate}
              currentTopic={currentTopic}
              currentSubtest={currentSubtest}
              type={type}
            />
          ))}
        </div>
      )}
    </div>
  );
};
