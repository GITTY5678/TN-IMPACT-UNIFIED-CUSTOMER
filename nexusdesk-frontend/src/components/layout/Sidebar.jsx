import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/dashboard',  label: 'Dashboard',       icon: '▦',  roles: ['agent','admin'] },
  { to: '/tickets',    label: 'Tickets',          icon: '🎫', roles: ['agent','admin'] },
  { to: '/customers',  label: 'Customers',        icon: '👥', roles: ['agent','admin'] },
  { to: '/agents',     label: 'Agent Approvals',  icon: '✅', roles: ['admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside style={{ width: 220, background: '#0f172a', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>N</div>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>NexusDesk</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.filter(l => l.roles.includes(user?.role)).map(link => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px', textDecoration: 'none',
            fontSize: 14, fontWeight: 500,
            background: isActive ? '#1e3a5f' : 'transparent',
            color: isActive ? '#60a5fa' : '#94a3b8',
            transition: 'all 0.15s',
          })}>
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '14px', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 700, fontSize: 13 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ color: '#475569', fontSize: 11, textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', padding: '8px', borderRadius: '7px', background: '#1e293b', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}
