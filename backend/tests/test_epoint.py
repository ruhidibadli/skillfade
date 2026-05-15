"""Unit tests for the Epoint signing module.

No DB, no network — pure cryptography over the documented Epoint scheme.
"""
import pytest

from app.core import epoint
from app.core.epoint import (
    build_signed_payload,
    create_payment,
    decode_callback,
    get_status,
    reverse,
    verify_signature,
)


# Byte-exact fixture from Epoint API EN v1.0.3, pages 6-7.
# Verified by recomputing locally — any drift in this test means the signing
# convention has been broken.
KNOWN_VECTOR = {
    "private_key": "d3hjsl38sd8kdfhbcea0be04eafde9e8e2bad2fb092d",
    "payload": {
        "public_key":  "i000000001",
        "amount":      "30.75",
        "currency":    "AZN",
        "description": "test payment",
        "order_id":    "1",
    },
    "expected_data":      "eyJwdWJsaWNfa2V5IjoiaTAwMDAwMDAwMSIsImFtb3VudCI6IjMwLjc1IiwiY3VycmVuY3kiOiJBWk4iLCJkZXNjcmlwdGlvbiI6InRlc3QgcGF5bWVudCIsIm9yZGVyX2lkIjoiMSJ9",
    "expected_signature": "a76GNudqblZtV8qF199hctA+cG0=",
}


@pytest.fixture
def fixture_key(monkeypatch):
    """Set the doc-fixture private key on settings for the duration of the test."""
    monkeypatch.setattr(
        "app.core.config.settings.EPOINT_PRIVATE_KEY",
        KNOWN_VECTOR["private_key"],
    )


def test_build_signed_payload_matches_epoint_doc_vector(fixture_key):
    """The canary test: a byte-exact match against the Epoint doc's worked example."""
    data, signature = build_signed_payload(KNOWN_VECTOR["payload"])
    assert data == KNOWN_VECTOR["expected_data"]
    assert signature == KNOWN_VECTOR["expected_signature"]


def test_build_signed_payload_roundtrip(fixture_key):
    payload = {"public_key": "k", "amount": "1.00", "order_id": "abc"}
    data, _ = build_signed_payload(payload)
    assert decode_callback(data) == payload


def test_verify_signature_success(fixture_key):
    data, signature = build_signed_payload(KNOWN_VECTOR["payload"])
    assert verify_signature(data, signature) is True


def test_verify_signature_tamper(fixture_key):
    data, signature = build_signed_payload(KNOWN_VECTOR["payload"])
    tampered = ("A" if data[0] != "A" else "B") + data[1:]
    assert verify_signature(tampered, signature) is False


def test_verify_signature_mismatched_length(fixture_key):
    data, _ = build_signed_payload(KNOWN_VECTOR["payload"])
    assert verify_signature(data, "shorter") is False
    assert verify_signature(data, "z" * 200) is False


def test_decode_callback_invalid_base64(fixture_key):
    with pytest.raises(ValueError, match="Invalid base64"):
        decode_callback("not!valid!base64!!!")


def test_decode_callback_valid_base64_invalid_json(fixture_key):
    import base64 as _b64
    not_json = _b64.b64encode(b"not json at all").decode("ascii")
    with pytest.raises(ValueError, match="Invalid JSON"):
        decode_callback(not_json)


def test_stub_methods_raise():
    from decimal import Decimal
    with pytest.raises(NotImplementedError, match="Epoint keys not yet configured"):
        create_payment(Decimal("49.00"), "ord-1", "Lifetime PRO")
    with pytest.raises(NotImplementedError, match="Epoint keys not yet configured"):
        get_status("txn-1")
    with pytest.raises(NotImplementedError, match="Epoint keys not yet configured"):
        reverse("txn-1")
