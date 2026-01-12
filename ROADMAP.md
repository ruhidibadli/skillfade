# SkillFade - Development Roadmap

> **Purpose:** Track planned features and enhancements for future development.
> **Philosophy:** All features must align with "a mirror, not a coach" - no gamification, no AI, no social features.

---

## Status Legend

- [ ] Not started
- [x] Completed
- 🚧 In progress

---

## Phase 1: Core Enhancements (High Priority) ✅ COMPLETED

Features that add immediate value with moderate complexity.

### 1.1 Freshness History Graph
- [x] **Description:** Show how each skill's freshness has changed over time as a line chart
- [x] **Why:** Users can see long-term trends, not just current state
- **Files modified:**
  - `backend/app/routers/analytics.py` - New endpoint `/api/analytics/skills/{skill_id}/freshness-history`
  - `backend/app/schemas/skill.py` - New `FreshnessHistoryResponse` schema
  - `backend/app/services/freshness.py` - New `calculate_freshness_history()` function
  - `frontend/src/pages/SkillDetail.tsx` - Added Recharts line chart component
  - `frontend/src/services/api.ts` - New `analytics.freshnessHistory()` API call
  - `frontend/src/types/index.ts` - New `FreshnessHistoryData` type
- **Complexity:** Medium
- **Dependencies:** None

### 1.2 Custom Decay Rates
- [x] **Description:** Allow users to set different decay rates per skill (some skills fade faster than others)
- [x] **Why:** Language skills decay faster than conceptual knowledge
- **Database change:** Added `decay_rate` column to skills table (default: 0.02)
- **Files modified:**
  - `backend/app/models/skill.py` - Added `decay_rate` Float column
  - `backend/app/schemas/skill.py` - Updated `SkillCreate`, `SkillUpdate`, `SkillResponse`
  - `backend/app/services/freshness.py` - Uses custom decay rate
  - `backend/app/routers/skills.py` - Handles decay_rate in create/update
  - `frontend/src/pages/SkillDetail.tsx` - Decay rate setting with presets modal
  - `frontend/src/types/index.ts` - Updated `Skill` interface
- **Complexity:** Medium
- **Dependencies:** Database migration `20260109_0002-phase1_features.py`

### 1.3 Quick Log Widget
- [x] **Description:** Floating button/modal for rapid event logging without navigating away
- [x] **Why:** Reduce friction for logging events
- **Files modified:**
  - `frontend/src/components/QuickLogWidget.tsx` - New floating button component with modal
  - `frontend/src/components/Layout.tsx` - Included widget in layout
- **Complexity:** Low-Medium
- **Dependencies:** None

### 1.4 Event Templates
- [x] **Description:** Save common event configurations for quick re-use
- [x] **Why:** Users often log similar events repeatedly
- **Database change:** New `event_templates` table
- **Files modified:**
  - `backend/app/models/event_template.py` - New EventTemplate model
  - `backend/app/models/__init__.py` - Export EventTemplate
  - `backend/app/models/user.py` - Added event_templates relationship
  - `backend/app/schemas/event_template.py` - New schemas
  - `backend/app/routers/templates.py` - New CRUD endpoints
  - `backend/app/main.py` - Included templates router
  - `frontend/src/pages/SkillDetail.tsx` - Template selector in add event modal
  - `frontend/src/pages/Settings.tsx` - Template management UI
  - `frontend/src/services/api.ts` - New templates API
  - `frontend/src/types/index.ts` - New EventTemplate type
- **Complexity:** Medium
- **Dependencies:** Database migration `20260109_0002-phase1_features.py`

---

## Phase 2: Analytics & Insights (Medium Priority) ✅ COMPLETED

Deeper data visualization without crossing into AI/recommendations.

### 2.1 Period Comparisons
- [x] **Description:** Compare activity between time periods (this month vs last month)
- [x] **Why:** Users can see if they're maintaining consistency
- **Files modified:**
  - `backend/app/routers/analytics.py` - New `/api/analytics/period-comparison` endpoint
  - `frontend/src/pages/Analytics.tsx` - Month-over-Month comparison UI with changes summary
  - `frontend/src/services/api.ts` - New `analytics.periodComparison()` API call
  - `frontend/src/types/index.ts` - New `PeriodComparison`, `PeriodStats` types
