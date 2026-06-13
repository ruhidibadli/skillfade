"""Time-Invested aggregation.

Pure(ish) aggregation of the `duration_minutes` already captured on every learning
and practice event. Nothing here logs, recommends, or predicts — it only sums and
formats what the user manually recorded, and reuses the deterministic freshness
engine for the hours-vs-freshness overlay.

Two entry points:
  - time_summary(db, user)              -> FREE: account + per-skill totals + coverage
  - time_report(db, user, start, end)   -> PRO:  full date-range breakdown
"""
from collections import defaultdict
from datetime import date, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.event import LearningEvent, PracticeEvent
from app.models.skill import Skill
from app.models.user import User
from app.services.freshness import calculate_freshness


def _hours(minutes: int) -> float:
    """Whole minutes -> hours, rounded to 2 decimals."""
    return round((minutes or 0) / 60, 2)


def _coverage(timed: int, total: int) -> float:
    return round(timed / total * 100, 1) if total else 0.0


def _iter_months(start: date, end: date):
    """Yield (year, month) tuples spanning start..end inclusive."""
    y, m = start.year, start.month
    while (y, m) <= (end.year, end.month):
        yield y, m
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)


def _month_end(year: int, month: int) -> date:
    if month == 12:
        return date(year, 12, 31)
    return date(year, month + 1, 1) - timedelta(days=1)


def time_summary(db: Session, user: User) -> dict:
    """FREE: account total hours + per-skill totals + duration coverage."""
    skills = db.query(Skill).filter(Skill.user_id == user.id).all()

    total_minutes = 0
    total_sessions = 0
    timed_sessions = 0
    per_skill = []

    for skill in skills:
        s_minutes = 0
        s_sessions = 0
        for event in list(skill.learning_events) + list(skill.practice_events):
            total_sessions += 1
            s_sessions += 1
            if event.duration_minutes is not None:
                timed_sessions += 1
                total_minutes += event.duration_minutes
                s_minutes += event.duration_minutes

        # Show active skills always; archived skills only if they hold history.
        if s_sessions > 0 or skill.archived_at is None:
            per_skill.append({
                "skill_id": str(skill.id),
                "skill_name": skill.name,
                "archived": skill.archived_at is not None,
                "hours": _hours(s_minutes),
                "sessions": s_sessions,
            })

    per_skill.sort(key=lambda p: p["hours"], reverse=True)

    return {
        "total_hours": _hours(total_minutes),
        "total_sessions": total_sessions,
        "timed_sessions": timed_sessions,
        "coverage_percent": _coverage(timed_sessions, total_sessions),
        "per_skill": per_skill,
    }


