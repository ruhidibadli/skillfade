"""Tests for the entitlement service + /api/billing/me endpoint."""
from datetime import datetime, timezone

import pytest
from fastapi import HTTPException

from app.core.security import create_access_token, get_password_hash
from app.models.subscription import Subscription
from app.models.user import User
from app.services.entitlements import (
    FREE_LIMITS,
    get_limit,
    get_user_plan,
    require_pro,
)


def _make_user(db, email="user@example.com") -> User:
    user = User(email=email, password_hash=get_password_hash("password123"))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _make_subscription(db, user_id, plan, status, **kwargs) -> Subscription:
    sub = Subscription(
        user_id=user_id,
        plan=plan,
        status=status,
        provider=kwargs.pop("provider", "manual"),
        **kwargs,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def test_user_with_no_subscriptions_is_free(db_session):
    user = _make_user(db_session)
    info = get_user_plan(user, db_session)
    assert info.plan == "free"
    assert info.is_pro is False
    assert info.limits == FREE_LIMITS


def test_user_with_active_grandfathered_is_pro(db_session):
    user = _make_user(db_session)
    _make_subscription(db_session, user.id, plan="grandfathered", status="active")
    info = get_user_plan(user, db_session)
    assert info.plan == "grandfathered"
    assert info.is_pro is True
    assert info.limits == {k: None for k in FREE_LIMITS}


def test_user_with_active_lifetime_is_pro(db_session):
    user = _make_user(db_session)
    _make_subscription(
        db_session, user.id, plan="lifetime", status="active",
        provider="epoint", purchased_at=datetime.now(timezone.utc),
    )
    info = get_user_plan(user, db_session)
    assert info.plan == "lifetime"
    assert info.is_pro is True


def test_user_with_only_pending_subscription_is_free(db_session):
    user = _make_user(db_session)
    _make_subscription(db_session, user.id, plan="lifetime", status="pending", provider="epoint")
    info = get_user_plan(user, db_session)
    assert info.plan == "free"
    assert info.is_pro is False


def test_user_with_refunded_lifetime_is_free(db_session):
    user = _make_user(db_session)
    _make_subscription(
        db_session, user.id, plan="lifetime", status="refunded",
        provider="epoint", refunded_at=datetime.now(timezone.utc),
    )
    info = get_user_plan(user, db_session)
    assert info.plan == "free"
    assert info.is_pro is False


def test_get_limit_returns_3_for_free_skills_and_none_for_pro(db_session):
    free_user = _make_user(db_session, email="free@example.com")
    pro_user = _make_user(db_session, email="pro@example.com")
    _make_subscription(db_session, pro_user.id, plan="grandfathered", status="active")

    assert get_limit(free_user, db_session, "skills") == 3
    assert get_limit(pro_user, db_session, "skills") is None


def test_require_pro_raises_402_for_free_user(db_session):
    user = _make_user(db_session)
    with pytest.raises(HTTPException) as exc:
        require_pro(current_user=user, db=db_session)
    assert exc.value.status_code == 402
    assert exc.value.detail == {"error": "pro_required", "upgrade_url": "/pricing"}


def test_require_pro_passes_for_grandfathered_user(db_session):
    user = _make_user(db_session)
    _make_subscription(db_session, user.id, plan="grandfathered", status="active")
    assert require_pro(current_user=user, db=db_session) is user


def test_billing_me_endpoint_returns_plan_shape(client, db_session):
    user = _make_user(db_session, email="me@example.com")
    _make_subscription(db_session, user.id, plan="grandfathered", status="active")

    token = create_access_token({"sub": user.email})
    response = client.get(
        "/api/billing/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["plan"] == "grandfathered"
    assert body["is_pro"] is True
    assert body["status"] == "active"
    assert body["currency"] == "AZN"
    assert body["limits"] == {"skills": None, "categories": None, "templates": None, "history_days": None}


def test_billing_me_endpoint_returns_free_for_new_user(client, db_session):
    user = _make_user(db_session, email="fresh@example.com")
    token = create_access_token({"sub": user.email})
    response = client.get(
        "/api/billing/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["plan"] == "free"
    assert body["is_pro"] is False
    assert body["limits"] == FREE_LIMITS
