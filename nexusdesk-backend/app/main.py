from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.init_db import init_db
from app.routers import auth, tickets, messages, agents, customers, ai

app = FastAPI(title="NexusDesk API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    print("🚀 NexusDesk API v2 is running!")

app.include_router(auth.router)
app.include_router(tickets.router)
app.include_router(messages.router)
app.include_router(agents.router)
app.include_router(customers.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "NexusDesk API v2"}

@app.get("/health")
def health():
    return {"status": "healthy"}
