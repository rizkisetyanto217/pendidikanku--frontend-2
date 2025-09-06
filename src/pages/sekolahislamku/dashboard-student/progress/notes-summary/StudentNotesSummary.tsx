// src/pages/StudentNotesDetail.tsx
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Filter,
  Search,
  NotebookPen,
  Star,
} from "lucide-react";
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

/* ===== Types ===== */
interface NoteLog {
  date: string;
  informasiUmum: string;
  materiPersonal?: string;
  penilaianPersonal?: string;
  nilai?: number;
  hafalan?: string;
  pr?: string;
}

interface NotesFetch {
  student: { id: string; name: string; className: string };
  stats: {
    total: number;
    withHafalan: number;
    withPR: number;
    withScore: number;
    avgScore?: number;
  };
  notes: NoteLog[];
}

/* ===== Dummy API ===== */
const iso = (d: Date) => d.toISOString();
const dminus = (n: number) => new Date(Date.now() - n * 864e5);

function makeNotes(days = 30): NoteLog[] {
  const res: NoteLog[] = [];
  for (let i = 0; i < days; i++) {
    const base: NoteLog = {
      date: iso(dminus(i)),
      informasiUmum:
        i % 3 === 0
          ? "Latihan tajwid: mad thabi'i."
          : i % 3 === 1
            ? "Praktik adab di kelas."
            : "Praktik wudhu dan tartil surat pendek.",
    };
    if (i % 2 === 0) base.materiPersonal = "Muroja'ah Iqra 2 halaman 10–12";
    if (i % 4 === 0)
      base.penilaianPersonal = "Fokus meningkat, makhraj membaik.";
    if (i % 5 === 0) base.nilai = 85 + (i % 3) * 3;
    if (i % 3 === 0)
      base.hafalan = i % 6 === 0 ? "An-Naba 1–10" : "Al-Fatihah 1–7";
    if (i % 4 === 2) base.pr = "Latihan bacaan mad pada Iqra 2 halaman 13–14";
    res.push(base);
  }
  return res;
}

async function fetchNotes(childId?: string, days = 30): Promise<NotesFetch> {
  const notes = makeNotes(days);
  const withScore = notes.filter((n) => typeof n.nilai === "number");
  const avg =
    withScore.length > 0
      ? Math.round(
          (withScore.reduce((a, b) => a + (b.nilai ?? 0), 0) /
            withScore.length) *
            10
        ) / 10
      : undefined;

  return {
    student: { id: childId ?? "c1", name: "Ahmad", className: "TPA A" },
    stats: {
      total: notes.length,
      withHafalan: notes.filter((n) => !!n.hafalan).length,
      withPR: notes.filter((n) => !!n.pr).length,
      withScore: withScore.length,
      avgScore: avg,
    },
    notes,
  };
}

