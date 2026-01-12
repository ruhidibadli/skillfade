from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from typing import Literal
from uuid import UUID
from app.core.database import get_db
from app.models.user import User
from app.models.skill import Skill
from app.models.event import LearningEvent, PracticeEvent
from app.services.auth import get_current_user
from app.services.freshness import calculate_balance_ratio, get_balance_interpretation, calculate_freshness_history
from app.schemas.skill import FreshnessHistoryResponse

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard")
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get summary data for the dashboard.
    """
    # Get total skills count
    total_skills = db.query(Skill).filter(
        Skill.user_id == current_user.id,
        Skill.archived_at.is_(None)
    ).count()

    # Get events from last 7 days
    week_ago = date.today() - timedelta(days=7)

    learning_events_week = db.query(LearningEvent).filter(
        LearningEvent.user_id == current_user.id,
        LearningEvent.date >= week_ago
    ).count()

    practice_events_week = db.query(PracticeEvent).filter(
        PracticeEvent.user_id == current_user.id,
        PracticeEvent.date >= week_ago
    ).count()

    # Calculate weekly balance ratio
    weekly_ratio = calculate_balance_ratio(learning_events_week, practice_events_week)

    return {
        "total_skills": total_skills,
        "learning_events_this_week": learning_events_week,
        "practice_events_this_week": practice_events_week,
        "weekly_balance_ratio": round(weekly_ratio, 2),
        "balance_interpretation": get_balance_interpretation(weekly_ratio)
    }


@router.get("/balance")
def get_balance_data(
    period: Literal["week", "month", "quarter"] = Query("month"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get input/output balance data for specified period.
    """
    # Calculate date range
    today = date.today()

    if period == "week":
        days = 7
        group_format = "%Y-W%W"  # Year-Week
    elif period == "month":
        days = 30
        group_format = "%Y-%m"  # Year-Month
    else:  # quarter
        days = 90
        group_format = "%Y-Q"  # Year-Quarter (simplified)

    start_date = today - timedelta(days=days)

    # Get learning events grouped by period
    learning_query = db.query(
        func.date_trunc('day', LearningEvent.date).label('period'),
        func.count(LearningEvent.id).label('count')
    ).filter(
        LearningEvent.user_id == current_user.id,
        LearningEvent.date >= start_date
    ).group_by('period').all()

    # Get practice events grouped by period
    practice_query = db.query(
        func.date_trunc('day', PracticeEvent.date).label('period'),
        func.count(PracticeEvent.id).label('count')
    ).filter(
        PracticeEvent.user_id == current_user.id,
        PracticeEvent.date >= start_date
    ).group_by('period').all()

    # Format data for chart
    learning_data = {str(row.period.date()): row.count for row in learning_query}
    practice_data = {str(row.period.date()): row.count for row in practice_query}

    # Generate all dates in range
    all_dates = []
    current_date = start_date
    while current_date <= today:
        date_str = str(current_date)
        all_dates.append({
            "date": date_str,
            "learning": learning_data.get(date_str, 0),
            "practice": practice_data.get(date_str, 0)
        })
        current_date += timedelta(days=1)

    # Calculate overall ratio for the period
    total_learning = sum(item["learning"] for item in all_dates)
    total_practice = sum(item["practice"] for item in all_dates)
    overall_ratio = calculate_balance_ratio(total_learning, total_practice)

    return {
        "period": period,
        "data": all_dates,
        "total_learning": total_learning,
        "total_practice": total_practice,
        "balance_ratio": round(overall_ratio, 2),
        "interpretation": get_balance_interpretation(overall_ratio)
    }


