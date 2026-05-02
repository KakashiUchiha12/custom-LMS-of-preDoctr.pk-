import React from 'react';
import logoImg from '../assets/logo.png';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-logo-centered">
          <img src={logoImg} alt="preDoctr.pk" className="hero-logo-img-large" />
          <div className="hero-logo-text-group">
            <span className="hero-prefix">pre</span><span className="hero-suffix">Doctr.pk</span>
            <span className="hero-lms">LMS</span>
          </div>
        </div>
        <h1 className="hero-title">
          Master Concepts with <span className="highlight">Video Lectures</span>
        </h1>
      </div>
    </section>
  );
};

export default Hero;
