import { useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { colors } from '@/constants/colorsThema'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'

export type SidebarMenuItem = {
  name: string
  icon: React.ReactNode
  to: string
}

type SidebarMenuProps = {
  menus: SidebarMenuItem[]
  title?: string
  currentPath?: string // 👈 tambahkan ini
}

export default function SidebarMenu({ menus, title = 'Beranda' }: SidebarMenuProps) {
  const location = useLocation()
  const activePath = location.pathname
  const { isDark } = useHtmlDarkMode()

  const theme = isDark ? colors.dark : colors.light

  return (
    <div
      className="hidden md:block w-64 rounded-xl p-4 shadow-sm transition-colors"
      style={{
        backgroundColor: theme.white1,
        color: theme.black1,
      }}
    >
      <h2 className="text-xl font-semibold mb-4" style={{ color: theme.primary }}>
        {title}
      </h2>
      <ul className="space-y-2">
        {menus.map((menu) => {
          const active = activePath === menu.to
          const bg = active ? theme.primary2 : 'transparent'
          const textColor = active ? theme.primary : theme.silver2

          return (
            <Link
              to={menu.to}
              key={menu.to}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-md transition font-medium
                ${active ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-teal-200 dark:hover:bg-teal-700 dark:text-gray-300'}`}
            >
              <div className="text-lg">{menu.icon}</div>
              <span>{menu.name}</span>
            </Link>
          )
        })}
      </ul>
    </div>
  )
}
