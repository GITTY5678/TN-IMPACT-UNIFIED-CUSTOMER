from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MessageCreate(BaseModel):
    content:     str
    sender_type: str = "agent"  # agent | customer

class MessageOut(BaseModel):
    id:          int
    ticket_id:   int
    sender_id:   Optional[int]
    sender_type: str
    content:     str
    created_at:  datetime

    class Config:
        from_attributes = True
