import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LogoIcon from './LogoIcon';

/**
 * Shared sticky header for public marketing pages (blog + 404). Mirrors the
 * inline header used by the existing content pages so navigation stays
 * consistent across the public site.
 */
const PublicHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-200/80 backdrop-blur-xl border-b border-border-subtle">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center shadow-glow-accent">
              <LogoIcon className="w-5 h-5 text-surface-50" />
            </div>
            <span className="text-xl font-bold text-txt-primary">SkillFade</span>
            <span className="tag-accent text-[10px] uppercase tracking-wider">Beta</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/features" className="text-txt-secondary hover:text-txt-primary transition-colors">Features</Link>
            <Link to="/faq" className="text-txt-secondary hover:text-txt-primary transition-colors">FAQ</Link>
            <Link to="/use-cases" className="text-txt-secondary hover:text-txt-primary transition-colors">Use Cases</Link>
            <Link to="/comparisons" className="text-txt-secondary hover:text-txt-primary transition-colors">Comparisons</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn-ghost">Sign In</Link>
            <Link to="/register" className="btn-primary flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default PublicHeader;
