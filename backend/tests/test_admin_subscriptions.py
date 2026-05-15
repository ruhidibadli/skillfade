"""Tests for the read-only /api/admin/subscriptions purchaser list."""
from datetime import datetime, timezone
from decimal import Decimal

from app.core.security import create_access_token, get_password_hash
from app.models.subscription import Subscription
from app.models.user import User


def _make_admin(db):
    user = User(email="admin@example.com", password_hash=get_password_hash("p"), is_admin=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _make_user(db, email):
    user = User(email=email, password_hash=get_password_hash("p"))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _auth_header(email):
    token = create_access_token({"sub": email})
    return {"Authorization": f"Bearer {token}"}


def test_empty_list(client, db_session):
    admin = _make_admin(db_session)
    response = client.get("/api/admin/subscriptions", headers=_auth_header(admin.email))
    assert response.status_code == 200
    body = response.json()
    assert body["items"] == []
    assert body["total"] == 0


def test_list_includes_user_email(client, db_session):
    admin = _make_admin(db_session)
    buyer = _make_user(db_session, "buyer@example.com")
    db_session.add(Subscription(
        user_id=buyer.id, plan="lifetime", status="active", provider="epoint",
        amount=Decimal("49.00"), currency="AZN",
        purchased_at=datetime.now(timezone.utc),
        order_id="sf_lt_abc12345",
    ))
    db_session.commit()
    response = client.get("/api/admin/subscriptions", headers=_auth_header(admin.email))
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 1
    item = items[0]
    assert item["user_email"] == "buyer@example.com"
    assert item["plan"] == "lifetime"
    assert item["status"] == "active"
    assert item["amount"] == "49.00"
    assert item["currency"] == "AZN"
    assert item["order_id"] == "sf_lt_abc12345"


def test_filter_by_status(client, db_session):
    admin = _make_admin(db_session)
    buyer = _make_user(db_session, "buyer@example.com")
    db_session.add(Subscription(user_id=buyer.id, plan="lifetime", status="active", provider="epoint"))
    db_session.add(Subscription(user_id=buyer.id, plan="lifetime", status="pending", provider="epoint"))
    db_session.commit()
    response = client.get("/api/admin/subscriptions?status=pending", headers=_auth_header(admin.email))
    items = response.json()["items"]
    assert len(items) == 1
    assert items[0]["status"] == "pending"


def test_filter_by_plan(client, db_session):
    admin = _make_admin(db_session)
    buyer = _make_user(db_session, "buyer@example.com")
    db_session.add(Subscription(user_id=buyer.id, plan="lifetime", status="active", provider="epoint"))
    db_session.add(Subscription(user_id=buyer.id, plan="grandfathered", status="active", provider="manual"))
    db_session.commit()
    response = client.get("/api/admin/subscriptions?plan=grandfathered", headers=_auth_header(admin.email))
    items = response.json()["items"]
    assert len(items) == 1
    assert items[0]["plan"] == "grandfathered"


def test_pagination(client, db_session):
    admin = _make_admin(db_session)
    buyer = _make_user(db_session, "buyer@example.com")
    for i in range(25):
        db_session.add(Subscription(
            user_id=buyer.id, plan="lifetime", status="active", provider="epoint",
            order_id=f"sf_lt_{i:05d}",
        ))
    db_session.commit()
    page1 = client.get("/api/admin/subscriptions?page=1&page_size=10", headers=_auth_header(admin.email)).json()
    page3 = client.get("/api/admin/subscriptions?page=3&page_size=10", headers=_auth_header(admin.email)).json()
    assert page1["total"] == 25
    assert page1["total_pages"] == 3
    assert len(page1["items"]) == 10
    assert len(page3["items"]) == 5


def test_non_admin_rejected(client, db_session):
    user = _make_user(db_session, "user@example.com")
    response = client.get("/api/admin/subscriptions", headers=_auth_header(user.email))
    assert response.status_code == 403
