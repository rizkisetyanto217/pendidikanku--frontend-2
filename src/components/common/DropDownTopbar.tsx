import { useState, useRef, useEffect } from 'react'
import { LogOut, Settings, User, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function UserDropdown() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('userData') || '{}')
  const userName = user.user_name || 'User'
  const userRole = user.role || 'Role'

 const handleLogout = async () => {
  try {
    await axios.post(
      'https://masjidkubackend4-production.up.railway.app/api/auth/logout',
      {},
      {
        withCredentials: true, // ⬅️ penting untuk kirim cookie HttpOnly
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`, // ⬅️ kalau dibutuhkan backend-mu
        },
      }
    )
  } catch (err) {
    console.error('Logout gagal:', err)
    // opsional: tetap lanjut logout meskipun backend error
  }

  localStorage.removeItem('userData')
  localStorage.removeItem('authToken')
  navigate('/login')
}


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
       <img
        src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><circle cx='16' cy='16' r='16' fill='%23CCCCCC' /></svg>"
        alt="Profile"
        className="w-8 h-8 rounded-full"
        />
        <div className="text-left text-sm hidden sm:block">
          <div className="font-semibold">{userName}</div>
          <div className="text-xs text-gray-500">{userRole}</div>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border z-50 dark:bg-gray-900 dark:border-gray-700">
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            <li>
              <button
                onClick={() => navigate('/profil')}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User className="w-4 h-4" /> Profil
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/dkm/profil-saya')}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="w-4 h-4" /> Pengaturan
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/bantuan')}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <HelpCircle className="w-4 h-4" /> Bantuan
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-red-400"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
