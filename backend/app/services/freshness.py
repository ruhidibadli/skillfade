from datetime import date, timedelta
from typing import List, Tuple


def calculate_freshness(
    skill_created_at: date,
    learning_events: List[Tuple[date, str]],  # (date, type)
    practice_events: List[Tuple[date, str]],  # (date, type)
    base_decay_rate: float = 0.02,  # 2% per day
    today: date = None
) -> float:
    """
    Calculate current skill freshness percentage.

    Algorithm:
    - Start at 100%
    - Base decay rate: 2% per day (customizable per skill)
    - Learning event: slows decay by 20% for 3 days
    - Practice event: restores 15% freshness, resets decay timer

    Returns: float between 0 and 100
    """
    if today is None:
        today = date.today()

    # Start at 100%
    freshness = 100.0

    # Get last practice date (or creation date if never practiced)
    if practice_events:
        last_practice = max(pe[0] for pe in practice_events)
    else:
        last_practice = skill_created_at

    # Calculate days since last practice
    days_since_practice = (today - last_practice).days

    # Apply base decay
    freshness *= (1 - base_decay_rate) ** days_since_practice

    # Boost from recent learning events (last 30 days)
    recent_learning = [
        le for le in learning_events
        if (today - le[0]).days <= 30
    ]
    learning_boost = min(len(recent_learning) * 2, 15)  # Max 15% boost
    freshness = min(100, freshness + learning_boost)

    # Ensure bounds
    return max(0.0, min(100.0, freshness))


def calculate_freshness_history(
    skill_created_at: date,
    learning_events: List[Tuple[date, str]],
    practice_events: List[Tuple[date, str]],
    base_decay_rate: float = 0.02,
    days: int = 90
) -> List[Tuple[date, float]]:
    """
    Calculate freshness for each day in the specified history period.

    Returns: List of (date, freshness) tuples
    """
    today = date.today()
    start_date = max(skill_created_at, today - timedelta(days=days))

    history = []
    current_date = start_date

    while current_date <= today:
        # Filter events up to current_date
        past_learning = [(d, t) for d, t in learning_events if d <= current_date]
        past_practice = [(d, t) for d, t in practice_events if d <= current_date]

        freshness = calculate_freshness(
            skill_created_at=skill_created_at,
            learning_events=past_learning,
            practice_events=past_practice,
            base_decay_rate=base_decay_rate,
            today=current_date
        )

        history.append((current_date, round(freshness, 2)))
        current_date += timedelta(days=1)

    return history


def get_freshness_indicator(freshness: float) -> str:
    """
    Get visual indicator for freshness level.

    Returns:
    - 🟢 for >70%
    - 🟡 for 40-70%
    - 🔴 for <40%
    """
    if freshness > 70:
        return "🟢"
    elif freshness >= 40:
        return "🟡"
    else:
        return "🔴"


def check_practice_scarcity(
    learning_count: int,
    practice_count: int,
    days_since_practice: int,
    skill_age_days: int
) -> List[str]:
    """
    Detect practice scarcity issues.

    Returns list of warning strings.
    """
    warnings = []

    # Flag skills with learning events but zero practice events (ever)
    if learning_count > 0 and practice_count == 0:
        warnings.append("Not yet practiced")

    # Flag skills with learning events but no practice in last 21 days
    if practice_count > 0 and days_since_practice > 21:
        warnings.append(f"No practice in {days_since_practice} days")

    # Flag skills with >5:1 learning-to-practice ratio
    if practice_count > 0 and learning_count / practice_count > 5:
        warnings.append("Theory-heavy")

    return warnings


def calculate_balance_ratio(
    learning_count: int,
    practice_count: int
) -> float:
    """
    Calculate input/output balance ratio.

    Balance Ratio = Output / Input (0 to 1+)

    Interpretation:
    - <0.2: Heavy input, minimal practice
    - 0.2-0.5: Learning-focused period
    - 0.5-1.0: Balanced
    - >1.0: Practice-dominant (ideal for retention)
    """
    if learning_count == 0:
        return 1.0 if practice_count > 0 else 0.0

    return practice_count / learning_count


