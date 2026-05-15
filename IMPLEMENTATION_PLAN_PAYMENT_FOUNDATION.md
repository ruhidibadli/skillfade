# Payment Foundation — Implementation Plan

> **Status: APPROVED 2026-05-15.** Q1 resolved with the byte-exact Epoint doc fixture; Q2–Q7 resolved by adopting the recommended defaults (see "Decisions (Q2–Q7)" section). A separate chat will execute this plan.
>
> **Scope of this plan:** The four foundation pieces of the Epoint.az payment system that do **not** require live Epoint credentials. When merchant verification completes for the new Epoint account, the next chat after this one can implement checkout (7.4) + webhook (7.5) without re-doing this groundwork.
>
> **Locked-in decisions (from chat brief, not re-litigated):**
> - Provider: **Epoint.az** — AZN-only, redirect-based hosted checkout, SHA1+base64 signature scheme, no MoR, no native subscriptions.
> - Price: **49 AZN lifetime** (35 AZN early-bird launch promo).
> - Model: **lifetime only**, no recurring subscriptions.
> - **Grandfather** all existing users to free PRO permanently.
> - New Epoint merchant account being opened — final `EPOINT_PUBLIC_KEY` / `EPOINT_PRIVATE_KEY` arrive later. Foundation work proceeds with stubs and placeholder env values.

---

## In scope (this chat)

| # | Roadmap ref | Piece | Why it can land without keys |
|---|---|---|---|
| 1 | 7.1a | `app/core/epoint.py` — signature builder/verifier + stub HTTP methods | Pure cryptography; HTTP methods left as stubs raising `NotImplementedError` until keys arrive. Unit-testable with the doc's worked example. |
| 2 | 7.2 | `Subscription` model + Alembic migration `0009` | No external calls. Schema is fully spec'd in ROADMAP.md §7.2. |
| 3 | 7.3 | Entitlement system — backend service + decorator, frontend context + hooks + `ProGate` | Reads from `subscriptions` table; no Epoint dependency. |
| 4 | 10.2 | Grandfather migration `0010` | Pure SQL `INSERT ... SELECT` over users table. No external calls. |

## Out of scope (deliberately deferred)

- 7.4 Checkout flow — needs `public_key`, `private_key`, hits live `/api/1/request`.
- 7.5 Webhook handler — needs `result_url` registered with Epoint, real signatures from real callbacks.
- 7.6–7.10 Receipt email, billing page UI, refunds, admin dashboard, legal pages.
- 8.x PRO features and 9.x pricing/conversion.

The four pieces above leave the codebase in a state where every existing user is grandfathered to PRO, every entitlement check returns `True` for them, and the next chat can wire up `/api/billing/checkout` against `epoint.create_payment(...)` once the stub is filled in.

---

## Piece 1 — `app/core/epoint.py` (Epoint client helper, signature-first)

### Approach

A single module that owns the Epoint signing convention so no router ever touches base64/sha1 directly. HTTP methods are stubbed (raise `NotImplementedError("Epoint keys not yet configured")`) so we can land the module + tests now and fill in the real `requests.post(...)` calls in the next chat without changing the public API.

**Public surface (matches ROADMAP.md §7.1a):**

```python
def build_signed_payload(payload: dict) -> tuple[str, str]
def verify_signature(data: str, signature: str) -> bool
def decode_callback(data: str) -> dict
def create_payment(amount: Decimal, order_id: str, description: str, language: str = "en") -> dict  # stub
def get_status(transaction: str) -> dict  # stub
def reverse(transaction: str, amount: Decimal | None = None) -> dict  # stub
```

**Implementation notes:**
- `build_signed_payload`: `data = base64(json.dumps(payload, separators=(",", ":")))`, `sig = base64(sha1((priv + data + priv).encode()).digest())`. Use compact JSON separators so the signed string is deterministic; the docs' worked example will tell us whether to insert spaces or not — see open question Q1.
- `verify_signature` uses `hmac.compare_digest` (constant-time).
- All three signing/verifying functions read `EPOINT_PRIVATE_KEY` from `settings` at call time (not import time) so unit tests can monkeypatch it.
- The stub methods don't import `requests`; they just `raise NotImplementedError`. Keeps the foundation chat from adding a new dependency until it's actually needed.