- **Complexity:** Medium
- **Dependencies:** None

### 2.2 Skill Category Aggregations
- [x] **Description:** View average freshness and total activity grouped by category
- [x] **Why:** See which areas of learning are neglected
- **Files modified:**
  - `backend/app/routers/analytics.py` - New `/api/analytics/category-stats` endpoint
  - `frontend/src/pages/Analytics.tsx` - Category breakdown view with skill tags
  - `frontend/src/services/api.ts` - New `analytics.categoryStats()` API call
  - `frontend/src/types/index.ts` - New `CategoryStat`, `CategoryStatsData` types
- **Complexity:** Low-Medium
- **Dependencies:** None

### 2.3 Freshness Targets
- [x] **Description:** Set personal freshness thresholds per skill with visual indicators
- [x] **Why:** Users define their own standards, app shows if they're meeting them
- **Database change:** Added `target_freshness` column to skills table
- **Files modified:**
  - `backend/app/models/skill.py` - Added `target_freshness` Float column
  - `backend/app/schemas/skill.py` - Updated `SkillCreate`, `SkillUpdate`, `SkillResponse` with target fields
  - `backend/app/routers/skills.py` - Handles target_freshness in create/update, calculates `below_target`
  - `frontend/src/pages/SkillDetail.tsx` - Target setting UI with presets modal
  - `frontend/src/pages/Skills.tsx` - Shows target vs actual with "Below target" indicator
  - `frontend/src/types/index.ts` - Updated `Skill` interface with `target_freshness`, `below_target`
- **Complexity:** Medium
- **Dependencies:** Database migration `20260110_0003-phase2_features.py`

### 2.4 Personal Records (Informational)
- [x] **Description:** Track longest active period per skill (days with freshness > 70%)
- [x] **Why:** Informational insight, not gamification - no rewards or celebrations
- **Files modified:**
  - `backend/app/services/freshness.py` - New `calculate_personal_records()` function
  - `backend/app/routers/analytics.py` - New `/api/analytics/skills/{skill_id}/personal-records` endpoint
  - `frontend/src/pages/SkillDetail.tsx` - Personal Records card with 4 metrics
  - `frontend/src/services/api.ts` - New `analytics.personalRecords()` API call
  - `frontend/src/types/index.ts` - New `PersonalRecords` type
- **Records tracked:**
  - Longest Fresh Streak (days with freshness > 70%)
  - Peak Freshness achieved
  - Most Active Week (events)
  - Longest Gap Recovered (days between practice sessions)
- **Complexity:** Medium
- **Dependencies:** Freshness history data

---

## Phase 3: Productivity Features (Medium Priority)

Power user features for efficiency.

### 3.1 Keyboard Shortcuts
- [ ] **Description:** Navigate and log events with keyboard
- [ ] **Why:** Power users can work faster
- **Shortcuts to implement:**
  - `n` - New skill
  - `l` - Quick log learning event
  - `p` - Quick log practice event
  - `/` - Focus search
  - `?` - Show shortcuts help
- **Files to modify:**
  - `frontend/src/hooks/useKeyboardShortcuts.ts` - New hook
  - `frontend/src/components/ShortcutsHelp.tsx` - Help modal
  - `frontend/src/App.tsx` - Register global shortcuts
- **Complexity:** Medium
- **Dependencies:** None

### 3.2 Bulk Event Logging
- [ ] **Description:** Log one event across multiple skills simultaneously
- [ ] **Why:** Full-stack projects touch multiple skills
- **Files to modify:**
  - `backend/app/routers/events.py` - Bulk create endpoint
  - `frontend/src/components/BulkLogModal.tsx` - New component
- **Complexity:** Medium
- **Dependencies:** None

