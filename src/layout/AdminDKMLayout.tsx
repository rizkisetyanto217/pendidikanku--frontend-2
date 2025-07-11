import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminTopbar from '@/components/common/AdminTopbar'
import { sidebarDkm } from '@/constants/SidebarData'
import Sidebar from '@/components/common/Sidebar'
import { colors } from '@/constants/colorsThema'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'

export default function BaseAdminDkmLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { isDark } = useHtmlDarkMode()

  const isDashboard = location.pathname === '/dkm' || location.pathname === '/dkm/'

  const theme = isDark ? colors.dark : colors.light

  return (
    <div
      className="min-h-screen h-screen flex overflow-hidden relative"
      style={{ backgroundColor: theme.white2 }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:h-screen">
        <Sidebar items={sidebarDkm} />
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          onClick={() => setIsOpen(false)}
        >
          {/* Overlay hitam transparan */}
          <div className="absolute inset-0 bg-black opacity-50" />

          {/* Sidebar slide-in */}
          <div
            className="relative z-50 w-64 h-full py-8 flex flex-col items-center space-y-6 animate-slide-in-left"
            style={{ backgroundColor: theme.primary2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar items={sidebarDkm} />
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-auto">
        <AdminTopbar onMenuClick={() => setIsOpen(true)} />
        <div className={isDashboard ? 'p-8' : 'p-4'}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
