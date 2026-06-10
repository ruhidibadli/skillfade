import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import LogoIcon from './LogoIcon';
import BuyMeACoffee from './BuyMeACoffee';

/**
 * The single shared header for every public marketing page. A curated
 * four-link nav (everything else lives in PublicFooter), quiet text links
 * with an ink-rule underline on the active page, and a slide-down
 * disclosure menu on mobile.
 */
const navLinks = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/what-is-learning-decay', label: 'Learning Decay' },
  { to: '/faq', label: 'FAQ' },
  { to: '/blog', label: 'Blog' },
];

const PublicHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isActive = (to: string) =>
    to === '/blog' ? location.pathname.startsWith('/blog') : location.pathname === to;

  // Close the menu when the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Escape closes the menu and returns focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Lock body scroll behind the open mobile panel.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-200/80 backdrop-blur-xl border-b border-border-subtle">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] btn-secondary"
      >
        Skip to content
      </a>
      <nav aria-label="Main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center shadow-glow-accent group-hover:shadow-glow-accent-lg transition-shadow">
              <LogoIcon className="w-5 h-5 text-surface-50" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight text-txt-primary">
              SkillFade
            </span>
            <span className="tag-accent hidden sm:inline-flex text-[10px] uppercase tracking-wider">Beta</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={`nav-link-public ${active ? 'nav-link-public-active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions — the CTA stays visible at every width */}
          <div className="flex items-center gap-2 sm:gap-3">
            <BuyMeACoffee variant="button" className="hidden lg:inline-flex" />
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-primary flex items-center gap-2 px-3.5 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base"
            >
              Get Started <ArrowRight className="w-4 h-4 hidden sm:block" aria-hidden="true" />
            </Link>

            {/* Mobile menu trigger */}
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="public-mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-txt-secondary hover:text-txt-primary hover:bg-surface-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              {open ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile panel */}
      {open && (
        <div
          id="public-mobile-menu"
          className="md:hidden menu-panel absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain animate-slide-down"
        >
          <nav aria-label="Mobile" className="px-4 pb-6 pt-2 space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={`menu-item ${active ? 'menu-item-active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="my-3 border-t border-border-subtle" />
            <Link to="/login" className="menu-item">
              Sign In
            </Link>
            <div className="pt-3 px-3">
              <BuyMeACoffee variant="link" className="text-sm" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
