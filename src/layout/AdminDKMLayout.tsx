import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminTopbar from '@/components/common/AdminTopbar'
import { sidebarDkmDesktopData } from '@/constants/SidebarData'
import Sidebar from '@/components/common/Sidebar'
import { colors } from '@/constants/colorsThema'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'
import MobileSidebar from '@/components/common/MobileSidebar'
import { sidebarDKMMobileData } from '@/constants/SidebarDKMMobileData'

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
        <Sidebar items={sidebarDkmDesktopData} />
      </div>

      {/* Mobile Sidebar */}
       <MobileSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={sidebarDKMMobileData}
      />

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