### Config additions (`app/core/config.py`)

```python
EPOINT_PUBLIC_KEY: str = ""
EPOINT_PRIVATE_KEY: str = ""
EPOINT_BASE_URL: str = "https://epoint.az/api/1"
EPOINT_RESULT_URL: str = "https://skillfade.website/api/webhooks/epoint"
EPOINT_SUCCESS_URL: str = "https://skillfade.website/billing/success"
EPOINT_ERROR_URL: str = "https://skillfade.website/billing/error"
EPOINT_LIFETIME_PRICE_AZN: str = "49.00"
EPOINT_EARLY_BIRD_PRICE_AZN: str = "35.00"
```

All default to empty/placeholder strings — the foundation runs without them; only checkout (next chat) cares.

### Files changed

| Action | Path |
|---|---|
| Create | `backend/app/core/epoint.py` |
| Modify | `backend/app/core/config.py` (add 8 settings above) |
| Modify | `backend/.env.example` (add the same keys with placeholder values) |

### Test strategy

- New file `backend/tests/test_epoint.py`.
- **Pure unit tests, no DB, no network.**
- Tests:
  1. `test_build_signed_payload_roundtrip` — encode and decode the same payload, get equal dict back.
  2. `test_verify_signature_success` — build a payload, sign it, verify returns True.
  3. `test_verify_signature_tamper` — flip one char in `data`, verify returns False.
  4. `test_verify_signature_constant_time` — pass mismatched-length signatures (sanity, not real timing test).
  5. `test_decode_callback_invalid_base64` — bad base64 raises a clear error (we'll catch + return None in webhook handler later).
  6. **`test_build_signed_payload_known_vector`** — uses the worked example from the Epoint docs (`{"public_key":"i000000001","amount":"30.75",...}`). **This is the critical fixture from the brief.** See Q1.
  7. `test_stub_methods_raise` — calling `create_payment`/`get_status`/`reverse` raises `NotImplementedError` with a clear message.
- Run: `docker-compose exec backend pytest tests/test_epoint.py -v`.

---

## Piece 2 — `Subscription` model + migration `0009`

### Approach

One new SQLAlchemy model + one Alembic migration. Schema follows ROADMAP.md §7.2 exactly. Migration `0009` (next after `008-activity_logs`), filename `20260515_0009-subscriptions.py`.

### Model fields

`backend/app/models/subscription.py`:

```python
id                    UUID PK
user_id               UUID FK users(id) ON DELETE CASCADE, NOT NULL
plan                  String(20) NOT NULL          # 'free', 'lifetime', 'grandfathered'
status                String(20) NOT NULL          # 'pending', 'active', 'refunded', 'revoked', 'failed'
provider              String(20) default 'epoint'  # 'epoint', 'manual'
order_id              String(64) unique nullable   # nullable because grandfathered rows have no order
epoint_transaction    String(64) nullable
epoint_bank_transaction String(64) nullable
epoint_rrn            String(32) nullable
epoint_code           String(8) nullable
card_mask             String(20) nullable
card_name             String(100) nullable
purchased_at          DateTime nullable
refunded_at           DateTime nullable
amount                Numeric(10, 2) nullable
currency              String(3) default 'AZN'
raw_callback          JSONB default {} nullable
notes                 Text nullable
created_at            DateTime default now()
updated_at            DateTime default now() onupdate now()

# Relationships
user = relationship("User", back_populates="subscriptions")
```

User model also gets `subscriptions = relationship(..., cascade="all, delete-orphan")` added.

### Pydantic schemas (`backend/app/schemas/subscription.py`)

- `SubscriptionResponse` — full row, returned by admin endpoints later.
- `SubscriptionSummary` — `{plan, status, purchased_at, refunded_at, amount, currency}`. Returned by `/api/billing/me` (added in next chat) and by the entitlement endpoint.

No Create/Update schemas yet — those are written by `payment_processor.py` directly in the next chat.

### Migration `0009`

`backend/alembic/versions/20260515_0009-subscriptions.py`:

```python
revision = '009'
down_revision = '008'
```

- `op.create_table('subscriptions', ...)` matching the columns above.
- Indexes: `ix_subscriptions_user_id`, `ix_subscriptions_status`, `ix_subscriptions_order_id` (unique).
- `raw_callback` uses `postgresql.JSONB()` (consistent with `activity_logs` migration `008`).
- `downgrade()` drops indexes then table.

### Files changed

| Action | Path |
|---|---|
| Create | `backend/app/models/subscription.py` |
| Modify | `backend/app/models/__init__.py` (export `Subscription`) |
| Modify | `backend/app/models/user.py` (add `subscriptions` relationship) |
| Create | `backend/app/schemas/subscription.py` |
| Create | `backend/alembic/versions/20260515_0009-subscriptions.py` |

### Test strategy

- No new tests; migration is structural. Verified by:
  - `docker-compose exec backend alembic upgrade head` runs cleanly.
  - `docker-compose exec backend alembic downgrade -1 && alembic upgrade head` round-trips cleanly (validates `downgrade()`).
  - `docker-compose exec backend python -c "from app.models import Subscription; print(Subscription.__table__.columns.keys())"` lists every column.

---

## Piece 3 — Entitlement system (backend + frontend)

### Backend approach

A new `app/services/entitlements.py` is the single source of truth for "does this user have PRO?" Every existing router can later import `requires_pro` or call `can_use_feature(user, db, feature_name)` without re-implementing the lookup.

`get_user_plan(user, db)` rules — in order:
1. If user has any `Subscription` row with `status='active'` and `plan` in `('lifetime', 'grandfathered')` → return that subscription's plan (and `is_pro=True`).
2. Otherwise → return `{plan: 'free', is_pro: False, status: None, ...}`. (User has either no subscription row or only `pending`/`failed`/`refunded` rows.)

```python
@dataclass
class PlanInfo:
    plan: Literal['free', 'lifetime', 'grandfathered']
    status: Optional[str]            # 'active' / None
    is_pro: bool
    purchased_at: Optional[datetime]
    refunded_at: Optional[datetime]
    limits: dict                     # {'skills': 3, 'categories': 2, 'templates': 2, 'history_days': 30}
                                     # PRO: all None (= unlimited)

def get_user_plan(user: User, db: Session) -> PlanInfo
def can_use_feature(user: User, db: Session, feature: str) -> bool
def get_limit(user: User, db: Session, limit: str) -> int | None  # None = unlimited
```

`FREE_LIMITS` is a module-level constant dict:

```python
FREE_LIMITS = {
    "skills": 3,
    "categories": 2,
    "templates": 2,
    "history_days": 30,
}
PRO_FEATURES = {
    "freshness_targets", "skill_dependencies", "skill_notes", "period_comparisons",
    "category_aggregations", "personal_records", "year_in_review", "csv_import",
    "calendar_export", "api_keys", "custom_event_types", "bulk_logging",
    "advanced_alerts", "two_factor", "backup_restore", "keyboard_shortcuts_full",
}
```

The dependency:

```python
def require_pro(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    plan = get_user_plan(current_user, db)
    if not plan.is_pro:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={"error": "pro_required", "upgrade_url": "/pricing"},
        )
    return current_user
```

(Used like `current_user: User = Depends(require_pro)` — mirrors `get_current_admin_user`.)

**Note on naming:** the brief calls it `@requires_pro` (decorator-style). FastAPI's idiomatic form is a `Depends(require_pro)` — easier to test, no closure tricks, no order-of-decorators issues. **Going with the dependency form**; if you'd rather have a decorator I'll switch (see Q2).

We also add **one new endpoint** so the frontend has something to read:

`GET /api/billing/me` (auth required) → `SubscriptionSummary` + `PlanInfo` merged:

```json
{
  "plan": "grandfathered",
  "status": "active",
  "is_pro": true,
  "purchased_at": null,
  "refunded_at": null,
  "amount": null,
  "currency": "AZN",
  "limits": {"skills": null, "categories": null, "templates": null, "history_days": null}
}
```

This lives in a new `backend/app/routers/billing.py` (the same router that gets `/checkout`, `/refund-request` in the next chat). Keeps the next chat from having to choose between extending an existing router or creating a new one.

### Frontend approach

Mirror the AuthContext pattern. `PlanContext` fetches `/api/billing/me` once on mount (and on every auth state change) and exposes:

```ts
type Plan = 'free' | 'lifetime' | 'grandfathered';

interface PlanInfo {
  plan: Plan;
  status: 'active' | null;
  isPro: boolean;
  purchasedAt: string | null;
  refundedAt: string | null;
  limits: { skills: number | null; categories: number | null; templates: number | null; historyDays: number | null };
  refresh: () => Promise<void>;
  loading: boolean;
}

const usePlan = (): PlanInfo
const useIsPro = (): boolean  // shortcut
const useFeatureLimit = (limit: 'skills' | 'categories' | 'templates' | 'historyDays'): number | null
```

`ProGate` is the minimal version (the calm-design UpgradePrompt component lives in Phase 9.2, not here):

```tsx
<ProGate>
  <YearInReviewButton />
</ProGate>

// Renders children if isPro; otherwise renders a small inline "PRO feature" placeholder
// with a link to /pricing. No modal, no popup, no FOMO.
```

**Placement of `PlanProvider` in `App.tsx`:** inside `AuthProvider`, outside any page route. PlanContext returns early-stub data (`plan: 'free', isPro: false, loading: true`) while unauthenticated so it never crashes on the public landing page.

### Files changed

Backend:
| Action | Path |
|---|---|
| Create | `backend/app/services/entitlements.py` |
| Create | `backend/app/routers/billing.py` (only `GET /me` for now; `/checkout` + `/refund-request` come in next chat) |
| Modify | `backend/app/main.py` (include `billing.router`) |

Frontend:
| Action | Path |
|---|---|
| Create | `frontend/src/context/PlanContext.tsx` |
| Create | `frontend/src/hooks/usePlan.ts` (re-exports + the `useIsPro` / `useFeatureLimit` shortcuts) |
| Create | `frontend/src/components/ProGate.tsx` |
| Modify | `frontend/src/App.tsx` (wrap routes with `<PlanProvider>`) |
| Modify | `frontend/src/services/api.ts` (add `billing.me()` returning `PlanResponse`) |
| Modify | `frontend/src/types/index.ts` (add `PlanResponse`, `Plan` types) |

### Test strategy

- Backend: `backend/tests/test_entitlements.py` — uses the `db_session` and `client` fixtures from the new `conftest.py` (see Q3 decision).
  - `test_user_with_no_subscriptions_is_free`
  - `test_user_with_active_grandfathered_is_pro`
  - `test_user_with_active_lifetime_is_pro`
  - `test_user_with_only_pending_subscription_is_free`
  - `test_user_with_refunded_lifetime_is_free` (status = 'refunded' is not active)
  - `test_get_limit_returns_3_for_free_skills_and_None_for_pro`
  - `test_require_pro_raises_402_for_free_user`
  - `test_require_pro_passes_for_grandfathered_user`
  - `test_billing_me_endpoint_returns_plan_shape` (via `TestClient`)
- Frontend: no new tests added (matches existing thin frontend test coverage in `frontend/src/tests/`). Verify by `npm run build` succeeds.

---

## Piece 4 — Grandfather migration `0010`

### Approach

One Alembic migration, pure SQL, no Python imports of app models (so it can't break if a model is renamed later). Inserts a `subscriptions` row for every existing user.

```sql
INSERT INTO subscriptions (
    id, user_id, plan, status, provider, currency, notes, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    u.id,
    'grandfathered',
    'active',
    'manual',
    'AZN',
    'Auto-granted: registered before payment launch',
    NOW(),
    NOW()
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.user_id = u.id AND s.status = 'active'
);
```

The `WHERE NOT EXISTS` guard makes the migration **idempotent** — re-running it after a partial failure is safe, and running it in a dev environment where someone has manually added an `active` subscription doesn't double-grandfather them.

### Migration `0010`

`backend/alembic/versions/20260515_0010-grandfather_users.py`:

```python
revision = '010'
down_revision = '009'

def upgrade():
    op.execute(<the INSERT above>)

def downgrade():
    op.execute("""
        DELETE FROM subscriptions
        WHERE plan = 'grandfathered'
        AND provider = 'manual'
        AND notes = 'Auto-granted: registered before payment launch';
    """)
```

`downgrade()` only removes the rows that this migration inserted (matched by the exact notes string + provider + plan). Won't touch grandfathered rows manually inserted by admins.

### Files changed

| Action | Path |
|---|---|
| Create | `backend/alembic/versions/20260515_0010-grandfather_users.py` |

### Test strategy

- No unit test (it's pure SQL operating on the live schema).
- Manual verification:
  - Before migration: `SELECT count(*) FROM subscriptions` = 0.
  - Run `alembic upgrade head`.
  - After: `SELECT count(*) FROM subscriptions` = `SELECT count(*) FROM users`.
  - `SELECT plan, status, count(*) FROM subscriptions GROUP BY 1,2` should show only `(grandfathered, active, N)`.
  - Re-running `alembic upgrade head` is a no-op (idempotency check).
  - `alembic downgrade -1 && alembic upgrade head` round-trips cleanly.

---

## Decisions (Q2–Q7)

These were open when the plan was drafted. The user approved the recommendations, so they are now binding decisions for the implementation chat. Q1 has its own section below with the byte-exact signature fixture.

| # | Decision | Rationale |
|---|---|---|
| Q1 | **Signature fixture is the byte-exact vector extracted from Epoint API EN v1.0.3, pages 6–7.** See "Q1 resolution — Epoint doc signature fixture" section below for the four values + the ready-to-paste `KNOWN_VECTOR` test. | Verified byte-for-byte by recomputing locally and brute-forcing OCR-confusable characters (`l`↔`1`, `0`↔`O`) until the recomputed signature matched the printed doc string. |
| Q2 | **Use `Depends(require_pro)`, not an `@requires_pro` decorator.** Mirrors the existing `get_current_admin_user` dependency. | Decorators wrapping async route functions interact awkwardly with FastAPI's signature inspection; dependency form is the idiomatic, testable choice. |
| Q3 | **Add a `backend/tests/conftest.py`** with an in-memory SQLite session fixture (`Base.metadata.create_all`, `Session`, `client` via `TestClient`). Entitlement tests + every future test touching subscriptions/users use it. | Repo currently has zero DB-using tests. Adding one shared fixture once is cheaper than refactoring `get_user_plan` to take a `list[Subscription]` argument and works for every downstream payment test. |
| Q4 | **`amount` is `Numeric(10, 2)` in the model.** Pydantic schemas type it as `Optional[Decimal]`. Pydantic v2 emits Decimal as a JSON number by default; frontend parses with `parseFloat` if needed. | Avoid float-rounding bugs on money. |
| Q5 | **Use HTTP `402 Payment Required`** for entitlement failures, not 403. The detail body is `{"error": "pro_required", "upgrade_url": "/pricing"}`. | Semantically correct code. Modern frontends handle 402 identically to 403 in their interceptors. |
| Q6 | **Prices live in env vars** (`EPOINT_LIFETIME_PRICE_AZN=49.00`, `EPOINT_EARLY_BIRD_PRICE_AZN=35.00`) loaded via `app/core/config.py`. | Lets us flip the early-bird promo off after 100 sales without a code change. |
| Q7 | **`PlanContext` skips `GET /api/billing/me` when `useAuth().isAuthenticated === false`.** For guests it synchronously returns `{plan: 'free', isPro: false, loading: false}`. | Prevents 401 noise on every public-page load. Keeps GA-tracked marketing pages clean of unneeded API calls. |

### Additional details these decisions imply

**Q3 — conftest shape.** Create `backend/tests/conftest.py` with:

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import app
from fastapi.testclient import TestClient

@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)

@pytest.fixture()
def client(db_session):
    def override():
        yield db_session
    app.dependency_overrides[get_db] = override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

**Watch-out for SQLite + JSONB:** SQLite doesn't have a `JSONB` type. Two options:
- (Preferred) In the `Subscription` model use `JSON` (works on both PG and SQLite via SQLAlchemy's generic type), and have the Alembic migration declare `postgresql.JSONB()` for production. SQLAlchemy will map `JSON()` to SQLite `TEXT`, so model-level reads/writes still work in tests.
- (Fallback) If that proves too magic, override the column type in test setup with `sa.JSON()`.

Going with the first option. The model uses `Column(JSON)` (generic). The migration writes `postgresql.JSONB()`. Tests get TEXT-backed JSON storage that round-trips through Python dicts.

**Q7 — frontend skip wiring.** `PlanContext` reads `useAuth()` inside its provider. Effect runs only when `isAuthenticated && !isAdminContextStillLoading`. On logout it resets to `{plan: 'free', isPro: false}`.

---

## Q1 resolution — Epoint doc signature fixture

Extracted from **Epoint API EN v1.0.3**, pages 6–7 ("Formation of data and signature"). All four values below were verified by computing the signature locally and confirming byte-for-byte match against the doc's printed string. The OCR-ambiguous characters (`l` vs `1`, `0` vs `O`) were resolved by brute-forcing all confusable permutations until the recomputed signature matched the documented one.

| Field | Value |
|---|---|
| `json_string` | `{"public_key":"i000000001","amount":"30.75","currency":"AZN","description":"test payment","order_id":"1"}` |
| `private_key` | `d3hjsl38sd8kdfhbcea0be04eafde9e8e2bad2fb092d` |
| `data` (= `base64(json_string)`) | `eyJwdWJsaWNfa2V5IjoiaTAwMDAwMDAwMSIsImFtb3VudCI6IjMwLjc1IiwiY3VycmVuY3kiOiJBWk4iLCJkZXNjcmlwdGlvbiI6InRlc3QgcGF5bWVudCIsIm9yZGVyX2lkIjoiMSJ9` |
| `signature` (= `base64(sha1(priv + data + priv))`) | `a76GNudqblZtV8qF199hctA+cG0=` |

**Implementation contract this locks in:**

1. **JSON is compact** — no spaces after `:` or `,`. Python: `json.dumps(payload, separators=(",", ":"))`.
2. **Key order is preserved exactly as inserted** — the doc's example uses `public_key, amount, currency, description, order_id` (not alphabetical). Python dicts preserve insertion order since 3.7, so building the payload as a literal dict in code is enough.
3. **`amount` is a string in JSON**, not a number — `"30.75"` not `30.75`. The Pydantic schema for the checkout payload (next chat) must serialize Decimal → string.
4. **No trailing whitespace, no BOM, no Unicode escapes** — UTF-8 ASCII only.
5. **sha1 is computed on the *raw bytes* of the concatenated UTF-8 string**, then base64 of the 20-byte binary digest. PHP's `sha1($s, 1)` (raw output) maps to Python's `hashlib.sha1(s.encode()).digest()`.

**Test fixture (drop into `backend/tests/test_epoint.py`):**

```python
KNOWN_VECTOR = {
    "private_key": "d3hjsl38sd8kdfhbcea0be04eafde9e8e2bad2fb092d",
    "payload": {
        "public_key":   "i000000001",
        "amount":       "30.75",
        "currency":     "AZN",
        "description":  "test payment",
        "order_id":     "1",
    },
    "expected_data":      "eyJwdWJsaWNfa2V5IjoiaTAwMDAwMDAwMSIsImFtb3VudCI6IjMwLjc1IiwiY3VycmVuY3kiOiJBWk4iLCJkZXNjcmlwdGlvbiI6InRlc3QgcGF5bWVudCIsIm9yZGVyX2lkIjoiMSJ9",
    "expected_signature": "a76GNudqblZtV8qF199hctA+cG0=",
}

def test_build_signed_payload_matches_epoint_doc_vector(monkeypatch):
    monkeypatch.setattr("app.core.config.settings.EPOINT_PRIVATE_KEY", KNOWN_VECTOR["private_key"])
    data, signature = build_signed_payload(KNOWN_VECTOR["payload"])
    assert data      == KNOWN_VECTOR["expected_data"]
    assert signature == KNOWN_VECTOR["expected_signature"]
```

This test will be the canary if any future refactor breaks the signing convention.

---

## Execution sequence

1. **Piece 1 — `epoint.py` + config + env.example + tests.** Run `pytest tests/test_epoint.py -v`. Expect ~7 tests passing.
2. **Piece 2 — `Subscription` model + migration `0009`.** Run `docker-compose exec backend alembic upgrade head`. Verify table exists. Run full `pytest` to make sure existing tests still pass (model registration doesn't break anything).
3. **Piece 3 — entitlements service + billing router + frontend Plan context/hooks/ProGate.** Run new entitlement tests. Run `npm run build` in `frontend/` to confirm TypeScript compiles. Hit `GET /api/billing/me` with curl + a JWT — confirm response shape.
4. **Piece 4 — grandfather migration `0010`.** Run `alembic upgrade head`. Spot-check with `psql` (or the SQLAlchemy shell): every existing user has one `subscriptions` row, `plan='grandfathered'`, `status='active'`. Hit `GET /api/billing/me` again as an existing user — should now return `is_pro: true`.
5. **Full validation pass:**
   - `docker-compose exec backend pytest` → all green.
   - `docker-compose exec backend alembic downgrade -2 && alembic upgrade head` → migrations round-trip.
   - `cd frontend && npm run build` → green.
   - Manual: log into the app as an existing user, confirm nothing visibly broke. `ProGate` isn't wired into any feature yet, so there should be zero UI changes for grandfathered users at this stage.

## Acceptance criteria

- ✅ `app/core/epoint.py` exists with full signature surface + stubs.
- ✅ `tests/test_epoint.py` all passing (one test may be `skip` pending Q1).
- ✅ `subscriptions` table exists with all 18 columns from §7.2.
- ✅ Hitting `GET /api/billing/me` as any pre-existing user returns `{plan: "grandfathered", is_pro: true, ...}`.
- ✅ Hitting `GET /api/billing/me` as a newly-registered user returns `{plan: "free", is_pro: false, limits: {skills: 3, ...}}`.
- ✅ A route guarded with `Depends(require_pro)` returns 402 for free users, 200 for grandfathered users.
- ✅ Frontend builds without TypeScript errors.
- ✅ `usePlan()` returns correct values in a logged-in browser session.
- ✅ Existing test suite (`pytest`) and existing frontend tests still pass.

---

## Notes for the implementation chat

- The new Epoint merchant account is being opened; final `EPOINT_PUBLIC_KEY` / `EPOINT_PRIVATE_KEY` are not available during this chat. Foundation work runs on stubs + placeholder env values; the doc fixture is enough to validate the signing convention.
- The keys the user shared in conversation while drafting this plan (`i000201418` / `wUaAcnSSUPUTFIijALgKYGKy`) are from an *old* account being replaced — **do not bake them into `.env`, `.env.example`, code, tests, or any committed file**. The implementation chat does not need any key value to ship the four pieces.
- Update `PROJECT_CONTEXT.md` when each piece lands (file structure changes, new models/endpoints). Do *not* update `ROADMAP.md` — that's the source-of-truth spec.
- Open a feature branch per the project workflow (`git checkout -b feature/payment-foundation`).
