import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Copy,
  ChevronDown,
  FileUp
} from 'lucide-react';
import './MCQManager.css';

const MCQManager = () => {
  const [subject, setSubject] = useState('Biology');
  
  // Mock MCQ data
  const mcqs = [
    { 
      id: 'MCQ-7821', 
      text: 'Which of the following is the main site of photosynthesis in a plant cell?', 
      options: ['Mitochondria', 'Chloroplast', 'Ribosome', 'Lysosome'],
      correct: 'Chloroplast',
      subject: 'Biology',
      chapter: 'Bioenergetics',
      difficulty: 'Easy',
      flags: 0
    },
    { 
      id: 'MCQ-7822', 
      text: 'What is the SI unit of electric current?', 
      options: ['Volt', 'Ohm', 'Ampere', 'Watt'],
      correct: 'Ampere',
      subject: 'Physics',
      chapter: 'Current Electricity',
      difficulty: 'Medium',
      flags: 2
    },
    { 
      id: 'MCQ-7823', 
      text: 'The process of conversion of atmospheric nitrogen into ammonia is called:', 
      options: ['Nitrification', 'Denitrification', 'Nitrogen Fixation', 'Ammonification'],
      correct: 'Nitrogen Fixation',
      subject: 'Biology',
      chapter: 'Cycles of Matter',
      difficulty: 'Hard',
      flags: 1
    },
    { 
      id: 'MCQ-7824', 
      text: 'Which gas is most abundant in the Earth\'s atmosphere?', 
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
      correct: 'Nitrogen',
      subject: 'Chemistry',
      chapter: 'Environmental Chemistry',
      difficulty: 'Easy',
      flags: 0
    }
  ];

  return (
    <div className="mcq-manager">
      <div className="manager-header">
        <div>
          <h1>MCQ Database Explorer</h1>
          <p>Manage and refine your collection of {mcqs.length * 100}+ medical entrance questions.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary"><FileUp size={18} /> Bulk Import</button>
          <button className="btn-primary"><Plus size={18} /> Add New MCQ</button>
        </div>
      </div>

      {/* Database Filters */}
      <div className="db-controls">
        <div className="search-group">
          <div className="search-input">
            <Search size={18} />
            <input type="text" placeholder="Search by MCQ ID or keywords..." />
          </div>
          <select className="subject-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option>All Subjects</option>
            <option>Biology</option>
            <option>Chemistry</option>
            <option>Physics</option>
            <option>English</option>
            <option>Logical Reasoning</option>
          </select>
        </div>
        
        <div className="quick-stats">
          <div className="q-stat">
            <span className="label">Total MCQs</span>
            <span className="val">14,250</span>
          </div>
          <div className="q-stat warning">
            <span className="label">Flagged</span>
            <span className="val">24</span>
          </div>
          <div className="q-stat">
            <span className="label">Duplicates Found</span>
            <span className="val">12</span>
          </div>
        </div>
      </div>

      {/* MCQs List */}
      <div className="mcq-list-container">
        <div className="list-filters">
          <button className="active">All MCQs</button>
          <button>Flagged Only</button>
          <button>Recently Added</button>
          <button>High Error Rate</button>
          <div className="spacer"></div>
          <button className="btn-filter-icon"><Filter size={16} /> Filters</button>
        </div>

        <div className="mcq-cards-grid">
          {mcqs.map((mcq) => (
            <div key={mcq.id} className="mcq-admin-card">
              <div className="card-top">
                <span className="mcq-id">{mcq.id}</span>
                <div className="card-tags">
                  <span className={`difficulty ${mcq.difficulty.toLowerCase()}`}>{mcq.difficulty}</span>
                  {mcq.flags > 0 && <span className="flag-badge"><Flag size={10} /> {mcq.flags} Flags</span>}
                </div>
              </div>
              
              <p className="question-text">{mcq.text}</p>
              
              <div className="options-preview">
                {mcq.options.map((opt, i) => (
                  <div key={i} className={`opt-item ${opt === mcq.correct ? 'correct' : ''}`}>
                    {opt === mcq.correct ? <CheckCircle2 size={12} /> : <div className="dot"></div>}
                    <span>{opt}</span>
                  </div>
                ))}
              </div>

              <div className="card-footer">
                <div className="meta-info">
                  <span>{mcq.subject}</span>
                  <span className="dot-sep">•</span>
                  <span>{mcq.chapter}</span>
                </div>
                <div className="card-actions">
                  <button className="action-btn edit" title="Edit MCQ"><Edit size={16} /></button>
                  <button className="action-btn clone" title="Duplicate"><Copy size={16} /></button>
                  <button className="action-btn delete" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MCQManager;
