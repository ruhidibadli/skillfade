# SkillFade - Development Roadmap

> **Purpose:** Track planned features and enhancements for future development.
> **Philosophy:** All features must align with "a mirror, not a coach" - no gamification, no AI, no social features.

---

## Status Legend

- [ ] Not started
- [x] Completed
- 🚧 In progress
- 🔒 PRO — Lifetime tier only
- 🆓 FREE — Available on free tier
- 🎁 BOTH — Available on free tier with limits, full on PRO

---

## Monetization Strategy

> **Core Idea:** One-time lifetime purchase. No recurring subscriptions. Pay once, own forever — this fits the calm philosophy. Free tier exists so users can try the product honestly before paying.

### Why Lifetime (and not subscriptions)
1. **Calm by design** — no recurring billing anxiety, no "use it or lose it" pressure
2. **Trust signal** — we're confident the product is worth a permanent commitment
3. **Aligned incentives** — we build for long-term retention, not engagement metrics
4. **No dark patterns** — no auto-renewal, no cancellation friction, no "trial expiring soon" emails

### Free vs PRO Feature Comparison

| Feature | Free | Lifetime PRO |
|---------|------|--------------|
| **Skills** | Up to 3 active skills | Unlimited |
| **Categories** | Up to 2 categories | Unlimited |
| **Event history** | Last 30 days visible | Full history forever |
| **Freshness history chart** | 30 days | 90+ days |
| **Custom decay rates** | Default only | Per-skill custom rates |
| **Freshness targets** | ❌ | ✅ |
| **Skill dependencies** | ❌ | ✅ |
| **Skill notes/journal** | ❌ | ✅ |
| **Event templates** | Up to 2 templates | Unlimited |
| **Quick log widget** | ✅ | ✅ |
| **Period comparisons** | ❌ | ✅ |
| **Category aggregations** | ❌ | ✅ |
| **Personal records** | ❌ | ✅ |
| **Email alerts** | Decay only | All alert types + custom schedules |
| **Data export (JSON)** | ✅ | ✅ |
| **PWA / offline mode** | ✅ | ✅ |
| **Year-in-Review report** | ❌ | ✅ |
| **Time-invested dashboard** | Total hours only | Monthly trend + per-category + hours-vs-freshness |
| **Activity Report (print + CSV)** | ❌ | ✅ |
| **CSV import** | ❌ | ✅ |
| **Calendar export (.ics)** | ❌ | ✅ |
| **Personal API keys** | ❌ | ✅ |
| **Custom event types** | ❌ | ✅ |
| **Bulk event logging** | ❌ | ✅ |
| **Keyboard shortcuts** | Basic | Full set + customizable |
| **2FA** | ❌ | ✅ |
| **Priority support** | Standard tickets | Priority response |
| **Price** | ₼0 | **49 AZN one-time** (launch: 35 AZN early-bird) |

### Pricing Decisions (To Confirm with User)
- **Lifetime price:** **49 AZN** (~$29 USD equivalent). Launch promo: **35 AZN** for first 100 customers.
- **Payment provider:** **Epoint.az** (confirmed) — Azerbaijan-based, redirect-based hosted checkout, supports card tokenization
- **Currency:** **AZN only** (Epoint constraint — see "Provider Constraints" below)
- **Refund window:** 14 days, no questions asked
- **Grandfather policy:** All users who registered before payment launch get free PRO permanently (loyalty reward + builds trust at launch)

### Provider Constraints (Epoint-specific)

Choosing Epoint shapes several decisions — important to surface them up-front:

1. **Single currency (AZN)** — Epoint only accepts AZN. International users pay in AZN; their card issuer handles FX conversion. Pricing displayed only in AZN (no live USD/EUR display).
2. **Not a Merchant of Record** — Epoint is a payment gateway, not a tax-collecting MoR like Paddle. **We are responsible for our own VAT/sales tax compliance**. For Azerbaijan-domiciled merchant selling to AZ customers, this is straightforward; selling to EU customers would require us to register for VAT-MOSS or similar (likely out of scope at launch).
3. **No native subscriptions** — Epoint does not have a subscriptions API. This is fine for lifetime-only model (one-time charge). If recurring billing is ever needed, we'd combine saved-card tokenization (`card_id`) with our own cron-scheduled `execute-pay` calls.
4. **Regional fit** — Best for Azerbaijan / CIS users with AZN-accepting cards. Visa/Mastercard from anywhere should work but pay in AZN. Reflect this in marketing.
5. **No documented sandbox** — Test environment not mentioned in v1.0.3 docs. **Open question for Epoint support: do they provide a sandbox merchant for testing, or do we test in production with small amounts and immediate reversal?**
6. **AZ language support** — Epoint payment page supports `az`/`en`/`ru`. We'll send `en` since our app is English-only; later we could detect from `Accept-Language` and pass `ru` for Russian-speaking users.

### Philosophy Compliance Check
- ✅ No subscription = no recurring engagement pressure
- ✅ No artificial scarcity (no "limited time PRO features")
- ✅ No gamification of purchase ("unlock achievements")
- ✅ Free tier is genuinely useful, not crippleware
- ✅ Refunds honored without interrogation
- ✅ No upsell modals during workflows (one calm banner max)

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

## Phase 7: Payment & Subscription Infrastructure (HIGH PRIORITY - NEW)

The plumbing required to accept payments via **Epoint.az** and gate PRO features. **Must be built first** before any PRO-only features are released.

