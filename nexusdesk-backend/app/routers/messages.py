from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_user
from app.schemas.message import MessageCreate, MessageOut
from app.services.message_service import add_message, get_messages
from app.models.user import User

router = APIRouter(prefix="/tickets/{ticket_id}/messages", tags=["Messages"])

@router.get("/", response_model=List[MessageOut])
def list_messages(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_messages(ticket_id, db)

@router.post("/", response_model=MessageOut)
def send_message(
    ticket_id: int,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return add_message(ticket_id, data, current_user.id, db)
