"""Epoint.az client helper.

Owns the Epoint signing convention so no router ever touches base64/sha1 directly.
HTTP methods are stubs; they will be filled in when merchant credentials arrive.
"""
import base64
import hashlib
import hmac
import json
from decimal import Decimal
from typing import Tuple

from app.core.config import settings


def _private_key() -> str:
    """Read the private key at call time (not import time) so tests can monkeypatch."""
    return settings.EPOINT_PRIVATE_KEY


def build_signed_payload(payload: dict) -> Tuple[str, str]:
    """Encode a payload to (data, signature) using the Epoint scheme.

    data      = base64(compact-json(payload))
    signature = base64(sha1(private_key + data + private_key))

    Compact JSON (no spaces) and insertion-order preservation are required —
    see Epoint API EN v1.0.3, pages 6-7.
    """
    private_key = _private_key()
    json_string = json.dumps(payload, separators=(",", ":"))
    data = base64.b64encode(json_string.encode("utf-8")).decode("ascii")
    sha1_digest = hashlib.sha1(
        (private_key + data + private_key).encode("utf-8")
    ).digest()
    signature = base64.b64encode(sha1_digest).decode("ascii")
    return data, signature


def verify_signature(data: str, signature: str) -> bool:
    """Constant-time check that signature matches sha1(private_key + data + private_key)."""
    private_key = _private_key()
    expected_digest = hashlib.sha1(
        (private_key + data + private_key).encode("utf-8")
    ).digest()
    expected_signature = base64.b64encode(expected_digest).decode("ascii")
    return hmac.compare_digest(expected_signature, signature)


def decode_callback(data: str) -> dict:
    """Decode a base64+JSON callback payload back to a dict.

    Raises ValueError if the payload is not valid base64 or valid JSON.
    """
    try:
        raw = base64.b64decode(data, validate=True)
    except (ValueError, base64.binascii.Error) as exc:
        raise ValueError(f"Invalid base64 in callback data: {exc}") from exc
    try:
        return json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"Invalid JSON in callback data: {exc}") from exc


# --- HTTP methods (stubbed until Epoint merchant credentials arrive) ---

def create_payment(
    amount: Decimal,
    order_id: str,
    description: str,
    language: str = "en",
) -> dict:
    raise NotImplementedError("Epoint keys not yet configured")


def get_status(transaction: str) -> dict:
    raise NotImplementedError("Epoint keys not yet configured")


def reverse(transaction: str, amount: Decimal | None = None) -> dict:
    raise NotImplementedError("Epoint keys not yet configured")