### 3.3 Import from CSV
- [ ] **Description:** Import historical learning/practice data from CSV file
- [ ] **Why:** Users migrating from spreadsheets or other tools
- **Files to modify:**
  - `backend/app/routers/settings.py` - Import endpoint
  - `frontend/src/pages/Settings.tsx` - File upload UI
- **Complexity:** Medium-High
- **Dependencies:** Define CSV format

### 3.4 Custom Event Types
- [ ] **Description:** Users can define their own learning/practice type labels
- [ ] **Why:** Default types may not fit everyone's workflow
- **Database change:** New `custom_event_types` table or JSONB in user settings
- **Files to modify:**
  - `backend/app/models/user.py` - Store custom types
  - `frontend/src/pages/Settings.tsx` - Manage types
  - Event forms - Include custom types in dropdown
- **Complexity:** Medium
- **Dependencies:** Database migration

---

## Phase 4: Communication Enhancements (Lower Priority)

Improved alert and notification system.

### 4.1 Weekly/Monthly Digest Email
- [ ] **Description:** Optional summary email of all activity and freshness changes
- [ ] **Why:** Users who don't check daily can still stay informed
- **Files to modify:**
  - `backend/app/services/alerts.py` - Digest generation
  - `backend/run_alerts.py` - Digest scheduling
  - `frontend/src/pages/Settings.tsx` - Digest preferences
- **Complexity:** Medium
- **Dependencies:** Email system working

### 4.2 Customizable Alert Schedules
- [ ] **Description:** Choose specific days/times for receiving alerts
- [ ] **Why:** Users have different preferences for when to receive emails
- **Database change:** Add schedule fields to user settings
- **Files to modify:**
  - `backend/app/models/user.py` - Schedule settings
  - `backend/app/services/alerts.py` - Check schedule before sending
  - `frontend/src/pages/Settings.tsx` - Schedule picker UI
- **Complexity:** Medium
- **Dependencies:** Database migration

---

## Phase 5: Security & Data (Lower Priority)

Enhanced security and data management.

### 5.1 Two-Factor Authentication (2FA)
- [ ] **Description:** Optional TOTP-based 2FA for login
- [ ] **Why:** Enhanced security for sensitive data
- **Libraries:** `pyotp` for Python
- **Files to modify:**
  - `backend/app/models/user.py` - 2FA secret storage
  - `backend/app/routers/auth.py` - 2FA verification
  - `frontend/src/pages/Settings.tsx` - 2FA setup flow
  - `frontend/src/pages/Login.tsx` - 2FA code input
- **Complexity:** High
- **Dependencies:** QR code generation

### 5.2 Session Management
- [ ] **Description:** View active sessions and revoke them
- [ ] **Why:** Security awareness and control
- **Database change:** New `sessions` table to track active tokens
- **Files to modify:**
  - `backend/app/models/` - Session model
  - `backend/app/core/security.py` - Session tracking
  - `frontend/src/pages/Settings.tsx` - Sessions list UI
- **Complexity:** High
- **Dependencies:** Database migration, auth refactor

### 5.3 Backup & Restore
- [ ] **Description:** Import previously exported JSON to restore data
- [ ] **Why:** Disaster recovery, moving between instances
- **Files to modify:**
  - `backend/app/routers/settings.py` - Import endpoint
  - `frontend/src/pages/Settings.tsx` - Import UI with confirmation
- **Complexity:** Medium-High
- **Dependencies:** Export format stability

### 5.4 Personal API Keys
- [ ] **Description:** Generate API tokens for personal integrations
- [ ] **Why:** Power users can build custom tools (still manual, not auto-import)
- **Database change:** New `api_keys` table
- **Files to modify:**
  - `backend/app/models/` - APIKey model
  - `backend/app/core/security.py` - API key auth
  - `backend/app/routers/settings.py` - Key management
  - `frontend/src/pages/Settings.tsx` - Key generation UI
- **Complexity:** High
- **Dependencies:** Database migration

---

## Phase 6: Mobile & Accessibility (Medium Priority) ✅ COMPLETED

Broader device support.

