import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import ShortenForm from './components/ShortenForm.jsx';
import ResultCard from './components/ResultCard.jsx';
import StatsGrid from './components/StatsGrid.jsx';
import LinksTable from './components/LinksTable.jsx';
import QrModal from './components/QrModal.jsx';
import AnalyticsModal from './components/AnalyticsModal.jsx';
import Toast from './components/Toast.jsx';
import Footer from './components/Footer.jsx';
import { api } from './utils/api.js';

// Root application component
export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('url_shortener_theme') || 'dark';
  });
  const [urls, setUrls] = useState([]);
  const [latestItem, setLatestItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Modals state
  const [qrModal, setQrModal] = useState({ isOpen: false, shortUrl: '', shortCode: '' });
  const [analyticsModal, setAnalyticsModal] = useState({ isOpen: false, data: null });

  // Sync theme attribute on documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('url_shortener_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    addToast(`Switched to ${next} mode`, 'info');
  };

  // Toast dispatcher
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load URLs from backend
  const loadUrls = useCallback(async (isManual = false) => {
    try {
      const response = await api.getAllUrls();
      setUrls(response.data || []);
      if (isManual) {
        addToast('Link history refreshed', 'info');
      }
    } catch {
      if (isManual) {
        addToast('Could not load links from server', 'error');
      }
    }
  }, [addToast]);

  useEffect(() => {
    loadUrls();
  }, [loadUrls]);

  // Handle URL shorten submission
  const handleShorten = async ({ url, customAlias }) => {
    setIsLoading(true);
    try {
      const response = await api.shortenUrl({ url, customAlias });
      const data = response.data;
      setLatestItem(data);
      addToast('Short link created successfully!', 'success');
      await loadUrls();
    } catch (err) {
      addToast(err.message || 'Failed to shorten URL', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle URL deletion
  const handleDelete = async (shortCode) => {
    try {
      await api.deleteUrl(shortCode);
      addToast(`Short link /${shortCode} deleted`, 'info');
      await loadUrls();
      if (latestItem?.shortCode === shortCode) {
        setLatestItem(null);
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete link', 'error');
    }
  };

  // Open QR modal
  const handleOpenQr = (shortUrl, shortCode) => {
    setQrModal({ isOpen: true, shortUrl, shortCode });
  };

  // Open Analytics modal
  const handleOpenAnalytics = async (shortCode) => {
    try {
      const res = await api.getAnalytics(shortCode);
      setAnalyticsModal({ isOpen: true, data: res.data });
    } catch {
      addToast('Failed to load analytics', 'error');
    }
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setQrModal((prev) => ({ ...prev, isOpen: false }));
        setAnalyticsModal((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <main>
        <Hero />
        <ShortenForm onShorten={handleShorten} isLoading={isLoading} />
        <ResultCard
          item={latestItem}
          onOpenQr={handleOpenQr}
          onShowToast={addToast}
        />
        <StatsGrid urls={urls} />
        <LinksTable
          urls={urls}
          onRefresh={() => loadUrls(true)}
          onOpenQr={handleOpenQr}
          onOpenAnalytics={handleOpenAnalytics}
          onDelete={handleDelete}
          onShowToast={addToast}
        />
      </main>

      <Footer />

      <QrModal
        isOpen={qrModal.isOpen}
        onClose={() => setQrModal((prev) => ({ ...prev, isOpen: false }))}
        shortUrl={qrModal.shortUrl}
        shortCode={qrModal.shortCode}
        onShowToast={addToast}
      />

      <AnalyticsModal
        isOpen={analyticsModal.isOpen}
        onClose={() => setAnalyticsModal((prev) => ({ ...prev, isOpen: false }))}
        analytics={analyticsModal.data}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
