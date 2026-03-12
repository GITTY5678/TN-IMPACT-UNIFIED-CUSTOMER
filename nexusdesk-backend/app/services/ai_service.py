import anthropic
from app.core.config import settings

def get_ticket_summary(ticket, messages) -> str:
    if not settings.CLAUDE_API_KEY:
        return "AI summary unavailable — CLAUDE_API_KEY not configured."

    client = anthropic.Anthropic(api_key=settings.CLAUDE_API_KEY)

    msg_text = "\n".join([f"[{m.sender_type.upper()}]: {m.content}" for m in messages])

    prompt = f"""You are a support team assistant. Summarize this customer complaint ticket concisely.

Ticket: {ticket.subject}
Issue Type: {ticket.issue_type or 'Not specified'}
Order ID: {ticket.order_id or 'N/A'}
Shipment ID: {ticket.shipment_id or 'N/A'}
Description: {ticket.description or 'No description'}
Status: {ticket.status}
Priority: {ticket.priority}

Conversation:
{msg_text or 'No messages yet.'}

Provide:
1. One-line summary of the complaint
2. Current status assessment
3. Recommended next action for the agent"""

    response = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text


def get_ai_reply_suggestion(ticket, messages) -> str:
    if not settings.CLAUDE_API_KEY:
        return "AI suggestions unavailable — CLAUDE_API_KEY not configured."

    client = anthropic.Anthropic(api_key=settings.CLAUDE_API_KEY)

    msg_text = "\n".join([f"[{m.sender_type.upper()}]: {m.content}" for m in messages[-5:]])

    prompt = f"""You are a helpful customer support agent for a logistics company. 
Draft a professional, empathetic reply to this customer complaint.

Issue: {ticket.subject}
Type: {ticket.issue_type or 'general'}
Description: {ticket.description or ''}

Recent conversation:
{msg_text or 'No messages yet.'}

Write a short, helpful reply (2-3 sentences max). Be empathetic and solution-focused."""

    response = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text
