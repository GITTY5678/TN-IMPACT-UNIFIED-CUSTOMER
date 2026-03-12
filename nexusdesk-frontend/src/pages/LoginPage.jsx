import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const inp = { width:'100%', padding:'10px 13px', border:'1.5px solid var(--color-border)', borderRadius:'9px', fontSize:'14px', background:'var(--color-bg)', outline:'none', color:'var(--color-text-primary)', marginBottom:'14px', display:'block' }
const lbl = { display:'block', fontSize:'13px', fontWeight:600, color:'var(--color-text-primary)', marginBottom:'6px' }
const errBox = { background:'var(--color-danger-light)', border:'1px solid #fca5a5', color:'var(--color-danger)', padding:'10px 13px', borderRadius:'9px', fontSize:'13px', marginBottom:'14px' }

export default function LoginPage() {
  const [stage, setStage] = useState('choose')
  const [devOpen, setDevOpen] = useState(false)
  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'linear-gradient(135deg,#f8f9fb 0%,#eef2ff 100%)', fontFamily:'var(--font-sans)', position:'relative' }}>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px' }}>
        {stage === 'choose'   && <RoleChooser onPick={setStage} />}
        {stage === 'agent'    && <AgentAuth onBack={() => setStage('choose')} />}
        {stage === 'customer' && <CustomerAuth onBack={() => setStage('choose')} />}
      </div>
      <RightPanel />
      <button onClick={() => setDevOpen(true)} title="Dev Mode"
        style={{ position:'fixed', bottom:20, left:20, width:34, height:34, borderRadius:'50%', background:'#1e293b', color:'#64748b', border:'1px solid #334155', fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, opacity:0.45, transition:'opacity 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.opacity=1}
        onMouseLeave={e => e.currentTarget.style.opacity=0.45}>🛠️</button>
      {devOpen && <DevModeModal onClose={() => setDevOpen(false)} />}
    </div>
  )
}

