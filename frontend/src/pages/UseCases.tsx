import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, BookOpen, Briefcase, GraduationCap, Shield, Palette, Zap, CheckCircle } from 'lucide-react';
import LogoIcon from '../components/LogoIcon';
import { SEO } from '../components/SEO';

interface UseCase {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  persona: string;
  painPoints: string[];
  solution: string;
  example: string;
}

const useCases: UseCase[] = [
  {
    icon: Code,
    iconBg: 'bg-accent-400/10',
    iconColor: 'text-accent-400',
    title: 'SkillFade for Developers',
    persona: 'Software developers, programmers, engineers, and technical professionals',
    painPoints: [
      'Learning new languages and frameworks but forgetting them without projects',
      'Tutorial hell - completing courses but not building anything',
      'Losing proficiency in technologies you do not use daily',
      'Difficulty tracking which skills need reinforcement across a large tech stack'
    ],
    solution: 'Track freshness of each technology you learn. Log learning events when you study documentation or take courses, and practice events when you write code. See which skills are decaying and need a project or exercise.',
    example: 'Track React, TypeScript, Python, and AWS. See that your Python skills are at 35% freshness because you have not coded in it for 45 days. Start a small Python project to reset decay.'
  },
  {
    icon: BookOpen,
    iconBg: 'bg-secondary-400/10',
    iconColor: 'text-secondary-400',
    title: 'SkillFade for Self-Directed Learners',
    persona: 'Autodidacts, polymath learners, hobbyists, and lifelong learners',
    painPoints: [
      'Managing multiple learning projects across different domains',
      'Forgetting skills from past learning phases when focusing on new topics',
      'Consuming educational content (books, courses, podcasts) without applying it',
      'Losing track of which skills need maintenance vs. active development'
    ],
    solution: 'Create a complete picture of your learning portfolio. Track skills across domains (languages, music, design, etc.) and see which are fresh vs. decaying. Use balance ratio to ensure you are practicing, not just consuming.',
    example: 'Track Spanish, piano, and data visualization. Notice your Spanish is at 25% because you stopped practicing after your last course. Schedule weekly conversation practice to prevent further decay.'
  },
  {
    icon: Briefcase,
    iconBg: 'bg-fresh-base/10',
    iconColor: 'text-fresh-base',
    title: 'SkillFade for Career Switchers',
    persona: 'Career changers, bootcamp graduates, and professionals transitioning to new fields',
    painPoints: [
      'Building new skill sets while maintaining existing professional competencies',
      'Knowing which new skills are actually sticking vs. superficial understanding',
      'Balancing learning time between job search, portfolio building, and skill development',
      'Feeling overwhelmed by the amount of new material to learn'
    ],
    solution: 'Focus on skills that matter for your target role. Track both old and new skills to ensure you are not losing valuable competencies while building new ones. Use freshness to prioritize what to practice before interviews.',
    example: 'Transitioning from marketing to data science. Track SQL, Python, statistics, and visualization tools. See which skills are interview-ready (fresh) and which need more practice before applications.'
  },
  {
    icon: GraduationCap,
    iconBg: 'bg-aging-base/10',
    iconColor: 'text-aging-base',
    title: 'SkillFade for Knowledge Workers',
    persona: 'Consultants, analysts, researchers, and professionals with diverse skill requirements',
    painPoints: [
      'Maintaining professional competencies across multiple tools and methodologies',
      'Forgetting software or processes you only use quarterly or annually',
      'Difficulty demonstrating current proficiency in skills you learned years ago',
      'No systematic way to identify which skills need refreshers'
    ],
    solution: 'Track professional tools and methodologies with appropriate decay rates. Set longer decay for foundational skills, shorter for rapidly-changing tools. Get alerts before important skills decay below useful levels.',
    example: 'Track Excel advanced features, Tableau, SQL, and presentation skills. Set different decay rates: slow decay for Excel fundamentals, faster decay for Tableau which updates frequently.'
  }
];

