from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Message(Base):
    __tablename__ = "messages"

    id          = Column(Integer, primary_key=True, index=True)
    ticket_id   = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    sender_id   = Column(Integer, ForeignKey("users.id"),   nullable=True)
    sender_type = Column(String, default="agent")   # agent | customer | system
    content     = Column(Text, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="messages")
    sender = relationship("User", back_populates="messages")
