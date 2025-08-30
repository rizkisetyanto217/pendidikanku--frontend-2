// src/pages/sekolahislamku/attendance/AttendanceDetail.tsx
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { useMemo } from "react";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

type ClassInfo = {
  id: string;
  name: string;
  time?: string;
  room?: string;
};

type NavState =
  | { classInfo?: ClassInfo; dateISO?: string }
  | { classRow?: ClassInfo; dateISO?: string }
  | undefined;

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

export default function AttendanceDetail() {
  const { id } = useParams(); // id kelas dari URL
  const { state } = useLocation() as { state: NavState };
  const navigate = useNavigate();

  // tema
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  // dukung state lama (classRow) & baru (classInfo)
  const classInfo: ClassInfo | undefined = useMemo(() => {
    // @ts-expect-error kompat untuk dua bentuk state
    return state?.classInfo ?? state?.classRow ?? undefined;
  }, [state]);

  const effectiveDateISO = (state as any)?.dateISO ?? new Date().toISOString();

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar */}
      <ParentTopBar
        palette={palette}
        title="Detail Kehadiran Kelas"
        gregorianDate={effectiveDateISO}
        dateFmt={(iso) => dateLong(iso)}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri */}
          <ParentSidebar palette={palette} />

          {/* Konten utama */}
          <div className="flex-1 space-y-6">
            {/* Aksi kembali */}
            <div>
              <Btn
                palette={palette}
                variant="white1"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} className="mr-2" />
                Kembali
              </Btn>
            </div>

            {/* Info Ringkas Kelas */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-3 flex items-center justify-between">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <GraduationCap size={18} color={palette.quaternary} />
                  {classInfo?.name ?? "Kelas"}
                </h2>
                <Badge variant="outline" palette={palette}>
                  <CalendarDays size={14} className="mr-1" />
                  {dateLong(effectiveDateISO)}
                </Badge>
              </div>

              <div className="px-4 md:px-5 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    ID Kelas
                  </div>
                  <div className="font-semibold">
                    {classInfo?.id ?? id ?? "-"}
                  </div>
                </div>

                <div
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <div
                    className="text-xs flex items-center gap-1"
                    style={{ color: palette.silver2 }}
                  >
                    <MapPin size={14} />
                    Ruangan
                  </div>
                  <div className="font-semibold">{classInfo?.room ?? "-"}</div>
                </div>

                <div
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <div
                    className="text-xs flex items-center gap-1"
                    style={{ color: palette.silver2 }}
                  >
                    <Clock size={14} />
                    Jam
                  </div>
                  <div className="font-semibold">{classInfo?.time ?? "-"}</div>
                </div>
              </div>
            </SectionCard>

            {/* Placeholder konten detail (absensi/aksi) — taruh komponen lanjutan di sini */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5">
                <div className="text-sm" style={{ color: palette.silver2 }}>
                  Konten detail kehadiran (daftar siswa, editor, dan aksi) bisa
                  diletakkan di sini.
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
