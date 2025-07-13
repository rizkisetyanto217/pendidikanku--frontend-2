import GenericAdminLayout from './GenericAdminLayout'
import { teacherDesktopDataSidebar } from '@/constants/sidebar/TeacherDekstopDataSidebar'
import { teacherMobileDataSidebar } from '@/constants/sidebar/TeacherMobileDataSidebar'

export default function TeacherLayout() {
  return (
    <GenericAdminLayout
      desktopSidebar={teacherDesktopDataSidebar}
      mobileSidebar={teacherMobileDataSidebar}
      topbarTitle="Pengajar"
    />
  )
}
