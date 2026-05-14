import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X, Minus } from 'lucide-react';
import LogoIcon from '../../components/LogoIcon';
import { SEO } from '../../components/SEO';
import { generateArticleSchema } from '../../utils/seo';
import PublicFooter from '../../components/PublicFooter';

const Obsidian: React.FC = () => {
  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="SkillFade vs Obsidian — Skill Decay vs Knowledge Graph"
        description="Obsidian links your notes into a knowledge graph. SkillFade measures whether your skills are decaying. See which is the right tool — and how to use both."
        canonicalUrl="https://skillfade.website/compare/obsidian"
        ogType="article"
        structuredData={generateArticleSchema(
          'SkillFade vs Obsidian — Skill Decay vs Knowledge Graph',
          'Obsidian is a markdown-based knowledge graph; SkillFade is a skill decay tracker. They serve complementary needs in a self-directed learning stack.'
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
              <Link to="/comparisons" className="text-accent-400 font-medium">Comparisons</Link>
              <Link to="/faq" className="text-txt-secondary hover:text-txt-primary transition-colors">FAQ</Link>
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
            <span className="tag-accent px-4 py-2 mb-6 inline-block">Comparison</span>
            <h1 className="text-display-md text-txt-primary mb-6">
              SkillFade vs Obsidian
            </h1>
            <p className="text-xl text-txt-secondary max-w-3xl mx-auto">
              Obsidian builds a graph of your knowledge. SkillFade tells you whether that knowledge is fading. Different tools for different questions.
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
                    <th className="text-left py-3 text-txt-primary font-semibold">Obsidian</th>
                  </tr>
                </thead>
                <tbody className="text-txt-secondary">
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Primary purpose</td>
                    <td className="py-3">Skill decay tracking</td>
                    <td className="py-3">Personal knowledge graph</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Storage</td>
                    <td className="py-3">PostgreSQL / SQLite</td>
                    <td className="py-3">Local markdown files</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Time-decay model</td>
                    <td className="py-3"><Check className="w-4 h-4 text-fresh-base inline" /> Yes</td>
                    <td className="py-3"><X className="w-4 h-4 text-decayed-base inline" /> No</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Backlinks / graph view</td>
                    <td className="py-3"><X className="w-4 h-4 text-decayed-base inline" /> No</td>
                    <td className="py-3"><Check className="w-4 h-4 text-fresh-base inline" /> Yes</td>
                  </tr>
                  <tr className="border-b border-border-subtle/50">
                    <td className="py-3">Plugin ecosystem</td>
                    <td className="py-3"><Minus className="w-4 h-4 text-aging-base inline" /> Limited</td>
                    <td className="py-3"><Check className="w-4 h-4 text-fresh-base inline" /> Huge</td>
                  </tr>
                  <tr>
                    <td className="py-3">Web access</td>
                    <td className="py-3"><Check className="w-4 h-4 text-fresh-base inline" /> Native web app</td>
                    <td className="py-3"><Minus className="w-4 h-4 text-aging-base inline" /> Sync subscription</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-10 animate-slide-up animation-delay-200">
            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">What Obsidian does</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                Obsidian is a local-first markdown editor that builds a graph of links between your notes. It&apos;s the modern home for the Zettelkasten method — every note is an atomic idea, every link is a connection. Power users extend it with plugins for spaced repetition, tasks, dataview queries, and more.
              </p>
              <p className="text-txt-secondary leading-relaxed">
                For knowledge workers who think in connections — researchers, writers, polymaths — Obsidian is unmatched.
              </p>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">Where Obsidian doesn&apos;t help</h2>
              <p className="text-txt-secondary leading-relaxed mb-4">
                Obsidian helps you <em className="text-txt-primary">organize</em> what you know. It doesn&apos;t tell you whether what you know is going stale.
              </p>
              <p className="text-txt-secondary leading-relaxed">
                You can write 500 notes on TypeScript and never write a line of code. Obsidian won&apos;t flag that. SkillFade will — by showing your TypeScript practice events are zero, your learning events are 47, and your skill freshness is at 30%.
              </p>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">When to choose Obsidian</h2>
              <ul className="text-txt-secondary space-y-3 list-disc pl-5">
                <li>You want a permanent knowledge base of everything you&apos;ve learned.</li>
                <li>You think in connections and want to surface unexpected links.</li>
                <li>You value local-first markdown ownership.</li>
                <li>You want a power-user tool with deep customization.</li>
              </ul>
            </section>

            <section className="card-elevated p-8">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">When to choose SkillFade</h2>
              <ul className="text-txt-secondary space-y-3 list-disc pl-5">
                <li>You want to know which skills are decaying — not just what you&apos;ve written about.</li>
                <li>You want a calm dashboard, not a graph view.</li>
                <li>You log events; you don&apos;t want to maintain notes.</li>
                <li>You need infrequent email alerts when something needs attention.</li>
              </ul>
            </section>

            <section className="card-elevated p-8 bg-gradient-to-br from-accent-400/5 to-secondary-400/5">
              <h2 className="text-2xl font-semibold text-txt-primary mb-4">Use them together</h2>
              <p className="text-txt-secondary leading-relaxed">
                Many Obsidian users keep a daily note. Drop a SkillFade event log into it and link to the skill&apos;s detail. Obsidian holds the depth; SkillFade holds the time dimension.
              </p>
            </section>
          </div>

          <div className="mt-12 text-center animate-slide-up animation-delay-400">
            <div className="card-elevated p-8">
              <h2 className="text-2xl font-bold text-txt-primary mb-4">Track decay, not just connections</h2>
              <p className="text-txt-secondary mb-6 max-w-xl mx-auto">
                Free, open source, calm. Self-host alongside your Obsidian vault.
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

export default Obsidian;
