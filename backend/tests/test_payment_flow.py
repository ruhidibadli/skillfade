"""Tests for the checkout, webhook, and reconcile payment flow (gateway client)."""
import base64
import hashlib
import json
from datetime import datetime, timezone

from app.core import gateway
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.models.subscription import Subscription
from app.models.user import User
from app.services.entitlements import get_user_plan

WEBHOOK_SECRET = "whsec-test"


def _make_user(db, email="user@example.com") -> User:
    user = User(email=email, password_hash=get_password_hash("password123"))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _auth(email):
    return {"Authorization": f"Bearer {create_access_token({'sub': email})}"}


def _signed_webhook(payload: dict, secret: str = WEBHOOK_SECRET):
    data = base64.b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode()
    sig = base64.b64encode(
        hashlib.sha1((secret + data + secret).encode("utf-8")).digest()
    ).decode("ascii")
    return {"data": data, "signature": sig}


# ── Checkout ─────────────────────────────────────────────

class TestCheckout:
    def test_free_user_checkout_creates_pending_and_returns_redirect(self, client, db_session, monkeypatch):
        user = _make_user(db_session)
        monkeypatch.setattr(
            gateway, "create_checkout",
            lambda **kw: {"redirect_url": "https://epoint.az/pay/abc", "order_id": "skillfade_abc"},
        )
        resp = client.post("/api/billing/checkout", headers=_auth(user.email))
        assert resp.status_code == 200
        body = resp.json()
        assert body["redirect_url"] == "https://epoint.az/pay/abc"
        assert body["order_id"] == "skillfade_abc"

        sub = db_session.query(Subscription).filter_by(order_id="skillfade_abc").first()
        assert sub is not None
        assert sub.user_id == user.id
        assert sub.plan == "lifetime"
        assert sub.status == "pending"

    def test_already_pro_user_cannot_checkout(self, client, db_session, monkeypatch):
        user = _make_user(db_session)
        db_session.add(Subscription(user_id=user.id, plan="grandfathered", status="active", provider="manual"))
        db_session.commit()
        called = {"n": 0}
        monkeypatch.setattr(gateway, "create_checkout", lambda **kw: called.__setitem__("n", called["n"] + 1) or {})
        resp = client.post("/api/billing/checkout", headers=_auth(user.email))
        assert resp.status_code == 400
        assert called["n"] == 0

    def test_checkout_requires_auth(self, client, db_session):
        resp = client.post("/api/billing/checkout")
        assert resp.status_code in (401, 403)

    def test_gateway_failure_returns_502(self, client, db_session, monkeypatch):
        user = _make_user(db_session)

        def boom(**kw):
            raise RuntimeError("hub unreachable")

        monkeypatch.setattr(gateway, "create_checkout", boom)
        resp = client.post("/api/billing/checkout", headers=_auth(user.email))
        assert resp.status_code == 502


# ── Webhook ──────────────────────────────────────────────

