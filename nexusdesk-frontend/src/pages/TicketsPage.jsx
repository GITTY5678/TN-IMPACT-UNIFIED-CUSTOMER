import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const badge = (val, type='status') => {
  const statusMap = { open:'#2563eb', in_progress:'#d97706', resolved:'#16a34a', closed:'#6b7280' }
  const priorityMap = { high:'#dc2626', medium:'#d97706', low:'#16a34a' }
  const map = type==='priority' ? priorityMap : statusMap
  const color = map[val] || '#6b7280'
  return { background:color+'18', color, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600, textTransform:'capitalize', display:'inline-block' }
}

export default function TicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status:'', priority:'', issue_type:'' })

  useEffect(() => {
    const params = new URLSearchParams()
    if (filter.status) params.set('status', filter.status)
    if (filter.priority) params.set('priority', filter.priority)
    api.get(`/tickets/?${params}`).then(r=>setTickets(r.data)).catch(()=>setTickets([])).finally(()=>setLoading(false))
  }, [filter])

  const filtered = filter.issue_type ? tickets.filter(t=>t.issue_type===filter.issue_type) : tickets

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>All Tickets</h1>
        <p style={{ color:'var(--color-text-secondary)', fontSize:14, marginTop:4 }}>{tickets.length} total complaints</p>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        {[
          { key:'status', options:['','open','in_progress','resolved','closed'], label:'Status' },
          { key:'priority', options:['','low','medium','high'], label:'Priority' },
          { key:'issue_type', options:['','delay','damage','wrong_item','missing','wrong_address','other'], label:'Issue Type' },
        ].map(f => (
          <select key={f.key} value={filter[f.key]} onChange={e=>setFilter(p=>({...p,[f.key]:e.target.value}))}
            style={{ padding:'8px 12px', border:'1px solid var(--color-border)', borderRadius:8, fontSize:13, background:'var(--color-surface)', color:'var(--color-text-primary)', cursor:'pointer', fontFamily:'var(--font-sans)' }}>
            <option value="">All {f.label}</option>
            {f.options.filter(Boolean).map(o => <option key={o} value={o} style={{ textTransform:'capitalize' }}>{o.replace('_',' ')}</option>)}
          </select>
        ))}
      </div>

      <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:48, textAlign:'center', color:'var(--color-text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:'var(--color-text-muted)' }}>No tickets found</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--color-bg)' }}>
                {['#','Subject','Issue','Customer','Order ID','Priority','Status','Date'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} style={{ borderTop:'1px solid var(--color-border)', cursor:'pointer' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--color-bg)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'var(--color-text-muted)', fontFamily:'var(--font-mono)' }}>#{t.id}</td>
                  <td style={{ padding:'12px 16px', fontSize:14, fontWeight:500, maxWidth:180 }}><div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.subject}</div></td>
                  <td style={{ padding:'12px 16px', fontSize:13, textTransform:'capitalize', color:'var(--color-text-secondary)' }}>{t.issue_type?.replace('_',' ') || '—'}</td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'var(--color-text-secondary)' }}>{t.customer?.name || '—'}</td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'var(--color-text-secondary)', fontFamily:'var(--font-mono)' }}>{t.order_id || '—'}</td>
                  <td style={{ padding:'12px 16px' }}><span style={badge(t.priority,'priority')}>{t.priority}</span></td>
                  <td style={{ padding:'12px 16px' }}><span style={badge(t.status)}>{t.status.replace('_',' ')}</span></td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'var(--color-text-muted)', whiteSpace:'nowrap' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
