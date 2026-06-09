import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X, Minus } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { generateArticleSchema } from '../../utils/seo';
import PublicFooter from '../../components/PublicFooter';
import PublicHeader from '../../components/PublicHeader';

const Anki: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="SkillFade vs Anki — Skill Tracking vs Flashcards"
        description="How SkillFade compares to Anki for learning retention. Anki memorizes facts with spaced repetition; SkillFade tracks broader skill decay over time. See which fits your learning goal."
        canonicalUrl="https://skillfade.website/compare/anki"
        ogType="article"
        structuredData={generateArticleSchema(
          'SkillFade vs Anki — Skill Tracking vs Flashcards',
          'Detailed comparison of SkillFade and Anki: spaced repetition for facts vs skill decay tracking for competencies. When to use each, and how they complement each other.'
        )}
      />

      <PublicHeader />

      <main id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <span className="tag-accent px-4 py-2 mb-6 inline-block">Comparison</span>
            <h1 className="text-display-md text-txt-primary mb-6">
              SkillFade vs Anki
            </h1>
            <p className="text-xl text-txt-secondary max-w-3xl mx-auto">
              Anki is the gold standard for flashcard-based spaced repetition. SkillFade tracks skill decay at the competency level. They solve different problems — here&apos;s when to use each.
            </p>
          </div>

          {/* TL;DR */}
          <div className="card-elevated p-6 mb-12 animate-slide-up">
            <h2 className="text-lg font-semibold text-txt-primary mb-4">TL;DR</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left py-3 text-txt-muted font-medium">Feature</th>
                    <th className="text-left py-3 text-txt-primary font-semibold">SkillFade</th>
                    <th className="text-left py-3 text-txt-primary font-semibold">Anki</th>
                  </tr>
                </thead>
                <tbody className="text-txt-secondary">
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Tracks</td>
                    <td className="py-3">Skill competency over time</td>
                    <td className="py-3">Memorization of facts</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Unit of work</td>
                    <td className="py-3">Learning + practice events</td>
                    <td className="py-3">Flashcard reviews</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Decay model</td>
                    <td className="py-3">Time-based freshness (0-100%)</td>
                    <td className="py-3">SM-2 spaced repetition</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Best for</td>
                    <td className="py-3">Developers, designers, career switchers</td>
                    <td className="py-3">Med students, language learners</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Gamification</td>
                    <td className="py-3"><X className="w-4 h-4 text-decayed-base inline" /> None</td>
                    <td className="py-3"><Minus className="w-4 h-4 text-aging-base inline" /> Minimal</td>
                  </tr>
                  <tr>
                    <td className="py-3">Self-hostable</td>
                    <td className="py-3"><Check className="w-4 h-4 text-fresh-base inline" /> Yes</td>
                    <td className="py-3"><Check className="w-4 h-4 text-fresh-base inline" /> Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-10 animate-slide-up animation-delay-200">
            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">What Anki does</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                Anki is a flashcard application built around the SM-2 spaced repetition algorithm. You create cards with a question on one side and an answer on the other. Anki schedules reviews based on how well you remember each card, gradually increasing intervals as you build confidence.
              </p>
              <p className="text-txt-secondary leading-relaxed">
                It excels at memorizing discrete, atomic facts: vocabulary in a new language, medical terminology, anatomy, capitals, formulas, syntax cheatsheets. Millions of users rely on it for exam prep and language acquisition.
              </p>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">What SkillFade does</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                SkillFade tracks the broader concept of skill competency. You don&apos;t create flashcards — you log when you learned (read a book, took a course) and when you practiced (built a project, taught someone, did exercises). Each skill has a freshness score from 0–100% that decays over time without practice.
              </p>
              <p className="text-txt-secondary leading-relaxed">
                It answers questions Anki can&apos;t: <em className="text-txt-primary">How long has it been since I actually wrote Python code? Is my consulting framework rusty? Did I read three React books without building anything?</em>
              </p>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">When to choose Anki</h2>
              <ul className="text-txt-secondary space-y-3 list-disc pl-5">
                <li><strong className="text-txt-primary">You&apos;re memorizing facts.</strong> Vocabulary, definitions, formulas, dates, code snippets.</li>
                <li><strong className="text-txt-primary">You want optimal review timing.</strong> SM-2 is decades-tested for fact retention.</li>
                <li><strong className="text-txt-primary">You enjoy daily review sessions.</strong> Anki rewards consistent short reviews.</li>
              </ul>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">When to choose SkillFade</h2>
              <ul className="text-txt-secondary space-y-3 list-disc pl-5">
                <li><strong className="text-txt-primary">You&apos;re tracking skills, not facts.</strong> Writing code, designing layouts, public speaking, consulting.</li>
                <li><strong className="text-txt-primary">You want a portfolio view.</strong> See all 30 of your skills and which are decaying.</li>
                <li><strong className="text-txt-primary">You&apos;re a tutorial-hoarder.</strong> SkillFade exposes the input/output imbalance — learning without practicing.</li>
                <li><strong className="text-txt-primary">You hate streaks and badges.</strong> SkillFade is intentionally calm. No nagging, no gamification.</li>
              </ul>
            </section>

            <section className="card-elevated p-8 bg-gradient-to-br from-accent-400/5 to-secondary-400/5">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">Use them together</h2>
              <p className="text-txt-secondary leading-relaxed">
                Anki and SkillFade are not competitors — they live at different layers. Use Anki to memorize React hook signatures or Spanish vocabulary. Use SkillFade to track whether you&apos;re actually writing React or speaking Spanish. One handles atomic recall, the other handles broad competency.
              </p>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center animate-slide-up animation-delay-400">
            <div className="card-elevated p-8">
              <h2 className="text-2xl font-bold text-txt-primary mb-4">Track your skills, not just your flashcards</h2>
              <p className="text-txt-secondary mb-6 max-w-xl mx-auto">
                See which skills are fresh and which are decaying. Free, open source, no gamification.
              </p>
              <Link to="/register" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="mt-4">
                <Link to="/comparisons" className="text-sm text-accent-400 hover:underline">
                  See all comparisons
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default Anki;
