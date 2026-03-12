import { useState, useEffect } from 'react'
import api from '../services/api'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/customers/').then(r=>setCustomers(r.data)).catch(()=>setCustomers([])).finally(()=>setLoading(false))
  }, [])

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company||'').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>Customers</h1>
        <p style={{ color:'var(--color-text-secondary)', fontSize:14, marginTop:4 }}>{customers.length} registered customers</p>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email or company..."
        style={{ width:'100%', maxWidth:360, padding:'9px 14px', border:'1.5px solid var(--color-border)', borderRadius:9, fontSize:14, marginBottom:16, outline:'none', fontFamily:'var(--font-sans)', background:'var(--color-surface)' }} />

      <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:48, textAlign:'center', color:'var(--color-text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:'var(--color-text-muted)' }}>No customers found</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--color-bg)' }}>
                {['Name','Email','Company','Total Tickets','LTV','Joined'].map(h => (
                  <th key={h} style={{ padding:'10px 18px', textAlign:'left', fontSize:12, fontWeight:600, color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderTop:'1px solid var(--color-border)' }}>
                  <td style={{ padding:'14px 18px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--color-accent-light)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-accent)', fontWeight:700, fontSize:13 }}>
                        {c.name[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight:600, fontSize:14 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'14px 18px', fontSize:13, color:'var(--color-text-secondary)' }}>{c.email}</td>
                  <td style={{ padding:'14px 18px', fontSize:13, color:'var(--color-text-secondary)' }}>{c.company || '—'}</td>
                  <td style={{ padding:'14px 18px', fontSize:14, fontWeight:600, color:'var(--color-accent)' }}>{c.total_tickets}</td>
                  <td style={{ padding:'14px 18px', fontSize:13, color:'var(--color-text-secondary)' }}>₹{c.ltv?.toFixed(2) || '0.00'}</td>
                  <td style={{ padding:'14px 18px', fontSize:13, color:'var(--color-text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
