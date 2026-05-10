import React, { useEffect } from 'react';
import { X, Lock, Video, Brain, BookOpen, Trophy, MessageCircle } from 'lucide-react';
import './UpgradeModal.css';

// Placeholder — user will provide the real link later
export const WHATSAPP_LINK = 'https://wa.me/923000000000?text=Hi%2C%20I%27d%20like%20to%20get%20full%20access%20to%20preDoctr.pk%20LMS';

const WhatsAppIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.555 4.112 1.523 5.836L0 24l6.336-1.51A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.368l-.36-.213-3.718.886.918-3.614-.234-.374A9.794 9.794 0 012.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z"/>
  </svg>
);

const BENEFITS = [
  { icon: <Video size={18} />, text: 'All video lectures — Biology, Chemistry, Physics, English & Logical Reasoning', color: '#4096EE', bg: '#eff6ff' },
  { icon: <Brain size={18} />, text: 'Full MCQ Question Bank with 2,400+ Biology MCQs, topic tests & past papers', color: '#8b5cf6', bg: '#f5f3ff' },
  { icon: <BookOpen size={18} />, text: 'Chapter notes, board book MCQs, short-listings & past papers', color: '#f59e0b', bg: '#fffbeb' },
  { icon: <Trophy size={18} />, text: 'Leaderboard ranking, performance analytics & study tracking', color: '#10b981', bg: '#f0fdf4' },
];

const AVATAR_COLORS = ['#4096EE', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
const AVATAR_LETTERS = ['S', 'A', 'H', 'F', 'Z'];

const UpgradeModal = ({ isOpen, onClose, chapterName = '' }) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="upgrade-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="upgrade-modal" onClick={e => e.stopPropagation()}>
        
        {/* Close */}
        <button className="upgrade-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Hero section */}
        <div className="upgrade-hero">
          <div className="upgrade-lock-ring">
            <Lock size={30} />
          </div>
          <h2 className="upgrade-title">Unlock Full Access</h2>
          {chapterName && (
            <p className="upgrade-chapter-hint">
              "{chapterName}" and all other chapters are waiting for you
            </p>
          )}
        </div>

        {/* Social proof */}
        <div className="upgrade-social-proof">
          <div className="upgrade-avatars">
            {AVATAR_LETTERS.map((letter, i) => (
              <div
                key={i}
                className="upgrade-avatar"
                style={{ backgroundColor: AVATAR_COLORS[i], zIndex: 5 - i }}
              >
                {letter}
              </div>
            ))}
          </div>
          <span className="upgrade-social-text">
            <strong>5,000+ students</strong> already learning on preDoctr.pk
          </span>
        </div>

        {/* Divider */}
        <div className="upgrade-divider" />

        {/* Benefits */}
        <p className="upgrade-benefits-label">What you get with full access:</p>
        <div className="upgrade-benefits">
          {BENEFITS.map((b, i) => (
            <div key={i} className="upgrade-benefit-row">
              <div className="upgrade-benefit-icon" style={{ color: b.color, backgroundColor: b.bg }}>
                {b.icon}
              </div>
              <span className="upgrade-benefit-text">{b.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="upgrade-cta-btn"
        >
          <WhatsAppIcon />
          Get Full Access via WhatsApp
        </a>

        <p className="upgrade-cta-note">
          Message us on WhatsApp — we'll get you set up in minutes 🚀
        </p>
      </div>
    </div>
  );
};

export default UpgradeModal;
