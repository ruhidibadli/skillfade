#!/usr/bin/env python3
"""
Grant admin privileges to a user.

Usage inside Docker:
    docker exec skillfade_backend python grant_admin.py user@email.com
    docker exec skillfade_backend python grant_admin.py --list
    docker exec skillfade_backend python grant_admin.py --revoke user@email.com
"""

import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.user import User


def get_db():
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


def grant_admin(email: str):
    db = get_db()
    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"Error: User '{email}' not found.")
            print("\nRegistered users:")
            for u in db.query(User).limit(10).all():
                badge = " [ADMIN]" if u.is_admin else ""
                print(f"  - {u.email}{badge}")
            return False

        if user.is_admin:
            print(f"User '{email}' is already an admin.")
            return True

        user.is_admin = True
        db.commit()
        print(f"Admin privileges granted to '{email}'.")
        print("User needs to log out and back in for changes to take effect.")
        return True
    finally:
        db.close()


def revoke_admin(email: str):
    db = get_db()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Error: User '{email}' not found.")
            return False
        user.is_admin = False
        db.commit()
        print(f"Admin privileges revoked from '{email}'.")
        return True
    finally:
        db.close()


def list_admins():
    db = get_db()
    try:
        admins = db.query(User).filter(User.is_admin == True).all()
        if not admins:
            print("No admin users found.")
        else:
            print(f"Admin users ({len(admins)}):")
            for a in admins:
                print(f"  - {a.email}")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python grant_admin.py <email>           - Grant admin")
        print("  python grant_admin.py --revoke <email>  - Revoke admin")
        print("  python grant_admin.py --list            - List admins")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "--list":
        list_admins()
    elif cmd == "--revoke":
        if len(sys.argv) < 3:
            print("Error: Email required")
            sys.exit(1)
        revoke_admin(sys.argv[2])
    elif cmd == "--help" or cmd == "-h":
        print(__doc__)
    else:
        grant_admin(cmd)
