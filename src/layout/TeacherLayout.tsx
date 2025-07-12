import GenericAdminLayout from './GenericAdminLayout'
import { sidebarTeacherDesktopData } from '@/constants/sidebar/TeacherDekstopDataSidebar'
import { sidebarTeacherMobileData } from '@/constants/sidebar/TeacherMobileDataSidebar'

export default function TeacherLayout() {
  return (
    <GenericAdminLayout
      desktopSidebar={sidebarTeacherDesktopData}
      mobileSidebar={sidebarTeacherMobileData}
      topbarTitle="Pengajar"
    />
  )
}
