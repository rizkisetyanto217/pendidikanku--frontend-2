// src/pages/sekolahislamku/teacher/TeacherGrading.tsx
import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import {
  Filter,
  Search,
  CheckCircle2,
  Download,
  Plus,
  CalendarDays,
  Users,
  ClipboardList,
  BookOpen,
  Clock,
  TrendingUp,
  FileText,
  Eye,
} from "lucide-react";

import ParentTopBar from "../../components/home/ParentTopBar";
import ParentSidebar from "../../components/home/ParentSideBar";
import ModalGrading from "./components/ModalGrading";

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
    toGrade: number;
    graded: number;
    average: number;
  };
  assignments: Assignment[];
  submissionsByAssignment: Record<string, Submission[]>;
};

/* ============ Fake API (ganti ke axios bila siap) ============ */
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
  return {
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
    submissionsByAssignment: { a1: submissionsA1, a2: submissionsA2, a3: [] },
  };
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

/* =============== UI Components =============== */
function StatCard({
  palette,
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
}: {
  palette: Palette;
  icon: any;
  label: string;
  value: number | string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div
      className="p-4 rounded-xl border transition-all hover:shadow-sm"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: palette.primary2 }}
          >
            <Icon size={16} style={{ color: palette.primary }} />
          </div>
          <div>
            <div
              className="text-xs font-medium"
              style={{ color: palette.silver2 }}
            >
              {label}
            </div>
            <div className="text-xl font-bold">{value}</div>
            {subtitle && (
              <div className="text-xs" style={{ color: palette.silver2 }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {trend && (
          <TrendingUp
            size={14}
            style={{
              color:
                trend === "up"
                  ? "#10B981"
                  : trend === "down"
                    ? "#EF4444"
                    : palette.silver2,
            }}
          />
        )}
      </div>
    </div>
  );
}

function ProgressBar({
  palette,
  value,
  max,
  showLabel = true,
}: {
  palette: Palette;
  value: number;
  max: number;
  showLabel?: boolean;
}) {
  const percentage = pct(value, max);
  return (
    <div className="space-y-1">
      {showLabel && (
        <div
          className="flex justify-between text-xs"
          style={{ color: palette.silver2 }}
        >
          <span>
            {value}/{max}
          </span>
          <span>{percentage}%</span>
        </div>
      )}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: palette.silver1 }}
      >
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{ backgroundColor: palette.primary, width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function FilterChip({
  palette,
  label,
  active,
  onClick,
  count,
}: {
  palette: Palette;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all hover:scale-105 snap-start"
      style={{
        background: active ? palette.primary2 : palette.white1,
        color: active ? palette.primary : palette.black1,
        borderColor: active ? palette.primary : palette.silver1,
      }}
    >
      {label}
      {typeof count === "number" && (
        <span
          className="px-2 py-0.5 rounded-full text-xs"
          style={{
            background: active ? palette.primary : palette.silver1,
            color: active ? palette.white1 : palette.silver2,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

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
  const [submissionSearchQ, setSubmissionSearchQ] = useState("");
  const [mobileTab, setMobileTab] = useState<"list" | "detail">("list");

  // modal grading
  const [gradingOpen, setGradingOpen] = useState(false);
  const [gradingStudent, setGradingStudent] = useState<{
    id: string;
    name: string;
    score?: number;
  } | null>(null);

  // derived data
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

  const selected =
    data?.assignments.find(
      (a) => a.id === (selectedId ?? data?.assignments[0]?.id)
    ) ?? filteredAssignments[0];

  const submissions = useMemo(() => {
    const all = selected
      ? (data?.submissionsByAssignment[selected.id] ?? [])
      : [];
    if (!submissionSearchQ.trim()) return all;
    return all.filter((s) =>
      s.studentName
        .toLowerCase()
        .includes(submissionSearchQ.trim().toLowerCase())
    );
  }, [data?.submissionsByAssignment, selected, submissionSearchQ]);

  const statusCounts = useMemo(() => {
    const assignments = data?.assignments ?? [];
    return {
      all: assignments.length,
      waiting: assignments.filter((a) => a.submitted - a.graded > 0).length,
      inprogress: assignments.filter((a) => a.graded > 0 && a.graded < a.total)
        .length,
      done: assignments.filter((a) => a.graded >= a.total).length,
    };
  }, [data?.assignments]);

  const emptyAssignments = filteredAssignments.length === 0;

  // handlers
  const openGradeModal = useCallback((s: Submission) => {
    setGradingStudent({ id: s.id, name: s.studentName, score: s.score });
    setGradingOpen(true);
  }, []);

  const { slug } = useParams<{ slug: string }>();


  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Penilaian"
        gregorianDate={data?.gregorianDate}
        hijriDate={data?.hijriDate}
        dateFmt={(iso) => dateLong(iso)}
      />

      {/* Modal Grading */}
      <ModalGrading
        open={gradingOpen}
        onClose={() => setGradingOpen(false)}
        palette={palette}
        student={gradingStudent ?? undefined}
        assignmentTitle={
          selected
            ? `${selected.title}${selected.className ? ` — (${selected.className})` : ""}`
            : undefined
        }
        onSubmit={(payload) => {
          alert(`Nilai disimpan: ${payload.id} = ${payload.score}`);
          // TODO: update state/API
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          {/* Sidebar */}
          <ParentSidebar palette={palette} />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* ---- Stats Overview ---- */}
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  palette={palette}
                  icon={BookOpen}
                  label="Total Penilaian"
                  value={data?.summary.assignments ?? 0}
                  subtitle="tugas aktif"
                  trend="neutral"
                />
                <StatCard
                  palette={palette}
                  icon={Clock}
                  label="Belum Dinilai"
                  value={data?.summary.toGrade ?? 0}
                  subtitle="menunggu penilaian"
                  trend="down"
                />
                <StatCard
                  palette={palette}
                  icon={CheckCircle2}
                  label="Sudah Dinilai"
                  value={data?.summary.graded ?? 0}
                  subtitle="telah selesai"
                  trend="up"
                />
                <StatCard
                  palette={palette}
                  icon={TrendingUp}
                  label="Rata-rata Nilai"
                  value={`${data?.summary.average ?? 0}`}
                  subtitle="skor keseluruhan"
                  trend="up"
                />
              </div>
            </section>

            {/* ---- Filters & Actions ---- */}
            <SectionCard palette={palette}>
              <div className="p-3 md:p-5">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h2 className="text-sm md:text-lg font-semibold flex items-center gap-2">
                    <Filter size={18} /> Filter & Kelola Penilaian
                  </h2>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {/* Search */}
                  <div
                    className="flex items-center gap-3 rounded-xl border px-3 py-2.5 md:px-4 md:py-3 w-full"
                    style={{
                      borderColor: palette.silver1,
                      background: palette.white1,
                    }}
                  >
                    <Search size={18} style={{ color: palette.silver2 }} />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Cari tugas…"
                      className="bg-transparent outline-none text-sm w-full"
                      style={{ color: palette.black1 }}
                    />
                  </div>

                  {/* Status chips */}
                  <div className="space-y-2">
                    <span
                      className="text-xs font-medium"
                      style={{ color: palette.silver2 }}
                    >
                      Status
                    </span>
                    <div
                      className="relative -mx-3 px-3 overflow-x-auto no-scrollbar"
                      style={{
                        WebkitMaskImage:
                          "linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)",
                        maskImage:
                          "linear-gradient(90deg, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)",
                      }}
                    >
                      <div className="flex gap-2 snap-x">
                        <FilterChip
                          palette={palette}
                          label="Semua"
                          active={status === "all"}
                          onClick={() => setStatus("all")}
                          count={statusCounts.all}
                        />
                        <FilterChip
                          palette={palette}
                          label="Menunggu"
                          active={status === "waiting"}
                          onClick={() => setStatus("waiting")}
                          count={statusCounts.waiting}
                        />
                        <FilterChip
                          palette={palette}
                          label="Progres"
                          active={status === "inprogress"}
                          onClick={() => setStatus("inprogress")}
                          count={statusCounts.inprogress}
                        />
                        <FilterChip
                          palette={palette}
                          label="Selesai"
                          active={status === "done"}
                          onClick={() => setStatus("done")}
                          count={statusCounts.done}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kelas select */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium"
                      style={{ color: palette.silver2 }}
                    >
                      Kelas
                    </span>
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg border text-sm bg-transparent flex-1"
                      style={{
                        background: palette.white1,
                        color: palette.black1,
                        borderColor: palette.silver1,
                      }}
                    >
                      <option value="all">Semua Kelas</option>
                      {(data?.classes ?? []).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ---- Mobile Tabs (daftar/detail) ---- */}
            <div className="block lg:hidden">
              <SectionCard palette={palette} className="p-2">
                <div
                  className="grid grid-cols-2 gap-1 rounded-xl p-1 border"
                  style={{
                    background: palette.white1,
                    borderColor: palette.silver1,
                  }}
                >
                  {(["list", "detail"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setMobileTab(t)}
                      className="h-9 rounded-lg text-sm font-semibold"
                      style={{
                        background:
                          mobileTab === t ? palette.primary2 : "transparent",
                        color:
                          mobileTab === t ? palette.primary : palette.black1,
                        border: `1px solid ${mobileTab === t ? palette.primary : "transparent"}`,
                      }}
                    >
                      {t === "list" ? "Daftar Tugas" : "Detail Tugas"}
                    </button>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* ---- Assignment List & Detail ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* ----- LIST ----- */}
              <SectionCard
                palette={palette}
                className={`lg:col-span-5 ${mobileTab === "list" ? "block" : "hidden lg:block"}`}
              >
                <div className="p-3 md:p-5">
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
                    <ClipboardList size={18} /> Daftar Tugas (
                    {filteredAssignments.length})
                  </h3>

                  {/* EMPTY STATE */}
                  {emptyAssignments && (
                    <div
                      className="text-center py-10 rounded-xl border-2 border-dashed"
                      style={{
                        borderColor: palette.silver1,
                        color: palette.silver2,
                        background: palette.white1,
                      }}
                    >
                      <ClipboardList
                        size={36}
                        className="mx-auto mb-2 opacity-60"
                      />
                      <p className="text-sm">
                        Belum ada tugas untuk filter saat ini.
                      </p>
                      <div className="mt-3 flex gap-2 justify-center">
                        <Btn
                          palette={palette}
                          size="sm"
                          onClick={() => alert("Buat Penilaian")}
                        >
                          <Plus size={14} className="mr-1" />
                          Buat Tugas
                        </Btn>
                        <Btn
                          palette={palette}
                          size="sm"
                          variant="outline"
                          onClick={() => alert("Export Rekap")}
                        >
                          <Download size={14} className="mr-1" />
                          Export
                        </Btn>
                      </div>
                    </div>
                  )}

                  {!emptyAssignments && (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {filteredAssignments.map((a) => {
                        const donePct = pct(a.graded, a.total);
                        const waiting = Math.max(0, a.submitted - a.graded);
                        const active = selected?.id === a.id;
                        const isOverdue = new Date(a.dueDate) < new Date();

                        return (
                          <button
                            key={a.id}
                            onClick={() => {
                              setSelectedId(a.id);
                              setMobileTab("detail");
                            }}
                            className="w-full text-left rounded-xl border p-3 md:p-4 transition-all hover:shadow-sm"
                            style={{
                              borderColor: active
                                ? palette.primary
                                : palette.silver1,
                              background: active
                                ? palette.primary2
                                : palette.white1,
                              transform: active ? "translateY(-1px)" : "none",
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-[13px] md:text-base truncate">
                                  {a.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    palette={palette}
                                    variant="secondary"
                                    className="text-[11px] md:text-xs"
                                  >
                                    {a.className}
                                  </Badge>
                                  <span
                                    className="text-[11px] md:text-xs flex items-center gap-1"
                                    style={{
                                      color: isOverdue
                                        ? "#EF4444"
                                        : palette.silver2,
                                    }}
                                  >
                                    <CalendarDays size={12} />
                                    {dateShort(a.dueDate)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div
                                  className="text-sm md:text-lg font-bold"
                                  style={{
                                    color:
                                      donePct === 100
                                        ? "#10B981"
                                        : palette.primary,
                                  }}
                                >
                                  {donePct}%
                                </div>
                                <div
                                  className="text-[11px] md:text-xs"
                                  style={{ color: palette.silver2 }}
                                >
                                  selesai
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 md:mt-3">
                              <ProgressBar
                                palette={palette}
                                value={a.graded}
                                max={a.total}
                                showLabel={false}
                              />
                            </div>

                            <div className="mt-2 md:mt-3 flex items-center justify-between text-[11px] md:text-xs">
                              <div
                                className="flex items-center gap-3 md:gap-4"
                                style={{ color: palette.silver2 }}
                              >
                                <span className="flex items-center gap-1">
                                  <Users size={12} />
                                  {a.total} siswa
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText size={12} />
                                  {a.submitted} terkumpul
                                </span>
                              </div>
                              {waiting > 0 && (
                                <Badge
                                  palette={palette}
                                  variant="destructive"
                                  className="text-[11px] md:text-xs"
                                >
                                  {waiting} menunggu
                                </Badge>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* ----- DETAIL ----- */}
              <SectionCard
                palette={palette}
                className={`lg:col-span-7 ${mobileTab === "list" ? "hidden lg:block" : "block"}`}
              >
                <div className="p-4 md:p-5">
                  {!selected ? (
                    <div
                      className="text-center py-12 rounded-xl border-2 border-dashed"
                      style={{
                        borderColor: palette.silver1,
                        color: palette.silver2,
                      }}
                    >
                      <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
                      <h3 className="text-base md:text-lg font-medium mb-1">
                        Pilih Tugas untuk Melihat Detail
                      </h3>
                      <p className="text-sm">
                        Pilih tugas dari daftar untuk melihat detail penilaian
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                          <h3 className="text-lg md:text-xl font-bold truncate">
                            {selected.title}
                          </h3>
                          <div className="flex items-center gap-2 md:gap-3 mt-2">
                            <Badge palette={palette} variant="outline">
                              {selected.className}
                            </Badge>
                            <span
                              className="text-xs md:text-sm truncate"
                              style={{ color: palette.silver2 }}
                            >
                              Batas waktu: {dateLong(selected.dueDate)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className="text-xl md:text-2xl font-bold"
                            style={{ color: palette.primary }}
                          >
                            {pct(selected.graded, selected.total)}%
                          </div>
                          <div
                            className="text-xs md:text-sm"
                            style={{ color: palette.silver2 }}
                          >
                            selesai dinilai
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions (desktop) */}
                      <div className="hidden sm:flex flex-wrap gap-2 mb-5">
                        <Btn
                          palette={palette}
                          variant="secondary"
                          onClick={() => alert("Tandai selesai")}
                        >
                          Tandai Selesai
                        </Btn>
                        <Btn
                          palette={palette}
                          variant="outline"
                          onClick={() => alert("Export hasil")}
                        >
                          <Download size={16} className="mr-2" />
                          Export Hasil
                        </Btn>

                        {/* Contoh ke halaman detail (kirim state) */}
                        <Link
                          to={`/teacher/grading/${encodeURIComponent(selected.className)}/assignment/${selected.id}`}
                          state={{
                            assignment: selected,
                            className: selected.className,
                            submissions,
                          }}
                        >
                          <Btn palette={palette} variant="ghost">
                            <Eye size={14} className="mr-1" />
                            Lihat Detail
                          </Btn>
                        </Link>
                      </div>

                      {/* Submissions Search */}
                      <div className="mb-3">
                        <div
                          className="flex items-center gap-3 rounded-xl border px-3 py-2.5 md:px-4 md:py-3 max-w-full sm:max-w-sm"
                          style={{
                            borderColor: palette.silver1,
                            background: palette.white1,
                          }}
                        >
                          <Search
                            size={16}
                            style={{ color: palette.silver2 }}
                          />
                          <input
                            value={submissionSearchQ}
                            onChange={(e) =>
                              setSubmissionSearchQ(e.target.value)
                            }
                            placeholder="Cari nama siswa..."
                            className="bg-transparent outline-none text-sm w-full"
                            style={{ color: palette.black1 }}
                          />
                        </div>
                      </div>

                      {/* Submissions - Desktop table */}
                      <div className="hidden md:block">
                        <div
                          className="overflow-x-auto rounded-xl border"
                          style={{ borderColor: palette.silver1 }}
                        >
                          <table className="w-full text-sm">
                            <thead style={{ backgroundColor: palette.white2 }}>
                              <tr>
                                <th
                                  className="text-left py-4 px-4 font-semibold"
                                  style={{ color: palette.black1 }}
                                >
                                  Siswa
                                </th>
                                <th
                                  className="text-center py-4 px-3 font-semibold"
                                  style={{ color: palette.black1 }}
                                >
                                  Status
                                </th>
                                <th
                                  className="text-center py-4 px-3 font-semibold"
                                  style={{ color: palette.black1 }}
                                >
                                  Nilai
                                </th>
                                <th
                                  className="text-right py-4 px-4 font-semibold"
                                  style={{ color: palette.black1 }}
                                >
                                  Aksi
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {submissions.map((s, i) => (
                                <tr
                                  key={s.id}
                                  style={{
                                    backgroundColor:
                                      i % 2 === 0
                                        ? palette.white1
                                        : palette.white2,
                                    borderTop:
                                      i === 0
                                        ? "none"
                                        : `1px solid ${palette.silver1}`,
                                  }}
                                >
                                  <td className="py-4 px-4">
                                    <div className="font-medium">
                                      {s.studentName}
                                    </div>
                                    {s.submittedAt && (
                                      <div
                                        className="text-xs flex items-center gap-1 mt-1"
                                        style={{ color: palette.silver2 }}
                                      >
                                        <Clock size={12} />
                                        Dikumpulkan {dateShort(s.submittedAt)}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-4 px-3 text-center">
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
                                        ? "Sudah Dinilai"
                                        : s.status === "submitted"
                                          ? "Terkumpul"
                                          : "Belum Mengumpulkan"}
                                    </Badge>
                                  </td>
                                  <td className="py-4 px-3 text-center">
                                    {typeof s.score === "number" ? (
                                      <span className="font-semibold text-lg">
                                        {s.score}
                                      </span>
                                    ) : (
                                      <span style={{ color: palette.silver2 }}>
                                        -
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex justify-end gap-2">
                                      <Btn
                                        palette={palette}
                                        size="sm"
                                        variant={
                                          s.status === "submitted"
                                            ? "default"
                                            : "outline"
                                        }
                                        onClick={() => openGradeModal(s)}
                                      >
                                        {s.status === "graded"
                                          ? "Edit Nilai"
                                          : "Beri Nilai"}
                                      </Btn>

                                      <Link
                                        to={`/${slug}/guru/penilaian/${s.id}`}
                                        state={{
                                          assignment: selected,
                                          className: selected.className,
                                          submissions,
                                        }}
                                      >
                                        <Btn
                                          palette={palette}
                                          size="sm"
                                          variant="ghost"
                                        >
                                          <Eye size={14} className="mr-1" />
                                          Detail
                                        </Btn>
                                      </Link>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {submissions.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="py-8 text-center"
                                    style={{ color: palette.silver2 }}
                                  >
                                    <Users
                                      size={24}
                                      className="mx-auto mb-2 opacity-50"
                                    />
                                    <p>Belum ada data pengumpulan.</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Submissions - Mobile cards */}
                      <div className="md:hidden space-y-2">
                        {submissions.length === 0 && (
                          <div
                            className="text-center py-8 rounded-xl border"
                            style={{
                              borderColor: palette.silver1,
                              color: palette.silver2,
                              background: palette.white1,
                            }}
                          >
                            Belum ada data pengumpulan.
                          </div>
                        )}

                        {submissions.map((s) => (
                          <div
                            key={s.id}
                            className="rounded-xl border p-3"
                            style={{
                              borderColor: palette.silver1,
                              background: palette.white1,
                            }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {s.studentName}
                                </div>
                                <div
                                  className="text-xs mt-0.5 flex items-center gap-1"
                                  style={{ color: palette.silver2 }}
                                >
                                  {s.submittedAt ? (
                                    <>
                                      <Clock size={12} />
                                      Dikumpulkan {dateShort(s.submittedAt)}
                                    </>
                                  ) : (
                                    "Belum mengumpulkan"
                                  )}
                                </div>
                              </div>
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
                                    : "Missing"}
                              </Badge>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-sm">
                                Nilai:{" "}
                                {typeof s.score === "number" ? (
                                  <span className="font-semibold">
                                    {s.score}
                                  </span>
                                ) : (
                                  <span style={{ color: palette.silver2 }}>
                                    -
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Btn
                                  palette={palette}
                                  size="sm"
                                  variant={
                                    s.status === "submitted"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => openGradeModal(s)}
                                >
                                  {s.status === "graded" ? "Edit" : "Nilai"}
                                </Btn>
                                <Btn
                                  palette={palette}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    alert(`Detail ${s.studentName}`)
                                  }
                                >
                                  <Eye size={14} />
                                </Btn>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sticky quick actions (mobile) */}
                      <div className="sm:hidden sticky bottom-3 z-20">
                        <div
                          className="mt-3 rounded-xl shadow-md flex gap-2 p-2"
                          style={{
                            background: `${palette.white1}F2`,
                            border: `1px solid ${palette.silver1}`,
                            backdropFilter: "blur(6px)",
                          }}
                        >
                          <Btn
                            palette={palette}
                            className="flex-1"
                            onClick={() => alert("Mulai menilai")}
                          >
                            Mulai
                          </Btn>
                          <Btn
                            palette={palette}
                            variant="secondary"
                            className="flex-1"
                            onClick={() => alert("Tandai selesai")}
                          >
                            Selesai
                          </Btn>
                          <Btn
                            palette={palette}
                            variant="outline"
                            className="flex-1"
                            onClick={() => alert("Export hasil")}
                          >
                            Export
                          </Btn>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SectionCard>
            </div>

            {isLoading && (
              <div
                className="text-center py-8 rounded-xl border"
                style={{
                  borderColor: palette.silver1,
                  color: palette.silver2,
                  background: palette.white1,
                }}
              >
                <div className="animate-pulse">Memuat data penilaian...</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ===== util opsional (CSS global)
.no-scrollbar::-webkit-scrollbar{display:none}
.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
*/
