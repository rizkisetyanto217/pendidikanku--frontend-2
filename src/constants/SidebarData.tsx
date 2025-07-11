// src/constants/sidebarData.ts
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

export const sidebarDkm: SidebarItem[] = [
  { text: 'Beranda', icon: <BeakerIcon />, to: '/dkm' },
  { text: 'Profil', icon: <LayoutDashboardIcon />, to: '/dkm/profil' },
  { text: 'Notifikasi', icon: <BellIcon />, to: '/dkm/notifikasi' },
  { text: 'Kajian', icon: <CalendarIcon />, to: '/dkm/kajian' },
  { text: 'Sertifikat', icon: <FileIcon />, to: '/dkm/sertifikat' },
  { text: 'Keuangan', icon: <PieChartIcon />, to: '/dkm/keuangan' },
  { text: 'Postingan', icon: <UsersIcon />, to: '/dkm/postingan' },
]
