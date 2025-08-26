// src/pages/sekolahislamku/teacher/TeacherClassDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
  LinkBtn,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import TodayScheduleCard from "@/pages/sekolahislamku/components/card/TodayScheduleCard";

import {
  Users,
  CheckSquare,
  ClipboardList,
  BookOpen,
  Plus,
  Filter,
  Search,
  GraduationCap,
} from "lucide-react";

import MiniBar from "../../components/ui/MiniBar";
import StatPill from "../../components/ui/StatPill";
import StudentsTable from "./components/StudentTable";
import ModalAddStudent, {
  type AddStudentPayload,
} from "./components/ModalAddStudent";
import ModalExport from "./components/ModalExport";
import ModalAddMateri from "./components/ModalAddMateri";
import TambahJadwal from "../components/dashboard/AddSchedule";
import ParentTopBar from "../../components/home/ParentTopBar";
import ParentSidebar from "../../components/home/ParentSideBar";

// 🔹 Pakai modal TambahJadwal dari pages/schedule/modal

/* ================= Types ================ */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";
type AttendanceMode = "onsite" | "online";

type StudentRow = {
  id: string;
  name: string;
  avatarUrl?: string;
  statusToday?: AttendanceStatus | null;
  mode?: AttendanceMode;
  time?: string;
  iqraLevel?: string;
  juzProgress?: number;
  lastScore?: number;
};

type Assignment = {
  id: string;
  title: string;
  dueDate: string;
  submitted: number;
  total: number;
  graded?: number;
};

type MaterialItem = {
  id: string;
  title: string;
  date: string;
  attachments?: number;
};

/** Item jadwal untuk beberapa hari ke depan */
type UpcomingItem = {
  dateISO: string;
  time: string;
  title: string;
  room?: string;
};

type ClassDetail = {
  id: string;
  name: string;
  room?: string;
  homeroom: string;
  assistants?: string[];
  studentsCount: number;
  scheduleToday: { time: string; title: string; room?: string }[];
  upcomingSchedule: UpcomingItem[];
  attendanceToday: { byStatus: Record<AttendanceStatus, number> };
  students: StudentRow[];
  assignments: Assignment[];
  materials: MaterialItem[];
  gregorianDate: string;
  hijriDate: string;
};

/* ================= Helpers ================ */
const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
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
const percent = (a: number, b: number) =>
  b > 0 ? Math.round((a / b) * 100) : 0;

/* ============ Fake API (ganti dgn axios) ============ */
async function fetchClassDetail(classId: string): Promise<ClassDetail> {
  const now = new Date();
  const todayISO = now.toISOString();

  const scheduleToday: ClassDetail["scheduleToday"] = [
    { time: "07:30", title: "Tahsin — Tajwid & Makhraj", room: "Aula 1" },
    { time: "09:30", title: "Hafalan Juz 30", room: "R. Tahfiz" },
  ];

  const upcomingSchedule: UpcomingItem[] = Array.from({ length: 7 }).flatMap(
    (_, i) =>
      scheduleToday.map((s) => ({
        dateISO: addDays(startOfDay(now), i).toISOString(),
        time: s.time,
        title: s.title,
        room: s.room,
      }))
  );

  const students: StudentRow[] = [
    {
      id: "s1",
      name: "Ahmad",
      statusToday: "hadir",
      time: "07:26",
      iqraLevel: "Iqra 2",
      juzProgress: 0.6,
      lastScore: 88,
    },
    {
      id: "s2",
      name: "Fatimah",
      statusToday: "hadir",
      time: "07:30",
      iqraLevel: "Iqra 3",
      juzProgress: 1.2,
      lastScore: 92,
    },
    {
      id: "s3",
      name: "Hasan",
      statusToday: "online",
      mode: "online",
      time: "07:35",
      iqraLevel: "Iqra 1",
      juzProgress: 0.2,
      lastScore: 75,
    },
    {
      id: "s4",
      name: "Aisyah",
      statusToday: "sakit",
      iqraLevel: "Iqra 2",
      juzProgress: 0.5,
      lastScore: 81,
    },
    {
      id: "s5",
      name: "Umar",
      statusToday: "izin",
      iqraLevel: "Iqra 2",
      juzProgress: 0.4,
      lastScore: 79,
    },
  ];

  return Promise.resolve({
    id: classId,
    name: classId.toUpperCase().replace("-", " "),
    room: classId === "tpa-b" ? "R. Tahfiz" : "Aula 1",
    homeroom: "Ustadz Abdullah",
    assistants: ["Ustadzah Amina"],
    studentsCount: 22,
    scheduleToday,
    upcomingSchedule,
    attendanceToday: {
      byStatus: { hadir: 18, online: 1, sakit: 1, izin: 1, alpa: 1 },
    },
    students,
    assignments: [
      {
        id: "t1",
        title: "Evaluasi Wudhu",
        dueDate: addDays(now, 1).toISOString(),
        submitted: 18,
        total: 22,
        graded: 10,
      },
      {
        id: "t2",
        title: "Setoran Hafalan An-Naba 1–10",
        dueDate: addDays(now, 2).toISOString(),
        submitted: 12,
        total: 22,
        graded: 0,
      },
    ],
    materials: [
      {
        id: "m1",
        title: "Materi: Mad Thabi'i (contoh & latihan)",
        date: todayISO,
        attachments: 2,
      },
      { id: "m2", title: "Latihan Makhraj (ba, ta, tha)", date: todayISO },
    ],
    gregorianDate: todayISO,
    hijriDate: "16 Muharram 1447 H",
  });
}

