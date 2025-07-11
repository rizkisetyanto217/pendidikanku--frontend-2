import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'

interface SidebarLinkProps {
  text: string
  icon: React.ReactNode
  to: string
}

export function SidebarLink({ text, icon, to }: SidebarLinkProps) {
  const location = useLocation()
  const active = location.pathname === to // ✅ benar

  return (
    <Link
      to={to}
      className={clsx(
        'flex flex-col items-center justify-center py-4 px-2 rounded-[24px] transition-all',
        active
          ? 'bg-teal-600 text-white'
          : 'text-gray-500 hover:bg-teal-200 dark:text-gray-300 dark:hover:bg-teal-700'
      )}
    >
      <div className="text-xl mb-1">{icon}</div>
      <span className="text-xs">{text}</span>
    </Link>
  )
}

