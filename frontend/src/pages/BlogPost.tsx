import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { SEO } from '../components/SEO';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import NotFound from './NotFound';
import { getPost, getPostBody, getRelatedPosts } from '../utils/blog';
import { generateBlogPostingSchema, generateBreadcrumbSchema } from '../utils/seo';

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// Render internal links via React Router (SPA nav); external links open safely.
const markdownComponents = {
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) =>
    href && href.startsWith('/') ? (
      <Link to={href}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : undefined;
  const body = post ? getPostBody(post.filename) : null;

  if (!post || body == null) {
    return <NotFound />;
  }

  const related = getRelatedPosts(post.slug, 2);
  const canonical = `https://skillfade.website/blog/${post.slug}`;
  const schema = [
    generateBlogPostingSchema({
      title: post.title,
      description: post.description,
      slug: post.slug,
      datePublished: post.date,
      dateModified: post.updated,
      image: post.hero,
      tags: post.tags,
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://skillfade.website/' },
      { name: 'Blog', url: 'https://skillfade.website/blog' },
      { name: post.title, url: canonical },
    ]),
  ];

  return (
    <div className="min-h-screen bg-mesh">
      <SEO
        title={post.title}
        description={post.description}
        canonicalUrl={canonical}
        ogType="article"
        ogImage={post.hero}
        structuredData={schema}
      />
      <PublicHeader />

      <article id="main" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-txt-muted hover:text-accent-400 transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> All posts
          </Link>

          <header className="mb-12 animate-fade-in">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-txt-muted mb-5">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readingTimeMinutes} min read
              </span>
            </div>
            <h1 className="text-display-md text-txt-primary mb-6">{post.title}</h1>
            <p className="text-xl text-txt-secondary leading-relaxed">{post.description}</p>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="prose-content animate-slide-up">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={markdownComponents}
            >
              {body}
            </ReactMarkdown>
          </div>

          {/* Calm closing CTA */}
          <div className="mt-16 pt-10 border-t border-border-subtle">
            <div className="card-elevated p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <h2 className="text-xl font-semibold text-txt-primary mb-1">
                  See your own skills fade — and act in time
                </h2>
                <p className="text-sm text-txt-muted">
                  SkillFade tracks a freshness score for every skill you log. A mirror, not a coach.
                </p>
              </div>
              <Link to="/register" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-sm font-mono uppercase tracking-wider text-txt-muted mb-5">
                Read next
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="card-elevated p-5 group hover:border-accent-400/40 transition-colors"
                  >
                    <h3 className="text-base font-semibold text-txt-primary group-hover:text-accent-400 transition-colors mb-1">
                      {r.title}
                    </h3>
                    <p className="text-sm text-txt-muted line-clamp-2">{r.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <PublicFooter />
    </div>
  );
};

export default BlogPost;
