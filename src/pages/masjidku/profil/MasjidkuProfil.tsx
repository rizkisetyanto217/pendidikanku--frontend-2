import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

export default function PendidikankuProfil() {
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  return (
    <>
      <PageHeaderUser
        title="Profil Pendidikanku"
        onBackClick={() => navigate(`/`)}
        withPaddingTop // aktifin padding top
      />

      <div
        className="max-w-3xl mx-auto space-y-6 rounded-xl"
        style={{
          backgroundColor: theme.white1, // kartu latar mengikuti tema
          borderColor: theme.white3, // garis halus
        }}
      >
        {/* Latar Belakang */}
        <section>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: theme.quaternary }}
          >
            Latar Belakang
          </h2>
          <p
            className="text-justify leading-relaxed"
            style={{ color: theme.black1 }}
          >
            Pendidikanku hadir sebagai solusi digital untuk mendukung proses
            pembelajaran modern yang lebih interaktif, efisien, dan terintegrasi.
            Di tengah perkembangan teknologi yang pesat, dunia pendidikan
            dituntut untuk beradaptasi agar pembelajaran tidak hanya berlangsung
            di ruang kelas, tetapi juga dapat diakses di mana saja dan kapan saja.
          </p>
          <p
            className="text-justify leading-relaxed mt-3"
            style={{ color: theme.black1 }}
          >
            Melalui platform ini, kami berkomitmen untuk membantu lembaga
            pendidikan, pengajar, dan siswa dalam mengoptimalkan pengalaman
            belajar mengajar dengan memanfaatkan teknologi digital. Pendidikanku
            menjadi jembatan antara dunia pendidikan tradisional dan era digital,
            dengan menghadirkan sistem manajemen pembelajaran, evaluasi, dan
            komunikasi yang lebih efektif.
          </p>
        </section>

        {/* Tujuan */}
        <section>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: theme.quaternary }}
          >
            Tujuan
          </h2>
          <ul
            className="list-disc pl-5 space-y-2 leading-relaxed mb-10"
            style={{ color: theme.black1 }}
          >
            <li>
              Meningkatkan efisiensi proses pembelajaran melalui sistem digital
              yang mudah digunakan oleh guru dan siswa.
            </li>
            <li>
              Menyediakan sarana manajemen data akademik, jadwal, dan evaluasi
              secara transparan dan terorganisir.
            </li>
            <li>
              Mendorong kolaborasi antara pendidik, peserta didik, dan lembaga
              pendidikan dalam ekosistem yang saling terhubung.
            </li>
            <li>
              Mendukung transformasi pendidikan menuju pembelajaran berbasis
              teknologi dan data.
            </li>
            <li>
              Menjadi platform edukatif yang memberdayakan semua pihak untuk
              belajar, berkembang, dan berinovasi tanpa batas.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
