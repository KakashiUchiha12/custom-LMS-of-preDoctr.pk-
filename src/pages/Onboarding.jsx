import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, GraduationCap, ChevronRight, CheckCircle2 } from 'lucide-react';
import './Onboarding.css';
import '../components/Header.css';
import logoImg from '../assets/logo.png';

const Onboarding = () => {
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    gender: '',
    province: '',
    city: '',
    targetYear: '2024',
    college: ''
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const isWhatsappValid = (num) => {
    if (!num) return false;
    if (num.startsWith('0')) return num.length === 11;
    if (num.startsWith('92')) return num.length === 12;
    return false;
  };

  const handleWhatsappChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      setFormData({...formData, whatsapp: value});
    }
  };

  const handleSubmit = () => {
    completeOnboarding(formData);
  };

  const provinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad Capital Territory', 'AJK', 'Gilgit-Baltistan'];

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {/* Animated Brand Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div className="predoctr-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'default' }}>
            <img src={logoImg} alt="preDoctr LMS" className="predoctr-logo-img" style={{ height: '40px' }} />
            <span className="predoctr-logo-text" style={{ fontSize: '1.5rem' }}>
              <span className="predoctr-prefix">pre</span><span className="predoctr-suffix">Doctr.pk</span>
              <span className="predoctr-lms" style={{ fontSize: '1.1rem', marginLeft: '0.4rem' }}>LMS</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="onboarding-progress">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`progress-step ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
              {step > s ? <CheckCircle2 size={18} /> : s}
            </div>
          ))}
          <div className="progress-line">
            <div className="line-fill" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          </div>
        </div>

        <div className="onboarding-card fade-in-up">
          {step === 1 && (
            <div className="step-content">
              <div className="step-icon"><User size={32} /></div>
              <h1>Welcome to preDoctr!</h1>
              <p>First, let's get to know you. Please provide your details.</p>
              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your name" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>WhatsApp Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. 0300 1234567 or 92300 1234567" 
                  value={formData.whatsapp}
                  onChange={handleWhatsappChange}
                  className={formData.whatsapp && !isWhatsappValid(formData.whatsapp) ? 'invalid-input' : ''}
                />
                {formData.whatsapp && !isWhatsappValid(formData.whatsapp) && (
                  <span className="input-hint error">Must be 11 digits (start with 0) or 12 digits (start with 92)</span>
                )}
              </div>
              <div className="input-group centered">
                <label>Gender</label>
                <div className="gender-selection">
                  <div 
                    className={`gender-option ${formData.gender === 'Male' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, gender: 'Male'})}
                  >
                    <div className="gender-icon male">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <span>Male</span>
                  </div>
                  <div 
                    className={`gender-option ${formData.gender === 'Female' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, gender: 'Female'})}
                  >
                    <div className="gender-icon female">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                        <path d="M10 3a2 2 0 0 1 4 0"/>
                      </svg>
                    </div>
                    <span>Female</span>
                  </div>
                </div>
              </div>
              <button 
                className="onboarding-btn" 
                disabled={!formData.fullName || !isWhatsappValid(formData.whatsapp) || !formData.gender} 
                onClick={nextStep}
              >
                Continue <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="step-icon"><MapPin size={32} /></div>
              <h1>Where are you from?</h1>
              <p>This helps us provide province-specific MDCAT resources.</p>
              <div className="input-group">
                <label>Province</label>
                <select 
                  value={formData.province}
                  onChange={(e) => setFormData({...formData, province: e.target.value})}
                >
                  <option value="">Select Province</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>City</label>
                <input 
                  type="text" 
                  placeholder="Enter your city" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div className="btn-row">
                <button className="onboarding-btn-outline" onClick={prevStep}>Back</button>
                <button className="onboarding-btn" disabled={!formData.province || !formData.city} onClick={nextStep}>
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <div className="step-icon"><GraduationCap size={32} /></div>
              <h1>Academic Details</h1>
              <p>Almost there! When are you planning to take the MDCAT?</p>
              <div className="input-group">
                <label>Target MDCAT Year</label>
                <select 
                  value={formData.targetYear}
                  onChange={(e) => setFormData({...formData, targetYear: e.target.value})}
                >
                  <option value="2024">MDCAT 2024</option>
                  <option value="2025">MDCAT 2025</option>
                  <option value="2026">MDCAT 2026</option>
                </select>
              </div>
              <div className="input-group">
                <label>College Name (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Enter your college" 
                  value={formData.college}
                  onChange={(e) => setFormData({...formData, college: e.target.value})}
                />
              </div>
              <div className="btn-row">
                <button className="onboarding-btn-outline" onClick={prevStep}>Back</button>
                <button className="onboarding-btn finish" onClick={handleSubmit}>
                  Build My Profile <CheckCircle2 size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