@router.get("/calendar")
def get_calendar_data(
    month: int = Query(None, ge=1, le=12),
    year: int = Query(None, ge=2000, le=2100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get calendar data with all events for a specific month.
    Returns events grouped by date with skill names.
    """
    # Default to current month if not specified
    today = date.today()
    target_year = year if year else today.year
    target_month = month if month else today.month

    # Calculate first and last day of month
    first_day = date(target_year, target_month, 1)
    if target_month == 12:
        last_day = date(target_year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(target_year, target_month + 1, 1) - timedelta(days=1)

    # Get all learning events for the month with skill names
    learning_events = db.query(LearningEvent, Skill.name).join(
        Skill, LearningEvent.skill_id == Skill.id
    ).filter(
        LearningEvent.user_id == current_user.id,
        LearningEvent.date >= first_day,
        LearningEvent.date <= last_day
    ).all()

    # Get all practice events for the month with skill names
    practice_events = db.query(PracticeEvent, Skill.name).join(
        Skill, PracticeEvent.skill_id == Skill.id
    ).filter(
        PracticeEvent.user_id == current_user.id,
        PracticeEvent.date >= first_day,
        PracticeEvent.date <= last_day
    ).all()

    # Group events by date
    events_by_date = {}

    for event, skill_name in learning_events:
        date_str = str(event.date)
        if date_str not in events_by_date:
            events_by_date[date_str] = []
        events_by_date[date_str].append({
            "id": str(event.id),
            "skill_name": skill_name,
            "skill_id": str(event.skill_id),
            "type": event.type,
            "event_type": "learning",
            "notes": event.notes,
            "duration_minutes": event.duration_minutes
        })

    for event, skill_name in practice_events:
        date_str = str(event.date)
        if date_str not in events_by_date:
            events_by_date[date_str] = []
        events_by_date[date_str].append({
            "id": str(event.id),
            "skill_name": skill_name,
            "skill_id": str(event.skill_id),
            "type": event.type,
            "event_type": "practice",
            "notes": event.notes,
            "duration_minutes": event.duration_minutes
        })

    return {
        "year": target_year,
        "month": target_month,
        "events_by_date": events_by_date
    }


@router.get("/skills-by-freshness")
def get_skills_by_freshness(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get skills grouped by freshness level for visualization.
    """
    from app.services.freshness import calculate_freshness

    skills = db.query(Skill).filter(
        Skill.user_id == current_user.id,
        Skill.archived_at.is_(None)
    ).all()

    freshness_ranges = {
        "high": 0,  # >70%
        "medium": 0,  # 40-70%
        "low": 0  # <40%
    }

    for skill in skills:
        learning_events = [(e.date, e.type) for e in skill.learning_events]
        practice_events = [(e.date, e.type) for e in skill.practice_events]

        freshness = calculate_freshness(
            skill_created_at=skill.created_at.date(),
            learning_events=learning_events,
            practice_events=practice_events
        )

        if freshness > 70:
            freshness_ranges["high"] += 1
        elif freshness >= 40:
            freshness_ranges["medium"] += 1
        else:
            freshness_ranges["low"] += 1

    return {
        "data": [
            {"range": "High (>70%)", "count": freshness_ranges["high"]},
            {"range": "Medium (40-70%)", "count": freshness_ranges["medium"]},
            {"range": "Low (<40%)", "count": freshness_ranges["low"]}
        ]
    }


@router.get("/skills/{skill_id}/freshness-history", response_model=FreshnessHistoryResponse)
def get_skill_freshness_history(
    skill_id: UUID,
    days: int = Query(90, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get freshness history for a specific skill over time.
    """
    from app.services.freshness import calculate_freshness

    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )

    learning_events = [(e.date, e.type) for e in skill.learning_events]
    practice_events = [(e.date, e.type) for e in skill.practice_events]

    history = calculate_freshness_history(
        skill_created_at=skill.created_at.date(),
        learning_events=learning_events,
        practice_events=practice_events,
        base_decay_rate=skill.decay_rate or 0.02,
        days=days
    )

    current_freshness = calculate_freshness(
        skill_created_at=skill.created_at.date(),
        learning_events=learning_events,
        practice_events=practice_events,
        base_decay_rate=skill.decay_rate or 0.02
    )

    return {
        "skill_id": skill.id,
        "skill_name": skill.name,
        "history": [{"date": d, "freshness": f} for d, f in history],
        "current_freshness": round(current_freshness, 2)
    }


@router.get("/period-comparison")
def get_period_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compare activity between this month and last month.
    """
    today = date.today()

    # Current month range
    current_month_start = date(today.year, today.month, 1)

    # Last month range
    if today.month == 1:
        last_month_start = date(today.year - 1, 12, 1)
        last_month_end = date(today.year - 1, 12, 31)
    else:
        last_month_start = date(today.year, today.month - 1, 1)
        if today.month == 2:
            last_month_end = date(today.year, today.month, 1) - timedelta(days=1)
        else:
            last_month_end = date(today.year, today.month, 1) - timedelta(days=1)

    # Current month events
    current_learning = db.query(LearningEvent).filter(
        LearningEvent.user_id == current_user.id,
        LearningEvent.date >= current_month_start
    ).count()

    current_practice = db.query(PracticeEvent).filter(
        PracticeEvent.user_id == current_user.id,
        PracticeEvent.date >= current_month_start
    ).count()

    # Last month events
    last_learning = db.query(LearningEvent).filter(
        LearningEvent.user_id == current_user.id,
        LearningEvent.date >= last_month_start,
        LearningEvent.date <= last_month_end
    ).count()

    last_practice = db.query(PracticeEvent).filter(
        PracticeEvent.user_id == current_user.id,
        PracticeEvent.date >= last_month_start,
        PracticeEvent.date <= last_month_end
    ).count()

    # Calculate changes
    learning_change = current_learning - last_learning
    practice_change = current_practice - last_practice

    current_ratio = calculate_balance_ratio(current_learning, current_practice)
    last_ratio = calculate_balance_ratio(last_learning, last_practice)

    return {
        "current_month": {
            "learning": current_learning,
            "practice": current_practice,
            "total": current_learning + current_practice,
            "ratio": round(current_ratio, 2),
            "interpretation": get_balance_interpretation(current_ratio)
        },
        "last_month": {
            "learning": last_learning,
            "practice": last_practice,
            "total": last_learning + last_practice,
            "ratio": round(last_ratio, 2),
            "interpretation": get_balance_interpretation(last_ratio)
        },
        "changes": {
            "learning": learning_change,
            "practice": practice_change,
            "total": (current_learning + current_practice) - (last_learning + last_practice),
            "learning_percent": round((learning_change / last_learning * 100) if last_learning > 0 else (100 if learning_change > 0 else 0), 1),
            "practice_percent": round((practice_change / last_practice * 100) if last_practice > 0 else (100 if practice_change > 0 else 0), 1)
        }
    }


@router.get("/category-stats")
def get_category_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get average freshness and total activity grouped by category.
    """
    from app.services.freshness import calculate_freshness

    skills = db.query(Skill).filter(
        Skill.user_id == current_user.id,
        Skill.archived_at.is_(None)
    ).all()

    # Group skills by category
    category_data = {}

    for skill in skills:
        category = skill.category or "Uncategorized"

        if category not in category_data:
            category_data[category] = {
                "skills": [],
                "total_learning": 0,
                "total_practice": 0,
                "freshness_sum": 0
            }

        learning_events = [(e.date, e.type) for e in skill.learning_events]
        practice_events = [(e.date, e.type) for e in skill.practice_events]

        freshness = calculate_freshness(
            skill_created_at=skill.created_at.date(),
            learning_events=learning_events,
            practice_events=practice_events,
            base_decay_rate=skill.decay_rate or 0.02
        )

        category_data[category]["skills"].append(skill.name)
        category_data[category]["total_learning"] += len(learning_events)
        category_data[category]["total_practice"] += len(practice_events)
        category_data[category]["freshness_sum"] += freshness

    # Calculate averages and format response
    result = []
    for category, data in category_data.items():
        skill_count = len(data["skills"])
        avg_freshness = data["freshness_sum"] / skill_count if skill_count > 0 else 0

        result.append({
            "category": category,
            "skill_count": skill_count,
            "average_freshness": round(avg_freshness, 1),
            "total_learning": data["total_learning"],
            "total_practice": data["total_practice"],
            "total_events": data["total_learning"] + data["total_practice"],
            "skills": data["skills"]
        })

    # Sort by average freshness (lowest first to highlight neglected areas)
    result.sort(key=lambda x: x["average_freshness"])

    return {"categories": result}


@router.get("/skills/{skill_id}/personal-records")
def get_skill_personal_records(
    skill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personal records for a specific skill.
    """
    from app.services.freshness import calculate_personal_records

    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == current_user.id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )

    learning_events = [(e.date, e.type) for e in skill.learning_events]
    practice_events = [(e.date, e.type) for e in skill.practice_events]

    records = calculate_personal_records(
        skill_created_at=skill.created_at.date(),
        learning_events=learning_events,
        practice_events=practice_events,
        base_decay_rate=skill.decay_rate or 0.02
    )

    return {
        "skill_id": str(skill.id),
        "skill_name": skill.name,
        **records
    }
