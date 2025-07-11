import { MenuIcon, MoonIcon, SunIcon } from 'lucide-react'
import { colors } from '@/constants/colorsThema'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'
import UserDropdown from './DropDownTopbar'
import { Link } from 'react-router-dom'

interface AdminTopbarProps {
  onMenuClick?: () => void
  isMobile?: boolean
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { isDark, toggleDark } = useHtmlDarkMode()
  const themeColors = isDark ? colors.dark : colors.light

  // 🔍 Ambil user dari localStorage
  const userData = localStorage.getItem('userData')
  const user = userData ? JSON.parse(userData) : null

  return (
    <header
      className="flex items-center justify-between px-6 py-4 shadow md:ml-0"
      style={{
        backgroundColor: themeColors.white1,
        color: themeColors.black1,
      }}
    >
      <div className="md:hidden">
        <button onClick={onMenuClick}>
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <SunIcon className="w-5 h-5 text-yellow-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* User info or Login */}
        {user ? (
          <UserDropdown />
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  )
}