**Foundation status (2026-05-15):** Pieces 7.1a, 7.2, 7.3 (backend + frontend), 7.9 (read-only purchasers list only), 7.11 (admin-editable pricing), and 10.2 landed on branch `feature/payment-foundation` per `IMPLEMENTATION_PLAN_PAYMENT_FOUNDATION.md`. 7.1 (Epoint merchant onboarding) and 7.4–7.8, 7.10 (checkout, webhook, receipt, billing page, refunds, legal) remain — they require live Epoint credentials.

### 7.1 Epoint Merchant Onboarding & Setup
- [ ] **Description:** Register Epoint merchant account, configure URLs, obtain API keys
- [ ] **Why:** Foundation for everything else
- **Onboarding tasks (manual, done with Epoint via their cabinet):**
  - Sign up at epoint.az, complete merchant verification (likely requires Azerbaijan business registration / VÖEN — confirm)
  - Provide Epoint with the following URLs:
    - **Website address:** `https://skillfade.website`
    - **success_url:** `https://skillfade.website/billing/success` — user lands here after successful payment
    - **error_url:** `https://skillfade.website/billing/error` — user lands here after failed payment
    - **result_url:** `https://skillfade.website/api/webhooks/epoint` — server-to-server callback
  - Receive credentials from Epoint:
    - `public_key` — merchant ID (e.g., `i000000001`)
    - `private_key` — secret API access key
  - **Ask Epoint:** Is there a sandbox/test environment? Test card numbers? Documented behavior for failed/declined transactions?
- **Configuration:**
  - Add to `backend/.env`:
    ```
    EPOINT_PUBLIC_KEY=i000000XXX
    EPOINT_PRIVATE_KEY=<secret>
    EPOINT_BASE_URL=https://epoint.az/api/1
    EPOINT_RESULT_URL=https://skillfade.website/api/webhooks/epoint
    EPOINT_SUCCESS_URL=https://skillfade.website/billing/success
    EPOINT_ERROR_URL=https://skillfade.website/billing/error
    ```
  - Update `backend/app/core/config.py` to load these settings
- **Files to create:**
  - `backend/app/core/epoint.py` — Epoint client wrapper (signature generation, request helpers)
- **Complexity:** Low (mostly waiting on Epoint verification)
- **Dependencies:** Business registration with Epoint

### 7.1a Epoint Client Helper Module ✅ COMPLETED (signatures) / 🚧 stubs await keys
- [x] **Description:** Build a thin Python wrapper around the Epoint API so we don't sprinkle signature logic across routers
- [x] **Why:** Single place for the signing convention, easy to test, easy to swap if we ever change provider
- **Module responsibilities (`backend/app/core/epoint.py`):**
  - [x] `build_signed_payload(payload: dict) -> tuple[str, str]` — returns `(data, signature)` where `data = base64(json(payload))` and `signature = base64(sha1(private_key + data + private_key, raw=True))`
  - [x] `verify_signature(data: str, signature: str) -> bool` — same algorithm, constant-time compare (`hmac.compare_digest`)
  - [x] `decode_callback(data: str) -> dict` — `json.loads(base64.b64decode(data))`, raises `ValueError` on bad input
  - [ ] `create_payment(amount, order_id, description) -> dict` — POSTs to `/api/1/request`, returns `{status, transaction, redirect_url}` *(stub: raises `NotImplementedError("Epoint keys not yet configured")`)*
  - [ ] `get_status(transaction: str) -> dict` — POSTs to `/api/1/get-status` *(stub)*
  - [ ] `reverse(transaction: str, amount: float | None) -> dict` — POSTs to `/api/1/reverse` for refund *(stub)*
- **Python signature reference:**
  ```python
  import base64, hashlib, json
  def build_signed_payload(payload, private_key):
      data = base64.b64encode(json.dumps(payload).encode()).decode()
      sig_str = (private_key + data + private_key).encode()
      signature = base64.b64encode(hashlib.sha1(sig_str).digest()).decode()
      return data, signature
  ```
- **Testing:** Unit tests with the example from the docs:
  - [x] Byte-exact `KNOWN_VECTOR` test in `backend/tests/test_epoint.py` matches the doc's worked example (`data` + `signature`)
  - [x] Round-trip / tamper / invalid-base64 / invalid-JSON / mismatched-length / stub-methods-raise tests (8 total, all passing)
- **Complexity:** Low
- **Dependencies:** 7.1

### 7.2 Subscription / License Database Model ✅ COMPLETED
- [x] **Description:** Track which users have purchased lifetime PRO and the Epoint transaction details
- [x] **Why:** Source of truth for feature gating + audit trail of payments
- **Database change:** New `subscriptions` table
- **Schema (Epoint-aware):**
  ```sql
  id                    UUID PRIMARY KEY
  user_id               UUID REFERENCES users(id) ON DELETE CASCADE
  plan                  VARCHAR(20) NOT NULL    -- 'free', 'lifetime', 'grandfathered'
  status                VARCHAR(20) NOT NULL    -- 'pending', 'active', 'refunded', 'revoked', 'failed'
  provider              VARCHAR(20) DEFAULT 'epoint'  -- 'epoint', 'manual' (admin grants)
  order_id              VARCHAR(64) UNIQUE      -- Our internal unique ID we send to Epoint
  epoint_transaction    VARCHAR(64)             -- Epoint's transaction ID (e.g., te001111111)
  epoint_bank_transaction VARCHAR(64)           -- Bank-level transaction ID
  epoint_rrn            VARCHAR(32)             -- Retrieval Reference Number (success only)
  epoint_code           VARCHAR(8)              -- Bank response code (e.g., 000)
  card_mask             VARCHAR(20)             -- e.g., '418405******1234'
  card_name             VARCHAR(100)
  purchased_at          TIMESTAMP
  refunded_at           TIMESTAMP
  amount                NUMERIC(10, 2)          -- Amount in AZN (e.g., 49.00)
  currency              VARCHAR(3) DEFAULT 'AZN'
  raw_callback          JSONB                   -- Full decoded webhook payload for audit
  notes                 TEXT                    -- Admin notes
  created_at            TIMESTAMP DEFAULT NOW()
  updated_at            TIMESTAMP DEFAULT NOW()
  ```
