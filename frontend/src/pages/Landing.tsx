import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  Clock,
  Target,
  Scale,
  BarChart3,
  FileText,
  TrendingUp,
  Bell,
  Shield,
  Palette,
  Zap,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';

// Freshness Indicator Component
const FreshnessIndicator: React.FC<{ level: 'fresh' | 'aging' | 'decayed'; size?: 'sm' | 'md' | 'lg' }> = ({
  level,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const styles = {
    fresh: 'bg-fresh-base shadow-glow-fresh',
    aging: 'bg-aging-base shadow-glow-aging',
    decayed: 'bg-decayed-base shadow-glow-decayed',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full ${styles[level]} animate-glow-pulse`} />
  );
};

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-200/80 backdrop-blur-xl border-b border-border-subtle">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center shadow-glow-accent">
                <Sparkles className="w-5 h-5 text-surface-50" />
              </div>
              <span className="text-xl font-bold text-txt-primary">SkillFade</span>
              <span className="tag-accent text-[10px] uppercase tracking-wider">Beta</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="btn-ghost"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary-400/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-in">
            <span className="tag-accent flex items-center gap-2 px-4 py-2">
              <Sparkles className="w-3.5 h-3.5" />
              Track - Practice - Remember
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-display-lg md:text-display-xl text-txt-primary mb-6 animate-slide-up">
            Your Skills Are
            <span className="text-gradient-accent block mt-2">Fading</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-txt-secondary max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up animation-delay-200">
            A calm mirror that exposes three realities: learning decay, practice scarcity, and the input/output imbalance.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 animate-slide-up animation-delay-300">
            <Link
              to="/register"
              className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
            >
              Start Tracking Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="btn-secondary flex items-center gap-2 text-lg px-8 py-4"
            >
              Learn More
              <ChevronDown className="w-5 h-5" />
            </a>
          </div>

          {/* Stats Cards - Asymmetric Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fade-in animation-delay-400">
            <div className="md:col-span-4 card-interactive p-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <FreshnessIndicator level="fresh" />
                <span className="text-txt-secondary text-sm">Fresh Skills</span>
              </div>
              <p className="text-display-sm text-fresh-base">70%+</p>
              <p className="text-txt-muted text-sm mt-2">Recently practiced</p>
            </div>

            <div className="md:col-span-5 card-interactive p-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <FreshnessIndicator level="aging" />
                <span className="text-txt-secondary text-sm">Aging Skills</span>
              </div>
              <p className="text-display-sm text-aging-base">40-70%</p>
              <p className="text-txt-muted text-sm mt-2">Need attention soon</p>
            </div>

            <div className="md:col-span-3 card-interactive p-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <FreshnessIndicator level="decayed" />
                <span className="text-txt-secondary text-sm">Decayed</span>
              </div>
              <p className="text-display-sm text-decayed-base">&lt;40%</p>
              <p className="text-txt-muted text-sm mt-2">Forgotten</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Realities Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-display-md text-txt-primary mb-4">
              Three Realities Exposed
            </h2>
            <p className="text-xl text-txt-secondary max-w-2xl mx-auto">
              This product is a mirror, not a coach. It simply tells the truth, kindly and clearly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Reality 1 */}
            <div className="group card-interactive p-8">
              <div className="w-14 h-14 rounded-xl bg-accent-400/10 flex items-center justify-center mb-6 group-hover:shadow-glow-accent transition-shadow">
                <Clock className="w-7 h-7 text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold text-txt-primary mb-3">Learning Decay</h3>
              <p className="text-txt-secondary leading-relaxed">
                Skills degrade without reinforcement. Watch your freshness score decline in real-time as days pass without practice.
              </p>
            </div>

            {/* Reality 2 */}
            <div className="group card-interactive p-8">
              <div className="w-14 h-14 rounded-xl bg-aging-base/10 flex items-center justify-center mb-6 group-hover:shadow-glow-aging transition-shadow">
                <Target className="w-7 h-7 text-aging-base" />
              </div>
              <h3 className="text-xl font-semibold text-txt-primary mb-3">Practice Scarcity</h3>
              <p className="text-txt-secondary leading-relaxed">
                Learning without application leads to forgetting. See exactly how long it's been since you last practiced each skill.
              </p>
            </div>

            {/* Reality 3 */}
            <div className="group card-interactive p-8">
              <div className="w-14 h-14 rounded-xl bg-secondary-400/10 flex items-center justify-center mb-6 group-hover:shadow-glow-secondary transition-shadow">
                <Scale className="w-7 h-7 text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold text-txt-primary mb-3">Input/Output Imbalance</h3>
              <p className="text-txt-secondary leading-relaxed">
                Too much consumption, too little production. Track your learning-to-practice ratio and find balance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-display-md text-txt-primary mb-4">
              What You Get
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              icon={BarChart3}
              iconBg="bg-accent-400/10"
              iconColor="text-accent-400"
              title="Freshness Tracking"
              description="Real-time skill decay calculation with visual indicators (0-100% freshness)."
            />
            <FeatureCard
              icon={FileText}
              iconBg="bg-fresh-base/10"
              iconColor="text-fresh-base"
              title="Event Logging"
              description="Track both learning events (reading, courses) and practice events (projects, exercises)."
            />
            <FeatureCard
              icon={TrendingUp}
              iconBg="bg-secondary-400/10"
              iconColor="text-secondary-400"
              title="Analytics Dashboard"
              description="Visualize your balance ratios and skill distribution over time with clear charts."
            />
            <FeatureCard
              icon={Bell}
              iconBg="bg-aging-base/10"
              iconColor="text-aging-base"
              title="Calm Alerts"
              description="Infrequent, non-urgent email alerts for decay, practice gaps, and imbalances."
            />
            <FeatureCard
              icon={Shield}
              iconBg="bg-accent-400/10"
              iconColor="text-accent-400"
              title="Privacy First"
              description="Self-hosted, no third-party analytics, full data export, and permanent deletion."
            />
            <FeatureCard
              icon={Palette}
              iconBg="bg-decayed-base/10"
              iconColor="text-decayed-base"
              title="Calm Design"
              description="No gamification, no red warnings, no judgment. Just honest data and soft colors."
            />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-400/5 to-secondary-400/5" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-display-md text-txt-primary mb-6">
            A Mirror, Not a Coach
          </h2>
          <p className="text-xl text-txt-secondary leading-relaxed mb-10">
            SkillFade does not push, judge, or optimize you. It does not teach new skills or motivate through gamification. It simply reflects the truth about your learning journey—kindly and clearly.
          </p>
          <div className="inline-block card-elevated px-8 py-4">
            <p className="text-lg font-medium text-txt-primary">
              "Long-term insight over short-term dopamine."
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-200/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-display-md text-txt-primary mb-6">
            Ready to See the Truth?
          </h2>
          <p className="text-xl text-txt-secondary mb-10">
            Start tracking your skills today. No credit card required.
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

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-surface-50 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-surface-50" />
                </div>
                <span className="font-bold text-txt-primary">SkillFade</span>
              </div>
              <p className="text-sm text-txt-muted leading-relaxed">
                Track learning decay, practice scarcity, and input/output balance.
              </p>
            </div>
            <div>
              <h4 className="text-txt-primary font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-txt-muted">
                <li>
                  <Link to="/register" className="hover:text-accent-400 transition-colors flex items-center gap-1">
                    Get Started <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-accent-400 transition-colors">Features</a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-accent-400 transition-colors">Sign In</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-txt-primary font-semibold mb-4">Philosophy</h4>
              <ul className="space-y-2 text-sm text-txt-muted">
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
            <div>
              <h4 className="text-txt-primary font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-txt-muted">
                <li>Self-Hosted</li>
                <li>Open Source</li>
                <li>MIT License</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border-subtle pt-8 text-center text-sm text-txt-muted">
            <p>2026 SkillFade. A mirror, not a coach.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}> = ({ icon: Icon, iconBg, iconColor, title, description }) => (
  <div className="flex items-start gap-4 card-interactive p-6">
    <div className={`flex-shrink-0 w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-txt-primary mb-2">{title}</h3>
      <p className="text-txt-secondary text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

export default Landing;
