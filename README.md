# NexusDesk v2 — Full Stack Setup

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd nexusdesk-backend
python -m venv venv
.\venv\Scripts\Activate         # Windows
# source venv/bin/activate      # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file (copy from `.env.example`):
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/nexusdesk
JWT_SECRET=supersecretkey123
CLAUDE_API_KEY=your-claude-api-key   # optional
```

Create the database in pgAdmin: name it `nexusdesk`

Run the server:
```bash
uvicorn app.main:app --reload
# → http://127.0.0.1:8000
```

The server auto-creates all tables and seeds admin on first run.

**Admin credentials:** `admin@nexusdesk.in` / `nexusdesk123`

---

### 2. Frontend Setup

```bash
cd nexusdesk-frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🛠️ Dev Mode

Click the faint **🛠️** button in the bottom-left corner of the login page.
- Choose role: admin / agent / customer
- Enter any email & name
- Click "Enter as [role]" — bypasses real auth entirely

---

## 📋 Features

### Customer Portal
- Register / Login
- File complaints with full details:
  - Issue type (delay, damage, wrong item, missing, etc.)
  - Order ID & Shipment/Tracking ID
  - Origin & Destination
  - Shipment status & ETA
  - Incident date
- 2-step complaint form
- Track complaint status

### Agent Dashboard
- View all tickets with filters (status, priority, issue type)
- Open ticket detail with full shipment info
- Reply to customers
- Update ticket status
- AI Summary & Reply Suggestion (Claude)

### Admin
- Everything agents can do
- Approve / reject pending agent registrations

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login |
| GET | /tickets/ | All tickets |
| GET | /tickets/my | Customer's tickets |
| POST | /tickets/ | Create ticket |
| PATCH | /tickets/{id} | Update ticket |
| GET | /tickets/{id}/messages/ | Get messages |
| POST | /tickets/{id}/messages/ | Send message |
| GET | /customers/ | All customers |
| GET | /agents/pending | Pending agents |
| POST | /agents/{id}/approve | Approve agent |
| GET | /ai/summary/{id} | AI ticket summary |
| GET | /ai/suggest/{id} | AI reply suggestion |
