import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const badge = (val, type='status') => {
  const statusMap = { open:'#2563eb', in_progress:'#d97706', resolved:'#16a34a', closed:'#6b7280' }
  const priorityMap = { high:'#dc2626', medium:'#d97706', low:'#16a34a' }
  const map = type==='priority' ? priorityMap : statusMap
  const color = map[val] || '#6b7280'
  return { background:color+'18', color, padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600, textTransform:'capitalize' }
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [aiSummary, setAiSummary] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)

  const fetchData = async () => {
    const [t, m] = await Promise.all([
      api.get(`/tickets/${id}`),
      api.get(`/tickets/${id}/messages/`),
    ])
    setTicket(t.data)
    setMessages(m.data)
  }

  useEffect(() => { fetchData() }, [id])

  const sendMessage = async () => {
    if (!reply.trim()) return
    setSending(true)
    try {
      await api.post(`/tickets/${id}/messages/`, { content: reply, sender_type: user?.role === 'customer' ? 'customer' : 'agent' })
      setReply('')
      fetchData()
    } finally { setSending(false) }
  }

  const updateStatus = async (status) => {
    await api.patch(`/tickets/${id}`, { status })
    fetchData()
  }

  const getAISummary = async () => {
    setLoadingAI(true)
    try { const r = await api.get(`/ai/summary/${id}`); setAiSummary(r.data.summary) }
    catch { setAiSummary('AI summary unavailable.') }
    finally { setLoadingAI(false) }
  }

  const getAISuggestion = async () => {
    setLoadingAI(true)
    try { const r = await api.get(`/ai/suggest/${id}`); setAiSuggestion(r.data.suggestion) }
    catch { setAiSuggestion('AI suggestion unavailable.') }
    finally { setLoadingAI(false) }
  }

  if (!ticket) return <div style={{ padding:48, textAlign:'center', color:'var(--color-text-muted)' }}>Loading...</div>

  return (
    <div>
      <button onClick={() => navigate('/tickets')} style={{ background:'none', border:'none', color:'var(--color-text-secondary)', fontSize:13, cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', gap:6 }}>← Back to Tickets</button>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        {/* Left */}
        <div>
          {/* Ticket header */}
          <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14, padding:24, marginBottom:16 }}>
            <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap' }}>
              <span style={badge(ticket.status)}>{ticket.status.replace('_',' ')}</span>
              <span style={badge(ticket.priority,'priority')}>{ticket.priority}</span>
              {ticket.issue_type && <span style={{ ...badge('open'), background:'#f3f4f6', color:'#374151' }}>{ticket.issue_type.replace('_',' ')}</span>}
            </div>
            <h1 style={{ fontSize:20, fontWeight:700, marginBottom:10 }}>{ticket.subject}</h1>
            {ticket.description && <p style={{ fontSize:14, color:'var(--color-text-secondary)', lineHeight:1.6 }}>{ticket.description}</p>}

            {/* Shipment info */}
            {(ticket.order_id || ticket.shipment_id) && (
              <div style={{ marginTop:16, padding:'14px 16px', background:'var(--color-bg)', borderRadius:10, display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px 24px', fontSize:13 }}>
                {[
                  ['📋 Order ID', ticket.order_id],
                  ['📦 Shipment ID', ticket.shipment_id],
                  ['🚀 Origin', ticket.shipment_origin],
                  ['📍 Destination', ticket.shipment_dest],
                  ['🔄 Shipment Status', ticket.shipment_status],
                  ['🕐 ETA', ticket.shipment_eta],
                  ['📅 Incident Date', ticket.incident_date],
                ].filter(([,v])=>v).map(([label,value]) => (
                  <div key={label}><span style={{ color:'var(--color-text-muted)' }}>{label}: </span><span style={{ fontWeight:500 }}>{value}</span></div>
                ))}
              </div>
            )}

            <div style={{ marginTop:14, fontSize:12, color:'var(--color-text-muted)' }}>
              Customer: {ticket.customer?.name || '—'} · Created: {new Date(ticket.created_at).toLocaleString()}
            </div>
          </div>

          {/* AI Panel */}
          <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', border:'1px solid #4338ca', borderRadius:14, padding:20, marginBottom:16, color:'#e0e7ff' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <span style={{ fontSize:18 }}>✨</span>
              <span style={{ fontWeight:700, fontSize:15 }}>AI Assistant</span>
              <span style={{ fontSize:12, opacity:0.6, marginLeft:'auto' }}>Powered by Claude</span>
            </div>
            <div style={{ display:'flex', gap:10, marginBottom:14 }}>
              <button onClick={getAISummary} disabled={loadingAI} style={{ padding:'7px 14px', borderRadius:8, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#e0e7ff', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
                📋 Summarize
              </button>
              <button onClick={getAISuggestion} disabled={loadingAI} style={{ padding:'7px 14px', borderRadius:8, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#e0e7ff', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
                💬 Suggest Reply
              </button>
            </div>
            {loadingAI && <div style={{ fontSize:13, opacity:0.7 }}>Thinking...</div>}
            {aiSummary && <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:'pre-wrap', background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'12px 14px', marginBottom:aiSuggestion?10:0 }}>{aiSummary}</div>}
            {aiSuggestion && (
              <div style={{ fontSize:13, lineHeight:1.6, background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'12px 14px' }}>
                <div style={{ opacity:0.6, fontSize:11, marginBottom:6 }}>SUGGESTED REPLY</div>
                {aiSuggestion}
                <button onClick={() => setReply(aiSuggestion)} style={{ marginTop:8, display:'block', fontSize:12, color:'#a5b4fc', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-sans)' }}>Use this reply →</button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14, padding:20 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Conversation</h3>
            {messages.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', color:'var(--color-text-muted)', fontSize:14 }}>No messages yet. Start the conversation.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
                {messages.map(m => (
                  <div key={m.id} style={{ display:'flex', flexDirection:m.sender_type==='customer'?'row-reverse':'row', gap:10 }}>
                    <div style={{ width:30, height:30, borderRadius:'50%', background:m.sender_type==='customer'?'#dcfce7':m.sender_type==='agent'?'#dbeafe':'#f3e8ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>
                      {m.sender_type==='customer'?'🙋':m.sender_type==='agent'?'🧑‍💼':'🤖'}
                    </div>
                    <div style={{ maxWidth:'75%' }}>
                      <div style={{ fontSize:11, color:'var(--color-text-muted)', marginBottom:4, textTransform:'capitalize', textAlign:m.sender_type==='customer'?'right':'left' }}>
                        {m.sender_type} · {new Date(m.created_at).toLocaleTimeString()}
                      </div>
                      <div style={{ background:m.sender_type==='customer'?'#f0fdf4':m.sender_type==='agent'?'var(--color-accent-light)':'#faf5ff', border:`1px solid ${m.sender_type==='customer'?'#bbf7d0':m.sender_type==='agent'?'#bfdbfe':'#e9d5ff'}`, borderRadius:10, padding:'10px 14px', fontSize:14, lineHeight:1.5 }}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply box */}
            <div style={{ borderTop:'1px solid var(--color-border)', paddingTop:16 }}>
              <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply..."
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--color-border)', borderRadius:10, fontSize:14, resize:'vertical', minHeight:80, outline:'none', fontFamily:'var(--font-sans)', background:'var(--color-bg)' }} />
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:10 }}>
                <button onClick={sendMessage} disabled={sending||!reply.trim()}
                  style={{ padding:'9px 22px', background:'var(--color-accent)', color:'#fff', border:'none', borderRadius:9, fontSize:14, fontWeight:600, cursor:'pointer', opacity:(!reply.trim()||sending)?0.5:1 }}>
                  {sending?'Sending...':'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:12, padding:18 }}>
            <h4 style={{ fontSize:13, fontWeight:700, marginBottom:12, color:'var(--color-text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Update Status</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {['open','in_progress','resolved','closed'].map(s => (
                <button key={s} onClick={() => updateStatus(s)} style={{ padding:'8px 12px', borderRadius:8, border:`1px solid ${ticket.status===s?'var(--color-accent)':'var(--color-border)'}`, background:ticket.status===s?'var(--color-accent-light)':'transparent', color:ticket.status===s?'var(--color-accent)':'var(--color-text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer', textTransform:'capitalize', textAlign:'left', fontFamily:'var(--font-sans)' }}>
                  {s.replace('_',' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:12, padding:18 }}>
            <h4 style={{ fontSize:13, fontWeight:700, marginBottom:12, color:'var(--color-text-secondary)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Details</h4>
            {[
              ['Customer', ticket.customer?.name || '—'],
              ['Channel', ticket.channel],
              ['Priority', ticket.priority],
              ['Created', new Date(ticket.created_at).toLocaleDateString()],
              ['Updated', new Date(ticket.updated_at).toLocaleDateString()],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:10, fontSize:13 }}>
                <span style={{ color:'var(--color-text-muted)' }}>{k}</span>
                <span style={{ fontWeight:500, textTransform:'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
