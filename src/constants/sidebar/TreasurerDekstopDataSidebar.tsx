// src/constants/sidebarAuthorDesktopData.ts
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

export const treasurerDesktopDataSidebar: SidebarItem[] = [
  { text: 'Beranda', icon: <BeakerIcon />, to: '/dkm' },
  { text: 'Profil', icon: <LayoutDashboardIcon />, to: '/dkm/profil' },
  { text: 'Keuangan', icon: <PieChartIcon />, to: '/dkm/keuangan' },
]
