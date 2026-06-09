import { describe, it, expect } from 'vitest';
import { stripFrontmatter, estimateReadingTime } from '../lib/markdown';
import { posts, getPost, getPostBody } from '../lib/blog';

describe('markdown helpers', () => {
  it('strips a leading front-matter block', () => {
    const raw = '---\ntitle: "X"\ndate: "2026-01-01"\n---\n\nHello body.';
    expect(stripFrontmatter(raw)).toBe('Hello body.');
  });

  it('leaves a body without front-matter untouched', () => {
    expect(stripFrontmatter('No front matter here.')).toBe('No front matter here.');
  });

  it('estimates reading time at ~200 wpm, minimum 1', () => {
    expect(estimateReadingTime('word')).toBe(1);
    expect(estimateReadingTime(Array(400).fill('w').join(' '))).toBe(2);
  });
});

describe('blog manifest', () => {
  it('exposes a non-empty, well-formed post list', () => {
    expect(posts.length).toBeGreaterThan(0);
    for (const p of posts) {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.readingTimeMinutes).toBeGreaterThanOrEqual(1);
      expect(p.filename).toMatch(/\.md$/);
    }
  });

  it('is sorted newest-first', () => {
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].date >= posts[i].date).toBe(true);
    }
  });

  it('resolves a known slug to its metadata and body', () => {
    const first = posts[0];
    expect(getPost(first.slug)).toEqual(first);
    const body = getPostBody(first.filename);
    expect(body).not.toBeNull();
    expect(body!.length).toBeGreaterThan(0);
    expect(body!.startsWith('---')).toBe(false);
  });

  it('returns undefined/null for unknown ids', () => {
    expect(getPost('does-not-exist')).toBeUndefined();
    expect(getPostBody('nope.md')).toBeNull();
  });
});
