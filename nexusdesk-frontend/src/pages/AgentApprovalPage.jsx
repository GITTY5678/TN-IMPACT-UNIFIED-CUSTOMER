import { useState, useEffect } from 'react'
import api from '../services/api'

export default function AgentApprovalPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAgents = () => {
    api.get('/agents/pending').then(r=>setAgents(r.data)).catch(()=>setAgents([])).finally(()=>setLoading(false))
  }

  useEffect(() => { fetchAgents() }, [])

  const approve = async (id) => {
    await api.post(`/agents/${id}/approve`)
    fetchAgents()
  }

  const reject = async (id) => {
    if (!confirm('Reject and remove this agent?')) return
    await api.post(`/agents/${id}/reject`)
    fetchAgents()
  }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>Agent Approvals</h1>
        <p style={{ color:'var(--color-text-secondary)', fontSize:14, marginTop:4 }}>{agents.length} pending request{agents.length!==1?'s':''}</p>
      </div>

      {loading ? (
        <div style={{ padding:48, textAlign:'center', color:'var(--color-text-muted)' }}>Loading...</div>
      ) : agents.length === 0 ? (
        <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:14, padding:64, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:14 }}>✅</div>
          <h3 style={{ fontSize:18, fontWeight:700 }}>All clear!</h3>
          <p style={{ color:'var(--color-text-secondary)', fontSize:14, marginTop:6 }}>No pending agent approvals.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {agents.map(a => (
            <div key={a.id} style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:12, padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:'var(--color-accent-light)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-accent)', fontWeight:700, fontSize:16 }}>
                  {a.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:15 }}>{a.name}</div>
                  <div style={{ fontSize:13, color:'var(--color-text-secondary)' }}>{a.email}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => approve(a.id)} style={{ padding:'8px 18px', background:'var(--color-success)', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  ✓ Approve
                </button>
                <button onClick={() => reject(a.id)} style={{ padding:'8px 18px', background:'var(--color-danger-light)', color:'var(--color-danger)', border:'1px solid #fca5a5', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
