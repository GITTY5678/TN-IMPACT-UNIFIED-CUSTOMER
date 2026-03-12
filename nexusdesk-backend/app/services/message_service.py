from sqlalchemy.orm import Session
from app.models.message import Message
from app.schemas.message import MessageCreate

def add_message(ticket_id: int, data: MessageCreate, sender_id: int, db: Session) -> Message:
    msg = Message(
        ticket_id=ticket_id,
        sender_id=sender_id,
        sender_type=data.sender_type,
        content=data.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def get_messages(ticket_id: int, db: Session):
    return db.query(Message).filter(Message.ticket_id == ticket_id).order_by(Message.created_at.asc()).all()
