# Time-Invested Suite — Design Spec

**Date:** 2026-06-13
**Branch:** `feature/payment-foundation`
**Status:** Draft for review (no code until approved)

---

## 1. Overview

SkillFade already captures `duration_minutes` on **every** learning and practice event,
but that data is aggregated **nowhere** for the user (only the admin panel sums it). This
feature turns that latent data into the product's next PRO value vein with two surfaces:

1. **Per-Skill Time Dashboard** — an in-app "Time Invested" section on the Analytics page:
   total hours, hours/month trend, hours-by-type, category roll-ups, and the
   SkillFade-unique **hours-vs-freshness overlay** ("12h this month, freshness barely moved").
2. **Activity Report** — a date-range, print-styled report page (`/reports/activity`) plus a
   one-click CSV, suitable for self-review, appraisals, CPD logs, and client/billing summaries.

Both surfaces are powered by **one shared aggregation service** so they never diverge.

This is the "you're already entering this — now get value back from it" upgrade story:
philosophy-perfect (pure aggregation of manually-logged data; no AI, no coaching, no
gamification), and a recurring, deadline-driven reason for working professionals to buy
Lifetime PRO.

### Prerequisite bundled into this work
Fix a confirmed **philosophy violation**: `GET /api/settings/export` is gated behind
`require_pro` (`settings.py:57`), so free users get 402 and cannot export their own data —
contradicting the hard "export & deletion always free" rule and the ROADMAP "Rejected
monetization patterns" table. We un-gate it. The paid report then stands on
**formatting + aggregation + arbitrary range**, never on locking raw data.

---

## 2. Goals / Non-goals

**Goals**
- Surface time-invested data already captured, with an honest, calm presentation.
- A genuinely daily-useful in-app dashboard (free taste + PRO depth).
- A submittable Activity Report (print → "Save as PDF") + CSV, any date range.
- Un-gate raw data export (philosophy fix).
- Zero new backend dependencies; zero DB migration.

**Non-goals (explicit)**
- No server-side PDF generation (no WeasyPrint/ReportLab) — chosen: print-styled HTML + CSV.
- No "certified CPD/timesheet" claims — durations are optional/nullable; the report is an
  honest *activity* summary that always shows session counts, first/last activity, and how
  many events had no logged duration.
- No coaching/prescription, no streaks, no urgency, no third-party sharing features.
- Not enforcing the (currently unenforced) 30-day free history window — tracked as follow-up.

---

## 3. Decisions (confirmed with user, 2026-06-13)

| Decision | Choice |
|---|---|
| Report output | **Print-styled HTML page + CSV** (no new backend deps; user "Save as PDF") |
| Free vs PRO split | **Calibrated taste**: free sees total-hours figures; PRO gets the breakdown + report |
| Export paywall | **Un-gate now** — raw export free for all; fix its test |
| Scope | Both the in-app dashboard **and** the report, sharing one aggregation service |

---

## 4. Architecture

```
                       ┌─────────────────────────────────────────────┐
                       │ services/time_stats.py  (pure aggregation)   │
                       │  time_summary(db, user)      → free totals   │
                       │  time_report(db, user, range)→ full breakdown│
                       └───────────────┬─────────────────────────────┘
                                       │ reuses freshness.calculate_freshness(today=…)
        ┌──────────────────────────────┴───────────────────────────────┐
        ▼                                                                ▼
 GET /api/analytics/time-summary  (free, get_current_user)   GET /api/analytics/time-report
   → account total + per-skill totals + coverage              (PRO, Depends(require_pro))
        │                                                       ?start&end&skill_id (optional)
        ▼                                                                ▼
 Analytics "Time Invested" free taste            Analytics PRO dashboard  +  /reports/activity page
                                                       (Recharts overlay)       (print + client-side CSV)
```

No new tables, no migration. New code only.

---

## 5. Backend

### 5.1 New service — `backend/app/services/time_stats.py`
Pure aggregation over the user's events (queried with a skill join). Hours = `duration_minutes / 60`.

- `time_summary(db, user) -> dict` (FREE)
  ```
  {
    total_hours: float,            # sum across all events (timed only)
    total_sessions: int,           # count of all events
    timed_sessions: int,           # events with duration_minutes not null
    coverage_percent: float,       # timed_sessions / total_sessions * 100 (0 if none)
    per_skill: [ {skill_id, skill_name, archived: bool, hours, sessions} ]  # desc by hours
  }
  ```
