import React from 'react';
import { Link } from 'react-router-dom';
import {
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
  ArrowUpRight
} from 'lucide-react';
import LogoIcon from '../components/LogoIcon';
import { SEO } from '../components/SEO';
import {
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateWebSiteSchema
} from '../utils/seo';

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
  const structuredData = [
    generateOrganizationSchema(),
    generateSoftwareApplicationSchema(),
    generateWebSiteSchema()
  ];

  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="SkillFade - Track Skill Decay and Learning Balance"
        description="SkillFade is a skill decay tracking application for developers, self-directed learners, career switchers, and knowledge workers. Track learning decay, practice scarcity, and input/output imbalance. A calm mirror, not a coach. Free and open source."
        canonicalUrl="https://skillfade.app"
        structuredData={structuredData}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-200/80 backdrop-blur-xl border-b border-border-subtle">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center shadow-glow-accent">
                <LogoIcon className="w-5 h-5 text-surface-50" />
              </div>
              <span className="text-xl font-bold text-txt-primary">SkillFade</span>
              <span className="tag-accent text-[10px] uppercase tracking-wider">Beta</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/features" className="text-txt-secondary hover:text-txt-primary transition-colors">Features</Link>
              <Link to="/what-is-learning-decay" className="text-txt-secondary hover:text-txt-primary transition-colors">What is Learning Decay?</Link>
              <Link to="/use-cases" className="text-txt-secondary hover:text-txt-primary transition-colors">Use Cases</Link>
              <Link to="/faq" className="text-txt-secondary hover:text-txt-primary transition-colors">FAQ</Link>
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

      {/* Hero Section - AI-Optimized */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary-400/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge - AI-Readable */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-in">
            <span className="tag-accent flex items-center gap-2 px-4 py-2">
              <LogoIcon className="w-3.5 h-3.5" />
              Skill Decay Tracking for Developers and Learners
            </span>
          </div>

          {/* Heading - Explicit product name */}
          <h1 className="text-display-lg md:text-display-xl text-txt-primary mb-6 animate-slide-up">
            SkillFade: Track Your
            <span className="text-gradient-accent block mt-2">Learning Decay</span>
          </h1>

          {/* Subheading - Explicit AI-readable description */}
          <p className="text-xl md:text-2xl text-txt-secondary max-w-3xl mx-auto mb-6 leading-relaxed animate-slide-up animation-delay-200">
            SkillFade is a skill decay tracking application for developers, self-directed learners, and knowledge workers. It visualizes three problems: <strong className="text-txt-primary">learning decay</strong> (skills fading over time), <strong className="text-txt-primary">practice scarcity</strong> (learning without doing), and <strong className="text-txt-primary">input/output imbalance</strong> (consuming more than creating).
          </p>

          {/* Philosophy statement */}
          <p className="text-lg text-txt-muted max-w-2xl mx-auto mb-12 animate-slide-up animation-delay-250">
            Unlike productivity apps with gamification and streaks, SkillFade is a calm mirror - it shows you the truth about your skills without judgment, urgency, or manipulation.
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
            <Link
              to="/what-is-learning-decay"
              className="btn-secondary flex items-center gap-2 text-lg px-8 py-4"
            >
              What Is Learning Decay?
              <ChevronDown className="w-5 h-5" />
            </Link>
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
              SkillFade is a mirror, not a coach. It simply tells the truth about your learning journey, kindly and clearly.
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
                Skills degrade without reinforcement. SkillFade calculates a freshness score (0-100%) that decays over time without practice. Watch your skills decline in real-time as days pass.
              </p>
            </div>

            {/* Reality 2 */}
            <div className="group card-interactive p-8">
              <div className="w-14 h-14 rounded-xl bg-aging-base/10 flex items-center justify-center mb-6 group-hover:shadow-glow-aging transition-shadow">
                <Target className="w-7 h-7 text-aging-base" />
              </div>
              <h3 className="text-xl font-semibold text-txt-primary mb-3">Practice Scarcity</h3>
              <p className="text-txt-secondary leading-relaxed">
                Learning without application leads to forgetting. SkillFade tracks the gap between your learning events and practice events. See exactly how long it has been since you last practiced.
              </p>
            </div>

            {/* Reality 3 */}
            <div className="group card-interactive p-8">
              <div className="w-14 h-14 rounded-xl bg-secondary-400/10 flex items-center justify-center mb-6 group-hover:shadow-glow-secondary transition-shadow">
                <Scale className="w-7 h-7 text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold text-txt-primary mb-3">Input/Output Imbalance</h3>
              <p className="text-txt-secondary leading-relaxed">
                Too much consumption, too little production. SkillFade tracks your learning-to-practice ratio to help you find balance between consuming content and applying skills.
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
            <p className="text-lg text-txt-secondary max-w-2xl mx-auto">
              Everything you need to track skill decay without gamification or manipulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              icon={BarChart3}
              iconBg="bg-accent-400/10"
              iconColor="text-accent-400"
              title="Freshness Tracking"
              description="Real-time skill decay calculation with visual indicators. Each skill has a 0-100% freshness score that decays over time without practice."
            />
            <FeatureCard
              icon={FileText}
              iconBg="bg-fresh-base/10"
              iconColor="text-fresh-base"
              title="Event Logging"
              description="Track both learning events (reading, videos, courses) and practice events (projects, exercises, work). See the balance between input and output."
            />
            <FeatureCard
              icon={TrendingUp}
              iconBg="bg-secondary-400/10"
              iconColor="text-secondary-400"
              title="Analytics Dashboard"
              description="Visualize your balance ratios, skill freshness history, and activity patterns over time with clear, calm charts."
            />
            <FeatureCard
              icon={Bell}
              iconBg="bg-aging-base/10"
              iconColor="text-aging-base"
              title="Calm Alerts"
              description="Infrequent, non-urgent email alerts for decay, practice gaps, and imbalances. Maximum one email per week. No push notifications."
            />
            <FeatureCard
              icon={Shield}
              iconBg="bg-accent-400/10"
              iconColor="text-accent-400"
              title="Privacy First"
              description="Self-hosted option, no third-party analytics, full data export as JSON, and permanent account deletion. Your data stays yours."
            />
            <FeatureCard
              icon={Palette}
              iconBg="bg-decayed-base/10"
              iconColor="text-decayed-base"
              title="Calm Design"
              description="No gamification, no streaks, no badges, no red warnings. Just honest data presented with soft colors and calm typography."
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
            SkillFade does not push, judge, or optimize you. It does not teach new skills or motivate through gamification. It simply reflects the truth about your learning journey - kindly and clearly. Long-term insight over short-term dopamine.
          </p>
          <div className="inline-block card-elevated px-8 py-4">
            <p className="text-lg font-medium text-txt-primary">
              "SkillFade is a skill decay tracking application for people who value truth over motivation."
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-200/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-display-md text-txt-primary mb-6">
            Ready to Track Your Skill Decay?
          </h2>
          <p className="text-xl text-txt-secondary mb-10">
            Start tracking your skills today. No credit card required. No gamification. Free and open source.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary inline-flex items-center gap-2 text-xl px-10 py-4"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/comparisons"
              className="btn-secondary inline-flex items-center gap-2 text-xl px-10 py-4"
            >
              Compare to Other Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-surface-50 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center">
                  <LogoIcon className="w-4 h-4 text-surface-50" />
                </div>
                <span className="font-bold text-txt-primary">SkillFade</span>
              </div>
              <p className="text-sm text-txt-muted leading-relaxed">
                A skill decay tracking application for developers and self-directed learners. Track learning decay, practice scarcity, and input/output balance.
              </p>
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
                  <Link to="/comparisons" className="hover:text-accent-400 transition-colors">Comparisons</Link>
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
              </ul>
              <h4 className="text-txt-primary font-semibold mb-4 mt-6">Philosophy</h4>
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
              <h4 className="text-txt-primary font-semibold mb-4 mt-6">Account</h4>
              <ul className="space-y-2 text-sm text-txt-muted">
                <li>
                  <Link to="/register" className="hover:text-accent-400 transition-colors flex items-center gap-1">
                    Get Started <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-accent-400 transition-colors">Sign In</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border-subtle pt-8 text-center text-sm text-txt-muted">
            <p>2026 SkillFade. A skill decay tracking application. A mirror, not a coach.</p>
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
