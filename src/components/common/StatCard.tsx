import { ReactNode, useEffect, useState } from 'react'
import { colors } from '@/constants/colorsThema'

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  bgIcon?: string // tailwind class string masih didukung untuk fleksibilitas
}

export default function StatCard({
  label,
  value,
  icon,
  bgIcon,
}: StatCardProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const theme = isDark ? colors.dark : colors.light

  return (
    <div
      className="w-[250px] h-[116px] rounded-xl shadow flex justify-between p-4"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <div>
        <p
          className="text-sm"
          style={{ color: theme.silver2 }}
        >
          {label}
        </p>
        <p className="text-xl font-bold mt-1">{value}</p>
      </div>
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 mt-2 ${bgIcon ?? ''}`}
        style={!bgIcon ? { backgroundColor: theme.primary2 } : undefined}
      >
        {icon}
      </div>
    </div>
  )
}
