// src/pages/sekolahislamku/assignment/AllAssignment.tsx
import { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
} from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";

type AssignmentStatus = "terbuka" | "selesai" | "terlambat";

type AssignmentItem = {
  id: string;
  title: string;
  kelas?: string;
  dueDateISO: string; // batas pengumpulan
  createdISO: string; // tanggal dibuat
  submitted: number;
  total: number;
  status: AssignmentStatus;
};

const mockAssignments: AssignmentItem[] = [
  {
    id: "a-101",
    title: "Evaluasi Wudhu",
    kelas: "TPA A",
    dueDateISO: new Date(Date.now() + 2 * 864e5).toISOString(),
    createdISO: new Date().toISOString(),
    submitted: 18,
    total: 22,
    status: "terbuka",
  },
  {
    id: "a-102",
    title: "Setoran Hafalan An-Naba 1–10",
    kelas: "TPA B",
    dueDateISO: new Date(Date.now() - 1 * 864e5).toISOString(),
    createdISO: new Date(Date.now() - 3 * 864e5).toISOString(),
    submitted: 12,
    total: 22,
    status: "terlambat",
  },
  {
    id: "a-103",
    title: "Kuis Tajwid Bab 2",
    kelas: "TPA C",
    dueDateISO: new Date(Date.now() - 5 * 864e5).toISOString(),
    createdISO: new Date(Date.now() - 10 * 864e5).toISOString(),
    submitted: 22,
    total: 22,
    status: "selesai",
  },
];

const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";

export default function AllAssignment() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = (isDark ? colors.dark : colors.light) as Palette;

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AssignmentStatus | "semua">("semua");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return mockAssignments.filter((a) => {
      const byStatus = status === "semua" ? true : a.status === status;
      const bySearch =
        a.title.toLowerCase().includes(s) ||
        (a.kelas ?? "").toLowerCase().includes(s);
      return byStatus && bySearch;
    });
  }, [q, status]);

  const statusBadgeTone = (st: AssignmentStatus) => {
    if (st === "terbuka")
      return { text: palette.primary, bg: palette.primary2 };
    if (st === "selesai")
      return { text: palette.success1, bg: palette.success2 };
    return { text: palette.error1, bg: palette.error2 };
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar */}
      <ParentTopBar
        palette={palette}
        gregorianDate={new Date().toISOString()}
        title="Semua Tugas"
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri */}
          <SchoolSidebarNav palette={palette} />

          {/* Konten utama */}
          <div className="flex-1 space-y-6">
            {/* Search & Filter */}
            <SectionCard palette={palette} className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Search */}
                <div
                  className="flex-1 flex items-center gap-2 rounded-2xl border h-10 px-3"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <Search size={16} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari tugas atau kelas…"
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  />
                </div>

                {/* Filter status */}
                <div className="flex items-center gap-2">
                  <Badge palette={palette} variant="outline">
                    Status
                  </Badge>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as AssignmentStatus | "semua")
                    }
                    className="h-10 rounded-xl px-3 text-sm outline-none"
                    style={{
                      background: palette.white1,
                      color: palette.black1,
                      border: `1px solid ${palette.silver1}`,
                    }}
                  >
                    {["semua", "terbuka", "selesai", "terlambat"].map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* List Tugas */}
            <div className="grid gap-3">
              {filtered.length === 0 ? (
                <SectionCard palette={palette} className="p-6 text-center">
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Tidak ada tugas ditemukan.
                  </div>
                </SectionCard>
              ) : (
                filtered.map((a) => {
                  const tone = statusBadgeTone(a.status);
                  return (
                    <SectionCard
                      key={a.id}
                      palette={palette}
                      className="p-3 md:p-4"
                      style={{ background: palette.white1 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="font-semibold truncate">
                              {a.title}
                            </h2>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ color: tone.text, background: tone.bg }}
                            >
                              {a.status[0].toUpperCase() + a.status.slice(1)}
                            </span>
                          </div>

                          <div
                            className="mt-1 text-sm flex flex-wrap gap-3"
                            style={{ color: palette.black2 }}
                          >
                            <span className="flex items-center gap-1">
                              <Calendar size={16} /> Dibuat{" "}
                              {dateShort(a.createdISO)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={16} /> Batas{" "}
                              {dateShort(a.dueDateISO)}
                            </span>
                            {typeof a.submitted === "number" && (
                              <span className="flex items-center gap-1">
                                {a.submitted}/{a.total} terkumpul
                                {a.status === "selesai" ? (
                                  <CheckCircle2 size={16} />
                                ) : a.status === "terlambat" ? (
                                  <AlertTriangle size={16} />
                                ) : null}
                              </span>
                            )}
                            {a.kelas && (
                              <Badge palette={palette} variant="outline">
                                {a.kelas}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex gap-2">
                          <Btn palette={palette} size="sm" variant="white1">
                            Detail
                          </Btn>
                          <Btn palette={palette} size="sm" variant="ghost">
                            Nilai
                          </Btn>
                        </div>
                      </div>
                    </SectionCard>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
