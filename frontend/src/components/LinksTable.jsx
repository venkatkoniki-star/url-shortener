import React, { useState } from 'react';
import { truncateUrl, timeAgo, copyToClipboard } from '../utils/format.js';

// Table displaying all shortened links with search and quick actions
export default function LinksTable({
  urls,
  onRefresh,
  onOpenQr,
  onOpenAnalytics,
  onDelete,
  onShowToast
}) {
  const [search, setSearch] = useState('');

  const filtered = urls.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      item.shortCode.toLowerCase().includes(q) ||
      item.originalUrl.toLowerCase().includes(q)
    );
  });

  const handleCopy = async (shortUrl) => {
    const success = await copyToClipboard(shortUrl);
    if (success) {
      onShowToast?.('Link copied to clipboard!', 'success');
    }
  };

  const handleDelete = (shortCode) => {
    const confirmed = window.confirm(`Are you sure you want to delete short link /${shortCode}?`);
    if (confirmed) {
      onDelete(shortCode);
    }
  };

  return (
    <section className="history-section" aria-label="Link History">
      <div className="section-header">
        <h2 className="section-title">Link History</h2>

        <div className="section-controls">
          <div className="search-input-box">
            <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-field"
              placeholder="Search links..."
              autoComplete="off"
            />
          </div>

          <button
            onClick={onRefresh}
            className="btn-icon-square"
            title="Refresh List"
            aria-label="Refresh List"
          >
            <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      {urls.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
          </svg>
          <h3 className="empty-title">No Links Shortened Yet</h3>
          <p className="empty-subtitle">Paste your first destination URL in the shortener above to get started.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-title">No matching links</h3>
          <p className="empty-subtitle">No shortened links match "{search}"</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="links-table">
              <thead>
                <tr>
                  <th>Short Link</th>
                  <th>Destination URL</th>
                  <th>Clicks</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.shortCode} className="link-row">
                    <td className="col-short">
                      <div className="short-url-cell">
                        <a
                          href={item.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-short-url"
                        >
                          /{item.shortCode}
                        </a>
                        {item.isCustom && <span className="badge-mini badge-custom">Custom</span>}
                      </div>
                    </td>
                    <td className="col-original">
                      <a
                        href={item.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-original-url"
                        title={item.originalUrl}
                      >
                        {truncateUrl(item.originalUrl, 40)}
                      </a>
                    </td>
                    <td className="col-clicks">
                      <span className={`clicks-pill ${item.clicks > 0 ? 'has-clicks' : ''}`}>
                        <svg className="pill-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                        {item.clicks.toLocaleString()}
                      </span>
                    </td>
                    <td className="col-date">
                      <span className="text-muted" title={item.createdAt}>
                        {timeAgo(item.createdAt)}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="action-btn-group">
                        <button
                          onClick={() => handleCopy(item.shortUrl)}
                          className="action-icon-btn"
                          title="Copy Short Link"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                          </svg>
                        </button>

                        <button
                          onClick={() => onOpenQr(item.shortUrl, item.shortCode)}
                          className="action-icon-btn"
                          title="Show QR Code"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                          </svg>
                        </button>

                        <button
                          onClick={() => onOpenAnalytics(item.shortCode)}
                          className="action-icon-btn"
                          title="View Detailed Analytics"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDelete(item.shortCode)}
                          className="action-icon-btn action-delete"
                          title="Delete Link"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
