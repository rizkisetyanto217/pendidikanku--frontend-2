import PageHeader from "@/components/common/PageHeader";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

export default function DKMFullTranscriptLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Materi Lengkap"
        onBackClick={() => history.back()} // atau navigate(-1)
      />

      <div
        className="p-6 rounded-2xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        <div className="space-y-1 mb-4">
          <h2 className="text-base font-semibold text-sky-600 hover:underline cursor-pointer">
            Fiqh Waris | Hukum Pembagian Jatah Anak
          </h2>
          <p className="text-sm text-gray-500">
            2 Juni 2024, Pukul 20.00 WIB / Aula utama Masjid
          </p>
          <p className="text-sm font-semibold" style={{ color: theme.primary }}>
            Ustadz Abdullah, MA
          </p>
        </div>

        <div
          className="space-y-4 text-sm leading-relaxed text-justify"
          style={{ color: theme.black1 }}
        >
          <p>
            It is a long established fact that a reader will be distracted by
            the readable content...
          </p>
          <p>
            The point of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters...
          </p>
        </div>

        <div className="mt-6 text-right">
          <button
            className="px-5 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: theme.primary, color: theme.white1 }}
          >
            Edit Materi
          </button>
        </div>
      </div>
    </div>
  );
}