/* ===== Helpers ===== */
const dateLong = (isoStr: string) =>
  new Date(isoStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
const dateShort = (isoStr: string) =>
  new Date(isoStr).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
const topbarDateFmt = (isoStr: string) =>
  new Date(isoStr).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* ===== Page ===== */
export default function StudentNotesSummary() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const childId = sp.get("child") ?? undefined;
  const period = sp.get("period") ?? "30"; // 7 | 30 | all
  const category = sp.get("cat") ?? "all"; // all | hafalan | pr | nilai | materi | penilaian
  const q = sp.get("q") ?? "";

  const { data: s } = useQuery({
    queryKey: ["student-notes", childId, period],
    queryFn: () => fetchNotes(childId, period === "all" ? 60 : Number(period)),
    staleTime: 60_000,
  });

  const filtered =
    s?.notes.filter((n) => {
      const matchCat =
        category === "all"
          ? true
          : category === "hafalan"
            ? !!n.hafalan
            : category === "pr"
              ? !!n.pr
              : category === "nilai"
                ? typeof n.nilai === "number"
                : category === "materi"
                  ? !!n.materiPersonal
                  : category === "penilaian"
                    ? !!n.penilaianPersonal
                    : true;
      const text = [
        n.informasiUmum,
        n.materiPersonal,
        n.penilaianPersonal,
        n.hafalan,
        n.pr,
        n.nilai?.toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchQ = q ? text.includes(q.toLowerCase()) : true;
      return matchCat && matchQ;
    }) ?? [];

  const change = (key: "period" | "cat" | "q", value: string) => {
    const next = new URLSearchParams(sp);
    if (value) next.set(key, value);
    else next.delete(key);
    setSp(next, { replace: true });
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar pakai parent */}
      <ParentTopBar
        palette={palette}
        title="Catatan & Hafalan"
        gregorianDate={new Date().toISOString()}
        dateFmt={topbarDateFmt}
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri (PC) */}
          <ParentSidebar palette={palette} />

          {/* Konten utama */}
          <div className="flex-1 space-y-6">
            <Btn
              palette={palette}
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Kembali
            </Btn>
            {/* Ringkasan */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="font-medium mb-3 flex items-center gap-2">
                <CalendarDays size={18} color={palette.quaternary} /> Ringkasan
              </div>
              {s && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.black2 }}>
                      Total Catatan
                    </div>
                    <div className="mt-1 font-semibold">{s.stats.total}</div>
                  </SectionCard>
                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.black2 }}>
                      Ada Hafalan
                    </div>
                    <Badge className="mt-1" variant="info" palette={palette}>
                      {s.stats.withHafalan}
                    </Badge>
                  </SectionCard>
                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.black2 }}>
                      Ada PR
                    </div>
                    <Badge
                      className="mt-1"
                      variant="secondary"
                      palette={palette}
                    >
                      {s.stats.withPR}
                    </Badge>
                  </SectionCard>
                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.black2 }}>
                      Ada Nilai
                    </div>
                    <Badge className="mt-1" variant="outline" palette={palette}>
                      <p style={{ color: palette.black2 }}> {s.stats.withScore}</p>
                    </Badge>
                  </SectionCard>
                  <SectionCard
                    palette={palette}
                    className="p-3"
                    style={{ background: palette.white2 }}
                  >
                    <div className="text-xs" style={{ color: palette.black2 }}>
                      Rata-rata Nilai
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xl font-semibold">
                        {s.stats.avgScore ?? "-"}
                      </span>
                      {typeof s.stats.avgScore === "number" && (
                        <Badge variant="success" palette={palette}>
                          <Star size={14} className="mr-1" />
                          Baik
                        </Badge>
                      )}
                    </div>
                  </SectionCard>
                </div>
              )}
            </SectionCard>

            {/* Filter */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="font-medium mb-3 flex items-center gap-2">
                <Filter size={18} color={palette.quaternary} /> Filter
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: palette.black2 }}>
                    Periode
                  </label>
                  <select
                    value={period}
                    onChange={(e) => change("period", e.target.value)}
                    className="rounded-lg border px-3 py-2 bg-transparent"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <option value="7">7 hari terakhir</option>
                    <option value="30">30 hari terakhir</option>
                    <option value="all">Semua (60 hari)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: palette.black2 }}>
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => change("cat", e.target.value)}
                    className="rounded-lg border px-3 py-2 bg-transparent"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <option value="all">Semua</option>
                    <option value="hafalan">Hafalan</option>
                    <option value="pr">PR</option>
                    <option value="nilai">Nilai</option>
                    <option value="materi">Materi</option>
                    <option value="penilaian">Penilaian</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: palette.black2 }}>
                    Cari
                  </label>
                  <div
                    className="flex items-center rounded-lg border px-2"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <Search size={16} className="mr-1" />
                    <input
                      value={q}
                      onChange={(e) => change("q", e.target.value)}
                      placeholder="kata kunci…"
                      className="w-full bg-transparent py-2 outline-none"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Daftar Catatan */}
            <SectionCard palette={palette} className="p-4 md:p-5">
              <div className="font-medium mb-3 flex items-center gap-2">
                <NotebookPen size={18} color={palette.quaternary} /> Daftar
                Catatan
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filtered.length === 0 && (
                  <div
                    className="rounded-xl border px-3 py-3 text-sm"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white2,
                      color: palette.silver2,
                    }}
                  >
                    Tidak ada catatan untuk filter saat ini.
                  </div>
                )}

                {filtered.map((n, i) => (
                  <div
                    key={`${n.date}-${i}`}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white2,
                    }}
                  >
                    <div
                      className="text-xs mb-2"
                      style={{ color: palette.black2 }}
                    >
                      {dateShort(n.date)} • {dateLong(n.date)}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">Info Umum:</span>{" "}
                        {n.informasiUmum}
                      </div>
                      {n.materiPersonal && (
                        <div>
                          <span className="font-medium">Materi:</span>{" "}
                          {n.materiPersonal}
                        </div>
                      )}
                      {n.hafalan && (
                        <div>
                          <span className="font-medium">Hafalan:</span>{" "}
                          {n.hafalan}
                        </div>
                      )}
                      {n.penilaianPersonal && (
                        <div>
                          <span className="font-medium">Penilaian:</span>{" "}
                          {n.penilaianPersonal}
                        </div>
                      )}
                      {typeof n.nilai === "number" && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Nilai:</span> {n.nilai}
                          <Badge
                            variant={
                              n.nilai >= 90
                                ? "success"
                                : n.nilai >= 80
                                  ? "info"
                                  : "secondary"
                            }
                            palette={palette}
                          >
                            {n.nilai >= 90 ? "A" : n.nilai >= 80 ? "B" : "C"}
                          </Badge>
                        </div>
                      )}
                      {n.pr && (
                        <div>
                          <span className="font-medium">PR:</span> {n.pr}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
