// src/pages/dkm/setting/faq/FaqItem.tsx
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { colors } from '@/constants/colorsThema'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'

interface FaqItemProps {
  number: number
  question: string
  answer: string
}

export default function MasjidFaqItem({ number, question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false)
  const { isDark } = useHtmlDarkMode()
  const theme = isDark ? colors.dark : colors.light

  return (
    <div
      className="rounded-lg border px-4 py-2 transition-all"
      style={{
        backgroundColor: theme.white1,
        borderColor: theme.white3,
        color: theme.black1,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full font-medium text-left"
      >
        <span>{number}. {question}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="mt-2 text-sm" style={{ color: theme.silver2 }}>
          {answer}
        </p>
      )}
    </div>
  )
}
