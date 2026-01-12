import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import QuickLogWidget from './QuickLogWidget';
import LogoIcon from './LogoIcon';

const Layout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/skills', label: 'Skills', icon: Layers },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-200/80 backdrop-blur-xl border-b border-border-subtle">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center shadow-glow-accent group-hover:shadow-glow-accent-lg transition-shadow">
                <LogoIcon className="w-5 h-5 text-surface-50" />
              </div>
              <span className="text-xl font-bold text-txt-primary">
                SkillFade
              </span>
              <span className="tag-accent text-[10px] uppercase tracking-wider">Beta</span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                      transition-all duration-200
                      ${active
                        ? 'text-accent-400 bg-accent-400/10'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-300'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-accent-400' : ''}`} />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}

              <div className="w-px h-6 bg-border-subtle mx-2" />

              <button
                onClick={handleLogout}
                className="btn-ghost flex items-center gap-2 text-txt-muted hover:text-decayed-base"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
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
              <span>Privacy First</span>
              <span className="w-1 h-1 rounded-full bg-border-DEFAULT" />
              <span>No Gamification</span>
              <span className="w-1 h-1 rounded-full bg-border-DEFAULT" />
              <span>Self-Hosted</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Quick Log Widget */}
      <QuickLogWidget />
    </div>
  );
};

export default Layout;