def time_report(
    db: Session,
    user: User,
    start: date,
    end: date,
    skill_id: Optional[UUID] = None,
) -> dict:
    """PRO: full breakdown for [start, end] — totals, per-skill, per-category,
    monthly trend, and the hours-vs-freshness overlay."""
    query = db.query(Skill).filter(
        Skill.user_id == user.id,
        Skill.archived_at.is_(None),  # match the rest of analytics — archived skills excluded
    )
    if skill_id is not None:
        query = query.filter(Skill.id == skill_id)
    skills = query.all()

    totals = {
        "minutes": 0, "sessions": 0, "timed": 0, "untimed": 0,
        "learning_minutes": 0, "practice_minutes": 0,
    }
    per_skill = []
    cat_minutes = defaultdict(int)
    cat_sessions = defaultdict(int)
    cat_skill_count = defaultdict(int)
    month_minutes = defaultdict(int)
    month_learning = defaultdict(int)
    month_practice = defaultdict(int)
    all_dates: list[date] = []

    for skill in skills:
        category = skill.category_obj.name if skill.category_obj else "Uncategorized"
        s = {"minutes": 0, "sessions": 0, "learning": 0, "practice": 0, "untimed": 0, "dates": []}

        events = (
            [(e, "learning") for e in skill.learning_events]
            + [(e, "practice") for e in skill.practice_events]
        )
        for event, kind in events:
            if event.date < start or event.date > end:
                continue
            s["sessions"] += 1
            s["dates"].append(event.date)
            all_dates.append(event.date)
            minutes = event.duration_minutes
            if minutes is None:
                s["untimed"] += 1
                continue
            month_key = f"{event.date.year:04d}-{event.date.month:02d}"
            s["minutes"] += minutes
            month_minutes[month_key] += minutes
            if kind == "learning":
                s["learning"] += minutes
                month_learning[month_key] += minutes
            else:
                s["practice"] += minutes
                month_practice[month_key] += minutes

        if s["sessions"] == 0:
            continue  # skill has no activity in this window

        totals["sessions"] += s["sessions"]
        totals["minutes"] += s["minutes"]
        totals["timed"] += s["sessions"] - s["untimed"]
        totals["untimed"] += s["untimed"]
        totals["learning_minutes"] += s["learning"]
        totals["practice_minutes"] += s["practice"]

        cat_minutes[category] += s["minutes"]
        cat_sessions[category] += s["sessions"]
        cat_skill_count[category] += 1

        per_skill.append({
            "skill_id": str(skill.id),
            "skill_name": skill.name,
            "category": category,
            "hours": _hours(s["minutes"]),
            "sessions": s["sessions"],
            "learning_hours": _hours(s["learning"]),
            "practice_hours": _hours(s["practice"]),
            "first_activity": min(s["dates"]).isoformat() if s["dates"] else None,
            "last_activity": max(s["dates"]).isoformat() if s["dates"] else None,
            "untimed_sessions": s["untimed"],
        })

    per_skill.sort(key=lambda p: p["hours"], reverse=True)

    per_category = sorted(
        (
            {
                "category": cat,
                "hours": _hours(cat_minutes[cat]),
                "sessions": cat_sessions[cat],
                "skill_count": cat_skill_count[cat],
            }
            for cat in cat_skill_count
        ),
        key=lambda c: c["hours"],
        reverse=True,
    )

    by_month = []
    hours_vs_freshness = []
    for year, month in _iter_months(start, end):
        key = f"{year:04d}-{month:02d}"
        by_month.append({
            "month": key,
            "hours": _hours(month_minutes[key]),
            "learning_hours": _hours(month_learning[key]),
            "practice_hours": _hours(month_practice[key]),
        })
        # Clamp the freshness as-of to the report end so the final (current) month
        # isn't decayed into the future past `end`/today.
        as_of = min(_month_end(year, month), end)
        hours_vs_freshness.append({
            "month": key,
            "hours": _hours(month_minutes[key]),
            "avg_freshness": _avg_freshness(skills, as_of),
        })

    return {
        "range": {"start": start, "end": end},
        "totals": {
            "hours": _hours(totals["minutes"]),
            "sessions": totals["sessions"],
            "timed_sessions": totals["timed"],
            "untimed_sessions": totals["untimed"],
            "coverage_percent": _coverage(totals["timed"], totals["sessions"]),
            "learning_hours": _hours(totals["learning_minutes"]),
            "practice_hours": _hours(totals["practice_minutes"]),
            "first_activity": min(all_dates).isoformat() if all_dates else None,
            "last_activity": max(all_dates).isoformat() if all_dates else None,
        },
        "per_skill": per_skill,
        "per_category": per_category,
        "by_month": by_month,
        "hours_vs_freshness": hours_vs_freshness,
    }


def _avg_freshness(skills: list, as_of: date) -> Optional[float]:
    """Mean freshness across the given skills as of `as_of`, using each skill's own
    events filtered to that date. Reuses the pure freshness engine.

    Skills created after `as_of` are skipped — they didn't exist yet, so they must not
    bias the month toward 100%. Returns None when no skill existed yet, so the overlay
    shows an honest gap rather than a misleading 0 or 100.
    """
    values = []
    for skill in skills:
        if skill.created_at.date() > as_of:
            continue  # skill did not exist yet this month
        learning = [(e.date, e.type) for e in skill.learning_events if e.date <= as_of]
        practice = [(e.date, e.type) for e in skill.practice_events if e.date <= as_of]
        values.append(calculate_freshness(
            skill_created_at=skill.created_at.date(),
            learning_events=learning,
            practice_events=practice,
            base_decay_rate=skill.decay_rate or 0.02,
            today=as_of,
        ))
    return round(sum(values) / len(values), 1) if values else None
