import pytest
from datetime import date, timedelta
from app.services.freshness import (
    calculate_freshness,
    get_freshness_indicator,
    check_practice_scarcity,
    calculate_balance_ratio,
    get_balance_interpretation
)


def test_calculate_freshness_no_events():
    """Test freshness calculation with no events."""
    created_at = date.today() - timedelta(days=10)
    freshness = calculate_freshness(
        skill_created_at=created_at,
        learning_events=[],
        practice_events=[]
    )
    # 10 days decay at 2% per day: 100 * (0.98^10) = ~81.7%
    assert 80 < freshness < 83


def test_calculate_freshness_with_practice():
    """Test freshness calculation with practice events."""
    created_at = date.today() - timedelta(days=30)
    practice_events = [(date.today() - timedelta(days=5), 'exercise')]

    freshness = calculate_freshness(
        skill_created_at=created_at,
        learning_events=[],
        practice_events=practice_events
    )
    # 5 days decay from last practice: 100 * (0.98^5) = ~90.4%
    assert 89 < freshness < 92


def test_calculate_freshness_with_learning_boost():
    """Test freshness calculation with recent learning events."""
    created_at = date.today() - timedelta(days=30)
    practice_events = [(date.today() - timedelta(days=10), 'exercise')]
    learning_events = [
        (date.today() - timedelta(days=2), 'reading'),
        (date.today() - timedelta(days=5), 'video')
    ]

    freshness = calculate_freshness(
        skill_created_at=created_at,
        learning_events=learning_events,
        practice_events=practice_events
    )
    # Should have learning boost applied
    assert freshness > 80


def test_get_freshness_indicator():
    """Test freshness indicator symbols."""
    assert get_freshness_indicator(80) == "🟢"
    assert get_freshness_indicator(50) == "🟡"
    assert get_freshness_indicator(30) == "🔴"


def test_check_practice_scarcity():
    """Test practice scarcity detection."""
    warnings = check_practice_scarcity(
        learning_count=5,
        practice_count=0,
        days_since_practice=0,
        skill_age_days=35
    )
    assert "Not yet practiced" in warnings


def test_calculate_balance_ratio():
    """Test balance ratio calculation."""
    ratio = calculate_balance_ratio(learning_count=10, practice_count=5)
    assert ratio == 0.5

    ratio = calculate_balance_ratio(learning_count=10, practice_count=1)
    assert ratio == 0.1


def test_get_balance_interpretation():
    """Test balance interpretation."""
    assert "Heavy input" in get_balance_interpretation(0.1)
    assert "Learning-focused" in get_balance_interpretation(0.3)
    assert "Balanced" in get_balance_interpretation(0.7)
    assert "Practice-dominant" in get_balance_interpretation(1.5)
