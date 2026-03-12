from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketOut
from app.services.ticket_service import (
    create_ticket, get_all_tickets, get_my_tickets, get_ticket, update_ticket
)
from app.models.user import User

router = APIRouter(prefix="/tickets", tags=["Tickets"])

# IMPORTANT: /my must come before /{ticket_id}
@router.get("/my", response_model=List[TicketOut])
def my_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_my_tickets(current_user.id, db)

@router.get("/", response_model=List[TicketOut])
def list_tickets(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_tickets(db, status=status, priority=priority)

@router.post("/", response_model=TicketOut)
def new_ticket(
    data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_ticket(data, db, current_user)

@router.get("/{ticket_id}", response_model=TicketOut)
def get_one(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_ticket(ticket_id, db)

@router.patch("/{ticket_id}", response_model=TicketOut)
def update_one(
    ticket_id: int,
    data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_ticket(ticket_id, data, db)