- **Notes on schema:**
  - `amount` uses `NUMERIC` not cents (AZN has 2 decimals, but Epoint accepts decimal amounts like `30.75` directly)
  - `order_id` is **our** generated ID (we control it — recommend format like `sf_lt_{uuid8}`); Epoint reuses it back to us in callbacks
  - `epoint_transaction` is **Epoint's** ID returned in their response
  - `raw_callback` stores the full webhook JSON for forensic debugging if something goes wrong
- **Files to create:**
  - [x] `backend/app/models/subscription.py`
  - [x] `backend/app/schemas/subscription.py` (`SubscriptionSummary`, `SubscriptionResponse`)
  - [x] `backend/alembic/versions/20260515_0009-subscriptions.py` (revision `009`, with 3 indexes incl. unique `order_id`)
- **Complexity:** Medium
- **Dependencies:** None

### 7.3 Feature Entitlement System ✅ COMPLETED (minimal ProGate; full UpgradePrompt deferred to 9.2)
- [x] **Description:** Centralized check for "does this user have PRO?" used by all feature gates
- [x] **Why:** Single source of truth, easy to change limits without scattering logic
- **Backend implementation:**
  - [x] `backend/app/services/entitlements.py` — `PlanInfo` dataclass, `get_user_plan(user, db)`, `can_use_feature(user, db, feature)`, `get_limit(user, db, limit)`, `FREE_LIMITS`, `PRO_FEATURES`
  - [x] FastAPI dependency `require_pro` (used as `Depends(require_pro)`, mirroring `get_current_admin_user` — see Plan Q2) — chose dependency form over decorator
  - [x] Returns HTTP **402 Payment Required** (per Plan Q5) with body `{"error": "pro_required", "upgrade_url": "/pricing"}`
  - [x] New endpoint `GET /api/billing/me` in `backend/app/routers/billing.py` exposes `PlanInfo` for the frontend
- **Frontend implementation:**
  - [x] `frontend/src/context/PlanContext.tsx` — fetches `/api/billing/me` on mount + on auth change; skips the call for guests (per Plan Q7), synchronously returns free state
  - [x] `frontend/src/hooks/usePlan.ts` — re-exports `usePlan` + `useIsPro` + `useFeatureLimit`
  - [x] `frontend/src/components/ProGate.tsx` — minimal inline placeholder with `/pricing` link (calm-design `UpgradePrompt` remains Phase 9.2)
  - [x] `PlanProvider` wraps routes inside `AuthProvider` in `App.tsx`
  - [x] `frontend/src/services/api.ts` exposes `billing.me()`; `frontend/src/types/index.ts` defines `Plan`, `PlanLimits`, `PlanResponse`
- **Tests:**
  - [x] `backend/tests/conftest.py` — shared SQLite session + `TestClient` fixtures (with dialect compilations so `postgresql.UUID` / `JSONB` columns load on SQLite — Plan Q3)
  - [x] `backend/tests/test_entitlements.py` — 10 tests covering free/grandfathered/lifetime/pending/refunded paths, `require_pro` 402/200, and `/api/billing/me` shape
- **Complexity:** Medium-High
- **Dependencies:** 7.2

### 7.4 Checkout Flow (Epoint redirect-based)
- [ ] **Description:** User clicks "Upgrade" → backend creates a pending subscription + Epoint payment → user redirected to Epoint card-entry page → returns to app → webhook confirms PRO
- [ ] **Why:** Smooth purchase experience that handles all card brands and 3DS via Epoint
- **Flow (Epoint API approach — `/api/1/request`):**
  1. Frontend POSTs `/api/billing/checkout` (authenticated)
  2. Backend:
     - Generates unique `order_id` (e.g., `sf_lt_<uuid8>`)
     - Inserts row in `subscriptions` with `status='pending'`, our `order_id`
     - Builds Epoint payload: `{public_key, amount: 49.00, currency: 'AZN', language: 'en', order_id, description: 'SkillFade Lifetime'}`
     - Signs and POSTs to `https://epoint.az/api/1/request`
     - Receives `{status, transaction, redirect_url}` from Epoint
     - Stores `transaction` on our subscription row
     - Returns `{redirect_url}` to frontend
  3. Frontend redirects user to `redirect_url`
  4. User enters card on Epoint's hosted page (Epoint handles 3DS)
  5. Epoint redirects user back to `success_redirect_url` or `error_redirect_url`
  6. Meanwhile, Epoint POSTs result to `result_url` (our webhook — see 7.5)
- **Alternative (form-based checkout — `/api/1/checkout`):** Backend renders a hidden form posted to `https://epoint.az/api/1/checkout`. Simpler (no preflight API call) but harder to set `pending` row before user pays. **Recommendation:** use API approach (`/api/1/request`) so we can record the pending subscription server-side first.
- **Frontend pages:**
  - `Pricing.tsx` — public pricing page with "Buy Lifetime" CTA
  - `BillingSuccess.tsx` (`/billing/success`) — "Payment received, finalizing..." with polling: calls `GET /api/billing/me` every 2s until `plan === 'lifetime'` (waiting for webhook), max 30s. Falls back to "If your access doesn't activate in a minute, contact support."
  - `BillingError.tsx` (`/billing/error`) — "Payment was not completed" with retry button → back to /pricing
