// Pure, dependency-free markdown helpers shared by the blog runtime.
// Kept free of `import.meta.glob` and the DOM so they are trivially unit-testable.

/**
 * Strip a leading YAML front-matter block (`---\n…\n---`) from a raw markdown
 * string, returning just the body. Front-matter is parsed at build time into the
 * post manifest, so the runtime only ever needs the body.
 */
export function stripFrontmatter(raw: string): string {
  return raw.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').replace(/^\s+/, '');
}

/** Estimate reading time in whole minutes at ~200 words per minute (min 1). */
export function estimateReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
