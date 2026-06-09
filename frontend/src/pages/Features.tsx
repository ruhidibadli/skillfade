import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { generateSoftwareApplicationSchema } from '../utils/seo';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="Features — Skill Freshness, Decay Alerts, Analytics"
        description="See every SkillFade feature: skill freshness scores, custom decay rates, practice gap alerts, balance ratio analytics, freshness history charts, and event templates. No gamification, no judgment."
        canonicalUrl="https://skillfade.website/features"
        structuredData={generateSoftwareApplicationSchema()}
      />
      {/* Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section id="main" className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-display-lg text-txt-primary mb-6 animate-fade-in">
            Features
          </h1>
          <p className="text-xl text-txt-secondary max-w-2xl mx-auto animate-slide-up animation-delay-200">
            Everything you need to track skill decay, practice habits, and maintain balance between learning and doing.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-display-md text-center text-txt-primary mb-12">
            Core Tracking
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-interactive p-8">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Freshness Score</h3>
              <p className="text-txt-secondary mb-4">
                Each skill has a 0-100% freshness score that decays over time without practice. Visual indicators show fresh (green), aging (yellow), and decayed (red) states.
              </p>
              <ul className="text-sm text-txt-muted space-y-1">
                <li>• 2% daily decay rate (customizable)</li>
                <li>• Learning boost from recent study</li>
                <li>• Real-time calculation</li>
              </ul>
            </div>

            <div className="card-interactive p-8">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Learning Events</h3>
              <p className="text-txt-secondary mb-4">
                Log your learning activities with type, duration, and notes. Track reading, videos, courses, articles, documentation, and tutorials.
              </p>
              <ul className="text-sm text-txt-muted space-y-1">
                <li>• Multiple learning types</li>
                <li>• Duration tracking</li>
                <li>• Notes for context</li>
              </ul>
            </div>

            <div className="card-interactive p-8">
              <div className="text-5xl mb-4">🛠️</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Practice Events</h3>
              <p className="text-txt-secondary mb-4">
                Track hands-on practice: exercises, projects, work tasks, teaching others, writing, and building. Practice resets decay.
              </p>
              <ul className="text-sm text-txt-muted space-y-1">
                <li>• Resets freshness decay</li>
                <li>• Multiple practice types</li>
                <li>• Project tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-200/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-display-md text-center text-txt-primary mb-12">
            Analytics & Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-elevated p-8">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Activity Calendar</h3>
              <p className="text-txt-secondary">
                Monthly calendar view showing learning (blue) and practice (green) events. Click any date to see detailed event information including skill, type, duration, and notes.
              </p>
            </div>

            <div className="card-elevated p-8">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Balance Ratio</h3>
              <p className="text-txt-secondary">
                Track your learning-to-practice ratio over time. See if you're consuming too much without producing, and find the right balance for retention.
              </p>
            </div>

            <div className="card-elevated p-8">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Freshness History</h3>
              <p className="text-txt-secondary">
                Line charts showing how each skill's freshness has changed over the past 90 days. See the impact of your learning and practice over time.
              </p>
            </div>

            <div className="card-elevated p-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Skills Distribution</h3>
              <p className="text-txt-secondary">
                See all your skills organized by freshness ranges. Quickly identify which skills need attention and which are well-maintained.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Productivity Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-display-md text-center text-txt-primary mb-12">
            Productivity Tools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-interactive p-8">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Quick Log Widget</h3>
              <p className="text-txt-secondary">
                Floating button for rapid event logging. Log learning or practice events in seconds without navigating away from your current view.
              </p>
            </div>

            <div className="card-interactive p-8">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Event Templates</h3>
              <p className="text-txt-secondary">
                Save common event configurations as templates. Quickly log recurring activities with predefined type, duration, and notes.
              </p>
            </div>

            <div className="card-interactive p-8">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Custom Decay Rates</h3>
              <p className="text-txt-secondary">
                Set per-skill decay rates with presets for different skill types. Technical skills decay faster than foundational knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-200/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-display-md text-center text-txt-primary mb-12">
            Calm Alerts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-elevated p-8">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Decay Alerts</h3>
              <p className="text-txt-secondary">
                Get notified when a skill drops below 40% freshness. Maximum once per skill per 14 days—never spammy.
              </p>
            </div>

            <div className="card-elevated p-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Practice Gap Alerts</h3>
              <p className="text-txt-secondary">
                Alerts for skills with learning events but no practice. A gentle reminder that theory needs application.
              </p>
            </div>

            <div className="card-elevated p-8">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-txt-primary mb-3">Imbalance Alerts</h3>
              <p className="text-txt-secondary">
                Monthly notification if your learning-to-practice ratio stays below 0.2 for two consecutive months.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-txt-secondary max-w-2xl mx-auto">
              All alerts are email-only, plain text, and include one-click unsubscribe. Maximum 1 email per week. We believe in calm, not urgency.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-display-md text-center text-txt-primary mb-12">
            Privacy & Control
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-interactive p-6 text-center">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold text-txt-primary mb-2">Self-Hosted</h3>
              <p className="text-sm text-txt-secondary">Run on your own server with full control</p>
            </div>

            <div className="card-interactive p-6 text-center">
              <div className="text-3xl mb-3">📥</div>
              <h3 className="font-bold text-txt-primary mb-2">Data Export</h3>
              <p className="text-sm text-txt-secondary">Export all your data as JSON anytime</p>
            </div>

            <div className="card-interactive p-6 text-center">
              <div className="text-3xl mb-3">🗑️</div>
              <h3 className="font-bold text-txt-primary mb-2">Permanent Delete</h3>
              <p className="text-sm text-txt-secondary">Delete your account and all data forever</p>
            </div>

            <div className="card-interactive p-6 text-center">
              <div className="text-3xl mb-3">🚫</div>
              <h3 className="font-bold text-txt-primary mb-2">No Tracking</h3>
              <p className="text-sm text-txt-secondary">No third-party analytics or tracking pixels</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-200/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-display-md text-txt-primary mb-6">
            Start Tracking Today
          </h2>
          <p className="text-xl text-txt-secondary mb-10">
            No credit card required. No gamification. Just honest tracking.
          </p>
          <Link
            to="/register"
            className="btn-primary inline-flex items-center gap-2 text-xl px-10 py-4"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Features;