- **Files to create:**
  - `backend/app/routers/billing.py` — `POST /checkout`, `GET /me` (current plan), `POST /refund-request`
  - `frontend/src/pages/Pricing.tsx`
  - `frontend/src/pages/BillingSuccess.tsx`
  - `frontend/src/pages/BillingError.tsx`
- **Complexity:** Medium
- **Dependencies:** 7.1, 7.1a, 7.2, 7.3

### 7.5 Webhook Handler (Epoint result_url callback)
- [ ] **Description:** Receive Epoint POST callbacks at `/api/webhooks/epoint` and update subscription state
- [ ] **Why:** Webhook is the **only** reliable confirmation that payment succeeded — never trust the redirect alone (user could close the tab, JS could fail)
- **Endpoint:** `POST /api/webhooks/epoint` (the `result_url` configured with Epoint)
- **Request format from Epoint:**
  ```
  POST /api/webhooks/epoint
  Content-Type: application/x-www-form-urlencoded
  data=<base64-encoded JSON>&signature=<base64 sha1 hash>
  ```
- **Verification (mandatory, security-critical):**
  ```python
  expected = base64.b64encode(
      hashlib.sha1((private_key + data + private_key).encode()).digest()
  ).decode()
  if not hmac.compare_digest(expected, received_signature):
      return 403  # Reject — likely forged
  ```
