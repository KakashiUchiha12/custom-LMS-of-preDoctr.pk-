import React from 'react';
import './ContactPage.css';

const ContactPage = () => {
  const copyContact3 = (btn, text) => {
    navigator.clipboard.writeText(text).then(() => {
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="#10b981" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      btn.classList.add('copied');
      
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.classList.remove('copied');
      }, 2000);
    });
  };

  return (
    <div className="predoctr-contact-section">
      <div className="predoctr-contact-container">
        {/* Header */}
        <div className="predoctr-contact-header">
          <h2 className="predoctr-contact-title">Get in <span>Touch</span></h2>
          <p className="predoctr-contact-subtitle">
            Facing technical issues or have specific questions about the preDoctr.pk MDCAT platform? Contact our support team today for immediate assistance.
          </p>
        </div>

        {/* Clean Cards Grid */}
        <div className="predoctr-contact-grid">
          
          {/* Email Card */}
          <div className="predoctr-contact-card predoctr-card-email">
            <div className="predoctr-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="predoctr-card-title">Email Support</h3>
            <p className="predoctr-card-desc">For general inquiries and detailed questions</p>
            
            <div className="predoctr-action-btn-group">
              <a href="mailto:contact@predoctr.pk" className="predoctr-action-link">contact@predoctr.pk</a>
              <button className="predoctr-copy-btn" onClick={(e) => copyContact3(e.currentTarget, 'contact@predoctr.pk')} aria-label="Copy Email">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* WhatsApp Card */}
          <div className="predoctr-contact-card predoctr-card-wa">
            <div className="predoctr-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="predoctr-card-title">WhatsApp Chat</h3>
            <p className="predoctr-card-desc">Fastest response for technical issues</p>
            
            <div className="predoctr-action-btn-group">
              <a href="https://wa.me/03010903571?text=Hello%20Sir%2C%20I%20have%20some%20problem%20with%20the%20LMS.%20Please%20get%20back%20to%20me%20at%20earliest." target="_blank" rel="noopener noreferrer" className="predoctr-action-link">03010903571</a>
              <button className="predoctr-copy-btn" onClick={(e) => copyContact3(e.currentTarget, '03010903571')} aria-label="Copy Number">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Phone Card */}
          <div className="predoctr-contact-card predoctr-card-phone">
            <div className="predoctr-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="predoctr-card-title">Phone Call</h3>
            <p className="predoctr-card-desc">Speak to an agent directly</p>
            
            <div className="predoctr-action-btn-group">
              <a href="tel:03010903571" className="predoctr-action-link">03010903571</a>
              <button className="predoctr-copy-btn" onClick={(e) => copyContact3(e.currentTarget, '03010903571')} aria-label="Copy Number">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="predoctr-social-container">
          <h3 className="predoctr-social-title">Follow Us</h3>
          <div className="predoctr-social-list">
            <a href="https://www.facebook.com/predoctrpk/" target="_blank" rel="noopener noreferrer" className="predoctr-social-link fb" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://www.instagram.com/predoctr.pk_/" target="_blank" rel="noopener noreferrer" className="predoctr-social-link ig" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://github.com/KakashiUchiha12" target="_blank" rel="noopener noreferrer" className="predoctr-social-link gh" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a href="https://wa.me/03010903571?text=Hello%20Sir%2C%20I%20have%20some%20problem%20with%20the%20LMS.%20Please%20get%20back%20to%20me%20at%20earliest." target="_blank" rel="noopener noreferrer" className="predoctr-float-wa" title="Contact on WhatsApp">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.506-.669-.514-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.084 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>
    </div>
  );
};

export default ContactPage;
