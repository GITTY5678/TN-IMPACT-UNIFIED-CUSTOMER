from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.ticket import Ticket
from app.models.customer import Customer
from app.schemas.ticket import TicketCreate, TicketUpdate
from datetime import datetime

from app.models.customer import Customer
from datetime import datetime

def auto_assign_priority(issue_type: str, shipment_eta: str = None) -> str:
    if issue_type in ["damage", "missing"]:
        return "high"
    if issue_type in ["wrong_item", "wrong_address"]:
        return "medium"
    if issue_type == "delay":
        if shipment_eta:
            try:
                eta = datetime.strptime(shipment_eta, "%Y-%m-%d")
                return "medium" if eta < datetime.now() else "low"
            except:
                return "medium"
        return "medium"
    return "low"

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
        priority=auto_assign_priority(data.issue_type, data.shipment_eta),
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


def update_ticket(ticket_id, data, db, current_user):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if data.priority and data.priority != ticket.priority:
        if not data.priority_reason:
            raise HTTPException(400, "A reason is required to change priority")
    if data.priority:
        ticket.priority = data.priority
    if data.status:
        ticket.status = data.status
    db.commit()
    db.refresh(ticket)
    return ticket
