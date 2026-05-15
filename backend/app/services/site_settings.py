"""Site-wide admin-editable settings, persisted in `app_settings`.

Reads fall back to env-var defaults (via `settings`) when no DB row exists.
"""
from decimal import Decimal, InvalidOperation
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.app_setting import AppSetting


# Recognized keys (kept narrow on purpose — add to this list when new ones land)
KEY_LIFETIME_PRICE_AZN = "lifetime_price_azn"
KEY_EARLY_BIRD_PRICE_AZN = "early_bird_price_azn"

ENV_FALLBACKS = {
    KEY_LIFETIME_PRICE_AZN: lambda: settings.EPOINT_LIFETIME_PRICE_AZN,
    KEY_EARLY_BIRD_PRICE_AZN: lambda: settings.EPOINT_EARLY_BIRD_PRICE_AZN,
}


def get_setting(db: Session, key: str) -> Optional[str]:
    """Return the DB-stored value for `key`, or None if not set."""
    row = db.query(AppSetting).filter(AppSetting.key == key).first()
    return row.value if row else None


def get_effective_value(db: Session, key: str) -> str:
    """Return DB value if present, otherwise the env-var fallback."""
    db_value = get_setting(db, key)
    if db_value is not None:
        return db_value
    fallback = ENV_FALLBACKS.get(key)
    if fallback is None:
        raise KeyError(f"Unknown setting key: {key}")
    return fallback()


def set_setting(db: Session, key: str, value: str, actor_id: Optional[UUID] = None) -> AppSetting:
    """Upsert a setting. Caller is responsible for `db.commit()`."""
    row = db.query(AppSetting).filter(AppSetting.key == key).first()
    if row is None:
        row = AppSetting(key=key, value=value, updated_by_user_id=actor_id)
        db.add(row)
    else:
        row.value = value
        row.updated_by_user_id = actor_id
    return row


def parse_price(raw: str) -> Decimal:
    """Validate a price string as a non-negative AZN amount with at most 2 decimals.

    Raises ValueError with a human-readable message on bad input.
    """
    try:
        value = Decimal(raw)
    except (InvalidOperation, TypeError) as exc:
        raise ValueError("Price must be a number (e.g. '49.00')") from exc
    if value < 0:
        raise ValueError("Price cannot be negative")
    if value.as_tuple().exponent < -2:
        raise ValueError("Price has at most 2 decimal places")
    return value
