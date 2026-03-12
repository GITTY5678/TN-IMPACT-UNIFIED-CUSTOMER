from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TicketCreate(BaseModel):
    subject:          str
    description:      Optional[str] = None
    channel:          str = "web"
    issue_type:       Optional[str] = None
    order_id:         Optional[str] = None
    shipment_id:      Optional[str] = None
    shipment_origin:  Optional[str] = None
    shipment_dest:    Optional[str] = None
    shipment_status:  Optional[str] = None
    shipment_eta:     Optional[str] = None
    incident_date:    Optional[str] = None
    customer_id:      Optional[int] = None

class TicketUpdate(BaseModel):
    status:           Optional[str] = None
    priority:         Optional[str] = None
    priority_reason:  Optional[str] = None
    agent_id:         Optional[int] = None
    shipment_status:  Optional[str] = None
    shipment_eta:     Optional[str] = None

class CustomerOut(BaseModel):
    id:    int
    name:  str
    email: str
    class Config:
        from_attributes = True

class AgentOut(BaseModel):
    id:   int
    name: str
    class Config:
        from_attributes = True

class TicketOut(BaseModel):
    id:               int
    subject:          str
    description:      Optional[str]
    status:           str
    priority:         str
    channel:          str
    issue_type:       Optional[str]
    order_id:         Optional[str]
    shipment_id:      Optional[str]
    shipment_origin:  Optional[str]
    shipment_dest:    Optional[str]
    shipment_status:  Optional[str]
    shipment_eta:     Optional[str]
    incident_date:    Optional[str]
    priority_reason:  Optional[str] = None
    customer_id:      Optional[int]
    agent_id:         Optional[int]
    customer:         Optional[CustomerOut]
    agent:            Optional[AgentOut]
    created_at:       datetime
    updated_at:       datetime

    class Config:
        from_attributes = True
