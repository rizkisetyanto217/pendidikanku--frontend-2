// src/pages/sekolahislamku/teacher/TeacherGrading.tsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import TeacherSidebarNav from "@/pages/sekolahislamku/components/home/TeacherSideBarNav";

import {
  ClipboardList,
  Filter,
  Search,
  CheckCircle2,
  Download,
  Plus,
  CalendarDays,
  Users,
} from "lucide-react";
import TeacherTopBar from "../../components/home/TeacherTopBar";

/* ================= Types ================ */
type Assignment = {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  submitted: number;
  graded: number;
  total: number;
};

type Submission = {
  id: string;
  studentName: string;
  status: "submitted" | "graded" | "missing";
  score?: number;
  submittedAt?: string;
};

type GradingPayload = {
  gregorianDate: string;
  hijriDate: string;
  classes: string[];
  summary: {
    assignments: number;
    toGrade: number; // belum dinilai
    graded: number; // selesai dinilai
    average: number; // rata-rata nilai
  };
  assignments: Assignment[];
  submissionsByAssignment: Record<string, Submission[]>;
};

/* ============ Fake API layer (replace with axios) ============ */
async function fetchTeacherGrading(): Promise<GradingPayload> {
  const now = new Date();
  const iso = now.toISOString();

  const assignments: Assignment[] = [
    {
      id: "a1",
      title: "Evaluasi Wudhu",
      className: "TPA A",
      dueDate: new Date(now.getTime() + 1 * 864e5).toISOString(),
      submitted: 18,
      graded: 10,
      total: 22,
    },
    {
      id: "a2",
      title: "Setoran Hafalan An-Naba 1–10",
      className: "TPA B",
      dueDate: new Date(now.getTime() + 2 * 864e5).toISOString(),
      submitted: 12,
      graded: 7,
      total: 20,
    },
    {
      id: "a3",
      title: "Latihan Makhraj (ba-ta-tha)",
      className: "TPA A",
      dueDate: new Date(now.getTime() + 3 * 864e5).toISOString(),
      submitted: 5,
      graded: 0,
      total: 22,
    },
  ];

  const submissionsA1: Submission[] = [
    {
      id: "s1",
      studentName: "Ahmad",
      status: "graded",
      score: 88,
      submittedAt: iso,
    },
    {
      id: "s2",
      studentName: "Fatimah",
      status: "graded",
      score: 92,
      submittedAt: iso,
    },
    { id: "s3", studentName: "Hasan", status: "submitted", submittedAt: iso },
    { id: "s4", studentName: "Aisyah", status: "submitted", submittedAt: iso },
    { id: "s5", studentName: "Umar", status: "missing" },
  ];

  const submissionsA2: Submission[] = [
    {
      id: "b1",
      studentName: "Bilal",
      status: "graded",
      score: 80,
      submittedAt: iso,
    },
    { id: "b2", studentName: "Huda", status: "submitted", submittedAt: iso },
  ];

  return Promise.resolve({
    gregorianDate: iso,
    hijriDate: "16 Muharram 1447 H",
    classes: ["TPA A", "TPA B"],
    summary: {
      assignments: assignments.length,
      toGrade: assignments.reduce(
        (n, a) => n + Math.max(0, a.submitted - a.graded),
        0
      ),
      graded: assignments.reduce((n, a) => n + a.graded, 0),
      average: 84,
    },
    assignments,
    submissionsByAssignment: {
      a1: submissionsA1,
      a2: submissionsA2,
      a3: [],
    },
  });
}

/* ================= Helpers ================ */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";
const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    : "-";
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

