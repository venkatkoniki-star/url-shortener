import React from 'react';

// Metrics summary KPI cards
export default function StatsGrid({ urls }) {
  const totalLinks = urls.length;
  const totalClicks = urls.reduce((sum, item) => sum + (item.clicks || 0), 0);

  let topItem = null;
  if (urls.length > 0) {
    topItem = urls.reduce((max, item) => (item.clicks > (max ? max.clicks : -1) ? item : max), null);
  }

  return (
    <section className="stats-grid" aria-label="System Metrics">
      <div className="stat-card">
        <div className="stat-icon-wrapper">
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
          </svg>
        </div>
        <div className="stat-meta">
          <div className="stat-title">Active Links</div>
          <div className="stat-value">{totalLinks.toLocaleString()}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper">
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </div>
        <div className="stat-meta">
          <div className="stat-title">Total Clicks</div>
          <div className="stat-value">{totalClicks.toLocaleString()}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper">
          <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        </div>
        <div className="stat-meta">
          <div className="stat-title">Top Link</div>
          <div className="stat-value" title={topItem?.originalUrl || ''}>
            {topItem && topItem.clicks > 0 ? `/${topItem.shortCode} (${topItem.clicks})` : '—'}
          </div>
        </div>
      </div>
    </section>
  );
}
