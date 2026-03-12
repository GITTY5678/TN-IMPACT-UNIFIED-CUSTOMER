from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.ticket import Ticket
from app.models.customer import Customer
from app.schemas.ticket import TicketCreate, TicketUpdate
from datetime import datetime

from app.models.customer import Customer

def create_ticket(data, db, current_user):
    customer_id = data.customer_id

    # Auto-resolve customer_id from logged-in customer user
    if not customer_id and current_user.role == "customer":
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if customer:
            customer_id = customer.id

    if not customer_id:
        raise HTTPException(status_code=400, detail="Could not resolve customer for this ticket")

    ticket = Ticket(
        subject=data.subject,
        description=data.description,
        status="open",
        priority=data.priority,
        channel=data.channel,
        issue_type=data.issue_type,
        order_id=data.order_id,
        shipment_id=data.shipment_id,
        shipment_origin=data.shipment_origin,
        shipment_dest=data.shipment_dest,
        shipment_status=data.shipment_status,
        shipment_eta=data.shipment_eta,
        incident_date=data.incident_date,
        customer_id=customer_id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def get_all_tickets(db: Session, status=None, priority=None):
    q = db.query(Ticket)
    if status:
        q = q.filter(Ticket.status == status)
    if priority:
        q = q.filter(Ticket.priority == priority)
    return q.order_by(Ticket.created_at.desc()).all()


def get_my_tickets(user_id: int, db: Session):
    customer = db.query(Customer).filter(Customer.user_id == user_id).first()
    if not customer:
        return []
    return db.query(Ticket).filter(Ticket.customer_id == customer.id).order_by(Ticket.created_at.desc()).all()


def get_ticket(ticket_id: int, db: Session) -> Ticket:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


def update_ticket(ticket_id: int, data: TicketUpdate, db: Session) -> Ticket:
    ticket = get_ticket(ticket_id, db)
    for field, val in data.model_dump(exclude_none=True).items():
        setattr(ticket, field, val)
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return ticket
