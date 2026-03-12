import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const ISSUE_TYPES = ['delay','damage','wrong_item','missing','wrong_address','other']
const CHANNELS = ['web','email','phone','whatsapp']
const PRIORITIES = ['low','medium','high']

const badge = (status) => {
  const map = { open:'#2563eb', in_progress:'#d97706', resolved:'#16a34a', closed:'#6b7280' }
  return { background: map[status]+'18', color: map[status], padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600, textTransform:'capitalize' }
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/my')
      setTickets(res.data)
    } catch { setTickets([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTickets() }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ minHeight:'100vh', background:'var(--color-bg)', fontFamily:'var(--font-sans)' }}>
      {/* Header */}
      <header style={{ background:'var(--color-surface)', borderBottom:'1px solid var(--color-border)', padding:'14px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, background:'var(--color-accent)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13 }}>N</div>
          <span style={{ fontWeight:700, fontSize:16 }}>NexusDesk</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:14, color:'var(--color-text-secondary)' }}>Hi, {user?.name}</span>
          <button onClick={() => setShowForm(true)} style={{ padding:'8px 16px', background:'var(--color-accent)', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + New Complaint
          </button>
          <button onClick={handleLogout} style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--color-border)', borderRadius:8, fontSize:13, color:'var(--color-text-secondary)', cursor:'pointer' }}>
            Sign out
          </button>
        </div>
      </header>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'32px 24px' }}>
        <h1 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>My Complaints</h1>
        <p style={{ color:'var(--color-text-secondary)', fontSize:14, marginBottom:24 }}>Track all your submitted complaints below.</p>

        {loading ? (
          <div style={{ textAlign:'center', padding:48, color:'var(--color-text-muted)' }}>Loading...</div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign:'center', padding:64, background:'var(--color-surface)', borderRadius:16, border:'1px solid var(--color-border)' }}>
            <div style={{ fontSize:48, marginBottom:14 }}>📭</div>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>No complaints yet</h3>
            <p style={{ color:'var(--color-text-secondary)', fontSize:14, marginBottom:20 }}>Submit your first complaint and we'll get right on it.</p>
            <button onClick={() => setShowForm(true)} style={{ padding:'10px 22px', background:'var(--color-accent)', color:'#fff', border:'none', borderRadius:9, fontSize:14, fontWeight:600, cursor:'pointer' }}>
              File a Complaint
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {tickets.map(t => (
              <div key={t.id} style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:12, padding:'18px 22px', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <span style={{ fontSize:13, color:'var(--color-text-muted)', fontFamily:'var(--font-mono)' }}>#{t.id}</span>
                      <span style={badge(t.status)}>{t.status.replace('_',' ')}</span>
                      <span style={{ fontSize:12, color:'var(--color-text-muted)', textTransform:'capitalize', background:'var(--color-bg)', padding:'2px 8px', borderRadius:20, border:'1px solid var(--color-border)' }}>{t.issue_type || 'general'}</span>
                    </div>
                    <div style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>{t.subject}</div>
                    {t.description && <div style={{ fontSize:13, color:'var(--color-text-secondary)', lineHeight:1.5 }}>{t.description}</div>}
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>{new Date(t.created_at).toLocaleDateString()}</div>
                    {t.order_id && <div style={{ fontSize:12, color:'var(--color-text-muted)', marginTop:3 }}>Order: {t.order_id}</div>}
                    {t.shipment_id && <div style={{ fontSize:12, color:'var(--color-text-muted)' }}>Shipment: {t.shipment_id}</div>}
                  </div>
                </div>
                {(t.shipment_origin || t.shipment_dest) && (
                  <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--color-border)', display:'flex', gap:20, fontSize:13, color:'var(--color-text-secondary)' }}>
                    {t.shipment_origin && <span>📦 From: {t.shipment_origin}</span>}
                    {t.shipment_dest && <span>📍 To: {t.shipment_dest}</span>}
                    {t.shipment_status && <span>🔄 {t.shipment_status}</span>}
                    {t.shipment_eta && <span>🕐 ETA: {t.shipment_eta}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && <ComplaintModal onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchTickets() }} customerId={user?.customer_id} />}
    </div>
  )
}

