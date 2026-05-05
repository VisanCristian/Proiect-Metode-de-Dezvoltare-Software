import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

const ModulePlaceholder = ({ title, description }) => {
  return (
    <div className="module-placeholder-page">
      <div className="module-placeholder-card">
        <span className="module-placeholder-label">Integration placeholder</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link to="/home" className="module-placeholder-link">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