/* ============ Class options (ganti dgn axios) ============ */
type ClassOption = { id: string; name: string; room?: string };
async function fetchClassOptions(): Promise<ClassOption[]> {
  return Promise.resolve([
    { id: "tpa-a", name: "TPA A", room: "Aula 1" },
    { id: "tpa-b", name: "TPA B", room: "R. Tahfiz" },
    { id: "tpa-c", name: "TPA C", room: "Aula 2" },
  ]);
}

/* ============ Small inline component ============ */
function ClassSelector({
  palette,
  value,
  options,
  onChange,
}: {
  palette: Palette;
  value: string;
  options: ClassOption[];
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="w-full rounded-xl border p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="text-sm" style={{ color: palette.silver2 }}>
        Pilih Kelas
      </div>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 rounded-lg px-3 border outline-none"
          style={{
            background: palette.white2,
            color: palette.black1,
            borderColor: palette.silver1,
          }}
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name} {opt.room ? `• ${opt.room}` : ""}
            </option>
          ))}
        </select>
        <Badge palette={palette} variant="outline">
          Kelas aktif
        </Badge>
      </div>
    </div>
  );
}

/* ================= Page ================= */
export default function TeacherClass() {
  // Top-level UI states
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false); // Add materi

  // materi
  const { id: idFromUrl } = useParams(); // kalau halaman detailnya sudah /kelas/:id
  // const classId = selectedClassId || idFromUrl;

  // Tambah Jadwal modal
  const [showTambahJadwal, setShowTambahJadwal] = useState(false);
  const [listScheduleItems, setListScheduleItems] = useState<
    { time: string; title: string; room?: string; slug?: string }[]
  >([]);

  const params = useParams<{ id: string }>();
  const classId = params.id ?? "tpa-a";

  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;

  // Opsi kelas
  const { data: classOptions = [] } = useQuery({
    queryKey: ["teacher-class-options"],
    queryFn: () => fetchClassOptions(),
    staleTime: 5 * 60_000,
  });

  // State kelas terpilih, default dari URL param
  const [selectedClassId, setSelectedClassId] = useState<string>(classId);
  useEffect(() => setSelectedClassId(classId), [classId]);

  // Detail kelas
  const { data } = useQuery({
    queryKey: ["teacher-class-detail", selectedClassId || classId],
    queryFn: () => fetchClassDetail(selectedClassId || classId),
    staleTime: 60_000,
    enabled: !!(selectedClassId || classId),
  });

  // === Jadwal 7 hari ke depan (hari ini s/d +6) ===
  const next7DaysItems = useMemo(() => {
    const start = startOfDay(new Date());
    const end = startOfDay(addDays(new Date(), 6));
    const src = data?.upcomingSchedule ?? [];

    return src
      .filter((it) => {
        const d = startOfDay(new Date(it.dateISO));
        return d >= start && d <= end;
      })
      .sort((a, b) => {
        const ad =
          new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
        if (ad !== 0) return ad;
        return a.time.localeCompare(b.time);
      })
      .map((it) => ({
        time: it.time,
        title: it.title,
        room: `${dateShort(it.dateISO)}${it.room ? ` • ${it.room}` : ""}`,
      }));
  }, [data?.upcomingSchedule]);

  // ====== Students filter/search ======
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "all">(
    "all"
  );

  const filteredStudents = useMemo(() => {
    const base = data?.students ?? [];
    const byStatus =
      statusFilter === "all"
        ? base
        : base.filter((s) => s.statusToday === statusFilter);
    const qStr = q.trim().toLowerCase();
    return qStr
      ? byStatus.filter((s) => s.name.toLowerCase().includes(qStr))
      : byStatus;
  }, [data?.students, q, statusFilter]);

  // Handlers
  const handleAddStudent = async (payload: AddStudentPayload) => {
    alert(`Siswa baru: ${payload.name}`);
  };
  const handleExport = (file: File) => {
    alert(`File diupload: ${file.name}`);
    setExportOpen(false);
  };

  // Gabungkan jadwal API + manual
  const combinedUpcoming = useMemo(
    () => [...next7DaysItems, ...listScheduleItems],
    [next7DaysItems, listScheduleItems]
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={`Kelas ${data?.name ?? ""}`}
        gregorianDate={data?.gregorianDate}
        hijriDate={data?.hijriDate}
        dateFmt={(iso) => dateLong(iso)}
      />

      {/* ===== Modals ===== */}
      <ModalAddStudent
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        palette={palette}
        onSubmit={handleAddStudent}
      />

      <ModalExport
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onSubmit={handleExport}
        palette={palette}
      />

      <ModalAddMateri
        open={openModal}
        onClose={() => setOpenModal(false)}
        palette={palette}
        onSubmit={(form) => {
          console.log("Materi baru:", form);
          // TODO: API POST ke backend
        }}
      />

      <TambahJadwal
        open={showTambahJadwal}
        onClose={() => setShowTambahJadwal(false)}
        palette={palette}
        onSubmit={(item) => {
          setListScheduleItems((prev) =>
            [...prev, item].sort((a, b) => a.time.localeCompare(b.time))
          );
        }}
      />

      {/* ===== Content + Sidebar ===== */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            <ClassSelector
              palette={palette}
              value={selectedClassId || classId}
              options={classOptions}
              onChange={(nextId) => setSelectedClassId(nextId)}
            />

            {/* Banner info kelas aktif */}
            <div
              className="rounded-xl p-3 md:p-4"
              style={{ background: palette.primary2, color: palette.primary }}
            >
              <div className="text-sm" style={{ color: palette.primary }}>
                Anda sedang melihat:
              </div>
              <div className="font-semibold text-base md:text-lg">
                Kelas {data?.name ?? "-"}
                {data?.room ? (
                  <span
                    className="font-normal"
                    style={{ color: palette.black1 }}
                  >
                    {" "}
                    • Ruang {data.room}
                  </span>
                ) : null}
              </div>
              <div className="text-sm" style={{ color: palette.silver2 }}>
                Wali Kelas: {data?.homeroom ?? "-"} • {data?.studentsCount ?? 0}{" "}
                siswa
              </div>
            </div>

            {/* ===== Header info + Actions ===== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Jadwal 7 hari ke depan */}
              <div className="lg:col-span-7">
                <TodayScheduleCard
                  palette={palette}
                  items={combinedUpcoming.slice(0, 3)}
                  title="Jadwal 7 Hari Kedepan"
                  addLabel="Tambah Jadwal"
                  onAdd={() => setShowTambahJadwal(true)}
                  seeAllPath="all-today-schedule"
                  seeAllState={{ upcoming: combinedUpcoming }}
                />
              </div>

              {/* Wali kelas card */}
              <SectionCard palette={palette} className="lg:col-span-5">
                <div className="p-4 md:p-6 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                    <div className="space-y-1.5">
                      <div
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Wali Kelas
                      </div>
                      <div className="font-semibold text-lg leading-snug break-words">
                        {data?.homeroom}
                      </div>
                      {data?.assistants?.length ? (
                        <div
                          className="text-sm leading-relaxed"
                          style={{ color: palette.silver2 }}
                        >
                          Pendamping: {data.assistants.join(", ")}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 sm:self-start mt-2 sm:mt-0">
                      <Badge palette={palette} variant="outline">
                        {data?.room ?? "-"}
                      </Badge>
                      <Badge palette={palette} variant="outline">
                        <Users className="mr-1" size={14} />
                        {data?.studentsCount ?? 0} siswa
                      </Badge>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </section>

            {/* ===== Assignments ===== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <SectionCard palette={palette} className="lg:col-span-12">
                <div className="p-4 md:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium flex items-center gap-2">
                      <ClipboardList size={16} /> Tugas Kelas
                    </div>
                    <Link
                      to="../assignments"
                      state={{
                        assignments: data?.assignments ?? [],
                        className: data?.name ?? "",
                        heading: `Tugas ${data?.name ?? ""}`,
                      }}
                    >
                      <Btn palette={palette} size="sm" variant="ghost">
                        Lihat semua
                      </Btn>
                    </Link>
                  </div>

                  <div className="mt-3 grid gap-3">
                    {(data?.assignments ?? []).map((t) => {
                      const pct = percent(t.submitted, t.total);
                      return (
                        <div
                          key={t.id}
                          className="p-3 rounded-xl border"
                          style={{
                            borderColor: palette.silver1,
                            background: palette.white1,
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {t.title}
                              </div>
                              <div
                                className="text-xs mt-0.5"
                                style={{ color: palette.silver2 }}
                              >
                                {t.submitted}/{t.total} terkumpul • batas{" "}
                                {dateShort(t.dueDate)}
                              </div>
                            </div>
                            <Badge
                              palette={palette}
                              variant="outline"
                              className="shrink-0"
                            >
                              {pct}%
                            </Badge>
                          </div>
                          <div
                            className="mt-2 h-2 w-full rounded-full overflow-hidden"
                            style={{ background: palette.white2 }}
                          >
                            <div
                              className="h-full"
                              style={{
                                width: `${pct}%`,
                                background: palette.secondary,
                              }}
                            />
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Btn
                              palette={palette}
                              size="sm"
                              variant="quaternary"
                            >
                              Nilai
                            </Btn>
                            <LinkBtn
                              palette={palette}
                              size="sm"
                              variant="ghost"
                              to={`${classId}/assignment/${t.id}`}
                              state={{ assignment: t }}
                            >
                              Detail
                            </LinkBtn>
                          </div>
                        </div>
                      );
                    })}
                    {(!data?.assignments || data.assignments.length === 0) && (
                      <div
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Belum ada tugas.
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            </section>

            {/* ===== Materials + Attendance Summary ===== */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <SectionCard palette={palette} className="lg:col-span-7">
                <div className="p-4 md:p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-medium flex items-center gap-2">
                      <BookOpen size={16} /> Materi
                    </div>
                    <Btn
                      palette={palette}
                      size="sm"
                      variant="ghost"
                      onClick={() => setOpenModal(true)}
                    >
                      <Plus className="mr-1" size={16} /> Tambah
                    </Btn>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {(data?.materials ?? []).map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl border flex items-center justify-between gap-2"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white2,
                        }}
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{m.title}</div>
                          <div
                            className="text-xs"
                            style={{ color: palette.silver2 }}
                          >
                            {dateLong(m.date)}
                            {typeof m.attachments === "number"
                              ? ` • ${m.attachments} lampiran`
                              : ""}
                          </div>
                        </div>

                        {/* Pastikan menyertakan :id */}
                        <Link
                          to={`${classId}/material/${m.id}`} // hasil: /:slug/guru/kelas/:id/material/:materialId
                          state={{ material: m, className: data?.name }}
                        >
                          <Btn palette={palette} variant="white1" size="sm">
                            Buka
                          </Btn>
                        </Link>
                      </div>
                    ))}
                    {(!data?.materials || data.materials.length === 0) && (
                      <div
                        className="text-sm"
                        style={{ color: palette.silver2 }}
                      >
                        Belum ada materi.
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>

              <SectionCard palette={palette} className="lg:col-span-5">
                <div className="p-4 md:p-5">
                  <div className="font-medium mb-2 flex items-center gap-2">
                    <CheckSquare size={16} /> Ringkasan Kehadiran Hari Ini
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <StatPill
                      palette={palette}
                      label="Total Siswa"
                      value={data?.studentsCount ?? 0}
                    />
                    <StatPill
                      palette={palette}
                      label="Hadir"
                      value={data?.attendanceToday.byStatus.hadir ?? 0}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {(
                      [
                        "hadir",
                        "online",
                        "sakit",
                        "izin",
                        "alpa",
                      ] as AttendanceStatus[]
                    ).map((k) => (
                      <MiniBar
                        key={k}
                        palette={palette}
                        label={k.toUpperCase()}
                        value={data?.attendanceToday.byStatus[k] ?? 0}
                        total={data?.studentsCount ?? 0}
                      />
                    ))}
                  </div>

                  <div className="mt-4">
                    <Btn
                      palette={palette}
                      size="sm"
                      onClick={() => alert("Kelola Absen")}
                    >
                      Kelola Absen
                    </Btn>
                  </div>
                </div>
              </SectionCard>
            </section>

            {/* ===== Students table ===== */}
            <section>
              <SectionCard palette={palette}>
                <div className="p-4 md:p-5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="font-medium flex items-center gap-2">
                      <GraduationCap size={16} /> Daftar Siswa
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Search */}
                      <div
                        className="flex items-center gap-2 rounded-xl border px-3 h-10"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white2,
                        }}
                      >
                        <Search size={16} />
                        <input
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          placeholder="Cari nama…"
                          className="bg-transparent outline-none text-sm"
                          style={{ color: palette.black1 }}
                        />
                      </div>
                      {/* Filter */}
                      <div className="flex items-center gap-2">
                        <Badge palette={palette} variant="outline">
                          <Filter size={14} className="mr-1" />
                          Status
                        </Badge>
                        <div className="hidden sm:flex gap-1">
                          {(
                            [
                              "all",
                              "hadir",
                              "online",
                              "sakit",
                              "izin",
                              "alpa",
                            ] as (AttendanceStatus | "all")[]
                          ).map((s) => (
                            <button
                              key={s}
                              onClick={() => setStatusFilter(s)}
                              className="px-3 h-8 rounded-full border text-sm"
                              style={{
                                background:
                                  statusFilter === s
                                    ? palette.primary2
                                    : palette.white2,
                                color:
                                  statusFilter === s
                                    ? palette.primary
                                    : palette.black1,
                                borderColor:
                                  statusFilter === s
                                    ? palette.primary
                                    : palette.silver1,
                              }}
                            >
                              {s.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <StudentsTable
                    palette={palette}
                    rows={filteredStudents}
                    onDetail={(id) => alert(`Detail siswa ${id}`)}
                    onGrade={(id) => alert(`Nilai siswa ${id}`)}
                  />

                  {/* Footer actions */}
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-xs" style={{ color: palette.silver2 }}>
                      Total: {filteredStudents.length} siswa
                    </div>
                    <div className="flex gap-2">
                      <Btn
                        palette={palette}
                        size="sm"
                        variant="ghost"
                        onClick={() => setExportOpen(true)}
                      >
                        Export CSV
                      </Btn>

                      <Btn
                        palette={palette}
                        size="sm"
                        onClick={() => setAddStudentOpen(true)}
                      >
                        <Plus className="mr-1" size={16} /> Tambah Siswa
                      </Btn>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
