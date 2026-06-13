import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';
import {
  LayoutDashboard,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  MessageSquare,
  ChevronDown,
  Coffee,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import QuickLogWidget from './QuickLogWidget';
import OnboardingWizard from './OnboardingWizard';
import LogoIcon from './LogoIcon';
import BuyMeACoffee, { coffeeUrl } from './BuyMeACoffee';
import PageTitle from './PageTitle';

const APP_PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/skills': 'Skills',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/support': 'Support',
};

const Layout: React.FC = () => {
  const { logout, isAdmin } = useAuth();
  const { isPro } = usePlan();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = APP_PAGE_TITLES['/' + (location.pathname.split('/')[1] || '')] ?? null;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const primaryNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/skills', label: 'Skills', icon: Layers },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const accountNav = [
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/support', label: 'Support', icon: MessageSquare },
    ...(isPro ? [] : [{ path: '/pricing', label: 'Upgrade to PRO', icon: Sparkles }]),
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close menus when the route changes.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Escape closes whichever menu is open and returns focus to its trigger.
  useEffect(() => {
    if (!mobileOpen && !menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (mobileOpen) {
        setMobileOpen(false);
        mobileTriggerRef.current?.focus();
      }
      if (menuOpen) {
        setMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, menuOpen]);

  // Outside click closes the desktop account dropdown.
  useEffect(() => {
    if (!menuOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [menuOpen]);

  // Lock body scroll behind the open mobile panel.
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-200/80 backdrop-blur-xl border-b border-border-subtle">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] btn-secondary"
        >
          Skip to content
        </a>
        <nav aria-label="Primary" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center shadow-glow-accent group-hover:shadow-glow-accent-lg transition-shadow">
                <LogoIcon className="w-5 h-5 text-surface-50" />
              </div>
              <span className="font-display text-xl font-semibold tracking-tight text-txt-primary">
                SkillFade
              </span>
              <span className="tag-accent text-[10px] uppercase tracking-wider">Beta</span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-1">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                      transition-all duration-200
                      ${active
                        ? 'text-accent-400 bg-accent-400/10'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="w-px h-6 bg-border-subtle mx-2" aria-hidden="true" />

              {/* Account dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  ref={menuTriggerRef}
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-controls="account-menu"
                  className="btn-ghost flex items-center gap-2"
                >
                  Account
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                {menuOpen && (
                  <div
                    id="account-menu"
                    className="absolute right-0 top-full mt-2 w-56 card-elevated shadow-card-hover py-2 animate-scale-in origin-top-right"
                  >
                    {accountNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="menu-item mx-2"
                        >
                          <Icon className="w-4 h-4" aria-hidden="true" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <div className="my-2 border-t border-border-subtle" />
                    <a
                      href={coffeeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="menu-item mx-2"
                    >
                      <Coffee className="w-4 h-4" aria-hidden="true" />
                      Buy me a coffee
                    </a>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="menu-item mx-2 w-[calc(100%-1rem)] text-left hover:text-decayed-base"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu trigger */}
            <button
              ref={mobileTriggerRef}
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="app-mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-txt-secondary hover:text-txt-primary hover:bg-surface-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile panel */}
        {mobileOpen && (
          <div
            id="app-mobile-menu"
            className="md:hidden menu-panel absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain animate-slide-down"
          >
            <nav aria-label="Mobile" className="px-4 pb-6 pt-2 space-y-1">
              <span className="label-caps block px-3 pt-2 pb-1">Navigate</span>
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={active ? 'page' : undefined}
                    className={`menu-item ${active ? 'menu-item-active' : ''}`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
              <span className="label-caps block px-3 pt-4 pb-1">Account</span>
              {accountNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={active ? 'page' : undefined}
                    className={`menu-item ${active ? 'menu-item-active' : ''}`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="my-3 border-t border-border-subtle" />
              <a
                href={coffeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="menu-item"
              >
                <Coffee className="w-5 h-5" aria-hidden="true" />
                Buy me a coffee
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="menu-item w-full text-left hover:text-decayed-base"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {pageTitle && <PageTitle title={pageTitle} />}

      {/* Main Content */}
      <main id="main" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-surface-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-txt-muted">
              2026 <span className="text-gradient-accent font-semibold">SkillFade</span>. A mirror, not a coach.
            </p>
            <div className="flex items-center gap-6 text-xs text-txt-muted">
              <Link to="/about" className="hover:text-accent-400 transition-colors">About</Link>
              <span className="w-1 h-1 rounded-full bg-border-DEFAULT" />
              <Link to="/contact" className="hover:text-accent-400 transition-colors">Contact</Link>
              <span className="w-1 h-1 rounded-full bg-border-DEFAULT" />
              <Link to="/privacy" className="hover:text-accent-400 transition-colors">Privacy</Link>
              <span className="w-1 h-1 rounded-full bg-border-DEFAULT" />
              <BuyMeACoffee variant="link" className="text-xs" />
            </div>
          </div>
        </div>
      </footer>

      {/* Quick Log Widget */}
      <QuickLogWidget />

      {/* Onboarding Wizard */}
      <OnboardingWizard />
    </div>
  );
};

export default Layout;
