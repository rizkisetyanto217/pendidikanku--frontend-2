import { SidebarLink } from './SidebarLink'

export interface SidebarItem {
  text: string
  icon: React.ReactNode
  to: string
}

interface SidebarProps {
  items: SidebarItem[]
}

export default function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="w-28 py-8 flex flex-col items-center space-y-6 bg-teal-100 dark:bg-teal-900">
      <h1 className="text-xs font-bold text-blue-900 dark:text-blue-200">MasjidKu</h1>

      {items.map((item) => (
        <SidebarLink key={item.to} text={item.text} icon={item.icon} to={item.to} />
      ))}
    </aside>
  )
}
