// src/pages/sekolahislamku/pages/student/StudentCertificate.tsx
import React from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useNavigate } from "react-router-dom";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import { Award, Download, CalendarDays, ArrowLeft } from "lucide-react";

/* ===== Dummy Data ===== */
const dummyCertificates = [
  {
    id: "c1",
    title: "Sertifikat Juara 1 Olimpiade Matematika",
    date: "2024-05-15",
    issuer: "Kementerian Pendidikan",
  },
  {
    id: "c2",
    title: "Sertifikat MTQ Antar Sekolah",
    date: "2023-11-10",
    issuer: "Yayasan Al-Hikmah",
  },
  {
    id: "c3",
    title: "Sertifikat Peserta Cerdas Cermat Nasional",
    date: "2022-08-20",
    issuer: "Kemendikbud",
  },
];

/* ===== Helpers ===== */
const dateLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/* ===== Main Component ===== */
const StudentCertificate: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top bar */}
      <ParentTopBar
        palette={palette}
        title="Sertifikat"
        gregorianDate={new Date().toISOString()}
        showBack
      />

      <main className="w-full px-4 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Konten utama */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header back + title (desktop only) */}
            <div className="hidden md:flex items-center gap-3 mb-2">
              <Btn
                palette={palette}
                onClick={() => navigate(-1)}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="text-lg font-semibold">Daftar Sertifikat</h1>
            </div>

            {/* List sertifikat */}
            {dummyCertificates.map((cert) => (
              <SectionCard
                key={cert.id}
                palette={palette}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: palette.primary2,
                      color: palette.primary,
                    }}
                  >
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{cert.title}</h3>
                    <p className="text-sm" style={{ color: palette.black2 }}>
                      <CalendarDays size={14} className="inline mr-1" />
                      {dateLong(cert.date)} • {cert.issuer}
                    </p>
                  </div>
                </div>

                <Btn palette={palette} variant="outline" size="sm">
                  <Download size={16} className="mr-1" /> Unduh
                </Btn>
              </SectionCard>
            ))}

            {/* Kosong */}
            {dummyCertificates.length === 0 && (
              <SectionCard
                palette={palette}
                className="p-6 text-center text-sm"
              >
                Belum ada sertifikat yang tersedia.
              </SectionCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentCertificate;
