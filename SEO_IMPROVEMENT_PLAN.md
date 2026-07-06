# SkillFade — SEO Improvement Plan

> **Status:** Phases 1, 3, 4, 5, 6 and most of 7 **IMPLEMENTED** on 2026-07-07 (uncommitted working tree). Phase 2 (prerendering/SSG) intentionally **deferred** — see Implementation Status below.
> **Author:** SEO audit (8-dimension multi-agent audit, every finding verified against the actual code).
> **Date:** 2026-07-06 (implemented 2026-07-07)
> **Scope:** `frontend/` (Vite + React 18 SPA) + nginx. Backend untouched except where noted.

---

## Implementation Status (2026-07-07)

`tsc --noEmit` clean and `npm run build` green after all changes.

**Done:**
- **Phase 1 (all):** `/pricing` in sitemap; og:image/twitter:image now absolute; title double-branding fixed + over-60 titles trimmed; 9 meta descriptions trimmed to ≤155; keyword-bearing `/pricing` title; robots.txt simplified + `/reports` `/billing` disallowed + AI-crawler policy; blog `changefreq` → monthly; HSTS on apex nginx; **existing draft published as 2 cross-linked posts**.
- **Phase 3:** app + admin pages lazy-loaded and `manualChunks` added → recharts (109 KB gz) + react-vendor split out of the marketing path; fonts moved from CSS `@import` to preconnected `<link>`; nginx `gzip_types` extended (svg/json/rss/manifest/woff2); SW-cleanup gated behind a one-time flag.
- **Phase 4:** fabricated Article dates replaced with real `datePublished`/`dateModified` (default removed); duplicate JSON-LD consolidated (SoftwareApplication removed from the shell; WebSite/Org kept sitewide; Landing de-duped); guarded Product/Offer schema on `/pricing`; BreadcrumbList on all compare/* + content pages; `author.url` added.
- **Phase 5:** existing draft split & published; `getRelatedPosts` + "Read next" module on BlogPost; `/pricing` links added to Comparisons + UseCases CTAs.
- **Phase 6:** `llms.txt` added; AI-crawler policy in robots.txt. (Per-page OG image generation deferred — needs a headless-browser build step.)
- **Phase 7:** Terms of Service page (`/terms`, routed + sitemapped + footer link) — **draft, needs legal review**; FAQ "free / no premium tiers" copy corrected for live PRO; stale plan doc relabeled + `skillfade.app` → `skillfade.website`; app-shell `noindex` backstop in Layout.

**Deferred / needs you:**
- **Phase 2 — prerendering/SSG (the big lever):** NOT done. It's a real router refactor whose main risk is that the app's providers (`Auth`/`Theme`/etc.) read `localStorage`/`window` and will crash when rendered in Node by an SSG tool unless every browser-API access is guarded — and the result can't be verified without a browser/deploy smoke test. Doing it blind risks breaking the live app, so it should be a dedicated, verified pass. Decision **D1** (vite-react-ssg vs react-snap) still open.
- **6.2** per-page OG images, **7.2** 3 missing comparison pages, **5.4** programmatic per-tech pages (depend on Phase 2), **7.4** hardened soft-404, **3.4** og-image recompress (`pngquant` unavailable in this env — run `pngquant --quality 65-80` locally), **6.4** `sameAs` (needs real profile URLs — **D2**), full font self-hosting (needs woff2 binaries).

---

## 0. How to read this document

- **§1** — where we stand and what NOT to redo.
- **§2** — the recommended execution order (one table).
- **§3–§9** — the actual steps, grouped into phases. Each step has: **files**, **exact change**, **why**, **verify**, **risk/caveat**.
- **§10** — decisions I need from you before starting (blocking a few steps).
- **§11** — verification checklist for "done".

Every step is tagged `[S]` (< 2h), `[M]` (½–1 day), or `[L]` (multi-day), plus **impact** high/med/low.

---

## 1. Current state — grade: **B-**

SkillFade already shipped the hard, unglamorous 80% of technical SEO. **Do not re-do any of this:**

- ✅ Generated `sitemap.xml` + `rss.xml` at build time from a single source of truth (`scripts/build-content.mjs`, wired via `prebuild`/`predev`/`pretest`) — never drifts.
- ✅ Real `<SEO>` component (`components/SEO.tsx`) with canonical / OG / Twitter / JSON-LD, used on every public page.
- ✅ Full schema.org generator library (`utils/seo.ts`): Organization, SoftwareApplication, WebSite, FAQPage, Article, BlogPosting, BreadcrumbList, Blog — and FAQ/Article/Breadcrumb are actually consumed.
- ✅ GA4 (Consent Mode v2, default-denied) + Google Search Console verification, scoped to public pages via `RouteTracker` allowlist + `CookieBanner`.
- ✅ `noindex` on app/auth/billing/404 routes; one `<h1>` per public page; unique titles/descriptions/canonicals.
- ✅ 5 keyword-targeted pillar pages + 3 comparison pages + blog infrastructure.

**The remaining value is three buckets:**

1. **One structural ceiling** — the site is a **pure client-side-rendered SPA with no prerendering**. Every URL serves an empty `<div id="root">` shell with *identical homepage metadata*. All the per-page title/description/OG/JSON-LD work is injected only at runtime by react-helmet-async, so **non-JS fetchers never see it**: social unfurlers (Slack/Discord/LinkedIn/Twitter), Bing, and AI/answer-engine crawlers (GPTBot/ClaudeBot/PerplexityBot). Googlebot *does* render JS, so Google indexing is degraded-but-functional; everyone else is effectively blind. This single root cause is why "rendering", "social", "GEO", and "structured data" all flagged the same thing — **it is one fix.**
2. **A batch of cheap, safe config/meta fixes** (sitemap gap, og:image bug, titles, descriptions, dates, duplicate JSON-LD, robots, HSTS).
3. **Content is critically thin** — one on-site blog post; head terms like "skill atrophy" and "spaced repetition" have zero dedicated pages. No technical polish substitutes for indexable, answer-shaped content.

---

## 2. Recommended execution order

Do the phases roughly in this order. Phase 1 is safe to ship immediately; Phase 2 is the big lever; Phases 3–7 can interleave.

| Phase | Theme | Effort | Impact | Why this order |
|------:|-------|:------:|:------:|----------------|
| **1** | Quick wins (batch of small fixes) | S ×9 | med–high | Ship this week; zero risk; unblocks correct crawl/social basics |
| **2** | Prerendering / SSG **(the big lever)** | L | **high** | Makes every meta/schema/OG asset actually visible to non-JS crawlers |
| **3** | Performance / Core Web Vitals | M | high | Ranking factor; worst on SPAs; cuts marketing JS by >half |
| **4** | Structured-data hardening | S–M | med | Fix fabricated dates, duplicate JSON-LD, add Product/Offer |
| **5** | Content engine | L (ongoing) | **high** | The real growth driver; publish existing draft first |
| **6** | AI / GEO discoverability | S–M | med | llms.txt, per-page OG images, AI-crawler policy |
| **7** | Broken promises + doc hygiene | S–M | low | Terms page, 3 missing comparisons, update stale plan doc |

---

## 3. Phase 1 — Quick wins (batch, ~1 day, ship together)

All small, safe, high-ROI. Can be one PR.

### 1.1 Add `/pricing` to the sitemap `[S]` · impact **high**
- **Files:** `frontend/scripts/build-content.mjs` (source), regenerate `frontend/public/sitemap.xml`.
- **Change:** Add `{ path: '/pricing', lastmod: <today>, changefreq: 'monthly', priority: '0.8' }` to `STATIC_ROUTES` (after the `/privacy` entry, ~line 44), then run `npm run generate:content`. **Do not hand-edit `sitemap.xml`** — it is generated.
- **Why:** `Pricing.tsx:50-53` sets a canonical and no `noIndex` (indexable), but it's absent from `STATIC_ROUTES` and the sitemap — the primary conversion page isn't declared for crawl.
- **Verify:** `sitemap.xml` contains `<loc>https://skillfade.website/pricing</loc>` after regen.
- **Risk:** none. (`/billing/success|error` correctly stay out.)

### 1.2 Fix the `og:image` / `twitter:image` relative-URL bug `[S]` · impact **med**
- **Files:** `frontend/src/components/SEO.tsx`.
- **Change:** `SEO.tsx:19` defaults `ogImage='/og-image.png'` and `:40` emits it verbatim. Resolve to absolute before emitting: if it starts with `/`, prefix `https://skillfade.website`. Apply to both `og:image` and `twitter:image`.
- **Why:** OG spec requires an **absolute** URL. react-helmet overrides the correct absolute tag in `index.html` with a broken relative one on **every** SEO-using page → broken social preview images.
- **Verify:** Rendered `og:image` on any interior page is a full `https://…` URL.
- **Risk:** none (one-line helper).

### 1.3 Stop title double-branding + trim over-60 titles `[S]` · impact **med**
- **Files:** `frontend/src/components/SEO.tsx:23`; plus `LearningVsPractice.tsx`, `WhatIsLearningDecay.tsx`, `SkillDecayFormula.tsx`, `Features.tsx`.
- **Change:** `SEO.tsx:23` currently always appends `" | SkillFade"`. Change to append **only when the title doesn't already contain "SkillFade"**: `title.includes('SkillFade') ? title : \`${title} | SkillFade\``. Then shorten the still-over-60 titles.
- **Why:** Pages like `compare/Obsidian` render "SkillFade vs Obsidian … | SkillFade" (66 chars, double-branded, truncated). Over-60 rendered: Landing 70, WhatIsLearningDecay 70, LearningVsPractice 73, SkillDecayFormula 65, Features 63, compare/Notion 63, compare/Obsidian 66.
- **Verify:** No title contains "SkillFade" twice; all ≤ ~60 chars rendered.
- **Risk:** none.

### 1.4 Trim over-length meta descriptions to ~150–155 chars `[S]` · impact **med**
- **Files:** `Landing.tsx:59`, `Features.tsx:14`, `FAQ.tsx:66`, `WhatIsLearningDecay.tsx:20`, `LearningVsPractice.tsx:14`, `UseCases.tsx:88`, `Comparisons.tsx:91`, `SkillDecayFormula.tsx:14`, `compare/Anki.tsx:14`.
- **Change:** Rewrite each `description=` down to ~150–155 chars, front-loading the target keyword.
- **Why:** Nine descriptions run 162–209 chars → truncated mid-sentence in the SERP.
- **Verify:** Each description ≤ 155 chars.
- **Risk:** none (copy only).

### 1.5 Keyword-bearing `/pricing` title `[S]` · impact **low**
- **Files:** `frontend/src/pages/Pricing.tsx:51`.
- **Change:** `title="Pricing"` → e.g. `title="Pricing — Lifetime PRO, One-Time Payment"`.
- **Why:** Currently renders bare "Pricing | SkillFade" with no intent keywords despite selling a one-time lifetime PRO.
- **Risk:** none.

### 1.6 Simplify + complete `robots.txt` `[S]` · impact **low**
- **Files:** `frontend/public/robots.txt` (ideally also emit it from `build-content.mjs` so it can't drift).
- **Change:** Reduce the redundant per-path `Allow:` list to a single `Allow: /`; add `Disallow: /reports` and `Disallow: /billing`.
- **Why:** The `Allow` list is redundant-and-incomplete (omits `/learning-vs-practice`, `/skill-decay-formula`, `/compare/*`, `/about`, `/contact`, `/pricing`); `Disallow` omits `/reports/activity` and `/billing/*`. (These are auth-gated anyway, so this is cosmetic hygiene.)
- **Risk:** none.

### 1.7 Fix `/blog` index `changefreq` `[S]` · impact **low**
- **Files:** `frontend/scripts/build-content.mjs:154`.
- **Change:** `weekly` → `monthly` (per-post is already `monthly` at line 159).
- **Why:** Hardcoded `weekly` mismatches the real ~monthly cadence — a misleading crawl signal.
- **Risk:** none.

### 1.8 Add HSTS header to production nginx `[S]` · impact **med**
- **Files:** `frontend/nginx/default.conf` (the live HTTPS block, ~lines 26–64).
- **Change:** Add `add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;` alongside the existing `X-Frame-Options` (line 36).
- **Why:** Live HTTPS block sets `X-Frame-Options`/`X-Content-Type-Options` but no HSTS (the intent exists — commented template at `conf.d/default.conf:104`).
- **⚠️ Caveat:** Only add `includeSubDomains` if **all** subdomains are HTTPS. The www→apex 301 is a *separate* item — only do it if `www.skillfade.website` actually resolves in DNS (see §10, decision D4). certbot currently covers only the apex.
- **Risk:** low; HSTS is sticky, so double-check before enabling `includeSubDomains`.

### 1.9 Publish the existing 2,034-word draft on-site `[S]` · impact **high**
- **Files:** new files in `frontend/src/content/blog/`; source: `devto-post-modeling-skill-decay.md` (currently an **untracked local draft**).
- **Change:** Split into two posts — *"Streaks Measure Attendance, Not Skill"* and *"Modeling Skill Decay in ~40 Lines of Python"* — as `.md` in `src/content/blog/`. `build-content.mjs` auto-adds them to manifest + sitemap + RSS. **Publish on-site first**, then syndicate to dev.to with `canonical_url` pointing back (no canonical damage yet since it's unpublished).
- **Why:** Strongest long-form asset, doubles/triples on-site content count.
- **Risk:** none (goes through the existing pipeline). *(This is technically content, but it's an S-effort quick win — grouped here.)*

---

## 4. Phase 2 — Prerendering / SSG (the single highest-leverage change) `[L]` · impact **high**

**Problem (verified):** `package.json` build is exactly `tsc && vite build`; `vite.config.ts` has only `react()`. `dist/` contains exactly one HTML file (`dist/index.html`) whose body is `<div id="root"></div>`. Every public route falls through nginx `try_files … /index.html`. So every non-JS fetcher gets the homepage shell with homepage metadata for **every** URL. This is the root cause behind: empty-shell rendering, generic-homepage social unfurls, invisible-to-AI content, and client-only per-page JSON-LD (FAQPage/BlogPosting/Breadcrumb).

**Goal:** at build time, emit one fully-populated static `.html` per public route (marketing + blog + compare), with its real title/description/canonical/OG/JSON-LD baked in. Keep pure CSR for the authed app + auth routes. nginx keeps serving static files (no SSR server).

**Two implementation options — pick one (decision D1 in §10):**

- **Option A — `vite-react-ssg` (recommended, cleaner output).** Reuse the route list already owned by `build-content.mjs` (`STATIC_ROUTES` + blog manifest). Emits `dist/features/index.html`, `dist/blog/<slug>/index.html`, etc. **Cost:** requires restructuring `App.tsx`'s JSX `<BrowserRouter>` (`App.tsx:87`) into `vite-react-ssg`'s `ViteReactSSG` entry + route-object config — a genuine refactor, not a plugin drop-in. This is why it's `[L]`.
- **Option B — post-build `react-snap` / puppeteer crawl (lower code).** Add a `postbuild` step that crawls the public routes in a headless browser and snapshots each into static HTML. Less refactoring, but hackier and slower in CI; can mis-snapshot auth-gated redirects.

**Sub-steps (either option):**
1. Enumerate the public route list from `STATIC_ROUTES` + generated blog slugs (single source of truth — already exists).
2. Ensure authed/auth/admin routes are **excluded** from prerender (stay CSR).
3. Verify each prerendered file contains its own `<title>`, `<meta name="description">`, canonical, OG/Twitter, and JSON-LD (not the homepage's).
4. Confirm client hydration still works (prerender tools re-hydrate the same React app — SPA behavior unchanged for users).
5. Prioritize `/blog/*` and `/compare/*` + core marketing pages first (the shared/cited surfaces).

**Verify:** `curl https://skillfade.website/blog/<slug>` (or the built file) shows the post's real title/description/JSON-LD in raw HTML *without* running JS; social debuggers (Slack/LinkedIn/Facebook) show the correct per-page card.

**Risk:** medium — it's a router refactor. Mitigate by doing it on a branch and diffing prerendered output against expected metadata before deploy.

---

## 5. Phase 3 — Performance / Core Web Vitals

### 3.1 Code-split the 1.08 MB (264 KB gzip) main bundle `[M]` · impact **high**
- **Files:** `frontend/src/App.tsx`, `frontend/vite.config.ts`.
- **Change:** Wrap the authed + admin pages in `React.lazy` exactly as `Blog`/`BlogPost` already are (`Dashboard, Skills, SkillDetail, Analytics, ActivityReport, Settings, Support, TicketDetail`, and the `admin/*` set) — the `<Suspense>` at `App.tsx:91` already spans `<Routes>`, so lazy children need no further wiring. Add `build.rollupOptions.output.manualChunks` to `vite.config.ts` for a `charts` chunk (recharts) and a `react-vendor` chunk.
- **Why (verified):** `dist/assets/index-*.js` is 1,108,284 bytes raw / 270,515 gzip; recharts (imported statically in `Analytics.tsx:4`, `SkillDetail.tsx:6`) + all app/admin code ship to every marketing visitor. Cuts marketing landing JS by well over half → better LCP/INP.
- **Verify:** landing route's JS payload drops sharply; recharts no longer in the entry chunk.
- **Risk:** low (BlogPost is already split this exact way).

### 3.2 Fix render-blocking font loading `[M]` · impact **high**
- **Files:** `frontend/src/index.css:1`, `frontend/index.html`, `frontend/public/fonts/` (new), `nginx.prod.conf` (already caches fonts 1y immutable).
- **Change:** `index.css:1` loads 3 families (Fraunces, Hanken Grotesk, IBM Plex Mono) via a render-blocking third-party `@import` above the tailwind directives, with no preconnect. **Best:** self-host the woff2 under `public/fonts`, replace `@import` with `@font-face { font-display: swap }`, and `<link rel="preload" as="font" crossorigin>` the primary heading/body weights in `index.html`. Trim unused weights. **Cheaper interim:** move to `<link>` with `preconnect` to `fonts.googleapis.com` + `fonts.gstatic.com`.
- **Why:** CSS `@import` is the worst load method (serialized, render-blocking, third-party round-trip) → hurts LCP/CLS. (`display=swap` is already present, mitigating some CLS.)
- **Risk:** low; verify glyph coverage after self-hosting.

### 3.3 Enable brotli + extend gzip types in nginx `[M]` · impact **med**
- **Files:** `frontend/nginx.prod.conf:12`, `frontend/nginx.conf:12`.
- **Change:** Compile/enable `ngx_brotli`; at minimum extend `gzip_types` to include `image/svg+xml application/json application/rss+xml application/manifest+json font/woff2`.
- **Why:** No brotli anywhere; `gzip_types` omits SVG/JSON/RSS/manifest, so `logo.svg`, `/rss.xml`, JSON responses ship uncompressed. (JS/CSS are already gzipped, so brotli is ~15–20% incremental.)
- **Risk:** low (brotli requires the module to be available in the nginx image — check the base image).

### 3.4 Recompress `og-image.png` (356 KB → <100 KB) `[S]` · impact **low**
- **Files:** `frontend/public/og-image.png`.
- **Change:** Recompress with pngquant/oxipng, or export an optimized ~1200×630 PNG.
- **Why:** 364,809 bytes; only referenced in OG/Twitter meta (no on-page `<img>`), so it affects social-unfurl fetch time, not visitor LCP.
- **Risk:** none.

### 3.5 Gate the startup service-worker unregister behind a one-time flag `[S]` · impact **low**
- **Files:** `frontend/src/main.tsx:8-18`.
- **Change:** The SW-unregister + `caches.delete` migration cleanup runs on **every** load. Gate it behind a one-time `localStorage` flag (or remove once the old SW is gone from the field).
- **Why:** Dead weight running indefinitely (async + cheap, so low priority).
- **Risk:** none.

---

## 6. Phase 4 — Structured-data hardening

### 4.1 Fix fabricated Article dates `[M]` · impact **med**
- **Files:** `frontend/src/utils/seo.ts:128,148`; the 8 pages calling `generateArticleSchema`.
- **Change:** 8 pages emit a hardcoded `datePublished: "2024-01-01"` (default at `seo.ts:128`) and a `dateModified` computed via `new Date()` at render time (`seo.ts:148`) — which resolves to the **crawl date**. Add real per-page `datePublished`/`dateModified` constants (mirror the blog front-matter pattern) and thread them through. Remove the `"2024-01-01"` default and the runtime `new Date()` — require an explicit param. Also add `image` + `url`/`mainEntityOfPage` to `ArticleSchema` (matching `BlogPostingSchema`).
- **Affected callers:** `WhatIsLearningDecay.tsx:10`, `UseCases.tsx:91`, `SkillDecayFormula.tsx:17`, `Comparisons.tsx:94`, `LearningVsPractice.tsx:17`, `compare/Anki.tsx:17`, `compare/Notion.tsx:17`, `compare/Obsidian.tsx:17`.
- **Verify:** each Article emits a real, stable published date.
- **Risk:** none (pure data).

### 4.2 Consolidate duplicate JSON-LD `[M]` · impact **med**
- **Files:** `frontend/index.html:66-108`, `Landing.tsx:49-53`, `Features.tsx:16`.
- **Change:** `index.html` statically emits WebSite + Organization + SoftwareApplication (present on every route); `Landing.tsx` re-emits all three and `Features.tsx` re-emits SoftwareApplication → duplicate entity nodes, and SoftwareApplication leaks onto blog/FAQ routes. Pick one source of truth. **Cleanest:** remove the 3 static blocks from `index.html`, let `Landing.tsx` own sitewide schema (route-scoped, stays accurate). Ensure SoftwareApplication only appears on product-relevant routes.
- **⚠️ Interaction with Phase 2:** once prerendering lands, the per-route helmet JSON-LD is baked into each page's HTML — decide the single source *after* choosing the prerender approach so you don't double-emit.
- **Risk:** low (Google tolerates duplicates, but it muddies the entity graph).

### 4.3 Add Product/Offer schema to Pricing + fix the "free USD" claim `[S]` · impact **med**
- **Files:** `frontend/src/pages/Pricing.tsx`, `frontend/src/utils/seo.ts:86-90`, `frontend/index.html:92-96`.
- **Change:** Add a Product (or SoftwareApplication+Offer) schema to `Pricing.tsx` built from the fetched lifetime price, `priceCurrency: "AZN"`. **⚠️ Guard the async/null case** — price is fetched in a `useEffect` (`Pricing.tsx:28-33`) and is `null` on first render; only emit the Offer when price is present. Separately, the sitewide SoftwareApplication hardcodes `price "0" USD` (`seo.ts:86-90`, `index.html:92-96`) which contradicts the paid PRO tier — model both the free tier and the paid offer, or stop asserting a bare free-USD price.
- **Risk:** low.

### 4.4 Add BreadcrumbList to `compare/*` and content articles `[S]` · impact **low**
- **Files:** `compare/Anki.tsx:17`, `compare/Notion.tsx:17`, `compare/Obsidian.tsx:17`; `UseCases.tsx`, `SkillDecayFormula.tsx`, `Comparisons.tsx`, `LearningVsPractice.tsx`, `WhatIsLearningDecay.tsx`.
- **Change:** Add `generateBreadcrumbSchema` (already exists, `seo.ts:228`) to their `structuredData` arrays. `Blog.tsx:20` and `BlogPost.tsx:53` already do this — follow the pattern.
- **Risk:** none (reuses an existing generator).

### 4.5 Add `author.url` to Article schema `[S]` · impact **low**
- **Files:** `frontend/src/utils/seo.ts:54-57,135-138`.
- **Change:** Add a `url` to the Article `author` object, aligning with BlogPosting which already includes it (`seo.ts:161,216`).
- **Risk:** none.

### 4.6 (Deferred) `aggregateRating` — only with real ratings.
- **Do NOT fabricate.** Add to SoftwareApplication schema only once genuine user ratings exist. Future opportunity, not now.

---

## 7. Phase 5 — Content engine `[L]` · impact **high** (ongoing)

Content is the real growth driver. Technical fixes raise the ceiling; content fills the room.

### 5.1 Topic clusters (hub-and-spoke)
- **Pillar hub:** designate `WhatIsLearningDecay.tsx` as the "skill decay" pillar; add a *"Deep dives / More on skill decay"* section linking down to each spoke as it ships, and every spoke links back. (Today `WhatIsLearningDecay` "Related Reading" only links laterally to `/skill-decay-formula` and `/learning-vs-practice`.)
- **Spokes** (each a new `.md` in `src/content/blog/`, auto-wired by `build-content.mjs`):
  1. *Streaks Measure Attendance, Not Skill* (split from existing draft) — **1.9**
  2. *Modeling Skill Decay in ~40 Lines of Python* (split from existing draft) — **1.9**
  3. *Skill Atrophy: Why Professional Skills Fade* — "skill atrophy" has **zero** coverage today
  4. *How Fast Do Programming Skills Decay?*
  5. *Spaced Repetition for Skills (Not Just Flashcards)* — no dedicated page today
  6. *Retrieval Practice for Developers*
  7. *How to Escape Tutorial Hell (with Data)*
  8. *The Input/Output Ratio That Predicts Retention*
  9. *Refresh Rusty Skills Before a Technical Interview*
  10. *Keeping a Language Sharp Between Jobs*
  11. *Ebbinghaus in Practice: Spacing Intervals That Actually Work*
- **Cadence:** commit to ~1 post every 1–2 weeks; batch-draft 4–6 up front. Target 12–15 posts this quarter.

### 5.2 Related-posts / "read next" module on BlogPost `[S]` · impact **med**
- **Files:** `frontend/src/pages/BlogPost.tsx`, `frontend/src/utils/blog.ts` (add `getRelatedPosts`).
- **Change:** Surface 2–3 other posts (by shared tag → fallback most-recent) + a link to the matching pillar. Becomes essential once 5+ posts exist. (`blog.ts` currently exports only `posts`, `getPost`, `getPostBody`.)
- **Risk:** none (additive).

### 5.3 Contextual `/pricing` links from high-intent pages `[S]` · impact **low**
- **Files:** `Comparisons.tsx` (CTA ~line 313/320), `UseCases.tsx` (CTA ~line 225).
- **Change:** Add a "See plans and pricing" link — today no pillar/content page links to `/pricing` (it lives only in `PublicHeader.tsx:15`).
- **Risk:** none.

### 5.4 Programmatic per-technology decay pages `[L]` · impact **high** *(depends on Phase 2)*
- **Files:** new `src/pages/skill-decay/[tech].tsx` components + `App.tsx` routes + `STATIC_ROUTES` in `build-content.mjs` + `RouteTracker` `PUBLIC_ROUTES`.
- **Change:** `/skill-decay/react`, `/python`, `/sql`, … each templated with that skill's decay rate (the model already defines Slow 0.005 / Default 0.02 / Fast 0.05 with example techs in `SkillDecayFormula.tsx:115-118`) + a worked freshness example + register CTA. Targets long-tail "does React decay / how fast do I forget X" queries.
- **⚠️ Critical caveat:** each page needs a **real React component AND an `App.tsx` route AND a `STATIC_ROUTES` entry** — a sitemap entry alone renders an empty shell on this SPA. **Do this after Phase 2 (prerendering)** or the programmatic pages are thin JS shells at risk of soft-404 / thin-content penalties. Keep each page genuinely content-rich.
- **Risk:** medium (thin-content risk if rushed).

---

## 8. Phase 6 — AI / GEO discoverability

Most of the AI-crawler visibility problem is **solved by Phase 2** (prerendering makes content readable to non-JS AI bots). These are the incremental extras.

### 6.1 Add `llms.txt` `[S]` · impact **med** *(speculative but cheap)*
- **Files:** `frontend/public/llms.txt` (optionally emitted from `build-content.mjs`).
- **Change:** Concise Markdown: what SkillFade is + key concepts (skill decay, freshness score, learning vs practice, input/output balance) + canonical marketing/blog URLs.
- **Note:** emerging convention, unproven ranking benefit — rank below prerender/OG fixes.
- **Risk:** none.

### 6.2 Per-page OG image generation `[M]` · impact **med**
- **Files:** `frontend/scripts/og-template.html` (currently a hardcoded one-off, not referenced by any build script), `build-content.mjs`.
- **Change:** Parameterize `og-template.html` + `build-content.mjs` to emit one PNG per blog post / comparison. Fixes Slack/Discord/LinkedIn/Twitter + AI-preview cards with per-page imagery.
- **Risk:** low.

### 6.3 Explicit AI-crawler policy in robots.txt `[S]` · impact **low**
- **Files:** `frontend/public/robots.txt`.
- **Change:** Optionally add named `User-agent` groups (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Amazonbot) with `Allow: /`.
- **Note:** `User-agent: * / Allow: /` **already permits these bots** — this is a signaling nicety, not a fix. Low impact.
- **Risk:** none (don't accidentally *block* anything).

### 6.4 Organization `sameAs` entity links `[S]` · impact **med** *(blocked — see D2)*
- **Files:** `frontend/index.html` Organization block, `seo.ts` `generateOrganizationSchema`.
- **Change:** Populate `sameAs` with real canonical external profiles (GitHub, X, LinkedIn).
- **⚠️ Blocked:** the repo contains **no** real GitHub/social URL (`FAQ.tsx:37` claims MIT/open-source in prose with no repo link). **Do not fabricate.** Needs decision D2.

---

## 9. Phase 7 — Broken promises + doc hygiene

### 7.1 Add a Terms of Service page `[M]` · impact **low**
- **Files:** new `src/pages/Terms.tsx` + `/terms` route in `App.tsx` + `STATIC_ROUTES` + link from `PublicFooter`.
- **Why:** Promised in the old plan (§5.5), footer references it, and payments are now live — a trust/legal gap. Privacy shipped; Terms did not.
- **Risk:** none (needs legal copy — see D3).

### 7.2 Add the 3 missing comparison pages `[L]` · impact **med** *(depends on Phase 2)*
- **Files:** `compare/Habitica.tsx`, `compare/RemNote.tsx`, `compare/Duolingo.tsx` + routes + `STATIC_ROUTES` + `RouteTracker` `PUBLIC_ROUTES`.
- **Why:** Old plan promised 6 comparison pages; only 3 exist (Anki/Notion/Obsidian). Each targets a distinct "vs" keyword. Same prerender/thin-content caveat as §5.4.
- **Risk:** medium (thin-content if rushed).

### 7.3 Fix the FAQ "free, no premium tiers" copy `[S]` · impact **low**
- **Files:** `frontend/src/pages/FAQ.tsx:37`.
- **Change:** `FAQ.tsx:37` claims the app is "free … no premium tiers", which **conflicts with the now-live Lifetime PRO payments**. Update the copy.
- **Risk:** none (content accuracy).

### 7.4 Harden the soft-404 `[M]` · impact **low**
- **Files:** `frontend/nginx.prod.conf:43`, optional `dist/404.html`.
- **Change:** SPA `try_files … /index.html` returns **HTTP 200** for unknown URLs; the `*` route renders `NotFound` (noindexed, good) but the status stays 200. To return a real 404: maintain an nginx `location` allowlist of valid public paths that fall through to `index.html`, and `error_page 404` everything else to a real `dist/404.html`.
- **⚠️ Caveat:** `error_page 404` will **not** fire while `/index.html` remains the `try_files` fallback (nginx always finds it → 200). The allowlist restructuring is mandatory. Low urgency; Phase 2 prerendering also helps here.
- **Risk:** medium (mis-scoped allowlist could 404 real routes).

### 7.5 Sitemap `lastmod` freshness `[S]` · impact **low**
- **Files:** `frontend/scripts/build-content.mjs:31-44`.
- **Change:** Static routes carry frozen `2026-05-14/15` `lastmod`. Either derive from each page file's git mtime at build, or drop `lastmod` for static routes (Google largely ignores unreliable `lastmod`). Blog entries already derive real dates.
- **Risk:** none.

### 7.6 Update the stale `SEO_AND_ANALYTICS_PLAN.md` `[S]` · impact **low**
- **Files:** `SEO_AND_ANALYTICS_PLAN.md`.
- **Change:** It still says "Status: Plan — not yet executed" though most of Weeks 1–3 shipped, and every URL uses the **dead domain `skillfade.app`** (code/robots/sitemap all use `skillfade.website`), and references the old Inter font (now Fraunces/Hanken/IBM Plex). Add a "Status: Implemented" delta + global-replace `skillfade.app` → `skillfade.website`, so future audits don't re-flag done work.
- **Risk:** none (doc only).

### 7.7 (Optional) App-shell `noindex` backstop `[S]` · impact **low**
- **Files:** `frontend/src/components/Layout.tsx`.
- **Change:** Render a `noIndex <SEO>` inside `Layout.tsx` (wraps protected routes) as belt-and-suspenders, since app pages currently rely solely on robots.txt Disallow.
- **Risk:** none.

---

## 10. Decisions I need from you (some steps are blocked)

| # | Decision | Blocks | My recommendation |
|---|----------|--------|-------------------|
| **D1** | Prerendering approach: **`vite-react-ssg`** (cleaner, bigger refactor) vs **`react-snap`/puppeteer** (lower code, hackier)? | Phase 2 | `vite-react-ssg` — reuses your existing route list; cleaner static output |
| **D2** | Do you have **real public profiles** (GitHub repo, X, LinkedIn) for `sameAs`? Is SkillFade actually open-source (FAQ says MIT)? | 6.4 | Provide URLs, or we skip `sameAs` (never fabricate) |
| **D3** | **Terms of Service** — do you have copy / a template, or should I draft a starting point for your review? | 7.1 | I draft a generic starting point; you get it reviewed |
| **D4** | Does **`www.skillfade.website`** resolve in DNS? Should we enforce a canonical host (www↔apex 301)? | part of 1.8 | If www doesn't resolve, skip the redirect; still add HSTS on apex |
| **D5** | **Content** — do you want me to draft the blog posts (§5.1), or will you write them? | Phase 5 | I draft; you edit for voice/accuracy |
| **D6** | Batch **Phase 1** as one PR, or land items individually? | Phase 1 | One PR — they're all small & independent |

---

## 11. "Done" verification checklist

- [ ] `sitemap.xml` includes `/pricing`; regenerated (not hand-edited).
- [ ] Interior pages emit **absolute** `og:image`; social debuggers show correct per-page cards.
- [ ] No title contains "SkillFade" twice; all titles ≤ ~60 chars; all descriptions ≤ ~155.
- [ ] `robots.txt` simplified; `/reports` + `/billing` disallowed; HSTS header present on apex.
- [ ] **Prerendered HTML** for a blog post / compare page shows real title/description/JSON-LD via `curl` (no JS).
- [ ] Marketing landing JS payload cut >50%; recharts in its own chunk; fonts self-hosted + preloaded.
- [ ] Article schema emits real, stable `datePublished`; no duplicate WebSite/Organization/SoftwareApplication nodes; Pricing has a valid Offer (AZN, null-guarded).
- [ ] Existing draft published as ≥2 on-site posts; pillar hub links to spokes.
- [ ] `llms.txt` present; per-page OG images generated.
- [ ] Google Rich Results Test passes for FAQ, a blog post, and a compare page.
- [ ] `SEO_AND_ANALYTICS_PLAN.md` marked implemented; `skillfade.app` → `skillfade.website`.

---

*Full raw audit (42 verified findings with file:line evidence + verify notes) is available on request — this plan is the deduplicated, prioritized distillation.*
