from app.db.session import engine, SessionLocal
from app.db.base import Base

# Import ALL models so SQLAlchemy registers them
from app.models.user import User
from app.models.customer import Customer
from app.models.ticket import Ticket
from app.models.message import Message

from app.core.security import hash_password

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed admin if not exists
        existing = db.query(User).filter(User.email == "admin@nexusdesk.in").first()
        if not existing:
            admin = User(
                name="Admin",
                email="admin@nexusdesk.in",
                hashed_password=hash_password("nexusdesk123"),
                role="admin",
                is_approved=True,
            )
            db.add(admin)
            db.commit()
            print("✅ Admin user seeded: admin@nexusdesk.in / nexusdesk123")
        else:
            # Ensure existing admin has correct role and approval
            if existing.role != "admin" or not existing.is_approved:
                existing.role = "admin"
                existing.is_approved = True
                db.commit()
                print("✅ Admin user updated")
    finally:
        db.close()
