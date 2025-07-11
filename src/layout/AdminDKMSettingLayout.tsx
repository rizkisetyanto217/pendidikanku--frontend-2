// src/layout/DkmSettingLayout.tsx
import { SidebarMenuItem } from '@/components/common/SidebarMenu'
import DashboardSidebar from '@/components/common/SidebarMenu'
import { Outlet, useLocation } from 'react-router-dom'
import { UserIcon, MoonIcon, HelpingHandIcon, HandshakeIcon } from 'lucide-react'

export default function DkmSettingLayout() {
  const location = useLocation()

  const menus: SidebarMenuItem[] = [
    { name: 'Profil', icon: <UserIcon />, to: '/dkm/profil-saya' },
    { name: 'Tampilan', icon: <MoonIcon />, to: '/dkm/appereance' },
    { name: 'Dukung Kami', icon: <HelpingHandIcon />, to: '/dkm/support-us' },
    { name: 'Kerjasama', icon: <HandshakeIcon />, to: '/dkm/partnership' },
    { name: 'FAQ', icon: <HelpingHandIcon />, to: '/dkm/faq' }
  ]

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-64 shrink-0">
        <DashboardSidebar menus={menus} title="Pengaturan" currentPath={location.pathname} />
      </div>

      <div className="flex-1">
        <div className="rounded-xl shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
