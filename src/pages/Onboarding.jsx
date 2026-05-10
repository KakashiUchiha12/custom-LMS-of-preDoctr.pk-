import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, GraduationCap, ChevronRight, CheckCircle2, Phone, BookOpen, Brain, Trophy, Video, Sparkles } from 'lucide-react';
import './Onboarding.css';
import '../components/Header.css';
import logoImg from '../assets/logo.png';

// Province → City mapping
const CITIES_BY_PROVINCE = {
  'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan', 'Sargodha', 'Sialkot', 'Bahawalpur', 'Sheikhupura', 'Gujrat', 'Rahim Yar Khan', 'Jhang', 'Kasur', 'Okara', 'Sahiwal'],
  'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpurkhas', 'Khairpur', 'Thatta', 'Dadu'],
  'KPK': ['Peshawar', 'Abbottabad', 'Mardan', 'Swat', 'Mansehra', 'Kohat', 'Nowshera', 'Dera Ismail Khan', 'Haripur', 'Swabi'],
  'Balochistan': ['Quetta', 'Turbat', 'Khuzdar', 'Hub', 'Gwadar', 'Chaman', 'Sibi'],
  'Islamabad Capital Territory': ['Islamabad'],
  'AJK': ['Muzaffarabad', 'Mirpur', 'Rawalakot', 'Bagh', 'Kotli'],
  'Gilgit-Baltistan': ['Gilgit', 'Skardu', 'Hunza', 'Chilas', 'Ghanche'],
};

const PROVINCES = Object.keys(CITIES_BY_PROVINCE);

// Confetti component
const Confetti = () => {
  const colors = ['#4096EE', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    duration: `${2 + Math.random() * 2}s`,
    size: `${6 + Math.random() * 8}px`,
    shape: Math.random() > 0.5 ? 'circle' : 'square',
    rotate: `${Math.random() * 360}deg`,
  }));

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  );
};

// Success screen
const SuccessScreen = () => (
  <div className="success-screen">
    <div className="success-checkmark">
      <CheckCircle2 size={64} />
    </div>
    <h1>You're all set! 🎉</h1>
    <p>Your profile has been created. Welcome to preDoctr LMS — your MDCAT journey starts now!</p>
    <div className="success-loader">
      <div className="success-loader-bar" />
    </div>
    <span className="success-redirect-text">Taking you to your dashboard…</span>
  </div>
);

// What you'll unlock preview
const UnlockPreview = () => (
  <div className="unlock-preview">
    <p className="unlock-title">🔓 You're about to unlock</p>
    <div className="unlock-cards">
      <div className="unlock-card">
        <div className="unlock-icon video"><Video size={20} /></div>
        <div>
          <strong>Video Lectures</strong>
          <span>Biology, Chemistry, Physics & more</span>
        </div>
      </div>
      <div className="unlock-card">
        <div className="unlock-icon brain"><Brain size={20} /></div>
        <div>
          <strong>MCQ Question Bank</strong>
          <span>1000s of PMDC-aligned practice questions</span>
        </div>
      </div>
      <div className="unlock-card">
        <div className="unlock-icon trophy"><Trophy size={20} /></div>
        <div>
          <strong>Leaderboard & Tracking</strong>
          <span>Compete with top students nationwide</span>
        </div>
      </div>
    </div>
  </div>
);

