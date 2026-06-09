import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Hammer, Scale } from 'lucide-react';
import { SEO } from '../components/SEO';
import { generateArticleSchema } from '../utils/seo';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';

const LearningVsPractice: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="Learning vs Practice — The Input/Output Balance for Retention"
        description="Why watching tutorials doesn't make you a developer. The input/output balance separates people who consume knowledge from people who own it. Learn the ratio that actually moves the needle."
        canonicalUrl="https://skillfade.website/learning-vs-practice"
        ogType="article"
        structuredData={generateArticleSchema(
          'Learning vs Practice — The Input/Output Balance for Retention',
          'A deep dive on the input/output balance: why learning without practice fails, what ratio works, and how to measure your own theory-to-practice ratio.'
        )}
      />

      <PublicHeader />

      <main id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-400/10 mb-5">
              <Scale className="w-7 h-7 text-accent-400" />
            </div>
            <h1 className="text-display-md text-txt-primary mb-6">
              Learning vs Practice
            </h1>
            <p className="text-xl text-txt-secondary max-w-3xl mx-auto">
              The single ratio that separates people who consume knowledge from people who own it. Why watching tutorials feels productive but builds nothing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-slide-up">
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent-400/10">
                  <BookOpen className="w-5 h-5 text-accent-400" />
                </div>
                <h2 className="text-xl font-semibold text-txt-primary">Learning (input)</h2>
              </div>
              <p className="text-txt-secondary text-sm leading-relaxed mb-3">
                Anything that puts knowledge <em>into</em> your head:
              </p>
              <ul className="text-txt-secondary text-sm space-y-1.5 list-disc pl-5">
                <li>Reading a book or article</li>
                <li>Watching a video or course</li>
                <li>Reading documentation</li>
                <li>Listening to a podcast or talk</li>
                <li>Following a tutorial</li>
              </ul>
            </div>
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-secondary-400/10">
                  <Hammer className="w-5 h-5 text-secondary-400" />
                </div>
                <h2 className="text-xl font-semibold text-txt-primary">Practice (output)</h2>
              </div>
              <p className="text-txt-secondary text-sm leading-relaxed mb-3">
                Anything that pulls knowledge <em>out</em> of your head:
              </p>
              <ul className="text-txt-secondary text-sm space-y-1.5 list-disc pl-5">
                <li>Building a project</li>
                <li>Doing an exercise from scratch</li>
                <li>Teaching or explaining to someone</li>
                <li>Writing a blog post or doc</li>
                <li>Using the skill at work</li>
              </ul>
            </div>
          </div>

          <div className="space-y-10 animate-slide-up animation-delay-200">
            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">Why the ratio matters</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                Most people overestimate how much they learn from passive consumption. Reading a chapter on Kubernetes feels like learning. Watching a 4-hour React tutorial feels like learning. But the moment you sit down to actually <em>do</em> the thing, you discover the gap between recognition and recall — between &quot;I&apos;ve seen this&quot; and &quot;I can do this.&quot;
              </p>
              <p className="text-txt-secondary leading-relaxed">
                That gap is the input/output imbalance. The fix is not more input. The fix is forcing your brain to retrieve and apply what it already absorbed.
              </p>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">The balance ratio</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                SkillFade computes a simple ratio for each skill:
              </p>
              <div className="bg-surface-300 rounded-lg p-4 mb-4 font-mono text-sm text-txt-primary">
                balance_ratio = practice_events ÷ learning_events
              </div>
              <p className="text-txt-secondary leading-relaxed mb-3">Interpretation:</p>
              <ul className="text-txt-secondary space-y-2 list-disc pl-5">
                <li><strong className="text-txt-primary">&lt; 0.2</strong> — Heavy input, minimal practice. You&apos;re in tutorial mode. Knowledge is fragile.</li>
                <li><strong className="text-txt-primary">0.2 – 0.5</strong> — Learning-focused phase. Normal at the start of a new skill.</li>
                <li><strong className="text-txt-primary">0.5 – 1.0</strong> — Balanced. Theory and application are reinforcing each other.</li>
                <li><strong className="text-txt-primary">&gt; 1.0</strong> — Practice-dominant. Best for long-term retention. You&apos;re building real fluency.</li>
              </ul>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">When learning-heavy is fine</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                A low ratio (&lt; 0.2) isn&apos;t always bad. Some scenarios where heavy input makes sense:
              </p>
              <ul className="text-txt-secondary space-y-2 list-disc pl-5">
                <li><strong className="text-txt-primary">Onboarding a new domain.</strong> First two weeks of learning Kubernetes? Reading and watching is the right move. You need vocabulary before you can build.</li>
                <li><strong className="text-txt-primary">Conceptual subjects.</strong> History, philosophy, theory. Practice means writing, discussing, summarizing — but the initial input phase is longer.</li>
                <li><strong className="text-txt-primary">Spaced revisits.</strong> Re-reading something you already practiced a year ago to refresh.</li>
              </ul>
              <p className="text-txt-secondary leading-relaxed mt-4">
                The problem is when the ratio <em>stays</em> low. Months of input with no output means you don&apos;t actually know the skill — you just have a familiar feeling around it.
              </p>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">How to fix a low ratio</h2>
              <ul className="text-txt-secondary space-y-3 list-disc pl-5">
                <li><strong className="text-txt-primary">Smallest possible project.</strong> Don&apos;t plan a SaaS — write a 50-line script that uses the new thing.</li>
                <li><strong className="text-txt-primary">Teach it.</strong> Write a 500-word blog post explaining one concept you just learned. Teaching forces retrieval.</li>
                <li><strong className="text-txt-primary">Closed-book exercises.</strong> Re-do a tutorial without looking at the answer.</li>
                <li><strong className="text-txt-primary">Cap your learning.</strong> One book or one course at a time. Don&apos;t start the next until you&apos;ve practiced this one.</li>
              </ul>
            </section>

            <section className="card-elevated p-8 bg-gradient-to-br from-accent-400/5 to-secondary-400/5">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">How SkillFade surfaces this</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                Every skill in SkillFade has both learning and practice events. The dashboard shows your balance ratio at a glance. When a skill has accumulated learning events but zero practice events for 30+ days, you get a one-time calm alert: <em>&quot;You&apos;ve been learning [skill] but haven&apos;t applied it yet.&quot;</em>
              </p>
              <p className="text-txt-secondary leading-relaxed">
                It&apos;s a mirror, not a coach. Whether you act on it is up to you.
              </p>
            </section>
          </div>

          <div className="mt-12 text-center animate-slide-up animation-delay-400">
            <div className="card-elevated p-8">
              <h2 className="text-2xl font-bold text-txt-primary mb-4">See your own ratio</h2>
              <p className="text-txt-secondary mb-6 max-w-xl mx-auto">
                Log a week of learning and practice. SkillFade computes the rest.
              </p>
              <Link to="/register" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="mt-4">
                <Link to="/what-is-learning-decay" className="text-sm text-accent-400 hover:underline">
                  Related: What is Learning Decay?
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

export default LearningVsPractice;
