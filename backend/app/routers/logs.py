from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.activity_log import (
    ActivityLogCreate,
    ActivityLogResponse,
    AdminActivityLogResponse,
    ActivityLogStats,
    BulkDeleteRequest
)
from app.services.auth import get_optional_current_user, get_current_admin_user

router = APIRouter(prefix="/api", tags=["Activity Logs"])


@router.post("/logs", response_model=ActivityLogResponse, status_code=status.HTTP_201_CREATED)
async def create_log(
    log_data: ActivityLogCreate,
    request: Request,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Create a new activity log. Works for both authenticated and anonymous users."""
    # Get client info
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:500]  # Truncate if too long

    new_log = ActivityLog(
        user_id=current_user.id if current_user else None,
        session_id=log_data.session_id,
        action_type=log_data.action_type,
        page=log_data.page,
        details=log_data.details or {},
        ip_address=client_ip,
        user_agent=user_agent
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log


# Admin endpoints
@router.get("/admin/logs", response_model=dict)
async def list_logs(
    page: int = 1,
    page_size: int = 20,
    action_type: Optional[str] = None,
    anonymous_only: bool = False,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """List all activity logs with pagination and filtering. Admin only."""
    query = db.query(ActivityLog)

    # Apply filters
    if action_type:
        query = query.filter(ActivityLog.action_type == action_type)

    if anonymous_only:
        query = query.filter(ActivityLog.user_id.is_(None))

    if start_date:
        query = query.filter(ActivityLog.created_at >= start_date)

    if end_date:
        query = query.filter(ActivityLog.created_at <= end_date)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    logs = query.order_by(desc(ActivityLog.created_at)).offset(offset).limit(page_size).all()

    # Enrich with user emails
    enriched_logs = []
    for log in logs:
        log_dict = {
            "id": log.id,
            "user_id": log.user_id,
            "session_id": log.session_id,
            "action_type": log.action_type,
            "page": log.page,
            "details": log.details,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "created_at": log.created_at,
            "user_email": log.user.email if log.user else None
        }
        enriched_logs.append(log_dict)

    return {
        "items": enriched_logs,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/admin/logs/stats", response_model=ActivityLogStats)
async def get_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get activity log statistics. Admin only."""
    # Total logs
    total_logs = db.query(func.count(ActivityLog.id)).scalar()

    # Unique users (excluding anonymous)
    unique_users = db.query(func.count(func.distinct(ActivityLog.user_id))).filter(
        ActivityLog.user_id.isnot(None)
    ).scalar()

    # Unique sessions
    unique_sessions = db.query(func.count(func.distinct(ActivityLog.session_id))).scalar()

    # Logs in last 24 hours
    last_24h = datetime.now(timezone.utc) - timedelta(hours=24)
    logs_last_24h = db.query(func.count(ActivityLog.id)).filter(
        ActivityLog.created_at >= last_24h
    ).scalar()

    # Top 5 pages
    top_pages = db.query(
        ActivityLog.page,
        func.count(ActivityLog.id).label('count')
    ).filter(
        ActivityLog.page.isnot(None)
    ).group_by(
        ActivityLog.page
    ).order_by(
        desc('count')
    ).limit(5).all()

    # Top 5 actions
    top_actions = db.query(
        ActivityLog.action_type,
        func.count(ActivityLog.id).label('count')
    ).group_by(
        ActivityLog.action_type
    ).order_by(
        desc('count')
    ).limit(5).all()

    return {
        "total_logs": total_logs,
        "unique_users": unique_users,
        "unique_sessions": unique_sessions,
        "logs_last_24h": logs_last_24h,
        "top_pages": [{"page": p, "count": c} for p, c in top_pages],
        "top_actions": [{"action": a, "count": c} for a, c in top_actions]
    }


@router.delete("/admin/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_log(
    log_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a single activity log. Admin only."""
    log = db.query(ActivityLog).filter(ActivityLog.id == log_id).first()

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity log not found"
        )

    db.delete(log)
    db.commit()
    return None


@router.post("/admin/logs/bulk-delete", response_model=dict)
async def bulk_delete_logs(
    delete_request: BulkDeleteRequest,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Bulk delete activity logs by date range. Admin only."""
    if not delete_request.start_date and not delete_request.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of start_date or end_date is required"
        )

    query = db.query(ActivityLog)

    if delete_request.start_date:
        query = query.filter(ActivityLog.created_at >= delete_request.start_date)

    if delete_request.end_date:
        query = query.filter(ActivityLog.created_at <= delete_request.end_date)

    count = query.count()
    query.delete(synchronize_session=False)
    db.commit()

    return {"deleted_count": count}


@router.get("/admin/logs/action-types", response_model=list)
async def get_action_types(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get list of distinct action types. Admin only."""
    action_types = db.query(func.distinct(ActivityLog.action_type)).all()
    return [at[0] for at in action_types]
