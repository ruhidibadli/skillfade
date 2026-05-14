import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown, Calculator } from 'lucide-react';
import LogoIcon from '../components/LogoIcon';
import { SEO } from '../components/SEO';
import { generateArticleSchema } from '../utils/seo';
import PublicFooter from '../components/PublicFooter';

const SkillDecayFormula: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="The Skill Decay Formula — How Freshness Is Calculated"
        description="A transparent walkthrough of the SkillFade freshness algorithm. Exponential decay, learning boosts, custom rates per skill, and how to interpret the 0-100% score."
        canonicalUrl="https://skillfade.website/skill-decay-formula"
        ogType="article"
        structuredData={generateArticleSchema(
          'The Skill Decay Formula — How Freshness Is Calculated',
          'A transparent walkthrough of how SkillFade calculates skill freshness: exponential decay, learning boost, and configurable rates.'
        )}
      />

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

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-400/10 mb-5">
              <Calculator className="w-7 h-7 text-accent-400" />
            </div>
            <h1 className="text-display-md text-txt-primary mb-6">
              The Skill Decay Formula
            </h1>
            <p className="text-xl text-txt-secondary max-w-3xl mx-auto">
              No black box. Here&apos;s exactly how SkillFade turns your event log into a 0–100% freshness score.
            </p>
          </div>

          <div className="space-y-10 animate-slide-up">
            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">The high-level idea</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                Every skill starts at 100% freshness. Without practice, it decays a little each day. Learning events give a small temporary boost — but only practice events fully reset the decay clock.
              </p>
              <p className="text-txt-secondary leading-relaxed">
                The result is a single number between 0 and 100 that captures the question: <em>&quot;How likely am I to perform well on this skill right now?&quot;</em>
              </p>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">The formula</h2>
              <div className="bg-surface-300 rounded-lg p-5 mb-4 font-mono text-sm text-txt-primary overflow-x-auto">
                <div>days_since_practice = today − last_practice_date</div>
                <div className="mt-2">base_freshness = 100 × (1 − decay_rate) ^ days_since_practice</div>
                <div className="mt-2">learning_boost = min(recent_learning_events × 2, 15)</div>
                <div className="mt-2">freshness = clamp(base_freshness + learning_boost, 0, 100)</div>
              </div>
              <p className="text-txt-secondary leading-relaxed">
                That&apos;s the whole thing. Pure math, no machine learning, no proprietary scoring. You can pencil it out for any skill.
              </p>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">The parameters</h2>
              <ul className="text-txt-secondary space-y-3 list-disc pl-5">
                <li><strong className="text-txt-primary">decay_rate</strong> — Default 0.02 (2% per day). Editable per skill. A skill at 0.02 decay loses ~50% freshness over ~34 days of no practice.</li>
                <li><strong className="text-txt-primary">recent_learning_events</strong> — Count of learning events (reading, video, course, article, documentation, tutorial) in the last 30 days.</li>
                <li><strong className="text-txt-primary">learning_boost</strong> — Each recent learning event adds 2 percentage points, capped at 15. Learning matters, but practice matters more.</li>
                <li><strong className="text-txt-primary">last_practice_date</strong> — Date of the most recent practice event (exercise, project, work, teaching, writing, building). Falls back to the skill&apos;s creation date if never practiced.</li>
              </ul>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">Worked example</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                You created a TypeScript skill 60 days ago. You practiced it (built a small project) 20 days ago. You&apos;ve read 4 articles on TypeScript in the last 30 days. Default decay rate of 0.02.
              </p>
              <div className="bg-surface-300 rounded-lg p-5 mb-4 font-mono text-sm text-txt-secondary overflow-x-auto">
                <div>days_since_practice = 20</div>
                <div>base_freshness = 100 × (0.98 ^ 20) = 100 × 0.668 = 66.8</div>
                <div>learning_boost = min(4 × 2, 15) = 8</div>
                <div className="text-txt-primary mt-2">freshness = 66.8 + 8 = 74.8% (🟢 Fresh)</div>
              </div>
              <p className="text-txt-secondary leading-relaxed">
                Now imagine you stop practicing for another 60 days. Days-since-practice becomes 80. Freshness drops to <code className="text-txt-primary">100 × 0.98^80 = 19.9%</code>. Add the learning boost: still ~28% — solidly 🔴 Decayed.
              </p>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">The freshness bands</h2>
              <div className="space-y-3 text-txt-secondary">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🟢</span>
                  <span><strong className="text-txt-primary">Fresh (70–100%)</strong> — You can likely perform this skill well right now.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🟡</span>
                  <span><strong className="text-txt-primary">Aging (40–70%)</strong> — Some friction; you&apos;ll need a refresher before high-stakes use.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔴</span>
                  <span><strong className="text-txt-primary">Decayed (0–40%)</strong> — Significant rust. Plan a small practice session.</span>
                </div>
              </div>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">Customizing decay rates</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                Not all skills decay at the same speed. Foundational skills (riding a bike, basic SQL) decay slowly. Volatile skills (a niche framework version, specific tool shortcuts) decay fast.
              </p>
              <p className="text-txt-secondary leading-relaxed mb-3">
                You can set a custom decay rate per skill. Suggested values:
              </p>
              <ul className="text-txt-secondary space-y-2 list-disc pl-5">
                <li><strong className="text-txt-primary">Slow (0.005)</strong> — Foundational skills: typing, basic math, English fluency.</li>
                <li><strong className="text-txt-primary">Default (0.02)</strong> — Most skills: programming languages, design tools, instruments.</li>
                <li><strong className="text-txt-primary">Fast (0.05)</strong> — Volatile skills: niche framework APIs, latest model APIs, current best practices.</li>
              </ul>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">Why this formula?</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                It&apos;s based on the Ebbinghaus forgetting curve — exponential decay matches how human memory degrades. We chose exponential over linear because it captures the real-world &quot;cliff&quot; effect: most loss happens early, then it slows down.
              </p>
              <p className="text-txt-secondary leading-relaxed">
                The learning boost is capped to prevent &quot;reading 50 articles&quot; from masking the fact that you never practiced. Learning helps. Practice is the only thing that fully resets the curve.
              </p>
            </section>
          </div>

          <div className="mt-12 text-center animate-slide-up animation-delay-400">
            <div className="card-elevated p-8 bg-gradient-to-br from-accent-400/5 to-secondary-400/5">
              <div className="flex justify-center mb-4">
                <TrendingDown className="w-8 h-8 text-accent-400" />
              </div>
              <h2 className="text-2xl font-bold text-txt-primary mb-4">See the formula run on your skills</h2>
              <p className="text-txt-secondary mb-6 max-w-xl mx-auto">
                Log a few learning and practice events. Watch the freshness chart over 90 days.
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

export default SkillDecayFormula;
