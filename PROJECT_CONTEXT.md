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

### Color Palette
- Background: #FAFAFA (off-white)
- Text: #2C3E50 (dark blue-gray)
- Accent: #4A90E2 (calm blue)
- Warning: #F39C12 (amber, not red)
- Freshness indicators: 🟢 (>70%), 🟡 (40-70%), 🔴 (<40%)

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
5. **Dashboard** (`/dashboard`) - Overview with weekly stats and skill freshness
6. **Skills** (`/skills`) - Grid/list view of all skills
7. **Skill Detail** (`/skills/:id`) - Timeline of events, add event forms
8. **Analytics** (`/analytics`) - Activity calendar, charts for balance and freshness distribution
9. **Settings** (`/settings`) - Alert preferences, export, account deletion
10. **Support** (`/support`) - Support ticket list, create new tickets
11. **Ticket Detail** (`/support/:id`) - View ticket details and replies, add replies

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
│   │   │   ├── config.py          # Settings (Pydantic BaseSettings)
│   │   │   ├── database.py        # SQLAlchemy engine, session factory
│   │   │   ├── security.py        # JWT, password hashing
│   │   │   └── __init__.py
│   │   ├── models/
│   │   │   ├── user.py            # User model
│   │   │   ├── skill.py           # Skill model (includes category_id, decay_rate)
│   │   │   ├── category.py        # Category model
│   │   │   ├── event.py           # LearningEvent, PracticeEvent models
│   │   │   ├── event_template.py  # EventTemplate model (Phase 1)
│   │   │   ├── ticket.py          # Ticket, TicketReply models
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
│   │   │   ├── admin.py           # Admin panel CRUD endpoints for all tables (includes tickets)
│   │   │   └── __init__.py
│   │   ├── schemas/
│   │   │   ├── user.py            # Pydantic schemas for users
│   │   │   ├── skill.py           # Pydantic schemas for skills (includes FreshnessHistory, CategoryInfo)
│   │   │   ├── category.py        # Pydantic schemas for categories
│   │   │   ├── event.py           # Pydantic schemas for events
│   │   │   ├── event_template.py  # Pydantic schemas for templates (Phase 1)
│   │   │   ├── ticket.py          # Pydantic schemas for tickets
│   │   │   ├── admin.py           # Admin-specific Pydantic schemas (includes tickets)
│   │   │   └── __init__.py
│   │   ├── services/
│   │   │   ├── auth.py            # Auth business logic
│   │   │   ├── freshness.py       # Freshness calculation algorithms (includes history + personal records)
│   │   │   ├── alerts.py          # Alert checking and sending
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
│   │   │   └── 20260115_0007-tickets_system.py   # Tickets and ticket replies tables
│   │   └── env.py
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_freshness.py
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
│   │   │   ├── BuyMeACoffee.tsx     # Subtle support button component (link/button/card variants)
│   │   │   └── admin/
│   │   │       └── Pagination.tsx   # Reusable pagination for admin tables
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx     # Dark/Light theme management
│   │   ├── pages/
│   │   │   ├── Landing.tsx          # Marketing homepage + BuyMeACoffee footer link
│   │   │   ├── Features.tsx         # Detailed features page (public)
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
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
│   │   │       └── AdminTicketDetail.tsx # Admin ticket detail with status updates
│   │   ├── services/
│   │   │   └── api.ts            # Axios client, all API calls (includes categories)
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces (includes Category, CategoryInfo)
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
- ❌ No third-party analytics (no Google Analytics, Mixpanel, etc.)
- ❌ No external API calls (except user-configured SMTP)
- ❌ No data sharing
- ❌ No tracking pixels
- ❌ No cookies (except auth token in localStorage)

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

