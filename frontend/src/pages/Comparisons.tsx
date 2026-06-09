import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X, Minus } from 'lucide-react';
import { SEO } from '../components/SEO';
import { generateArticleSchema } from '../utils/seo';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';

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
    competitor: "Flashcard Apps",
    tagline: "SkillFade vs Flashcard Apps: Skill Tracking vs Spaced Repetition",
    whatTheyDo: "Flashcard applications use spaced repetition algorithms to help you memorize discrete facts. They excel at vocabulary, definitions, medical terminology, and factual recall. You create cards, review them, and the app schedules reviews based on how well you remember each card.",
    howWeDiffer: "SkillFade tracks broader skill competency over time, not individual facts. It measures when you last practiced a skill and whether you are balancing learning with application. There are no flashcards, no quizzes, and no scheduled reviews. Instead, SkillFade visualizes when you last practiced a skill and how that affects your retention through a freshness score (0-100%).",
    useTogetherNote: "Use flashcard apps to memorize syntax, concepts, and facts. Use SkillFade to track whether you are actually writing code and applying those concepts. They are complementary tools for different aspects of learning.",
    bestFor: {
      them: "Memorizing discrete facts, vocabulary, definitions, medical terminology, flashcard-based learning",
      skillfade: "Tracking skill decay over time, balancing learning with practice, visualizing the forgetting curve for skills"
    }
  },
  {
    competitor: "Note-Taking Apps",
    tagline: "SkillFade vs Note-Taking Apps: Decay Tracking vs Documentation",
    whatTheyDo: "Note-taking applications are flexible workspaces for notes, documents, databases, wikis, and project management. They store and organize information in highly customizable ways. Many learners use them to take notes, create learning dashboards, and organize resources.",
    howWeDiffer: "Note-taking apps store what you learn but do not track whether those skills are decaying over time. SkillFade specifically calculates freshness scores based on time since last practice and alerts you when skills need reinforcement. SkillFade adds the time dimension that note-taking apps lack - it shows you that knowledge decays without practice.",
    useTogetherNote: "Use note-taking apps to store notes and resources about what you are learning. Use SkillFade to track whether you are applying that knowledge and which skills are fading. Note-taking is for storage; SkillFade is for decay tracking.",
    bestFor: {
      them: "Note-taking, documentation, knowledge bases, project management, team collaboration, flexible databases",
      skillfade: "Tracking skill freshness over time, visualizing learning decay, monitoring practice frequency"
    }
  },
  {
    competitor: "Knowledge Graph Apps",
    tagline: "SkillFade vs Knowledge Graph Apps: Decay Tracking vs Linked Notes",
    whatTheyDo: "Knowledge graph applications are markdown-based knowledge management tools with linked notes and graph visualization. They help you build a personal knowledge base where ideas connect to each other. The graph view shows relationships between your notes.",
    howWeDiffer: "Knowledge graph apps show connections between your notes but not whether your skills are fresh or decaying. SkillFade adds the time dimension - tracking when you last practiced and calculating decay. While knowledge graphs help you understand relationships between concepts, SkillFade helps you understand which skills need reinforcement.",
    useTogetherNote: "Use knowledge graph apps for your linked notes about concepts. Use SkillFade to track which skills need practice to prevent decay. Knowledge graphs are about connections; SkillFade is about time-based decay.",
    bestFor: {
      them: "Building knowledge graphs, linking ideas, long-form writing, markdown notes, local-first storage",
      skillfade: "Time-based skill tracking, practice frequency monitoring, visualizing the forgetting curve"
    }
  },
  {
    competitor: "Spaced Repetition Apps",
    tagline: "SkillFade vs Spaced Repetition Apps",
    whatTheyDo: "Spaced repetition apps schedule reviews of flashcards to optimize memory retention based on the forgetting curve. They actively quiz you and adjust review intervals based on your performance.",
    howWeDiffer: "SkillFade does not create flashcards or schedule reviews. It tracks when you actually practice skills (through projects, exercises, work) and shows whether you are balancing learning with doing. It is passive tracking of real-world practice, not active quizzing of memorized facts. SkillFade respects your autonomy - it shows you the truth and lets you decide what to do.",
    useTogetherNote: "Use spaced repetition apps for facts you need to memorize verbatim. Use SkillFade to track whether you are applying skills in practice. Spaced repetition is for recall; SkillFade is for application.",
    bestFor: {
      them: "Memorizing facts through scheduled reviews, optimizing recall for exams, flashcard-based learning",
      skillfade: "Tracking real-world skill practice, monitoring input/output balance, calm decay visualization"
    }
  }
];

