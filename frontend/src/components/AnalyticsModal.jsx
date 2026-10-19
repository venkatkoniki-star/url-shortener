import React from 'react';
import { formatFullDate, timeAgo } from '../utils/format.js';

// Modal displaying click counts, metadata, and visitor activity logs
export default function AnalyticsModal({ isOpen, onClose, analytics }) {
  if (!isOpen || !analytics) return null;

  const { shortCode, shortUrl, originalUrl, clicks, createdAt, lastAccessedAt, isCustom, recentClicks } = analytics;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Link Analytics</h3>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close dialog">&times;</button>
        </div>
        <div className="modal-body">
          <div className="analytics-stats-row">
            <div className="analytics-stat-box">
              <div className="analytics-stat-num">{clicks?.toLocaleString() || 0}</div>
              <div className="analytics-stat-lbl">Total Clicks</div>
            </div>
            <div className="analytics-stat-box">
              <div className="analytics-stat-num" style={{ fontSize: '1rem' }}>
                {formatFullDate(createdAt)}
              </div>
              <div className="analytics-stat-lbl">Created Date</div>
            </div>
            <div className="analytics-stat-box">
              <div className="analytics-stat-num" style={{ fontSize: '1rem' }}>
                {lastAccessedAt ? timeAgo(lastAccessedAt) : 'Never'}
              </div>
              <div className="analytics-stat-lbl">Last Active</div>
            </div>
          </div>

          <div className="analytics-info-list">
            <div className="info-item">
              <span className="info-label">Short Code:</span>
              <span className="info-val">/{shortCode}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Short URL:</span>
              <span className="info-val">{shortUrl}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Destination URL:</span>
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="info-val"
                style={{ color: 'var(--primary)' }}
              >
                {originalUrl}
              </a>
            </div>
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className={`badge ${isCustom ? 'badge-primary' : 'badge-neutral'}`}>
                {isCustom ? 'Custom Alias' : 'Base62 Generated'}
              </span>
            </div>
          </div>

          <h4 className="activity-table-title">Recent Visitor Activity</h4>
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Referrer</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {!recentClicks || recentClicks.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-state-cell">
                      No visit logs recorded yet. Visit the link to see activity!
                    </td>
                  </tr>
                ) : (
                  recentClicks.map((click, i) => (
                    <tr key={i}>
                      <td>
                        <span className="activity-time">{formatFullDate(click.timestamp)}</span>
                      </td>
                      <td>
                        <span className="referrer-pill">{click.referrer || 'Direct'}</span>
                      </td>
                      <td>
                        <span
                          className="user-agent-label"
                          title={click.userAgent || 'Direct'}
                        >
                          {click.userAgent
                            ? click.userAgent.substring(0, 32) + '...'
                            : 'Direct'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
