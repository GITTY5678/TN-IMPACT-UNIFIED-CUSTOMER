from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.ticket_service import get_ticket
from app.services.message_service import get_messages
from app.services.ai_service import get_ticket_summary, get_ai_reply_suggestion

router = APIRouter(prefix="/ai", tags=["AI"])

@router.get("/summary/{ticket_id}")
def ticket_summary(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket(ticket_id, db)
    messages = get_messages(ticket_id, db)
    summary = get_ticket_summary(ticket, messages)
    return {"summary": summary}

@router.get("/suggest/{ticket_id}")
def reply_suggestion(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket(ticket_id, db)
    messages = get_messages(ticket_id, db)
    suggestion = get_ai_reply_suggestion(ticket, messages)
    return {"suggestion": suggestion}