class TestWebhook:
    def _pending(self, db, user, order_id="skillfade_wh"):
        sub = Subscription(user_id=user.id, plan="lifetime", status="pending",
                           provider="epoint", order_id=order_id, currency="AZN")
        db.add(sub)
        db.commit()
        return sub

    def test_success_activates_subscription(self, client, db_session, monkeypatch):
        monkeypatch.setattr(settings, "GATEWAY_WEBHOOK_SECRET", WEBHOOK_SECRET)
        user = _make_user(db_session)
        self._pending(db_session, user)

        body = _signed_webhook({
            "order_id": "skillfade_wh", "status": "success",
            "epoint_transaction": "te777", "amount": 49.0, "currency": "AZN",
        })
        resp = client.post("/api/webhooks/epoint", data=body)
        assert resp.status_code == 200

        sub = db_session.query(Subscription).filter_by(order_id="skillfade_wh").first()
        assert sub.status == "active"
        assert sub.plan == "lifetime"
        assert sub.epoint_transaction == "te777"
        assert sub.purchased_at is not None
        assert get_user_plan(user, db_session).is_pro is True

    def test_duplicate_webhook_is_idempotent(self, client, db_session, monkeypatch):
        monkeypatch.setattr(settings, "GATEWAY_WEBHOOK_SECRET", WEBHOOK_SECRET)
        user = _make_user(db_session)
        self._pending(db_session, user)
        body = _signed_webhook({"order_id": "skillfade_wh", "status": "success", "epoint_transaction": "te1"})

        assert client.post("/api/webhooks/epoint", data=body).status_code == 200
        assert client.post("/api/webhooks/epoint", data=body).status_code == 200
        count = db_session.query(Subscription).filter_by(order_id="skillfade_wh", status="active").count()
        assert count == 1

    def test_invalid_signature_rejected(self, client, db_session, monkeypatch):
        monkeypatch.setattr(settings, "GATEWAY_WEBHOOK_SECRET", WEBHOOK_SECRET)
        user = _make_user(db_session)
        self._pending(db_session, user)
        body = _signed_webhook({"order_id": "skillfade_wh", "status": "success"})
        body["signature"] = "forged"
        resp = client.post("/api/webhooks/epoint", data=body)
        assert resp.status_code == 400
        sub = db_session.query(Subscription).filter_by(order_id="skillfade_wh").first()
        assert sub.status == "pending"

    def test_unknown_order_404(self, client, db_session, monkeypatch):
        monkeypatch.setattr(settings, "GATEWAY_WEBHOOK_SECRET", WEBHOOK_SECRET)
        body = _signed_webhook({"order_id": "skillfade_missing", "status": "success"})
        resp = client.post("/api/webhooks/epoint", data=body)
        assert resp.status_code == 404

    def test_failed_status_marks_failed(self, client, db_session, monkeypatch):
        monkeypatch.setattr(settings, "GATEWAY_WEBHOOK_SECRET", WEBHOOK_SECRET)
        user = _make_user(db_session)
        self._pending(db_session, user)
        body = _signed_webhook({"order_id": "skillfade_wh", "status": "failed"})
        resp = client.post("/api/webhooks/epoint", data=body)
        assert resp.status_code == 200
        sub = db_session.query(Subscription).filter_by(order_id="skillfade_wh").first()
        assert sub.status == "failed"


# ── Reconcile (status poll) ──────────────────────────────

class TestReconcile:
    def _pending(self, db, user, order_id="skillfade_rc"):
        sub = Subscription(user_id=user.id, plan="lifetime", status="pending",
                           provider="epoint", order_id=order_id, currency="AZN")
        db.add(sub)
        db.commit()
        return sub

    def test_pending_reconciles_to_active_via_hub(self, client, db_session, monkeypatch):
        user = _make_user(db_session)
        self._pending(db_session, user)
        monkeypatch.setattr(gateway, "get_status",
                            lambda order_id: {"order_id": order_id, "status": "success", "epoint_transaction": "teRC"})
        resp = client.get("/api/billing/status", params={"order_id": "skillfade_rc"}, headers=_auth(user.email))
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "active"
        assert body["is_pro"] is True
        assert db_session.query(Subscription).filter_by(order_id="skillfade_rc").first().status == "active"

    def test_cannot_read_another_users_order(self, client, db_session, monkeypatch):
        owner = _make_user(db_session, email="owner@example.com")
        other = _make_user(db_session, email="other@example.com")
        self._pending(db_session, owner)
        resp = client.get("/api/billing/status", params={"order_id": "skillfade_rc"}, headers=_auth(other.email))
        assert resp.status_code == 404


class TestPublicPricing:
    def test_pricing_endpoint_is_public_and_returns_price(self, client, db_session):
        resp = client.get("/api/billing/pricing")
        assert resp.status_code == 200
        body = resp.json()
        assert body["currency"] == "AZN"
        assert body["lifetime_price_azn"] == "49.00"
