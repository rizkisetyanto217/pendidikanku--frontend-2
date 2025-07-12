import GenericAdminLayout from './GenericAdminLayout'
import { authorDesktopDataSidebar } from '@/constants/sidebar/AuthorDekstopDataSidebar'
import { authorMobileDataSidebar } from '@/constants/sidebar/AuthorMobileDataSidebar'

export default function AuthorLayout() {
  return (
    <GenericAdminLayout
      desktopSidebar={authorDesktopDataSidebar}
      mobileSidebar={authorMobileDataSidebar}
      topbarTitle="Penulis"
    />
  )
}
