// src/components/layout/AuthLayout.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { colors } from '@/constants/colorsThema'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'

type AuthLayoutProps = {
  children: React.ReactNode
  mode?: 'login' | 'register'
}

export default function AuthLayout({ children, mode = 'login' }: AuthLayoutProps) {
  const { isDark } = useHtmlDarkMode()
  const themeColors = isDark ? colors.dark : colors.light

  const isLogin = mode === 'login'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: themeColors.white2 }}
    >
      <div
        className="p-8 rounded-xl shadow-md w-full max-w-md"
        style={{ backgroundColor: themeColors.white1, color: themeColors.black1 }}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-semibold" style={{ color: themeColors.primary }}>
            MasjidKu
          </h2>
          <p className="text-sm mt-2" style={{ color: themeColors.silver2 }}>
            {isLogin
              ? 'Login atau Register untuk melanjutkan'
              : 'Silakan lengkapi form untuk mendaftar'}
          </p>
        </div>

        {/* Konten Halaman */}
        {children}

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: themeColors.silver2 }}>
            {isLogin ? (
              <>
                Belum punya akun?{' '}
                <Link to="/register" className="hover:underline" style={{ color: themeColors.primary }}>
                  Daftar
                </Link>
              </>
            ) : (
              <>
                Sudah punya akun?{' '}
                <Link to="/login" className="hover:underline" style={{ color: themeColors.primary }}>
                  Login
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
