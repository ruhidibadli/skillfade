"""Pydantic response models for the Time-Invested analytics endpoints."""
from datetime import date
from typing import List, Optional

from pydantic import BaseModel


# --- time-summary (FREE) ------------------------------------------------------

class TimeSummarySkill(BaseModel):
    skill_id: str
    skill_name: str
    archived: bool
    hours: float
    sessions: int


class TimeSummaryResponse(BaseModel):
    total_hours: float
    total_sessions: int
    timed_sessions: int
    coverage_percent: float
    per_skill: List[TimeSummarySkill]


# --- time-report (PRO) --------------------------------------------------------

class TimeRange(BaseModel):
    start: date
    end: date


class TimeTotals(BaseModel):
    hours: float
    sessions: int
    timed_sessions: int
    untimed_sessions: int
    coverage_percent: float
    learning_hours: float
    practice_hours: float
    first_activity: Optional[str] = None
    last_activity: Optional[str] = None


class TimeReportSkill(BaseModel):
    skill_id: str
    skill_name: str
    category: str
    hours: float
    sessions: int
    learning_hours: float
    practice_hours: float
    first_activity: Optional[str] = None
    last_activity: Optional[str] = None
    untimed_sessions: int


class TimeCategory(BaseModel):
    category: str
    hours: float
    sessions: int
    skill_count: int


class TimeMonth(BaseModel):
    month: str
    hours: float
    learning_hours: float
    practice_hours: float


class TimeOverlayPoint(BaseModel):
    month: str
    hours: float
    avg_freshness: float


class TimeReportResponse(BaseModel):
    range: TimeRange
    totals: TimeTotals
    per_skill: List[TimeReportSkill]
    per_category: List[TimeCategory]
    by_month: List[TimeMonth]
    hours_vs_freshness: List[TimeOverlayPoint]
