import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const badge = (val, type='status') => {
  const statusMap = { open:'#2563eb', in_progress:'#d97706', resolved:'#16a34a', closed:'#6b7280' }
  const priorityMap = { high:'#dc2626', medium:'#d97706', low:'#16a34a' }
  const map = type==='priority' ? priorityMap : statusMap
  const color = map[val] || '#6b7280'
  return { background:color+'18', color, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600, textTransform:'capitalize' }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/tickets/').catch(()=>({data:[]})),
      api.get('/customers/').catch(()=>({data:[]})),
    ]).then(([t,c]) => { setTickets(t.data); setCustomers(c.data) }).finally(()=>setLoading(false))
  }, [])

  const open = tickets.filter(t=>t.status==='open').length
  const inProgress = tickets.filter(t=>t.status==='in_progress').length
  const resolved = tickets.filter(t=>t.status==='resolved').length
  const high = tickets.filter(t=>t.priority==='high').length

  const stats = [
    { label:'Open', value:open, color:'#2563eb', icon:'🔵' },
    { label:'In Progress', value:inProgress, color:'#d97706', icon:'🟡' },
    { label:'Resolved', value:resolved, color:'#16a34a', icon:'🟢' },
    { label:'High Priority', value:high, color:'#dc2626', icon:'🔴' },
    { label:'Total Customers', value:customers.length, color:'#7c3aed', icon:'👥' },
  ]

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>Dashboard</h1>
        <p style={{ color:'var(--color-text-secondary)', fontSize:14, marginTop:4 }}>Welcome back, {user?.name} 👋</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:12, padding:'18px 20px', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div style={{ fontSize:28, fontWeight:700, color:s.color, marginTop:8 }}>{s.value}</div>
            <div style={{ fontSize:13, color:'var(--color-text-secondary)', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Tickets */}
      <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--color-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ fontSize:16, fontWeight:700 }}>Recent Tickets</h2>
          <button onClick={() => navigate('/tickets')} style={{ fontSize:13, color:'var(--color-accent)', background:'none', border:'none', cursor:'pointer', fontWeight:500 }}>View all →</button>
        </div>
        {loading ? (
          <div style={{ padding:32, textAlign:'center', color:'var(--color-text-muted)' }}>Loading...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:'var(--color-text-muted)' }}>No tickets yet</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--color-bg)' }}>
                {['#','Subject','Issue Type','Customer','Priority','Status','Date'].map(h => (
                  <th key={h} style={{ padding:'10px 18px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.slice(0,10).map(t => (
                <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} style={{ borderTop:'1px solid var(--color-border)', cursor:'pointer', transition:'background 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'13px 18px', fontSize:13, color:'var(--color-text-muted)', fontFamily:'var(--font-mono)' }}>#{t.id}</td>
                  <td style={{ padding:'13px 18px', fontSize:14, fontWeight:500, maxWidth:200 }}>{t.subject}</td>
                  <td style={{ padding:'13px 18px', fontSize:13, color:'var(--color-text-secondary)', textTransform:'capitalize' }}>{t.issue_type?.replace('_',' ') || '—'}</td>
                  <td style={{ padding:'13px 18px', fontSize:13, color:'var(--color-text-secondary)' }}>{t.customer?.name || '—'}</td>
                  <td style={{ padding:'13px 18px' }}><span style={badge(t.priority,'priority')}>{t.priority}</span></td>
                  <td style={{ padding:'13px 18px' }}><span style={badge(t.status)}>{t.status.replace('_',' ')}</span></td>
                  <td style={{ padding:'13px 18px', fontSize:13, color:'var(--color-text-muted)' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
