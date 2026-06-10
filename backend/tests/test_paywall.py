"""Tests that the PRO paywall is actually enforced on the backend."""
from app.core.security import create_access_token, get_password_hash
from app.models.category import Category
from app.models.event_template import EventTemplate
from app.models.skill import Skill
from app.models.subscription import Subscription
from app.models.user import User


def _make_user(db, email="free@example.com"):
    u = User(email=email, password_hash=get_password_hash("password123"))
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def _make_pro(db, email="pro@example.com"):
    u = _make_user(db, email)
    db.add(Subscription(user_id=u.id, plan="grandfathered", status="active", provider="manual"))
    db.commit()
    return u


def _auth(email):
    return {"Authorization": f"Bearer {create_access_token({'sub': email})}"}


def _skill(db, user, name="s"):
    s = Skill(user_id=user.id, name=name)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


class TestProEndpointsGated:
    def test_period_comparison_402_for_free(self, client, db_session):
        u = _make_user(db_session)
        r = client.get("/api/analytics/period-comparison", headers=_auth(u.email))
        assert r.status_code == 402
        assert r.json()["detail"]["error"] == "pro_required"

    def test_period_comparison_ok_for_pro(self, client, db_session):
        u = _make_pro(db_session)
        assert client.get("/api/analytics/period-comparison", headers=_auth(u.email)).status_code == 200

    def test_category_stats_402_for_free(self, client, db_session):
        u = _make_user(db_session)
        assert client.get("/api/analytics/category-stats", headers=_auth(u.email)).status_code == 402

    def test_personal_records_402_for_free(self, client, db_session):
        u = _make_user(db_session)
        s = _skill(db_session, u)
        assert client.get(f"/api/analytics/skills/{s.id}/personal-records", headers=_auth(u.email)).status_code == 402

    def test_personal_records_ok_for_pro(self, client, db_session):
        u = _make_pro(db_session)
        s = _skill(db_session, u)
        assert client.get(f"/api/analytics/skills/{s.id}/personal-records", headers=_auth(u.email)).status_code == 200

    def test_dependencies_402_for_free(self, client, db_session):
        u = _make_user(db_session)
        s = _skill(db_session, u)
        r = client.put(f"/api/skills/{s.id}/dependencies", headers=_auth(u.email), json={"dependency_ids": []})
        assert r.status_code == 402

    def test_dependencies_ok_for_pro(self, client, db_session):
        u = _make_pro(db_session)
        s = _skill(db_session, u)
        r = client.put(f"/api/skills/{s.id}/dependencies", headers=_auth(u.email), json={"dependency_ids": []})
        assert r.status_code == 200

    def test_export_402_for_free(self, client, db_session):
        u = _make_user(db_session)
        assert client.get("/api/settings/export", headers=_auth(u.email)).status_code == 402

    def test_export_ok_for_pro(self, client, db_session):
        u = _make_pro(db_session)
        assert client.get("/api/settings/export", headers=_auth(u.email)).status_code == 200


class TestFreeLimits:
    def test_skill_cap_blocks_fourth(self, client, db_session):
        u = _make_user(db_session)
        for i in range(3):
            _skill(db_session, u, name=f"s{i}")
        r = client.post("/api/skills", headers=_auth(u.email), json={"name": "s4"})
        assert r.status_code == 402

    def test_skill_under_cap_ok(self, client, db_session):
        u = _make_user(db_session)
        _skill(db_session, u, name="s0")
        r = client.post("/api/skills", headers=_auth(u.email), json={"name": "s1"})
        assert r.status_code == 201

    def test_pro_skill_unlimited(self, client, db_session):
        u = _make_pro(db_session)
        for i in range(5):
            _skill(db_session, u, name=f"s{i}")
        r = client.post("/api/skills", headers=_auth(u.email), json={"name": "s6"})
        assert r.status_code == 201

    def test_category_cap_blocks_third(self, client, db_session):
        u = _make_user(db_session)
        for i in range(2):
            db_session.add(Category(user_id=u.id, name=f"c{i}"))
        db_session.commit()
        r = client.post("/api/categories", headers=_auth(u.email), json={"name": "c3"})
        assert r.status_code == 402

    def test_template_cap_blocks_third(self, client, db_session):
        u = _make_user(db_session)
        for i in range(2):
            db_session.add(EventTemplate(user_id=u.id, name=f"t{i}", event_type="learning", type="reading"))
        db_session.commit()
        r = client.post("/api/templates", headers=_auth(u.email),
                        json={"name": "t3", "event_type": "learning", "type": "reading"})
        assert r.status_code == 402


class TestProFieldGates:
    def test_free_cannot_set_target_freshness(self, client, db_session):
        u = _make_user(db_session)
        r = client.post("/api/skills", headers=_auth(u.email), json={"name": "s", "target_freshness": 80})
        assert r.status_code == 402

    def test_free_cannot_set_notes(self, client, db_session):
        u = _make_user(db_session)
        r = client.post("/api/skills", headers=_auth(u.email), json={"name": "s", "notes": "remember this"})
        assert r.status_code == 402

    def test_pro_can_set_target_freshness(self, client, db_session):
        u = _make_pro(db_session)
        r = client.post("/api/skills", headers=_auth(u.email), json={"name": "s", "target_freshness": 80})
        assert r.status_code == 201