- **Decoded payload fields:** `order_id`, `status` (`success`/`failed`), `code`, `message`, `transaction`, `bank_transaction`, `bank_response`, `operation_code` (`100` = user payment), `rrn`, `card_name`, `card_mask`, `amount`, `other_attr`
- **Handler logic:**
  1. Verify signature → reject if mismatch
  2. Decode `data` → JSON
  3. Look up subscription by `order_id` (our internal ID)
  4. **Idempotency:** if subscription already `status='active'` and matches this transaction, return 200 OK without re-processing (Epoint may retry)
  5. If `status == 'success'`:
     - Update subscription: `status='active'`, `plan='lifetime'`, `purchased_at=now()`, populate epoint_* fields, store `raw_callback`
     - Send PRO welcome email (see 7.6)
  6. If `status == 'failed'`:
     - Update subscription: `status='failed'`, store `raw_callback`
     - Do not send email (user already saw the error page)
  7. **Always return 200** to Epoint (even on internal errors — re-raise to monitoring instead, so Epoint doesn't infinitely retry)
- **Operation codes seen in callbacks:**
  - `100` — user payment (the normal lifetime purchase case)
  - `001` — card registration (not used for lifetime, but possible if we ever save cards)
  - `200` — card registration with first payment (also not used)
- **Bank response codes:** Doc lists 100+ codes. `000` = confirmed/success. Anything else = failure. Worth logging `code` + `message` for support debugging.
- **Refund webhook:** When we call `/api/1/reverse` (7.8), Epoint may or may not POST a callback for the refund — **needs confirmation from Epoint support**. If yes, handle: lookup by `transaction`, set `status='refunded'`, `refunded_at=now()`. If no callback, our `/reverse` API call's synchronous response is the source of truth.
- **Files to create:**
  - `backend/app/routers/webhooks.py` — `POST /epoint` endpoint
  - `backend/app/services/payment_processor.py` — `process_epoint_callback(data, signature)` business logic
- **Complexity:** High (security-critical)
- **Dependencies:** 7.1, 7.1a, 7.2

### 7.6 Receipt & Confirmation Email
- [ ] **Description:** Send the user a payment confirmation with receipt link
- [ ] **Why:** Trust + compliance — users expect a receipt
- **Note:** Most MoR providers (Paddle/LemonSqueezy) send their own receipt automatically. We send a *welcome to PRO* email separately.
- **Files to modify:**
  - `backend/app/services/alerts.py` - Add `send_pro_welcome_email()`
- **Complexity:** Low
- **Dependencies:** 7.5

### 7.7 Account / Billing Page
- [ ] **Description:** User-facing page showing current plan, purchase date, receipt link, refund option
- [ ] **Why:** Transparency — users can see what they bought and when
- **Files to create:**
  - `frontend/src/pages/Billing.tsx` - Billing/plan info
  - Section in `Settings.tsx` linking to `/billing`
- **Complexity:** Low-Medium
- **Dependencies:** 7.2, 7.3

### 7.8 Refund Process (Epoint `/reverse`)
- [ ] **Description:** 14-day no-questions refund, processable from user side and admin side
- [ ] **Why:** Builds trust, reduces support burden
- **Epoint endpoint:** `POST https://epoint.az/api/1/reverse` with `{public_key, language, transaction, amount?, currency}`. Omit `amount` for full refund; specify for partial.
- **User flow:**
  1. Settings → Billing → "Request refund" button (only visible if `purchased_at` is within 14 days)
  2. Confirmation modal: "This will refund 49 AZN to your card and revoke PRO access. Continue?"
  3. Backend: `POST /api/billing/refund-request`
  4. Backend calls Epoint `/reverse` with stored `epoint_transaction`
  5. On success: set `subscription.status='refunded'`, `refunded_at=now()`, `plan='free'` (data preserved per 10.4)
  6. Send refund confirmation email
- **Admin flow:** Admin panel → Subscriptions → row → "Refund" button (no 14-day window, requires reason in notes)
- **Edge cases:**
  - Already refunded → return 200 (idempotent)
  - Epoint returns `failed` → log error, surface friendly message ("Refund could not be processed automatically — support has been notified")
  - Subscription `grandfathered` → no refund possible (no money was charged)
- **Files to modify:**
  - `backend/app/routers/billing.py` — `POST /refund-request` endpoint
  - `frontend/src/pages/Billing.tsx` — Refund button + confirmation modal
  - `backend/app/routers/admin.py` — Admin refund endpoint
  - `backend/app/core/epoint.py` — `reverse()` client method (already in 7.1a)
- **Complexity:** Medium
- **Dependencies:** 7.1, 7.1a, 7.7

### 7.9 Admin Subscription Dashboard 🚧 PARTIAL (read-only list shipped 2026-05-15)
- [ ] **Description:** View all purchases, manually grant PRO (for support cases), refund, see revenue stats
- [x] **Why:** Operate the business without writing SQL
- **Features:**
  - [x] List all subscriptions with filters (status, plan) and pagination
  - [ ] Date-range filter
  - [ ] Manual grant PRO (e.g., for testers, support apologies, partnerships)
  - [ ] Manual refund / revoke (blocked on 7.8 — needs Epoint `/reverse`)
  - [ ] Revenue summary card on admin dashboard (MTD, YTD, total)
- **Files created so far:**
  - [x] `frontend/src/pages/admin/AdminPurchasers.tsx` — read-only table with status filter chips
  - [x] `backend/app/routers/admin.py` — `GET /api/admin/subscriptions` (paginated, `status` + `plan` filters, joined with `user.email`)
  - [x] `backend/app/schemas/admin.py` — `AdminSubscriptionResponse`
  - [x] Sidebar entry "Purchasers" in `AdminLayout.tsx`
- **Tests:** `backend/tests/test_admin_subscriptions.py` (6 cases — list, filter-by-status, filter-by-plan, pagination, non-admin rejected, empty list)
- **Complexity:** Medium
- **Dependencies:** 7.2, 7.3

### 7.11 Admin-editable pricing ✅ COMPLETED (2026-05-15)
- [x] **Description:** Let the admin change the lifetime / early-bird AZN prices without a redeploy
- [x] **Why:** Lets us flip the early-bird promo off after the first 100 customers (or rotate pricing tests) without touching env vars or restarting the backend
- **Approach:** Generic key/value `app_settings` table. Reads fall back to the matching `EPOINT_*_PRICE_AZN` env var when no DB row exists, so the foundation keeps working until an admin saves a value.
- **Files created:**
  - [x] `backend/alembic/versions/20260515_0011-app_settings.py` (revision `011`)
  - [x] `backend/app/models/app_setting.py`
  - [x] `backend/app/services/site_settings.py` — `get_setting`, `set_setting`, `get_effective_value`, `parse_price` (validates non-negative, ≤2 decimals)
  - [x] `backend/app/schemas/admin.py` — `AdminPricingResponse`, `AdminPricingUpdate`
  - [x] `backend/app/routers/admin.py` — `GET /api/admin/pricing` + `PATCH /api/admin/pricing`
  - [x] `frontend/src/pages/admin/AdminPricing.tsx` — form with a `DB`/`env` badge per field
  - [x] Sidebar entry "Pricing" in `AdminLayout.tsx`
- **Tests:** `backend/tests/test_pricing.py` (18 cases — service, parse_price validation, endpoint GET/PATCH/auth)
- **Complexity:** Low-Medium
- **Dependencies:** 7.2

### 7.10 Tax / Legal Pages
- [ ] **Description:** Refund policy, Terms of Service, updated Privacy Policy mentioning payment data
- [ ] **Why:** Legal requirement for selling globally
- **Files to create:**
  - `frontend/src/pages/Terms.tsx`
  - `frontend/src/pages/RefundPolicy.tsx`
  - Update `frontend/src/pages/Privacy.tsx` for payment data handling
- **Complexity:** Low (mostly content writing)
- **Dependencies:** None

---

## Phase 8: PRO Exclusive Features (HIGH PRIORITY - NEW)

These are the features that justify the lifetime purchase. They must feel like genuine value, not artificial gates.

### 8.1 Free Tier Limit Enforcement
- [ ] **Description:** Enforce skill/category/template/history limits on free tier
- [ ] **Why:** Foundation of the freemium model
- **Limits to enforce:**
  - Max 3 active skills (archived skills don't count)
  - Max 2 categories
  - Max 2 event templates
  - Event history visible only for last 30 days (data still stored — just hidden, restored if user upgrades)
  - Freshness history chart limited to 30 days
- **UX rules:**
  - When user hits limit, show calm modal: "You've reached the 3-skill limit on free tier. Upgrade to PRO for unlimited skills, or archive an existing skill."
  - Never delete data — always preserve so upgrade restores full view
- **Files to modify:**
  - `backend/app/routers/skills.py`, `categories.py`, `templates.py` - Limit checks
  - `backend/app/routers/analytics.py` - History window for free tier
  - `frontend/src/pages/Skills.tsx`, etc. - Show "X of 3 used" indicators
  - `frontend/src/components/UpgradePrompt.tsx` - New reusable component
- **Complexity:** Medium
- **Dependencies:** 7.3

### 8.2 Year-in-Review Report (PDF)
- [ ] **Description:** Annual reflection summary as downloadable PDF — skills practiced, time invested, freshness trajectories, milestones
- [ ] **Why:** High-perceived-value feature, shareable (without being "social"), nostalgia-driven
- **Content:**
  - Skills you practiced most
  - Total learning hours, total practice hours, ratio
  - Skills that bloomed (low → high freshness)
  - Skills that faded (high → low freshness)
  - Longest streak of activity
  - Most active month
  - A reflective quote at the end (not motivational — observational)
- **Technical:**
  - Backend: Generate PDF with WeasyPrint or ReportLab
  - Generated on-demand, optionally cached
- **Files to create:**
  - `backend/app/services/year_in_review.py`
  - `backend/app/routers/reports.py` - `GET /api/reports/year-in-review/:year`
  - `frontend/src/pages/YearInReview.tsx` - Preview + download button
- **Complexity:** Medium-High
- **Dependencies:** 7.3 (PRO gate)

### 8.3 CSV Import (moved from Phase 3 → PRO)
- [ ] **Description:** Bulk import historical learning/practice events from CSV
- [ ] **Why:** Power feature for users migrating from spreadsheets — high willingness to pay
- **Files to modify:**
  - `backend/app/routers/settings.py` - Import endpoint
  - `frontend/src/pages/Settings.tsx` - File upload UI with CSV template download
- **Complexity:** Medium-High
- **Dependencies:** 7.3

### 8.4 Calendar Export (.ics)
- [ ] **Description:** Export practice sessions as iCal feed, subscribable in Google Calendar / Apple Calendar
- [ ] **Why:** Lets users see their learning history alongside their actual calendar — useful, novel
- **Endpoint:** `GET /api/export/calendar.ics?token=<personal_token>` — token-based so users can subscribe without app login
- **Files to create:**
  - `backend/app/services/calendar_export.py`
  - `backend/app/routers/exports.py`
  - Section in `Settings.tsx` showing the subscribable URL
- **Complexity:** Medium
- **Dependencies:** 7.3

### 8.5 Personal API Keys (moved from Phase 5 → PRO)
- [ ] **Description:** Generate API tokens so power users can build integrations, scripts, dashboards
- [ ] **Why:** Premium-tier user expectation; small but vocal user base
- **See Phase 5.4 for technical details.** Moved to PRO tier.
- **Complexity:** High
- **Dependencies:** 7.3

### 8.6 Custom Event Types (moved from Phase 3 → PRO)
- [ ] **Description:** Define your own event subtype labels beyond the built-in set
- **See Phase 3.4 for technical details.** Moved to PRO tier.
- **Complexity:** Medium
- **Dependencies:** 7.3

### 8.7 Bulk Event Logging (moved from Phase 3 → PRO)
- [ ] **Description:** Log one event across multiple skills in one action
- **See Phase 3.2 for technical details.** Moved to PRO tier.
- **Complexity:** Medium
- **Dependencies:** 7.3

### 8.8 Skill Goals & Milestones (informational only)
- [ ] **Description:** Set a target activity goal per skill (e.g., "practice 4x per month") with calm progress indicator — **no rewards, no badges, no celebration**
- [ ] **Why:** Personal accountability without gamification; user defines own standard
- **Database change:** Add `goal_type`, `goal_target`, `goal_period` columns to skills
- **UI:** Simple progress bar showing "3 of 4 practices this month" — no green checkmarks, no fireworks
- **Files to modify:**
  - `backend/app/models/skill.py` - Goal fields
  - `backend/app/routers/skills.py` - Handle goal fields
  - `frontend/src/pages/SkillDetail.tsx` - Goal setting UI
- **Complexity:** Medium
- **Dependencies:** 7.3, database migration
- **Philosophy check:** Must be informational only — no encouragement messages, no streak preservation, no FOMO

### 8.9 Advanced Email Alert Customization
- [ ] **Description:** Choose specific days/times, mute periods (vacation mode), per-skill alert opt-in
- [ ] **Why:** Free tier gets decay alerts only; PRO gets full customization
- **See Phase 4.2 for technical details.** Tied to PRO.
- **Complexity:** Medium
- **Dependencies:** 7.3

### 8.10 Two-Factor Authentication (moved from Phase 5 → PRO)
- [ ] **Description:** Optional TOTP-based 2FA — security feature commonly expected at paid tier
- **See Phase 5.1 for technical details.** Moved to PRO tier.
- **Complexity:** High
- **Dependencies:** 7.3

### 8.11 Backup & Restore from JSON (moved from Phase 5 → PRO)
- [ ] **Description:** Import previously-exported JSON to restore data
- **See Phase 5.3 for technical details.** Moved to PRO tier.
- **Complexity:** Medium-High
- **Dependencies:** 7.3

### 8.12 Keyboard Shortcuts: Full Set (moved from Phase 3 → BOTH with PRO bonus)
- [ ] **Description:** Free gets basic 3 shortcuts; PRO gets full customizable set
- **See Phase 3.1 for technical details.**
- **Complexity:** Medium
- **Dependencies:** 7.3

### 8.13 Priority Support
- [ ] **Description:** PRO users' tickets are flagged and surface at top of admin queue with priority badge
- [ ] **Why:** Sets expectation that PRO support is more responsive (without promising SLA)
- **Files to modify:**
  - `backend/app/models/ticket.py` - Add priority field (auto-set based on plan at ticket creation)
  - `backend/app/routers/admin.py` - Sort by priority in admin ticket list
  - `frontend/src/pages/admin/AdminTickets.tsx` - Priority badge column
- **Complexity:** Low
- **Dependencies:** 7.3

### 8.14 Time-Invested Suite ✅ COMPLETED (2026-06-13)
- [x] **Description:** Surface the `duration_minutes` already logged on every event as PRO value: an in-app "Time Invested" dashboard (total hours, monthly trend, per-category, hours-vs-freshness overlay) + a date-range **Activity Report** (print-styled HTML "Save as PDF" + CSV) for appraisals / CPD / client billing.
- [x] **Why:** Recurring, deadline-driven willingness-to-pay; reuses data users already enter. Distinct from 8.2 Year-in-Review (calendar-year, reflective) — this is arbitrary-range, hour-centric, audience-facing.
- [x] **Free vs PRO:** Free = total-hours figures (account + per-skill) + duration coverage + a SkillDetail stat; PRO = monthly trend, per-category roll-up, hours-vs-freshness overlay, and the date-range report (print + CSV).
- [x] **Also fixed a philosophy violation:** un-gated `GET /settings/export` (was wrongly `Depends(require_pro)`); raw data export is now free for every plan, per "export & deletion always free".
- **Output:** print-styled HTML + client-side CSV — **no new backend dependency, no DB migration**. (Server-side PDF via WeasyPrint remains a future option.)
- **Files:** `backend/app/services/time_stats.py`, `backend/app/schemas/analytics.py`, `backend/app/routers/analytics.py` (+ `settings.py` export fix), `backend/tests/test_time_stats.py`; `frontend/src/pages/ActivityReport.tsx`, `Analytics.tsx`, `utils/csv.ts`, `services/api.ts`, `types/index.ts`, `App.tsx`, `index.css`, `SkillDetail.tsx`, `Settings.tsx`. Spec: `docs/superpowers/specs/2026-06-13-time-invested-suite-design.md`.
- **Tests:** backend 99 passing (12 new in `test_time_stats.py`); frontend 14 passing (6 new in `timeCsv.test.ts`); `npm run build` clean.
- **Complexity:** Medium
- **Dependencies:** 7.3

---

## Phase 9: Pricing & Conversion (NEW)

Pages and gentle prompts that convert free users to PRO. Must follow calm-design principles — no dark patterns, no urgency manufacturing, no popups during workflows.

### 9.1 Pricing Page
- [ ] **Description:** Public `/pricing` page with clear feature comparison and "Buy Lifetime" CTA
- [ ] **Why:** Required for any paid product; main conversion surface
- **Content:**
  - Hero: "Pay once. Own forever."
  - Feature comparison table (from Monetization Strategy section above)
  - Pricing card: $39 one-time (or launch promo $29)
  - FAQ section: "Is this really lifetime?", "What if I want a refund?", "Can I use it offline?"
  - Trust signals: "14-day refund, no questions", "Your data is yours", "No subscription tricks"
- **Files to create:**
  - `frontend/src/pages/Pricing.tsx`
  - Add route in `App.tsx`
  - Add to `PUBLIC_ROUTES` in `RouteTracker.tsx` and `CookieBanner.tsx`
  - Add to `sitemap.xml`
  - Link from `Landing.tsx`, `Features.tsx`, `PublicFooter.tsx`
- **Complexity:** Low-Medium
- **Dependencies:** 7.1 (need real checkout link)

### 9.2 In-App Upgrade Prompts (calm version)
- [ ] **Description:** Subtle upgrade prompts at natural friction points — not popups, not interruptions
- [ ] **Why:** Conversion without harassment
- **Allowed placements:**
  - Settings page — small "Upgrade to PRO" card (replaces BMC card for free users)
  - Locked-feature screens — clean "This is a PRO feature" state with one button
  - When hitting a limit — modal explaining the limit, with upgrade option
  - One footer link in Layout (subtle)
- **Disallowed placements:**
  - No interrupting modals during event logging
  - No "Are you sure?" upsells when archiving skills
  - No banner on every page
  - No countdown timers, "X people upgraded today" social proof, etc.
- **Files to create:**
  - `frontend/src/components/UpgradePrompt.tsx` - Reusable component (card/modal/inline variants)
- **Complexity:** Low
- **Dependencies:** 7.3

### 9.3 Launch Email Sequence (one-time, optional)
- [ ] **Description:** When payment launches, email existing free users a one-time honest announcement
- [ ] **Why:** Existing users deserve to know; many will grandfather, others may upgrade out of support
- **Content (one email only):**
  - "We're launching paid lifetime access. Here's why."
  - Explanation of grandfather policy (all existing users get free PRO)
  - Soft mention of how to support the project if they want
  - Link to pricing page
- **Files to modify:**
  - `backend/run_alerts.py` - One-off script run manually for launch
- **Complexity:** Low
- **Dependencies:** Grandfather policy implemented

### 9.4 Testimonials Section (optional, when available)
- [ ] **Description:** A small "What users say" section on pricing/landing pages
- [ ] **Why:** Social proof drives conversion — but only if testimonials are real
- **Constraint:** No fake testimonials. Wait until real users opt-in. Better to launch without than to fabricate.
- **Files to modify:** Eventually `Pricing.tsx`, `Landing.tsx`
- **Complexity:** Low
- **Dependencies:** Real testimonials collected

### 9.5 Trial Period (decision needed)
- [ ] **Description:** Optional 14-day full-feature trial on signup
- [ ] **Why:** Lets users experience PRO before deciding; raises conversion
- **Tradeoff:** Adds complexity; could be skipped initially in favor of "Free tier is the trial"
- **Recommendation:** Skip for v1. The free tier IS the trial. Revisit after 3 months of data.
- **Complexity:** Medium
- **Dependencies:** 7.3

---

## Phase 10: Free Tier Polish (NEW)

The free tier must be genuinely useful, not crippleware. These tasks ensure free users have a positive experience and become advocates.

### 10.1 Account Status / Plan Indicator
- [ ] **Description:** Small badge in header showing "Free" or "PRO" plan
- [ ] **Why:** Users always know what tier they're on; no confusion
- **Files to modify:**
  - `frontend/src/components/Layout.tsx` - Plan badge
- **Complexity:** Low
- **Dependencies:** 7.3

### 10.2 Grandfather Existing Users ✅ COMPLETED
- [x] **Description:** Migration that marks all pre-launch users as `plan='grandfathered'` with full PRO access
- [x] **Why:** Loyalty reward + builds launch goodwill
- **Database migration:** [x] `backend/alembic/versions/20260515_0010-grandfather_users.py` (revision `010`) — pure SQL `INSERT … SELECT` with `WHERE NOT EXISTS` guard so re-running is idempotent. `downgrade()` only removes rows it inserted (matched by `notes='Auto-granted: registered before payment launch'` + `provider='manual'` + `plan='grandfathered'`).
- **Complexity:** Low
- **Dependencies:** 7.2

### 10.3 Free Tier Limit UX (graceful, not harsh)
- [ ] **Description:** Show "2 of 3 skills used" indicators on Skills page; preview locked features instead of hiding them
- [ ] **Why:** Free users see what they're missing without feeling punished
- **Approach:** Show locked PRO features grayed out with a small lock icon and tooltip "PRO feature" — better than hiding (drives curiosity, not frustration)
- **Files to modify:** Skills, Settings, SkillDetail, Analytics pages
- **Complexity:** Medium
- **Dependencies:** 7.3

### 10.4 Data Retention Promise
- [ ] **Description:** When free user hits limits, data is *hidden* not deleted. Upgrade unlocks full visibility.
- [ ] **Why:** No user should lose data because they didn't upgrade. Trust signal.
- **Implementation:** History windowing in queries (not deletion); soft limits
- **Files to modify:** Backend queries that respect free tier history window
- **Complexity:** Medium
- **Dependencies:** 8.1

---

## Implementation Order Recommendation

**Recommended sequence for shipping payments with Epoint:**

1. **Epoint onboarding (7.1)** — submit URLs to Epoint, complete merchant verification, receive `public_key` + `private_key`. **Blocking — start this first**, the rest is parallelizable while waiting.
2. **Phase 7.1a, 7.2, 7.3** (Epoint client, DB model, entitlements) — Foundation
3. **Phase 10.2** (Grandfather existing users) — Protect current users
4. **Phase 7.4** (Checkout flow) — End-to-end test in production with a real small charge (e.g., 1 AZN), then reverse it. **Open question: does Epoint offer sandbox?**
5. **Phase 7.5** (Webhook handler) — Critical security work; verify signature validation with curl/postman
6. **Phase 7.6** (Welcome email) — Post-purchase UX
7. **Phase 7.7-7.9** (Account page + refunds + admin) — Operate the business
8. **Phase 9.1** (Pricing page) — Marketing surface
9. **Phase 8.1** (Free tier limits) — Activate the business model
10. **Phase 10.1, 10.3, 10.4** (Free tier UX polish) — Ensure free experience is good
11. **Phase 9.2** (Calm upgrade prompts) — Convert
12. **Phase 7.10** (Legal pages) — Compliance
13. **Phase 8.2+** (PRO exclusive features) — Add value over time

**Estimated minimum viable monetization scope:** Steps 1-12 above. Phase 8.2+ are post-launch enhancements that increase perceived value.

### Open Questions for Epoint Support (before launch)

These should be clarified with Epoint by email/call before going live:

1. **Sandbox / test environment** — Is there a test merchant we can use? Test card numbers that simulate success/decline/3DS?
2. **Refund callback** — When we call `/api/1/reverse`, does Epoint also POST a callback to `result_url`? Or is the API response the only signal?
3. **Webhook retry policy** — If our server returns 5xx, how often and for how long does Epoint retry? Do they send a unique idempotency key, or do we rely on `order_id` + `transaction` for dedup?
4. **Currency rendering** — How does Epoint display 49 AZN to a user paying with a USD/EUR card? Does the Epoint page show the converted amount?
5. **3DS** — Is 3D Secure mandatory or opt-in? Any extra params we need to send?
6. **Merchant requirements** — Azerbaijan business registration (VÖEN) required? Sole proprietor accepted?
7. **Payout schedule** — When do collected funds hit the merchant's bank account? Daily / weekly / on-demand?
8. **Fees** — What % does Epoint charge per transaction? Flat fee + percentage?

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

### Monetization patterns rejected

| Pattern | Reason for Rejection |
|---------|---------------------|
| Auto-renewing monthly/annual subscriptions | Recurring billing = recurring engagement pressure; violates calm philosophy |
| Hidden subscription terms | Trust violation; dark pattern |
| "Trial expires in X days!" urgency emails | Manufactured FOMO; not calm |
| Cancellation friction (call to cancel, etc.) | Dark pattern; the opposite of trust |
| "Limited time pricing — act now!" countdowns | Manufactured scarcity |
| Tying free tier limits to retention metrics | Engagement maximization, not user value |
| Locking export/deletion behind paywall | User data must always be retrievable & deletable, regardless of plan |
| Disabling existing PRO features for non-payers | Grandfather policy commits us to honoring prior access |
| Upsell modals during core workflows (logging events, etc.) | Interrupts the calm UX; one banner max |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-09 | Initial roadmap created |
| 1.1 | 2026-01-09 | Phase 1 features completed |
| 1.2 | 2026-01-10 | Phase 2 features completed |
| 1.3 | 2026-01-10 | Phase 6 features completed (PWA, Skill Dependencies, Skill Notes) |
| 1.4 | 2026-05-14 | Monetization strategy added; Phases 7-10 for payment infrastructure, PRO features, pricing/conversion, free tier polish |
| 1.5 | 2026-05-15 | Payment provider locked in: Epoint.az. Phase 7 rewritten with Epoint-specific endpoints, signature scheme, callback handling, refunds. Pricing converted to AZN. Provider constraints documented. |
| 1.6 | 2026-06-13 | Time-Invested suite shipped (8.14): in-app hours dashboard + hours-vs-freshness overlay + date-range Activity Report (print + CSV). Data export un-gated (free for all). Payments confirmed live via shared gateway hub. |

---

**Last Updated:** 2026-06-13
