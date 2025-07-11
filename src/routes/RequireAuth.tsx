import { Navigate, Outlet } from "react-router-dom"

export default function RequireAuth() {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('userData')
  const user = userData ? JSON.parse(userData) : null

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  // Misal validasi role DKM saja:
  if (!['dkm', 'penulis'].includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
