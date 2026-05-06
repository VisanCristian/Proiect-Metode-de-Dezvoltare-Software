import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ badge, title, description, route, accentClass, tag }) => {
  return (
    <article className={`feature-card ${accentClass}`}>
      <div className="feature-card-top">
        <span className="feature-card-badge">{badge}</span>
        <span className="feature-card-tag">{tag}</span>
      </div>

      <div className="feature-card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="feature-card-footer">
        <span className="feature-card-route">{route}</span>
        <Link to={route} className="feature-card-link">
          Open module
        </Link>
      </div>
    </article>
  );
};

export default FeatureCard;
