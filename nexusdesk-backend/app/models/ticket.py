from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id          = Column(Integer, primary_key=True, index=True)

    # Core
    subject     = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status      = Column(String, default="open")      # open | in_progress | resolved | closed
    priority    = Column(String, default="medium")    # low | medium | high
    channel     = Column(String, default="web")       # web | email | phone | whatsapp

    # Complaint details
    issue_type        = Column(String, nullable=True)   # delay | damage | wrong_item | missing | other
    order_id          = Column(String, nullable=True)
    shipment_id       = Column(String, nullable=True)
    shipment_origin   = Column(String, nullable=True)
    shipment_dest     = Column(String, nullable=True)
    shipment_status   = Column(String, nullable=True)
    shipment_eta      = Column(String, nullable=True)
    incident_date     = Column(String, nullable=True)

    # Relations
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    agent_id    = Column(Integer, ForeignKey("users.id"),     nullable=True)

    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer  = relationship("Customer", back_populates="tickets")
    agent     = relationship("User", foreign_keys=[agent_id], back_populates="tickets_assigned")
    messages  = relationship("Message", back_populates="ticket", cascade="all, delete-orphan")