function DevModeModal({ onClose }) {
  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState('dev@nexus.in')
  const [name, setName] = useState('Dev Admin')
  const { setDevUser } = useAuth()
  const navigate = useNavigate()

  const enter = () => {
    setDevUser({ id:999, customer_id:999, email, name, full_name:name, role, is_approved:true, dev_mode:true })
    onClose()
    navigate(role === 'customer' ? '/my-tickets' : '/dashboard')
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={onClose}>
      <div style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:16, padding:28, width:'100%', maxWidth:380, color:'#e2e8f0' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <span style={{ fontSize:20 }}>🛠️</span>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>Dev Mode</div>
            <div style={{ fontSize:12, color:'#64748b' }}>Bypass auth for testing</div>
          </div>
        </div>
        <div style={{ background:'#1e293b', border:'1px solid #f59e0b44', borderRadius:8, padding:'10px 12px', marginBottom:18, fontSize:12, color:'#f59e0b' }}>
          ⚠️ Skips real authentication — for testing only
        </div>
        <label style={{ ...lbl, color:'#94a3b8' }}>Login as Role</label>
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {['admin','agent','customer'].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{ flex:1, padding:'8px', borderRadius:8, fontSize:13, fontWeight:600, background:role===r?'#2563eb':'#1e293b', color:role===r?'#fff':'#64748b', border:`1px solid ${role===r?'#2563eb':'#334155'}`, cursor:'pointer', textTransform:'capitalize' }}>{r}</button>
          ))}
        </div>
        <label style={{ ...lbl, color:'#94a3b8' }}>Display Name</label>
        <input style={{ ...inp, background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0' }} value={name} onChange={e=>setName(e.target.value)} />
        <label style={{ ...lbl, color:'#94a3b8' }}>Email</label>
        <input style={{ ...inp, background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0' }} value={email} onChange={e=>setEmail(e.target.value)} />
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button onClick={onClose} style={{ flex:1, padding:10, borderRadius:9, background:'#1e293b', border:'1px solid #334155', color:'#94a3b8', fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancel</button>
          <button onClick={enter} style={{ flex:1, padding:10, borderRadius:9, background:'#2563eb', color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer' }}>Enter as {role}</button>
        </div>
      </div>
    </div>
  )
}

function RoleChooser({ onPick }) {
  return (
    <div style={{ width:'100%', maxWidth:420 }}>
      <Logo mb={36} />
      <h1 style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.4px', marginBottom:6 }}>Who are you?</h1>
      <p style={{ color:'var(--color-text-secondary)', fontSize:14, marginBottom:32 }}>Choose your role to continue</p>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <RoleCard emoji="🧑‍💼" title="I'm an Agent" desc="Support team member — manage tickets, customers, and AI tools" color="var(--color-accent)" bg="var(--color-accent-light)" onClick={() => onPick('agent')} />
        <RoleCard emoji="🙋" title="I'm a Customer" desc="Submit and track your support complaints" color="var(--color-success)" bg="var(--color-success-light)" onClick={() => onPick('customer')} />
      </div>
    </div>
  )
}

function RoleCard({ emoji, title, desc, color, bg, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 20px', background:hov?bg:'var(--color-surface)', border:`2px solid ${hov?color:'var(--color-border)'}`, borderRadius:14, cursor:'pointer', textAlign:'left', transition:'all 0.18s', width:'100%' }}>
      <span style={{ fontSize:28 }}>{emoji}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--color-text-primary)', marginBottom:3 }}>{title}</div>
        <div style={{ fontSize:13, color:'var(--color-text-secondary)', lineHeight:1.4 }}>{desc}</div>
      </div>
      <span style={{ color:'var(--color-text-muted)', fontSize:18 }}>→</span>
    </button>
  )
}

function AgentAuth({ onBack }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleLogin = async () => {
    setError(''); setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'admin') { navigate('/dashboard'); return }
      if (user.role === 'agent') { user.is_approved ? navigate('/dashboard') : setPending(true) }
      else setError('Not an agent account. Use Customer portal.')
    } catch(e) { setError(e.response?.data?.detail || 'Invalid credentials') }
    finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!form.name||!form.email||!form.password) { setError('All fields required'); return }
    setError(''); setLoading(true)
    try { await register({...form, role:'agent'}); setPending(true) }
    catch(e) { setError(e.response?.data?.detail || 'Registration failed') }
    finally { setLoading(false) }
  }

  if (pending) return (
    <div style={{ width:'100%', maxWidth:420 }}>
      <BackBtn onClick={onBack} />
      <div style={{ background:'var(--color-surface)', borderRadius:18, padding:36, boxShadow:'var(--shadow-lg)', border:'1px solid var(--color-border)', textAlign:'center' }}>
        <div style={{ fontSize:52, marginBottom:16 }}>⏳</div>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:10 }}>Pending Approval</h2>
        <p style={{ color:'var(--color-text-secondary)', fontSize:14, lineHeight:1.6 }}>Your agent account is awaiting admin approval.</p>
        <button onClick={onBack} style={{ marginTop:20, padding:'10px 24px', borderRadius:9, background:'var(--color-accent)', color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer' }}>Back to Home</button>
      </div>
    </div>
  )

  return (
    <div style={{ width:'100%', maxWidth:420 }}>
      <BackBtn onClick={onBack} />
      <div style={{ background:'var(--color-surface)', borderRadius:18, padding:36, boxShadow:'var(--shadow-lg)', border:'1px solid var(--color-border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:22 }}>
          <span style={{ fontSize:22 }}>🧑‍💼</span>
          <div><div style={{ fontWeight:700, fontSize:17 }}>Agent Portal</div><div style={{ fontSize:12, color:'var(--color-text-muted)' }}>Requires admin approval</div></div>
        </div>
        <TabSwitch tab={tab} setTab={t=>{setTab(t);setError('')}} options={[['login','Sign In'],['register','Register']]} />
        {error && <div style={errBox}>{error}</div>}
        {tab==='register' && <><label style={lbl}>Full Name</label><input style={inp} value={form.name} onChange={e=>set('name',e.target.value)} /></>}
        <label style={lbl}>Email</label>
        <input style={inp} type="email" value={form.email} onChange={e=>set('email',e.target.value)} />
        <label style={lbl}>Password</label>
        <input style={inp} type="password" value={form.password} onChange={e=>set('password',e.target.value)} onKeyDown={e=>e.key==='Enter'&&(tab==='login'?handleLogin():handleRegister())} />
        <button onClick={tab==='login'?handleLogin:handleRegister} disabled={loading}
          style={{ width:'100%', padding:11, borderRadius:10, background:'var(--color-accent)', color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer', opacity:loading?0.7:1 }}>
          {loading?'Please wait...':tab==='login'?'Sign In':'Request Agent Access'}
        </button>
      </div>
    </div>
  )
}

function CustomerAuth({ onBack }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleLogin = async () => {
    setError(''); setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role==='customer') navigate('/my-tickets')
      else setError('Not a customer account. Use Agent portal.')
    } catch(e) { setError(e.response?.data?.detail||'Invalid credentials') }
    finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!form.name||!form.email||!form.password) { setError('All fields required'); return }
    setError(''); setLoading(true)
    try { await register({...form, role:'customer'}); await login(form.email,form.password); navigate('/my-tickets') }
    catch(e) { setError(e.response?.data?.detail||'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ width:'100%', maxWidth:420 }}>
      <BackBtn onClick={onBack} />
      <div style={{ background:'var(--color-surface)', borderRadius:18, padding:36, boxShadow:'var(--shadow-lg)', border:'1px solid var(--color-border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:22 }}>
          <span style={{ fontSize:22 }}>🙋</span>
          <div><div style={{ fontWeight:700, fontSize:17 }}>Customer Portal</div><div style={{ fontSize:12, color:'var(--color-text-muted)' }}>Submit and track your complaints</div></div>
        </div>
        <TabSwitch tab={tab} setTab={t=>{setTab(t);setError('')}} options={[['login','Sign In'],['register','Sign Up']]} />
        {error && <div style={errBox}>{error}</div>}
        {tab==='register' && <><label style={lbl}>Full Name</label><input style={inp} value={form.name} onChange={e=>set('name',e.target.value)} /></>}
        <label style={lbl}>Email</label>
        <input style={inp} type="email" value={form.email} onChange={e=>set('email',e.target.value)} />
        <label style={lbl}>Password</label>
        <input style={inp} type="password" value={form.password} onChange={e=>set('password',e.target.value)} onKeyDown={e=>e.key==='Enter'&&(tab==='login'?handleLogin():handleRegister())} />
        <button onClick={tab==='login'?handleLogin:handleRegister} disabled={loading}
          style={{ width:'100%', padding:11, borderRadius:10, background:'#16a34a', color:'#fff', border:'none', fontSize:14, fontWeight:600, cursor:'pointer', opacity:loading?0.7:1 }}>
          {loading?'Please wait...':tab==='login'?'Sign In':'Create Account'}
        </button>
      </div>
    </div>
  )
}

function BackBtn({ onClick }) {
  return <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--color-text-secondary)', fontSize:13, fontWeight:500, background:'none', border:'none', cursor:'pointer', marginBottom:20 }}>← Back</button>
}

function TabSwitch({ tab, setTab, options }) {
  return (
    <div style={{ display:'flex', background:'var(--color-bg)', borderRadius:9, padding:3, marginBottom:20, border:'1px solid var(--color-border)' }}>
      {options.map(([val,label]) => (
        <button key={val} onClick={() => setTab(val)} style={{ flex:1, padding:8, borderRadius:7, fontSize:13, fontWeight:600, background:tab===val?'var(--color-surface)':'transparent', color:tab===val?'var(--color-text-primary)':'var(--color-text-muted)', border:tab===val?'1px solid var(--color-border)':'1px solid transparent', cursor:'pointer', transition:'all 0.15s' }}>{label}</button>
      ))}
    </div>
  )
}

function Logo({ mb=24 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:mb }}>
      <div style={{ width:34, height:34, background:'var(--color-accent)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:15 }}>N</div>
      <span style={{ fontWeight:700, fontSize:18, letterSpacing:'-0.3px' }}>NexusDesk</span>
    </div>
  )
}

function RightPanel() {
  return (
    <div style={{ flex:1, background:'linear-gradient(160deg,#1e40af 0%,#2563eb 55%,#3b82f6 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:64, color:'#fff', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,0.06)', top:-100, right:-100 }} />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ fontSize:12, fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', opacity:0.6, marginBottom:20 }}>Support Platform</div>
        <h2 style={{ fontSize:34, fontWeight:700, lineHeight:1.2, marginBottom:18, letterSpacing:'-0.5px', maxWidth:360 }}>Resolve complaints faster with AI-powered support</h2>
        <p style={{ fontSize:15, opacity:0.78, lineHeight:1.65, maxWidth:340 }}>NexusDesk brings your team, customers, and Claude AI together in one intelligent workspace.</p>
        <div style={{ display:'flex', gap:32, marginTop:48 }}>
          {[['3×','Faster resolution'],['98%','CSAT score'],['AI','Powered by Claude']].map(([n,l]) => (
            <div key={l}><div style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.5px' }}>{n}</div><div style={{ fontSize:12, opacity:0.6, marginTop:3 }}>{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  )
}
