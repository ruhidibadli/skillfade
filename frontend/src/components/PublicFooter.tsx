import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Zap, Shield, Palette } from 'lucide-react';
import LogoIcon from './LogoIcon';
import BuyMeACoffee from './BuyMeACoffee';

const PublicFooter: React.FC = () => {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-surface-50 border-t border-border-subtle">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center">
                <LogoIcon className="w-4 h-4 text-surface-50" />
              </div>
              <span className="font-bold text-txt-primary">SkillFade</span>
            </div>
            <p className="text-sm text-txt-muted leading-relaxed mb-4">
              A skill decay tracking application for developers and self-directed learners. A mirror, not a coach.
            </p>
            <BuyMeACoffee variant="link" />
          </div>

          <div>
            <h4 className="text-txt-primary font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-txt-muted">
              <li>
                <Link to="/features" className="hover:text-accent-400 transition-colors">Features</Link>
              </li>
              <li>
                <Link to="/use-cases" className="hover:text-accent-400 transition-colors">Use Cases</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-accent-400 transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-txt-primary font-semibold mb-4">Learn</h4>
            <ul className="space-y-2 text-sm text-txt-muted">
              <li>
                <Link to="/what-is-learning-decay" className="hover:text-accent-400 transition-colors">What is Learning Decay?</Link>
              </li>
              <li>
                <Link to="/learning-vs-practice" className="hover:text-accent-400 transition-colors">Learning vs Practice</Link>
              </li>
              <li>
                <Link to="/skill-decay-formula" className="hover:text-accent-400 transition-colors">Skill Decay Formula</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-accent-400 transition-colors">Blog</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-txt-primary font-semibold mb-4">Compare</h4>
            <ul className="space-y-2 text-sm text-txt-muted">
              <li>
                <Link to="/comparisons" className="hover:text-accent-400 transition-colors">All Comparisons</Link>
              </li>
              <li>
                <Link to="/compare/anki" className="hover:text-accent-400 transition-colors">vs Anki</Link>
              </li>
              <li>
                <Link to="/compare/notion" className="hover:text-accent-400 transition-colors">vs Notion</Link>
              </li>
              <li>
                <Link to="/compare/obsidian" className="hover:text-accent-400 transition-colors">vs Obsidian</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-txt-primary font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-txt-muted">
              <li>
                <Link to="/register" className="hover:text-accent-400 transition-colors flex items-center gap-1">
                  Get Started <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-accent-400 transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent-400 transition-colors">About</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent-400 transition-colors">Contact</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-accent-400 transition-colors">Privacy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-accent-400 transition-colors">Terms</Link>
              </li>
            </ul>
            <h4 className="text-txt-primary font-semibold mb-3 mt-6">Philosophy</h4>
            <ul className="space-y-2 text-xs text-txt-muted">
              <li className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-accent-400" />
                No Gamification
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-accent-400" />
                Privacy First
              </li>
              <li className="flex items-center gap-2">
                <Palette className="w-3 h-3 text-accent-400" />
                Calm Design
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-8 text-center text-sm text-txt-muted">
          <p>2026 SkillFade. A skill decay tracking application. A mirror, not a coach.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
