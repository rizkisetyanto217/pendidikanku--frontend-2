// layout/AdminDKMLayout.tsx
import { DKMDesktopDataSidebar } from '@/constants/sidebar/DKMDekstopDataSidebar'
import { DKMMobileDataSidebar } from '@/constants/sidebar/DKMMobileDataSidebar'
import GenericAdminLayout from './GenericAdminLayout'

export default function DKMLayout() {
  return (
    <GenericAdminLayout
      desktopSidebar={DKMDesktopDataSidebar}
      mobileSidebar={DKMMobileDataSidebar}
      topbarTitle="DKM"
    />
  )
}
