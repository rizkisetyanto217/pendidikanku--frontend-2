import { MoonIcon } from 'lucide-react'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'
import { colors } from '@/constants/colorsThema'

export default function DKMAppereance() {
  const { isDark, setDarkMode } = useHtmlDarkMode()
  const theme = isDark ? colors.dark : colors.light

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDarkMode(e.target.value === 'dark')
  }

  return (
    <div
      className="p-6 rounded-xl shadow-sm"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <h1 className="text-2xl font-bold mb-6">Tampilan</h1>

      <label className="block text-sm font-medium mb-2" htmlFor="themeSelect">
        Tema
      </label>
      <div className="relative w-fit">
        <select
          id="themeSelect"
          onChange={handleChange}
          value={isDark ? 'dark' : 'light'}
          className="appearance-none border pr-10 pl-4 py-2 rounded-md text-sm w-40"
          style={{
            backgroundColor: theme.white2,
            color: theme.black1,
            borderColor: theme.silver1,
          }}
        >
          <option value="light">Terang</option>
          <option value="dark">Gelap</option>
        </select>

        {/* Icon custom dropdown */}
        <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400">
          ▼
        </div>
      </div>
    </div>
  )
}
