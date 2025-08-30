import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Award, User } from "lucide-react";

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// Hanya tipe untuk state yang dibawa dari StudentDashboard
type LocationState = {
  child?: {
    id: string;
    name: string;
    className: string;
    avatarUrl?: string;
    attendanceToday?: "present" | "online" | "absent" | null;
    memorizationJuz?: number;
    iqraLevel?: string;
    lastScore?: number;
  };
  today?: {
    attendance: {
      status: "hadir" | "sakit" | "izin" | "alpa" | "online";
      mode?: "onsite" | "online";
      time?: string;
    };
    informasiUmum: string;
    nilai?: number;
    materiPersonal?: string;
    penilaianPersonal?: string;
    hafalan?: string;
    pr?: string;
  };
};

export default function StudentDetail() {
  const { state } = useLocation() as { state?: LocationState };
  const navigate = useNavigate();

  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  const child = state?.child;
  const today = state?.today;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Siswa"
        gregorianDate={new Date().toISOString()}
        dateFmt={(iso) =>
          new Date(iso).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        }
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <Btn onClick={() => navigate(-1)} palette={palette} variant="ghost" size="sm">
                <ArrowLeft size={16} className="mr-1" />
                Kembali
              </Btn>
            </div>

            {/* Info siswa */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={32} style={{ color: palette.silver2 }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{child?.name ?? "-"}</h2>
                  <p className="text-sm" style={{ color: palette.black2 }}>
                    {child?.className ?? "-"}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Ringkasan hari ini */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-6 space-y-3">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <CalendarDays size={18} /> Ringkasan Hari Ini
                </h3>

                <ul className="text-sm space-y-2">
                  <li>
                    Kehadiran:{" "}
                    <Badge
                      palette={palette}
                      variant={
                        today?.attendance.status === "hadir"
                          ? "success"
                          : today?.attendance.status === "online"
                            ? "info"
                            : "destructive"
                      }
                    >
                      {today?.attendance.status ?? "-"}
                    </Badge>{" "}
                    {today?.attendance.time && `(${today.attendance.time})`}
                  </li>
                  <li>Informasi: {today?.informasiUmum ?? "-"}</li>
                  {today?.materiPersonal && (
                    <li>Materi: {today.materiPersonal}</li>
                  )}
                  {today?.penilaianPersonal && (
                    <li>Catatan: {today.penilaianPersonal}</li>
                  )}
                  {today?.hafalan && <li>Hafalan: {today.hafalan}</li>}
                  {today?.pr && <li>PR: {today.pr}</li>}
                </ul>
              </div>
            </SectionCard>

            {/* Nilai & perkembangan */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-6 space-y-3">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Award size={18} /> Perkembangan
                </h3>

                <ul className="text-sm space-y-2">
                  <li>Juz Hafalan: {child?.memorizationJuz ?? 0}</li>
                  <li>Tingkat Iqra: {child?.iqraLevel ?? "-"}</li>
                  <li>Nilai Terakhir: {child?.lastScore ?? "-"}</li>
                  {today?.nilai !== undefined && (
                    <li>Nilai Hari Ini: {today.nilai}</li>
                  )}
                </ul>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
