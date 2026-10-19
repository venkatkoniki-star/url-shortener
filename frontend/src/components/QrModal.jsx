import React, { useRef } from 'react';
import { generateQrSvgString } from '../utils/qrcode.js';
import { downloadSvgAsPng } from '../utils/format.js';

// Modal displaying QR code with high-resolution PNG export
export default function QrModal({ isOpen, onClose, shortUrl, shortCode, onShowToast }) {
  const containerRef = useRef(null);

  if (!isOpen) return null;

  const svgString = generateQrSvgString(shortUrl, {
    size: 240,
    darkColor: '#0c0d10',
    lightColor: '#ffffff'
  });

  const handleDownload = () => {
    downloadSvgAsPng(svgString, `qr-${shortCode}.png`, 600);
    onShowToast?.('QR code downloaded!', 'success');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">QR Code</h3>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close dialog">&times;</button>
        </div>
        <div className="modal-body qr-modal-body">
          <div
            ref={containerRef}
            className="qr-frame"
            dangerouslySetInnerHTML={{ __html: svgString }}
          />
          <div className="qr-code-label">/{shortCode}</div>
          <div className="qr-url-label">{shortUrl}</div>
          <button
            onClick={handleDownload}
            className="btn-primary"
            style={{ width: 'auto', padding: '0.65rem 1.5rem' }}
          >
            <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
