"""Tests for the Time-Invested aggregation service + endpoints.

Covers app/services/time_stats.py (pure aggregation of duration_minutes) and the
two analytics endpoints it backs: free `time-summary` and PRO `time-report`.
"""
from datetime import date

from app.core.security import create_access_token, get_password_hash
from app.models.category import Category
from app.models.event import LearningEvent, PracticeEvent
from app.models.skill import Skill
from app.models.subscription import Subscription
from app.models.user import User
from app.services.time_stats import time_report, time_summary


# --- fixtures / helpers -------------------------------------------------------

def _user(db, email="t@example.com"):
    u = User(email=email, password_hash=get_password_hash("password123"))
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def _pro(db, email="pro@example.com"):
    u = _user(db, email)
    db.add(Subscription(user_id=u.id, plan="grandfathered", status="active", provider="manual"))
    db.commit()
    return u


def _auth(email):
    return {"Authorization": f"Bearer {create_access_token({'sub': email})}"}


def _seed(db, user):
    """Two skills, one category, four events (one untimed)."""
    cat = Category(user_id=user.id, name="Backend")
    db.add(cat)
    db.commit()
    db.refresh(cat)

    s1 = Skill(user_id=user.id, name="Python", category_id=cat.id)
    s2 = Skill(user_id=user.id, name="SQL")
    db.add_all([s1, s2])
    db.commit()
    db.refresh(s1)
    db.refresh(s2)

    db.add_all([
        LearningEvent(skill_id=s1.id, user_id=user.id, date=date(2026, 1, 10), type="reading", duration_minutes=60),
        PracticeEvent(skill_id=s1.id, user_id=user.id, date=date(2026, 1, 15), type="project", duration_minutes=90),
        PracticeEvent(skill_id=s1.id, user_id=user.id, date=date(2026, 2, 1), type="work", duration_minutes=None),
        LearningEvent(skill_id=s2.id, user_id=user.id, date=date(2026, 1, 20), type="video", duration_minutes=30),
    ])
    db.commit()
    return s1, s2


# --- time_summary (FREE) ------------------------------------------------------

class TestTimeSummary:
    def test_totals_and_coverage(self, db_session):
        u = _user(db_session)
        _seed(db_session, u)
        s = time_summary(db_session, u)
        assert s["total_hours"] == 3.0           # (60 + 90 + 30) / 60
        assert s["total_sessions"] == 4
        assert s["timed_sessions"] == 3
        assert s["coverage_percent"] == 75.0     # 3 of 4 timed

    def test_per_skill_hours_desc(self, db_session):
        u = _user(db_session)
        _seed(db_session, u)
        per = time_summary(db_session, u)["per_skill"]
        by_name = {p["skill_name"]: p for p in per}
        assert by_name["Python"]["hours"] == 2.5   # (60 + 90) / 60
        assert by_name["Python"]["sessions"] == 3
        assert by_name["SQL"]["hours"] == 0.5
        # sorted by hours descending
        assert [p["skill_name"] for p in per] == ["Python", "SQL"]

    def test_empty_user(self, db_session):
        u = _user(db_session)
        s = time_summary(db_session, u)
        assert s["total_hours"] == 0
        assert s["total_sessions"] == 0
        assert s["coverage_percent"] == 0
        assert s["per_skill"] == []


# --- time_report (PRO) --------------------------------------------------------