const Onboarding = () => {
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [animKey, setAnimKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [cityMode, setCityMode] = useState('select'); // 'select' | 'type'
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    gender: '',
    province: '',
    city: '',
    targetYear: '2026',
    college: '',
  });

  const goNext = () => {
    setDirection('forward');
    setAnimKey(k => k + 1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    setDirection('backward');
    setAnimKey(k => k + 1);
    setStep(s => s - 1);
  };

  // WhatsApp formatting
  const formatWhatsapp = (digits) => {
    if (digits.startsWith('92')) {
      // 92 + 3XX + 7 digits = 12 total
      if (digits.length > 5) return digits.slice(0, 5) + ' ' + digits.slice(5);
    } else if (digits.startsWith('0')) {
      // 0 + 3XX + 7 digits = 11 total
      if (digits.length > 4) return digits.slice(0, 4) + ' ' + digits.slice(4);
    }
    return digits;
  };

  const handleWhatsappChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 12) {
      setFormData({ ...formData, whatsapp: formatWhatsapp(raw) });
    }
  };

  const isWhatsappValid = (num) => {
    if (!num) return false;
    const digits = num.replace(/\s/g, '');
    if (digits.startsWith('0')) return digits.length === 11;
    if (digits.startsWith('92')) return digits.length === 12;
    return false;
  };

  const handleProvinceChange = (e) => {
    setFormData({ ...formData, province: e.target.value, city: '' });
    setCityMode('select');
  };

  const handleCitySelect = (e) => {
    const val = e.target.value;
    if (val === '__other__') {
      setCityMode('type');
      setFormData({ ...formData, city: '' });
    } else {
      setFormData({ ...formData, city: val });
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      completeOnboarding(formData);
    }, 3000);
  };

  const cities = formData.province ? CITIES_BY_PROVINCE[formData.province] || [] : [];
  const whatsappDigits = formData.whatsapp.replace(/\s/g, '');
  const whatsappValid = isWhatsappValid(formData.whatsapp);
  const whatsappTouched = formData.whatsapp.length > 0;

  const stepLabels = ['About You', 'Location', 'Your Goal'];

  return (
    <div className="onboarding-page">
      {submitted && <Confetti />}

      <div className="onboarding-container">
        {/* Brand */}
        <div className="onboarding-brand">
          <img src={logoImg} alt="preDoctr LMS" className="predoctr-logo-img" style={{ height: '38px' }} />
          <span className="predoctr-logo-text" style={{ fontSize: '1.4rem' }}>
            <span className="predoctr-prefix">pre</span><span className="predoctr-suffix">Doctr.pk</span>
            <span className="predoctr-lms" style={{ fontSize: '1rem', marginLeft: '0.3rem' }}>LMS</span>
          </span>
        </div>

        {/* Step Progress */}
        {!submitted && (
          <div className="onboarding-progress">
            <div className="progress-track">
              <div className="progress-track-fill" style={{ width: `${((step - 1) / 2) * 100}%` }} />
            </div>
            {stepLabels.map((label, i) => (
              <div key={i} className="progress-step-col">
                <div className={`progress-step ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'completed' : ''}`}>
                  {step > i + 1 ? <CheckCircle2 size={16} /> : <span>{i + 1}</span>}
                </div>
                <span className={`progress-label ${step >= i + 1 ? 'active' : ''}`}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="onboarding-card">
          {submitted ? (
            <SuccessScreen />
          ) : (
            <div key={animKey} className={`step-content step-anim-${direction}`}>

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <>
                  <div className="step-icon"><User size={28} /></div>
                  <h1>Welcome to preDoctr! 👋</h1>
                  <p>Let's personalize your MDCAT journey. It only takes a minute.</p>

                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      autoFocus
                    />
                  </div>

                  <div className="input-group">
                    <label>WhatsApp Number</label>
                    <div className="input-with-status">
                      <input
                        type="tel"
                        placeholder="0300 1234567 or 92300 1234567"
                        value={formData.whatsapp}
                        onChange={handleWhatsappChange}
                        className={whatsappTouched && !whatsappValid ? 'invalid-input' : whatsappValid ? 'valid-input' : ''}
                      />
                      {whatsappTouched && (
                        <span className={`input-status-icon ${whatsappValid ? 'valid' : 'invalid'}`}>
                          {whatsappValid ? <CheckCircle2 size={18} /> : '✕'}
                        </span>
                      )}
                    </div>
                    {whatsappTouched && !whatsappValid && (
                      <span className="input-hint error">
                        Must be 11 digits starting with 0 or 12 digits starting with 92
                      </span>
                    )}
                    {whatsappValid && (
                      <span className="input-hint success">✓ Looks good!</span>
                    )}
                  </div>

                  <div className="input-group centered">
                    <label>Gender</label>
                    <div className="gender-selection">
                      <div
                        className={`gender-option ${formData.gender === 'Male' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, gender: 'Male' })}
                      >
                        <div className="gender-icon male">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <span>Male</span>
                        {formData.gender === 'Male' && <CheckCircle2 size={14} className="gender-check" />}
                      </div>
                      <div
                        className={`gender-option ${formData.gender === 'Female' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, gender: 'Female' })}
                      >
                        <div className="gender-icon female">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                            <path d="M10 3a2 2 0 0 1 4 0" />
                          </svg>
                        </div>
                        <span>Female</span>
                        {formData.gender === 'Female' && <CheckCircle2 size={14} className="gender-check" />}
                      </div>
                    </div>
                  </div>

                  <button
                    className="onboarding-btn"
                    disabled={!formData.fullName || !whatsappValid || !formData.gender}
                    onClick={goNext}
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <>
                  <div className="step-icon"><MapPin size={28} /></div>
                  <h1>Where are you from?</h1>
                  <p>This helps us surface province-specific MDCAT resources just for you.</p>

                  <div className="input-group">
                    <label>Province</label>
                    <select value={formData.province} onChange={handleProvinceChange}>
                      <option value="">— Select your province —</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>City</label>
                    {cityMode === 'select' ? (
                      <>
                        <select
                          value={formData.city}
                          onChange={handleCitySelect}
                          disabled={!formData.province}
                        >
                          <option value="">{formData.province ? '— Select your city —' : 'Select province first'}</option>
                          {cities.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="__other__">✏️ My city is not listed…</option>
                        </select>
                      </>
                    ) : (
                      <div className="city-type-wrapper">
                        <input
                          type="text"
                          placeholder="Type your city name"
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="city-back-btn"
                          onClick={() => { setCityMode('select'); setFormData({ ...formData, city: '' }); }}
                        >
                          ← Back to list
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="btn-row">
                    <button className="onboarding-btn-outline" onClick={goBack}>Back</button>
                    <button
                      className="onboarding-btn"
                      disabled={!formData.province || !formData.city}
                      onClick={goNext}
                    >
                      Continue <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <>
                  <div className="step-icon"><GraduationCap size={28} /></div>
                  <h1>Almost there! 🎯</h1>
                  <p>Tell us your target year so we can tailor the content for you.</p>

                  <div className="input-group">
                    <label>Target MDCAT Year</label>
                    <select
                      value={formData.targetYear}
                      onChange={e => setFormData({ ...formData, targetYear: e.target.value })}
                    >
                      <option value="2025">MDCAT 2025</option>
                      <option value="2026">MDCAT 2026</option>
                      <option value="2027">MDCAT 2027</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>College Name <span className="optional-label">(Optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Punjab Medical College"
                      value={formData.college}
                      onChange={e => setFormData({ ...formData, college: e.target.value })}
                    />
                  </div>

                  <UnlockPreview />

                  <div className="btn-row">
                    <button className="onboarding-btn-outline" onClick={goBack}>Back</button>
                    <button className="onboarding-btn finish" onClick={handleSubmit}>
                      <Sparkles size={18} /> Build My Profile
                    </button>
                  </div>
                </>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