/* ================= Page ================= */
export default function TeacherGrading() {
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  const { data, isLoading } = useQuery({
    queryKey: ["teacher-grading"],
    queryFn: fetchTeacherGrading,
    staleTime: 60_000,
  });

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<
    "all" | "waiting" | "inprogress" | "done"
  >("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () =>
      data?.assignments.find(
        (a) => a.id === (selectedId ?? data?.assignments[0]?.id)
      ),
    [data?.assignments, selectedId]
  );
  const submissions = useMemo(() => {
    const all = selected
      ? (data?.submissionsByAssignment[selected.id] ?? [])
      : [];
    const filtered = q.trim()
      ? all.filter((s) =>
          s.studentName.toLowerCase().includes(q.trim().toLowerCase())
        )
      : all;
    return filtered;
  }, [data?.submissionsByAssignment, selected, q]);

  const filteredAssignments = useMemo(() => {
    let items = data?.assignments ?? [];
    if (classFilter !== "all")
      items = items.filter((a) => a.className === classFilter);
    if (status !== "all") {
      items = items.filter((a) => {
        const done = a.graded >= a.total;
        const waiting = a.submitted - a.graded > 0;
        if (status === "done") return done;
        if (status === "waiting") return waiting;
        if (status === "inprogress") return !done && a.graded > 0;
        return true;
      });
    }
    if (q.trim())
      items = items.filter((a) =>
        a.title.toLowerCase().includes(q.trim().toLowerCase())
      );
    return items;
  }, [data?.assignments, classFilter, status, q]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <TeacherTopBar
        palette={palette}
        title="Penilaian"
        gregorianDate={data?.gregorianDate}
        hijriDate={data?.hijriDate}
        dateFmt={(iso) => dateLong(iso)}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar */}
          <TeacherSidebarNav palette={palette} />

          {/* Main */}
          <div className="flex-1 space-y-6">
            {/* ===== Filter & Summary ===== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <SectionCard palette={palette} className="lg:col-span-8">
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-3 flex items-center gap-2">
                    <Filter size={16} /> Filter & Aksi
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {/* Search */}
                    <div
                      className="flex items-center gap-2 rounded-xl border px-3 h-10"
                      style={{
                        borderColor: palette.silver1,
                        background: palette.white1,
                      }}
                    >
                      <Search size={16} />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Cari penilaian…"
                        className="bg-transparent outline-none text-sm flex-1"
                        style={{ color: palette.black1 }}
                      />
                    </div>

                    {/* Kelas */}
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Kelas
                      </span>
                      <select
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="h-10 rounded-xl border px-3 text-sm"
                        style={{
                          background: palette.white1,
                          color: palette.black1,
                          borderColor: palette.silver1,
                        }}
                      >
                        <option value="all">Semua</option>
                        {(data?.classes ?? []).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1">
                      {(["all", "waiting", "inprogress", "done"] as const).map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className="px-3 h-10 rounded-xl border text-sm"
                            style={{
                              background:
                                status === s
                                  ? palette.primary2
                                  : palette.white1,
                              color:
                                status === s ? palette.primary : palette.black1,
                              borderColor:
                                status === s
                                  ? palette.primary
                                  : palette.silver1,
                            }}
                          >
                            {s === "all"
                              ? "Semua"
                              : s === "waiting"
                                ? "Belum dinilai"
                                : s === "done"
                                  ? "Selesai"
                                  : "Progres"}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn
                      palette={palette}
                      onClick={() => alert("Buat Penilaian")}
                    >
                      <Plus className="mr-2" size={16} />
                      Buat Penilaian
                    </Btn>
                    <Btn
                      palette={palette}
                      variant="secondary"
                      onClick={() => alert("Export Rekap")}
                    >
                      <Download className="mr-2" size={16} />
                      Export
                    </Btn>
                  </div>
                </div>
              </SectionCard>

              <SectionCard palette={palette} className="lg:col-span-4">
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Ringkasan
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <StatPill
                      palette={palette}
                      label="Total Penilaian"
                      value={data?.summary.assignments ?? 0}
                    />
                    <StatPill
                      palette={palette}
                      label="Belum Dinilai"
                      value={data?.summary.toGrade ?? 0}
                    />
                    <StatPill
                      palette={palette}
                      label="Sudah Dinilai"
                      value={data?.summary.graded ?? 0}
                    />
                    <StatPill
                      palette={palette}
                      label="Rata-rata"
                      value={`${data?.summary.average ?? 0}`}
                    />
                  </div>
                </div>
              </SectionCard>
            </section>

            {/* ===== List + Detail ===== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* List */}
              <SectionCard palette={palette} className="lg:col-span-6">
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-2 flex items-center gap-2">
                    <ClipboardList size={16} /> Daftar Penilaian
                  </div>

                  <div className="space-y-3">
                    {filteredAssignments.map((a) => {
                      const submittedPct = pct(a.submitted, a.total);
                      const gradedPct = pct(a.graded, a.total);
                      const isActive = (selected?.id ?? "") === a.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => setSelectedId(a.id)}
                          className="w-full text-left"
                        >
                          <div
                            className="p-3 rounded-xl border transition-all"
                            style={{
                              borderColor: isActive
                                ? palette.primary
                                : palette.silver1,
                              boxShadow: isActive
                                ? `0 0 0 1px ${palette.primary} inset`
                                : "none",
                              background: palette.white1,
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {a.title}
                                </div>
                                <div
                                  className="text-xs mt-0.5"
                                  style={{ color: palette.silver2 }}
                                >
                                  <CalendarDays
                                    className="inline mr-1"
                                    size={14}
                                  />
                                  batas {dateShort(a.dueDate)} • {a.submitted}/
                                  {a.total} terkumpul • {a.graded} dinilai
                                </div>
                              </div>
                              <Badge
                                palette={palette}
                                variant="outline"
                                className="shrink-0"
                              >
                                {gradedPct}%
                              </Badge>
                            </div>

                            {/* progress (graded over total) */}
                            <div
                              className="mt-2 h-2 w-full rounded-full overflow-hidden"
                              style={{ background: palette.white2 }}
                            >
                              <div
                                className="h-full"
                                style={{
                                  width: `${submittedPct}%`,
                                  background: palette.silver1,
                                }}
                              />
                              <div
                                className="h-full -mt-2"
                                style={{
                                  width: `${gradedPct}%`,
                                  background: palette.secondary,
                                }}
                              />
                            </div>

                            <div className="mt-2 flex gap-2">
                              <Badge palette={palette} variant="outline">
                                <Users className="mr-1" size={14} />
                                {a.className}
                              </Badge>
                              {a.graded >= a.total ? (
                                <Badge palette={palette} variant="success">
                                  Selesai
                                </Badge>
                              ) : a.submitted - a.graded > 0 ? (
                                <Badge palette={palette} variant="warning">
                                  Perlu Dinilai
                                </Badge>
                              ) : (
                                <Badge palette={palette} variant="info">
                                  Menunggu
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {filteredAssignments.length === 0 && (
                      <div
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Tidak ada penilaian sesuai filter.
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* Detail */}
              <SectionCard palette={palette} className="lg:col-span-6">
                <div className="p-4 md:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">
                      {selected ? selected.title : "Detail Penilaian"}
                    </div>
                    {selected && (
                      <Badge palette={palette} variant="outline">
                        {selected.className} • batas{" "}
                        {dateShort(selected.dueDate)}
                      </Badge>
                    )}
                  </div>

                  {/* actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn
                      palette={palette}
                      onClick={() => alert("Nilai sekarang")}
                    >
                      Nilai
                    </Btn>
                    <Btn
                      palette={palette}
                      variant="secondary"
                      onClick={() => alert("Tandai selesai")}
                    >
                      Tandai Selesai
                    </Btn>
                  </div>

                  {/* table submissions */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="flex items-center gap-2 rounded-xl border px-3 h-10"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white1,
                        }}
                      >
                        <Search size={16} />
                        <input
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          placeholder="Cari nama siswa…"
                          className="bg-transparent outline-none text-sm"
                          style={{ color: palette.black1 }}
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ color: palette.silver2 }}>
                            <th className="text-left py-2 pr-3 font-medium">
                              Siswa
                            </th>
                            <th className="text-left py-2 px-3 font-medium">
                              Status
                            </th>
                            <th className="text-left py-2 px-3 font-medium">
                              Nilai
                            </th>
                            <th className="text-right py-2 pl-3 font-medium">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(submissions ?? []).map((s) => (
                            <tr
                              key={s.id}
                              className="border-t"
                              style={{ borderColor: palette.silver1 }}
                            >
                              <td className="py-3 pr-3">
                                <div className="font-medium">
                                  {s.studentName}
                                </div>
                                {s.submittedAt && (
                                  <div
                                    className="text-xs"
                                    style={{ color: palette.silver2 }}
                                  >
                                    kirim {dateShort(s.submittedAt)}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <Badge
                                  palette={palette}
                                  variant={
                                    s.status === "graded"
                                      ? "success"
                                      : s.status === "submitted"
                                        ? "info"
                                        : "destructive"
                                  }
                                >
                                  {s.status === "graded"
                                    ? "Dinilai"
                                    : s.status === "submitted"
                                      ? "Terkumpul"
                                      : "Belum"}
                                </Badge>
                              </td>
                              <td className="py-3 px-3">
                                {typeof s.score === "number" ? s.score : "-"}
                              </td>
                              <td className="py-3 pl-3 text-right">
                                <div className="inline-flex gap-2">
                                  <Btn
                                    palette={palette}
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      alert(`Nilai ${s.studentName}`)
                                    }
                                  >
                                    Nilai
                                  </Btn>
                                  <Btn
                                    palette={palette}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      alert(`Detail ${s.studentName}`)
                                    }
                                  >
                                    Detail
                                  </Btn>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {(!submissions || submissions.length === 0) && (
                            <tr>
                              <td
                                colSpan={4}
                                className="py-6 text-center"
                                style={{ color: palette.silver2 }}
                              >
                                Belum ada data.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </section>

            {isLoading && (
              <div className="text-sm" style={{ color: palette.silver2 }}>
                Memuat data…
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* =============== Small UI helpers =============== */
function StatPill({
  palette,
  label,
  value,
}: {
  palette: Palette;
  label: string;
  value: number | string;
}) {
  return (
    <div
      className="p-3 rounded-xl border"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="text-xs" style={{ color: palette.silver2 }}>
        {label}
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