class TestTimeReport:
    def test_totals_split_and_bounds(self, db_session):
        u = _user(db_session)
        _seed(db_session, u)
        r = time_report(db_session, u, date(2026, 1, 1), date(2026, 2, 28))
        t = r["totals"]
        assert t["hours"] == 3.0
        assert t["sessions"] == 4
        assert t["timed_sessions"] == 3
        assert t["untimed_sessions"] == 1
        assert t["learning_hours"] == 1.5         # (60 + 30) / 60
        assert t["practice_hours"] == 1.5         # 90 / 60 (untimed practice adds 0)
        assert t["first_activity"] == "2026-01-10"
        assert t["last_activity"] == "2026-02-01"

    def test_per_skill_and_category(self, db_session):
        u = _user(db_session)
        _seed(db_session, u)
        r = time_report(db_session, u, date(2026, 1, 1), date(2026, 2, 28))
        skills = {p["skill_name"]: p for p in r["per_skill"]}
        assert skills["Python"]["hours"] == 2.5
        assert skills["Python"]["learning_hours"] == 1.0
        assert skills["Python"]["practice_hours"] == 1.5
        assert skills["Python"]["untimed_sessions"] == 1
        assert skills["SQL"]["hours"] == 0.5
        cats = {c["category"]: c for c in r["per_category"]}
        assert cats["Backend"]["hours"] == 2.5
        assert cats["Backend"]["skill_count"] == 1
        assert cats["Uncategorized"]["hours"] == 0.5

    def test_by_month_and_overlay(self, db_session):
        u = _user(db_session)
        _seed(db_session, u)
        r = time_report(db_session, u, date(2026, 1, 1), date(2026, 2, 28))
        months = {m["month"]: m for m in r["by_month"]}
        assert months["2026-01"]["hours"] == 3.0
        assert months["2026-02"]["hours"] == 0.0   # only the untimed practice in Feb
        overlay = {o["month"]: o for o in r["hours_vs_freshness"]}
        assert set(overlay) == {"2026-01", "2026-02"}
        for o in r["hours_vs_freshness"]:
            # freshness is None for months before any skill existed, else within bounds
            assert o["avg_freshness"] is None or 0.0 <= o["avg_freshness"] <= 100.0

    def test_date_range_filters(self, db_session):
        u = _user(db_session)
        _seed(db_session, u)
        r = time_report(db_session, u, date(2026, 2, 1), date(2026, 2, 28))
        t = r["totals"]
        assert t["hours"] == 0.0
        assert t["sessions"] == 1                  # only the untimed Feb practice
        assert t["untimed_sessions"] == 1

    def test_empty_user(self, db_session):
        u = _user(db_session)
        r = time_report(db_session, u, date(2026, 1, 1), date(2026, 2, 28))
        assert r["totals"]["hours"] == 0
        assert r["per_skill"] == []
        assert r["per_category"] == []

    def test_excludes_archived_skills(self, db_session):
        from datetime import datetime
        u = _user(db_session)
        _s1, s2 = _seed(db_session, u)
        s2.archived_at = datetime.utcnow()  # archive SQL
        db_session.commit()
        r = time_report(db_session, u, date(2026, 1, 1), date(2026, 2, 28))
        names = [p["skill_name"] for p in r["per_skill"]]
        assert "SQL" not in names and "Python" in names
        assert r["totals"]["hours"] == 2.5  # SQL's 0.5h dropped with the archived skill

    def test_overlay_null_before_skill_existed(self, db_session):
        u = _user(db_session)
        _seed(db_session, u)  # skills created at test runtime, after this past range
        r = time_report(db_session, u, date(2026, 1, 1), date(2026, 2, 28))
        assert all(o["avg_freshness"] is None for o in r["hours_vs_freshness"])

    def test_overlay_real_freshness_for_current_month(self, db_session):
        u = _user(db_session)
        _seed(db_session, u)
        today = date.today()
        r = time_report(db_session, u, date(today.year, today.month, 1), today)
        last = r["hours_vs_freshness"][-1]
        assert last["avg_freshness"] is not None
        assert 0.0 <= last["avg_freshness"] <= 100.0


# --- endpoints ----------------------------------------------------------------

class TestTimeEndpoints:
    def test_summary_free_ok(self, client, db_session):
        u = _user(db_session)
        _seed(db_session, u)
        res = client.get("/api/analytics/time-summary", headers=_auth(u.email))
        assert res.status_code == 200
        assert res.json()["total_hours"] == 3.0

    def test_report_free_402(self, client, db_session):
        u = _user(db_session)
        res = client.get(
            "/api/analytics/time-report",
            headers=_auth(u.email),
            params={"start": "2026-01-01", "end": "2026-02-28"},
        )
        assert res.status_code == 402
        assert res.json()["detail"]["error"] == "pro_required"

    def test_report_pro_ok(self, client, db_session):
        u = _pro(db_session)
        _seed(db_session, u)
        res = client.get(
            "/api/analytics/time-report",
            headers=_auth(u.email),
            params={"start": "2026-01-01", "end": "2026-02-28"},
        )
        assert res.status_code == 200
        assert res.json()["totals"]["hours"] == 3.0

    def test_report_bad_range_422(self, client, db_session):
        u = _pro(db_session)
        res = client.get(
            "/api/analytics/time-report",
            headers=_auth(u.email),
            params={"start": "2026-02-28", "end": "2026-01-01"},
        )
        assert res.status_code == 422
