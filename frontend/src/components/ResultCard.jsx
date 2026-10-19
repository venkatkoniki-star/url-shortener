import React, { useState } from 'react';
import { copyToClipboard } from '../utils/format.js';
import { generateQrSvgString } from '../utils/qrcode.js';

// Success card showing generated short link, actions, and mini QR
export default function ResultCard({ item, onOpenQr, onShowToast }) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(item.shortUrl);
    if (success) {
      setCopied(true);
      onShowToast?.('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      onShowToast?.('Failed to copy link.', 'warning');
    }
  };

  const miniQrSvg = generateQrSvgString(item.shortUrl, {
    size: 110,
    darkColor: '#0c0d10',
    lightColor: '#ffffff'
  });

  const shareText = encodeURIComponent(`Check out this link: ${item.shortUrl}`);
  const encodedUrl = encodeURIComponent(item.shortUrl);

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Shortened Link',
        text: 'Check out this link',
        url: item.shortUrl
      }).catch(() => {});
    }
  };

  return (
    <section className="result-card" aria-live="polite">
      <div className="result-card-header">
        <div className="result-tag">
          <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span>Short Link Ready</span>
        </div>
      </div>

      <div className="result-layout">
        <div className="result-details">
          <a
            href={item.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="result-short-url-link"
          >
            {item.shortUrl}
          </a>
          <div className="result-original-url" title={item.originalUrl}>
            {item.originalUrl}
          </div>

          <div className="result-actions-row">
            <button
              onClick={handleCopy}
              className={`btn-secondary ${copied ? 'btn-success' : ''}`}
            >
              {copied ? (
                <>
                  <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  </svg>
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={item.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
              </svg>
              <span>Visit Link</span>
            </a>

            <button
              onClick={() => onOpenQr(item.shortUrl, item.shortCode)}
              className="btn-secondary"
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>QR Code</span>
            </button>
          </div>

          <div className="social-share-bar">
            <span className="share-label">Share:</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-icon-btn"
              title="Share on Twitter/X"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-icon-btn"
              title="Share on WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12.031 2c-5.518 0-9.99 4.473-9.99 9.99 0 1.764.46 3.486 1.332 5.006L2 22l5.13-1.346a9.96 9.96 0 004.901 1.282c5.518 0 9.99-4.472 9.99-9.99 0-5.517-4.472-9.946-9.99-9.946zm5.836 14.123c-.244.686-1.42 1.309-1.956 1.39-.516.078-1.182.11-3.805-.98-3.344-1.39-5.496-4.81-5.663-5.032-.164-.222-1.353-1.802-1.353-3.437 0-1.636.855-2.44 1.16-2.772.304-.332.664-.416.885-.416.222 0 .444.002.637.012.204.01.478-.078.747.57.278.665.942 2.305 1.025 2.472.083.166.139.36.028.581-.11.222-.166.36-.332.554-.167.194-.35.432-.5.58-.166.167-.34.348-.146.68.193.333.864 1.423 1.854 2.305 1.274 1.135 2.348 1.488 2.68 1.654.333.166.527.139.72-.083.195-.222.83-1.025 1.052-1.385.222-.36.444-.304.747-.194.305.11 1.93.91 2.262 1.077.333.166.554.25.637.388.084.138.084.803-.16 1.489z"/>
              </svg>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-icon-btn"
              title="Share on LinkedIn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={handleNativeShare}
                className="share-icon-btn"
                title="More Sharing Options"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div
          className="result-qr-box"
          dangerouslySetInnerHTML={{ __html: miniQrSvg }}
        />
      </div>
    </section>
  );
}
