import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ArrowLeft,
  School,
  Flag,
} from "lucide-react";

/* ===== Type harus sama dengan AcademicSchool ===== */
type AcademicTerm = {
  academic_terms_masjid_id: string;
  academic_terms_academic_year: string; // "2025/2026"
  academic_terms_name: string; // "Ganjil"
  academic_terms_start_date: string; // ISO with TZ
  academic_terms_end_date: string; // ISO with TZ
  academic_terms_is_active: boolean;
  academic_terms_angkatan: number; // 2025
};

/* ===== Dummy fallback kalau masuk tanpa state ===== */
const DUMMY_TERM: AcademicTerm = {
  academic_terms_masjid_id: "e9876a6e-ab91-4226-84f7-cda296ec747e",
  academic_terms_academic_year: "2025/2026",
  academic_terms_name: "Ganjil",
  academic_terms_start_date: "2025-07-15T00:00:00+07:00",
  academic_terms_end_date: "2026-01-10T23:59:59+07:00",
  academic_terms_is_active: true,
  academic_terms_angkatan: 2025,
};

/* ===== Helpers tanggal ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const toLocalNoonISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
};

export default function DetailAcademic() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  // data dikirim dari AcademicSchool via Link state
  const { state } = useLocation() as { state?: { term?: AcademicTerm } };

  const term = useMemo<AcademicTerm>(() => {
    return state?.term ?? DUMMY_TERM;
  }, [state?.term]);

  const topbarISO = toLocalNoonISO(new Date());

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Akademik"
        gregorianDate={topbarISO}
        dateFmt={dateLong}
        showBack={true}
      />

      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            <div className="md:flex items-center gap-3 hidden">
              <Btn
                palette={palette}
                variant="ghost"
                size="md"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-2 p-5"
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="text-lg font-semibold">Halaman Detail Akademik</h1>
            </div>

            {/* Header */}
            <SectionCard palette={palette} className="overflow-hidden">
              <div
                className="px-5 py-4 border-b flex items-center gap-3"
                style={{ borderColor: palette.silver1 }}
              >
                <School size={20} color={palette.quaternary} />
                <div className="font-semibold">Periode Akademik</div>
                {term.academic_terms_is_active && (
                  <span
                    className="ml-auto text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: palette.success2,
                      color: palette.success1,
                    }}
                  >
                    Aktif
                  </span>
                )}
              </div>

              <div className="p-5 grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Tahun Ajaran / Semester
                  </div>
                  <div className="text-xl font-semibold">
                    {term.academic_terms_academic_year} —{" "}
                    {term.academic_terms_name}
                  </div>
                  <div
                    className="text-sm flex items-center gap-2"
                    style={{ color: palette.black2 }}
                  >
                    <CalendarDays size={16} />
                    {dateShort(term.academic_terms_start_date)} s/d{" "}
                    {dateShort(term.academic_terms_end_date)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Angkatan & Status
                  </div>
                  <div className="text-xl font-semibold">
                    {term.academic_terms_angkatan}
                  </div>
                  <div
                    className="text-sm flex items-center gap-2"
                    style={{ color: palette.black2 }}
                  >
                    <CheckCircle2 size={16} />
                    {term.academic_terms_is_active ? "Aktif" : "Tidak Aktif"}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Detail Tambahan */}
            <SectionCard palette={palette} className="p-5">
              <div className="grid md:grid-cols-2 gap-4">
                <InfoRow
                  palette={palette}
                  icon={<CalendarDays size={18} />}
                  label="Tanggal Mulai"
                  value={dateLong(term.academic_terms_start_date)}
                />
                <InfoRow
                  palette={palette}
                  icon={<Clock size={18} />}
                  label="Tanggal Selesai"
                  value={dateLong(term.academic_terms_end_date)}
                />
                <InfoRow
                  palette={palette}
                  icon={<Flag size={18} />}
                  label="Status Periode"
                  value={
                    term.academic_terms_is_active ? "Aktif" : "Tidak Aktif"
                  }
                />
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ===== Small UI ===== */
function InfoRow({
  palette,
  icon,
  label,
  value,
}: {
  palette: Palette;
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-lg grid place-items-center shrink-0"
        style={{ background: palette.primary2, color: palette.primary }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs" style={{ color: palette.silver2 }}>
          {label}
        </div>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}
