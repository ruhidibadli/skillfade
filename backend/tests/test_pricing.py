"""Tests for site_settings service + /api/admin/pricing endpoints."""
import pytest

from app.core.security import create_access_token, get_password_hash
from app.models.user import User
from app.services import site_settings as ss


def _make_admin(db):
    user = User(email="admin@example.com", password_hash=get_password_hash("p"), is_admin=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _auth_header(email):
    token = create_access_token({"sub": email})
    return {"Authorization": f"Bearer {token}"}


def test_get_effective_value_falls_back_to_env(db_session):
    # Nothing in DB — should return env default (test container env has the defaults).
    value = ss.get_effective_value(db_session, ss.KEY_LIFETIME_PRICE_AZN)
    # Default in config.py is "49.00"
    assert value == "49.00"


def test_set_and_get_setting(db_session):
    admin = _make_admin(db_session)
    ss.set_setting(db_session, ss.KEY_LIFETIME_PRICE_AZN, "59.00", admin.id)
    db_session.commit()
    assert ss.get_setting(db_session, ss.KEY_LIFETIME_PRICE_AZN) == "59.00"
    assert ss.get_effective_value(db_session, ss.KEY_LIFETIME_PRICE_AZN) == "59.00"


def test_set_setting_upserts(db_session):
    admin = _make_admin(db_session)
    ss.set_setting(db_session, ss.KEY_LIFETIME_PRICE_AZN, "59.00", admin.id)
    db_session.commit()
    ss.set_setting(db_session, ss.KEY_LIFETIME_PRICE_AZN, "29.00", admin.id)
    db_session.commit()
    assert ss.get_setting(db_session, ss.KEY_LIFETIME_PRICE_AZN) == "29.00"


@pytest.mark.parametrize("good", ["0", "0.00", "49", "49.00", "1234567.89"])
def test_parse_price_accepts_valid(good):
    ss.parse_price(good)


@pytest.mark.parametrize("bad", ["", "abc", "-1", "1.234", "1,00"])
def test_parse_price_rejects_invalid(bad):
    with pytest.raises(ValueError):
        ss.parse_price(bad)


def test_pricing_endpoint_returns_env_defaults_initially(client, db_session):
    admin = _make_admin(db_session)
    response = client.get("/api/admin/pricing", headers=_auth_header(admin.email))
    assert response.status_code == 200
    body = response.json()
    assert body["lifetime_price_azn"] == "49.00"
    assert body["early_bird_price_azn"] == "35.00"
    assert body["lifetime_source"] == "env"
    assert body["early_bird_source"] == "env"


def test_pricing_endpoint_updates_lifetime(client, db_session):
    admin = _make_admin(db_session)
    response = client.patch(
        "/api/admin/pricing",
        headers=_auth_header(admin.email),
        json={"lifetime_price_azn": "59.50"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["lifetime_price_azn"] == "59.50"
    assert body["lifetime_source"] == "db"
    # Early-bird untouched, still env
    assert body["early_bird_price_azn"] == "35.00"
    assert body["early_bird_source"] == "env"


def test_pricing_endpoint_rejects_bad_price(client, db_session):
    admin = _make_admin(db_session)
    response = client.patch(
        "/api/admin/pricing",
        headers=_auth_header(admin.email),
        json={"lifetime_price_azn": "abc"},
    )
    assert response.status_code == 400
    assert "lifetime_price_azn" in response.json()["detail"]


def test_pricing_endpoint_rejects_non_admin(client, db_session):
    user = User(email="user@example.com", password_hash=get_password_hash("p"), is_admin=False)
    db_session.add(user)
    db_session.commit()
    response = client.get("/api/admin/pricing", headers=_auth_header(user.email))
    assert response.status_code == 403
