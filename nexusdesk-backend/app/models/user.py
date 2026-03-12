from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String, nullable=False)
    email           = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role            = Column(String, default="agent")   # admin | agent | customer
    is_approved     = Column(Boolean, default=False)    # agents need admin approval
    company         = Column(String, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)

    # relationships
    tickets_assigned = relationship("Ticket", foreign_keys="Ticket.agent_id", back_populates="agent")
    messages         = relationship("Message", back_populates="sender")
