from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.user import User
from app.models.ticket import Ticket, TicketReply
from app.schemas.ticket import (
    TicketCreate, TicketResponse, TicketListResponse,
    TicketReplyCreate, TicketReplyResponse
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.get("", response_model=List[TicketListResponse])
def list_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all tickets for the current user.
    """
    tickets = db.query(Ticket).filter(
        Ticket.user_id == current_user.id
    ).order_by(Ticket.updated_at.desc()).all()

    result = []
    for ticket in tickets:
        reply_count = db.query(func.count(TicketReply.id)).filter(
            TicketReply.ticket_id == ticket.id
        ).scalar()
        result.append(TicketListResponse(
            id=ticket.id,
            user_id=ticket.user_id,
            subject=ticket.subject,
            status=ticket.status,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
            reply_count=reply_count
        ))

    return result


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new support ticket.
    """
    new_ticket = Ticket(
        user_id=current_user.id,
        subject=ticket_data.subject,
        message=ticket_data.message,
        status="open"
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific ticket by ID.
    """
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.user_id == current_user.id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    return ticket


@router.post("/{ticket_id}/replies", response_model=TicketReplyResponse, status_code=status.HTTP_201_CREATED)
def add_reply(
    ticket_id: UUID,
    reply_data: TicketReplyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a reply to a ticket.
    """
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.user_id == current_user.id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    if ticket.status == "closed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reply to a closed ticket"
        )

    new_reply = TicketReply(
        ticket_id=ticket_id,
        user_id=current_user.id,
        message=reply_data.message,
        is_admin_reply=False
    )

    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)

    return new_reply
