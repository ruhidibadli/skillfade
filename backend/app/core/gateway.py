"""Client for the shared automakler payment-gateway hub.

The hub (automakler) owns the Epoint credentials and the single Epoint callback.
skillfade calls the hub to start a payment and receives a signed webhook back. We
hold only the gateway API key and the webhook secret — never the Epoint private key.

The webhook signature uses the same ``base64(sha1(secret + data + secret))`` scheme
as Epoint, keyed by our per-project ``GATEWAY_WEBHOOK_SECRET``.
"""
import base64
import hashlib
import hmac
import json
from decimal import Decimal

import httpx

from app.core.config import settings

HTTP_TIMEOUT = 30.0


class GatewayError(Exception):
    """Raised when the gateway hub returns a non-2xx response.

    Carries the hub's status code and body so the caller can log the real reason
    instead of an opaque failure.
    """


def _result(resp, what: str) -> dict:
    """Return the JSON body, or raise GatewayError with the hub's status + body."""
    if resp.is_error:
        raise GatewayError(f"{what} -> HTTP {resp.status_code}: {resp.text[:500]}")
    return resp.json()


def _webhook_secret() -> str:
    """Read at call time so tests can monkeypatch settings."""
    return settings.GATEWAY_WEBHOOK_SECRET


def _auth_headers() -> dict:
    return {"Authorization": f"Bearer {settings.GATEWAY_API_KEY}"}


def _sign(secret: str, data: str) -> str:
    digest = hashlib.sha1((secret + data + secret).encode("utf-8")).digest()
    return base64.b64encode(digest).decode("ascii")


def verify_webhook_signature(data: str, signature: str) -> bool:
    """Constant-time check that an inbound hub webhook is authentic."""
    expected = _sign(_webhook_secret(), data)
    return hmac.compare_digest(expected, signature)


def decode(data: str) -> dict:
    """Decode the base64 JSON ``data`` blob from a hub webhook."""
    raw = base64.b64decode(data, validate=True)
    return json.loads(raw.decode("utf-8"))


def create_checkout(
    *,
    amount: Decimal,
    client_reference: str,
    description: str,
    success_url: str,
    error_url: str,
    language: str = "en",
) -> dict:
    """Ask the hub to start an Epoint payment. Returns ``{redirect_url, order_id}``."""
    resp = httpx.post(
        f"{settings.GATEWAY_URL}/gateway/checkout",
        json={
            "amount": float(amount),
            "currency": "AZN",
            "description": description,
            "success_redirect_url": success_url,
            "error_redirect_url": error_url,
            "language": language,
            "client_reference": client_reference,
        },
        headers=_auth_headers(),
        timeout=HTTP_TIMEOUT,
    )
    return _result(resp, "POST /gateway/checkout")


def get_status(order_id: str) -> dict:
    """Pull the authoritative status of a payment from the hub (reconcile)."""
    resp = httpx.get(
        f"{settings.GATEWAY_URL}/gateway/status",
        params={"order_id": order_id},
        headers=_auth_headers(),
        timeout=HTTP_TIMEOUT,
    )
    return _result(resp, "GET /gateway/status")
