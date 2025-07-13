import GenericAdminLayout from './GenericAdminLayout'
import { treasurerDesktopDataSidebar } from '@/constants/sidebar/TreasurerDekstopDataSidebar'
import { treasurerMobileDataSidebar } from '@/constants/sidebar/TreasurerMobileDataSidebar'

export default function TreasurerLayout() {
  return (
    <GenericAdminLayout
      desktopSidebar={treasurerDesktopDataSidebar}
      mobileSidebar={treasurerMobileDataSidebar}
      topbarTitle="Pengajar"
    />
  )
}
