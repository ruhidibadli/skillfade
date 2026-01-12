import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Palette, Zap, Check, X, Minus } from 'lucide-react';
import LogoIcon from '../components/LogoIcon';
import { SEO } from '../components/SEO';

interface Comparison {
  competitor: string;
  tagline: string;
  whatTheyDo: string;
  howWeDiffer: string;
  useTogetherNote: string;
  bestFor: {
    them: string;
    skillfade: string;
  };
}

const comparisons: Comparison[] = [
  {
    competitor: "Anki",
    tagline: "SkillFade vs Anki: Skill Tracking vs Spaced Repetition",
    whatTheyDo: "Anki is a flashcard application using spaced repetition algorithms to help you memorize discrete facts. It excels at vocabulary, definitions, medical terminology, and factual recall. You create cards, review them, and Anki schedules reviews based on how well you remember each card.",
    howWeDiffer: "SkillFade tracks broader skill competency over time, not individual facts. It measures when you last practiced a skill and whether you are balancing learning with application. There are no flashcards, no quizzes, and no scheduled reviews. Instead, SkillFade visualizes when you last practiced a skill and how that affects your retention through a freshness score (0-100%).",
    useTogetherNote: "Use Anki to memorize syntax, concepts, and facts. Use SkillFade to track whether you are actually writing code and applying those concepts. They are complementary tools for different aspects of learning.",
    bestFor: {
      them: "Memorizing discrete facts, vocabulary, definitions, medical terminology, flashcard-based learning",
      skillfade: "Tracking skill decay over time, balancing learning with practice, visualizing the forgetting curve for skills"
    }
  },
  {
    competitor: "Notion",
    tagline: "SkillFade vs Notion: Decay Tracking vs Note-Taking",
    whatTheyDo: "Notion is a flexible workspace for notes, documents, databases, wikis, and project management. It stores and organizes information in a highly customizable way. Many learners use it to take notes, create learning dashboards, and organize resources.",
    howWeDiffer: "Notion stores what you learn but does not track whether those skills are decaying over time. SkillFade specifically calculates freshness scores based on time since last practice and alerts you when skills need reinforcement. SkillFade adds the time dimension that note-taking apps lack - it shows you that knowledge decays without practice.",
    useTogetherNote: "Use Notion to store notes and resources about what you are learning. Use SkillFade to track whether you are applying that knowledge and which skills are fading. Notion is for storage; SkillFade is for decay tracking.",
    bestFor: {
      them: "Note-taking, documentation, knowledge bases, project management, team collaboration, flexible databases",
      skillfade: "Tracking skill freshness over time, visualizing learning decay, monitoring practice frequency"
    }
  },
  {
    competitor: "Obsidian",
    tagline: "SkillFade vs Obsidian: Decay Tracking vs Knowledge Graphs",
    whatTheyDo: "Obsidian is a markdown-based knowledge management tool with linked notes and graph visualization. It helps you build a personal knowledge base where ideas connect to each other. The graph view shows relationships between your notes.",
    howWeDiffer: "Obsidian shows connections between your notes but not whether your skills are fresh or decaying. SkillFade adds the time dimension - tracking when you last practiced and calculating decay. While Obsidian helps you understand relationships between concepts, SkillFade helps you understand which skills need reinforcement.",
    useTogetherNote: "Use Obsidian for your knowledge graph and linked notes about concepts. Use SkillFade to track which skills need practice to prevent decay. Obsidian is about connections; SkillFade is about time-based decay.",
    bestFor: {
      them: "Building knowledge graphs, linking ideas, long-form writing, markdown notes, local-first storage",
      skillfade: "Time-based skill tracking, practice frequency monitoring, visualizing the forgetting curve"
    }
  },
  {
    competitor: "Spaced Repetition Apps (SuperMemo, RemNote, Mochi)",
    tagline: "SkillFade vs Spaced Repetition Apps",
    whatTheyDo: "Spaced repetition apps like SuperMemo, RemNote, and Mochi schedule reviews of flashcards to optimize memory retention based on the forgetting curve. They actively quiz you and adjust review intervals based on your performance.",
    howWeDiffer: "SkillFade does not create flashcards or schedule reviews. It tracks when you actually practice skills (through projects, exercises, work) and shows whether you are balancing learning with doing. It is passive tracking of real-world practice, not active quizzing of memorized facts. SkillFade respects your autonomy - it shows you the truth and lets you decide what to do.",
    useTogetherNote: "Use spaced repetition apps for facts you need to memorize verbatim. Use SkillFade to track whether you are applying skills in practice. Spaced repetition is for recall; SkillFade is for application.",
    bestFor: {
      them: "Memorizing facts through scheduled reviews, optimizing recall for exams, flashcard-based learning",
      skillfade: "Tracking real-world skill practice, monitoring input/output balance, calm decay visualization"
    }
  }
];

const featureComparison = [
  { feature: "Tracks skill decay over time", skillfade: true, anki: false, notion: false, obsidian: false },
  { feature: "Flashcard-based learning", skillfade: false, anki: true, notion: false, obsidian: false },
  { feature: "Note-taking / documentation", skillfade: false, anki: false, notion: true, obsidian: true },
  { feature: "Knowledge graphs / linked notes", skillfade: false, anki: false, notion: "partial", obsidian: true },
  { feature: "Tracks learning vs practice balance", skillfade: true, anki: false, notion: false, obsidian: false },
  { feature: "Freshness scores (0-100%)", skillfade: true, anki: false, notion: false, obsidian: false },
  { feature: "No gamification (streaks, points)", skillfade: true, anki: false, notion: true, obsidian: true },
  { feature: "Self-hosted option", skillfade: true, anki: true, notion: false, obsidian: true },
  { feature: "Open source", skillfade: true, anki: true, notion: false, obsidian: false },
];

