import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { SEO } from '../components/SEO';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { posts } from '../lib/blog';
import { generateBlogSchema, generateBreadcrumbSchema } from '../utils/seo';

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const Blog: React.FC = () => {
  const schema = [
    generateBlogSchema(),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://skillfade.website/' },
      { name: 'Blog', url: 'https://skillfade.website/blog' },
    ]),
  ];

  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title="Blog — Skill Decay, Retention & Calm Learning"
        description="Essays on skill decay, the forgetting curve, spaced repetition, and calm, deliberate learning for developers and self-directed learners."
        canonicalUrl="https://skillfade.website/blog"
        structuredData={schema}
      />
      <PublicHeader />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-16 animate-fade-in">
            <p className="label-caps text-txt-muted mb-3">The SkillFade Blog</p>
            <h1 className="text-display-md text-txt-primary mb-6">
              Notes on skill decay &amp; deliberate learning
            </h1>
            <p className="text-xl text-txt-secondary max-w-2xl mx-auto">
              Calm, practical writing about why skills fade, how the forgetting curve works, and
              how to keep what you&apos;ve learned.
            </p>
          </header>

          {posts.length === 0 ? (
            <p className="text-center text-txt-muted">No posts yet — check back soon.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="card-interactive p-6 sm:p-8 block group animate-slide-up"
                >
                  <div className="flex items-center gap-3 text-xs font-mono text-txt-muted mb-3">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTimeMinutes} min read
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-txt-primary mb-3 group-hover:text-accent-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-txt-secondary leading-relaxed mb-4">{post.description}</p>
                  <div className="flex items-center justify-between gap-4">
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span key={tag} className="tag text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm text-accent-400 font-medium whitespace-nowrap">
                      Read <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Blog;
