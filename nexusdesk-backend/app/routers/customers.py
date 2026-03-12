from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_user
from app.models.customer import Customer
from app.models.user import User
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/customers", tags=["Customers"])

class CustomerOut(BaseModel):
    id:            int
    name:          str
    email:         str
    phone:         str | None
    company:       str | None
    total_tickets: int
    ltv:           float
    created_at:    datetime
    class Config:
        from_attributes = True

@router.get("/", response_model=List[CustomerOut])
def list_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Customer).order_by(Customer.created_at.desc()).all()

@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Customer not found")
    return c
