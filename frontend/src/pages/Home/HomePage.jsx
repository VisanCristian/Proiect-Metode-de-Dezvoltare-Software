import React from 'react';
import { useAuth } from '../../hooks/Auth/useAuth';
import FeatureCard from '../../fragments/Home/FeatureCard';
import ActivityReport from '../../fragments/Home/ActivityReport';
import './home.css';

const modules = [
  {
    badge: 'PM',
    title: 'Pomodoro',
    description:
      'Build a better study rhythm with guided focus sessions, clear timing, and consistent daily progress.',
    route: '/pomodoro',
    accentClass: 'feature-card--pomodoro',
    tag: 'Focus sessions',
  },
  {
    badge: 'FC',
    title: 'FlashCards',
    description:
      'Strengthen memory with active recall, repeat key topics, and turn revision into a structured routine.',
    route: '/flashcards',
    accentClass: 'feature-card--flashcards',
    tag: 'Smart revision',
  },
  {
    badge: 'FT',
    title: 'FileTree',
    description:
      'Keep notes, documents, and study materials organised so every module connects back to your resources.',
    route: '/filetree',
    accentClass: 'feature-card--filetree',
    tag: 'Resources',
  },
];

const HomePage = () => {
  const { logout } = useAuth();

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <span className="home-brand-label">Your study space</span>
          <h1>StudyAPP</h1>
        </div>
        <button onClick={logout} className="logout-button">
          Logout
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

        <section className="home-modules">
          <div className="home-section-heading">
            <div>
              <span className="home-section-label">Study tools</span>
              <h3>Your learning toolkit</h3>
            </div>
            <p>Explore the core areas that will support focus, revision, and study organisation as the platform grows.</p>
          </div>

          <div className="feature-grid">
            {modules.map((module) => (
              <FeatureCard key={module.route} {...module} />
            ))}
          </div>
        </section>

        <section className="home-activity">
          <ActivityReport mode="personal" />
        </section>
      </main>
    </div>
  );
};

export default HomePage;
