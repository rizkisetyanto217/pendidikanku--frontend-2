import GenericAdminLayout from './GenericAdminLayout'
import { treasurerDesktopDataSidebar } from '@/constants/sidebar/TreasurerDekstopDataSidebar'
import { treasurerMobileDataSidebar } from '@/constants/sidebar/TreasurerMobileDataSidebar'

export default function TeacherLayout() {
  return (
    <GenericAdminLayout
      desktopSidebar={treasurerDesktopDataSidebar}
      mobileSidebar={treasurerMobileDataSidebar}
      topbarTitle="Pengajar"
    />
  )
}
