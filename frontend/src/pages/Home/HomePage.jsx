import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const AnimatedLogo = () => (
  <div className="home-logo-wrap" aria-label="StudyApp logo">
    <svg className="home-logo-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1C2167" />
          <stop offset="100%" stopColor="#2a3699" />
        </linearGradient>
        <linearGradient id="logoGradCap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7fb4dd" />
          <stop offset="100%" stopColor="#5b8fb9" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="120" height="120" rx="28" fill="url(#logoGradBg)" />
      <polygon className="home-logo-cap" points="60,22 104,42 60,62 16,42" fill="url(#logoGradCap)" filter="url(#logoGlow)" />
      <path className="home-logo-tassel" d="M16 42 L16 62 C16 62 22 67 25 65 L25 45Z" fill="#5b8fb9" opacity="0.8" />
      <line className="home-logo-string" x1="104" y1="42" x2="104" y2="56" stroke="#7fb4dd" strokeWidth="3" strokeLinecap="round" />
      <circle className="home-logo-dot" cx="104" cy="60" r="4" fill="#7fb4dd" />
      <path className="home-logo-book" d="M34 72 Q60 66 86 72 L86 98 Q60 92 34 98Z" fill="rgba(255,255,255,0.12)" stroke="#7fb4dd" strokeWidth="1.5" />
      <line x1="60" y1="68" x2="60" y2="98" stroke="#7fb4dd" strokeWidth="1.5" opacity="0.5" />
      <line x1="44" y1="77" x2="57" y2="74" stroke="rgba(127,180,221,0.4)" strokeWidth="1" strokeLinecap="round" />
      <line x1="44" y1="83" x2="57" y2="80" stroke="rgba(127,180,221,0.4)" strokeWidth="1" strokeLinecap="round" />
      <line x1="63" y1="74" x2="76" y2="77" stroke="rgba(127,180,221,0.4)" strokeWidth="1" strokeLinecap="round" />
      <line x1="63" y1="80" x2="76" y2="83" stroke="rgba(127,180,221,0.4)" strokeWidth="1" strokeLinecap="round" />
    </svg>
    <div className="home-logo-orbit home-logo-orbit--1">
      <div className="home-logo-orb" style={{ '--orb-color': '#e06469' }}>⏱</div>
    </div>
    <div className="home-logo-orbit home-logo-orbit--2">
      <div className="home-logo-orb" style={{ '--orb-color': '#5b8fb9' }}>🃏</div>
    </div>
    <div className="home-logo-orbit home-logo-orbit--3">
      <div className="home-logo-orb" style={{ '--orb-color': '#4ecdc4' }}>📁</div>
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <span className="home-brand-label">Your study space</span>
          <h1>StudyAPP</h1>
        </div>
        <button onClick={() => navigate('/auth')} className="logout-button" style={{background: 'white', color: 'black'}}>
          Login / Register
        </button>
      </header>

      <main className="home-content">
        <section className="home-hero home-hero--animated">
          <div className="home-hero-copy">
            <span className="home-pill">Study dashboard</span>
            <h2>Plan your learning, stay focused, and keep everything in one place.</h2>
            <p>
              Your central learning hub — focus sessions, revision tools, and study resources
              in a single experience.
            </p>
            <button onClick={() => navigate('/auth')} className="home-cta-btn">
              Get started →
            </button>
          </div>

          <div className="home-logo-side">
            <AnimatedLogo />
            <p className="home-logo-tagline">StudyApp</p>
          </div>
        </section>

        <section className="home-hero" style={{ gridTemplateColumns: '1fr' }}>
          <div className="home-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="home-summary-card">
              <strong>Focus</strong>
              <span>Timed sessions that support deep work</span>
            </div>
            <div className="home-summary-card">
              <strong>Review</strong>
              <span>Revision tools built for active recall</span>
            </div>
            <div className="home-summary-card">
              <strong>Organise</strong>
              <span>Materials and study resources in one flow</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
