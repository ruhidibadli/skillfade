import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date, timedelta
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User
from app.models.skill import Skill
from app.models.event import LearningEvent, PracticeEvent
from app.services.freshness import calculate_freshness


def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Send an email using SMTP.
    """
    if not settings.SMTP_HOST or not settings.ENABLE_ALERTS:
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM
        msg['To'] = to_email
        msg['Subject'] = subject

        # Plain text email (as per spec)
        msg.attach(MIMEText(body, 'plain'))

        # Connect to SMTP server
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def check_decay_alerts(db: Session) -> List[Tuple[User, Skill, float]]:
    """
    Check for skills that have dropped below 40% freshness.
    Returns list of (user, skill, freshness) tuples.
    """
    alerts = []

    users = db.query(User).all()

    for user in users:
        # Check user settings for alert preferences
        user_settings = user.settings or {}
        if not user_settings.get('alerts_enabled', True):
            continue
        if not user_settings.get('decay_alerts_enabled', True):
            continue

        # Get user's active skills
        skills = db.query(Skill).filter(
            Skill.user_id == user.id,
            Skill.archived_at.is_(None)
        ).all()

        for skill in skills:
            learning_events = [(e.date, e.type) for e in skill.learning_events]
            practice_events = [(e.date, e.type) for e in skill.practice_events]

            freshness = calculate_freshness(
                skill_created_at=skill.created_at.date(),
                learning_events=learning_events,
                practice_events=practice_events
            )

            # Alert if freshness < 40%
            if freshness < 40:
                # Check if we've sent this alert recently (last 14 days)
                last_alert = user_settings.get('last_decay_alerts', {}).get(str(skill.id))
                if last_alert:
                    last_alert_date = date.fromisoformat(last_alert)
                    if (date.today() - last_alert_date).days < 14:
                        continue

                alerts.append((user, skill, freshness))

    return alerts


def check_practice_gap_alerts(db: Session) -> List[Tuple[User, Skill, int, int]]:
    """
    Check for skills with learning but no practice.
    Returns list of (user, skill, learning_count, days_old) tuples.
    """
    alerts = []

    users = db.query(User).all()

    for user in users:
        # Check user settings
        user_settings = user.settings or {}
        if not user_settings.get('alerts_enabled', True):
            continue
        if not user_settings.get('practice_gap_alerts_enabled', True):
            continue

        # Get user's active skills
        skills = db.query(Skill).filter(
            Skill.user_id == user.id,
            Skill.archived_at.is_(None)
        ).all()

        for skill in skills:
            learning_count = len(skill.learning_events)
            practice_count = len(skill.practice_events)
            skill_age = (date.today() - skill.created_at.date()).days

            # Alert if 3+ learning events, zero practice, 30+ days old
            if learning_count >= 3 and practice_count == 0 and skill_age >= 30:
                # Check if we've sent this alert before (once per skill)
                sent_alerts = user_settings.get('practice_gap_alerts_sent', [])
                if str(skill.id) in sent_alerts:
                    continue

                alerts.append((user, skill, learning_count, skill_age))

    return alerts


def check_imbalance_alerts(db: Session) -> List[Tuple[User, int, int]]:
    """
    Check for monthly input/output imbalance.
    Returns list of (user, learning_count, practice_count) tuples.
    """
    alerts = []

    users = db.query(User).all()
    today = date.today()
    month_ago = today - timedelta(days=30)
    two_months_ago = today - timedelta(days=60)

    for user in users:
        # Check user settings
        user_settings = user.settings or {}
        if not user_settings.get('alerts_enabled', True):
            continue
        if not user_settings.get('imbalance_alerts_enabled', True):
            continue

        # Get last month's events
        last_month_learning = db.query(LearningEvent).filter(
            LearningEvent.user_id == user.id,
            LearningEvent.date >= month_ago,
            LearningEvent.date < today
        ).count()

        last_month_practice = db.query(PracticeEvent).filter(
            PracticeEvent.user_id == user.id,
            PracticeEvent.date >= month_ago,
            PracticeEvent.date < today
        ).count()

        # Get two months ago events
        prev_month_learning = db.query(LearningEvent).filter(
            LearningEvent.user_id == user.id,
            LearningEvent.date >= two_months_ago,
            LearningEvent.date < month_ago
        ).count()

        prev_month_practice = db.query(PracticeEvent).filter(
            PracticeEvent.user_id == user.id,
            PracticeEvent.date >= two_months_ago,
            PracticeEvent.date < month_ago
        ).count()

        # Calculate ratios
        last_ratio = (last_month_practice / last_month_learning) if last_month_learning > 0 else 1.0
        prev_ratio = (prev_month_practice / prev_month_learning) if prev_month_learning > 0 else 1.0

        # Alert if ratio <0.2 for 2 consecutive months
        if last_ratio < 0.2 and prev_ratio < 0.2:
            # Check if we've sent this alert this month
            last_alert = user_settings.get('last_imbalance_alert')
            if last_alert:
                last_alert_date = date.fromisoformat(last_alert)
                if (date.today() - last_alert_date).days < 30:
                    continue

            alerts.append((user, last_month_learning, last_month_practice))

    return alerts


def send_decay_alert(user: User, skill: Skill, freshness: float, db: Session):
    """Send a decay alert email."""
    days_since_practice = (date.today() - skill.created_at.date()).days
    if skill.practice_events:
        last_practice = max(e.date for e in skill.practice_events)
        days_since_practice = (date.today() - last_practice).days

    subject = f"Skill Freshness Update: {skill.name}"
    body = f"""Your skill in {skill.name} hasn't been practiced in {days_since_practice} days.

