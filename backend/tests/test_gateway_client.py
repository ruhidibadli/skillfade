"""Tests for the gateway client that talks to the automakler hub."""
import base64
import hashlib
from decimal import Decimal

from app.core import gateway
from app.core.config import settings


def _sign(secret: str, data: str) -> str:
    return base64.b64encode(
        hashlib.sha1((secret + data + secret).encode("utf-8")).digest()
    ).decode("ascii")


def _signed(payload: dict, secret: str):
    import json
    data = base64.b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode()
    return data, _sign(secret, data)


class TestWebhookVerification:
    def test_accepts_valid_signature(self, monkeypatch):
        monkeypatch.setattr(settings, "GATEWAY_WEBHOOK_SECRET", "whsec")
        data, sig = _signed({"order_id": "skillfade_1", "status": "success"}, "whsec")
        assert gateway.verify_webhook_signature(data, sig) is True

    def test_rejects_tampered_signature(self, monkeypatch):
        monkeypatch.setattr(settings, "GATEWAY_WEBHOOK_SECRET", "whsec")
        data, _ = _signed({"order_id": "skillfade_1"}, "whsec")
        assert gateway.verify_webhook_signature(data, "forged") is False

    def test_rejects_wrong_secret(self, monkeypatch):
        monkeypatch.setattr(settings, "GATEWAY_WEBHOOK_SECRET", "the-real-secret")
        data, sig = _signed({"order_id": "skillfade_1"}, "a-different-secret")
        assert gateway.verify_webhook_signature(data, sig) is False

    def test_decode_returns_payload(self, monkeypatch):
        monkeypatch.setattr(settings, "GATEWAY_WEBHOOK_SECRET", "whsec")
        data, _ = _signed({"order_id": "skillfade_1", "status": "success"}, "whsec")
        assert gateway.decode(data) == {"order_id": "skillfade_1", "status": "success"}


class TestCreateCheckout:
    def test_posts_to_hub_with_auth_and_returns_redirect(self, monkeypatch):
        monkeypatch.setattr(settings, "GATEWAY_URL", "https://hub.test")
        monkeypatch.setattr(settings, "GATEWAY_API_KEY", "key123")
        captured = {}

        class FakeResp:
            def raise_for_status(self):
                pass

            def json(self):
                return {"redirect_url": "https://epoint.az/pay/abc", "order_id": "skillfade_x"}

        def fake_post(url, **kwargs):
            captured["url"] = url
            captured["kwargs"] = kwargs
            return FakeResp()

        monkeypatch.setattr(gateway.httpx, "post", fake_post)

        out = gateway.create_checkout(
            amount=Decimal("49.00"), client_reference="user-1",
            description="SkillFade Lifetime PRO",
            success_url="https://skillfade.website/billing/success",
            error_url="https://skillfade.website/billing/error",
        )

        assert out == {"redirect_url": "https://epoint.az/pay/abc", "order_id": "skillfade_x"}
        assert captured["url"] == "https://hub.test/gateway/checkout"
        assert captured["kwargs"]["headers"]["Authorization"] == "Bearer key123"
        body = captured["kwargs"]["json"]
        assert body["amount"] == 49.0
        assert body["currency"] == "AZN"
        assert body["client_reference"] == "user-1"
        assert body["success_redirect_url"] == "https://skillfade.website/billing/success"


class TestGetStatus:
    def test_queries_hub_status(self, monkeypatch):
        monkeypatch.setattr(settings, "GATEWAY_URL", "https://hub.test")
        monkeypatch.setattr(settings, "GATEWAY_API_KEY", "key123")
        captured = {}

        class FakeResp:
            def raise_for_status(self):
                pass

            def json(self):
                return {"order_id": "skillfade_x", "status": "success"}

        def fake_get(url, **kwargs):
            captured["url"] = url
            captured["kwargs"] = kwargs
            return FakeResp()

        monkeypatch.setattr(gateway.httpx, "get", fake_get)

        out = gateway.get_status("skillfade_x")
        assert out["status"] == "success"
        assert captured["url"] == "https://hub.test/gateway/status"
        assert captured["kwargs"]["params"] == {"order_id": "skillfade_x"}
        assert captured["kwargs"]["headers"]["Authorization"] == "Bearer key123"
