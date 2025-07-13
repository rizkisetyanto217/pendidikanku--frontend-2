import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from '@/lib/axios'

export default function RequireAuthRedirect() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    api.get('/api/auth/me')
      .then((res) => {
        setUser(res.data.user)
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  if (user.role === 'owner') return <Navigate to="/" replace />
  if (user.role === 'dkm') return <Navigate to="/dkm" replace />
  if (user.role === 'author') return <Navigate to="/author" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />

  return <Navigate to="/login" replace />
}