Current freshness: {freshness:.0f}%

This is a calm reminder. No urgency, no judgment.

---
SkillFade
Unsubscribe: {settings.FRONTEND_URL}/settings
"""

    if send_email(user.email, subject, body):
        # Update last alert timestamp
        user_settings = user.settings or {}
        if 'last_decay_alerts' not in user_settings:
            user_settings['last_decay_alerts'] = {}
        user_settings['last_decay_alerts'][str(skill.id)] = date.today().isoformat()
        user.settings = user_settings
        db.commit()


def send_practice_gap_alert(user: User, skill: Skill, learning_count: int, db: Session):
    """Send a practice gap alert email."""
    subject = f"Practice Reminder: {skill.name}"
    body = f"""You've been learning {skill.name} but haven't applied it yet.

Learning events logged: {learning_count}
Practice events: 0

Consider a small practice project to strengthen retention.

---
SkillFade
Unsubscribe: {settings.FRONTEND_URL}/settings
"""

    if send_email(user.email, subject, body):
        # Mark alert as sent
        user_settings = user.settings or {}
        if 'practice_gap_alerts_sent' not in user_settings:
            user_settings['practice_gap_alerts_sent'] = []
        user_settings['practice_gap_alerts_sent'].append(str(skill.id))
        user.settings = user_settings
        db.commit()


def send_imbalance_alert(user: User, learning_count: int, practice_count: int, db: Session):
    """Send an imbalance alert email."""
    subject = "Monthly Learning Balance Update"
    body = f"""This month you logged {learning_count} learning events and {practice_count} practice events.

This is normal during learning phases, but long-term retention requires application.

No judgment, just data.

---
SkillFade
Unsubscribe: {settings.FRONTEND_URL}/settings
"""

    if send_email(user.email, subject, body):
        # Update last alert timestamp
        user_settings = user.settings or {}
        user_settings['last_imbalance_alert'] = date.today().isoformat()
        user.settings = user_settings
        db.commit()


def process_all_alerts(db: Session):
    """
    Process all alert types and send emails.
    This function should be called by a scheduled job (cron, celery, etc.)
    """
    # Check and send decay alerts
    decay_alerts = check_decay_alerts(db)
    for user, skill, freshness in decay_alerts:
        send_decay_alert(user, skill, freshness, db)

    # Check and send practice gap alerts
    gap_alerts = check_practice_gap_alerts(db)
    for user, skill, learning_count, days_old in gap_alerts:
        send_practice_gap_alert(user, skill, learning_count, db)

    # Check and send imbalance alerts
    imbalance_alerts = check_imbalance_alerts(db)
    for user, learning_count, practice_count in imbalance_alerts:
        send_imbalance_alert(user, learning_count, practice_count, db)

    print(f"Processed alerts: {len(decay_alerts)} decay, {len(gap_alerts)} practice gap, {len(imbalance_alerts)} imbalance")
