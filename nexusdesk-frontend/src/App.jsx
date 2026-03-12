import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TicketsPage from './pages/TicketsPage'
import TicketDetailPage from './pages/TicketDetailPage'
import CustomersPage from './pages/CustomersPage'
import AgentApprovalPage from './pages/AgentApprovalPage'
import CustomerDashboard from './pages/CustomerDashboard'
import AppLayout from './components/layout/AppLayout'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'var(--font-sans)',color:'var(--color-text-secondary)' }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return null

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Customer routes */}
      <Route path="/my-tickets" element={
        <PrivateRoute roles={['customer']}>
          <CustomerDashboard />
        </PrivateRoute>
      } />

      {/* Agent/Admin routes */}
      <Route path="/" element={
        <PrivateRoute roles={['agent','admin']}>
          <AppLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="agents" element={
          <PrivateRoute roles={['admin']}>
            <AgentApprovalPage />
          </PrivateRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to={user ? (user.role === 'customer' ? '/my-tickets' : '/dashboard') : '/login'} replace />} />
    </Routes>
  )
}
