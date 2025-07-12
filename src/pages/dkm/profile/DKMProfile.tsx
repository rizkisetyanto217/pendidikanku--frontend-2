import { BuildingIcon, UserIcon } from 'lucide-react'
import DashboardSidebar, { SidebarMenuItem } from '@/components/common/SidebarMenu'
import { colors } from '@/constants/colorsThema'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'

export default function ProfilMasjid() {
  const menus: SidebarMenuItem[] = [
    { name: 'Masjid', icon: <BuildingIcon />, to: '/dkm/profil' },
    { name: 'DKM & Pengajar', icon: <UserIcon />, to: '/dkm/profil-dkm' },
  ]

  const { isDark } = useHtmlDarkMode()
  const theme = isDark ? colors.dark : colors.light

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <DashboardSidebar menus={menus} title="Profil" />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div
          className="p-6 rounded-xl shadow-sm space-y-6"
          style={{
            backgroundColor: theme.white1,
            color: theme.black1,
          }}
        >
          {/* Header */}
          <h1 className="text-2xl font-bold">Profil Masjid</h1>

          {/* Info Utama */}
          <div className="flex flex-col md:flex-row gap-4">
            <img
              src="https://placehold.co/320x240?text=Masjid"
              alt="Masjid"
              className="w-full md:w-60 h-40 object-cover rounded-md"
            />
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-bold" style={{ color: theme.primary }}>
                Masjid Jami’ At-Taqwa
              </h2>
              <p className="text-sm" style={{ color: theme.silver2 }}>
                Dikelola oleh DKM Masjid untuk ummat muslim
              </p>
              <p className="text-sm font-medium" style={{ color: theme.black1 }}>
                Jln. Sawo Besar No.95, Tanah Abang, Jakarta Pusat, DKI Jakarta
              </p>
              <p className="text-sm" style={{ color: theme.silver2 }}>
                Didirikan pada April 2000
              </p>
              <div className="flex gap-4 text-sm mt-2">
                <span className="font-medium">300 Postingan</span>
                <span className="font-medium">300 Pengikut</span>
              </div>
            </div>
          </div>

          {/* Sosial Media */}
          <div>
            <h3 className="text-sm font-semibold mb-1">Sosial Media</h3>
            <div className="flex items-center gap-2">
              <img src="/icons/youtube.svg" alt="Youtube" className="w-5 h-5" />
              <img src="/icons/instagram.svg" alt="Instagram" className="w-5 h-5" />
              <img src="/icons/whatsapp.svg" alt="WA" className="w-5 h-5" />
              <button
                className="ml-2 text-sm px-3 py-1 rounded font-medium transition"
                style={{
                  backgroundColor: theme.primary2,
                  color: theme.primary,
                }}
              >
                + Edit
              </button>
            </div>
          </div>

          {/* Latar Belakang */}
          <section>
            <h3 className="text-sm font-bold mb-1">Latar Belakang</h3>
            <p className="text-sm leading-relaxed" style={{ color: theme.black2 }}>
              It is a long established fact that a reader will be distracted by the readable content...
            </p>
          </section>

          {/* Tujuan */}
          <section>
            <h3 className="text-sm font-bold mb-1">Tujuan</h3>
            <p className="text-sm leading-relaxed" style={{ color: theme.black2 }}>
              It is a long established fact that a reader will be distracted by the readable content...
            </p>
          </section>

          {/* Tombol */}
          <div className="pt-4">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: theme.primary,
                color: theme.white1,
              }}
            >
              Edit Profil Masjid
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
