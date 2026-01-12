import pytest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token
)


def test_password_hashing():
    """Test password hashing and verification."""
    password = "testpassword123"
    hashed = get_password_hash(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)


def test_access_token_creation_and_decoding():
    """Test JWT token creation and decoding."""
    data = {"sub": "test@example.com"}
    token = create_access_token(data)

    assert token is not None
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "test@example.com"


def test_invalid_token_decoding():
    """Test decoding an invalid token."""
    invalid_token = "invalid.token.here"
    decoded = decode_access_token(invalid_token)
    assert decoded is None
