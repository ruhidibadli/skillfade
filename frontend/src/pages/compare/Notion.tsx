import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X, Minus } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { generateArticleSchema, generateBreadcrumbSchema } from '../../utils/seo';
import PublicFooter from '../../components/PublicFooter';
import PublicHeader from '../../components/PublicHeader';

const Notion: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="SkillFade vs Notion — Skill Decay Tracking vs Notes"
        description="Notion is a flexible workspace for notes and databases. SkillFade is a focused tool that calculates skill decay over time. Compare them and learn which fits your learning workflow."
        canonicalUrl="https://skillfade.website/compare/notion"
        ogType="article"
        structuredData={[
          generateArticleSchema(
            'SkillFade vs Notion — Skill Decay Tracking vs Notes',
            'Comparison of SkillFade and Notion for tracking learning. One is a workspace; the other is a freshness algorithm. When each makes sense.',
            "2026-05-14"
          ),
          generateBreadcrumbSchema([
            { name: 'Home', url: 'https://skillfade.website/' },
            { name: 'Comparisons', url: 'https://skillfade.website/comparisons' },
            { name: 'SkillFade vs Notion', url: 'https://skillfade.website/compare/notion' },
          ]),
        ]}
      />

      <PublicHeader />

      <main id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <span className="tag-accent px-4 py-2 mb-6 inline-block">Comparison</span>
            <h1 className="text-display-md text-txt-primary mb-6">
              SkillFade vs Notion
            </h1>
            <p className="text-xl text-txt-secondary max-w-3xl mx-auto">
              Notion can be anything — including a learning tracker, if you build the system yourself. SkillFade is purpose-built: open it, log an event, see decay.
            </p>
          </div>

          <div className="card-elevated p-6 mb-12 animate-slide-up">
            <h2 className="text-lg font-semibold text-txt-primary mb-4">TL;DR</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left py-3 text-txt-muted font-medium">Feature</th>
                    <th className="text-left py-3 text-txt-primary font-semibold">SkillFade</th>
                    <th className="text-left py-3 text-txt-primary font-semibold">Notion</th>
                  </tr>
                </thead>
                <tbody className="text-txt-secondary">
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Purpose</td>
                    <td className="py-3">Skill decay tracking</td>
                    <td className="py-3">All-in-one workspace</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Setup time</td>
                    <td className="py-3">~2 minutes</td>
                    <td className="py-3">Hours (build your own system)</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Freshness algorithm</td>
                    <td className="py-3"><Check className="w-4 h-4 text-fresh-base inline" /> Built in</td>
                    <td className="py-3"><X className="w-4 h-4 text-decayed-base inline" /> DIY with formulas</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Time-based decay alerts</td>
                    <td className="py-3"><Check className="w-4 h-4 text-fresh-base inline" /> Email alerts</td>
                    <td className="py-3"><Minus className="w-4 h-4 text-aging-base inline" /> Manual</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Custom databases</td>
                    <td className="py-3"><X className="w-4 h-4 text-decayed-base inline" /> Fixed schema</td>
                    <td className="py-3"><Check className="w-4 h-4 text-fresh-base inline" /> Anything</td>
                  </tr>
                  <tr>
                    <td className="py-3">Privacy</td>
                    <td className="py-3"><Check className="w-4 h-4 text-fresh-base inline" /> Self-hostable, no tracking in-app</td>
                    <td className="py-3"><Minus className="w-4 h-4 text-aging-base inline" /> SaaS, analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-10 animate-slide-up animation-delay-200">
            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">What Notion does</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                Notion is a block-based workspace that lets you build databases, wikis, pages, and dashboards. Its strength is flexibility — you can model anything from a CRM to a recipe book to a learning tracker.
              </p>
              <p className="text-txt-secondary leading-relaxed">
                Many self-directed learners use Notion to log courses, books, and projects in custom databases. Some build elaborate templates with formulas that approximate freshness or review schedules.
              </p>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">Where Notion breaks down for skill tracking</h2>
              <ul className="text-txt-secondary space-y-3 list-disc pl-5">
                <li><strong className="text-txt-primary">Maintenance burden.</strong> The system you build in Notion is yours to maintain forever. Schema changes, formula bugs, page bloat — all on you.</li>
                <li><strong className="text-txt-primary">No real decay model.</strong> You can approximate freshness with formulas, but you don&apos;t get a tested algorithm with learning boosts and configurable decay rates.</li>
                <li><strong className="text-txt-primary">No alerts.</strong> Notion won&apos;t email you when a skill drops below 40%. You have to remember to check.</li>
                <li><strong className="text-txt-primary">Tool, not a habit.</strong> Notion is open-ended. SkillFade has a 30-second logging widget.</li>
              </ul>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">When to choose Notion</h2>
              <ul className="text-txt-secondary space-y-3 list-disc pl-5">
                <li>You want one tool for notes, docs, projects, and personal databases.</li>
                <li>You enjoy building custom systems and tweaking templates.</li>
                <li>You need rich text, embeds, and collaboration with a team.</li>
              </ul>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">When to choose SkillFade</h2>
              <ul className="text-txt-secondary space-y-3 list-disc pl-5">
                <li>You want skill decay tracking that works out of the box.</li>
                <li>You don&apos;t want to design and maintain your own system.</li>
                <li>You want infrequent, calm email alerts when skills decay.</li>
                <li>You care about input/output balance and need it surfaced automatically.</li>
              </ul>
            </section>

            <section className="card-elevated p-8 bg-gradient-to-br from-accent-400/5 to-secondary-400/5">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">Use them together</h2>
              <p className="text-txt-secondary leading-relaxed">
                Keep your learning notes, course summaries, and project docs in Notion. Use SkillFade to track which of those skills are actually fresh. Notion is your library; SkillFade is your mirror.
              </p>
            </section>
          </div>

          <div className="mt-12 text-center animate-slide-up animation-delay-400">
            <div className="card-elevated p-8">
              <h2 className="text-2xl font-bold text-txt-primary mb-4">Stop maintaining a Notion template</h2>
              <p className="text-txt-secondary mb-6 max-w-xl mx-auto">
                Get a purpose-built skill decay tracker. Free, open source, calm.
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

export default Notion;
