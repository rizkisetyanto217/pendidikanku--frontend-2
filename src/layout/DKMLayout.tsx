// layout/AdminDKMLayout.tsx
import { sidebarDkmDesktopData } from '@/constants/sidebar/DKMDekstopDataSidebar'
import { sidebarDKMMobileData } from '@/constants/sidebar/DKMMobileDataSidebar'
import GenericAdminLayout from './GenericAdminLayout'

export default function AdminDKMLayout() {
  return (
    <GenericAdminLayout
      desktopSidebar={sidebarDkmDesktopData}
      mobileSidebar={sidebarDKMMobileData}
      topbarTitle="DKM"
    />
  )
}
