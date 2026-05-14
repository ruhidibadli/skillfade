import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cookie } from 'lucide-react';

const CONSENT_KEY = 'analytics_consent';

const PUBLIC_ROUTES = new Set<string>([
  '/',
  '/home',
  '/features',
  '/faq',
  '/what-is-learning-decay',
  '/use-cases',
  '/comparisons',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/privacy',
]);

const CookieBanner: React.FC = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!PUBLIC_ROUTES.has(pathname)) {
      setVisible(false);
      return;
    }
    try {
      const choice = localStorage.getItem(CONSENT_KEY);
      setVisible(choice !== 'granted' && choice !== 'denied');
    } catch {
      setVisible(false);
    }
  }, [pathname]);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'granted');
    } catch {}
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'denied');
    } catch {}
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[100] animate-slide-up"
    >
      <div className="card-elevated p-5 shadow-2xl">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-accent-400/10 flex-shrink-0">
            <Cookie className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-txt-primary mb-1">A small note about cookies</h3>
            <p className="text-xs text-txt-secondary leading-relaxed">
              We use Google Analytics to count page views and see which countries our visitors come from. Nothing about your activity inside the app is tracked.{' '}
              <Link to="/privacy" className="text-accent-400 hover:underline">
                Learn more
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 ml-12">
          <button onClick={accept} className="btn-primary text-sm py-2 px-4">
            Accept
          </button>
          <button onClick={decline} className="btn-ghost text-sm">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
