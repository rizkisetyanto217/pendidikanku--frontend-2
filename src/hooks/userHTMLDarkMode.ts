import { useState, useEffect } from 'react'

export default function useHtmlDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark =
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(prefersDark)

    const html = document.documentElement

    const updateIsDark = () => {
      setIsDark(html.classList.contains('dark'))
    }

    const observer = new MutationObserver(updateIsDark)
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })

    if (prefersDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const toggleDark = () => {
    const html = document.documentElement
    const newDark = !isDark
    html.classList.toggle('dark', newDark)
    setIsDark(newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  const setDarkMode = (value: boolean) => {
    const html = document.documentElement
    html.classList.toggle('dark', value)
    setIsDark(value)
    localStorage.setItem('theme', value ? 'dark' : 'light')
  }

  return { isDark, toggleDark, setDarkMode }
}
