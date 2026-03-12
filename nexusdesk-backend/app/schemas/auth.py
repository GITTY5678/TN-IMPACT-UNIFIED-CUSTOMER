from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str
    role:     str = "agent"   # agent | customer
    company:  str | None = None

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user_id:      int
    name:         str
    role:         str
    is_approved:  bool
    customer_id:  int | None = None
