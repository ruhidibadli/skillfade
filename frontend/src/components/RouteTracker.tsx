import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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

const RouteTracker: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!PUBLIC_ROUTES.has(pathname)) return;
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
};

export default RouteTracker;