### 6.1 Progressive Web App (PWA)
- [x] **Description:** Make app installable and functional offline
- [x] **Why:** Mobile access without native app development
- **Files modified:**
  - `frontend/vite.config.ts` - Added vite-plugin-pwa configuration
  - `frontend/package.json` - Added vite-plugin-pwa dependency
  - `frontend/index.html` - Added PWA meta tags
  - `frontend/public/favicon.svg` - App icon
  - `frontend/public/pwa-192x192.svg` - PWA icon
  - `frontend/public/pwa-512x512.svg` - PWA icon
- **Complexity:** Medium
- **Dependencies:** vite-plugin-pwa

### 6.2 Skill Dependencies
- [x] **Description:** Mark relationships between skills (prerequisites)
- [x] **Why:** Show when foundation skills are decaying
- **Database change:** New `skill_dependencies` table (many-to-many self-referential)
- **Files modified:**
  - `backend/app/models/skill.py` - Added skill_dependencies table and relationships
  - `backend/app/schemas/skill.py` - Added SkillDependencyInfo, SkillDependencyUpdate schemas
  - `backend/app/routers/skills.py` - Added PUT /skills/{id}/dependencies endpoint
  - `frontend/src/pages/SkillDetail.tsx` - Dependencies section with manage modal
  - `frontend/src/pages/Skills.tsx` - Dependency indicators with decay warnings
  - `frontend/src/services/api.ts` - Added updateDependencies() API call
  - `frontend/src/types/index.ts` - Added SkillDependencyInfo type
- **Complexity:** Medium-High
- **Dependencies:** Database migration `20260110_0004-phase6_features.py`

### 6.3 Skill Notes/Journal
- [x] **Description:** Add persistent notes to skills (resources, goals, context)
- [x] **Why:** Store relevant information alongside the skill
- **Database change:** Added `notes` TEXT column to skills table
- **Files modified:**
  - `backend/app/models/skill.py` - Added notes field
  - `backend/app/schemas/skill.py` - Updated SkillCreate, SkillUpdate, SkillResponse
  - `backend/app/routers/skills.py` - Handles notes in create/update
  - `frontend/src/pages/SkillDetail.tsx` - Notes section with edit modal
  - `frontend/src/services/api.ts` - Updated skill create/update types
  - `frontend/src/types/index.ts` - Updated Skill interface with notes
- **Complexity:** Low
- **Dependencies:** Database migration `20260110_0004-phase6_features.py`

---

## Implementation Guidelines

### Before Starting Any Feature
1. Read `PROJECT_CONTEXT.md` for full architecture understanding
2. Check if feature aligns with design philosophy
3. Plan database migrations carefully (backward compatible)
4. Write tests before or alongside implementation

### Development Workflow
1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement backend changes first (models, schemas, endpoints)
3. Run backend tests: `pytest`
4. Implement frontend changes
5. Test end-to-end manually
6. Update `PROJECT_CONTEXT.md` if architecture changes
7. Create pull request with clear description

### Code Standards
- Backend: Type hints, docstrings for public functions
- Frontend: TypeScript strict mode, no `any` types
- Both: Meaningful variable names, small focused functions

---

## Rejected Feature Ideas

Features that violate the project philosophy (documented to avoid re-proposing):

| Feature | Reason for Rejection |
|---------|---------------------|
| Streaks & Badges | Gamification - against core philosophy |
| AI Recommendations | No AI/ML per design constraints |
| Social Sharing | No social features |
| Leaderboards | No social/gamification |
| GitHub/Twitter Auto-import | No automation - manual logging only |
| Push Notifications | Calm design - email only |
| Skill Recommendations | No AI/ML |
| Achievement System | Gamification |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-09 | Initial roadmap created |
| 1.1 | 2026-01-09 | Phase 1 features completed |
| 1.2 | 2026-01-10 | Phase 2 features completed |
| 1.3 | 2026-01-10 | Phase 6 features completed (PWA, Skill Dependencies, Skill Notes) |

---

**Last Updated:** 2026-01-10
