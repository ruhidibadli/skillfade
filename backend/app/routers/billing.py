import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core import gateway
from app.core.config import settings
from app.core.database import get_db
from app.models.subscription import Subscription
from app.models.user import User
from app.services import billing as billing_service
from app.services.auth import get_current_user
from app.services.entitlements import get_user_plan

logger = logging.getLogger(__name__)

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


@router.get("/pricing")
def get_pricing(db: Session = Depends(get_db)):
    """Public: the current lifetime price, for the pricing page."""
    return {
        "lifetime_price_azn": str(billing_service.effective_lifetime_price(db)),
        "currency": "AZN",
    }


@router.post("/checkout")
def create_checkout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Start a Lifetime PRO purchase via the shared gateway; return the redirect URL."""
    if get_user_plan(current_user, db).is_pro:
        raise HTTPException(status_code=400, detail={"error": "already_pro"})

    price = billing_service.effective_lifetime_price(db)
    try:
        result = gateway.create_checkout(
            amount=price,
            client_reference=str(current_user.id),
            description="SkillFade Lifetime PRO",
            success_url=settings.EPOINT_SUCCESS_URL,
            error_url=settings.EPOINT_ERROR_URL,
        )
    except Exception:
        logger.exception("Gateway checkout failed for user %s", current_user.id)
        raise HTTPException(status_code=502, detail={"error": "gateway_unavailable"})

    order_id = result["order_id"]
    sub = Subscription(
        user_id=current_user.id, plan="lifetime", status="pending",
        provider="epoint", order_id=order_id, amount=price, currency="AZN",
    )
    db.add(sub)
    db.commit()
    return {"redirect_url": result["redirect_url"], "order_id": order_id}


@router.get("/status")
def checkout_status(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Authoritative status of the caller's payment; reconciles a pending order with the hub."""
    sub = db.query(Subscription).filter(
        Subscription.order_id == order_id,
        Subscription.user_id == current_user.id,
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="unknown order")

    if sub.status == "pending":
        try:
            hub = gateway.get_status(order_id)
        except Exception:
            hub = None
        if hub:
            if hub.get("status") == "success":
                billing_service.activate_subscription(sub, hub)
                db.commit()
            elif hub.get("status") in ("failed", "error"):
                billing_service.fail_subscription(sub)
                db.commit()

    return {
        "order_id": order_id,
        "status": sub.status,
        "is_pro": get_user_plan(current_user, db).is_pro,
    }
