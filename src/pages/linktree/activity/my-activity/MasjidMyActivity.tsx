import BottomNavbar from "@/components/common/public/ButtonNavbar";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import { CalendarDays, MapPin, Circle } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useNavigate, useParams } from "react-router-dom";
import CommonButton from "@/components/common/main/MainButton";

export default function MasjidMyActivity() {
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { slug } = useParams();

  return (
    <>
      <PublicNavbar masjidName="Aktivitas Saya" />

      <div className="min-h-screen pb-28 bg-cover bg-no-repeat bg-center pt-16">
        {/* Header User (dengan tema) */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: themeColors.tertiary || "#E6F5F4" }}
        >
          <h1
            className="text-base font-semibold"
            style={{ color: themeColors.black1 }}
          >
            Budi Renaldi
          </h1>
          <p className="text-sm mt-1" style={{ color: themeColors.black1 }}>
            Bergabung pada 3 November 2025
          </p>

          <button
            className="mt-4 px-4 py-2 text-sm font-medium rounded-full"
            style={{
              backgroundColor: themeColors.primary,
              color: isDark ? themeColors.black1 : themeColors.white1,
            }}
          >
            Profil Saya
          </button>
        </div>

        {/* Kartu 2 kolom */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <CardInfo
            label="Donasi"
            desc="Riwayat donasi yang telah diberikan"
            color={themeColors.success1}
            bg={themeColors.success2}
            onClick={() => navigate(`/masjid/${slug}/aktivitas/donasi-saya`)}
          />
          <CardInfo
            label="Statistik"
            desc="Data perkembangan belajar"
            color={themeColors.success1}
            bg={themeColors.white3}
            onClick={() => navigate(`/masjid/${slug}/aktivitas/statistik-saya`)}
          />
        </div>

        {/* Section Riwayat Kajian */}
        <div className="mt-6">
          <h2
            className="text-sm font-semibold mb-3"
            style={{ color: themeColors.primary }}
          >
            Riwayat Kajian Saya
          </h2>

          {[1, 2].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border mb-4 p-4 space-y-1"
              style={{
                backgroundColor: themeColors.white1,
                borderColor: themeColors.silver1,
              }}
            >
              <h3
                className="font-semibold text-sm"
                style={{ color: themeColors.black1 }}
              >
                Rencana Allah yang terbaik
              </h3>
              <p className="text-sm" style={{ color: themeColors.silver2 }}>
                Ustadz Abdullah
              </p>
              <p className="text-xs" style={{ color: themeColors.silver2 }}>
                Masjid Al Hidayah, Senen, Jakarta Pusat
              </p>

              <div
                className="flex items-center space-x-1 text-xs mt-1"
                style={{ color: themeColors.silver4 }}
              >
                <Circle size={12} />
                <span>4 Maret 2025, Pukul 10.00 WIB - Selesai</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {i === 0 ? (
                  <>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: themeColors.white3,
                        color: themeColors.black1,
                      }}
                    >
                      Hadir Online ✓
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: themeColors.primary,
                        color: themeColors.white1,
                      }}
                    >
                      Materi & Soal Tersedia
                    </span>
                  </>
                ) : (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: themeColors.success1,
                      color: themeColors.white1,
                    }}
                  >
                    Hadir Langsung ✓
                  </span>
                )}
              </div>
            </div>
          ))}

          <CommonButton
            to={`/masjid/${slug}/aktivitas/kajian-saya`}
            text="Selengkapnya"
            className="w-full py-3 rounded-lg text-sm"
            style={{
              backgroundColor: themeColors.primary,
              color: themeColors.white1,
            }}
          />
        </div>
      </div>

      <BottomNavbar />
    </>
  );
}

function CardInfo({
  label,
  desc,
  color,
  bg,
  onClick,
}: {
  label: string;
  desc: string;
  color: string;
  bg: string;
  onClick?: () => void;
}) {
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  // Gunakan override warna berdasarkan label agar tetap konsisten dan nyaman di dark mode
  const overrideColors: Record<string, { bg: string; color: string }> = {
    Donasi: {
      bg: themeColors.success2,
      color: themeColors.success1,
    },
    Statistik: {
      bg: themeColors.white3,
      color: themeColors.primary,
    },
  };

  const current = overrideColors[label] ?? { bg, color };

  return (
    <div
      className="p-4 rounded-lg transition-colors duration-300 cursor-pointer"
      style={{
        backgroundColor: current.bg,
        border: `1px solid ${isDark ? themeColors.silver1 : "transparent"}`,
      }}
      onClick={onClick} // ← ini penting
    >
      <h4
        className="text-sm font-semibold mb-1"
        style={{
          color: current.color,
        }}
      >
        {label}
      </h4>
      <p
        className="text-xs leading-snug"
        style={{
          color: isDark ? themeColors.black1 : themeColors.black1,
        }}
      >
        {desc}
      </p>
    </div>
  );
}