const UseCases: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="Use Cases - Who Is SkillFade For?"
        description="SkillFade is a skill decay tracking application for developers, self-directed learners, career switchers, and knowledge workers. Learn how different users track learning decay and practice scarcity."
        canonicalUrl="https://skillfade.app/use-cases"
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
              <Link to="/what-is-learning-decay" className="text-txt-secondary hover:text-txt-primary transition-colors">What is Learning Decay?</Link>
              <Link to="/faq" className="text-txt-secondary hover:text-txt-primary transition-colors">FAQ</Link>
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

      {/* Main Content */}
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="tag-accent px-4 py-2">Use Cases</span>
            </div>
            <h1 className="text-display-md text-txt-primary mb-6">
              Who Is SkillFade For?
            </h1>
            <p className="text-xl text-txt-secondary max-w-3xl mx-auto">
              SkillFade is a skill decay tracking application designed for anyone who learns continuously and wants to prevent forgetting. Here is how different users benefit from tracking learning decay, practice scarcity, and input/output imbalance.
            </p>
          </div>

          {/* Use Case Cards */}
          <div className="space-y-12 animate-slide-up animation-delay-200">
            {useCases.map((useCase, index) => (
              <article key={index} className="card-elevated overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-border-subtle">
                  <div className="flex items-start gap-5">
                    <div className={`flex-shrink-0 w-16 h-16 ${useCase.iconBg} rounded-xl flex items-center justify-center`}>
                      <useCase.icon className={`w-8 h-8 ${useCase.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-txt-primary mb-2">
                        {useCase.title}
                      </h2>
                      <p className="text-txt-secondary">
                        {useCase.persona}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 grid md:grid-cols-2 gap-8">
                  {/* Pain Points */}
                  <div>
                    <h3 className="text-lg font-semibold text-txt-primary mb-4">
                      Common Pain Points
                    </h3>
                    <ul className="space-y-3">
                      {useCase.painPoints.map((point, idx) => (
                        <li key={idx} className="flex gap-3 text-txt-secondary">
                          <span className="text-decayed-base mt-1">-</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Solution */}
                  <div>
                    <h3 className="text-lg font-semibold text-txt-primary mb-4">
                      How SkillFade Helps
                    </h3>
                    <p className="text-txt-secondary leading-relaxed mb-6">
                      {useCase.solution}
                    </p>
                    <div className="bg-surface-100/50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-txt-primary mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-fresh-base" />
                        Example
                      </h4>
                      <p className="text-txt-secondary text-sm">
                        {useCase.example}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Summary Section */}
          <section className="mt-16 animate-slide-up animation-delay-400">
            <div className="card-elevated p-8 bg-gradient-to-br from-accent-400/5 to-secondary-400/5">
              <h2 className="text-2xl font-bold text-txt-primary mb-6 text-center">
                Common Across All Users
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-accent-400/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-accent-400" />
                  </div>
                  <h3 className="font-semibold text-txt-primary mb-2">No Gamification</h3>
                  <p className="text-txt-secondary text-sm">
                    No streaks, badges, or points. Just honest data about your skills.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-secondary-400/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-secondary-400" />
                  </div>
                  <h3 className="font-semibold text-txt-primary mb-2">Privacy First</h3>
                  <p className="text-txt-secondary text-sm">
                    Self-hosted option, no tracking, full data export and deletion.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-fresh-base/10 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-fresh-base" />
                  </div>
                  <h3 className="font-semibold text-txt-primary mb-2">Calm Design</h3>
                  <p className="text-txt-secondary text-sm">
                    No urgency, no guilt. A mirror that reflects truth without judgment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-txt-primary mb-4">
              Start Tracking Your Skills Today
            </h2>
            <p className="text-txt-secondary mb-6 max-w-xl mx-auto">
              No credit card required. No gamification. Just honest skill decay tracking for developers and self-directed learners.
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
                to="/comparisons"
                className="btn-secondary inline-flex items-center gap-2 px-8 py-3"
              >
                Compare to Other Tools
              </Link>
            </div>
          </div>
        </div>
      </main>

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

export default UseCases;