def get_balance_interpretation(ratio: float) -> str:
    """Get human-readable interpretation of balance ratio."""
    if ratio < 0.2:
        return "Heavy input, minimal practice"
    elif ratio < 0.5:
        return "Learning-focused period"
    elif ratio <= 1.0:
        return "Balanced"
    else:
        return "Practice-dominant (ideal for retention)"


def calculate_personal_records(
    skill_created_at: date,
    learning_events: List[Tuple[date, str]],
    practice_events: List[Tuple[date, str]],
    base_decay_rate: float = 0.02
) -> dict:
    """
    Calculate personal records for a skill.

    Records tracked:
    - Longest streak of days with freshness > 70%
    - Peak freshness achieved
    - Most active week (total events)
    - Longest practice gap recovered from

    Returns: dict with record information
    """
    today = date.today()
    start_date = skill_created_at

    # Calculate freshness history
    history = []
    current_date = start_date
    while current_date <= today:
        past_learning = [(d, t) for d, t in learning_events if d <= current_date]
        past_practice = [(d, t) for d, t in practice_events if d <= current_date]

        freshness = calculate_freshness(
            skill_created_at=skill_created_at,
            learning_events=past_learning,
            practice_events=past_practice,
            base_decay_rate=base_decay_rate,
            today=current_date
        )
        history.append((current_date, freshness))
        current_date += timedelta(days=1)

    # Calculate longest fresh streak (freshness > 70%)
    longest_fresh_streak = 0
    current_streak = 0
    streak_start = None
    longest_streak_start = None
    longest_streak_end = None

    for i, (d, f) in enumerate(history):
        if f > 70:
            if current_streak == 0:
                streak_start = d
            current_streak += 1
            if current_streak > longest_fresh_streak:
                longest_fresh_streak = current_streak
                longest_streak_start = streak_start
                longest_streak_end = d
        else:
            current_streak = 0

    # Peak freshness
    peak_freshness = max((f for d, f in history), default=0)
    peak_date = None
    for d, f in history:
        if f == peak_freshness:
            peak_date = d
            break

    # Most active week
    all_events = sorted(
        [(d, 'learning') for d, _ in learning_events] +
        [(d, 'practice') for d, _ in practice_events]
    )

    most_active_week_start = None
    most_active_week_events = 0

    if all_events:
        # Sliding window of 7 days
        for start_idx in range(len(all_events)):
            start_d = all_events[start_idx][0]
            week_end = start_d + timedelta(days=7)
            week_events = sum(1 for d, _ in all_events if start_d <= d < week_end)
            if week_events > most_active_week_events:
                most_active_week_events = week_events
                most_active_week_start = start_d

    # Longest practice gap recovered from (gap followed by practice that brought freshness back up)
    longest_gap_recovered = 0
    if len(practice_events) >= 2:
        sorted_practice = sorted(practice_events, key=lambda x: x[0])
        for i in range(1, len(sorted_practice)):
            gap = (sorted_practice[i][0] - sorted_practice[i-1][0]).days
            if gap > longest_gap_recovered:
                longest_gap_recovered = gap

    return {
        "longest_fresh_streak_days": longest_fresh_streak,
        "longest_fresh_streak_start": str(longest_streak_start) if longest_streak_start else None,
        "longest_fresh_streak_end": str(longest_streak_end) if longest_streak_end else None,
        "peak_freshness": round(peak_freshness, 1),
        "peak_freshness_date": str(peak_date) if peak_date else None,
        "most_active_week_start": str(most_active_week_start) if most_active_week_start else None,
        "most_active_week_events": most_active_week_events,
        "longest_gap_recovered_days": longest_gap_recovered,
        "total_learning_events": len(learning_events),
        "total_practice_events": len(practice_events)
    }
