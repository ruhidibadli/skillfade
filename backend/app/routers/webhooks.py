"""Inbound webhooks. The gateway hub posts a signed payment result here.

This endpoint is intentionally UNAUTHENTICATED (the hub calls it server-to-server);
authenticity is enforced by verifying the hub signature, never by a JWT.
"""
import logging

from fastapi import APIRouter, Depends, Form, HTTPException
from sqlalchemy.orm import Session

from app.core import gateway
from app.core.database import get_db
from app.models.subscription import Subscription
from app.services import billing as billing_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])


@router.post("/epoint")
def epoint_webhook(
    data: str = Form(...),
    signature: str = Form(...),
    db: Session = Depends(get_db),
):
    """Receive a signed payment result from the gateway hub and grant/deny PRO."""
    if not gateway.verify_webhook_signature(data, signature):
        logger.warning("Gateway webhook: invalid signature")
        raise HTTPException(status_code=400, detail="invalid signature")

    try:
        payload = gateway.decode(data)
    except ValueError:
        raise HTTPException(status_code=400, detail="bad payload")

    order_id = payload.get("order_id")
    sub = db.query(Subscription).filter(Subscription.order_id == order_id).first()
    if not sub:
        logger.warning("Gateway webhook: unknown order_id %s", order_id)
        raise HTTPException(status_code=404, detail="unknown order")

    if payload.get("status") == "success":
        billing_service.activate_subscription(sub, payload)
    else:
        billing_service.fail_subscription(sub)
    db.commit()

    logger.info("Gateway webhook processed order_id=%s status=%s", order_id, sub.status)
    return {"status": "ok"}
