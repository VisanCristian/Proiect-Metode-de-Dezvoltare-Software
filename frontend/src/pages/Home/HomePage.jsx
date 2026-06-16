import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

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
        <section className="home-hero">
          <div className="home-hero-copy">
            <span className="home-pill">Study dashboard</span>
            <h2>Plan your learning, stay focused, and keep everything in one place.</h2>
            <p>
              This homepage is designed to grow into your central learning hub, bringing together
              focus sessions, revision tools, and study resources in a single experience.
            </p>
          </div>

          <div className="home-summary">
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
