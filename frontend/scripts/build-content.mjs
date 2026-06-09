#!/usr/bin/env node
/**
 * Build-time content generator for the SkillFade blog.
 *
 * Runs before `vite build` / `vite dev` (wired via the `prebuild` / `predev`
 * npm hooks). It:
 *   1. Reads every markdown post in `src/content/blog/*.md`
 *   2. Parses + validates front-matter (a bad post fails the build, loudly)
 *   3. Emits a typed post manifest at `src/content/blog/manifest.generated.ts`
 *   4. Regenerates `public/sitemap.xml` (static routes + every post)
 *   5. Regenerates `public/rss.xml`
 *
 * Pure Node (no TypeScript imports) so it runs on the production node:18 image.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BLOG_DIR = join(ROOT, 'src', 'content', 'blog');
const MANIFEST_OUT = join(BLOG_DIR, 'manifest.generated.ts');
const PUBLIC_DIR = join(ROOT, 'public');

const BASE_URL = 'https://skillfade.website';

// Static (non-blog) routes — the single source of truth for the sitemap.
// Add new marketing/static pages here so they stay in the sitemap.
const STATIC_ROUTES = [
  { path: '/', lastmod: '2026-05-14', changefreq: 'weekly', priority: '1.0' },
  { path: '/features', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.9' },
  { path: '/what-is-learning-decay', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.8' },
  { path: '/learning-vs-practice', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.8' },
  { path: '/skill-decay-formula', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.7' },
  { path: '/use-cases', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.8' },
  { path: '/comparisons', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.7' },
  { path: '/compare/anki', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.7' },
  { path: '/compare/notion', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.7' },
  { path: '/compare/obsidian', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.7' },
  { path: '/faq', lastmod: '2026-05-14', changefreq: 'monthly', priority: '0.7' },
  { path: '/about', lastmod: '2026-05-15', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', lastmod: '2026-05-15', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy', lastmod: '2026-05-14', changefreq: 'yearly', priority: '0.3' },
];

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Coerce a YAML date (string or Date) to a `YYYY-MM-DD` string. */
function toDateString(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? '').slice(0, 10);
}

/** `2026-06-09-my-post.md` -> `my-post`; honors an explicit front-matter slug. */
function deriveSlug(filename, frontmatterSlug) {
  if (frontmatterSlug) return String(frontmatterSlug).trim();
  return filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function estimateReadingTime(body) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function readPosts() {
  let files;
  try {
    files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  } catch {
    return []; // no blog dir yet
  }

  const errors = [];
  const posts = [];

  for (const filename of files) {
    const raw = readFileSync(join(BLOG_DIR, filename), 'utf8');
    const { data, content } = matter(raw);

    const missing = ['title', 'description', 'date'].filter((k) => !data[k]);
    if (missing.length) {
      errors.push(`  ${filename}: missing front-matter field(s): ${missing.join(', ')}`);
      continue;
    }
    if (data.draft === true) continue;

    const date = toDateString(data.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push(`  ${filename}: "date" must be YYYY-MM-DD (got: ${data.date})`);
      continue;
    }

    posts.push({
      slug: deriveSlug(filename, data.slug),
      title: String(data.title),
      description: String(data.description),
      date,
      ...(data.updated ? { updated: toDateString(data.updated) } : {}),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      ...(data.hero ? { hero: String(data.hero) } : {}),
      readingTimeMinutes: estimateReadingTime(content),
      filename,
    });
  }

  if (errors.length) {
    console.error('\n[build-content] Invalid blog post(s):\n' + errors.join('\n') + '\n');
    process.exit(1);
  }

  // Guard against two files resolving to the same slug.
  const seen = new Set();
  for (const p of posts) {
    if (seen.has(p.slug)) {
      console.error(`\n[build-content] Duplicate slug "${p.slug}". Slugs must be unique.\n`);
      process.exit(1);
    }
    seen.add(p.slug);
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
}

function writeManifest(posts) {
  const body =
    '// AUTO-GENERATED by scripts/build-content.mjs — do not edit by hand.\n' +
    '// Regenerated on every `npm run build` and `npm run dev`.\n' +
    'import type { BlogPostMeta } from \'../../lib/blog\';\n\n' +
    `export const posts: BlogPostMeta[] = ${JSON.stringify(posts, null, 2)};\n`;
  writeFileSync(MANIFEST_OUT, body);
}

function writeSitemap(posts) {
  const urls = [];
  for (const r of STATIC_ROUTES) {
    urls.push(
      `  <url>\n    <loc>${BASE_URL}${r.path}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    );
  }
  // Blog index — lastmod tracks the newest post.
  const blogLastmod = posts[0]?.updated || posts[0]?.date || '2026-06-09';
  urls.push(
    `  <url>\n    <loc>${BASE_URL}/blog</loc>\n    <lastmod>${blogLastmod}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  );
  for (const p of posts) {
    urls.push(
      `  <url>\n    <loc>${BASE_URL}/blog/${p.slug}</loc>\n    <lastmod>${p.updated || p.date}</lastmod>\n` +
        `    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
    );
  }
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join('\n') +
    '\n</urlset>\n';
  writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), xml);
}

function writeRss(posts) {
  // Deterministic channel timestamp (newest post date) so the committed rss.xml
  // does NOT change on every build — otherwise each build dirties the git tree
  // and trips deploy.sh's "stash changes?" prompt.
  const newest = posts[0]?.updated || posts[0]?.date || '2026-06-09';
  const now = new Date(`${newest}T00:00:00Z`).toUTCString();
  const items = posts
    .map((p) => {
      const link = `${BASE_URL}/blog/${p.slug}`;
      const pubDate = new Date(`${p.date}T00:00:00Z`).toUTCString();
      return (
        '    <item>\n' +
        `      <title>${xmlEscape(p.title)}</title>\n` +
        `      <link>${link}</link>\n` +
        `      <guid isPermaLink="true">${link}</guid>\n` +
        `      <pubDate>${pubDate}</pubDate>\n` +
        `      <description>${xmlEscape(p.description)}</description>\n` +
        '    </item>'
      );
    })
    .join('\n');

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
    '  <channel>\n' +
    '    <title>SkillFade Blog</title>\n' +
    `    <link>${BASE_URL}/blog</link>\n` +
    '    <description>Essays on skill decay, retention, and calm, deliberate learning.</description>\n' +
    '    <language>en-us</language>\n' +
    `    <lastBuildDate>${now}</lastBuildDate>\n` +
    `    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n` +
    items +
    (items ? '\n' : '') +
    '  </channel>\n' +
    '</rss>\n';
  writeFileSync(join(PUBLIC_DIR, 'rss.xml'), xml);
}

const posts = readPosts();
writeManifest(posts);
writeSitemap(posts);
writeRss(posts);
console.log(`[build-content] ${posts.length} post(s) -> manifest, sitemap.xml, rss.xml`);
