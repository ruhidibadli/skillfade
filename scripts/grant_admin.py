#!/usr/bin/env python3
"""
Script to grant admin privileges to a user.

Usage:
    python scripts/grant_admin.py [email]

If no email is provided, defaults to: ruhid.ibadli@gmail.com

Run this script from the project root or backend directory.
Make sure the database is accessible and migrations are up to date.
"""

import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
if os.path.exists(backend_path):
    sys.path.insert(0, backend_path)
else:
    # Already in backend directory
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Try to import from app
try:
    from app.core.config import settings
    from app.models.user import User
    from app.core.database import Base
except ImportError:
    print("Error: Could not import app modules.")
    print("Make sure you're running this from the project root or backend directory.")
    print("Also ensure all dependencies are installed: pip install -r backend/requirements.txt")
    sys.exit(1)


def grant_admin(email: str):
    """Grant admin privileges to a user by email."""

    # Create database connection
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = SessionLocal()

    try:
        # Find user by email
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"Error: User with email '{email}' not found.")
            print("\nAvailable users:")
            users = db.query(User).all()
            for u in users[:10]:  # Show first 10 users
                admin_badge = " [ADMIN]" if u.is_admin else ""
                print(f"  - {u.email}{admin_badge}")
            if len(users) > 10:
                print(f"  ... and {len(users) - 10} more")
            return False

        # Check if already admin
        if user.is_admin:
            print(f"User '{email}' is already an admin.")
            return True

        # Grant admin privileges
        user.is_admin = True
        db.commit()

        print(f"Successfully granted admin privileges to '{email}'.")
        print("\nThe user can now:")
        print("  - Access the admin panel at /admin")
        print("  - View and manage all users, skills, events, and categories")
        print("  - Perform CRUD operations on all data")
        print("\nNote: The user needs to log out and log back in for changes to take effect.")

        return True

    except Exception as e:
        print(f"Error: {str(e)}")
        db.rollback()
        return False

    finally:
        db.close()


def revoke_admin(email: str):
    """Revoke admin privileges from a user by email."""

    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"Error: User with email '{email}' not found.")
            return False

        if not user.is_admin:
            print(f"User '{email}' is not an admin.")
            return True

        user.is_admin = False
        db.commit()

        print(f"Successfully revoked admin privileges from '{email}'.")
        return True

    except Exception as e:
        print(f"Error: {str(e)}")
        db.rollback()
        return False

    finally:
        db.close()


def list_admins():
    """List all admin users."""

    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = SessionLocal()

    try:
        admins = db.query(User).filter(User.is_admin == True).all()

        if not admins:
            print("No admin users found.")
            return

        print(f"Admin users ({len(admins)}):")
        for admin in admins:
            print(f"  - {admin.email} (created: {admin.created_at.strftime('%Y-%m-%d')})")

    finally:
        db.close()


if __name__ == "__main__":
    # Default email
    default_email = "ruhid.ibadli@gmail.com"

    # Parse arguments
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()

        if command == "--help" or command == "-h":
            print(__doc__)
            print("\nCommands:")
            print("  python scripts/grant_admin.py [email]     - Grant admin to user (default: ruhid.ibadli@gmail.com)")
            print("  python scripts/grant_admin.py --revoke [email] - Revoke admin from user")
            print("  python scripts/grant_admin.py --list      - List all admin users")
            sys.exit(0)

        elif command == "--list":
            list_admins()
            sys.exit(0)

        elif command == "--revoke":
            email = sys.argv[2] if len(sys.argv) > 2 else default_email
            success = revoke_admin(email)
            sys.exit(0 if success else 1)

        else:
            # Assume it's an email
            email = command
            success = grant_admin(email)
            sys.exit(0 if success else 1)
    else:
        # No arguments, use default email
        print(f"No email provided, using default: {default_email}")
        success = grant_admin(default_email)
        sys.exit(0 if success else 1)
