import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import AuthLayout from '@/layout/AuthLayout'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'
import { colors } from '@/constants/colorsThema'
import api from '@/lib/axios' // ⬅️ ini pakai axios instance

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { isDark } = useHtmlDarkMode()
  const themeColors = isDark ? colors.dark : colors.light

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!identifier || !password) {
      setError('Harap isi email/username dan password.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/login', { identifier, password })

     if (response.data.status === 'success') {
        const user = response.data.data.user
        localStorage.setItem('userData', JSON.stringify(user))

        // Arahkan sesuai role
        switch (user.role) {
            case 'dkm':
            navigate('/dkm')
            break
            case 'author':
            navigate('/author')
            break
            case 'admin':
            navigate('/admin')
            break
            case 'teacher':
            navigate('/teacher')
            break
            default:
            navigate('/login') // fallback kalau role tidak dikenali
        }
        }
    else {
        setError('Login gagal, coba lagi.')
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.message || 'Login gagal, coba lagi.')
      } else if (error.request) {
        setError('Tidak ada respon dari server.')
      } else {
        setError('Terjadi kesalahan saat login.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout mode="login">
      <form onSubmit={handleLogin}>
        {/* Email / Username */}
        <div className="mb-4">
          <label
            htmlFor="identifier"
            className="block text-sm"
            style={{ color: themeColors.black1 }}
          >
            Email / Username
          </label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="w-full p-3 mt-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: themeColors.white1,
              color: themeColors.black1,
              borderColor: themeColors.silver2,
            }}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm"
            style={{ color: themeColors.black1 }}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 mt-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: themeColors.white1,
                color: themeColors.black1,
                borderColor: themeColors.silver2,
              }}
            />
            <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 rounded"
            style={{ color: themeColors.silver2 }}
            >
            {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
            ) : (
                <EyeIcon className="w-5 h-5" />
            )}
            </button>

          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-sm" style={{ color: themeColors.error1 }}>
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-white rounded-lg focus:outline-none transition`}
          style={{
            backgroundColor: loading ? themeColors.primary2 : themeColors.primary,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </form>
    </AuthLayout>
  )
}
