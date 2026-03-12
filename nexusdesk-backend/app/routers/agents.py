from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_user, get_admin_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/agents", tags=["Agents"])

class AgentOut(BaseModel):
    id:          int
    name:        str
    email:       str
    role:        str
    is_approved: bool
    class Config:
        from_attributes = True

@router.get("/", response_model=List[AgentOut])
def list_agents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(User).filter(User.role == "agent").all()

@router.get("/pending", response_model=List[AgentOut])
def pending_agents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    return db.query(User).filter(User.role == "agent", User.is_approved == False).all()

@router.post("/{user_id}/approve")
def approve_agent(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    agent = db.query(User).filter(User.id == user_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.is_approved = True
    db.commit()
    return {"message": f"{agent.name} approved"}

@router.post("/{user_id}/reject")
def reject_agent(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    agent = db.query(User).filter(User.id == user_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    db.delete(agent)
    db.commit()
    return {"message": "Agent rejected and removed"}
