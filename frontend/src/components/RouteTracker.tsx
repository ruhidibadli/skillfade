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
  '/compare/anki',
  '/compare/notion',
  '/compare/obsidian',
  '/learning-vs-practice',
  '/skill-decay-formula',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/about',
  '/contact',
]);

const RouteTracker: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.has(pathname) || pathname === '/blog' || pathname.startsWith('/blog/');
    if (!isPublic) return;
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
