import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      {/* Animated background blobs */}
      <div className="auth-page__bg">
        <div className="auth-page__blob auth-page__blob--1" />
        <div className="auth-page__blob auth-page__blob--2" />
        <div className="auth-page__blob auth-page__blob--3" />
      </div>

      <div className="notfound-card">
        <div className="notfound-code">
          <span className="notfound-code__digit notfound-code__digit--1">4</span>
          <span className="notfound-code__zero">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="36" stroke="url(#nf-grad)" strokeWidth="4" strokeDasharray="8 4" />
              <circle cx="40" cy="40" r="18" fill="url(#nf-grad)" opacity="0.2" />
              <defs>
                <linearGradient id="nf-grad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="notfound-code__digit notfound-code__digit--2">4</span>
        </div>

        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-subtitle">
          Looks like you wandered into uncharted territory. The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="notfound-actions">
          <button
            id="go-home-btn"
            className="btn btn--primary"
            onClick={() => navigate('/dashboard')}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Dashboard
          </button>
          <button
            id="go-back-btn"
            className="btn btn--ghost"
            onClick={() => navigate(-1)}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
