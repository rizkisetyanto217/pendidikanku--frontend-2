// src/pages/sekolahislamku/student/DetailStudent.tsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { ArrowLeft, GraduationCap, Clock, Activity } from "lucide-react";
import React from "react";

type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type AttendanceMode = "onsite" | "online";

export type StudentDetailState = {
  id: string;
  name: string;
  avatarUrl?: string;
  statusToday?: AttendanceStatus | null;
  mode?: AttendanceMode;
  time?: string;
  iqraLevel?: string;
  juzProgress?: number; // 0..1
  lastScore?: number;
  className?: string;
};

const DetailStudent: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const { state } = useLocation() as {
    state?: { student?: StudentDetailState };
  };

  const s = state?.student;

  const badgeColor = (st?: AttendanceStatus | null) => {
    switch (st) {
      case "hadir":
        return { bg: palette.success2, fg: palette.success1 };
      case "online":
        return { bg: palette.secondary, fg: palette.secondary };
      case "sakit":
        return { bg: palette.warning1, fg: palette.warning1 };
      case "izin":
        return { bg: palette.quaternary, fg: palette.quaternary };
      case "alpa":
        return { bg: palette.error2, fg: palette.error1 };
      default:
        return { bg: palette.silver1, fg: palette.black2 };
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Siswa"
        gregorianDate={new Date().toISOString()}
      />

      <main className="mx-auto Replace px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 mb-6 lg:mb-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-full p-1 hover:opacity-80"
                title="Kembali"
              >
                <ArrowLeft size={20} />
              </button>
              <span>Profil Siswa</span>
            </div>

            <SectionCard palette={palette} className="p-6 space-y-6">
              {/* Header Profil */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                  style={{
                    background: palette.primary2,
                    color: palette.primary,
                  }}
                >
                  {s?.name ? s.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-semibold truncate">
                    {s?.name ?? `ID: ${studentId ?? "-"}`}
                  </div>
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    {s?.className ? `Kelas ${s.className}` : "—"}
                  </div>
                </div>
              </div>

              {/* Info Utama */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-xs font-medium opacity-60 flex items-center gap-2">
                    <GraduationCap size={12} />
                    Level Iqra
                  </div>
                  <div className="text-lg font-semibold">
                    {s?.iqraLevel ?? (
                      <span className="opacity-60">Belum ada</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-medium opacity-60 flex items-center gap-2">
                    <Clock size={12} />
                    Waktu Kehadiran
                  </div>
                  <div className="text-lg font-semibold">
                    {s?.time ?? <span className="opacity-60">—</span>}
                  </div>
                </div>
              </div>

              {/* Progress & Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-medium opacity-60 flex items-center gap-2 mb-2">
                    <Activity size={12} />
                    Progress Juz
                  </div>
                  <div
                    className="h-2 w-full rounded-full overflow-hidden"
                    style={{ background: palette.white2 }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.round((s?.juzProgress ?? 0) * 100)}%`,
                        background: palette.secondary,
                      }}
                    />
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: palette.silver2 }}
                  >
                    {Math.round((s?.juzProgress ?? 0) * 100)}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs font-medium opacity-60">
                    Status Hari Ini
                  </div>
                  <Badge palette={palette}>
                    {(s?.statusToday ?? "—").toString().toUpperCase()}
                  </Badge>
                  {s?.mode ? (
                    <Badge palette={palette} variant="outline">
                      {s.mode.toUpperCase()}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {/* Nilai Terakhir */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-xs font-medium opacity-60">
                    Nilai Terakhir
                  </div>
                  <div className="text-2xl font-bold">
                    {typeof s?.lastScore === "number" ? s.lastScore : "—"}
                  </div>
                </div>
              </div>

              {/* Aksi */}
              <div className="flex flex-wrap gap-2 justify-end">
                <Btn palette={palette} onClick={() => navigate(-1)}>
                  Kembali
                </Btn>
              </div>

              {/* Fallback info kalau datang tanpa state */}
              {!s && (
                <div
                  className="text-sm mt-2"
                  style={{ color: palette.silver2 }}
                >
                  Data siswa tidak dikirim via <code>location.state</code>. Buka
                  halaman ini dari “Daftar Siswa” agar detail terisi, atau
                  tambahkan fetch by ID.
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailStudent;
