import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Layers,
  FolderOpen,
  BookOpen,
  Wrench,
  FileText,
  LogOut,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import LogoIcon from './LogoIcon';

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { path: '/admin/skills', label: 'Skills', icon: Layers },
    { path: '/admin/learning-events', label: 'Learning', icon: BookOpen },
    { path: '/admin/practice-events', label: 'Practice', icon: Wrench },
    { path: '/admin/templates', label: 'Templates', icon: FileText },
    { path: '/admin/tickets', label: 'Tickets', icon: MessageSquare },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-200/80 backdrop-blur-xl border-b border-border-subtle">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link to="/admin" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-glow-accent group-hover:shadow-glow-accent-lg transition-shadow">
                  <LogoIcon className="w-5 h-5 text-surface-50" />
                </div>
                <span className="text-xl font-bold text-txt-primary">
                  SkillFade
                </span>
                <span className="tag-decayed text-[10px] uppercase tracking-wider">Admin</span>
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
                      transition-all duration-200
                      ${active
                        ? 'text-decayed-base bg-decayed-base/10'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-300'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-decayed-base' : ''}`} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                );
              })}

              <div className="w-px h-6 bg-border-subtle mx-2" />

              <Link
                to="/dashboard"
                className="btn-ghost flex items-center gap-2 text-txt-muted hover:text-accent-400"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Back to App</span>
              </Link>

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
              <span className="text-decayed-base font-semibold">Admin Panel</span> - Manage all data
            </p>
            <div className="flex items-center gap-6 text-xs text-txt-muted">
              <span>Full CRUD Access</span>
              <span className="w-1 h-1 rounded-full bg-border-DEFAULT" />
              <span>Handle with Care</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
