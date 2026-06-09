import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

const SUGGESTIONS = [
  { to: '/', label: 'Home', desc: 'What SkillFade is and how it works' },
  { to: '/blog', label: 'Blog', desc: 'Essays on skill decay and retention' },
  { to: '/features', label: 'Features', desc: 'Freshness scores, decay alerts, analytics' },
  { to: '/what-is-learning-decay', label: 'What Is Learning Decay?', desc: 'The forgetting curve, explained' },
];

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      <SEO
        title="Page Not Found"
        description="The page you are looking for could not be found. Explore SkillFade — a calm skill decay tracker for developers and self-directed learners."
        noIndex
      />
      <PublicHeader />

      <main id="main" className="flex-1 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-400/10 mb-8">
            <Compass className="w-8 h-8 text-accent-400" />
          </div>
          <p className="label-caps text-txt-muted mb-3">Error 404</p>
          <h1 className="text-display-md text-txt-primary mb-5">This page has faded</h1>
          <p className="text-lg text-txt-secondary mb-12 max-w-xl mx-auto">
            The page you were looking for doesn&apos;t exist or may have moved. Here are a few
            good places to pick up the trail.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {SUGGESTIONS.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="card-interactive p-5 group flex items-start justify-between gap-3"
              >
                <span>
                  <span className="block font-semibold text-txt-primary mb-1">{s.label}</span>
                  <span className="block text-sm text-txt-muted">{s.desc}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-txt-muted group-hover:text-accent-400 transition-colors flex-shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default NotFound;
