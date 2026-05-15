from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.services.auth import get_current_user
from app.services.entitlements import get_user_plan


router = APIRouter(prefix="/api/billing", tags=["Billing"])


@router.get("/me")
def get_my_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Current user's plan + entitlements. Used by frontend PlanContext."""
    info = get_user_plan(current_user, db)
    return {
        "plan": info.plan,
        "is_pro": info.is_pro,
        "status": info.status,
        "purchased_at": info.purchased_at,
        "refunded_at": info.refunded_at,
        "amount": info.amount,
        "currency": info.currency,
        "limits": info.limits,
    }