const Comparisons: React.FC = () => {
  const renderFeatureStatus = (status: boolean | string) => {
    if (status === true) return <Check className="w-5 h-5 text-fresh-base" />;
    if (status === false) return <X className="w-5 h-5 text-decayed-base" />;
    return <Minus className="w-5 h-5 text-aging-base" />;
  };

  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="SkillFade vs Anki, Notion, Obsidian - Tool Comparisons"
        description="Compare SkillFade to Anki, Notion, Obsidian, and spaced repetition apps. Learn how skill decay tracking differs from flashcards, note-taking, and knowledge graphs. Find the right tool for your learning needs."
        canonicalUrl="https://skillfade.app/comparisons"
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

      {/* Main Content */}
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="tag-accent px-4 py-2">Tool Comparisons</span>
            </div>
            <h1 className="text-display-md text-txt-primary mb-6">
              SkillFade vs Other Learning Tools
            </h1>
            <p className="text-xl text-txt-secondary max-w-3xl mx-auto">
              SkillFade is a skill decay tracking application. It is not a replacement for Anki, Notion, or Obsidian - it solves a different problem. Here is how SkillFade compares to popular learning and productivity tools.
            </p>
          </div>

          {/* Feature Comparison Table */}
          <section className="mb-16 animate-slide-up">
            <h2 className="text-2xl font-bold text-txt-primary mb-8 text-center">
              Quick Feature Comparison
            </h2>
            <div className="card-elevated overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-100/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-txt-primary">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-accent-400">SkillFade</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-txt-secondary">Anki</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-txt-secondary">Notion</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-txt-secondary">Obsidian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureComparison.map((row, index) => (
                      <tr key={index} className="border-b border-border-subtle last:border-0 hover:bg-surface-100/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-txt-secondary">{row.feature}</td>
                        <td className="px-6 py-4 text-center">{renderFeatureStatus(row.skillfade)}</td>
                        <td className="px-6 py-4 text-center">{renderFeatureStatus(row.anki)}</td>
                        <td className="px-6 py-4 text-center">{renderFeatureStatus(row.notion)}</td>
                        <td className="px-6 py-4 text-center">{renderFeatureStatus(row.obsidian)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Detailed Comparisons */}
          <section className="space-y-12 animate-slide-up animation-delay-200">
            {comparisons.map((comparison, index) => (
              <article key={index} className="card-elevated overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-border-subtle bg-gradient-to-r from-accent-400/5 to-secondary-400/5">
                  <h2 className="text-2xl font-bold text-txt-primary">
                    {comparison.tagline}
                  </h2>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                  {/* What They Do */}
                  <div>
                    <h3 className="text-lg font-semibold text-txt-primary mb-3">
                      What {comparison.competitor} Does
                    </h3>
                    <p className="text-txt-secondary leading-relaxed">
                      {comparison.whatTheyDo}
                    </p>
                  </div>

                  {/* How We Differ */}
                  <div>
                    <h3 className="text-lg font-semibold text-txt-primary mb-3">
                      How SkillFade Differs
                    </h3>
                    <p className="text-txt-secondary leading-relaxed">
                      {comparison.howWeDiffer}
                    </p>
                  </div>

                  {/* Use Together Note */}
                  <div className="bg-surface-100/50 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-txt-primary mb-2">
                      Can You Use Both Together?
                    </h3>
                    <p className="text-txt-secondary text-sm leading-relaxed">
                      {comparison.useTogetherNote}
                    </p>
                  </div>

                  {/* Best For Comparison */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-surface-100/30 rounded-lg p-5">
                      <h4 className="text-sm font-semibold text-txt-primary mb-2">
                        {comparison.competitor} is best for:
                      </h4>
                      <p className="text-txt-secondary text-sm">
                        {comparison.bestFor.them}
                      </p>
                    </div>
                    <div className="bg-accent-400/5 rounded-lg p-5">
                      <h4 className="text-sm font-semibold text-accent-400 mb-2">
                        SkillFade is best for:
                      </h4>
                      <p className="text-txt-secondary text-sm">
                        {comparison.bestFor.skillfade}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Summary */}
          <section className="mt-16 animate-slide-up animation-delay-400">
            <div className="card-elevated p-8 bg-gradient-to-br from-accent-400/5 to-secondary-400/5">
              <h2 className="text-2xl font-bold text-txt-primary mb-6 text-center">
                The Bottom Line
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-txt-secondary leading-relaxed mb-6 text-center">
                  SkillFade is not trying to replace your favorite learning tools. It fills a specific gap: <strong className="text-txt-primary">tracking how your skills decay over time and whether you are balancing learning with practice</strong>.
                </p>
                <ul className="space-y-3 text-txt-secondary">
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-fresh-base flex-shrink-0 mt-0.5" />
                    <span>Use <strong className="text-txt-primary">Anki</strong> for memorizing facts, <strong className="text-txt-primary">SkillFade</strong> for tracking skill decay</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-fresh-base flex-shrink-0 mt-0.5" />
                    <span>Use <strong className="text-txt-primary">Notion</strong> for notes and organization, <strong className="text-txt-primary">SkillFade</strong> for decay tracking</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-fresh-base flex-shrink-0 mt-0.5" />
                    <span>Use <strong className="text-txt-primary">Obsidian</strong> for knowledge graphs, <strong className="text-txt-primary">SkillFade</strong> for time-based freshness</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-txt-primary mb-4">
              Try SkillFade - It's Free
            </h2>
            <p className="text-txt-secondary mb-6 max-w-xl mx-auto">
              SkillFade is free, open source, and designed to complement your existing learning tools. Track skill decay without gamification.
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

export default Comparisons;
