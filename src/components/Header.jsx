import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSubmenu = (name) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenSubmenus({});
  };

  return (
    <div className="predoctr-nav-wrapper">
      <div className="predoctr-nav-container">
        {/* Brand / Logo (Left) */}
        <Link to="/" className="predoctr-logo-link predoctr-brand" onClick={closeMenu}>
          <img src={logoImg} alt="preDoctr LMS" className="predoctr-logo-img" />
          <span className="predoctr-logo-text">
            <span className="predoctr-prefix">pre</span><span className="predoctr-suffix">Doctr.pk</span>
            <span className="predoctr-lms">LMS</span>
          </span>
        </Link>

        {/* Mobile Toggle Button */}
        <button 
          className={`predoctr-mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
          aria-label="Toggle Menu"
        >
          <span className="predoctr-bar"></span>
          <span className="predoctr-bar"></span>
          <span className="predoctr-bar"></span>
        </button>

        {/* Menu Items */}
        <ul className={`predoctr-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {/* Predoctr.pk Main Page Link */}
          <li className="predoctr-menu-item">
            <a href="https://predoctr.pk" className="predoctr-menu-link" onClick={closeMenu}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img src={logoImg} alt="preDoctr" className="predoctr-menu-logo-img" />
                <span className="predoctr-menu-logo-text">
                  <span className="predoctr-prefix">pre</span><span className="predoctr-suffix">Doctr.pk</span>
                </span>
                <span className="predoctr-main-page-tag">[Main Page]</span>
              </div>
            </a>
          </li>

          {/* Leaderboard */}
          <li className="predoctr-menu-item">
            <Link to="/leaderboard" className="predoctr-menu-link" onClick={closeMenu}>Leaderboard</Link>
          </li>

          {/* Contact */}
          <li className="predoctr-menu-item">
            <Link to="/contact-us-2" className="predoctr-menu-link" onClick={closeMenu}>Contact Us</Link>
          </li>

          {/* Student Dashboard (Replaces Login) */}
          <li className="predoctr-menu-item">
            <Link to="/student-dashboard" className="predoctr-menu-link" onClick={closeMenu}>Student Dashboard</Link>
          </li>

          {/* Lectures Dropdown */}
          <li className={`predoctr-menu-item has-submenu ${openSubmenus['lectures'] ? 'open' : ''}`}>
            <Link 
              to="/lectures" 
              className={`predoctr-menu-link ${openSubmenus['lectures'] ? 'open' : ''}`}
              onClick={(e) => {
                if (window.innerWidth <= 1024) {
                  e.preventDefault();
                  toggleSubmenu('lectures');
                } else {
                  closeMenu();
                }
              }}
            >
              Lectures
              <svg className="predoctr-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </Link>
            <div className={`predoctr-submenu ${openSubmenus['lectures'] ? 'open' : ''}`}>
              <Link to="/courses/biology-lectures" className="predoctr-submenu-link" onClick={closeMenu}>Biology Lectures</Link>
              <Link to="/courses/chemistry-lectures" className="predoctr-submenu-link" onClick={closeMenu}>Chemistry Lectures</Link>
              <Link to="/courses/physics-lectures" className="predoctr-submenu-link" onClick={closeMenu}>Physics Lectures</Link>
              <Link to="/courses/english-lectures" className="predoctr-submenu-link" onClick={closeMenu}>English Lectures</Link>
              <Link to="/courses/logical-reasoning-lectures" className="predoctr-submenu-link" onClick={closeMenu}>Logical Reasoning Lectures</Link>
            </div>
          </li>

          {/* Question Bank Dropdown */}
          <li className={`predoctr-menu-item has-submenu ${openSubmenus['qbank'] ? 'open' : ''}`}>
            <Link 
              to="/question-bank" 
              className={`predoctr-menu-link ${openSubmenus['qbank'] ? 'open' : ''}`}
              onClick={(e) => {
                if (window.innerWidth <= 1024) {
                  e.preventDefault();
                  toggleSubmenu('qbank');
                } else {
                  closeMenu();
                }
              }}
            >
              Question Bank
              <svg className="predoctr-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </Link>
            <div className={`predoctr-submenu ${openSubmenus['qbank'] ? 'open' : ''}`}>
              <Link to="/courses/biology-mcqs" className="predoctr-submenu-link" onClick={closeMenu}>Biology MCQs</Link>
              <Link to="/courses/chemistry-mcqs" className="predoctr-submenu-link" onClick={closeMenu}>Chemistry MCQs</Link>
              <Link to="/courses/physics" className="predoctr-submenu-link" onClick={closeMenu}>Physics MCQs</Link>
              <Link to="/courses/logical-reasoning-mcqs" className="predoctr-submenu-link" onClick={closeMenu}>Logical Reasoning MCQs</Link>
              <Link to="/courses/english-mcqs" className="predoctr-submenu-link" onClick={closeMenu}>English MCQs</Link>
              
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 0' }}></div>
              <Link to="/courses/full-length-test-series" className="predoctr-submenu-link" onClick={closeMenu}>Full Length Test Series by Risen Academy</Link>
              <Link to="/courses/predoctr-test-series" className="predoctr-submenu-link" onClick={closeMenu}>preDoctr.pk Test Series</Link>
            </div>
          </li>

          {/* Past Papers Dropdown */}
          <li className={`predoctr-menu-item has-submenu ${openSubmenus['papers'] ? 'open' : ''}`}>
            <a 
              href="#" 
              className={`predoctr-menu-link ${openSubmenus['papers'] ? 'open' : ''}`}
              onClick={(e) => {
                if (window.innerWidth <= 1024) {
                  e.preventDefault();
                  toggleSubmenu('papers');
                }
              }}
            >
              Past Papers
              <svg className="predoctr-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </a>
            <div className={`predoctr-submenu ${openSubmenus['papers'] ? 'open' : ''}`}>
              <Link to="/courses/past-papers-full-length" className="predoctr-submenu-link" onClick={closeMenu}>UHS Past Papers</Link>
              <Link to="/courses/past-papers-full-length" className="predoctr-submenu-link" onClick={closeMenu}>KMU Past Papers</Link>
              <Link to="/courses/past-papers-full-length" className="predoctr-submenu-link" onClick={closeMenu}>SZABMU Past Papers</Link>
              <Link to="/courses/past-papers-full-length" className="predoctr-submenu-link" onClick={closeMenu}>Balochistan Past Papers</Link>
              <Link to="/courses/past-papers-full-length" className="predoctr-submenu-link" onClick={closeMenu}>Sindh MDCAT Past Papers</Link>
              <Link to="/courses/past-papers-full-length" className="predoctr-submenu-link" onClick={closeMenu}>NUMS Past Papers</Link>
            </div>
          </li>

          {/* Resources Dropdown */}
          <li className={`predoctr-menu-item has-submenu ${openSubmenus['resources'] ? 'open' : ''}`}>
            <a 
              href="#" 
              className={`predoctr-menu-link ${openSubmenus['resources'] ? 'open' : ''}`}
              onClick={(e) => {
                if (window.innerWidth <= 1024) {
                  e.preventDefault();
                  toggleSubmenu('resources');
                }
              }}
            >
              Resources
              <svg className="predoctr-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </a>
            <div className={`predoctr-submenu ${openSubmenus['resources'] ? 'open' : ''}`}>
              <Link to="/board-books" className="predoctr-submenu-link" onClick={closeMenu}>Board Books</Link>
              <Link to="/mdcat-syllabus-2021-onwards" className="predoctr-submenu-link" onClick={closeMenu}>MDCAT Syllabus</Link>
              <Link to="/aggregate-calculator" className="predoctr-submenu-link" onClick={closeMenu}>MDCAT Aggregate Calculator</Link>
              <Link to="/ocr-answer-sheet" className="predoctr-submenu-link" onClick={closeMenu}>Blank OCR Answer Sheet</Link>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;
