// src/pages/StudentReport.tsx
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LineChart,
  Percent,
  User2,
} from "lucide-react";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import {
  SectionCard,
  Badge,
  Btn,
  ProgressBar,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import ParentSidebarNav from "@/pages/sekolahislamku/components/home/StudentSideBarNav";

/* ================= Types ================ */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

interface ReportFetch {
  student: { id: string; name: string; className: string };
  period: { label: string; start: string; end: string };
  attendance: {
    totalSessions: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    online: number;
  };
  scores: {
    tajwid: number;
    tilawah: number;
    hafalan: number;
    fikih: number;
    akhlak: number;
    average: number;
    min: number;
    max: number;
  };
  memorization: {
    juzProgress: number;
    iqraLevel?: string;
    latest: Array<{
      date: string;
      item: string;
      type: "setoran" | "murajaah";
      score?: number;
      note?: string;
    }>;
  };
  remarks: { homeroom: string; recommendations?: string[] };
}

/* ============== Fake API (dummy rapor) ============= */
async function fetchReport(): Promise<ReportFetch> {
  const today = new Date();
  const iso = (d: Date) => d.toISOString();
  const start = new Date(today.getFullYear(), 6, 15);
  const end = new Date(today.getFullYear(), 11, 15);

  const scores = {
    tajwid: 88,
    tilawah: 91,
    hafalan: 86,
    fikih: 84,
    akhlak: 92,
  };
  const vals = Object.values(scores);
  const average =
    Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;

  return {
    student: { id: "c1", name: "Ahmad", className: "TPA A" },
    period: {
      label: "Semester Ganjil 2025/2026",
      start: iso(start),
      end: iso(end),
    },
    attendance: {
      totalSessions: 20,
      hadir: 18,
      sakit: 1,
      izin: 1,
      alpa: 0,
      online: 2,
    },
    scores: {
      ...scores,
      average,
      min: Math.min(...vals),
      max: Math.max(...vals),
    },
    memorization: {
      juzProgress: 0.6,
      iqraLevel: "Iqra 2",
      latest: [
        {
          date: new Date().toISOString(),
          item: "An-Naba 1–10",
          type: "setoran",
          score: 90,
          note: "Makhraj bagus, perhatikan mad thabi'i.",
        },
        {
          date: new Date(Date.now() - 864e5 * 2).toISOString(),
          item: "Al-Baqarah 255–257",
          type: "murajaah",
          score: 88,
        },
      ],
    },
    remarks: {
      homeroom:
        "Alhamdulillah, progress sangat baik. Fokus meningkat, bacaan lebih tartil. Pertahankan adab ketika teman mendapat giliran.",
      recommendations: [
        "Latihan mad thabi'i 5 menit/hari.",
        "PR: An-Naba 11–15 (lanjutan).",
      ],
    },
  };
}

/* ============== Helpers ============= */
const toID = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const topbarDateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

function grade(num: number) {
  if (num >= 90) return { label: "A", variant: "success" as const };
  if (num >= 80) return { label: "B", variant: "info" as const };
  if (num >= 70) return { label: "C", variant: "secondary" as const };
  if (num >= 60) return { label: "D", variant: "warning" as const };
  return { label: "E", variant: "destructive" as const };
}

/* ============== Page ============= */
export default function StudentRaport() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  const { data: s } = useQuery({
    queryKey: ["student-report"],
    queryFn: fetchReport,
    staleTime: 60_000,
  });

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar pakai ParentTopBar */}
      <ParentTopBar
        palette={palette}
        title="Rapor Nilai"
        gregorianDate={new Date().toISOString()}
        dateFmt={topbarDateFmt}
        // hijriDate="16 Muharram 1447 H" // opsional
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri (PC) */}
          <ParentSidebarNav palette={palette} />

          {/* Konten utama */}
          <div className="flex-1 space-y-6">
            {/* Ringkasan Siswa & Periode */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SectionCard
                  palette={palette}
                  className="p-3"
                  style={{ background: palette.white2 }}
                >
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    Siswa
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <User2 size={16} />
                    <div className="font-medium">{s?.student.name}</div>
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: palette.silver2 }}
                  >
                    Kelas: {s?.student.className}
                  </div>
                </SectionCard>

                <SectionCard
                  palette={palette}
                  className="p-3"
                  style={{ background: palette.white2 }}
                >
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    Periode
                  </div>
                  <div className="mt-1 font-medium">{s?.period.label}</div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: palette.silver2 }}
                  >
                    {s ? `${toID(s.period.start)} — ${toID(s.period.end)}` : ""}
                  </div>
                </SectionCard>

                <SectionCard
                  palette={palette}
                  className="p-3"
                  style={{ background: palette.white2 }}
                >
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    Rata-rata Nilai
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl font-semibold">
                      {s?.scores.average ?? "-"}
                    </span>
                    {s && (
                      <Badge
                        variant={grade(s.scores.average).variant}
                        palette={palette}
                      >
                        <Award size={14} className="mr-1" />
                        {grade(s.scores.average).label}
                      </Badge>
                    )}
                  </div>
                  {s && (
                    <div
                      className="text-xs mt-1"
                      style={{ color: palette.silver2 }}
                    >
                      Min {s.scores.min} • Max {s.scores.max}
                    </div>
                  )}
                </SectionCard>
              </div>
            </SectionCard>

            {/* Rekap Absensi */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="font-medium mb-3 flex items-center gap-2">
                <CalendarDays size={18} /> Rekap Absensi
              </div>
              {s && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    {
                      label: "Hadir",
                      value: s.attendance.hadir,
                      variant: "success" as const,
                    },
                    {
                      label: "Online",
                      value: s.attendance.online,
                      variant: "info" as const,
                    },
                    {
                      label: "Izin",
                      value: s.attendance.izin,
                      variant: "secondary" as const,
                    },
                    {
                      label: "Sakit",
                      value: s.attendance.sakit,
                      variant: "warning" as const,
                    },
                    {
                      label: "Alpa",
                      value: s.attendance.alpa,
                      variant: "destructive" as const,
                    },
                  ].map((it) => {
                    const pct =
                      s.attendance.totalSessions > 0
                        ? Math.round(
                            (it.value / s.attendance.totalSessions) * 100
                          )
                        : 0;
                    return (
                      <SectionCard
                        key={it.label}
                        palette={palette}
                        className="p-3"
                        style={{ background: palette.white2 }}
                      >
                        <div
                          className="text-xs"
                          style={{ color: palette.silver2 }}
                        >
                          {it.label}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant={it.variant} palette={palette}>
                            {it.value}
                          </Badge>
                          <span
                            className="text-xs"
                            style={{ color: palette.silver2 }}
                          >
                            / {s.attendance.totalSessions} sesi
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <Percent size={12} /> {pct}%
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={pct} palette={palette} />
                        </div>
                      </SectionCard>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Nilai per Aspek */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="font-medium mb-3 flex items-center gap-2">
                <GraduationCap size={18} /> Nilai Per Aspek
              </div>
              {s && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { k: "tajwid", label: "Tajwid", val: s.scores.tajwid },
                    { k: "tilawah", label: "Tilawah", val: s.scores.tilawah },
                    { k: "hafalan", label: "Hafalan", val: s.scores.hafalan },
                    { k: "fikih", label: "Fikih/Praktik", val: s.scores.fikih },
                    { k: "akhlak", label: "Akhlak/Adab", val: s.scores.akhlak },
                  ].map((a) => {
                    const g = grade(a.val);
                    return (
                      <SectionCard
                        key={a.k}
                        palette={palette}
                        className="p-3"
                        style={{ background: palette.white2 }}
                      >
                        <div
                          className="text-xs"
                          style={{ color: palette.silver2 }}
                        >
                          {a.label}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xl font-semibold">{a.val}</span>
                          <Badge variant={g.variant} palette={palette}>
                            {g.label}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={a.val} palette={palette} />
                        </div>
                      </SectionCard>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Progres Hafalan & Iqra */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="font-medium mb-3 flex items-center gap-2">
                <LineChart size={18} /> Progres Hafalan & Iqra
              </div>
              {s && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Progres Juz (≈)
                    </div>
                    <div className="mt-2">
                      <ProgressBar
                        value={
                          (Math.min(2, s.memorization.juzProgress) / 2) * 100
                        }
                        palette={palette}
                      />
                      <div
                        className="mt-1 text-xs"
                        style={{ color: palette.silver2 }}
                      >
                        ~ {s.memorization.juzProgress} Juz
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Level Iqra
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <ClipboardList size={16} />
                      <span className="font-medium">
                        {s.memorization.iqraLevel ?? "-"}
                      </span>
                    </div>
                  </SectionCard>

                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Setoran Terakhir
                    </div>
                    <div className="mt-1 text-sm space-y-1">
                      {s.memorization.latest.map((m, i) => (
                        <div
                          key={i}
                          className="rounded-lg border p-2"
                          style={{
                            borderColor: palette.silver1,
                            background: palette.white1,
                          }}
                        >
                          <div
                            className="text-xs"
                            style={{ color: palette.silver2 }}
                          >
                            {toID(m.date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" palette={palette}>
                              {m.type}
                            </Badge>
                            <span className="font-medium">{m.item}</span>
                            {typeof m.score === "number" && (
                              <Badge variant="secondary" palette={palette}>
                                {m.score}
                              </Badge>
                            )}
                          </div>
                          {m.note && (
                            <div
                              className="text-xs mt-1"
                              style={{ color: palette.silver2 }}
                            >
                              {m.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              )}
            </SectionCard>

            {/* Catatan Wali Kelas & Rekomendasi */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="font-medium mb-3 flex items-center gap-2">
                <FileText size={18} /> Catatan Wali Kelas
              </div>
              {s && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Catatan
                    </div>
                    <p className="mt-1 text-sm">{s.remarks.homeroom}</p>
                  </SectionCard>

                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Rekomendasi / PR
                    </div>
                    <ul className="mt-1 list-disc pl-5 text-sm">
                      {(s.remarks.recommendations ?? []).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </SectionCard>
                </div>
              )}
            </SectionCard>

            {/* Footer Aksi */}
            <div className="flex items-center justify-end">
              <Btn variant="secondary" palette={palette}>
                <FileText size={16} className="mr-1" /> Cetak / Unduh
              </Btn>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
