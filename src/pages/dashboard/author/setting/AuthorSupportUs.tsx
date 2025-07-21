// src/pages/dkm/setting/DukunganKami.tsx
import SupportCard from '@/components/shared/profile/SupportCard'
import { Button } from '@/components/ui/button'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'
import { colors } from '@/constants/colorsThema'

export default function SupportUs() {
  const { isDark } = useHtmlDarkMode()
  const theme = isDark ? colors.dark : colors.light

  return (
    <div
      className="p-6 rounded-xl shadow-sm"
      style={{
        backgroundColor: theme.white1,
        color: theme.black1,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SupportCard
          title="🌱 Donasi"
          description="Bantu kami untuk keberlangsungan aplikasi dan layanan."
          action={<Button>Donasi</Button>}
        />
        <SupportCard
          title="📊 Bagikan"
          description="Sebarkan informasi ini kepada kaum muslimin, pengurus Masjid dan lembaga agar sama-sama berkembang."
          action={<Button variant="secondary">Bagikan</Button>}
        />
        <SupportCard
          title="⬇️ Unduh Aplikasi Masjidku"
          description={
            <div className="space-y-1 text-sm">
              {[
                'Masjidku untuk Android',
                'Masjidku untuk iOS',
                'Website Masjidku',
              ].map((text, idx) => (
                <p key={idx}>
                  <a
                    href="#"
                    className="underline transition-colors"
                    style={{
                      color: theme.black1,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = theme.silver2)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = theme.black1)
                    }
                  >
                    {text}
                  </a>
                </p>
              ))}
            </div>
          }
        />
        <SupportCard
          title="💬 Beri Masukan dan Saran"
          description="Mohon berikan masukan dan saran. Sangat berarti bagi kami dalam meningkatkan layanan kedepannya."
          action={<Button variant="outline">Masukan dan Saran</Button>}
        />
      </div>
    </div>
  )
}
