import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, TrendingDown, Brain, RefreshCw, Shield, Palette, Zap } from 'lucide-react';
import LogoIcon from '../components/LogoIcon';
import { SEO } from '../components/SEO';
import { generateArticleSchema } from '../utils/seo';

const WhatIsLearningDecay: React.FC = () => {
  const articleSchema = generateArticleSchema(
    "What Is Learning Decay? Understanding the Forgetting Curve for Skills",
    "Learning decay is the gradual loss of knowledge and skills over time without reinforcement. Learn about the forgetting curve, why skills fade, and how to track and prevent skill decay.",
    "2024-01-01"
  );

  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="What Is Learning Decay? Understanding the Forgetting Curve"
        description="Learning decay is the gradual loss of knowledge and skills over time without reinforcement. Learn about the forgetting curve, why skills fade, and how to track and prevent skill decay with SkillFade."
        canonicalUrl="https://skillfade.app/what-is-learning-decay"
        ogType="article"
        structuredData={articleSchema}
      />

      {/* Header */}
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

      {/* Main Article */}
      <article className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <header className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="tag-accent px-4 py-2">Educational Guide</span>
            </div>
            <h1 className="text-display-md text-txt-primary mb-6">
              What Is Learning Decay?
            </h1>
            <p className="text-xl text-txt-secondary max-w-2xl mx-auto">
              Understanding why skills fade over time and how to track the forgetting curve.
            </p>
          </header>

          {/* Definition Section */}
          <section className="mb-16 animate-slide-up">
            <h2 className="text-2xl font-bold text-txt-primary mb-6">
              Definition: Learning Decay
            </h2>
            <div className="prose-custom">
              <p className="text-lg text-txt-secondary leading-relaxed mb-6">
                <strong className="text-txt-primary">Learning decay</strong> (also called skill decay, knowledge attrition, or skill fade) is the gradual loss of learned knowledge and abilities over time when they are not reinforced through practice or review. This phenomenon is grounded in the <strong className="text-txt-primary">forgetting curve</strong>, first described by psychologist Hermann Ebbinghaus in 1885.
              </p>
              <p className="text-txt-secondary leading-relaxed mb-6">
                For developers, self-directed learners, and knowledge workers, learning decay is a significant challenge. You might complete a course on a new programming language, read documentation for a framework, or study for a certification - but without regular practice, that knowledge fades. Research suggests that without reinforcement, people forget approximately 50% of new information within an hour and up to 70% within 24 hours.
              </p>
              <p className="text-txt-secondary leading-relaxed">
                SkillFade is a skill decay tracking application that makes this invisible process visible, helping you understand which skills are fading and when they need reinforcement.
              </p>
            </div>
          </section>

          {/* Three Problems Section */}
          <section className="mb-16 animate-slide-up animation-delay-200">
            <h2 className="text-2xl font-bold text-txt-primary mb-8">
              Three Problems Learning Decay Creates
            </h2>

            <div className="space-y-6">
              <div className="card-elevated p-6 flex gap-5">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-accent-400/10 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-accent-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-txt-primary mb-3">
                    1. Time-Based Decay
                  </h3>
                  <p className="text-txt-secondary leading-relaxed">
                    Skills degrade predictably over time without use. A programming language you learned six months ago feels foreign. A framework you studied but never used becomes hazy. This is not a personal failure - it is how human memory works. The longer you go without practicing a skill, the more it decays. SkillFade tracks this decay with a freshness score from 0% to 100%.
                  </p>
                </div>
              </div>

              <div className="card-elevated p-6 flex gap-5">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-aging-base/10 flex items-center justify-center">
                  <TrendingDown className="w-7 h-7 text-aging-base" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-txt-primary mb-3">
                    2. Practice Scarcity
                  </h3>
                  <p className="text-txt-secondary leading-relaxed">
                    Many learners consume far more than they produce. They watch tutorials, read articles, and take courses - but rarely build projects or solve real problems. Learning (input) without practice (output) accelerates decay because knowledge is not consolidated through application. SkillFade tracks the gap between your learning events and practice events.
                  </p>
                </div>
              </div>

              <div className="card-elevated p-6 flex gap-5">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-secondary-400/10 flex items-center justify-center">
                  <Brain className="w-7 h-7 text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-txt-primary mb-3">
                    3. Input/Output Imbalance
                  </h3>
                  <p className="text-txt-secondary leading-relaxed">
                    The ratio of learning time to practice time matters. Research on skill acquisition shows that active recall and application strengthen memory far more than passive consumption. A 1:1 ratio of learning to practice is a healthy starting point; many learners operate at 10:1 or worse. SkillFade calculates your balance ratio so you can see if you are consuming more than creating.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How SkillFade Helps Section */}
          <section className="mb-16 animate-slide-up animation-delay-300">
            <h2 className="text-2xl font-bold text-txt-primary mb-6">
              How to Track and Prevent Learning Decay
            </h2>
            <div className="prose-custom">
              <p className="text-txt-secondary leading-relaxed mb-6">
                The first step to preventing learning decay is making it visible. SkillFade is a skill decay tracking application that calculates a <strong className="text-txt-primary">freshness score</strong> (0-100%) for each skill based on when you last practiced it. Skills decay over time (default: 2% per day), and the freshness score reflects this decline.
              </p>
              <p className="text-txt-secondary leading-relaxed mb-6">
                By visualizing decay, you can make informed decisions about which skills need reinforcement. SkillFade also tracks your <strong className="text-txt-primary">input/output ratio</strong> - the balance between learning events (reading, videos, courses) and practice events (projects, exercises, teaching). This helps identify when you are consuming too much without producing.
              </p>
              <p className="text-txt-secondary leading-relaxed">
                Unlike productivity apps with gamification and streaks, SkillFade acts as a calm mirror. It does not judge, push, or create urgency. It simply shows you the truth about your learning journey and lets you decide how to respond.
              </p>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="mb-16 animate-slide-up animation-delay-400">
            <h2 className="text-2xl font-bold text-txt-primary mb-8">
              How SkillFade Freshness Tracking Works
            </h2>
            <div className="card-elevated p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-fresh-base/20 flex items-center justify-center text-fresh-base font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-txt-primary mb-1">Add your skills</h4>
                    <p className="text-txt-secondary text-sm">Create skills you want to track (e.g., Python, React, Machine Learning)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-fresh-base/20 flex items-center justify-center text-fresh-base font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-txt-primary mb-1">Log learning and practice events</h4>
                    <p className="text-txt-secondary text-sm">Record when you study (learning) and when you apply skills (practice)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-fresh-base/20 flex items-center justify-center text-fresh-base font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-txt-primary mb-1">Watch freshness decay over time</h4>
                    <p className="text-txt-secondary text-sm">Skills decay at 2% per day by default (customizable per skill)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-fresh-base/20 flex items-center justify-center text-fresh-base font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-txt-primary mb-1">Practice to reset decay</h4>
                    <p className="text-txt-secondary text-sm">Practice events reset freshness to 100%; learning events provide temporary boosts</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Summary Box */}
          <section className="animate-slide-up animation-delay-500">
            <div className="card-elevated p-8 bg-gradient-to-br from-accent-400/5 to-secondary-400/5">
              <h2 className="text-xl font-bold text-txt-primary mb-6 flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-accent-400" />
                Summary: Learning Decay
              </h2>
              <ul className="space-y-4 text-txt-secondary">
                <li className="flex gap-3">
                  <span className="text-accent-400 font-bold">What it is:</span>
                  <span>The gradual loss of skills and knowledge over time without reinforcement.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-400 font-bold">Why it matters:</span>
                  <span>Skills you learn but do not practice will fade, wasting your investment of time and effort.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-400 font-bold">How to track it:</span>
                  <span>Use freshness scores that decay over time and reset with practice.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent-400 font-bold">How to prevent it:</span>
                  <span>Balance learning (input) with practice (output) and track which skills need reinforcement.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-txt-primary mb-4">
              Start Tracking Your Skill Decay
            </h2>
            <p className="text-txt-secondary mb-6 max-w-xl mx-auto">
              SkillFade is free, open source, and designed for developers and self-directed learners. No gamification, no manipulation, just honest tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary inline-flex items-center gap-2 px-8 py-3"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/features"
                className="btn-secondary inline-flex items-center gap-2 px-8 py-3"
              >
                View All Features
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-surface-50 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-txt-primary font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-txt-muted">
                <li><Link to="/features" className="hover:text-txt-primary transition-colors">Features</Link></li>
                <li><Link to="/use-cases" className="hover:text-txt-primary transition-colors">Use Cases</Link></li>
                <li><Link to="/comparisons" className="hover:text-txt-primary transition-colors">Comparisons</Link></li>
                <li><Link to="/faq" className="hover:text-txt-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-txt-primary font-semibold mb-4">Learn</h4>
              <ul className="space-y-2 text-sm text-txt-muted">
                <li><Link to="/what-is-learning-decay" className="hover:text-txt-primary transition-colors">What is Learning Decay?</Link></li>
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

export default WhatIsLearningDecay;
