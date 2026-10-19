import React, { useState } from 'react';

// URL Shortening input form with alias toggle and quick actions
export default function ShortenForm({ onShorten, isLoading, domainPrefix = 'http://localhost:5000/' }) {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showAlias, setShowAlias] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onShorten({ url: url.trim(), customAlias: showAlias ? customAlias.trim() : '' });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch {
      // Clipboard permissions denied
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  return (
    <section className="shortener-card" aria-label="URL Shortener Form">
      <form onSubmit={handleSubmit}>
        <div className="input-group-wrapper">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
          </svg>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
            placeholder="Paste a long destination URL (e.g. https://example.com/long-page)..."
            required
            autoComplete="off"
            spellCheck="false"
          />
          <div className="input-quick-actions">
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-icon-clear"
                aria-label="Clear URL"
                title="Clear input"
              >
                &times;
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              className="btn-chip"
              title="Paste from clipboard"
            >
              <svg className="btn-chip-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
              <span>Paste</span>
            </button>
          </div>
        </div>

        <div className="alias-toggle-wrapper">
          <label className="alias-toggle-label">
            <span className="switch">
              <input
                type="checkbox"
                checked={showAlias}
                onChange={(e) => setShowAlias(e.target.checked)}
              />
              <span className="slider"></span>
            </span>
            <span>Customize short code alias</span>
          </label>
        </div>

        {showAlias && (
          <div className="alias-input-section">
            <div className="alias-input-wrapper">
              <span className="alias-domain-prefix">{domainPrefix}</span>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="alias-input"
                placeholder="custom-slug"
                maxLength={30}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            <p className="alias-hint">Letters, numbers, hyphens, and underscores (3–30 characters).</p>
          </div>
        )}

        <div className="cta-btn-wrapper">
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Shortening URL...</span>
              </>
            ) : (
              <>
                <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                </svg>
                <span>Shorten URL</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
