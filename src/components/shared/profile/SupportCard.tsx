import { ReactNode } from 'react'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'
import { colors } from '@/constants/colorsThema'

interface SupportCardProps {
  title: string
  description: ReactNode
  action?: ReactNode
}

export default function SupportCard({ title, description, action }: SupportCardProps) {
  const { isDark } = useHtmlDarkMode()
  const theme = isDark ? colors.dark : colors.light

  return (
    <div
      className="border rounded-xl p-4 shadow-sm space-y-2"
      style={{
        backgroundColor: theme.white2,
        borderColor: theme.silver1,
        color: theme.black1,
      }}
    >
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="text-sm">{description}</div>
      {action && <div>{action}</div>}
    </div>
  )
}
