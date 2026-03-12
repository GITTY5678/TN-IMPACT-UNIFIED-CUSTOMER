from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.customer import Customer
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token

def register_user(req: RegisterRequest, db: Session) -> dict:
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=req.name,
        email=req.email,
        hashed_password=hash_password(req.password),
        role=req.role,
        company=req.company,
        is_approved=True if req.role == "customer" else False,
    )
    db.add(user)
    db.flush()

    customer_id = None
    if req.role == "customer":
        customer = Customer(
            user_id=user.id,
            name=req.name,
            email=req.email,
            company=req.company,
        )
        db.add(customer)
        db.flush()
        customer_id = customer.id

    db.commit()
    db.refresh(user)
    return {"message": "Registered successfully", "role": req.role, "customer_id": customer_id}


def login_user(req: LoginRequest, db: Session) -> TokenResponse:
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    customer_id = None
    if user.role == "customer":
        customer = db.query(Customer).filter(Customer.user_id == user.id).first()
        customer_id = customer.id if customer else None

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        role=user.role,
        is_approved=user.is_approved,
        customer_id=customer_id,
    )
