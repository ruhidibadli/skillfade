import { stripFrontmatter } from './markdown';
import { posts as generatedPosts } from '../content/blog/manifest.generated';

/**
 * Metadata for a single blog post. Produced at build time by
 * `scripts/build-content.mjs` from each post's front-matter and emitted into
 * `src/content/blog/manifest.generated.ts`.
 */
export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  /** Publish date, `YYYY-MM-DD`. */
  date: string;
  /** Optional last-updated date, `YYYY-MM-DD`. */
  updated?: string;
  tags: string[];
  /** Optional absolute path to a per-post social/hero image (e.g. `/blog/foo.png`). */
  hero?: string;
  readingTimeMinutes: number;
  /** Source filename, used to resolve the bundled markdown body. */
  filename: string;
}

/** All published posts, newest first (sorted at build time). */
export const posts: BlogPostMeta[] = generatedPosts;

/** Look up a post's metadata by slug. */
export function getPost(slug: string): BlogPostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}

/**
 * Posts most related to `slug`, ranked by shared tags (most first), then recency.
 * Excludes the post itself. Falls back to most-recent posts when nothing shares a tag.
 */
export function getRelatedPosts(slug: string, limit = 2): BlogPostMeta[] {
  const current = getPost(slug);
  const others = posts.filter((p) => p.slug !== slug);
  if (!current) return others.slice(0, limit);
  return others
    .map((p) => ({ p, shared: p.tags.filter((t) => current.tags.includes(t)).length }))
    .sort((a, b) => b.shared - a.shared || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, limit)
    .map((s) => s.p);
}

// Bundle every post body at build time as a raw string. Front-matter is stripped
// at read time because it already lives in the manifest above.
const rawBodies = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Return the rendered-ready markdown body for a post filename, or null if missing. */
export function getPostBody(filename: string): string | null {
  const entry = Object.entries(rawBodies).find(([path]) => path.endsWith(`/${filename}`));
  return entry ? stripFrontmatter(entry[1]) : null;
}
