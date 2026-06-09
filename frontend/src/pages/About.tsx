import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Eye, Sparkles } from 'lucide-react';
import { SEO } from '../components/SEO';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="About"
        description="SkillFade is a calm, honest skill-decay tracker for self-directed learners. It shows you what you've practiced, what's fading, and where your learning and doing fall out of balance — without gamification or guilt."
        canonicalUrl="https://skillfade.website/about"
      />

      <PublicHeader />

      <main id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-400/10 mb-5">
              <Compass className="w-7 h-7 text-accent-400" />
            </div>
            <h1 className="text-display-md text-txt-primary mb-4">About SkillFade</h1>
            <p className="text-lg text-txt-secondary">
              A mirror for your learning, not a coach.
            </p>
          </div>

          <div className="card-elevated p-8 space-y-8 animate-slide-up">
            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">Why this exists</h2>
              <p className="text-txt-secondary leading-relaxed">
                Most learners spend more time consuming material than applying it. Tutorials get watched, articles get bookmarked, and over time the knowledge quietly fades. SkillFade was built to make that drift visible — calmly, without judgment — so you can decide what to do about it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">What it tracks</h2>
              <ul className="text-txt-secondary space-y-2 list-disc pl-5">
                <li><strong>Learning decay</strong> — skills lose freshness over time when they aren&apos;t reinforced</li>
                <li><strong>Practice scarcity</strong> — input without output leads to forgetting</li>
                <li><strong>Input / output balance</strong> — the ratio between consumption and production</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">What it doesn&apos;t do</h2>
              <ul className="text-txt-secondary space-y-2 list-disc pl-5">
                <li>Teach you new skills</li>
                <li>Motivate you with points, badges, or streaks</li>
                <li>Recommend resources</li>
                <li>Judge how much or how little you do</li>
              </ul>
            </section>

            <section className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border-subtle p-5">
                <Eye className="w-5 h-5 text-accent-400 mb-3" />
                <h3 className="font-semibold text-txt-primary mb-1">Honest</h3>
                <p className="text-sm text-txt-muted">Shows the data, not a pep talk.</p>
              </div>
              <div className="rounded-xl border border-border-subtle p-5">
                <Heart className="w-5 h-5 text-accent-400 mb-3" />
                <h3 className="font-semibold text-txt-primary mb-1">Calm</h3>
                <p className="text-sm text-txt-muted">No red warnings, no urgency, no FOMO.</p>
              </div>
              <div className="rounded-xl border border-border-subtle p-5">
                <Sparkles className="w-5 h-5 text-accent-400 mb-3" />
                <h3 className="font-semibold text-txt-primary mb-1">Yours</h3>
                <p className="text-sm text-txt-muted">Export anytime. Delete anytime. Permanent.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">Who it&apos;s for</h2>
              <p className="text-txt-secondary leading-relaxed">
                Self-directed learners, developers, designers, writers, career switchers, and anyone who values long-term insight over short-term dopamine. If you&apos;ve ever finished a course and quietly wondered whether anything stuck, SkillFade is for you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">How it&apos;s built</h2>
              <p className="text-txt-secondary leading-relaxed">
                Boring, reliable tech: FastAPI on the backend, React on the frontend, PostgreSQL underneath. Calm design, type safety, ample whitespace. No microservices, no engagement-engineering, no dark patterns.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-txt-primary mb-3">Stay in touch</h2>
              <p className="text-txt-secondary leading-relaxed">
                Questions, feedback, or just want to say hi? Visit the <Link to="/contact" className="text-accent-400 hover:underline">contact page</Link>.
              </p>
            </section>
          </div>

          <div className="mt-10 text-center">
            <Link to="/" className="text-accent-400 hover:underline text-sm">
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default About;