const featureComparison = [
  { feature: "Tracks skill decay over time", skillfade: true, flashcard: false, notetaking: false, knowledgegraph: false },
  { feature: "Flashcard-based learning", skillfade: false, flashcard: true, notetaking: false, knowledgegraph: false },
  { feature: "Note-taking / documentation", skillfade: false, flashcard: false, notetaking: true, knowledgegraph: true },
  { feature: "Knowledge graphs / linked notes", skillfade: false, flashcard: false, notetaking: "partial", knowledgegraph: true },
  { feature: "Tracks learning vs practice balance", skillfade: true, flashcard: false, notetaking: false, knowledgegraph: false },
  { feature: "Freshness scores (0-100%)", skillfade: true, flashcard: false, notetaking: false, knowledgegraph: false },
  { feature: "No gamification (streaks, points)", skillfade: true, flashcard: false, notetaking: true, knowledgegraph: true },
  { feature: "Self-hosted option", skillfade: true, flashcard: true, notetaking: false, knowledgegraph: true },
  { feature: "Open source", skillfade: true, flashcard: true, notetaking: false, knowledgegraph: false },
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
        title="SkillFade vs Anki, Notion, Obsidian — Compared"
        description="How SkillFade compares to flashcard apps (Anki), note-taking tools (Notion, Obsidian), knowledge graphs, and spaced repetition apps. A calm mirror versus gamified coaches and memorization tools."
        canonicalUrl="https://skillfade.website/comparisons"
        ogType="article"
        structuredData={generateArticleSchema(
          'SkillFade vs Anki, Notion, Obsidian — Compared',
          'Detailed comparison of SkillFade against flashcard apps, note-taking tools, knowledge graphs, and spaced repetition apps.'
        )}
      />

      {/* Header */}
      <PublicHeader />

      {/* Main Content */}
      <main id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
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
                      <th className="px-6 py-4 text-center text-sm font-semibold text-txt-secondary">Flashcard Apps</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-txt-secondary">Note-Taking Apps</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-txt-secondary">Knowledge Graphs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureComparison.map((row, index) => (
                      <tr key={index} className="border-b border-border-subtle last:border-0 hover:bg-surface-100/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-txt-secondary">{row.feature}</td>
                        <td className="px-6 py-4 text-center">{renderFeatureStatus(row.skillfade)}</td>
                        <td className="px-6 py-4 text-center">{renderFeatureStatus(row.flashcard)}</td>
                        <td className="px-6 py-4 text-center">{renderFeatureStatus(row.notetaking)}</td>
                        <td className="px-6 py-4 text-center">{renderFeatureStatus(row.knowledgegraph)}</td>
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
                    <span>Use <strong className="text-txt-primary">flashcard apps</strong> for memorizing facts, <strong className="text-txt-primary">SkillFade</strong> for tracking skill decay</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-fresh-base flex-shrink-0 mt-0.5" />
                    <span>Use <strong className="text-txt-primary">note-taking apps</strong> for notes and organization, <strong className="text-txt-primary">SkillFade</strong> for decay tracking</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-fresh-base flex-shrink-0 mt-0.5" />
                    <span>Use <strong className="text-txt-primary">knowledge graph apps</strong> for linked notes, <strong className="text-txt-primary">SkillFade</strong> for time-based freshness</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Dedicated comparison pages */}
          <section className="mt-16 animate-slide-up">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-txt-primary mb-3">
                Dedicated Comparisons
              </h2>
              <p className="text-txt-secondary max-w-2xl mx-auto">
                Deep dives on the most-asked head-to-heads. Each page includes a feature table, when-to-use guidance, and how the tools complement each other.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/compare/anki"
                className="card-interactive p-6 group"
              >
                <h3 className="text-lg font-semibold text-txt-primary mb-2 group-hover:text-accent-400 transition-colors">
                  SkillFade vs Anki
                </h3>
                <p className="text-sm text-txt-secondary mb-4 leading-relaxed">
                  Spaced repetition for facts versus skill decay tracking for competencies. When to use each.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-accent-400 group-hover:gap-2 transition-all">
                  Read comparison <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link
                to="/compare/notion"
                className="card-interactive p-6 group"
              >
                <h3 className="text-lg font-semibold text-txt-primary mb-2 group-hover:text-accent-400 transition-colors">
                  SkillFade vs Notion
                </h3>
                <p className="text-sm text-txt-secondary mb-4 leading-relaxed">
                  An all-in-one workspace versus a purpose-built skill decay tracker. Why a Notion template stalls.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-accent-400 group-hover:gap-2 transition-all">
                  Read comparison <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link
                to="/compare/obsidian"
                className="card-interactive p-6 group"
              >
                <h3 className="text-lg font-semibold text-txt-primary mb-2 group-hover:text-accent-400 transition-colors">
                  SkillFade vs Obsidian
                </h3>
                <p className="text-sm text-txt-secondary mb-4 leading-relaxed">
                  A knowledge graph for connected notes versus a freshness algorithm for time-based decay.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-accent-400 group-hover:gap-2 transition-all">
                  Read comparison <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
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

      <PublicFooter />
    </div>
  );
};

export default Comparisons;
