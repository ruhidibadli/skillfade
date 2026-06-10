"""Billing helpers shared by the checkout endpoint, the webhook, and reconcile.

Granting PRO = a Subscription row with plan='lifetime', status='active'. The
entitlement service reads that; nothing else needs wiring.
"""
from datetime import datetime
from decimal import Decimal

from app.models.subscription import Subscription
from app.services import site_settings


def effective_lifetime_price(db) -> Decimal:
    """The current lifetime price (DB override, else env default)."""
    raw = site_settings.get_effective_value(db, site_settings.KEY_LIFETIME_PRICE_AZN)
    return site_settings.parse_price(raw)


def activate_subscription(sub: Subscription, payload: dict) -> Subscription:
    """Flip a pending subscription to active lifetime PRO. Idempotent."""
    if sub.status == "active":
        return sub
    sub.plan = "lifetime"
    sub.status = "active"
    sub.provider = "epoint"
    sub.purchased_at = datetime.utcnow()
    if payload.get("epoint_transaction"):
        sub.epoint_transaction = payload["epoint_transaction"]
    if payload.get("amount") is not None:
        sub.amount = payload["amount"]
    sub.raw_callback = payload
    return sub


def fail_subscription(sub: Subscription) -> Subscription:
    """Mark a still-pending subscription as failed."""
    if sub.status == "pending":
        sub.status = "failed"
    return sub
