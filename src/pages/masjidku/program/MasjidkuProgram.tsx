import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { Target, ListChecks, Wallet, CalendarCheck } from "lucide-react";

export default function MasjidkuProgram() {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <>
      <PageHeaderUser
        title="Program 100 Masjid"
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
            Rencana Donasi Digitalisasi 100 Masjid
          </h1>
          <p className="leading-relaxed" style={{ color: theme.black1 }}>
            Inisiatif untuk mempercepat digitalisasi masjid: profil online,
            jadwal kajian & sholat, publikasi konten, serta pelaporan yang
            transparan. Program menargetkan 100 masjid dengan dukungan pendanaan
            terukur dan pendampingan berkelanjutan.
          </p>
        </header>

        {/* Tujuan */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-black">
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
              Menyediakan kehadiran digital yang rapi untuk masjid (profil,
              agenda, konten).
            </li>
            <li>
              Memudahkan komunikasi masjid–jamaah melalui kanal resmi yang mudah
              diakses.
            </li>
            <li>
              Mendorong transparansi lewat ringkasan laporan kegiatan &
              finansial.
            </li>
            <li>
              Meningkatkan literasi digital pengurus melalui pelatihan singkat &
              modul praktik.
            </li>
            <li>
              Membangun jejaring antar masjid agar saling berbagi praktik
              terbaik.
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
              <b>Seleksi & Komitmen Masjid</b>: pengumpulan minat, verifikasi
              pengurus, dan kesediaan PIC.
            </li>
            <li>
              <b>Asesmen Awal</b>: inventarisasi data (logo, alamat, kontak,
              jadwal, konten awal, kebutuhan khusus).
            </li>
            <li>
              <b>Setup Teknis</b>: pembuatan halaman profil/jadwal, integrasi
              domain/subdomain, dan konfigurasi analitik.
            </li>
            <li>
              <b>Desain & Slicing</b>: implementasi tampilan sesuai guideline,
              aksesibilitas, & mobile-first.
            </li>
            <li>
              <b>Pelatihan Pengurus</b>: 60–90 menit (online), modul singkat &
              panduan operasional.
            </li>
            <li>
              <b>Go-Live & Publikasi</b>: uji cepat, rilis, dan pengumuman ke
              kanal media sosial.
            </li>
            <li>
              <b>Monitoring & Laporan</b>: dukungan 1–3 bulan, metrik
              keterjangkauan, dan umpan balik perbaikan.
            </li>
          </ol>
        </section>

        {/* Perincian Dana */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} style={{ color: theme.quaternary }} />
            <h2
              className="text-lg font-semibold"
              style={{ color: theme.quaternary }}
            >
              Perincian Dana (Contoh Estimasi)
            </h2>
          </div>

          {/* Per Masjid */}
          <div
            className=""
            // style={{ backgroundColor: theme.white2, borderColor: theme.white3 }}
          >
            <h3 className="font-semibold mb-3" style={{ color: theme.black1 }}>
              A. Per Masjid
            </h3>
            <div
              className="grid grid-cols-12 gap-2 text-sm"
              style={{ color: theme.black1 }}
            >
              <div className="col-span-8">1) Setup & Onboarding Teknis</div>
              <div className="col-span-4 text-right font-semibold">
               300.000
              </div>

              <div className="col-span-8">2) Desain & Slicing Halaman</div>
              <div className="col-span-4 text-right font-semibold">
               250.000
              </div>

              <div className="col-span-8">3) Pelatihan Pengurus (online)</div>
              <div className="col-span-4 text-right font-semibold">
               150.000
              </div>

              <div className="col-span-8">4) Produksi Konten Awal</div>
              <div className="col-span-4 text-right font-semibold">
               200.000
              </div>

              <div className="col-span-8">
                5) Dukungan Operasional (1–3 bulan)
              </div>
              <div className="col-span-4 text-right font-semibold">
               300.000
              </div>

              <div className="col-span-8 opacity-80">
                Opsional: Custom Domain / Tahun
              </div>
              <div className="col-span-4 text-right font-semibold opacity-80">
               200.000
              </div>

              <div className="col-span-8 mt-2 font-semibold">
                Subtotal Per Masjid (tanpa domain)
              </div>
              <div
                className="col-span-4 mt-2 text-right font-bold"
                style={{ color: theme.specialColor }}
              >
               1.200.000
              </div>
            </div>
          </div>

          {/* Skala 100 Masjid */}
          <div
            className=""
            // style={{ backgroundColor: theme.white2, borderColor: theme.white3 }}
          >
            <h3 className="font-semibold mb-3" style={{ color: theme.black1 }}>
              B. Skala Program 100 Masjid
            </h3>
            <div
              className="grid grid-cols-12 gap-2 text-sm"
              style={{ color: theme.black1 }}
            >
              <div className="col-span-8">
                Implementasi 100 Masjid (Rp1.200.000 x 100)
              </div>
              <div className="col-span-4 text-right font-semibold">
               120.000.000
              </div>

              <div className="col-span-8">
                Pool Program (shared): Platform & Infra
              </div>
              <div className="col-span-4 text-right font-semibold">
               10.000.000
              </div>

              <div className="col-span-8">Support, QA, & Koordinasi</div>
              <div className="col-span-4 text-right font-semibold">
               5.000.000
              </div>

              <div className="col-span-8">Pelatihan & Materi</div>
              <div className="col-span-4 text-right font-semibold">
               5.000.000
              </div>

              <div className="col-span-8">Cadangan/Risiko</div>
              <div className="col-span-4 text-right font-semibold">
               5.000.000
              </div>

              <div className="col-span-8 mt-2 font-semibold">
                Total Target Program (contoh)
              </div>
              <div
                className="col-span-4 mt-2 text-right font-bold"
                style={{ color: theme.specialColor }}
              >
               145.000.000
              </div>
            </div>

            <p
              className="text-xs mt-3 opacity-80"
              style={{ color: theme.black1 }}
            >
              Catatan: angka di atas adalah <b>contoh estimasi</b> dan dapat
              disesuaikan menurut kebijakan donasi, kebutuhan lapangan, atau
              dukungan in-kind.
            </p>
          </div>

          {/* Timeline singkat */}
          <div
            // className="rounded-lg ring-1 p-4"
            // style={{ backgroundColor: theme.white2, borderColor: theme.white3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck size={16} style={{ color: theme.quaternary }} />
              <h3 className="font-semibold" style={{ color: theme.black1 }}>
                Timeline Ringkas
              </h3>
            </div>
            <ul
              className="list-disc pl-5 space-y-1 text-sm"
              style={{ color: theme.black1 }}
            >
              <li>Bulan 1: Seleksi & asesmen 20–30 masjid pertama.</li>
              <li>Bulan 2–3: Setup & pelatihan batch 1–3, go-live bertahap.</li>
              <li>
                Bulan 4–5: Monitoring, optimalisasi, rilis batch berikutnya.
              </li>
              <li>Bulan 6: Evaluasi, publikasi capaian, penyiapan scale-up.</li>
            </ul>
          </div>
        </section>

        {/* CTA / Penutup */}
        <footer className="flex flex-wrap  items-center gap-3">
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
            Lihat Skema Donasi
          </button>
        </footer>
      </div>
    </>
  );
}
