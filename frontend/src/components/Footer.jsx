import React from 'react';

// Application footer
export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>Shortly &mdash; Fast URL shortener with Base62 encoding and live analytics.</p>
        <div className="footer-links">
          <a href="/health" target="_blank" rel="noopener noreferrer" className="footer-link">
            Health Status
          </a>
          <span>&bull;</span>
          <a href="/api/urls" target="_blank" rel="noopener noreferrer" className="footer-link">
            API Endpoints
          </a>
        </div>
      </div>
    </footer>
  );
}
