# SkillFade — SEO & Analytics Implementation Plan

> **Goal:** Make SkillFade rank on the first page of Google for high-intent keywords ("skill decay tracker", "forgetting curve app", "learning retention tool"), connect Google Search Console + Google Analytics, and lay the long-term SEO foundation.
>
> **Read first:** [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — this plan extends it. Some items below intentionally relax the project's "no third-party analytics" rule; that trade-off is discussed in §0.

---

## Table of Contents
0. [Privacy Trade-off Decision](#0-privacy-trade-off-decision)
1. [Current State Audit](#1-current-state-audit)
2. [Phase 1 — Google Search Console Setup](#2-phase-1--google-search-console-setup)
3. [Phase 2 — Google Analytics 4 Setup](#3-phase-2--google-analytics-4-setup)
4. [Phase 3 — Technical SEO Foundation](#4-phase-3--technical-seo-foundation)
5. [Phase 4 — On-Page SEO](#5-phase-4--on-page-seo)
6. [Phase 5 — Keyword Strategy](#6-phase-5--keyword-strategy)
7. [Phase 6 — Content Marketing Roadmap](#7-phase-6--content-marketing-roadmap)
8. [Phase 7 — Footer Overhaul](#8-phase-7--footer-overhaul)
9. [Phase 8 — Comparison Pages Expansion](#9-phase-8--comparison-pages-expansion)
10. [Phase 9 — Off-Page SEO & Backlinks](#10-phase-9--off-page-seo--backlinks)
11. [Phase 10 — Performance & Core Web Vitals](#11-phase-10--performance--core-web-vitals)
12. [Phase 11 — Structured Data Expansion](#12-phase-11--structured-data-expansion)
13. [Phase 12 — Local & Multi-Language SEO (Future)](#13-phase-12--local--multi-language-seo-future)
14. [Execution Checklist](#14-execution-checklist)
15. [KPIs & Success Metrics](#15-kpis--success-metrics)
16. [Tools & Resources](#16-tools--resources)

---

## 0. Privacy Trade-off Decision

**DECISION (2026-05-14):** ✅ **Option A confirmed — Google Search Console + Google Analytics 4.**

Scope clarification from the project owner:
- **GA4 use case:** Traffic volume + geographic distribution (countries) only. **No custom events, no funnels, no conversion tracking.**
- **GSC verification method:** HTML meta tag in `index.html` (Method C).

### Implications to address during implementation
- `PROJECT_CONTEXT.md` line 893 still says **"No third-party analytics (no Google Analytics, Mixpanel, etc.)"** — this rule must be updated to reflect the new reality.
- A cookie consent banner is still required for GDPR/CCPA compliance because GA4 sets cookies by default. Even if you don't use the event data, the browser still receives identifiers.
- A `/privacy` page disclosing GA4 use must be added.
- Tracking should still be scoped to **public marketing pages only** — never fire GA on `/dashboard`, `/skills`, `/analytics`, `/settings`, `/support`, or `/admin`. The "calm mirror" brand promise stays intact inside the app.

### Sections that drop out of scope given the no-events decision
- §3.3 "Custom events to track" — **skipped**.
- §15.2 conversion-rate KPIs — **skipped**. Only basic GA4 reports (sessions, users, geography) will be monitored.

### Sections still in scope
- §3.1, §3.2 GA4 property + base implementation (page views only).
- §3.4–§3.5 file scaffolding for analytics + consent banner + privacy page.
- All other phases (technical SEO, content, footer, comparisons) are independent of this decision.

---

## 1. Current State Audit

### What's already in place ✅
- `frontend/index.html` has solid baseline meta tags, Open Graph, Twitter Card, and three JSON-LD blocks (WebSite, Organization, SoftwareApplication).
- `frontend/src/components/SEO.tsx` — reusable `<SEO />` component using `react-helmet-async`.
- `<HelmetProvider>` wired in `App.tsx`.
- Public-facing SEO pages exist: `/`, `/features`, `/faq`, `/what-is-learning-decay`, `/use-cases`, `/comparisons`.
- Multi-column footer with Product/Learn/Philosophy/Legal/Account columns on `Landing.tsx`.

### What's missing ❌
- No `robots.txt` in `frontend/public/`.
- No `sitemap.xml` (static or generated).
- No `og-image.png` (referenced in meta tags but file doesn't exist in `public/`).
- No `logo.svg` at the path referenced by structured data (`https://skillfade.app/logo.svg`).
- No Google Search Console verification.
- No Google Analytics / Plausible / Umami integration.
- No per-page `<SEO />` usage audit — some pages may rely only on the static `<title>`.
- No canonical URLs declared per route.
- No `hreflang` (not needed yet — single language).
- No breadcrumb structured data.
- No FAQ structured data on `/faq` page.
- No `Article` structured data on `/what-is-learning-decay`.
- No `last-modified` headers on static HTML.
- Comparison page is a single route — no dedicated landing pages per competitor (low-keyword-coverage).
- No internal linking strategy mapped out.

---

## 2. Phase 1 — Google Search Console Setup

### 2.1 Prerequisites
- A live production URL (the meta tags point to `https://skillfade.app/` — confirm DNS resolves and HTTPS is enabled).
- Access to DNS settings (for domain-level verification — preferred) **OR** ability to upload a file to `public/` (for URL-prefix verification).

### 2.2 Verification method — Meta tag (confirmed approach) ✅

This is the chosen method. URL-prefix property is sufficient since SkillFade only serves the apex domain over HTTPS.

#### Step-by-step
1. Visit https://search.google.com/search-console.
2. Click **Add Property → URL prefix**.
3. Enter `https://skillfade.app/` (use exactly the protocol and trailing slash you serve).
4. Under verification methods, expand **HTML tag**. Google shows a tag like:
   ```html
   <meta name="google-site-verification" content="ABCdef123XYZ..." />
   ```
5. Copy the `content` value.
6. Open `frontend/index.html` and add the meta tag inside `<head>`, immediately after the existing meta tags (around line 13, after the `description` meta). Example:
   ```html
   <!-- Google Search Console verification -->
   <meta name="google-site-verification" content="PASTE_CODE_HERE" />
   ```
7. Commit and deploy to production. The file is static, served by Nginx from `frontend/dist/`.
8. After deploy, verify the tag is live:
   ```bash
   curl -s https://skillfade.app/ | grep google-site-verification
   ```
9. Back in Search Console, click **Verify**. Verification is usually instant once Google sees the tag.

#### Notes
- The meta tag must remain in `index.html` permanently. Removing it un-verifies the property.
- If you ever rotate environments (staging/production), the same tag works as long as both serve the same domain. For staging on a different domain, register a separate property.
- For better long-term coverage, you can later **also** add the DNS TXT method to claim the Domain property (which covers subdomains). Not required now.

#### Alternative verification methods (not chosen, kept for reference)
- DNS TXT record (covers all subdomains, requires DNS access).
- HTML file upload (downloads `google<code>.html` to drop into `frontend/public/`).

### 2.3 Post-verification actions
1. **Submit sitemap** at Search Console → Sitemaps → enter `https://skillfade.app/sitemap.xml`. (Create the sitemap first; see §4.2.)
2. **URL Inspection** — paste each public URL and click **Request indexing**. Pages to submit:
   - `/`, `/features`, `/faq`, `/what-is-learning-decay`, `/use-cases`, `/comparisons`.
3. **Set preferred domain** — under Settings, set `https://skillfade.app` as canonical (no `www`).
4. **Link Search Console with Google Analytics** — Settings → Associations → link to the GA4 property created in Phase 2.
5. **Configure email alerts** — Settings → Users and permissions → add an alert email for indexing errors.

### 2.4 Files to modify/create
- `frontend/public/google<verification>.html` (only if using Method B)
- `frontend/index.html` (only if using Method C)

---

## 3. Phase 2 — Google Analytics 4 Setup (Page Views Only)

**Scope:** Minimal GA4 — page views, sessions, geography. **No custom events.** This is the simplest possible integration and the smallest possible footprint.

### 3.1 Create GA4 property
1. Visit https://analytics.google.com.
2. Admin → Create Property → name: `SkillFade`, set time zone + currency.
3. Add a **Web data stream**:
   - Website URL: `https://skillfade.app`
   - Stream name: `SkillFade Web`
   - **Leave "Enhanced measurement" ON** — this automatically tracks page views, scrolls, outbound clicks, and file downloads without any custom code from you. Sufficient for traffic + geography.
4. Copy the **Measurement ID** (`G-XXXXXXXXXX`).

### 3.2 Reports you will use (the only ones)
- **Reports → Realtime** — see live visitors.
- **Reports → Acquisition → Traffic acquisition** — where traffic comes from (organic, direct, referral).
- **Reports → Demographics → Demographic details → Country** — country-by-country breakdown. ✅ This is the report you specifically asked for.
- **Reports → Engagement → Pages and screens** — which pages get the most views.

Ignore everything else in GA4 — there's no event configuration to do.

### 3.3 Implementation — simplest possible

You have two install options. Pick **Option 1** unless you have a reason to need React-aware tracking.

#### Option 1 — Plain `gtag.js` snippet in `index.html` (simplest, recommended)
This is what Google's GA4 setup wizard suggests. No npm install, no React code, no route-tracker needed because page views are SPA-aware via Enhanced Measurement's "Page changes based on browser history events" toggle (ON by default).

Add to `frontend/index.html` `<head>`, immediately after the GSC verification meta tag:
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    anonymize_ip: true,
    send_page_view: false
  });
</script>
```

Then in `App.tsx`, add a tiny `RouteTracker` that fires page views **only on public routes** (so the app's authenticated pages stay private):
```tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PUBLIC_ROUTES = ['/', '/home', '/features', '/faq', '/what-is-learning-decay', '/use-cases', '/comparisons', '/login', '/register', '/forgot-password', '/reset-password', '/privacy', '/terms'];

const RouteTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!PUBLIC_ROUTES.includes(pathname)) return;
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', { page_path: pathname });
  }, [pathname]);
  return null;
};
```
Mount `<RouteTracker />` inside `<BrowserRouter>` in `App.tsx`.

> Why `send_page_view: false` in `gtag('config', ...)`? Because we manually fire `page_view` from `RouteTracker` only on whitelisted routes. Otherwise GA's auto-page-view would fire on every route including `/dashboard`, `/skills/*`, etc.

#### Option 2 — `react-ga4` package (only if you prefer typed React API)
```bash
cd frontend && npm install react-ga4
```
Slightly cleaner React-side, but adds a dependency for what is essentially three lines of `gtag()`. Stick with Option 1 unless there's a clear reason.

### 3.4 Cookie consent banner (required)
GA4 sets cookies, so GDPR/CCPA compliance requires consent. Even with `anonymize_ip: true`, the consent gate is mandatory for EU traffic.

- Create `frontend/src/components/CookieBanner.tsx`:
  - Bottom-of-screen calm banner (matches site design — no red, no aggressive copy).
  - Two buttons: **"Accept"** (sets `localStorage.analytics_consent = 'granted'`) and **"Decline"** (sets `'denied'`).
  - Banner hides once a choice is made.
- The `gtag('config', ...)` call should use Google Consent Mode v2:
  ```js
  gtag('consent', 'default', { analytics_storage: 'denied' });
  // After user clicks Accept:
  gtag('consent', 'update', { analytics_storage: 'granted' });
  ```
- Show the banner only on public routes (consistent with the tracking scope).

### 3.5 Privacy disclosure
- Create `frontend/src/pages/Privacy.tsx` covering: what data is collected (page URL, country, browser/OS, referrer), why (traffic insight only), retention (default 14 months in GA4), no cross-site tracking, link to opt-out (set `analytics_consent='denied'` via the banner or `/settings`).
- Add `/privacy` route in `App.tsx`.
- Link to it from the footer (see §8) and from the cookie banner.
- Update `Settings.tsx` privacy statement to disclose GA4 use.
- Update `PROJECT_CONTEXT.md` line 893 — remove the "no third-party analytics" claim or rephrase as "Analytics limited to anonymous page views on public marketing pages; never tracked inside the app".

### 3.6 Files to create
- `frontend/src/components/CookieBanner.tsx` — consent UI + Consent Mode v2 calls
- `frontend/src/components/RouteTracker.tsx` — fires page views on whitelisted public routes only
- `frontend/src/pages/Privacy.tsx` — privacy policy

### 3.7 Files to modify
- `frontend/index.html` — paste `gtag.js` snippet (and GSC meta tag from §2)
- `frontend/src/App.tsx` — mount `<RouteTracker />` and `<CookieBanner />`
- `frontend/src/pages/Settings.tsx` — disclose GA in privacy statement
- `PROJECT_CONTEXT.md` line 893 — update the analytics rule

### 3.8 Verification after deploy
1. Open https://skillfade.app/ in an incognito window, accept cookies in the banner.
2. In GA4, open **Reports → Realtime** — you should appear as a live user within 30 seconds.
3. Click a few public pages → confirm each appears as a separate page view in the Realtime "Page path" table.
4. Navigate to `/login` → page view fires. Navigate to `/dashboard` after logging in → **no** page view should fire (verify in Realtime).
5. Wait 24–48 hours, then check **Demographics → Country** to confirm geographic data populates.

---

## 4. Phase 3 — Technical SEO Foundation

### 4.1 `robots.txt`
Create `frontend/public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /skills
Disallow: /analytics
Disallow: /settings
Disallow: /support
Disallow: /admin
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password

Sitemap: https://skillfade.app/sitemap.xml
```
Rationale: Marketing routes are crawlable; authenticated routes return SPA shell with no meaningful content for indexing.

### 4.2 `sitemap.xml`
Create `frontend/public/sitemap.xml` (static for now; switch to generation when content grows past ~30 pages):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://skillfade.app/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://skillfade.app/features</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://skillfade.app/faq</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://skillfade.app/what-is-learning-decay</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://skillfade.app/use-cases</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://skillfade.app/comparisons</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>
```
**Future:** Generate via a Vite plugin or pre-build script (e.g., `vite-plugin-sitemap`) when blog/dynamic pages exist.

### 4.3 Canonical URLs
- Every public page must set `<link rel="canonical" href="https://skillfade.app/<path>" />` via the `<SEO />` component.
- Audit all six public pages and ensure `canonicalUrl` prop is passed.

### 4.4 Open Graph image
- Design `og-image.png` (1200×630 px) — referenced in meta tags but file missing.
- Place at `frontend/public/og-image.png`.
- Include: SkillFade logo, tagline "A mirror, not a coach", subtle gradient background matching brand.
- Tools: Figma, Canva, or `og-image.vercel.app` for templated generation.

### 4.5 Logo asset
- Create `frontend/public/logo.svg` (referenced in Organization JSON-LD).
- Reuse the gradient mark from `LogoIcon.tsx`.

### 4.6 HTTPS, redirects, and trailing slashes
- Confirm Nginx config (`/nginx/`) forces HTTPS redirect.
- Pick one canonical form: `https://skillfade.app/path` (no trailing slash) and 301-redirect alternatives.
- Confirm www → apex redirect (or vice versa).

### 4.7 404 page
- Currently `App.tsx` line 216 catches `*` and redirects to `/`. Replace with a real `<NotFound />` page that returns HTTP 404 server-side and has SEO-friendly content ("Skill decay tracker — page not found, here's what you might be looking for…").
- For SPA, the server (Nginx) must serve 404 with the SPA shell for unknown routes that don't match the SPA's known marketing paths, OR keep client-side redirect but accept that Google sees a soft-404.

### 4.8 Files to create
- `frontend/public/robots.txt`
- `frontend/public/sitemap.xml`
- `frontend/public/og-image.png`
- `frontend/public/logo.svg`
- `frontend/src/pages/NotFound.tsx`

---

## 5. Phase 4 — On-Page SEO

### 5.1 Audit current page `<SEO />` usage
Run `grep -rn "<SEO" frontend/src/pages/` and confirm every public page uses it. Add where missing. Each call should set:
- `title` — unique, 50–60 chars, keyword-front-loaded.
- `description` — unique, 140–160 chars, includes primary keyword + value prop.
- `canonicalUrl` — full URL.
- `structuredData` — page-appropriate schema (see §12).

### 5.2 Title & description matrix

| Route | Title | Description |
|---|---|---|
| `/` | `SkillFade — Skill Decay Tracker for Self-Directed Learners` | `Track skill decay, practice gaps, and learning balance. A calm productivity tool for developers and self-directed learners. Free and open source.` |
| `/features` | `Features — Skill Freshness, Decay Alerts, Analytics \| SkillFade` | `See every SkillFade feature: freshness scores, custom decay rates, practice gap alerts, balance ratio analytics, and more. No gamification.` |
| `/faq` | `Frequently Asked Questions \| SkillFade` | `Answers to common questions about skill decay tracking, the forgetting curve, privacy, self-hosting, and the SkillFade philosophy.` |
| `/what-is-learning-decay` | `What is Learning Decay? The Forgetting Curve Explained` | `Learning decay is the gradual loss of unused knowledge over time. Understand the Ebbinghaus forgetting curve and how to fight skill fade.` |
| `/use-cases` | `Use Cases — Who Uses SkillFade and Why` | `From developers maintaining tech stacks to career switchers, see real use cases for tracking skill decay and practice scarcity.` |
| `/comparisons` | `SkillFade vs Anki, Notion, Habitica — Compared` | `How SkillFade compares to Anki, Notion, Habitica, RemNote, and other learning tools. A calm mirror vs gamified coaches.` |

### 5.3 H1/H2/H3 hierarchy audit
- Every page must have exactly one `<h1>`.
- `<h1>` must contain the primary keyword for that page.
- `<h2>`s should map to long-tail variations.
- Don't skip levels (no `<h1>` → `<h3>`).

### 5.4 Internal linking
- Landing → Features, Use Cases, Comparisons, What is Learning Decay.
- Features → Use Cases (deep links to relevant use case sections).
- What is Learning Decay → Features (spaced repetition / decay rate sections), Use Cases.
- Use Cases → Comparisons, Features.
- Comparisons → Features, FAQ.
- Footer present on every public page.
- Use **descriptive anchor text** ("see how skill freshness is calculated") not "click here".

### 5.5 New pages to add for SEO surface area
1. `/privacy` — Privacy Policy (required if GA4 enabled; also good for trust).
2. `/terms` — Terms of Service.
3. `/blog` — Blog index (see §7).
4. `/blog/<slug>` — Individual blog posts.
5. `/skill-decay-formula` — Deep technical page explaining the freshness algorithm.
6. `/learning-vs-practice` — Pillar page covering the input/output balance concept.

### 5.6 Image SEO
- Every `<img>` needs descriptive `alt` text (audit with `grep -rn "<img" frontend/src/`).
- Use `loading="lazy"` for below-the-fold images.
- Serve WebP with PNG fallback for og-image, hero images, screenshots.

### 5.7 Mobile usability
- Run Google's [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) on every page after deploy.
- Search Console → Mobile Usability report — monitor weekly.

---

## 6. Phase 5 — Keyword Strategy

### 6.1 Primary keywords (high intent, medium volume, ranking targets)
| Keyword | Monthly volume (est.) | Difficulty | Target page |
|---|---|---|---|
| skill decay tracker | 50–100 | Low | `/` |
| forgetting curve app | 100–300 | Low | `/what-is-learning-decay` |
| learning retention tool | 200–500 | Medium | `/features` |
| skill fade tracking | 10–50 | Very low | `/` |
| spaced repetition for skills | 300–700 | Medium | `/what-is-learning-decay` |
| learning vs practice tracker | 50–100 | Low | `/use-cases` |
| productivity tool no gamification | 100–300 | Medium | `/` |

### 6.2 Secondary keywords (long-tail)
- "how to prevent forgetting what you learned"
- "track skill freshness over time"
- "alternative to anki for skills"
- "minimalist learning tracker"
- "privacy-first learning app"
- "self-hosted productivity tool"
- "input output balance learning"
- "ebbinghaus forgetting curve calculator"
- "skill atrophy tracking software"

### 6.3 Comparison keywords (capture competitor traffic)
- "skillfade vs anki"
- "skillfade vs notion learning"
- "skillfade vs obsidian"
- "skillfade vs habitica"
- "skillfade vs remnote"
- "skillfade vs daily.dev"
- "anki vs skillfade"

### 6.4 Persona/audience keywords
- "learning tracker for developers"
- "skill tracker for designers"
- "learning tracker for career switchers"
- "knowledge worker retention tool"

### 6.5 Keyword research tools (free)
- Google Search Console "Performance" tab (after data accumulates)
- Google Trends — validate seasonality
- Google autocomplete — pull from search bar
- AnswerThePublic — free tier
- Ubersuggest — limited free queries
- Reddit search — find real questions users ask in r/learning, r/getmotivated, r/productivity

### 6.6 Keyword placement rules
- Primary keyword: page title, H1, first 100 words, URL slug, image alt text, meta description.
- Secondary keywords: H2s, body copy (naturally), internal link anchors.
- Aim for ~1% keyword density — never stuff.

---

## 7. Phase 6 — Content Marketing Roadmap

### 7.1 Blog infrastructure
- Create `/blog` route + `/blog/:slug` dynamic route.
- Markdown-based content in `frontend/src/blog/*.md`, loaded via Vite's `?raw` or a static site generator approach.
- Each post: title, description, slug, date, hero image, structured data (`Article`), reading time.
- Add `<link rel="alternate" type="application/rss+xml" href="/rss.xml" />` for RSS readers.

### 7.2 Pillar + cluster content model
Each pillar page targets a broad keyword and links to cluster posts targeting long-tail variants.

**Pillar 1: "What is Learning Decay?" (already exists)**
Cluster posts:
- "The Ebbinghaus Forgetting Curve, Explained for Developers"
- "How Fast Do You Forget What You Just Learned?"
- "Why Self-Directed Learners Lose Skills (and How to Stop It)"
- "Spaced Repetition vs Practice: Which Works for Skills?"

**Pillar 2: "Learning vs Practice Balance"**
Cluster posts:
- "The Input/Output Balance Most Learners Get Wrong"
- "Why Watching Tutorials Doesn't Make You a Developer"
- "Tracking Your Theory-to-Practice Ratio"

**Pillar 3: "Skill Tracking Methods"**
Cluster posts:
- "5 Ways to Track Skill Decay (And Which One Works)"
- "Manual vs Automatic Skill Tracking"
- "How to Audit Your Tech Stack Quarterly"

**Pillar 4: "Calm Productivity"**
Cluster posts:
- "Why Gamification Backfires for Adult Learners"
- "Productivity Tools Without the Dopamine Trap"
- "The Case for Boring Software"

### 7.3 Publishing cadence
- Weeks 1–4: Publish 1 cornerstone post per week (start with pillars).
- Months 2–6: 2 posts per month, alternating cluster posts and case studies.
- Each post: 1,500–2,500 words, original screenshots, real data, internal links to product pages.

### 7.4 Content distribution
- Cross-post excerpts to dev.to, Hashnode, Medium with canonical link back to SkillFade.
- Share in r/learning, r/productivity, r/getdisciplined (read each subreddit's self-promo rules first).
- Submit pillar posts to Hacker News (Show HN if launching a feature) — once, no spam.
- Newsletter feed via email collection in footer.

---

## 8. Phase 7 — Footer Overhaul

### 8.1 Current state (`Landing.tsx:336-412`)
Four-column footer: Brand+Description+BMC | Product (Use Cases, Comparisons, FAQ) | Learn (What is Learning Decay) + Philosophy badges | Legal (Self-Hosted, Open Source, MIT) + Account.

### 8.2 Proposed expanded footer
Six-column footer (collapses to 2 columns on mobile):

**Column 1 — Brand**
- Logo + name
- Tagline: "A mirror, not a coach"
- Short description (existing)
- BuyMeACoffee link
- Social: GitHub, Twitter/X, RSS

**Column 2 — Product**
- Features
- Use Cases
- Comparisons
- Pricing (even if free, an explicit "Free Forever" page builds trust)
- Roadmap (link to `ROADMAP.md` on GitHub)
- Changelog

**Column 3 — Resources**
- What is Learning Decay?
- Skill Decay Formula
- Learning vs Practice Balance
- Blog
- FAQ

**Column 4 — Compare**
- SkillFade vs Anki
- SkillFade vs Notion
- SkillFade vs Habitica
- SkillFade vs RemNote
- SkillFade vs Obsidian
- See all comparisons

**Column 5 — Company**
- About
- Philosophy
- Privacy Policy
- Terms of Service
- Support
- Contact

**Column 6 — Account**
- Sign Up Free
- Sign In
- Self-Host Guide (link to `docs/VPS_DEPLOYMENT_GUIDE.md`)
- API Docs
- GitHub repo

**Footer bottom row:**
- Left: `© 2026 SkillFade — A mirror, not a coach.`
- Right: Privacy badges (No Tracking, No Cookies if Option B/C, Open Source, MIT License)

### 8.3 SEO benefit
- Internal links to every important page from every page (link equity distribution).
- Crawler discovers all comparison and resource pages from any entry point.
- Descriptive anchor text reinforces keywords (e.g., "Skill Decay Formula", "Learning vs Practice").

### 8.4 Files to modify
- `frontend/src/pages/Landing.tsx` (lines 335–412) — replace footer.
- `frontend/src/pages/Features.tsx` — same footer.
- `frontend/src/pages/FAQ.tsx`, `UseCases.tsx`, `Comparisons.tsx`, `WhatIsLearningDecay.tsx` — same footer.
- **Recommendation:** Extract footer to `frontend/src/components/PublicFooter.tsx` to avoid duplication across all six pages.

---

## 9. Phase 8 — Comparison Pages Expansion

The single `/comparisons` page captures one keyword cluster. Split it into dedicated landing pages — each targets a specific competitor keyword.

### 9.1 New routes
- `/compare/anki` — "SkillFade vs Anki for Skill Tracking"
- `/compare/notion` — "SkillFade vs Notion for Learning Tracking"
- `/compare/habitica` — "SkillFade vs Habitica for Habit and Skill Building"
- `/compare/remnote` — "SkillFade vs RemNote for Knowledge Retention"
- `/compare/obsidian` — "SkillFade vs Obsidian for Learning Notes"
- `/compare/duolingo` — "SkillFade vs Duolingo (Calm vs Gamified)"
- `/compare/coursera-tracking` — "Tracking Coursera Progress with SkillFade"

Keep `/comparisons` as the **index page** linking to all of them with a quick comparison table.

### 9.2 Page structure (each comparison)
1. **H1:** SkillFade vs [Competitor]: Which is right for [audience]?
2. **TL;DR table:** Feature, SkillFade, Competitor, Winner.
3. **When to choose SkillFade** — 3 scenarios.
4. **When to choose [Competitor]** — 3 scenarios (be honest — builds trust).
5. **Detailed feature breakdown** — 5–7 features, side-by-side.
6. **Philosophy section** — calm mirror vs whatever the competitor is.
7. **Migration guide** — "How to move from [competitor] to SkillFade".
8. **FAQ section** — 5 questions answered (also great for FAQ schema).
9. **CTA:** Try SkillFade Free.

### 9.3 Schema markup per comparison page
Use `Product` schema with `review` aggregateRating (your own honest assessment).

### 9.4 Files to create
- `frontend/src/pages/compare/Anki.tsx`
- `frontend/src/pages/compare/Notion.tsx`
- `frontend/src/pages/compare/Habitica.tsx`
- `frontend/src/pages/compare/RemNote.tsx`
- `frontend/src/pages/compare/Obsidian.tsx`
- `frontend/src/pages/compare/Duolingo.tsx`
- Add corresponding routes in `App.tsx`.
- Add sitemap entries.

---

## 10. Phase 9 — Off-Page SEO & Backlinks

### 10.1 Directory submissions (free, one-time)
- Product Hunt — launch when ready, plan the launch (Tuesday 12:01 AM PST optimal).
- BetaList
- AlternativeTo.net — submit as alternative to Anki, Notion, Habitica.
- Startupbase
- SaaSHub
- GetApp / Capterra (free tier)
- IndieHackers Products
- Awesome lists on GitHub (e.g., `awesome-learning`, `awesome-productivity`).

### 10.2 Content-driven backlinks
- Write guest posts for:
  - dev.to (cross-post with canonical)
  - Hashnode personal blog
  - Smashing Magazine (high authority, hard to land)
  - CSS-Tricks (if relevant angle)
- Become quoted source via:
  - HARO (Help a Reporter Out)
  - Qwoted
  - Featured.com
- Sponsor or contribute to learning newsletters (TLDR, Bytes.dev, etc.).

### 10.3 Community engagement (slow, authentic)
- Answer skill-tracking / learning-retention questions on:
  - Reddit (r/learning, r/getmotivated, r/productivity, r/learnprogramming)
  - Quora
  - IndieHackers forums
  - Hacker News comments (only when relevant)
- Always link only when genuinely helpful — avoid spam.

### 10.4 Open source backlinks
- The GitHub repo itself is a high-authority backlink target.
- Cross-link from README.md to skillfade.app.
- Submit to GitHub `awesome-*` lists.

### 10.5 Internal link audit
- Run a crawl with Screaming Frog SEO Spider (free for ≤500 URLs) or Ahrefs Webmaster Tools (free).
- Fix orphan pages (pages with zero internal links pointing to them).

---

## 11. Phase 10 — Performance & Core Web Vitals

Google ranks faster sites higher. Target all three Core Web Vitals "Good" thresholds.

### 11.1 Targets
- **LCP (Largest Contentful Paint):** < 2.5s
- **INP (Interaction to Next Paint):** < 200ms
- **CLS (Cumulative Layout Shift):** < 0.1

### 11.2 Measurement
- Google PageSpeed Insights — run weekly.
- Search Console → Core Web Vitals report.
- WebPageTest.org for waterfall analysis.
- Local: `npm run build && npm run preview` then run Lighthouse.

### 11.3 Optimizations to ship
- **Image optimization:**
  - Convert PNGs/JPGs to WebP.
  - Add explicit `width`/`height` on every `<img>` to prevent CLS.
  - Use `<picture>` with srcset for responsive images.
- **Font optimization:**
  - Inter is loaded from Google Fonts — self-host instead (eliminates third-party round-trip).
  - Use `font-display: swap`.
  - Preload critical font weights: `<link rel="preload" href="..." as="font" crossorigin>`.
- **Code splitting:**
  - Vite already supports route-level splitting. Confirm with `npm run build -- --report`.
  - Lazy-load admin routes (`React.lazy(() => import('./pages/admin/AdminDashboard'))`).
- **Critical CSS:**
  - Above-the-fold CSS inlined; rest deferred.
  - Tailwind's `@apply` and JIT keep output small — confirm bundle stays under 50 KB gzipped CSS.
- **Caching headers:**
  - Nginx: `Cache-Control: public, max-age=31536000, immutable` on hashed assets.
  - HTML: `Cache-Control: no-cache, must-revalidate`.
- **Preconnect:**
  - `<link rel="preconnect" href="https://fonts.googleapis.com">` (if not self-hosted).
  - `<link rel="preconnect" href="https://www.google-analytics.com">` (if GA4 enabled).

### 11.4 PWA already exists (Phase 6 in PROJECT_CONTEXT.md)
- Service worker caching helps repeat visits.
- Confirm Lighthouse PWA score is ≥ 90.

---

## 12. Phase 11 — Structured Data Expansion

The current static structured data in `index.html` covers WebSite, Organization, SoftwareApplication. Add per-page schemas.

### 12.1 Per-page schema map

| Route | Schema type | Notes |
|---|---|---|
| `/` | WebSite + Organization + SoftwareApplication (existing) | Keep |
| `/features` | SoftwareApplication with detailed `featureList` | Override the default |
| `/faq` | FAQPage with each Q/A as `mainEntity` | High SERP visibility |
| `/what-is-learning-decay` | Article + BreadcrumbList | Get "rich result" eligibility |
| `/use-cases` | Article + BreadcrumbList | |
| `/comparisons` + `/compare/*` | Product with `review.reviewRating` | Comparison rich snippets |
| `/blog/:slug` | BlogPosting + BreadcrumbList + Author | |
| `/privacy`, `/terms` | WebPage | Minimal |

### 12.2 Implementation
- Extend the `<SEO />` component to accept structured data per page.
- Centralize schema builders in `frontend/src/lib/schema.ts`:
  - `buildArticleSchema({ title, description, datePublished, dateModified, image })`
  - `buildFAQSchema(questions: { q: string, a: string }[])`
  - `buildBreadcrumbSchema(crumbs: { name: string, url: string }[])`
  - `buildProductComparisonSchema(...)`

### 12.3 Validation
- Test every page on https://search.google.com/test/rich-results.
- Monitor Search Console → Enhancements → each schema type.

---

## 13. Phase 12 — Local & Multi-Language SEO (Future)

Out of scope for v1 but plan for later.

### 13.1 i18n
- React i18next or react-intl.
- Translate marketing pages first: EN → DE → FR → ES → JA.
- Add `<link rel="alternate" hreflang="de" href="https://skillfade.app/de/" />` per language.
- Subdirectory routing (`/de/`, `/fr/`) preferred over subdomains.

### 13.2 Local
- Not applicable — SkillFade is a global SaaS, no physical location.

---

## 14. Execution Checklist

Track in GitHub issues or a project board. Suggested ordering:

### Week 1 — Foundation
- [x] ~~Decide on §0 privacy trade-off~~ — **DONE: Option A (GA4 + GSC)**
- [ ] Add GSC meta verification tag to `frontend/index.html`
- [ ] Verify property in Google Search Console
- [ ] Create `robots.txt`
- [ ] Create `sitemap.xml`
- [ ] Create `og-image.png`, `logo.svg`
- [ ] Audit `<SEO />` usage on all six public pages, add canonicals
- [ ] Submit sitemap to GSC, request indexing for all pages

### Week 2 — Analytics (minimal scope)
- [ ] Create GA4 property + Web data stream, copy Measurement ID
- [ ] Paste `gtag.js` snippet into `frontend/index.html` (Option 1 from §3.3)
- [ ] Build `RouteTracker.tsx` — fires page views on public routes only
- [ ] Build `CookieBanner.tsx` with Consent Mode v2
- [ ] Add `/privacy` page disclosing GA4
- [ ] Update `Settings.tsx` privacy statement
- [ ] Update `PROJECT_CONTEXT.md` analytics rule (line 893)
- [ ] Link GSC ↔ GA4 (Admin → Product links)
- [ ] Verify Realtime report shows visitors; confirm no events fire on `/dashboard` etc.

### Week 3 — Content scaffolding
- [ ] Extract `PublicFooter.tsx` component
- [ ] Build expanded six-column footer
- [ ] Apply title/description matrix from §5.2
- [ ] Build six dedicated comparison pages
- [ ] Add structured data per page

### Week 4 — Performance
- [ ] Run Lighthouse audit, fix top 5 issues
- [ ] Self-host Inter font
- [ ] Convert images to WebP
- [ ] Lazy-load admin routes

### Month 2 — Content
- [ ] Set up blog infrastructure
- [ ] Publish 4 pillar posts (one per pillar in §7.2)
- [ ] Submit to Product Hunt
- [ ] Submit to 5 directories from §10.1

### Month 3+ — Ongoing
- [ ] 2 blog posts per month
- [ ] Monitor GSC weekly for indexing errors
- [ ] Monitor Core Web Vitals weekly
- [ ] Update sitemap on new content
- [ ] Build backlinks (community engagement, guest posts)

---

## 15. KPIs & Success Metrics

Track monthly. Set quarterly targets.

### 15.1 Search Console KPIs
- **Indexed pages** — target 100% of submitted URLs indexed within 30 days.
- **Total clicks** — track growth month-over-month.
- **Total impressions** — leading indicator of visibility.
- **Average position** — target top 10 for primary keywords within 6 months.
- **CTR** — target > 3% on top-10 positions.

### 15.2 Analytics KPIs (if enabled)
- **Organic sessions** — month-over-month growth.
- **Bounce rate** on marketing pages — target < 60%.
- **Sign-up conversion rate** — registers ÷ landing page sessions.
- **Average pages per session** — target > 2 (indicates internal linking works).

### 15.3 Ranking KPIs
- Track top-20 keywords from §6 weekly via Search Console "Performance" filter.
- Goal: 5 primary keywords in top 10 within 6 months.

### 15.4 Authority KPIs
- Domain authority via Ahrefs Webmaster Tools (free).
- Referring domains count.
- Backlinks from DR 40+ sites.

---

## 16. Tools & Resources

### Free
- Google Search Console — indexing + ranking data
- Google Analytics 4 — user analytics (or Plausible/Umami for privacy)
- Google PageSpeed Insights — performance
- Google Rich Results Test — structured data
- Ahrefs Webmaster Tools — backlinks + site audit (free for verified sites)
- Bing Webmaster Tools — also submit sitemap here
- Screaming Frog SEO Spider — free up to 500 URLs
- AnswerThePublic — keyword ideas (free tier)
- Google Trends — seasonal validation
- Lighthouse — built into Chrome DevTools

### Paid (optional)
- Ahrefs / SEMrush — full keyword and backlink suite ($99+/mo)
- Plausible.io — privacy-friendly analytics ($9/mo)
- Pirsch — alternative analytics ($6/mo)
- ConvertKit / Buttondown — newsletter

### Documentation
- [Google Search Central](https://developers.google.com/search) — official SEO docs
- [Schema.org](https://schema.org) — structured data vocab
- [web.dev](https://web.dev/learn/) — performance + Core Web Vitals guides
- [Ahrefs Blog](https://ahrefs.com/blog) — SEO tactics
- [Google's SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

---

## Appendix A — Quick Reference Commands

### Local SEO audit
```bash
# Build production bundle
cd frontend && npm run build && npm run preview

# Run Lighthouse on production preview
npx lighthouse http://localhost:4173 --view

# Validate sitemap
curl -s https://skillfade.app/sitemap.xml | xmllint --noout -

# Check robots.txt
curl -s https://skillfade.app/robots.txt
```

### Verify deployed schemas
```bash
# Test rich results
open "https://search.google.com/test/rich-results?url=https://skillfade.app/"

# Test mobile-friendly
open "https://search.google.com/test/mobile-friendly?url=https://skillfade.app/"
```

---

**Last Updated:** 2026-05-14
**Owner:** Ruhid Ibadli
**Status:** Plan — not yet executed
**Next Action:** Confirm §0 privacy trade-off decision, then begin Week 1 checklist.