**Brand Identity:**
- **Name:** SkillFade
- **Tagline:** "A mirror, not a coach"
- **Logo:** Gradient text (blue to indigo) with "Beta" badge
- **Color Scheme:**
  - Primary Gradient: Blue (#4A90E2) to Indigo (#6366F1)
  - Secondary Gradient: Amber (#F39C12) to Orange (#F97316) to Red (#EF4444) (for fade effect)
  - Background: Gradient from Slate-50 via Blue-50 to Indigo-50
  - Cards: White with 80% opacity + backdrop blur
  - Text: Gray-900 for headings, Gray-600 for body

**Typography:**
- **Font Family:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700, 800
- **Heading Scale:**
  - H1: 4xl-5xl (2.25rem-3rem) with gradient text
  - H2: 3xl-4xl (1.875rem-2.25rem)
  - H3: 2xl (1.5rem)
  - Body: Base (1rem, 16px)

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
- Sticky header with navigation links
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
- Glassmorphism: White/80 with backdrop blur
- Rounded corners: xl (0.75rem) to 2xl (1rem)
- Shadows: lg to 2xl with hover states
- Transitions: All 200-300ms ease
- Hover effects: -translate-y-1 (lift), scale-105 (grow)

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
- Navigation collapses on mobile (future enhancement)
- Grid layouts adapt: 1 → 2 → 3 columns

### Custom Utilities

**Tailwind Extensions:**
- `.animation-delay-200/400/600/800`: Staggered animations
- `.card-shadow`: Standard card elevation
- `.card-shadow-lg`: Enhanced card elevation
- `.text-gradient`: Purple-pink gradient text
- `.bg-glass`: Glassmorphism background

**Scrollbar Styling:**
- Custom webkit scrollbar (10px width)
- Light gray track (#f1f1f1)
- Medium gray thumb (#cbd5e0)
- Rounded corners (5px)

### Design Tokens

**Border Radius:**
- sm: 0.25rem
- md: 0.375rem (default)
- lg: 0.5rem
- xl: 0.75rem (cards)
- 2xl: 1rem (modals, large cards)
- full: 9999px (badges, pills)

**Shadows:**
- sm: Subtle hover
- md: Default card
- lg: Elevated card
- xl: Modal/overlay
- 2xl: Maximum elevation

**Icons:**
- Emoji-based (no icon library)
- Consistent sizing: 2xl-4xl for featured icons
- Semantic usage: 🟢 fresh, 🟡 aging, 🔴 decayed

### Dark Mode Implementation

**Theme System:**
- **Context:** ThemeContext (`frontend/src/context/ThemeContext.tsx`)
- **Storage:** localStorage key `theme`
- **Mode:** Tailwind CSS class-based (`darkMode: 'class'` in config)
- **Toggle:** Moon/Sun emoji button in Layout header (🌙 for light mode, ☀️ for dark mode)
- **Default:** System preference detection via `window.matchMedia('(prefers-color-scheme: dark)')`

**Color Mappings:**
- Backgrounds: `bg-white/80` → `dark:bg-gray-800/80`
- Main backgrounds: `from-slate-50 via-blue-50 to-indigo-50` → `dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`
- Text colors:
  - `text-gray-900` → `dark:text-gray-100`
  - `text-gray-700` → `dark:text-gray-300`
  - `text-gray-600` → `dark:text-gray-400`
  - `text-gray-500` → `dark:text-gray-400`
- Borders: `border-gray-200` → `dark:border-gray-700`
- Accent colors: `text-blue-600` → `dark:text-blue-400`
- Cards: Glassmorphism maintained with dark variants

**Integration:**
- Wrapped entire app in ThemeProvider in `App.tsx`
- `useTheme()` hook available in all components
- Theme persists across sessions via localStorage
- Smooth transitions with `transition-colors duration-300`

---

**Last Updated:** 2026-01-15
**Project Status:** Production-ready MVP with Enhanced UI/UX + Dark Mode + Activity Calendar + Phase 1, 2, 6 & Category Features + Admin Panel + Buy Me a Coffee Integration + Support Ticketing System + Comprehensive VPS Deployment Guide (Ubuntu 22.04 & 24.04 LTS) ✅

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