- `time_report(db, user, start: date, end: date, skill_id: UUID|None) -> dict` (PRO)
  ```
  {
    range: {start, end},
    totals: {hours, sessions, timed_sessions, untimed_sessions, coverage_percent,
             learning_hours, practice_hours, first_activity, last_activity},
    per_skill:    [ {skill_id, skill_name, category, hours, sessions,
                     learning_hours, practice_hours, first_activity, last_activity,
                     untimed_sessions} ],            # desc by hours
    per_category: [ {category, hours, sessions, skill_count} ],
    by_month:     [ {month: "YYYY-MM", hours, learning_hours, practice_hours} ],
    hours_vs_freshness: [ {month: "YYYY-MM", hours, avg_freshness} ]
  }
  ```
  - `hours_vs_freshness`: for each month-end in range, `avg_freshness` = mean of
    `calculate_freshness(..., today=month_end)` over the user's active skills (or the single
    skill if `skill_id` given), with events filtered `<= month_end`. Reuses the pure engine;
    month-end granularity keeps it cheap (≤ ~60 points).
  - Honesty: `untimed_*`/`coverage_percent` always present so a sparse-duration user sees the
    truth, not an aspirational total.

**Perf note:** sums computed in Python over queried events (matches existing analytics style);
acceptable at personal scale. `time-report` validates `start <= end` and caps the span
(≤ 5 years) to bound the freshness loop. Optimizing to SQL `func.sum` is a future option.

### 5.2 New schemas — `backend/app/schemas/analytics.py`
Pydantic response models (`TimeSummaryResponse`, `TimeReportResponse` + nested), mirroring
the `FreshnessHistoryResponse` pattern already used in `analytics.py`. Endpoints use `response_model`.

### 5.3 New endpoints — in `backend/app/routers/analytics.py`
- `GET /api/analytics/time-summary` — `Depends(get_current_user)` (FREE).
- `GET /api/analytics/time-report` — adds `_pro: User = Depends(require_pro)` (PRO, 402 for free),
  query params `start`, `end` (default: last 12 months), `skill_id` (optional). Follows the exact
  pattern of the existing `period-comparison` / `category-stats` PRO endpoints.

