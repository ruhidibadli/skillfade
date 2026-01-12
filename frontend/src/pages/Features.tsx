import React from 'react';
import { Link } from 'react-router-dom';

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SkillFade
                </div>
                <div className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full font-medium">
                  Beta
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 animate-fade-in">
            Features
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-slide-up animation-delay-200">
            Everything you need to track skill decay, practice habits, and maintain balance between learning and doing.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Core Tracking
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Freshness Score</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Each skill has a 0-100% freshness score that decays over time without practice. Visual indicators show fresh (green), aging (yellow), and decayed (red) states.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <li>• 2% daily decay rate (customizable)</li>
                <li>• Learning boost from recent study</li>
                <li>• Real-time calculation</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Learning Events</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Log your learning activities with type, duration, and notes. Track reading, videos, courses, articles, documentation, and tutorials.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <li>• Multiple learning types</li>
                <li>• Duration tracking</li>
                <li>• Notes for context</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🛠️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Practice Events</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Track hands-on practice: exercises, projects, work tasks, teaching others, writing, and building. Practice resets decay.
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <li>• Resets freshness decay</li>
                <li>• Multiple practice types</li>
                <li>• Project tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Analytics & Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Activity Calendar</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monthly calendar view showing learning (blue) and practice (green) events. Click any date to see detailed event information including skill, type, duration, and notes.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Balance Ratio</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track your learning-to-practice ratio over time. See if you're consuming too much without producing, and find the right balance for retention.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Freshness History</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Line charts showing how each skill's freshness has changed over the past 90 days. See the impact of your learning and practice over time.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Skills Distribution</h3>
              <p className="text-gray-600 dark:text-gray-400">
                See all your skills organized by freshness ranges. Quickly identify which skills need attention and which are well-maintained.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Productivity Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Productivity Tools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Quick Log Widget</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Floating button for rapid event logging. Log learning or practice events in seconds without navigating away from your current view.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Event Templates</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Save common event configurations as templates. Quickly log recurring activities with predefined type, duration, and notes.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Custom Decay Rates</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Set per-skill decay rates with presets for different skill types. Technical skills decay faster than foundational knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Calm Alerts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Decay Alerts</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get notified when a skill drops below 40% freshness. Maximum once per skill per 14 days—never spammy.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Practice Gap Alerts</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Alerts for skills with learning events but no practice. A gentle reminder that theory needs application.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Imbalance Alerts</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monthly notification if your learning-to-practice ratio stays below 0.2 for two consecutive months.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              All alerts are email-only, plain text, and include one-click unsubscribe. Maximum 1 email per week. We believe in calm, not urgency.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Privacy & Control
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Self-Hosted</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Run on your own server with full control</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
              <div className="text-3xl mb-3">📥</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Data Export</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Export all your data as JSON anytime</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
              <div className="text-3xl mb-3">🗑️</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Permanent Delete</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Delete your account and all data forever</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
              <div className="text-3xl mb-3">🚫</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">No Tracking</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">No third-party analytics or tracking pixels</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Start Tracking Today
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
            No credit card required. No gamification. Just honest tracking.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white dark:text-gray-200 font-bold text-lg mb-4">SkillFade</h3>
              <p className="text-sm leading-relaxed">
                Track learning decay, practice scarcity, and input/output balance.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Philosophy</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="cursor-default">No Gamification</span></li>
                <li><span className="cursor-default">Privacy First</span></li>
                <li><span className="cursor-default">Calm Design</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="cursor-default">Self-Hosted</span></li>
                <li><span className="cursor-default">Open Source</span></li>
                <li><span className="cursor-default">MIT License</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2026 SkillFade. A mirror, not a coach.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
