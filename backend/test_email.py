#!/usr/bin/env python
"""
Test email configuration with verbose debugging.

Run this script to verify your SMTP settings are working correctly.
Usage: python test_email.py [recipient_email]
"""
import sys
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.config import settings


def send_test_email(to_email: str) -> bool:
    """Send test email with verbose output."""

    print("\n[1] Creating email message...")
    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_FROM
    msg['To'] = to_email
    msg['Subject'] = "SkillFade - Test Email"

    body = """Hello!

This is a test email from SkillFade.

If you received this message, your SMTP configuration is working correctly.

---
SkillFade
A mirror, not a coach.
"""
    msg.attach(MIMEText(body, 'plain'))
    print(f"    From: {msg['From']}")
    print(f"    To: {msg['To']}")
    print(f"    Subject: {msg['Subject']}")

    print(f"\n[2] Connecting to SMTP server: {settings.SMTP_HOST}:{settings.SMTP_PORT}")

    try:
        # Enable debug output
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
        server.set_debuglevel(1)  # Show SMTP conversation

        print("\n[3] Starting TLS encryption...")
        server.starttls()

        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            print(f"\n[4] Logging in as: {settings.SMTP_USER}")
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        else:
            print("\n[4] Skipping login (no credentials provided)")

        print(f"\n[5] Sending email...")
        result = server.send_message(msg)
        print(f"    Send result: {result}")

        # Also try sendmail for more info
        print(f"\n[6] Server response after send:")
        response = server.noop()
        print(f"    NOOP response: {response}")

        server.quit()
        print("\n[7] Connection closed successfully")

        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"\nAUTHENTICATION ERROR: {e}")
        print("Check your SMTP_USER and SMTP_PASSWORD")
        print("For Gmail, use an App Password, not your regular password")
        return False
    except smtplib.SMTPRecipientsRefused as e:
        print(f"\nRECIPIENT REFUSED: {e}")
        print("The recipient email address was rejected")
        return False
    except smtplib.SMTPSenderRefused as e:
        print(f"\nSENDER REFUSED: {e}")
        print("Check your SMTP_FROM address")
        return False
    except smtplib.SMTPException as e:
        print(f"\nSMTP ERROR: {e}")
        return False
    except Exception as e:
        print(f"\nGENERAL ERROR: {type(e).__name__}: {e}")
        return False


def main():
    print("=" * 60)
    print("SkillFade - Email Configuration Test (Verbose)")
    print("=" * 60)

    # Show current config
    print("\nCurrent SMTP Configuration:")
    print(f"  SMTP_HOST:     {settings.SMTP_HOST or '(not set)'}")
    print(f"  SMTP_PORT:     {settings.SMTP_PORT}")
    print(f"  SMTP_USER:     {settings.SMTP_USER or '(not set)'}")
    print(f"  SMTP_PASSWORD: {'*' * len(settings.SMTP_PASSWORD) if settings.SMTP_PASSWORD else '(not set)'}")
    print(f"  SMTP_FROM:     {settings.SMTP_FROM}")
    print(f"  ENABLE_ALERTS: {settings.ENABLE_ALERTS}")

    # Validation checks
    if not settings.SMTP_HOST:
        print("\nERROR: SMTP_HOST is not configured in .env file")
        sys.exit(1)

    if not settings.ENABLE_ALERTS:
        print("\nWARNING: ENABLE_ALERTS=false, emails disabled")
        sys.exit(1)

    # Get recipient
    if len(sys.argv) > 1:
        recipient = sys.argv[1]
    else:
        recipient = input("\nEnter recipient email address: ").strip()

    if not recipient:
        print("ERROR: No recipient email provided")
        sys.exit(1)

    print(f"\n{'=' * 60}")
    print(f"Sending test email to: {recipient}")
    print(f"{'=' * 60}")

    success = send_test_email(recipient)

    print(f"\n{'=' * 60}")
    if success:
        print("RESULT: Email sent successfully (check inbox AND spam folder)")
    else:
        print("RESULT: Failed to send email")
    print(f"{'=' * 60}")

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
