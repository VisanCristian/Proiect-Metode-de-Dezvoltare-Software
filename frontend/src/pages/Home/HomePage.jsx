import React from 'react';
import { useAuth } from '../../hooks/Auth/useAuth';
import './home.css';

const HomePage = () => {
  const { logout } = useAuth();

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>StudyAPP</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>
      <main className="home-content">
        <p>........something........</p>
      </main>
    </div>
  );
};

export default HomePage;
