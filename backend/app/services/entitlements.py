"""Single source of truth for 'does this user have PRO?'.

Every router can import `require_pro` (FastAPI dependency) or call
`can_use_feature(user, db, feature)` / `get_limit(user, db, limit)` without
re-implementing the lookup logic.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal, Optional

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.subscription import Subscription
from app.models.user import User
from app.services.auth import get_current_user


Plan = Literal['free', 'lifetime', 'grandfathered']
ACTIVE_PRO_PLANS = ('lifetime', 'grandfathered')

FREE_LIMITS = {
    "skills": 3,
    "categories": 2,
    "templates": 2,
    "history_days": 30,
}

# Features that only PRO users can access. Used by `can_use_feature`.
PRO_FEATURES = {
    "freshness_targets", "skill_dependencies", "skill_notes", "period_comparisons",
    "category_aggregations", "personal_records", "year_in_review", "csv_import",
    "calendar_export", "api_keys", "custom_event_types", "bulk_logging",
    "advanced_alerts", "two_factor", "backup_restore", "keyboard_shortcuts_full",
}


@dataclass
class PlanInfo:
    plan: Plan
    is_pro: bool
    status: Optional[str] = None
    purchased_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    amount: Optional[float] = None
    currency: str = "AZN"
    limits: dict = field(default_factory=dict)


def _pro_limits() -> dict:
    """PRO has no limits — every numeric limit is None (= unlimited)."""
    return {k: None for k in FREE_LIMITS}


def get_user_plan(user: User, db: Session) -> PlanInfo:
    """Return PlanInfo for the user.

    Rules (in order):
      1. If any subscription row has status='active' and plan in PRO plans,
         return that plan as PRO (with unlimited limits).
      2. Otherwise return free + FREE_LIMITS.
    """
    active_pro = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user.id,
            Subscription.status == 'active',
            Subscription.plan.in_(ACTIVE_PRO_PLANS),
        )
        .order_by(Subscription.created_at.desc())
        .first()
    )

    if active_pro is not None:
        return PlanInfo(
            plan=active_pro.plan,
            is_pro=True,
            status='active',
            purchased_at=active_pro.purchased_at,
            refunded_at=active_pro.refunded_at,
            amount=float(active_pro.amount) if active_pro.amount is not None else None,
            currency=active_pro.currency or "AZN",
            limits=_pro_limits(),
        )

    return PlanInfo(
        plan='free',
        is_pro=False,
        status=None,
        limits=dict(FREE_LIMITS),
    )


def can_use_feature(user: User, db: Session, feature: str) -> bool:
    """True if `feature` is available to the user. PRO-only features need is_pro."""
    if feature in PRO_FEATURES:
        return get_user_plan(user, db).is_pro
    return True


def get_limit(user: User, db: Session, limit: str) -> Optional[int]:
    """Numeric limit for the user (None = unlimited)."""
    return get_user_plan(user, db).limits.get(limit)


def require_pro(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """FastAPI dependency: 402 if the user isn't PRO."""
    if not get_user_plan(current_user, db).is_pro:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={"error": "pro_required", "upgrade_url": "/pricing"},
        )
    return current_user
