// src/constants/sidebarAuthorMobileData.ts
import { SidebarItem } from '@/components/common/Sidebar'
import {
  BeakerIcon,
  LayoutDashboardIcon,
  BellIcon,
  CalendarIcon,
  FileIcon,
  UsersIcon,
  PieChartIcon,
} from 'lucide-react'

export const authorMobileDataSidebar: SidebarItem[] = [
  { text: 'Beranda', icon: <BeakerIcon />, to: '/dkm' },
  {
    text: 'Profil',
    icon: <LayoutDashboardIcon />,
    children: [
      { text: 'Profil Masjid', to: '/dkm/profil' },
      { text: 'Profil DKM', to: '/dkm/profil-dkm' },
    ],
  },
  { text: 'Kajian', icon: <CalendarIcon />, to: '/dkm/kajian' },
  { text: 'Sertifikat', icon: <FileIcon />, to: '/dkm/sertifikat' },
]
