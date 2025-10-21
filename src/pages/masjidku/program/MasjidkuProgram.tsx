import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { Target, ListChecks, Wallet, CalendarCheck } from "lucide-react";

export default function PendidikankuProgram() {
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  return (
    <>
      <PageHeaderUser
        title="Program Pendidikanku"
        onBackClick={() => navigate("/")}
        withPaddingTop
      />

      <div
        className="max-w-3xl mx-auto p-2 space-y-6 rounded-xl"
        style={{ backgroundColor: theme.white1, borderColor: theme.white3 }}
      >
        {/* Hero / Intro */}
        <header className="space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: theme.primary }}>
            Inisiatif Digitalisasi Pendidikan di Era Modern
          </h1>
          <p className="leading-relaxed" style={{ color: theme.black1 }}>
            Program <b>Pendidikanku</b> adalah gerakan untuk mempercepat
            transformasi digital di dunia pendidikan Indonesia. Melalui platform
            terpadu, program ini membantu sekolah, guru, dan siswa dalam
            mengelola pembelajaran, administrasi, serta komunikasi secara lebih
            efisien dan terintegrasi. 
          </p>
          <p className="leading-relaxed" style={{ color: theme.black1 }}>
            Fokus utama kami adalah menciptakan ekosistem belajar yang inklusif,
            adaptif, dan berbasis teknologi, agar proses pendidikan dapat
            berlangsung kapan saja dan di mana saja.
          </p>
        </header>

        {/* Tujuan */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 p-2 rounded-lg ">
            <Target size={18} style={{ color: theme.quaternary }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: theme.quaternary }}
            >
              Tujuan Program
            </h2>
          </div>

          <ul
            className="list-disc pl-5 space-y-2 leading-relaxed"
            style={{ color: theme.black1 }}
          >
            <li>
              Meningkatkan literasi digital dan kemampuan teknologi bagi guru,
              siswa, dan lembaga pendidikan.
            </li>
            <li>
              Menyediakan platform pembelajaran digital yang mudah diakses dan
              terintegrasi antara siswa, guru, dan orang tua.
            </li>
            <li>
              Mendukung efisiensi administrasi sekolah seperti jadwal, absensi,
              penilaian, dan laporan akademik.
            </li>
            <li>
              Mendorong kolaborasi antar sekolah dan pendidik untuk berbagi
              praktik terbaik.
            </li>
            <li>
              Membangun budaya belajar berkelanjutan melalui sistem edukasi yang
              interaktif dan adaptif.
            </li>
          </ul>
        </section>

        {/* Langkah-langkah */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ListChecks size={18} style={{ color: theme.quaternary }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: theme.quaternary }}
            >
              Langkah Pelaksanaan
            </h2>
          </div>
          <ol
            className="list-decimal pl-5 space-y-3 leading-relaxed"
            style={{ color: theme.black1 }}
          >
            <li>
              <b>Pemetaan Sekolah & Kebutuhan</b>: identifikasi kondisi,
              infrastruktur digital, serta kesiapan SDM pendidikan.
            </li>
            <li>
              <b>Pelatihan Guru & Staf</b>: sesi peningkatan kompetensi digital
              dan penggunaan platform pembelajaran daring.
            </li>
            <li>
              <b>Implementasi Platform</b>: aktivasi dashboard, integrasi
              sistem kelas online, serta akses pengguna (guru–siswa–orang tua).
            </li>
            <li>
              <b>Pendampingan & Evaluasi</b>: pemantauan efektivitas, umpan
              balik, dan penyesuaian fitur sesuai kebutuhan pengguna.
            </li>
            <li>
              <b>Publikasi & Kolaborasi</b>: berbagi hasil implementasi,
              praktik terbaik, dan pengembangan jaringan antar sekolah.
            </li>
          </ol>
        </section>

        {/* Estimasi Anggaran */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} style={{ color: theme.quaternary }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: theme.quaternary }}
            >
              Estimasi Anggaran
            </h2>
          </div>

          {/* Per Sekolah */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: theme.black1 }}>
              A. Per Sekolah
            </h3>
            <div
              className="grid grid-cols-12 gap-2 text-sm"
              style={{ color: theme.black1 }}
            >
              <div className="col-span-8">1) Implementasi Platform & Setup</div>
              <div className="col-span-4 text-right font-semibold">500.000</div>

              <div className="col-span-8">
                2) Pelatihan Guru & Staf Pendidikan
              </div>
              <div className="col-span-4 text-right font-semibold">400.000</div>

              <div className="col-span-8">
                3) Dukungan Teknis & Operasional (3 bulan)
              </div>
              <div className="col-span-4 text-right font-semibold">300.000</div>

              <div className="col-span-8">4) Materi & Modul Pembelajaran</div>
              <div className="col-span-4 text-right font-semibold">200.000</div>

              <div className="col-span-8 mt-2 font-semibold">
                Subtotal Per Sekolah
              </div>
              <div
                className="col-span-4 mt-2 text-right font-bold"
                style={{ color: theme.specialColor }}
              >
                1.400.000
              </div>
            </div>
          </div>

          {/* Skala Nasional */}
          <div>
            <h3 className="font-semibold mb-3" style={{ color: theme.black1 }}>
              B. Skala Program 100 Sekolah
            </h3>
            <div
              className="grid grid-cols-12 gap-2 text-sm"
              style={{ color: theme.black1 }}
            >
              <div className="col-span-8">
                Implementasi 100 Sekolah (Rp1.400.000 x 100)
              </div>
              <div className="col-span-4 text-right font-semibold">
                140.000.000
              </div>

              <div className="col-span-8">Platform & Infrastruktur Server</div>
              <div className="col-span-4 text-right font-semibold">
                15.000.000
              </div>

              <div className="col-span-8">Manajemen Program & QA</div>
              <div className="col-span-4 text-right font-semibold">
                7.500.000
              </div>

              <div className="col-span-8">Produksi Materi Pelatihan</div>
              <div className="col-span-4 text-right font-semibold">
                5.000.000
              </div>

              <div className="col-span-8 mt-2 font-semibold">
                Total Estimasi Program
              </div>
              <div
                className="col-span-4 mt-2 text-right font-bold"
                style={{ color: theme.specialColor }}
              >
                167.500.000
              </div>
            </div>

            <p
              className="text-xs mt-3 opacity-80"
              style={{ color: theme.black1 }}
            >
              Catatan: angka di atas merupakan <b>perkiraan estimasi</b> dan
              dapat disesuaikan berdasarkan skala sekolah, jumlah peserta, atau
              dukungan pihak ketiga.
            </p>
          </div>

          {/* Timeline singkat */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck size={16} style={{ color: theme.quaternary }} />
              <h2 className="text-lg font-semibold"
              style={{ color: theme.quaternary }}>
              
                Timeline Pelaksanaan
              </h2>
            </div>
            <ul
              className="list-disc pl-5 space-y-1 text-sm"
              style={{ color: theme.black1 }}
            >
              <li>Bulan 1: Pemetaan sekolah & pelatihan awal guru.</li>
              <li>
                Bulan 2–3: Implementasi platform dan pendampingan teknis.
              </li>
              <li>Bulan 4–5: Evaluasi & optimalisasi pembelajaran digital.</li>
              <li>
                Bulan 6: Publikasi capaian & ekspansi ke sekolah berikutnya.
              </li>
            </ul>
          </div>
        </section>

        {/* CTA / Penutup */}
        <footer className="flex flex-wrap items-center gap-3">
          <button
            className="px-4 py-2 rounded-lg font-semibold w-full"
            style={{ backgroundColor: theme.primary, color: theme.white1 }}
            onClick={() => navigate("/profil")}
          >
            Dukung & Kolaborasi
          </button>
          <button
            className="px-4 py-2 rounded-lg font-semibold ring-1 w-full"
            style={{ color: theme.primary, borderColor: theme.primary }}
            onClick={() => navigate("/finansial")}
          >
            Lihat Skema Program
          </button>
        </footer>
      </div>
    </>
  );
}