### 5.4 Export fix — `backend/app/routers/settings.py`
- Remove `_pro: User = Depends(require_pro)` from `export_data`; drop the now-unused
  `require_pro` import; update the docstring ("Export all user data as JSON. Free for all
  plans — your data is always yours.").
- `DELETE /account` already correctly ungated — unchanged.

### 5.5 Tests
- `backend/tests/test_time_stats.py` (new): service aggregation — hours sums, coverage with
  null durations, learning/practice split, date-range filtering, `by_month`, `hours_vs_freshness`
  shape, empty-data; endpoint auth — free gets 200 on `time-summary`, free gets **402** on
  `time-report`, PRO gets 200; spot-check values.
- `backend/tests/test_paywall.py`: change `test_export_402_for_free` → `test_export_ok_for_free`
  (assert **200**); keep `test_export_ok_for_pro`. (No other paywall tests change.)

---

## 6. Frontend

### 6.1 API + types
- `services/api.ts`: `analytics.timeSummary()`, `analytics.timeReport({start?, end?, skill_id?})`.
- `types/index.ts`: `TimeSummary`, `TimeReport` (+ nested) interfaces.

### 6.2 Analytics page — `pages/Analytics.tsx` ("Time Invested" section)
- Fetch `timeSummary()` **separately** with its own `try/catch` (not inside the PRO `Promise.all`).
- **Free taste (always shown):** account total hours, total sessions, a small per-skill
  top-list, and a calm coverage line ("N of M sessions have a logged duration").
- **PRO depth (`useIsPro()` true):** fetch `timeReport()` (default last-12-months) and render:
  - Hours-vs-freshness **overlay** — Recharts `ComposedChart`: bars = hours/month, line =
    avg freshness/month (sage line, honoring the app's color conventions).
  - Hours-by-type and per-category roll-up (reuse `.card` / `.label-caps` / `font-mono`).
  - "Open Activity Report →" link to `/reports/activity`.
- **Free user, PRO section:** calm locked panel (ProGate-style) — shows the free totals plus
  "Unlock the full breakdown + a printable Activity Report" → `/pricing`. No FOMO, no modal.
- **Robustness fix:** wrap the existing `periodComparison()` / `categoryStats()` calls each in
  their own catch so a 402 (a real free user) no longer rejects the whole `Promise.all` and
  blanks the free charts.

### 6.3 Activity Report page — `pages/ActivityReport.tsx` (route `/reports/activity`)
- Protected route, **rendered standalone** (its own minimal print-friendly container, not the
  app `Layout` chrome). PRO-gated: non-PRO sees a calm "PRO feature" state → `/pricing`.
- On-screen toolbar (hidden on print): back link, date-range presets (This year · Last 12
  months · This quarter · Custom start/end), **Print / Save as PDF** (`window.print()`),
  **Download CSV** (client-side `Blob` from the same `timeReport` JSON; small `toCsv` helper in
  `utils/`).
- Body: branded header (logo + user email + range + generated date), totals block (incl. session
  counts + first/last + untimed coverage), per-skill table, per-category table. On-brand
  ("Ember & Almanac") typography.
- Print CSS: `@media print` block in `index.css` hides toolbar/links, sets light-on-white,
  page margins, avoids row breaks.

### 6.4 Routing + entry points
- `App.tsx`: add `/reports/activity` inside the authenticated/protected group.
- Entry points: "Open Activity Report →" from the Analytics PRO section; a link in `Settings.tsx`
  (near Data Export). Keep it calm and minimal — no new top-nav clutter.
- Add `/reports/activity` to in-app (non-public) handling (it's authenticated; not in
  `PUBLIC_ROUTES`, not in sitemap, not indexed).

### 6.5 SkillDetail (free per-skill taste)
- `pages/SkillDetail.tsx`: a small read-only "Time logged: X h · N sessions" stat (from the
  free summary or a per-skill field), placed near the existing metrics. Minimal change.

### 6.6 Frontend tests
- A vitest for the `toCsv` helper (escaping, headers, totals row) and the hours formatter.
  Keep light, consistent with the existing small vitest suite.

---

## 7. Free vs PRO (final)

| Capability | Free | PRO |
|---|---|---|
| Account total hours + total sessions | ✅ | ✅ |
| Per-skill total hours (list / SkillDetail stat) | ✅ | ✅ |
| Duration-coverage honesty line | ✅ | ✅ |
| Hours/month trend + hours-by-type + category roll-up | ❌ | ✅ |
| Hours-vs-freshness overlay | ❌ | ✅ |
| Date-range Activity Report (print) + CSV | ❌ | ✅ |
| Raw JSON data export | ✅ (fixed) | ✅ |

---

## 8. Philosophy guardrails (must hold)
- Pure aggregation/formatting of the user's own manually-logged data — no AI, no recommendations.
- No gamification (no badges/streaks/celebration), no urgency/FOMO, no countdowns.
- No third-party sharing surface — the user prints/exports and forwards it themselves.
- Honest numbers: always show session counts + first/last activity + untimed coverage.
- Raw export & account deletion stay free for every plan.
- Calm locked states (one quiet panel/link), never an interrupting upsell.

---

## 9. Out of scope / follow-ups (logged, not built here)
- Server-side PDF file (WeasyPrint) if a true downloadable `.pdf` is later wanted.
- Enforce the advertised 30-day free history window (currently unenforced — separate decision).
- Wire `ProGate` to the other already-gated PRO features in the UI (dead-flag cleanup).
- Refund flow + Terms/Refund pages + receipt email (launch-readiness gaps found in audit).
- Other shortlist ideas: live `.ics` calendar feed, CSV import, saved views, etc.

---

## 10. Docs to update at the end
- `PROJECT_CONTEXT.md`: new endpoints, `time_stats.py` service, `schemas/analytics.py`,
  `ActivityReport.tsx` page/route, export un-gated, the new "Time Invested" section.
- `ROADMAP.md`: mark data export as free (both tiers); add the Time-Invested suite as a shipped
  PRO feature distinct from 8.2 Year-in-Review; note the export-paywall fix.

---

## 11. Build sequence
1. Backend: `time_stats.py` → `schemas/analytics.py` → two endpoints; export un-gate.
2. Backend tests (`test_time_stats.py`, update `test_paywall.py`); run `pytest`.
3. Frontend: api + types → Analytics "Time Invested" section → `ActivityReport` page + route +
   print CSS + CSV helper → SkillDetail stat → Settings/Analytics links.
4. Frontend tests + `npm run build` (strict tsc + vite).
5. Update `PROJECT_CONTEXT.md` + `ROADMAP.md`.
