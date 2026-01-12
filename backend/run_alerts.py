#!/usr/bin/env python
"""
Alert processing script.

Run this script via cron to process and send alerts.
Example crontab entry:
0 9 * * * cd /path/to/backend && /path/to/venv/bin/python run_alerts.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.services.alerts import process_all_alerts


def main():
    """Main function to process alerts."""
    print("Starting alert processing...")

    db = SessionLocal()
    try:
        process_all_alerts(db)
        print("Alert processing completed successfully")
    except Exception as e:
        print(f"Error processing alerts: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