function ComplaintModal({ onClose, onSuccess, customerId }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    subject:'', description:'', priority:'medium', channel:'web',
    issue_type:'delay', order_id:'', shipment_id:'',
    shipment_origin:'', shipment_dest:'', shipment_status:'',
    shipment_eta:'', incident_date:'',
  })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async () => {
  if (!form.subject) { setError('Subject is required'); return }
  setLoading(true); setError('')
  
  const token = localStorage.getItem('token')
  
  // Dev mode — simulate success without hitting real API
  if (token === 'dev-mode-token') {
    setTimeout(() => {
      setLoading(false)
      onSuccess()
    }, 800)
    return
  }

  try {
    await api.post('/tickets/', { ...form, customer_id: customerId || null })
    onSuccess()
  } catch(e) { setError(e.response?.data?.detail || 'Failed to submit complaint') }
  finally { setLoading(false) }
}

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)', padding:24 }} onClick={onClose}>
      <div style={{ background:'var(--color-surface)', borderRadius:18, padding:32, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', boxShadow:'var(--shadow-lg)' }} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:700 }}>File a Complaint</h2>
            <p style={{ fontSize:13, color:'var(--color-text-secondary)', marginTop:2 }}>Step {step} of 2</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--color-text-muted)' }}>✕</button>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {[1,2].map(s => (
            <div key={s} style={{ flex:1, height:4, borderRadius:2, background:step>=s?'var(--color-accent)':'var(--color-border)', transition:'background 0.2s' }} />
          ))}
        </div>

        {error && <div style={{ background:'var(--color-danger-light)', border:'1px solid #fca5a5', color:'var(--color-danger)', padding:'10px 13px', borderRadius:9, fontSize:13, marginBottom:16 }}>{error}</div>}

        {step === 1 && (
          <>
            <Field label="Issue Type">
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
                {ISSUE_TYPES.map(t => (
                  <button key={t} onClick={() => set('issue_type',t)} style={{ padding:'6px 14px', borderRadius:20, fontSize:13, fontWeight:500, background:form.issue_type===t?'var(--color-accent)':'var(--color-bg)', color:form.issue_type===t?'#fff':'var(--color-text-secondary)', border:`1px solid ${form.issue_type===t?'var(--color-accent)':'var(--color-border)'}`, cursor:'pointer', textTransform:'capitalize' }}>
                    {t.replace('_',' ')}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Subject *">
              <input style={inp} placeholder="Brief description of the issue" value={form.subject} onChange={e=>set('subject',e.target.value)} />
            </Field>

            <Field label="Detailed Description">
              <textarea style={{ ...inp, height:90, resize:'vertical' }} placeholder="Explain the issue in detail..." value={form.description} onChange={e=>set('description',e.target.value)} />
            </Field>

            <div style={{ display:'flex', gap:14 }}>
              <Field label="Priority" style={{ flex:1 }}>
                <Select value={form.priority} onChange={v=>set('priority',v)} options={PRIORITIES} />
              </Field>
              <Field label="Channel" style={{ flex:1 }}>
                <Select value={form.channel} onChange={v=>set('channel',v)} options={CHANNELS} />
              </Field>
            </div>

            <Field label="Incident Date">
              <input style={inp} type="date" value={form.incident_date} onChange={e=>set('incident_date',e.target.value)} />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ background:'var(--color-bg)', borderRadius:10, padding:'14px 16px', marginBottom:20, fontSize:13, color:'var(--color-text-secondary)' }}>
              📦 Shipment details help us resolve your complaint faster. Fill in what you know.
            </div>

            <div style={{ display:'flex', gap:14 }}>
              <Field label="Order ID" style={{ flex:1 }}>
                <input style={inp} placeholder="ORD-12345" value={form.order_id} onChange={e=>set('order_id',e.target.value)} />
              </Field>
              <Field label="Shipment / Tracking ID" style={{ flex:1 }}>
                <input style={inp} placeholder="TRK-67890" value={form.shipment_id} onChange={e=>set('shipment_id',e.target.value)} />
              </Field>
            </div>

            <div style={{ display:'flex', gap:14 }}>
              <Field label="Origin" style={{ flex:1 }}>
                <input style={inp} placeholder="e.g. Chennai" value={form.shipment_origin} onChange={e=>set('shipment_origin',e.target.value)} />
              </Field>
              <Field label="Destination" style={{ flex:1 }}>
                <input style={inp} placeholder="e.g. Coimbatore" value={form.shipment_dest} onChange={e=>set('shipment_dest',e.target.value)} />
              </Field>
            </div>

            <Field label="Last Known Shipment Status">
              <input style={inp} placeholder="e.g. In transit, Out for delivery" value={form.shipment_status} onChange={e=>set('shipment_status',e.target.value)} />
            </Field>

            <Field label="Expected Delivery Date / ETA">
              <input style={inp} type="date" value={form.shipment_eta} onChange={e=>set('shipment_eta',e.target.value)} />
            </Field>
          </>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:10, marginTop:24 }}>
          {step === 2 && <button onClick={() => setStep(1)} style={{ flex:1, padding:11, borderRadius:10, background:'var(--color-bg)', border:'1px solid var(--color-border)', fontSize:14, fontWeight:600, cursor:'pointer', color:'var(--color-text-primary)' }}>← Back</button>}
          {step === 1
            ? <button onClick={() => { if(!form.subject){setError('Subject is required');return}; setError(''); setStep(2) }} style={{ flex:1, padding:11, borderRadius:10, background:'var(--color-accent)', color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer' }}>Next: Shipment Details →</button>
            : <button onClick={submit} disabled={loading} style={{ flex:1, padding:11, borderRadius:10, background:'var(--color-accent)', color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer', opacity:loading?0.7:1 }}>{loading?'Submitting...':'Submit Complaint'}</button>
          }
        </div>
      </div>
    </div>
  )
}

const inp = { width:'100%', padding:'9px 12px', border:'1.5px solid var(--color-border)', borderRadius:8, fontSize:14, background:'var(--color-bg)', outline:'none', color:'var(--color-text-primary)', marginBottom:0, display:'block', fontFamily:'var(--font-sans)' }

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom:16, ...style }}>
      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--color-text-primary)', marginBottom:6 }}>{label}</label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:'100%', padding:'9px 12px', border:'1.5px solid var(--color-border)', borderRadius:8, fontSize:14, background:'var(--color-bg)', color:'var(--color-text-primary)', outline:'none', fontFamily:'var(--font-sans)', textTransform:'capitalize' }}>
      {options.map(o => <option key={o} value={o} style={{ textTransform:'capitalize' }}>{o.replace('_',' ')}</option>)}
    </select>
  )
}
