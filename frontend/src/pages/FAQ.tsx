import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronUp, Shield, Palette, Zap } from 'lucide-react';
import LogoIcon from '../components/LogoIcon';
import { SEO } from '../components/SEO';
import { generateFAQSchema } from '../utils/seo';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What is SkillFade?",
    answer: "SkillFade is a skill decay tracking application designed for developers, self-directed learners, career switchers, and knowledge workers. It tracks three key metrics: learning decay (how quickly skills fade without reinforcement), practice scarcity (the gap between learning and doing), and input/output imbalance (the ratio of consuming content to producing work). Unlike productivity apps with gamification, SkillFade acts as a calm mirror that reflects the truth about your learning journey without judgment or manipulation."
  },
  {
    question: "How does skill freshness tracking work?",
    answer: "Each skill you track has a freshness score from 0% to 100%. Freshness decays at a configurable rate (default 2% per day) when you don't practice. Learning events (reading, courses, videos) provide a temporary boost, but only practice events (projects, exercises, teaching) fully reset the decay. Visual indicators show fresh (70%+, green), aging (40-70%, yellow), and decayed (below 40%, red) states. You can customize decay rates per skill based on how quickly different types of knowledge fade."
  },
  {
    question: "How is SkillFade different from flashcard or spaced repetition apps?",
    answer: "Flashcard and spaced repetition apps focus on memorizing discrete facts using flashcards and spaced repetition algorithms. They excel at vocabulary, definitions, and factual recall. SkillFade tracks broader skill competency over time, not individual facts. It measures when you last practiced a skill and whether you are balancing learning with application. There are no flashcards or quizzes. Instead, SkillFade visualizes when you last practiced a skill and how that affects your retention. You might use flashcard apps to memorize syntax and SkillFade to track whether you are actually writing code."
  },
  {
    question: "How is SkillFade different from note-taking or knowledge management apps?",
    answer: "Note-taking and knowledge management apps are general-purpose tools for storing and organizing information. They store what you learn but do not track whether your skills are decaying over time. SkillFade specifically calculates freshness scores based on time since last practice and alerts you when skills need reinforcement. You could use note-taking apps for notes and SkillFade to track whether you are applying that knowledge. SkillFade adds the time dimension that note-taking apps lack."
  },
  {
    question: "What does 'a mirror, not a coach' mean?",
    answer: "SkillFade does not push you to learn more, set aggressive goals, or gamify your progress with streaks and badges. It simply shows you the truth: which skills are fresh, which are decaying, and whether you are balancing learning with practice. The design is intentionally calm - no red warning badges, no urgency notifications, no guilt-inducing messages. SkillFade respects your autonomy and trusts you to decide what to do with the information."
  },
  {
    question: "Is SkillFade free?",
    answer: "Yes, SkillFade is free to use. It is open source under the MIT license and can be self-hosted on your own server. There are no premium tiers, no ads, no data monetization, and no hidden costs. The application is designed to be sustainable as a solo project without needing to extract value from users."
  },
  {
    question: "Can I self-host SkillFade?",
    answer: "Yes. SkillFade is designed to be self-hosted. You can run it on your own server with full control over your data. The application includes Docker and Docker Compose deployment options, comprehensive deployment documentation, and supports both PostgreSQL and SQLite databases. Self-hosting gives you complete data ownership and privacy."
  },
  {
    question: "What data does SkillFade collect?",
    answer: "SkillFade only stores the data you explicitly enter: skills, learning events, and practice events. There is no third-party analytics (no Google Analytics, Mixpanel, etc.), no tracking pixels, no cookies beyond authentication, and no data sharing with external services. You can export all your data as JSON at any time and permanently delete your account and all associated data with one click."
  },
  {
    question: "Who is SkillFade for?",
    answer: "SkillFade is designed for: (1) Developers tracking programming languages, frameworks, and technical skills; (2) Self-directed learners managing multiple learning projects across different domains; (3) Career switchers building new skill sets while maintaining existing ones; (4) Knowledge workers maintaining professional competencies. It is especially useful for people who consume a lot of educational content but struggle to practice consistently."
  },
  {
    question: "How often should I log events?",
    answer: "Log events when they happen or at the end of each day. SkillFade is designed for low-friction logging with a quick-log widget that lets you record events in seconds. You do not need to log every detail - even rough estimates of duration help. The goal is sustainable tracking over months and years, not perfect record-keeping. If you miss a few days, that's fine. The freshness algorithm will naturally reflect the gap."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = generateFAQSchema(faqItems);

  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="Frequently Asked Questions"
        description="Common questions about SkillFade, the skill decay tracking application for developers and self-directed learners. Learn how freshness tracking works, how it differs from Anki or Notion, and how to get started."
        canonicalUrl="https://skillfade.app/faq"
        structuredData={faqSchema}
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

      {/* Main Content */}
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-display-md text-txt-primary mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-txt-secondary max-w-2xl mx-auto">
              Everything you need to know about SkillFade and skill decay tracking for developers and self-directed learners.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4 animate-slide-up animation-delay-200">
            {faqItems.map((item, index) => (
              <article
                key={index}
                className="card-elevated overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-100/50 transition-colors"
                >
                  <h2 className="text-lg font-semibold text-txt-primary pr-4">
                    {item.question}
                  </h2>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-txt-muted flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-txt-muted flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-txt-secondary leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center animate-slide-up animation-delay-400">
            <div className="card-elevated p-8 bg-gradient-to-br from-accent-400/5 to-secondary-400/5">
              <h2 className="text-2xl font-bold text-txt-primary mb-4">
                Ready to Track Your Skill Decay?
              </h2>
              <p className="text-txt-secondary mb-6 max-w-xl mx-auto">
                Start tracking your skills today. No credit card required. No gamification. Just honest tracking.
              </p>
              <Link
                to="/register"
                className="btn-primary inline-flex items-center gap-2 px-8 py-3"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
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

export default FAQ;
