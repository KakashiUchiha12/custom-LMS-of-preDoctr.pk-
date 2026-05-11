import React, { useState, useEffect, useCallback } from 'react';
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
  FileUp,
  Flag
} from 'lucide-react';
import { api } from '../../utils/api';
import './MCQManager.css';

const MCQManager = () => {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All Subjects');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMcq, setCurrentMcq] = useState(null);
  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_opt: 'a',
    subject: 'Biology',
    chapter: ''
  });

  const fetchMcqs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/admin/mcqs?search=${search}&subject=${subject}&page=${page}&limit=${limit}`);
      
      // Map DB rows to component format
      const mappedMcqs = data.mcqs.map(row => {
        const options = [row.option_a, row.option_b, row.option_c, row.option_d];
        const correctOptIndex = {'a': 0, 'b': 1, 'c': 2, 'd': 3}[row.correct_opt?.toLowerCase()] || 0;
        return {
          id: `MCQ-${row.id}`,
          dbId: row.id,
          text: row.question_text,
          options: options,
          correct: options[correctOptIndex],
          correct_opt: row.correct_opt,
          subject: row.subject,
          chapter: row.chapter,
          difficulty: 'Medium', // Fallback
          flags: 0 // Fallback
        };
      });

      setMcqs(mappedMcqs);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch MCQs:', err);
      setError('Failed to load MCQs');
    } finally {
      setLoading(false);
    }
  }, [search, subject, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMcqs();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchMcqs]);

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on search change
  };

  const handleOpenAddModal = () => {
    setCurrentMcq(null);
    setFormData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_opt: 'a',
      subject: 'Biology',
      chapter: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (mcq) => {
    setCurrentMcq(mcq);
    setFormData({
      question_text: mcq.text,
      option_a: mcq.options[0],
      option_b: mcq.options[1],
      option_c: mcq.options[2],
      option_d: mcq.options[3],
      correct_opt: mcq.correct_opt?.toLowerCase() || 'a',
      subject: mcq.subject || 'Biology',
      chapter: mcq.chapter || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this MCQ?')) {
      try {
        await api.delete(`/api/admin/mcqs/${id}`);
        fetchMcqs(); // Refresh
      } catch (err) {
        console.error('Failed to delete MCQ:', err);
        alert('Failed to delete MCQ');
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentMcq) {
        // Update
        await api.put(`/api/admin/mcqs/${currentMcq.dbId}`, formData);
      } else {
        // Create
        await api.post('/api/admin/mcqs', formData);
      }
      setIsModalOpen(false);
      fetchMcqs(); // Refresh
    } catch (err) {
      console.error('Failed to save MCQ:', err);
      alert('Failed to save MCQ');
    }
  };

  return (
    <div className="mcq-manager">
      <div className="manager-header">
        <div>
          <h1>MCQ Database Explorer</h1>
          <p>Manage and refine your collection of {total.toLocaleString()} medical entrance questions.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary"><FileUp size={18} /> Bulk Import</button>
          <button className="btn-primary" onClick={handleOpenAddModal}><Plus size={18} /> Add New MCQ</button>
        </div>
      </div>

      {/* Database Filters */}
      <div className="db-controls">
        <div className="search-group">
          <div className="search-input">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by MCQ ID or keywords..." 
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <select className="subject-select" value={subject} onChange={handleSubjectChange}>
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
            <span className="val">{total.toLocaleString()}</span>
          </div>
          <div className="q-stat warning">
            <span className="label">Flagged</span>
            <span className="val">0</span>
          </div>
          <div className="q-stat">
            <span className="label">Duplicates Found</span>
            <span className="val">0</span>
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

        {loading ? (
          <div className="loading-state">Loading MCQs...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : mcqs.length ===-0 ? (
          <div className="empty-state">No MCQs found matching your criteria.</div>
        ) : (
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
                    <button className="action-btn edit" title="Edit MCQ" onClick={() => handleOpenEditModal(mcq)}><Edit size={16} /></button>
                    <button className="action-btn clone" title="Duplicate"><Copy size={16} /></button>
                    <button className="action-btn delete" title="Delete" onClick={() => handleDelete(mcq.dbId)}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="pagination">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>Page {page} of {Math.ceil(total / limit) || 1}</span>
          <button 
            disabled={page >= Math.ceil(total / limit)} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentMcq ? 'Edit MCQ' : 'Add New MCQ'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Question Text</label>
                <textarea 
                  name="question_text" 
                  value={formData.question_text} 
                  onChange={handleFormChange} 
                  required
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Option A</label>
                  <input type="text" name="option_a" value={formData.option_a} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Option B</label>
                  <input type="text" name="option_b" value={formData.option_b} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Option C</label>
                  <input type="text" name="option_c" value={formData.option_c} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Option D</label>
                  <input type="text" name="option_d" value={formData.option_d} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Correct Option</label>
                  <select name="correct_opt" value={formData.correct_opt} onChange={handleFormChange}>
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select name="subject" value={formData.subject} onChange={handleFormChange}>
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="English">English</option>
                    <option value="Logical Reasoning">Logical Reasoning</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Chapter</label>
                <input type="text" name="chapter" value={formData.chapter} onChange={handleFormChange} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQManager;
