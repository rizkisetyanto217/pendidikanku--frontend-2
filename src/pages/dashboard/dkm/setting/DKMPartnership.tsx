import SupportCard from '@/components/shared/profile/SupportCard'
import { Button } from '@/components/ui/button'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'
import { colors } from '@/constants/colorsThema'

export default function Partnership() {
  const { isDark } = useHtmlDarkMode()
  const theme = isDark ? colors.dark : colors.light

  return (
    <div
      className="p-6 rounded-xl shadow-sm space-y-4"
      style={{
        backgroundColor: theme.white1,
        color: theme.black1,
      }}
    >
      <p className="text-sm" style={{ color: theme.silver2 }}>
        Masjidku menawarkan kepada seluruh muslimin khususnya Masjid dan Lembaga Islam untuk saling bekerjasama dalam kebaikan dengan Masjidku.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SupportCard
          title="🌱 Masjidku"
          description={
            <>
              Gabung bersama dalam satu aplikasi untuk management Masjid dan Lembaga.
              <strong> Insya Allah 100% Gratis.</strong>
            </>
          }
          action={<Button>Informasi</Button>}
        />
        <SupportCard
          title="📊 Aplikasi & Web Sendiri"
          description="Buat khusus untuk Masjid dan Lembaga dengan branding aplikasi dan web sendiri bekerjasama dengan Masjidku."
          action={
            <Button
              style={{
                backgroundColor: theme.specialColor,
                color: '#000000',
              }}
              className="hover:brightness-110 transition-colors"
            >
              Informasi
            </Button>
          }
        />
      </div>
    </div>
  )
}
