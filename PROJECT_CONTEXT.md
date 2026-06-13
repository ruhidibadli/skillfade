# SkillFade - Project Context

> **Purpose:** Use this document in new AI agent chats to quickly understand the entire project structure, architecture, and implementation details.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Philosophy & Design Principles](#philosophy--design-principles)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Database Schema](#database-schema)
6. [Core Algorithms](#core-algorithms)
7. [API Endpoints](#api-endpoints)
8. [Frontend Structure](#frontend-structure)
9. [Alert System](#alert-system)
10. [File Structure](#file-structure)
11. [Environment Configuration](#environment-configuration)
12. [Development Workflow](#development-workflow)
13. [Key Implementation Details](#key-implementation-details)
14. [UI/UX Design](#uiux-design)

---

## Project Overview

**Name:** SkillFade
**Type:** SaaS web application (monolithic)
**Purpose:** Track skill learning and practice, exposing three realities:
1. **Learning Decay** - Skills degrade without reinforcement
2. **Practice Scarcity** - Learning without application leads to forgetting
3. **Input/Output Imbalance** - Too much consumption, too little production

### What It Does
- Tracks skills and their freshness (0-100% based on decay algorithm)
- Logs learning events (reading, videos, courses, etc.)
- Logs practice events (exercises, projects, work, etc.)
- Calculates input/output balance ratios
- Sends calm, infrequent email alerts for decay, practice gaps, and imbalances
- Provides analytics dashboards and charts

### What It Does NOT Do
- Teach new skills
- Motivate through gamification (no points, badges, or streaks)
- Recommend learning resources
- Judge the user

### Target Users
- Self-directed learners (developers, designers, writers)
- Career switchers learning new fields
- Knowledge workers maintaining skills
- Users who value long-term insight over short-term dopamine

---

## Philosophy & Design Principles

**Core Philosophy:** This product is a mirror, not a coach. It does not push, judge, or optimize the user. It simply tells the truth, kindly and clearly.

### Design Principles
1. **Simplicity First** - No microservices, no complex state management, no unnecessary abstractions
2. **User Trust & Privacy** - No third-party analytics, full data export, permanent deletion
3. **Calm Design** - Soft colors, ample whitespace, no red warnings, no gamification, data over motivation
4. **Long-term Maintainability** - Type safety, clear separation of concerns, comprehensive documentation
5. **Boring Tech** - Proven, reliable solutions over trendy ones

### Color Palette ("Ember & Almanac" — warm editorial dark, see UI/UX Design)
- Background: #1A150E (warm espresso) on a #14100A–#4C4130 surface scale
- Text: #F4ECDD (warm parchment), #C7B9A2 (secondary), #9C8E76 (muted) — all AA+ on surfaces
- Primary accent: #8FB382 (sage / living green)
- Secondary accent: #C8795A (clay / terracotta)
- Warning: amber/honey #C9A24E (never alarm-red)
- Freshness scale (earthy, calm): sage #7DA86A (>70%) → honey #C9A24E (40-70%) → clay #C87B64 (<40%)

---

## Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 15+ (or SQLite for solo users)
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Auth:** JWT tokens + passlib (bcrypt hashing)
- **Email:** SMTP (user-configured)
- **Testing:** pytest, pytest-cov

### Frontend
- **Framework:** React 18 + TypeScript
- **Routing:** React Router
- **State:** React Context API (no Redux)
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Build Tool:** Vite
- **Testing:** Vitest

### DevOps
- **Containerization:** Docker + Docker Compose
- **Process Management:** systemd (manual deployment)
- **Web Server:** Nginx (reverse proxy)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Nginx (Reverse Proxy)                  │
│  ┌──────────────────┐           ┌────────────────────────┐ │
│  │   Static Files   │           │    API Proxy /api/*    │ │
│  │   (Frontend)     │           │                        │ │
│  └──────────────────┘           └────────────────────────┘ │
└──────────┬──────────────────────────────┬──────────────────┘
           │                              │
           ▼                              ▼
┌────────────────────┐        ┌──────────────────────────────┐
│  React Frontend    │        │   FastAPI Backend            │
│  - TypeScript      │        │   - Python 3.11              │
│  - TailwindCSS     │        │   - SQLAlchemy ORM           │
│  - React Router    │        │   - JWT Auth                 │
│  - Recharts        │        │   - Email Alerts             │
└────────────────────┘        └────────────┬─────────────────┘
                                           │
                                           ▼
                              ┌──────────────────────────────┐
                              │   PostgreSQL Database        │
                              │   - Users                    │
                              │   - Skills                   │
                              │   - Learning Events          │
                              │   - Practice Events          │
                              └──────────────────────────────┘
```

---

## Database Schema

### Users Table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
is_admin        BOOLEAN DEFAULT FALSE NOT NULL
settings        JSONB DEFAULT '{}'
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

**Relationships:**
- Has many skills (cascade delete)
- Has many learning_events (cascade delete)
- Has many practice_events (cascade delete)
- Has many categories (cascade delete)
- Has many tickets (cascade delete)
- Has many ticket_replies (cascade delete)
- Has many subscriptions (cascade delete)

### Categories Table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
name            VARCHAR(50) NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
UNIQUE(user_id, name)
INDEX(user_id)
```

**Relationships:**
- Belongs to user
- Has many skills

### Skills Table
```sql
id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id             UUID REFERENCES users(id) ON DELETE CASCADE
name                VARCHAR(100) NOT NULL
category_id         UUID REFERENCES categories(id) ON DELETE SET NULL
decay_rate          FLOAT DEFAULT 0.02 NOT NULL
target_freshness    FLOAT                       -- Personal freshness threshold (Phase 2)
notes               TEXT                        -- Persistent notes for resources, goals (Phase 6)
created_at          TIMESTAMP DEFAULT NOW()
archived_at         TIMESTAMP
UNIQUE(user_id, name)
INDEX(category_id)
```

**Relationships:**
- Belongs to user
- Belongs to category (optional)
- Has many learning_events (cascade delete)
- Has many practice_events (cascade delete)
- Has many dependencies (self-referential many-to-many via skill_dependencies)
- Has many dependents (skills that depend on this one)

### Learning Events Table
```sql
id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
skill_id            UUID REFERENCES skills(id) ON DELETE CASCADE
user_id             UUID REFERENCES users(id) ON DELETE CASCADE
date                DATE NOT NULL
type                VARCHAR(50) NOT NULL
notes               TEXT
duration_minutes    INTEGER
created_at          TIMESTAMP DEFAULT NOW()
INDEX(skill_id, date)
```

**Types:** reading, video, course, article, documentation, tutorial

### Practice Events Table
```sql
id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
skill_id            UUID REFERENCES skills(id) ON DELETE CASCADE
user_id             UUID REFERENCES users(id) ON DELETE CASCADE
date                DATE NOT NULL
type                VARCHAR(50) NOT NULL
notes               TEXT
duration_minutes    INTEGER
created_at          TIMESTAMP DEFAULT NOW()
INDEX(skill_id, date)
```

**Types:** exercise, project, work, teaching, writing, building

### Event Templates Table
```sql
id                      UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 UUID REFERENCES users(id) ON DELETE CASCADE
name                    VARCHAR(100) NOT NULL
event_type              VARCHAR(20) NOT NULL  -- 'learning' or 'practice'
type                    VARCHAR(50) NOT NULL  -- reading, video, exercise, project, etc.
default_duration_minutes INTEGER
default_notes           TEXT
created_at              TIMESTAMP DEFAULT NOW()
```

**Relationships:**
- Belongs to user

### Skill Dependencies Table (Phase 6)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
skill_id        UUID REFERENCES skills(id) ON DELETE CASCADE
depends_on_id   UUID REFERENCES skills(id) ON DELETE CASCADE
created_at      TIMESTAMP DEFAULT NOW()
UNIQUE(skill_id, depends_on_id)
INDEX(skill_id)
INDEX(depends_on_id)
```

**Relationships:**
- Self-referential many-to-many for skills
- skill_id → the skill that has a prerequisite
- depends_on_id → the prerequisite skill

### Tickets Table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
subject         VARCHAR(200) NOT NULL
message         TEXT NOT NULL
status          VARCHAR(20) DEFAULT 'open' NOT NULL  -- open, in_progress, resolved, closed
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
INDEX(user_id)
INDEX(status)
```

**Relationships:**
- Belongs to user
- Has many ticket_replies (cascade delete)

### Ticket Replies Table
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
ticket_id       UUID REFERENCES tickets(id) ON DELETE CASCADE
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
message         TEXT NOT NULL
is_admin_reply  BOOLEAN DEFAULT FALSE NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
INDEX(ticket_id)
```

**Relationships:**
- Belongs to ticket
- Belongs to user

### Subscriptions Table (Phase 7 - Payment Foundation)
```sql
id                      UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 UUID REFERENCES users(id) ON DELETE CASCADE
plan                    VARCHAR(20) NOT NULL          -- 'free', 'lifetime', 'grandfathered'
status                  VARCHAR(20) NOT NULL          -- 'pending', 'active', 'refunded', 'revoked', 'failed'
provider                VARCHAR(20) NOT NULL DEFAULT 'epoint'  -- 'epoint', 'manual'
order_id                VARCHAR(64) UNIQUE
epoint_transaction      VARCHAR(64)
epoint_bank_transaction VARCHAR(64)
epoint_rrn              VARCHAR(32)
epoint_code             VARCHAR(8)
card_mask               VARCHAR(20)
card_name               VARCHAR(100)
purchased_at            TIMESTAMP
refunded_at             TIMESTAMP
amount                  NUMERIC(10, 2)
currency                VARCHAR(3) NOT NULL DEFAULT 'AZN'
raw_callback            JSONB DEFAULT '{}'
notes                   TEXT
created_at              TIMESTAMP DEFAULT NOW()
updated_at              TIMESTAMP DEFAULT NOW()
INDEX(user_id)
INDEX(status)
UNIQUE INDEX(order_id)
```

**Relationships:**
- Belongs to user

**Entitlement rule:** a user is PRO when any subscription row has `status='active'` AND `plan IN ('lifetime', 'grandfathered')`. Implemented in `app/services/entitlements.py`.

**Grandfather migration (0010):** every pre-existing user receives one row with `plan='grandfathered'`, `status='active'`, `provider='manual'`, `notes='Auto-granted: registered before payment launch'`. Idempotent — re-running is safe.

### App Settings Table (Phase 7 - Admin-editable site settings)
```sql
id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
key                 VARCHAR(64) NOT NULL UNIQUE
value               TEXT NOT NULL
updated_by_user_id  UUID REFERENCES users(id) ON DELETE SET NULL
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()
UNIQUE INDEX(key)
```

**Purpose:** generic key/value store for site-wide settings that admins can edit at runtime without redeploying. Reads go through `app/services/site_settings.py:get_effective_value(...)`, which falls back to the matching `EPOINT_*` env var when no row exists.

**Recognized keys (current):**
- `lifetime_price_azn` — overrides `EPOINT_LIFETIME_PRICE_AZN`
- `early_bird_price_azn` — overrides `EPOINT_EARLY_BIRD_PRICE_AZN`

---

## Core Algorithms

### 1. Freshness Calculation

**Location:** `backend/app/services/freshness.py:calculate_freshness()`

```python
Algorithm:
1. Start at 100% freshness
2. Find last practice date (or skill creation date if never practiced)
3. Calculate days since last practice
4. Apply base decay: freshness *= (0.98 ^ days_since_practice)
5. Add learning boost: min(recent_learning_count * 2, 15)% for events in last 30 days
6. Clamp result between 0-100%

Returns: float between 0.0 and 100.0
```

**Parameters:**
- `base_decay_rate`: 2% per day (default: 0.02)
- `learning_boost`: 2% per recent event, max 15%
- `recent_window`: 30 days

**Visual Indicators:**
- 🟢 >70% - Fresh
- 🟡 40-70% - Aging
- 🔴 <40% - Decayed

### 2. Practice Scarcity Detection

**Location:** `backend/app/services/freshness.py:check_practice_scarcity()`

Flags skills with:
1. Learning events but zero practice events (ever) → "Not yet practiced"
2. No practice in last 21+ days → "No practice in X days"
3. Learning-to-practice ratio > 5:1 → "Theory-heavy"

### 3. Balance Ratio

**Location:** `backend/app/services/freshness.py:calculate_balance_ratio()`

```python
balance_ratio = practice_count / learning_count

Interpretation:
- <0.2: Heavy input, minimal practice
- 0.2-0.5: Learning-focused period
- 0.5-1.0: Balanced
- >1.0: Practice-dominant (ideal for retention)
```

---

## API Endpoints

**Base URL:** `/api`
**Authentication:** Bearer token in `Authorization` header

### Authentication (`/auth/*`)
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT token
- `POST /auth/logout` - Invalidate token
- `POST /auth/forgot-password` - Request password reset email
- `POST /auth/reset-password` - Reset password with token

### Skills (`/skills/*`)
- `GET /skills?include_archived=false` - List user's skills with freshness
- `POST /skills` - Create skill (category_id or category_name for category)
- `GET /skills/:id` - Get skill details
- `PATCH /skills/:id` - Update skill (name, category_id, category_name, notes, decay_rate, target_freshness)
- `DELETE /skills/:id` - Archive skill (soft delete)
- `PUT /skills/:id/dependencies` - Update skill dependencies (Phase 6)

### Categories (`/categories/*`)
- `GET /categories` - List user's categories with skill counts
- `POST /categories` - Create new category
- `GET /categories/:id` - Get specific category
- `PATCH /categories/:id` - Update category name
- `DELETE /categories/:id` - Delete category (skills set to uncategorized)

### Events
- `GET /skills/:id/events` - Get all events for skill (chronological)
- `POST /skills/:id/learning-events` - Log learning event
- `POST /skills/:id/practice-events` - Log practice event
- `PATCH /learning-events/:id` - Edit learning event
- `PATCH /practice-events/:id` - Edit practice event
- `DELETE /learning-events/:id` - Delete learning event
- `DELETE /practice-events/:id` - Delete practice event

### Analytics (`/analytics/*`)
- `GET /analytics/dashboard` - Dashboard summary (total skills, weekly events, balance)
- `GET /analytics/balance?period=week|month|quarter` - Input/output data for charts
- `GET /analytics/skills-by-freshness` - Skills distribution by freshness ranges
- `GET /analytics/calendar?month=1-12&year=2000-2100` - Calendar data with events grouped by date
- `GET /analytics/skills/:id/freshness-history?days=90` - Historical freshness data for charts
- `GET /analytics/period-comparison` - Compare this month vs last month activity (Phase 2)
- `GET /analytics/category-stats` - Average freshness and activity grouped by category (Phase 2)
- `GET /analytics/skills/:id/personal-records` - Personal records for a skill (Phase 2)
- `GET /analytics/time-summary` - **Free.** Account + per-skill total hours logged, with duration coverage (Time-Invested suite)
- `GET /analytics/time-report?start=&end=&skill_id=` - **PRO** (`require_pro`). Date-range time breakdown: per-skill/category hours, monthly trend, and the hours-vs-freshness overlay (Time-Invested suite)

### Settings (`/settings/*`)
- `GET /settings` - Get user settings
- `PATCH /settings` - Update settings (alert preferences)
- `GET /settings/export` - Export all data (JSON)
- `DELETE /settings/account` - Permanent account deletion

### Event Templates (`/templates/*`)
- `GET /templates` - List all user's event templates
- `POST /templates` - Create new template
- `GET /templates/:id` - Get specific template
- `PATCH /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template

### Tickets (`/tickets/*`)
- `GET /tickets` - List user's support tickets
- `POST /tickets` - Create new support ticket
- `GET /tickets/:id` - Get ticket with replies
- `POST /tickets/:id/replies` - Add reply to ticket

### Billing (`/billing/*`) - Phase 7 + Payments LIVE
- `GET /billing/me` - Current user's plan + entitlements (used by frontend `PlanContext`). Response: `{plan, is_pro, status, purchased_at, refunded_at, amount, currency, limits}`.
- `GET /billing/pricing` - **Public.** Current lifetime price for the pricing page: `{lifetime_price_azn, currency}` (DB override via `app_settings`, else env default).
- `POST /billing/checkout` - **Auth.** Starts a Lifetime PRO purchase through the shared gateway. Blocks if already PRO (400). Calls the automakler hub `/gateway/checkout`, persists a `pending` Subscription keyed on the hub `order_id`, returns `{redirect_url, order_id}`. On gateway failure → 502.
- `GET /billing/status?order_id=...` - **Auth.** Authoritative status of the caller's own order; if still `pending`, reconciles with the hub `/gateway/status` (self-heals to `active`). Returns `{order_id, status, is_pro}`. Used by the success page as a backup to the webhook.

### Webhooks (`/webhooks/*`) - Payments LIVE
- `POST /webhooks/epoint` - **Unauthenticated** (the gateway hub calls it server-to-server). Form fields `data` + `signature`. Verifies the hub signature with `GATEWAY_WEBHOOK_SECRET` (`base64(sha1(secret+data+secret))`, constant-time), looks up the Subscription by `order_id`, and on `success` activates it (plan=`lifetime`, status=`active`) — **idempotent**; on failure marks it `failed`. Invalid signature → 400, unknown order → 404.

### Payment architecture (shared gateway, Payments LIVE)
SkillFade does **not** hold the Epoint credentials. Payments go through the **automakler gateway hub**, which owns the single Epoint merchant account + callback and routes each result back by project. SkillFade holds only a **gateway API key** (to call `/gateway/checkout` and `/gateway/status`) and a **webhook secret** (to verify the inbound webhook). New config (`app/core/config.py`): `GATEWAY_URL`, `GATEWAY_API_KEY`, `GATEWAY_WEBHOOK_SECRET`. Client module: `app/core/gateway.py` (signing + httpx calls); flow helpers in `app/services/billing.py`. Frontend: `/pricing`, `/billing/success` (reconcile + `usePlan().refresh()`), `/billing/error` pages; `billing.checkout()/status()/pricing()` in `api.ts`; "Upgrade to PRO" entry points in `PublicHeader` and the app `Layout`.

### Paywall enforcement (ACTIVATED)
The entitlement layer (`require_pro`, `get_limit`, `can_use_feature`) is now **wired into the routers** (previously defined but unused):
- **PRO-only endpoints** (`Depends(require_pro)` → 402): `GET /analytics/period-comparison`, `GET /analytics/category-stats`, `GET /analytics/skills/:id/personal-records`, `GET /analytics/time-report`, `PUT /skills/:id/dependencies`.
- **Always free (philosophy):** `GET /settings/export` (raw JSON export) and `DELETE /settings/account` are never gated — your data is always yours. *(Export was previously PRO-gated; that contradicted the philosophy and the ROADMAP "Rejected monetization patterns" rule, and was removed 2026-06-13.)* The free `GET /analytics/time-summary` is also ungated.
- **Free-tier caps** (`get_limit`, 402 when over; `None`=unlimited for PRO/grandfathered): `POST /skills` (skills=3), `POST /categories` (categories=2), `POST /templates` (templates=2).
- **PRO-only fields** (`can_use_feature`, 402): `target_freshness` (`freshness_targets`) and `notes` (`skill_notes`) on `POST/PATCH /skills`.
All 402s use detail `{"error":"pro_required","upgrade_url":"/pricing"}`. Grandfathered/lifetime users are never blocked (limits are `None`).

### Admin Pricing (`/admin/pricing`) - Phase 7
- `GET /admin/pricing` - Current AZN prices for lifetime + early-bird, with a `source` field per value (`db` if overridden, `env` if falling back to the env var).
- `PATCH /admin/pricing` - Update one or both prices. Validates AZN format (non-negative, ≤2 decimals). Persisted to `app_settings`.

### Admin Subscriptions / Purchasers (`/admin/subscriptions`) - Phase 7
- `GET /admin/subscriptions?page=N&page_size=20&status=active&plan=lifetime` - Read-only paginated list of subscription rows, joined with `user.email`. Ordered by `purchased_at` desc, then `created_at` desc. Refund and edit endpoints come with 7.8 / 7.9.

### Health
- `GET /health` - Health check endpoint

### Admin (`/admin/*`) - Requires admin privileges
- `GET /admin/stats` - Dashboard statistics (user counts, event counts, etc.)
- `GET /admin/users` - List all users with pagination and filtering
- `GET /admin/users/:id` - Get user details
- `GET /admin/users/:id/details` - Get comprehensive user details (all skills, events, categories, templates)
- `POST /admin/users` - Create new user
- `PATCH /admin/users/:id` - Update user (email, password, is_admin)
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/categories` - List all categories
- `POST /admin/categories` - Create category
- `PATCH /admin/categories/:id` - Update category
- `DELETE /admin/categories/:id` - Delete category
- `GET /admin/skills` - List all skills with freshness
- `POST /admin/skills` - Create skill
- `PATCH /admin/skills/:id` - Update skill
- `DELETE /admin/skills/:id` - Delete skill
- `GET /admin/learning-events` - List all learning events
- `POST /admin/learning-events` - Create learning event
- `PATCH /admin/learning-events/:id` - Update learning event
- `DELETE /admin/learning-events/:id` - Delete learning event
- `GET /admin/practice-events` - List all practice events
- `POST /admin/practice-events` - Create practice event
- `PATCH /admin/practice-events/:id` - Update practice event
- `DELETE /admin/practice-events/:id` - Delete practice event
- `GET /admin/templates` - List all event templates
- `POST /admin/templates` - Create template
- `PATCH /admin/templates/:id` - Update template
- `DELETE /admin/templates/:id` - Delete template
- `GET /admin/tickets` - List all tickets with pagination and filtering
- `GET /admin/tickets/:id` - Get ticket with replies
- `PATCH /admin/tickets/:id` - Update ticket status
- `POST /admin/tickets/:id/replies` - Add admin reply to ticket
- `DELETE /admin/tickets/:id` - Delete ticket

**Response Format:**
- Success: `{ data: ... }` or direct data
- Error: `{ detail: "error message" }`

---

## Frontend Structure

### Pages
1. **Landing** (`/`) - Marketing homepage with features and philosophy (public)
2. **Features** (`/features`) - Detailed features page with all capabilities (public)
3. **Login** (`/login`) - User authentication
4. **Register** (`/register`) - Account creation
5. **Forgot Password** (`/forgot-password`) - Request password reset email
6. **Reset Password** (`/reset-password`) - Set new password with token
7. **Dashboard** (`/dashboard`) - Overview with weekly stats and skill freshness
8. **Skills** (`/skills`) - Grid/list view of all skills
9. **Skill Detail** (`/skills/:id`) - Timeline of events, add event forms
10. **Analytics** (`/analytics`) - Activity calendar, charts for balance and freshness distribution
11. **Settings** (`/settings`) - Alert preferences, export, account deletion
12. **Support** (`/support`) - Support ticket list, create new tickets
13. **Ticket Detail** (`/support/:id`) - View ticket details and replies, add replies
14. **Activity Report** (`/reports/activity`) - PRO, print-styled date-range "time invested" report + CSV download; standalone (no app Layout) for clean printing (Time-Invested suite)

### Admin Pages (Admin only)
1. **Admin Dashboard** (`/admin`) - System statistics and quick actions
2. **Admin Users** (`/admin/users`) - User management with CRUD operations
3. **Admin User Detail** (`/admin/users/:userId`) - Comprehensive user data view with tabs for overview, skills, learning events, practice events, categories, and templates
4. **Admin Categories** (`/admin/categories`) - Category management
5. **Admin Skills** (`/admin/skills`) - Skills management with freshness display
6. **Admin Learning Events** (`/admin/learning-events`) - Learning event management
7. **Admin Practice Events** (`/admin/practice-events`) - Practice event management
8. **Admin Templates** (`/admin/templates`) - Event template management
9. **Admin Tickets** (`/admin/tickets`) - Support ticket management, view all tickets
10. **Admin Ticket Detail** (`/admin/tickets/:id`) - View ticket details, respond to users, update status

### Components
- **Layout** - Header with navigation, footer with tagline (for authenticated pages)
- **AdminLayout** - Admin-specific layout with admin navigation
- **Landing** - Full marketing page with hero, features, and footer
- **ProtectedRoute** - Auth guard for authenticated pages
- **AdminProtectedRoute** - Auth guard for admin pages (requires is_admin = true)
- **Pagination** - Reusable pagination component for admin tables

### Context
- **AuthContext** - User authentication state, login/logout functions
- **ThemeContext** - Dark/light theme state, theme toggle, localStorage persistence
- **OnboardingContext** - Onboarding wizard state, step navigation, completion tracking

### Services
- **api.ts** - Axios instance with interceptors, all API calls organized by resource

### Types
- **index.ts** - TypeScript interfaces for User, Skill, Events, Analytics data, CalendarData

---

## Alert System

**Philosophy:** Calm, never urgent. Infrequent (max 1 email per week per user). User-controlled. No push notifications.

### Alert Types

#### 1. Decay Alert
- **Trigger:** Skill freshness < 40%
- **Frequency:** Once per skill per 14 days
- **Message:** "Your skill in [name] hasn't been practiced in [X] days. Current freshness: [Y%]."
- **User Setting:** `decay_alerts_enabled`

#### 2. Practice Gap Alert
- **Trigger:** 3+ learning events, 0 practice events, 30+ days old
- **Frequency:** Once per skill (ever)
- **Message:** "You've been learning [name] but haven't applied it yet. Consider a small practice project."
- **User Setting:** `practice_gap_alerts_enabled`

#### 3. Imbalance Alert
- **Trigger:** Monthly ratio <0.2 for 2 consecutive months
- **Frequency:** Once per month
- **Message:** "This month you logged [X] learning events and [Y] practice events. This is normal during learning phases, but long-term retention requires application."
- **User Setting:** `imbalance_alerts_enabled`

### Alert Delivery
- Email only (plain text, no HTML)
- One-click unsubscribe link to settings
- Clear, honest subject lines
- Processed via scheduled cron job: `backend/run_alerts.py`

### Cron Setup
```bash
# Daily at 9 AM
0 9 * * * cd /path/to/backend && /path/to/venv/bin/python run_alerts.py
```

---

## File Structure

```
d:\skillfade/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Settings (Pydantic BaseSettings) — incl. EPOINT_* keys
│   │   │   ├── database.py        # SQLAlchemy engine, session factory
│   │   │   ├── security.py        # JWT, password hashing
│   │   │   ├── epoint.py          # Epoint.az signature builder/verifier + stub HTTP methods (Phase 7)
│   │   │   └── __init__.py
│   │   ├── models/
│   │   │   ├── user.py            # User model
│   │   │   ├── skill.py           # Skill model (includes category_id, decay_rate)
│   │   │   ├── category.py        # Category model
│   │   │   ├── event.py           # LearningEvent, PracticeEvent models
│   │   │   ├── event_template.py  # EventTemplate model (Phase 1)
│   │   │   ├── ticket.py          # Ticket, TicketReply models
│   │   │   ├── activity_log.py    # ActivityLog model
│   │   │   ├── subscription.py    # Subscription model (Phase 7)
│   │   │   ├── app_setting.py     # AppSetting key/value model (Phase 7)
│   │   │   └── __init__.py
│   │   ├── routers/
│   │   │   ├── auth.py            # Auth endpoints
│   │   │   ├── skills.py          # Skill CRUD endpoints
│   │   │   ├── categories.py      # Category CRUD endpoints
│   │   │   ├── events.py          # Event CRUD endpoints
│   │   │   ├── analytics.py       # Analytics endpoints (includes freshness history)
│   │   │   ├── settings.py        # Settings endpoints
│   │   │   ├── templates.py       # Event template CRUD endpoints (Phase 1)
│   │   │   ├── tickets.py         # User ticket endpoints
│   │   │   ├── logs.py            # Activity log endpoints
│   │   │   ├── billing.py         # GET /api/billing/me (Phase 7)
│   │   │   ├── admin.py           # Admin panel CRUD endpoints for all tables (includes tickets)
│   │   │   └── __init__.py
│   │   ├── schemas/
│   │   │   ├── user.py            # Pydantic schemas for users
│   │   │   ├── skill.py           # Pydantic schemas for skills (includes FreshnessHistory, CategoryInfo)
│   │   │   ├── category.py        # Pydantic schemas for categories
│   │   │   ├── event.py           # Pydantic schemas for events
│   │   │   ├── event_template.py  # Pydantic schemas for templates (Phase 1)
│   │   │   ├── ticket.py          # Pydantic schemas for tickets
│   │   │   ├── activity_log.py    # Pydantic schemas for activity logs
│   │   │   ├── subscription.py    # SubscriptionSummary + SubscriptionResponse (Phase 7)
│   │   │   ├── admin.py           # Admin-specific Pydantic schemas (includes tickets)
│   │   │   └── __init__.py
│   │   ├── services/
│   │   │   ├── auth.py            # Auth business logic
│   │   │   ├── freshness.py       # Freshness calculation algorithms (includes history + personal records)
│   │   │   ├── alerts.py          # Alert checking and sending
│   │   │   ├── entitlements.py    # PlanInfo, get_user_plan, can_use_feature, require_pro (Phase 7)
│   │   │   ├── site_settings.py   # Admin-editable key/value settings with env-var fallback (Phase 7)
│   │   │   └── __init__.py
│   │   └── main.py                # FastAPI app, CORS, router includes
│   ├── alembic/
│   │   ├── versions/
│   │   │   ├── 20240101_0001-initial_migration.py
│   │   │   ├── 20260109_0002-phase1_features.py  # Custom decay rates + templates
│   │   │   ├── 20260110_0003-phase2_features.py  # Freshness targets
│   │   │   ├── 20260110_0004-phase6_features.py  # Notes + skill dependencies
│   │   │   ├── 20260112_0005-category_as_object.py  # Categories as objects with FK
│   │   │   ├── 20260113_0006-admin_panel.py      # Admin panel - is_admin field
│   │   │   ├── 20260115_0007-tickets_system.py   # Tickets and ticket replies tables
│   │   │   ├── 20260120_0008-activity_logs.py    # Activity log tracking
│   │   │   ├── 20260515_0009-subscriptions.py    # Subscriptions table (Phase 7)
│   │   │   ├── 20260515_0010-grandfather_users.py # Grandfather all existing users to PRO (Phase 7)
│   │   │   └── 20260515_0011-app_settings.py     # Admin-editable key/value settings (Phase 7)
│   │   └── env.py
│   ├── tests/
│   │   ├── conftest.py            # Shared SQLite session + TestClient fixtures (Phase 7) — uses StaticPool so commits don't drop the in-memory schema
│   │   ├── test_auth.py
│   │   ├── test_freshness.py
│   │   ├── test_epoint.py         # Epoint signature tests incl. byte-exact doc fixture (Phase 7)
│   │   ├── test_entitlements.py   # Entitlement service + /api/billing/me tests (Phase 7)
│   │   ├── test_pricing.py        # site_settings service + /api/admin/pricing tests (Phase 7)
│   │   ├── test_admin_subscriptions.py # /api/admin/subscriptions (purchasers) tests (Phase 7)
│   │   └── __init__.py
│   ├── alembic.ini               # Alembic config
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── pytest.ini
│   └── run_alerts.py             # Cron job script
├── frontend/
│   ├── public/
│   │   ├── favicon.svg              # App favicon (Phase 6 PWA)
│   │   ├── pwa-192x192.svg          # PWA icon 192x192 (Phase 6 PWA)
│   │   └── pwa-512x512.svg          # PWA icon 512x512 (Phase 6 PWA)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx           # Includes QuickLogWidget + BuyMeACoffee footer link
│   │   │   ├── AdminLayout.tsx      # Admin-specific layout with admin navigation
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── AdminProtectedRoute.tsx  # Auth guard for admin pages
│   │   │   ├── QuickLogWidget.tsx   # Floating quick log button (Phase 1)
│   │   │   ├── OnboardingWizard.tsx # 13-step onboarding wizard for first-time users
│   │   │   ├── BuyMeACoffee.tsx     # Subtle support button component (link/button/card variants)
│   │   │   ├── ProGate.tsx          # Inline PRO gate — renders children if isPro, else placeholder (Phase 7)
│   │   │   └── admin/
│   │   │       └── Pagination.tsx   # Reusable pagination for admin tables
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── PlanContext.tsx       # Current user plan + entitlements (Phase 7)
│   │   │   ├── ThemeContext.tsx      # Dark/Light theme management
│   │   │   └── OnboardingContext.tsx # Onboarding wizard state management
│   │   ├── pages/
│   │   │   ├── Landing.tsx          # Marketing homepage + BuyMeACoffee footer link
│   │   │   ├── Features.tsx         # Detailed features page (public)
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx   # Password reset request page
│   │   │   ├── ResetPassword.tsx    # Set new password page
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Skills.tsx           # Category selector, grid/grouped view, filter by category
│   │   │   ├── SkillDetail.tsx      # Updated with notes + dependencies UI (Phase 6)
│   │   │   ├── Analytics.tsx
│   │   │   ├── Settings.tsx         # Includes BuyMeACoffee support card
│   │   │   ├── Support.tsx          # User support ticket list and creation
│   │   │   ├── TicketDetail.tsx     # User ticket detail with replies
│   │   │   └── admin/               # Admin panel pages
│   │   │       ├── index.ts
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminUsers.tsx
│   │   │       ├── AdminUserDetail.tsx  # Comprehensive user data view
│   │   │       ├── AdminSkills.tsx
│   │   │       ├── AdminCategories.tsx
│   │   │       ├── AdminLearningEvents.tsx
│   │   │       ├── AdminPracticeEvents.tsx
│   │   │       ├── AdminTemplates.tsx
│   │   │       ├── AdminTickets.tsx     # Admin ticket list and management
│   │   │       ├── AdminTicketDetail.tsx # Admin ticket detail with status updates
│   │   │       ├── AdminPricing.tsx     # Edit lifetime + early-bird AZN prices (Phase 7)
│   │   │       └── AdminPurchasers.tsx  # Read-only list of subscription rows (Phase 7)
│   │   ├── hooks/
│   │   │   ├── useActivityLogger.tsx # Activity log tracking wrapper
│   │   │   └── usePlan.ts            # usePlan / useIsPro / useFeatureLimit (Phase 7)
│   │   ├── services/
│   │   │   └── api.ts            # Axios client, all API calls (incl. billing.me())
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces (incl. Plan, PlanLimits, PlanResponse)
│   │   ├── tests/
│   │   │   └── App.test.tsx
│   │   ├── App.tsx               # Routes, AuthContext provider
│   │   ├── main.tsx              # React entry point
│   │   └── vite-env.d.ts
│   ├── Dockerfile
│   ├── index.html                # Updated with PWA meta tags (Phase 6)
│   ├── package.json              # Added vite-plugin-pwa (Phase 6)
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts            # Added PWA configuration (Phase 6)
├── docs/
│   ├── architecture.md           # System architecture
│   ├── api.md                    # API documentation
│   ├── deployment.md             # Basic deployment guide
│   └── VPS_DEPLOYMENT_GUIDE.md   # Comprehensive VPS deployment guide
├── scripts/
│   ├── deploy.sh                 # Automated deployment script (git pull, build, migrate, restart)
│   ├── healthcheck.sh            # Service health monitoring script
│   ├── backup.sh                 # Database backup script with retention
│   └── grant_admin.py            # Script to grant/revoke admin privileges
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── .gitignore
├── docker-compose.yml            # Container orchestration
├── README.md                     # Project overview
├── SETUP.md                      # Quick setup guide
├── PROJECT_SUMMARY.md            # What was built
├── PROJECT_PROMPT.md             # Original specification
└── PROJECT_CONTEXT.md            # This file
```

---

## Environment Configuration

### `.env` File

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/learning_tracker
# Or for SQLite: sqlite:///./learning_tracker.db

# Security
SECRET_KEY=<generate-with-openssl-rand-hex-32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (optional for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@learning-tracker.local

# Application
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Alerts
ENABLE_ALERTS=true
MAX_ALERTS_PER_WEEK=1

# Environment
ENVIRONMENT=development

# Epoint.az Payment Provider (Phase 7)
# Public/private keys are issued by Epoint after merchant verification.
# Leave blank for foundation work; checkout flow requires real values.
EPOINT_PUBLIC_KEY=
EPOINT_PRIVATE_KEY=
EPOINT_BASE_URL=https://epoint.az/api/1
EPOINT_RESULT_URL=https://skillfade.website/api/webhooks/epoint
EPOINT_SUCCESS_URL=https://skillfade.website/billing/success
EPOINT_ERROR_URL=https://skillfade.website/billing/error
EPOINT_LIFETIME_PRICE_AZN=49.00
EPOINT_EARLY_BIRD_PRICE_AZN=35.00
```

### Docker Compose Setup

**Services:**
1. `db` - PostgreSQL 15 database
2. `backend` - FastAPI app (port 8000)
3. `frontend` - React app (port 3000)

**Volumes:**
- `postgres_data` - Persistent database storage

---

## Development Workflow

**Primary Development Environment:** Docker (recommended)

Both frontend and backend run in Docker containers during development. This ensures consistent environments and avoids local dependency issues.

### Quick Start (Docker)
```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your settings

# 2. Start containers
docker-compose up -d

# 3. Run migrations
docker-compose exec backend alembic upgrade head

# 4. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs

# 5. View logs
docker-compose logs -f frontend  # Frontend logs
docker-compose logs -f backend   # Backend logs

# 6. Rebuild after changes
docker-compose up -d --build     # Rebuild containers
```

### Manual Setup (Alternative)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations
```bash
# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "description"

# Apply migrations
docker-compose exec backend alembic upgrade head

# Rollback migration
docker-compose exec backend alembic downgrade -1
```

### Testing
```bash
# Backend tests
cd backend
pytest --cov=app tests/

# Frontend tests
cd frontend
npm test
```

---

## Key Implementation Details

### Authentication Flow
1. User registers → password truncated to 72 bytes (bcrypt limit) → hashed with bcrypt → stored in DB
2. User logs in → credentials validated (password truncated to 72 bytes) → JWT token generated (30 min expiry) with UTC timezone-aware timestamp
3. Token stored in `localStorage`
4. Axios interceptor adds token to all requests
5. 401 responses → redirect to login

### Dashboard Real-time Updates
1. Dashboard component listens to custom `dashboard-refresh` event
2. When events are added in SkillDetail page, custom event is dispatched via `window.dispatchEvent()`
3. Dashboard automatically refetches analytics and skills data without page reload
4. Ensures dashboard counts update immediately after adding learning/practice events

### Freshness Calculation Flow
1. Fetch skill with related learning_events and practice_events
2. Extract dates from events
3. Call `calculate_freshness()` with events and skill creation date
4. Return freshness percentage with visual indicator

### Event Logging Flow
1. User selects skill
2. Chooses event type (learning or practice)
3. Fills form: date, subtype, notes (optional), duration (optional)
4. POST to appropriate endpoint
5. Frontend refreshes skill data
6. Freshness recalculated automatically

### Analytics Calculation
1. Query events within time period (week/month/quarter)
2. Count learning vs practice events
3. Calculate balance ratio
4. Return data for charts (Recharts line/bar charts)

### Alert Processing
1. Cron job runs `run_alerts.py` daily at 9 AM
2. Queries all users and active skills
3. Checks alert conditions (decay, practice gap, imbalance)
4. Filters already-sent alerts based on user settings timestamps
5. Sends plain text emails via SMTP
6. Updates user settings with alert timestamps

---

## Common Tasks for AI Agents

### Adding a New API Endpoint
1. Create schema in `backend/app/schemas/`
2. Add route function in appropriate router (`backend/app/routers/`)
3. Add business logic to `backend/app/services/` if needed
4. Update frontend API client (`frontend/src/services/api.ts`)
5. Add TypeScript types (`frontend/src/types/index.ts`)
6. Create/update page component to use new endpoint

### Adding a New Database Field
1. Update model in `backend/app/models/`
2. Update Pydantic schema in `backend/app/schemas/`
3. Create migration: `alembic revision --autogenerate -m "description"`
4. Review and edit migration file
5. Apply migration: `alembic upgrade head`
6. Update frontend TypeScript types

### Modifying Core Algorithm
1. Update function in `backend/app/services/freshness.py`
2. Add/update tests in `backend/tests/test_freshness.py`
3. Run tests: `pytest`
4. Document changes in this file and architecture docs

### Adding a New Page
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation link in `frontend/src/components/Layout.tsx`
4. Create API functions if needed in `frontend/src/services/api.ts`

---

## Privacy & Data Ownership

### What We Don't Do
- ❌ No analytics inside the app — your activity on `/dashboard`, `/skills`, `/analytics`, `/settings`, `/support`, and `/admin` is never tracked
- ❌ No external API calls (except user-configured SMTP and Google Analytics on public marketing pages — see below)
- ❌ No data sharing
- ❌ No tracking pixels
- ❌ No ads, no ad personalization, no cross-site tracking

### Analytics on public marketing pages only
- Google Analytics 4 fires on public pages (`/`, `/features`, `/faq`, `/what-is-learning-decay`, `/use-cases`, `/comparisons`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/privacy`) to count visitors and see country distribution.
- Gated by Consent Mode v2 — no data is sent until the user accepts the cookie banner.
- Configured with `anonymize_ip`, `send_page_view: false` (manual page views from `RouteTracker`), and ad signals disabled.
- Full disclosure on `/privacy`.

### What Users Control
- ✅ Full data export (JSON format)
- ✅ Permanent account deletion (cascade deletes all data)
- ✅ Alert preferences (enable/disable each type)
- ✅ Email only used for alerts and password reset

---

## Design Constraints (DO NOT VIOLATE)

### What NOT to Add
1. **No AI/ML** - No recommendation engines, auto-categorization, or predictive analytics
2. **No Social Features** - No user profiles, following, sharing, or leaderboards
3. **No Gamification** - No points, badges, streaks, or levels
4. **No Automation** - No auto-logging from GitHub/Twitter; user manually logs everything
5. **No Complexity** - No GraphQL, websockets (unless proven need), Redis, Kubernetes
6. **No Microservices** - Keep monolithic architecture
7. **No Over-engineering** - No event sourcing, CQRS, or premature optimization

### Design Priorities (In Order)
1. Simplicity
2. User trust and privacy
3. Calm UX
4. Long-term maintainability
5. Performance (only when bottleneck proven)

---

## Troubleshooting

### Backend Won't Start
- Check port 8000 availability
- Verify Python version: `python --version` (3.11+)
- Check DATABASE_URL in .env
- Check database connection: `docker-compose logs db`

### Frontend Won't Start
- Check port 3000 availability
- Verify Node version: `node --version` (18+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Database Migration Issues
- Check alembic.ini `sqlalchemy.url` matches .env `DATABASE_URL`
- Verify database exists and is accessible
- Check migration files in `backend/alembic/versions/`

### Authentication Issues
- Check SECRET_KEY is set in .env
- Verify JWT token in localStorage (browser DevTools)
- Check token expiry (30 minutes default)
- Verify CORS settings in `backend/app/main.py`

---

## Version Information

**Current Version:** 1.0.0
**Python:** 3.11+
**Node.js:** 18+
**PostgreSQL:** 15+
**React:** 18.2.0
**FastAPI:** 0.109.0

---

## Related Documentation

- [README.md](README.md) - Project overview and quick start
- [SETUP.md](SETUP.md) - Detailed setup instructions
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - What was built
- [PROJECT_PROMPT.md](PROJECT_PROMPT.md) - Original specification
- [docs/architecture.md](docs/architecture.md) - System architecture details
- [docs/api.md](docs/api.md) - Complete API reference
- [docs/deployment.md](docs/deployment.md) - Basic deployment guide
- [docs/VPS_DEPLOYMENT_GUIDE.md](docs/VPS_DEPLOYMENT_GUIDE.md) - Comprehensive VPS deployment guide (Docker & manual, SSL, backups, monitoring) - Supports Ubuntu 22.04 & 24.04 LTS

---

---

## UI/UX Design

### Visual Design System

> **Design language: "Ember & Almanac" (redesigned 2026-06-09).** A warm, calm,
> editorial **dark** theme — a candlelit reading room / personal almanac, not a
> cold neon dashboard. It replaces an earlier generic dark-neon (cyan/purple/glow,
> Inter) theme that read as default "AI slop" and contradicted the calm-mirror
> brand. The whole system is driven by semantic Tailwind tokens + `@layer components`
> classes in `tailwind.config.js` and `src/index.css`, so the look is changed there
> and cascades across all pages — individual pages rarely hardcode colors.

**Brand Identity:**
- **Name:** SkillFade
- **Tagline:** "A mirror, not a coach"
- **Logo mark:** `LogoIcon` — three descending bars at full → 0.7 → 0.4 opacity (a skill fading). Sits in a sage→clay gradient chip with near-black (`surface-50`) glyph.
- **Wordmark:** "SkillFade" set in Fraunces (serif) with a `Beta` tag.
- **Color Scheme (warm, earthy, muted — never neon):**
  - Surfaces (espresso scale): `surface-50` #14100A (darkest; also the foreground glyph/text color on bright accent fills) → `surface-100` #1A150E (page bg) → `200` #221C13 (cards) → `300` #2B2419 (elevated/inputs) → `400` #3A3122 → `500` #4C4130.
  - Primary accent — **sage** (#8FB382 at 400): links, primary buttons, focus rings, "fresh."
  - Secondary accent — **clay/terracotta** (#C8795A at 400): logo-gradient end, balance figures, accents.
  - Freshness — **sage → honey (#C9A24E) → clay (#C87B64)**, earthy and calm; deliberately no alarm-red.
  - Text — warm parchment: `txt-primary` #F4ECDD, `txt-secondary` #C7B9A2, `txt-muted` #9C8E76 (all ≥ AA on cards).
  - Borders — warm hairline rules: `border-subtle` #2A2318, `border` #392F20, `border-emphasis` #4E4231.
  - Atmosphere — a fixed faint paper-grain overlay (SVG fractal noise, `body::after`, ~4% opacity), a whisper-soft warm `gradient-mesh`, and low-opacity warm "candlelit" ambient shadows (`shadow-glow-*`) that replaced the old neon glows.

**Typography (distinctive pairing — no Inter):**
- **Display / headings / wordmark:** **Fraunces** (soft characterful serif, optical sizing). Applied to all `h1–h6` via the base layer and to `.text-display-*` marquee numbers via `font-display`.
- **Body / UI:** **Hanken Grotesk** (warm humanist sans) — the `font-sans` default.
- **Numerals / metadata:** **IBM Plex Mono** (`font-mono`) for freshness %, "days ago," dates — an instrument/ledger feel; pair with `tabular-nums`.
- **Display scale:** `display-xl` 4.5rem → `display-lg` 3.5rem → `display-md` 2.5rem → `display-sm` 1.75rem, tight tracking, weight 600.

**Signature motif — the "fade bar":** freshness bars use `.fade-track` + `.fade-fill` + `.fade-fill-{fresh|aging|decayed}`, an ink→light horizontal gradient that fades toward its leading edge — the product name made literal. Used on Dashboard/Skills.

**Spacing & Layout:**
- Max Width: 1280px (7xl container)
- Padding: 1rem (mobile), 1.5rem (tablet), 2rem (desktop)
- Card Padding: 1.5rem-2rem
- Gap: 1rem-1.5rem between elements

### Component Library

**Landing Page:**
- Full-screen hero with gradient background
- Sticky header with logo and CTA buttons
- Feature cards with hover animations
- Three realities section with icons
- Philosophy section with centered content
- Footer with multi-column layout

**Authentication Pages:**
- Centered card layout with backdrop blur
- Gradient headers
- Floating logo in top-left
- Form inputs with focus rings
- Error messages with slide-down animation

**Application Layout:**
- Sticky header: brand + 3 primary tabs (Dashboard/Skills/Analytics) + "Account" dropdown (Settings, Support, Admin, Buy me a coffee, Logout); hamburger menu below `md`
- Logo with Beta badge
- Main content area with max-width container
- Footer with tagline and values
- Gradient background throughout

**Dashboard:**
- Stats cards with icons and gradient numbers
- Hover effects with lift animation
- Skill cards with freshness indicators
- Empty states with large emoji icons

**Analytics Page:**
- Activity calendar showing monthly view with navigation
- Calendar cells display learning (blue) and practice (green) event counts
- Click on date to expand and view detailed events
- Event cards show skill name, type, duration, and notes
- Today's date highlighted with blue background
- Legend for learning/practice color coding

**Skills Page:**
- Grid layout (1-2-3 columns responsive)
- Card-based skill display
- Modal for adding new skills
- Freshness color coding (green, yellow, red)

**Common Patterns:**
- Warm panels: `.card` / `.card-elevated` / `.card-interactive` (espresso surfaces + hairline `border-*` rules + soft `shadow-card`); headers use `surface-200/80` + `backdrop-blur-xl`
- Reusable component classes (in `src/index.css`): `.btn-primary` (sage), `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.input`, `.select`, `.tag` / `.tag-accent` / `.tag-secondary` / `.tag-decayed`, `.status-{fresh,aging,decayed,neutral}`, `.fade-track` / `.fade-fill*`, `.label-caps` (small-caps ledger label)
- Rounded corners: lg (0.5rem) buttons/inputs, xl (0.75rem) cards, 2xl (1rem) modals
- Transitions: 200-300ms ease; card hover lifts `-translate-y-0.5` + `shadow-card-hover`
- Motion respects `prefers-reduced-motion` (animations/transitions reduced to ~0)

### Animations

**Keyframe Animations:**
- `fadeIn`: 0.6s opacity transition
- `slideUp`: 0.6s upward movement with fade
- `slideDown`: 0.6s downward movement with fade
- `scaleIn`: 0.4s scale with fade
- `pulse-slow`: 3s infinite pulse

**Animation Delays:**
- 200ms, 400ms, 600ms, 800ms for staggered effects

**Usage:**
- Page load: fade-in on containers
- Hero elements: slide-up with delays
- Modals: scale-in entrance
- Errors: slide-down alerts
- Cards: hover translate-y and shadow changes

### Accessibility

**Color Contrast:**
- All text meets WCAG AA standards
- Gradient text has sufficient contrast
- Focus states clearly visible (blue ring)

**Interactive Elements:**
- All buttons have hover and active states
- Links have underline on hover
- Form inputs have clear focus indicators
- Disabled states are visually distinct

**Responsive Design:**
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Both headers collapse below `md` into a hamburger-triggered slide-down disclosure menu (see "Header & Navigation Redesign")
- Grid layouts adapt: 1 → 2 → 3 columns

### Custom Utilities

**Tailwind utilities & component classes** (defined in `src/index.css`):
- `.text-gradient-accent`: sage→clay gradient text (the "fade")
- `.bg-mesh`: warm espresso + whisper-soft earthen `gradient-mesh`
- `.label-caps`: small-caps ledger label (`tracking-label` 0.12em)
- `.animation-delay-100..500`: staggered reveals
- `.fade-track` / `.fade-fill` / `.fade-fill-{fresh,aging,decayed,neutral}`: signature freshness bars
- `.glow-{accent,fresh,aging,decayed}`: soft warm ambient halos (not neon)

**Scrollbar Styling:**
- Warm webkit scrollbar (9px), `surface-400` thumb on `surface-100` track, rounded

### Design Tokens

**Border Radius:** lg 0.5rem (buttons/inputs) · xl 0.75rem (cards) · 2xl 1rem (modals) · full (badges/pills)

**Shadows (warm):** `shadow-card` (default panel) · `shadow-card-hover` (lift/modal) · `shadow-glow-{accent,secondary,fresh,aging,decayed}` (soft candlelit ambient, low opacity)

**Icons:**
- **lucide-react** icon set (NOT emoji) throughout the app and admin
- Freshness state shown via colored `.status-{fresh,aging,decayed}` dots + `.fade-fill` bars

### Theme Model (single warm-dark)

The app ships a **single, cohesive warm-dark theme** ("Ember & Almanac"). There is no
light variant and no per-user light/dark toggle in the product surface — `html` is
`color-scheme: dark` and the body is always the espresso palette. `darkMode: 'class'`
remains set in `tailwind.config.js` (harmless; the design does not depend on a `.dark`
class, and no `.dark` class is added to `html`).

> **Implementation note for future agents:** because `.dark` is never applied, any
> Tailwind `dark:` variant classes are dead (they never activate) and any bare
> light-mode classes (`bg-white`, `text-gray-*`, `amber-50`, etc.) render as-is on the
> dark theme — both are bugs. Use the semantic tokens (`surface-*`, `txt-*`, `accent-*`,
> `secondary-*`, `fresh/aging/decayed`, `border-*`) instead. `ThemeContext` may still
> exist in the tree but is effectively a no-op for styling.

**Contrast:** the palette is tuned to WCAG AA — `txt-muted` ≥ 4.5:1 on the lightest
card (`surface-300`), and near-black `surface-50` glyphs/labels read ≥ 5.7:1 on every
accent fill (sage/clay/honey). Re-check these two cases when adjusting any token.

---

**Last Updated:** 2026-06-13
**Project Status:** Production-ready MVP with "Ember & Almanac" UI redesign (warm editorial dark theme) + Activity Calendar + Phase 1, 2, 6 & Category Features + Admin Panel + Buy Me a Coffee Integration + Support Ticketing System + Onboarding Wizard + Forgot Password System + Comprehensive VPS Deployment Guide (Ubuntu 22.04 & 24.04 LTS) + Google Search Console + Google Analytics 4 (Consent Mode v2) + Per-page SEO with structured data + robots.txt + sitemap.xml + Privacy Policy page + Live Payments (Epoint via gateway hub) + Time-Invested Suite (hours dashboard + Activity Report) ✅

### Phase 1 Features (Completed 2026-01-09)
- **Freshness History Graph**: Line chart showing skill freshness over 90 days
- **Custom Decay Rates**: Per-skill decay rate settings with presets
- **Quick Log Widget**: Floating button for rapid event logging
- **Event Templates**: Save and reuse common event configurations
- **Features Page**: Dedicated public page (`/features`) showcasing all capabilities

### Phase 2 Features (Completed 2026-01-10)
- **Period Comparisons**: Month-over-month comparison showing changes in learning/practice activity
- **Skill Category Aggregations**: View average freshness and total activity grouped by category
- **Freshness Targets**: Set personal freshness thresholds per skill with visual indicators
- **Personal Records**: Track longest fresh streak, peak freshness, most active week, and longest gap recovered

### Category as Object Feature (Completed 2026-01-12)
- **Categories Table**: Categories are now objects stored in database with unique names per user
- **Category CRUD API**: Full CRUD endpoints for managing categories (`/api/categories/*`)
- **Category Selection**: When adding a skill, users can select from existing categories or create a new one
- **Category Filtering**: Filter skills by category in the Skills page
- **Grouped View**: Toggle between grid view and grouped-by-category view
- **Auto-creation**: Creating a skill with a new category name automatically creates the category

### Phase 6 Features (Completed 2026-01-10)
- **Progressive Web App (PWA)**: App installable on mobile/desktop, works offline with service worker caching
- **Skill Dependencies**: Mark prerequisite relationships between skills, see alerts when foundations decay
- **Skill Notes/Journal**: Add persistent notes to skills for resources, goals, and context

### Admin Panel Feature (Completed 2026-01-13, Updated 2026-01-14)
- **Admin Dashboard**: System statistics showing total users, skills, events, templates
- **User Management**: Full CRUD operations for users, toggle admin privileges
- **Comprehensive User Details View**: View all user data in one place including:
  - Summary statistics (skills, events, time spent, average freshness)
  - All skills with freshness indicators
  - All learning events with skill names, dates, types, durations
  - All practice events with skill names, dates, types, durations
  - All categories with skill counts
  - All event templates
  - Recent activity (last 30 days)
  - User settings
- **Category Management**: Create, edit, delete categories for any user
- **Skill Management**: View and edit all skills with freshness indicators
- **Learning Event Management**: Full CRUD for learning events across all users
- **Practice Event Management**: Full CRUD for practice events across all users
- **Template Management**: Manage event templates for all users
- **Filters & Search**: All admin tables have search bars and filter options
- **Pagination**: Server-side pagination for all admin tables
- **Admin Script**: `scripts/grant_admin.py` to grant/revoke admin privileges via CLI
- **Access Control**: Admin routes protected by `is_admin` flag on user model
- **Admin Navigation**: Separate admin layout with dedicated navigation menu

### Buy Me a Coffee Integration (Added 2026-01-15)
- **Reusable Component**: `BuyMeACoffee.tsx` with three variants (link, button, card)
- **Subtle Placement**: Non-intrusive integration that respects the calm design philosophy
- **Locations**:
  - Layout header (authenticated pages) - Small button between nav and Admin/Logout (hidden on mobile)
  - Layout footer (authenticated pages) - Small link alongside philosophy badges
  - Landing page header (public) - Small button before Sign In (hidden on mobile)
  - Landing page footer (public) - Link in the brand column
  - Features page header (public) - Small button before Sign In (hidden on mobile)
  - Features page footer (public) - Link in the brand column
  - Settings page - Card variant between Privacy Statement and Danger Zone
- **Features Page Styling Fix**: Updated Features page to use design system classes (bg-mesh, card-interactive, card-elevated, text-txt-*, etc.) matching Landing page
- **Styling**: Uses amber/orange gradient to stand out subtly while fitting the design system
- **Configuration**: Update `coffeeUrl` in `BuyMeACoffee.tsx` with your actual Buy Me a Coffee URL

### Support Ticketing System (Added 2026-01-15)
- **Database Models**: Tickets and TicketReplies tables with proper relationships and cascade deletes
- **Ticket Workflow**: Status progression (open → in_progress → resolved → closed)
- **User Features**:
  - Support page (`/support`) to view all tickets and create new ones
  - Ticket detail page (`/support/:id`) to view ticket details and add replies
  - Navigation link in main layout with MessageSquare icon
- **Admin Features**:
  - Admin tickets page (`/admin/tickets`) with filtering by status and search
  - Admin ticket detail page (`/admin/tickets/:id`) with status updates and admin replies
  - Dashboard stat card showing total tickets with open ticket badge
  - Full CRUD operations for ticket management
- **API Endpoints**:
  - User: List tickets, create ticket, get ticket, add reply
  - Admin: List all tickets, get ticket, update status, add admin reply, delete ticket

### Onboarding Wizard (Added 2026-01-16)
- **13-Step Interactive Tour**: Comprehensive onboarding wizard that explains all SkillFade features
- **Step Overview**:
  1. Welcome - Greeting and tour duration (~2 min)
  2. Philosophy - "A mirror, not a coach" concept
  3. Three Realities - Learning Decay, Practice Scarcity, Input/Output Imbalance
  4. Freshness - Decay algorithm and visual indicators
  5. Skills Overview - Categories, custom decay rates, targets, dependencies
  6. Create First Skill - **Interactive** form to create an actual skill
  7. Events - Learning types vs Practice types comparison
  8. Balance Ratio - Input/output ratio explanation
  9. Dashboard - Overview of dashboard components
  10. Analytics - Calendar, charts, category stats
  11. Quick Log - Floating widget explanation
  12. Settings - Templates, export, alerts, privacy
  13. Complete - Summary and quick action buttons
- **User Settings Storage**: Uses `/api/settings` endpoint to store:
  - `hasCompletedOnboarding: boolean`
  - `onboardingCompletedAt: string (ISO timestamp)`
- **Trigger Conditions**: Shows for authenticated users where `hasCompletedOnboarding !== true`
- **UI/UX Features**:
  - Progress bar showing completion percentage
  - Step indicator dots
  - Smooth slide animations between steps
  - Skip Tour option (updates settings)
  - Back/Continue navigation
  - Responsive design (full-width on mobile, max-w-2xl on desktop)
- **View Tour Again**: Button in Settings page to restart the onboarding wizard
- **Components**:
  - `OnboardingContext.tsx` - State management for wizard visibility, current step, skill creation
  - `OnboardingWizard.tsx` - Main wizard component with all 13 step sub-components
- **Files Modified**:
  - `Layout.tsx` - Renders OnboardingWizard alongside QuickLogWidget
  - `App.tsx` - Wraps routes with OnboardingProvider
  - `Settings.tsx` - Added "View Tour Again" button
  - `index.css` - Added step transition animations (slideUpFade, pulseSlow)

### Forgot Password System (Added 2026-01-16)
- **Password Reset Flow**:
  1. User clicks "Forgot password?" on login page
  2. Enters email on `/forgot-password` page
  3. Backend generates JWT reset token (1 hour expiry)
  4. Email sent with reset link containing token
  5. User clicks link, lands on `/reset-password?token=...`
  6. Enters new password, token validated and password updated
- **Security Features**:
  - Token-based reset using JWT with 1-hour expiry
  - Reset token contains email and type claim for validation
  - Same response for valid/invalid emails (prevents email enumeration)
  - Password minimum 8 characters, bcrypt hashing
- **Backend Implementation**:
  - `security.py` - `create_password_reset_token()`, `decode_password_reset_token()`
  - `alerts.py` - `send_password_reset_email()` (bypasses ENABLE_ALERTS setting)
  - `auth.py` - `/forgot-password`, `/reset-password` endpoints
  - `schemas/user.py` - `PasswordResetRequest`, `PasswordReset` schemas (already existed)
- **Frontend Implementation**:
  - `ForgotPassword.tsx` - Email input form with success state
  - `ResetPassword.tsx` - New password form with validation, token error state
  - `Login.tsx` - Added "Forgot password?" link
  - `api.ts` - `forgotPassword()`, `resetPassword()` functions
  - `App.tsx` - Routes for `/forgot-password`, `/reset-password`

### SEO + Analytics Integration (Added 2026-05-14)
Full implementation plan lives in `SEO_AND_ANALYTICS_PLAN.md` at the project root.

#### Google Search Console
- **Property type:** URL prefix (`https://skillfade.app/`)
- **Verification method:** HTML meta tag in `frontend/index.html`
- **Verification code:** `dAQgMIpPclGzzEYBrPMV7zF-OHkKRtbqawB3eB4Tp14`

#### Google Analytics 4
- **Measurement ID:** `G-31B1MG861C`
- **Scope:** Public marketing pages only — never fires on `/dashboard`, `/skills`, `/analytics`, `/settings`, `/support`, `/admin`
- **Privacy:**
  - Consent Mode v2 with `analytics_storage: denied` as the default
  - `anonymize_ip: true`
  - `send_page_view: false` (manual page views from `RouteTracker` only)
  - Ad signals (`ad_storage`, `ad_user_data`, `ad_personalization`) all denied
- **Reports used:** Realtime, Acquisition, Demographics → Country, Pages and screens. No custom events.

#### New components
- `frontend/src/components/RouteTracker.tsx` — Whitelists 12 public routes (`/`, `/home`, `/features`, `/faq`, `/what-is-learning-decay`, `/use-cases`, `/comparisons`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/privacy`). Fires `gtag('event', 'page_view', ...)` only on those routes. Mounted in `App.tsx` inside `BrowserRouter`.
- `frontend/src/components/CookieBanner.tsx` — Calm bottom banner with Accept/Decline. Stores choice in `localStorage.analytics_consent`. Calls `gtag('consent', 'update', ...)` on accept. Only renders on public routes.

#### New page
- `frontend/src/pages/Privacy.tsx` — Full privacy disclosure at `/privacy`. Lists data collected, retention, opt-out instructions. Includes "Reset cookie preference" button.

#### SEO infrastructure files
- `frontend/public/robots.txt` — Allows public marketing pages, disallows authenticated routes (`/dashboard`, `/skills`, `/analytics`, `/settings`, `/support`, `/admin`, auth pages), links to sitemap.
- `frontend/public/sitemap.xml` — Static sitemap covering 12 URLs: `/`, `/features`, `/what-is-learning-decay`, `/learning-vs-practice`, `/skill-decay-formula`, `/use-cases`, `/comparisons`, `/compare/anki`, `/compare/notion`, `/compare/obsidian`, `/faq`, `/privacy`.

#### Per-page SEO updates
All public pages use the `<SEO />` component (`frontend/src/components/SEO.tsx`) with `react-helmet-async`. Each sets unique title, description, canonical URL, and page-appropriate structured data.

| Page | Title | Schema |
|---|---|---|
| `Landing.tsx` (`/`) | SkillFade — Skill Decay Tracker for Self-Directed Learners | WebSite + Organization + SoftwareApplication |
| `Features.tsx` (`/features`) | Features — Skill Freshness, Decay Alerts, Analytics | SoftwareApplication |
| `WhatIsLearningDecay.tsx` (`/what-is-learning-decay`) | What Is Learning Decay? Understanding the Forgetting Curve | Article |
| `UseCases.tsx` (`/use-cases`) | Use Cases — Who Uses SkillFade and Why | Article |
| `Comparisons.tsx` (`/comparisons`) | SkillFade vs Anki, Notion, Obsidian — Compared | Article |
| `FAQ.tsx` (`/faq`) | Frequently Asked Questions | FAQPage |
| `Privacy.tsx` (`/privacy`) | Privacy Policy | — |

Auth pages (`Login`, `Register`, `ForgotPassword`, `ResetPassword`) use `<SEO noIndex />` so they aren't indexed by search engines.

#### TypeScript ambient declarations
- `frontend/src/vite-env.d.ts` — Added `Window.dataLayer` and `Window.gtag` declarations for typed access to the GA4 globals.

#### Updated `index.html`
- Added Google Search Console verification meta tag.
- Added GA4 `gtag.js` snippet (async) with Consent Mode v2 default-denied, `anonymize_ip`, `send_page_view: false`.
- Reads `localStorage.analytics_consent` on page load and updates consent to `granted` if previously accepted (so returning visitors don't see the banner again).

#### Updated `Settings.tsx`
- Privacy statement rewritten to reflect that GA4 runs only on public pages and explicitly states in-app activity is never tracked.
- Added "Read the full privacy policy" link to `/privacy`.

#### Files modified summary
- Created: `RouteTracker.tsx`, `CookieBanner.tsx`, `Privacy.tsx`, `robots.txt`, `sitemap.xml`
- Modified: `index.html`, `App.tsx`, `vite-env.d.ts`, `Settings.tsx`, `Landing.tsx`, `Features.tsx`, `Comparisons.tsx`, `UseCases.tsx`, `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`

### Production Domain (Confirmed 2026-05-14)
- **Production domain:** `https://skillfade.website`
- All canonical URLs, structured data `url` fields, Open Graph URLs, sitemap entries, and meta tags reference `skillfade.website`. An earlier draft mistakenly used `skillfade.app`; that's been fully replaced.

### Additional SEO Pages (Added 2026-05-14)
Five new public marketing pages added to expand keyword coverage and indexable surface area.

#### Comparison pages (`/compare/*`)
Each is a dedicated landing page targeting a specific competitor keyword. They include TL;DR tables, side-by-side feature breakdowns, honest "when to choose each" sections, and "use them together" guidance to build trust.
- `frontend/src/pages/compare/Anki.tsx` (`/compare/anki`) — SkillFade vs Anki (flashcards / spaced repetition for facts)
- `frontend/src/pages/compare/Notion.tsx` (`/compare/notion`) — SkillFade vs Notion (all-in-one workspace)
- `frontend/src/pages/compare/Obsidian.tsx` (`/compare/obsidian`) — SkillFade vs Obsidian (knowledge graph)

Each uses `<SEO />` with Article schema, sets a canonical URL, and links back to `/comparisons` and `/register`.

#### Pillar content pages
- `frontend/src/pages/LearningVsPractice.tsx` (`/learning-vs-practice`) — Pillar page on the input/output balance. Covers the ratio formula (`practice_events ÷ learning_events`), interpretation bands (< 0.2, 0.2–0.5, 0.5–1.0, > 1.0), when learning-heavy is fine, and how to fix a low ratio.
- `frontend/src/pages/SkillDecayFormula.tsx` (`/skill-decay-formula`) — Technical deep dive on the freshness algorithm. Shows the exact formula (`100 × (1 − decay_rate) ^ days_since_practice + learning_boost`), a worked example, decay rate recommendations, and rationale for the exponential model.

#### Route + SEO wiring
- 5 new routes added in `App.tsx`.
- All 5 added to `PUBLIC_ROUTES` whitelists in `RouteTracker.tsx` and `CookieBanner.tsx` so GA fires page views on them.
- All 5 added to `sitemap.xml`.

#### Shared public footer (`PublicFooter.tsx`)
A single 5-column footer used on every public marketing page so internal link equity flows uniformly to all indexable pages. Columns: Brand + BMC | Product | Learn | Compare | Account + Philosophy.

- `frontend/src/components/PublicFooter.tsx` — the shared component.
- Used on 12 pages: `Landing`, `Features`, `FAQ`, `WhatIsLearningDecay`, `UseCases`, `Comparisons`, `Privacy`, `LearningVsPractice`, `SkillDecayFormula`, `compare/Anki`, `compare/Notion`, `compare/Obsidian`.
- Auth pages (`Login`, `Register`, `ForgotPassword`, `ResetPassword`) intentionally do not use it — they're noindex and don't need the footer.
- In-app pages use the existing `<Layout />` (with its own header/footer for authenticated users).

#### Internal cross-links
- `Comparisons.tsx` includes a "Dedicated Comparisons" section linking to `/compare/anki`, `/compare/notion`, `/compare/obsidian` to keep the per-competitor pages discoverable from the index.
- `WhatIsLearningDecay.tsx` includes a "Related Reading" section linking to `/skill-decay-formula` and `/learning-vs-practice` so the new pillar/technical pages are not SEO orphans.

### PWA + Deployment Hardening (Added 2026-05-14)
Three issues surfaced after the SEO deploy and were addressed:

1. **Service worker was shadowing `/sitemap.xml` and `/robots.txt`.** The PWA service worker's `navigateFallback` was returning `index.html` for any path it didn't recognize, so SEO-critical static files redirected to the React app (which then bounced authenticated users to `/dashboard`). Fixed by adding `navigateFallbackDenylist` in `frontend/vite.config.ts`:
   ```ts
   navigateFallbackDenylist: [
     /^\/sitemap\.xml$/,
     /^\/robots\.txt$/,
     /^\/google[\w-]*\.html$/,
     /^\/api\//
   ]
   ```
   Note: Googlebot doesn't run service workers, so production indexing wasn't affected — but human verification in a browser was broken until this fix.

2. **Service worker updates didn't propagate without manual unregister.** By default, a new SW waits in the "waiting" state until every tab on the domain closes. Added three workbox flags so the new SW activates immediately on next page load:
   ```ts
   skipWaiting: true,
   clientsClaim: true,
   cleanupOutdatedCaches: true
   ```
   This means future deploys auto-propagate on hard-refresh without user intervention.

3. **Frontend build was missing `.dockerignore`.** `COPY . .` in `Dockerfile.prod` was pulling the host's `node_modules`, `dist`, and Vite cache into the build context — potentially masking source changes and slowing builds. Created `frontend/.dockerignore` excluding `node_modules`, `dist`, `.vite`, `.cache`, `.env*`, `.git`, IDE files, etc.

4. **`scripts/deploy.sh` hardened.** Added `--pull` to refresh base image metadata and `docker image prune -f` after build to keep disk usage in check. The pre-existing `--no-cache` flag was already correct — "CACHED" lines users see in build output for base-image metadata loads are normal.

#### Files modified
- Created: `frontend/.dockerignore`
- Modified: `frontend/vite.config.ts` (workbox config), `scripts/deploy.sh` (build step)

#### Note for future deploys
The PWA service worker is enabled in production. If a deploy makes static-file routing changes or adds new client-side routes, also check that the new paths aren't shadowed by `navigateFallback` (workbox returns `index.html` for unknown paths by default). Add explicit denylist entries when in doubt.

### Cache-Header Hardening (Added 2026-05-15)
Follow-up to the 2026-05-14 PWA section. Users reported that UI updates weren't visible in production for returning visitors on any route — incognito always saw the new build, normal browser sessions stayed on the old one indefinitely.

**Root cause:** `frontend/nginx.prod.conf` had a regex location `~* \.(js|css|...)$` applying `expires 1y; immutable` to every JavaScript file, and a separate plain-prefix `location /sw.js` block intended to opt the service worker out. Nginx evaluates regex locations **before** plain-prefix locations, so the regex won and `sw.js` was served with `Cache-Control: public, immutable; expires 1y`. The SW was frozen on the user's first visit and never updated — silently invalidating the `skipWaiting + clientsClaim + cleanupOutdatedCaches` flags from 2026-05-14, because the new SW was never fetched in the first place. HTML responses (every SPA route falls back to `/index.html` via `try_files`) also had no explicit cache directive, so browsers were free to serve stale `index.html` heuristically — pointing at outdated hashed bundle filenames.

**Fix:** In `frontend/nginx.prod.conf`, replaced the SW location with exact-match (`=`) blocks for `/sw.js`, `/registerSW.js`, and `/manifest.webmanifest`, all set to `Cache-Control: no-cache, no-store, must-revalidate`. Exact `=` locations win over regex in nginx, so these reliably override the static-asset block. Added the same headers to `location /` so every HTML response (i.e. every SPA route) is revalidated and picks up the latest hashed bundle names. Hashed static assets (`/assets/index-abc123.js`) keep `immutable, 1y` — safe because Vite changes the hash on every build.

**One-time impact on existing users:** Users who visited before this fix have a frozen SW in their browser. After this deploy they need to hard-refresh twice (first refresh fetches and installs the new SW, second serves fresh content) or unregister the SW via DevTools → Application → Service Workers. From the next deploy onward, updates propagate automatically on the next page load.

#### Files modified
- Modified: `frontend/nginx.prod.conf`

#### Note for future deploys
When adding an nginx `location` block intended to override the static-asset regex `~* \.(js|css|...)$`, always use exact-match (`location = /path`). Plain-prefix `location /path` is evaluated **after** regex and will be silently overridden — this is the nginx location-precedence gotcha that froze `sw.js` for months.

### UI Redesign — "Ember & Almanac" warm editorial theme (Added 2026-06-09)
A full visual redesign of the frontend. The previous theme was a generic dark-neon
look (cyan `#00fff0` + violet `#a855f7` accents, neon `shadow-glow-*` halos, Inter +
JetBrains Mono) that read as default "AI slop" and openly contradicted the brand's
calm "a mirror, not a coach" philosophy. It was replaced with a warm, calm, editorial
**dark** theme — a candlelit almanac/reading room.

**What changed (the design is token-driven, so most of it lives in two files):**
- **`frontend/tailwind.config.js`** — new color tokens (warm espresso `surface-*`, parchment `txt-*`, **sage** primary `accent-*`, **clay** `secondary-*`, earthy `fresh`/`aging`/`decayed` = sage→honey→clay), new fonts (`display`=Fraunces, `sans`=Hanken Grotesk, `mono`=IBM Plex Mono), soft warm ambient `shadow-glow-*` (replacing neon), warm `gradient-mesh`, calmer animation curves/`glowPulse`.
- **`frontend/src/index.css`** — swapped the Google-Fonts import; warm base layer; a fixed **paper-grain** overlay (`body::after`, SVG fractal noise ~4%); reworked every component class (`.card*`, `.btn-*`, `.input`, `.select`, `.tag*` incl. new `.tag-decayed`, `.modal-*`, `.status-*`); added the signature **`.fade-track` / `.fade-fill-*`** freshness bars, `.label-caps`; warm scrollbar + Recharts overrides; added a `prefers-reduced-motion` block.
- **`frontend/index.html`** — `theme-color` → `#1A150E`, iOS status bar → `black-translucent`.
- **Outlier fixes** (off-token classes that never resolved on a dark theme): `BuyMeACoffee.tsx` (dropped dead `dark:`/amber-50 classes → warm honey), `ProGate.tsx` (gray/`dark:` → tokens), `admin/Pagination.tsx` (`text-white`→`text-surface-50`), `AdminUserDetail.tsx` (`blue-500`/`green-500` → `accent-400`/`fresh-base`), `AdminLayout.tsx` (red→clay logo chip + `.tag-decayed` now defined).
- **Hero polish:** serif wordmark in `Layout`/`Landing`/`Login`/`Register`/`AdminLayout`; removed neon `animate-glow-pulse` from the Landing hero dots; `Dashboard` now uses the `.fade-fill` bars, `.label-caps`, and `font-mono` tabular numerals.

**Verification performed:** WCAG AA contrast computed for all critical pairs before
writing (only `decayed`-as-text needed a nudge to #C87B64 for 4.5:1); `npm run build`
passes (tsc + vite clean — the rollup-native error seen mid-task was the npm
optional-deps bug, fixed with `npm i @rollup/rollup-darwin-arm64`, not a code issue);
Landing, Login, and the Dashboard "Recent Skills" card were rendered via headless
Chrome and visually confirmed (warm palette, Fraunces loading, calm freshness scale,
legible text, no neon). Only 2 of 60 `.tsx` files needed hand-fixing — the rest
cascaded from the token layer.

In-app charts (Recharts in `Analytics.tsx` / `SkillDetail.tsx`) take hex strings, not
token classes, so their colors are hardcoded to the new palette by hand. Convention:
**Learning = sage `#8FB382` (solid), Practice = green `#5F8454` (dashed)** — Practice
stays green app-wide (Dashboard, QuickLogWidget); it is separated from Learning by
dash + darkness, never by switching it to clay (clay ≈ `decayed`, which would read as
"decay" on an activity chart).

**Known-skipped (future polish):** the static brand icons `frontend/public/favicon.svg`
and `pwa-192x192.svg` / `pwa-512x512.svg` still use the *old* palette. The in-app
`LogoIcon` component was re-themed, but these standalone SVGs were not — re-color them
to sage/clay when convenient.

**Design intent for future agents:** keep it calm and warm. No neon, no alarm-red
(decayed is clay, not red), no gamification. Reach for the semantic tokens; never
hardcode hex or use bare/`dark:` Tailwind color classes (see "Theme Model" above).

### Blog System + SEO Expansion (Added 2026-06-09)
A markdown-driven blog plus a set of targeted SEO improvements. The blog is
**client-rendered** (consistent with the rest of the SPA), with content **bundled at
build time** — no SSR/prerender. This was a deliberate choice for simplicity; per-post
social-share previews can be added later as a separate prerender step (see the closing
note below).

#### Authoring a post
Drop a markdown file in `frontend/src/content/blog/<slug>.md` with front-matter:
```markdown
---
title: "Post Title"                          # required
description: "~150-char meta/OG/RSS summary" # required
date: "2026-06-09"                           # required, quoted YYYY-MM-DD
updated: "2026-06-10"                        # optional
tags: ["tag-a", "tag-b"]                     # optional
hero: "/blog/my-image.png"                   # optional, per-post OG image
draft: false                                 # optional; true = excluded from build
---
Markdown body — GFM tables, lists, and fenced code blocks (syntax-highlighted).
```
The slug is the filename with any leading `YYYY-MM-DD-` stripped (override with a
`slug:` field). A post missing a required field **fails the build** with a clear error.

#### Build-time content pipeline
- `frontend/scripts/build-content.mjs` runs via the `prebuild` / `predev` / `pretest`
  npm hooks, so it fires on `npm run build`, `npm run dev`, and `npm test` — and in
  **both** deploy paths, since `Dockerfile.prod` and `scripts/deploy.sh` call
  `npm run build`. Pure Node (no TS imports) so it runs on the `node:18-alpine` image.
- It parses front-matter (`gray-matter`), validates, computes reading time, drops
  drafts, sorts newest-first, and writes three artifacts (all committed; regenerated
  every build):
  - `src/content/blog/manifest.generated.ts` — typed `BlogPostMeta[]`. Header marks it
    auto-generated; do not hand-edit.
  - `public/sitemap.xml` — **now generated** from a `STATIC_ROUTES` table in the script
    plus every post. The script is the single source of truth for the sitemap; add new
    static marketing pages to that table (no more hand-editing the XML).
  - `public/rss.xml` — new RSS 2.0 feed served at `/rss.xml` (autodiscovery `<link>`
    added to `index.html`).
- Post bodies are bundled via `import.meta.glob('../content/blog/*.md', {query:'?raw',eager:true})`
  in `src/utils/blog.ts` and rendered with `react-markdown` + `remark-gfm` + `rehype-highlight`.
  Pure helpers live in `src/utils/markdown.ts`.

#### Routes + pages
- `/blog` → `src/pages/Blog.tsx` (index; `Blog` + `BreadcrumbList` schema).
- `/blog/:slug` → `src/pages/BlogPost.tsx` (`BlogPosting` + `BreadcrumbList` schema,
  `og:type=article`). An unknown slug renders `<NotFound />`, **not** a redirect.
- Both are **lazy-loaded** (`React.lazy` + `Suspense` in `App.tsx`) so `react-markdown`
  + highlight.js (~102 KB gzip) load only on blog routes. Main bundle dropped from
  ~365 KB to ~261 KB gzip as a result.
- `src/components/PublicHeader.tsx` — shared header extracted for the new public pages.

#### Soft-404 fix
`App.tsx` previously routed every unknown path (`*`) to `/` via `<Navigate>` — a
soft-404 that hurts SEO. Replaced with a real `src/pages/NotFound.tsx` (noindex,
helpful links). Bad blog slugs render it too.

#### Two production asset bugs fixed (were broken before the blog)
`index.html` and the Organization/Article JSON-LD referenced `og-image.png` and
`logo.svg`, but **neither existed** in `public/` — so every social share preview and the
structured-data logo were broken. Both created:
- `public/logo.svg` — sage→clay brand chip + the fading-bars mark.
- `public/og-image.png` — branded 1200×630 card. Regenerate it from
  `frontend/scripts/og-template.html` via headless Chrome
  (`--headless=new --window-size=1200,630 --screenshot=...`).

#### GA / consent scope
`RouteTracker.tsx` and `CookieBanner.tsx` matched routes with an exact-list `Set`,
which can't match dynamic `/blog/:slug`. Both now also treat any `/blog…` path as
public, so page views fire and the consent banner shows on posts.

#### Structured-data builders (`src/utils/seo.ts`)
Added `generateBlogPostingSchema`, `generateBreadcrumbSchema`, `generateBlogSchema`.

#### Styling
New `.prose-content` block in `index.css` (themed to Ember & Almanac tokens — Fraunces
headings, IBM Plex Mono code panels, sage links) plus a warm highlight.js token theme.
**No `@tailwindcss/typography` dependency** (consistent with the bespoke component-class
convention). Note: the pre-existing `.prose-custom` class referenced on
`WhatIsLearningDecay.tsx` was always undefined (a no-op) — unrelated to this.

#### Files
- **Created:** `src/content/blog/2026-06-09-the-forgetting-curve-for-developers.md`
  (starter post), `scripts/build-content.mjs`, `scripts/og-template.html`,
  `src/utils/markdown.ts`, `src/utils/blog.ts`, `src/content/blog/manifest.generated.ts`
  (generated), `src/pages/Blog.tsx`, `src/pages/BlogPost.tsx`, `src/pages/NotFound.tsx`,
  `src/components/PublicHeader.tsx`, `public/logo.svg`, `public/og-image.png`,
  `public/rss.xml` (generated), `src/tests/blog.test.ts`.
- **Modified:** `package.json` (deps + `generate:content`/`pre*` hooks), `src/App.tsx`
  (lazy blog routes + real 404 + `Suspense`), `src/components/RouteTracker.tsx`,
  `src/components/CookieBanner.tsx`, `src/components/PublicFooter.tsx` (Blog link in the
  Learn column), `src/utils/seo.ts`, `src/index.css`, `index.html` (RSS `<link>`),
  `public/robots.txt` (allow `/blog`), `public/sitemap.xml` (now generated).
- **Dependencies added:** `react-markdown`, `remark-gfm`, `rehype-highlight` (runtime),
  `gray-matter` (dev/build).

#### Post-deploy SEO checklist (manual)
- Re-submit `sitemap.xml` in Google Search Console (it now auto-includes `/blog` + posts).
- Request indexing for `/blog` and the first post URL.
- Validate a post on the Rich Results test (BlogPosting + BreadcrumbList).
- Verify the OG card via a social-share debugger (now that `og-image.png` exists).

### Header & Navigation Redesign (Added 2026-06-09)
A UI/UX redesign of both site headers, plus consolidation of the duplicated public
headers into the one shared component.

**Problems fixed:** no mobile navigation anywhere (public nav links simply vanished
below `md`; the app nav collapsed to seven unlabeled icon-only targets), ~14 public
pages each carrying their own inline `<header>` with inconsistent link sets, Blog
linked from no header at all, 9+ items crammed into one app-header row, and missing
a11y attributes (`aria-current`, `aria-expanded`, labels on icon buttons).

**Public header (`PublicHeader.tsx`) — now the single header for ALL public pages:**
- Curated 4-link nav: Features · Learning Decay · Blog · FAQ. Everything else
  (use-cases, comparisons, compare/*, pillar pages) is reachable via PublicFooter —
  deliberate ceiling of 4 for calm wayfinding.
- Active page = sage text + a 2px sage→transparent "ink-rule" underline
  (`.nav-link-public-active::after`) — the fade motif in miniature; `/blog/*` prefix-matches.
- Desktop actions: BuyMeACoffee button (≥`lg`), Sign In, Get Started (the one `btn-primary`).
- Mobile (<`md`): 44×44 hamburger → slide-down disclosure panel (`.menu-panel`) with the
  4 links, divider, Sign In, full-width Get Started, BMC link.
- Used by all 14 former inline-header pages + Blog/BlogPost/NotFound. The inline
  header blocks were deleted from: Landing, Features, FAQ, WhatIsLearningDecay,
  UseCases, Comparisons, Privacy, LearningVsPractice, SkillDecayFormula, About,
  Contact, compare/{Anki,Notion,Obsidian}.

**App header (`Layout.tsx`):**
- Primary tabs reduced to Dashboard / Skills / Analytics (icon + always-visible label
  at ≥`md`; the old label-hiding trick is gone).
- Low-frequency destinations moved into an "Account" dropdown (chevron button →
  `card-elevated` panel): Settings, Support, Admin (admins only), Buy me a coffee,
  Logout. Outside-click and Escape close it; no scroll lock for the dropdown.
- Mobile (<`md`): hamburger → slide-down panel with `label-caps` ledger sections
  ("Navigate" / "Account"), full-width rows, icons + labels.

**Shared interaction contract (both headers):** menus close on route change; Escape
closes and returns focus to the trigger; body scroll locks only behind the MOBILE
panel; all lucide icons `aria-hidden`; triggers have `aria-expanded`/`aria-controls`/
`aria-label`; active links carry `aria-current="page"`; `focus-visible` sage rings.
No new dependencies — hand-rolled disclosure pattern, plain `useState`/`useEffect`.

**New `index.css` component classes:** `.nav-link-public` / `.nav-link-public-active`
(+`::after` fading underline), `.menu-panel` (slide-down/dropdown chrome),
`.menu-item` / `.menu-item-active` (shared row styling for all menus).
`coffeeUrl` is now exported from `BuyMeACoffee.tsx` (single source for the BMC URL).

**Verification:** `npm run build` (strict tsc + vite) and 8/8 vitest tests pass;
headless-Chrome screenshots confirmed desktop public header + active underline (on
/blog), mobile menu open/closed, app desktop header + Account dropdown, app mobile
panel, and no overflow at 320px. Adversarially reviewed by a 3-lens agent panel
(regressions / a11y / design-consistency) with per-finding verification.

#### Still client-rendered (note for future agents)
Posts are client-rendered, so social-share crawlers (Twitter/LinkedIn/Slack) see the
**default** `og-image.png`, not a per-post hero, until a per-post prerender step is added.
Google indexes posts fine (it executes JS). If you add a new top-level static page, also
add it to `STATIC_ROUTES` in `scripts/build-content.mjs` so it stays in the sitemap.

### Time-Invested Suite (Added 2026-06-13)
Surfaces the `duration_minutes` captured on every event (previously aggregated only in the admin
panel) as the next PRO value vein, plus an honest fix to the data-export paywall. Design spec:
`docs/superpowers/specs/2026-06-13-time-invested-suite-design.md`.

**Backend**
- `app/services/time_stats.py` (new) — pure aggregation. `time_summary(db, user)` (free totals +
  per-skill hours + duration coverage); `time_report(db, user, start, end, skill_id=None)` (PRO
  date-range breakdown: totals with learning/practice split + untimed coverage, per-skill,
  per-category, by-month trend, and an `hours_vs_freshness` overlay computed by reusing
  `freshness.calculate_freshness(today=min(month_end, end))` at month-ends. The overlay
  **excludes archived skills** (matching the rest of analytics) and returns `null` for months
  before a skill existed, so the line shows an honest gap instead of a fake 100%.
- `app/schemas/analytics.py` (new) — `TimeSummaryResponse`, `TimeReportResponse` (+ nested).
- `app/routers/analytics.py` — `GET /api/analytics/time-summary` (free) and
  `GET /api/analytics/time-report?start=&end=&skill_id=` (PRO, `require_pro`; 422 on start>end;
  defaults to last 12 months; span capped at ~5 years to bound the overlay loop).
- `app/routers/settings.py` — **`GET /settings/export` un-gated** (removed `require_pro`). Raw data
  export is now free for every plan, matching the "your data is always yours" philosophy.
- Tests: `tests/test_time_stats.py` (15 — service aggregation, archived exclusion, overlay null/clamp, endpoint auth/422);
  `tests/test_paywall.py` `test_export_402_for_free` → `test_export_ok_for_free` (now asserts 200).
  Full backend suite: **102 passing**.

**Frontend**
- `src/services/api.ts` — `analytics.timeSummary()`, `analytics.timeReport({start,end,skill_id})`.
- `src/types/index.ts` — `TimeSummary`, `TimeReport` (+ nested) types.
- `src/utils/csv.ts` (new) — `toActivityCsv(report)` RFC-4180 serializer (vitest `tests/timeCsv.test.ts`, 6).
- `src/pages/Analytics.tsx` — new "Time Invested" section: free taste (total hours, sessions,
  coverage, per-skill top-list) always shown; PRO depth = hours-vs-freshness `ComposedChart`
  (clay bars + sage freshness line) + per-category roll-up; calm locked panel for free users.
  Also hardened: the PRO `period-comparison`/`category-stats` calls no longer share one
  `Promise.all`, so a 402 for a real free user can't blank the free charts.
- `src/pages/ActivityReport.tsx` (new) at `/reports/activity` — authenticated, **standalone (not
  inside app `Layout`)** so it prints clean. PRO-gated (calm upsell for free). Date-range presets
  (Last 12 months / This year / This quarter / Custom) + "Print / Save as PDF" (`window.print()`)
  + "Download CSV". Honest copy: session counts, first/last activity, untimed-duration count.
- `src/App.tsx` — `/reports/activity` route (outside the `Layout` group).
- `src/index.css` — `@media print` block (hides `.no-print`, drops the paper-grain overlay,
  forces light/ink-friendly `.report-print`).
- `src/pages/SkillDetail.tsx` — small free "Xh logged · N sessions" stat in the Timeline header.
- `src/pages/Settings.tsx` — "Data Export & Reports" card links to the Activity Report; notes export is free.

**Free vs PRO:** Free = total-hours figures (account + per-skill) + coverage + SkillDetail stat.
PRO = monthly trend, per-category roll-up, hours-vs-freshness overlay, and the date-range Activity
Report (print + CSV). Raw JSON export is free for all.

**Output choice:** print-styled HTML + client-side CSV — **no new backend dependency, no DB
migration**. (A server-side PDF via WeasyPrint remains a future option.)

**Philosophy:** pure aggregation/formatting of manually-logged data — no AI, no gamification, no
third-party sharing, no urgency; numbers stay honest about untimed sessions.

**Known follow-ups (logged, not built):** enforce the advertised 30-day free history window (still
unenforced anywhere); wire `ProGate` to the other PRO features in the UI (most `PRO_FEATURES` flags
are still dead); refund flow + Terms/Refund pages + receipt email; other shortlist ideas (live
`.ics` calendar feed, CSV import, saved views).
