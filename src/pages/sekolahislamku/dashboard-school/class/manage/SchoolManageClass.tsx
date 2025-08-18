// src/pages/sekolahislamku/pages/classes/ManageClassSection.tsx
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/StudentTopBar";
import {
  ArrowLeft,
  BookOpen,
  Users,
  User,
  CalendarDays,
  Clock4,
} from "lucide-react";

/* =========================================
   DUMMY SWITCH
========================================= */
const USE_DUMMY = true;

/* ========= Types ========= */
type ApiSchedule = {
  start?: string;
  end?: string;
  days?: string[];
  location?: string;
};
type ApiTeacherLite = {
  id: string;
  user_name: string;
  email?: string;
  is_active?: boolean;
};
type ApiSection = {
  class_sections_id: string;
  class_sections_class_id: string;
  class_sections_slug: string;
  class_sections_name: string;
  class_sections_code?: string | null;
  class_sections_schedule?: ApiSchedule | null;
  class_sections_is_active: boolean;
  teacher?: ApiTeacherLite | null;
};
type ApiListSections = { data: ApiSection[]; message: string };
type ApiOneSection = { data: ApiSection; message: string };

type ApiParticipant = {
  class_student_id?: string;
  student_id?: string;
  id?: string;
  student_name?: string;
  name?: string;
  nis?: string;
  gender?: "L" | "P";
  phone?: string;
  email?: string;
  status?: string;
};
type ApiParticipantsResp =
  | { data: ApiParticipant[]; message?: string }
  | { data: { items: ApiParticipant[] }; message?: string };

type ApiLesson = {
  id?: string;
  class_lesson_id?: string;
  title?: string;
  topic?: string;
  subject_name?: string;
  date?: string;
  start?: string;
  end?: string;
  teacher_name?: string;
  note?: string;
};
type ApiLessonsResp =
  | { data: ApiLesson[]; message?: string }
  | { data: { items: ApiLesson[] }; message?: string };

/* ========= Helpers ========= */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

const scheduleToText = (sch?: ApiSchedule | null): string => {
  if (!sch) return "-";
  const days = (sch.days ?? []).join(", ");
  const time =
    sch.start && sch.end
      ? `${sch.start}–${sch.end}`
      : sch.start || sch.end || "";
  const loc = sch.location ? ` @${sch.location}` : "";
  const left = [days, time].filter(Boolean).join(" ");
  return left ? `${left}${loc}` : "-";
};

/* ========= DUMMY DATA ========= */
const DUMMY_SECTION = (id: string): ApiSection => ({
  class_sections_id: id,
  class_sections_class_id: "1b6cbfc9-fe18-4c39-9af9-35a030c04e96",
  class_sections_slug: "kelas-a",
  class_sections_name: "Kelas A",
  class_sections_code: "A1",
  class_sections_schedule: {
    start: "07:30",
    end: "09:00",
    days: ["Senin", "Rabu"],
    location: "Ruang A",
  },
  class_sections_is_active: true,
  teacher: {
    id: "5e6ae4d3-a977-46ae-b918-11fa42748f4e",
    user_name: "Ridla Agustiawan",
    email: "ridla.agustiawan@gmail.com",
    is_active: true,
  },
});

const DUMMY_PARTICIPANTS: ApiParticipant[] = [
  {
    id: "s1",
    student_name: "Ahmad Fikri",
    nis: "2025-001",
    gender: "L",
    phone: "0812-1111-2222",
    email: "ahmad@example.com",
    status: "aktif",
  },
  {
    id: "s2",
    student_name: "Siti Maryam",
    nis: "2025-002",
    gender: "P",
    phone: "0812-3333-4444",
    email: "siti@example.com",
    status: "aktif",
  },
  {
    id: "s3",
    student_name: "Fauzan Akbar",
    nis: "2025-003",
    gender: "L",
    phone: "0812-5555-6666",
    email: "fauzan@example.com",
    status: "aktif",
  },
  {
    id: "s4",
    student_name: "Nabila Aulia",
    nis: "2025-004",
    gender: "P",
    phone: "0812-7777-8888",
    email: "nabila@example.com",
    status: "aktif",
  },
  {
    id: "s5",
    student_name: "Raihan Pratama",
    nis: "2025-005",
    gender: "L",
    phone: "0812-9999-0000",
    email: "raihan@example.com",
    status: "izin",
  },
  {
    id: "s6",
    student_name: "Hana Zahra",
    nis: "2025-006",
    gender: "P",
    phone: "0813-1234-5678",
    email: "hana@example.com",
    status: "aktif",
  },
  {
    id: "s7",
    student_name: "M. Yusuf",
    nis: "2025-007",
    gender: "L",
    phone: "0813-8765-4321",
    email: "yusuf@example.com",
    status: "aktif",
  },
  {
    id: "s8",
    student_name: "Aisyah Nur",
    nis: "2025-008",
    gender: "P",
    phone: "0813-9090-1010",
    email: "aisyah@example.com",
    status: "aktif",
  },
];

const DUMMY_LESSONS: ApiLesson[] = [
  {
    id: "l1",
    title: "Tahsin: Makharijul Huruf",
    date: new Date().toISOString().slice(0, 10), // hari ini
    start: "07:30",
    end: "09:00",
    teacher_name: "Ridla Agustiawan",
    note: "Fokus pada huruf-huruf qalqalah.",
  },
  {
    id: "l2",
    title: "Tahfizh: Juz 30 (An-Naba')",
    date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    start: "07:30",
    end: "09:00",
    teacher_name: "Ridla Agustiawan",
    note: "Target ayat 1–16.",
  },
  {
    id: "l3",
    title: "Adab Murojaah",
    date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    start: "07:30",
    end: "09:00",
    teacher_name: "Ridla Agustiawan",
    note: "Ringan + praktik.",
  },
];

/* ========= Fetchers (fallback ke dummy) ========= */
async function fetchSection(sectionId: string): Promise<ApiSection | null> {
  if (USE_DUMMY) return DUMMY_SECTION(sectionId);
  try {
    const r = await axios.get<ApiOneSection>(
      `/api/a/class-sections/${sectionId}`
    );
    if (r.data?.data) return r.data.data;
  } catch {}
  try {
    const r = await axios.get<ApiListSections>("/api/a/class-sections", {
      params: { limit: 500 },
    });
    const rows = r.data?.data ?? [];
    return rows.find((x) => x.class_sections_id === sectionId) ?? null;
  } catch {
    return null;
  }
}

async function fetchParticipants(sectionId: string): Promise<ApiParticipant[]> {
  if (USE_DUMMY) return DUMMY_PARTICIPANTS;
  const tries: Array<{ url: string; params?: any }> = [
    { url: "/api/a/class-section-students", params: { section_id: sectionId } },
    { url: "/api/a/class-students", params: { section_id: sectionId } },
    { url: "/api/a/students", params: { section_id: sectionId } },
  ];
  for (const t of tries) {
    try {
      const r = await axios.get<ApiParticipantsResp>(t.url, {
        params: t.params,
      });
      const d: any = r.data?.data;
      if (Array.isArray(d)) return d;
      if (d?.items && Array.isArray(d.items)) return d.items;
    } catch {}
  }
  return [];
}

async function fetchLessons(
  sectionId: string,
  classId?: string
): Promise<ApiLesson[]> {
  if (USE_DUMMY) return DUMMY_LESSONS;
  const tries: Array<{ url: string; params?: any }> = [
    { url: "/api/a/class-lessons", params: { section_id: sectionId } },
    { url: "/api/a/class-lessons", params: { class_id: classId } },
    { url: "/api/a/lessons", params: { class_id: classId } },
  ];
  for (const t of tries) {
    try {
      const r = await axios.get<ApiLessonsResp>(t.url, { params: t.params });
      const d: any = r.data?.data;
      if (Array.isArray(d)) return d;
      if (d?.items && Array.isArray(d.items)) return d.items;
    } catch {}
  }
  return [];
}

/* ========= UI mappers ========= */
type ParticipantRow = {
  id: string;
  name: string;
  nis?: string;
  gender?: "L" | "P";
  phone?: string;
  email?: string;
  status?: string;
};
function mapParticipant(x: ApiParticipant): ParticipantRow {
  return {
    id: x.class_student_id || x.student_id || x.id || crypto.randomUUID(),
    name: x.student_name || x.name || "-",
    nis: x.nis,
    gender: x.gender,
    phone: x.phone,
    email: x.email,
    status: x.status,
  };
}

type LessonRow = {
  id: string;
  title: string;
  date?: string;
  time?: string;
  teacher?: string;
  note?: string;
};
function mapLesson(x: ApiLesson): LessonRow {
  const id = x.class_lesson_id || x.id || crypto.randomUUID();
  const title = x.title || x.topic || x.subject_name || "Materi";
  const time = x.start && x.end ? `${x.start}–${x.end}` : x.start || x.end;
  return {
    id,
    title,
    date: x.date,
    time,
    teacher: x.teacher_name,
    note: x.note,
  };
}

/* ========= Page ========= */
export default function ManageClassSection() {
  const { id: sectionId = "" } = useParams<{ id: string }>();
  const { isDark } = useHtmlDarkMode();
  const palette: Palette = isDark ? colors.dark : colors.light;
  const nav = useNavigate();

  const sectionQ = useQuery({
    queryKey: ["section", sectionId, USE_DUMMY],
    enabled: !!sectionId,
    queryFn: () => fetchSection(sectionId),
    staleTime: 60_000,
  });

  const participantsQ = useQuery({
    queryKey: ["section-participants", sectionId, USE_DUMMY],
    enabled: !!sectionId,
    queryFn: () => fetchParticipants(sectionId),
    staleTime: 30_000,
  });

  const lessonsQ = useQuery({
    queryKey: [
      "section-lessons",
      sectionId,
      sectionQ.data?.class_sections_class_id,
      USE_DUMMY,
    ],
    enabled: !!sectionId,
    queryFn: () =>
      fetchLessons(sectionId, sectionQ.data?.class_sections_class_id),
    staleTime: 30_000,
  });

  const section = sectionQ.data ?? undefined;
  const participants = useMemo(
    () => (participantsQ.data ?? []).map(mapParticipant),
    [participantsQ.data]
  );
  const lessons = useMemo(
    () => (lessonsQ.data ?? []).map(mapLesson),
    [lessonsQ.data]
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Kelola Kelas"
        gregorianDate={new Date().toISOString()}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Back + Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Btn palette={palette} variant="outline" onClick={() => nav(-1)}>
              <ArrowLeft className="mr-2" size={16} />
              Kembali
            </Btn>
            <div className="ml-2">
              <div className="text-lg font-semibold">
                {section?.class_sections_name ?? "Kelas"}
              </div>
              <div className="text-xs" style={{ color: palette.silver2 }}>
                Kode: {section?.class_sections_code ?? "-"} •{" "}
                {section?.class_sections_is_active ? "Aktif" : "Nonaktif"}
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan singkat */}
        <SectionCard palette={palette}>
          <div className="p-4 grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <span
                className="h-10 w-10 grid place-items-center rounded-xl"
                style={{ background: palette.primary2, color: palette.primary }}
              >
                <User size={18} />
              </span>
              <div>
                <div className="text-xs" style={{ color: palette.silver2 }}>
                  Wali Kelas
                </div>
                <div className="font-medium">
                  {section?.teacher?.user_name ?? "-"}
                </div>
                {section?.teacher?.email && (
                  <div className="text-xs" style={{ color: palette.silver2 }}>
                    {section.teacher.email}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="h-10 w-10 grid place-items-center rounded-xl"
                style={{ background: palette.primary2, color: palette.primary }}
              >
                <CalendarDays size={18} />
              </span>
              <div>
                <div className="text-xs" style={{ color: palette.silver2 }}>
                  Hari & Lokasi
                </div>
                <div className="font-medium">
                  {(section?.class_sections_schedule?.days ?? []).join(", ") ||
                    "-"}
                </div>
                <div className="text-xs" style={{ color: palette.silver2 }}>
                  {section?.class_sections_schedule?.location ?? "-"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="h-10 w-10 grid place-items-center rounded-xl"
                style={{ background: palette.primary2, color: palette.primary }}
              >
                <Clock4 size={18} />
              </span>
              <div>
                <div className="text-xs" style={{ color: palette.silver2 }}>
                  Waktu
                </div>
                <div className="font-medium">
                  {scheduleToText(section?.class_sections_schedule)}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Peserta */}
        <SectionCard palette={palette}>
          <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
            <div className="font-medium flex items-center gap-2">
              <Users size={18} /> Peserta
            </div>
            <Btn
              palette={palette}
              onClick={() => console.log("Tambah peserta")}
            >
              + Tambah Peserta
            </Btn>
          </div>

          <div className="px-4 md:px-5 pb-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead
                className="text-left border-b"
                style={{ color: palette.silver2, borderColor: palette.silver1 }}
              >
                <tr>
                  <th className="py-2 pr-4">NIS</th>
                  <th className="py-2 pr-4">Nama</th>
                  <th className="py-2 pr-4">JK</th>
                  <th className="py-2 pr-4">Kontak</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: palette.silver1 }}
              >
                {participants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center"
                      style={{ color: palette.silver2 }}
                    >
                      Belum ada peserta.
                    </td>
                  </tr>
                ) : (
                  participants.map((p) => (
                    <tr key={p.id} className="align-middle">
                      <td className="py-3 pr-4">{p.nis ?? "-"}</td>
                      <td className="py-3 pr-4 font-medium">{p.name}</td>
                      <td className="py-3 pr-4">{p.gender ?? "-"}</td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-3">
                          {p.phone && (
                            <a
                              href={`tel:${p.phone}`}
                              className="underline"
                              style={{ color: palette.primary }}
                            >
                              {p.phone}
                            </a>
                          )}
                          {p.email && (
                            <a
                              href={`mailto:${p.email}`}
                              className="underline"
                              style={{ color: palette.primary }}
                            >
                              Email
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          palette={palette}
                          variant={p.status === "aktif" ? "success" : "outline"}
                        >
                          {p.status ?? "Aktif"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="pt-3 text-xs" style={{ color: palette.silver2 }}>
              Menampilkan {participants.length} peserta
            </div>
          </div>
        </SectionCard>

        {/* Pelajaran */}
        <SectionCard palette={palette}>
          <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
            <div className="font-medium flex items-center gap-2">
              <BookOpen size={18} /> Pelajaran
            </div>
            <Btn
              palette={palette}
              onClick={() => console.log("Tambah pelajaran")}
            >
              + Tambah Pelajaran
            </Btn>
          </div>

          <div className="px-4 md:px-5 pb-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead
                className="text-left border-b"
                style={{ color: palette.silver2, borderColor: palette.silver1 }}
              >
                <tr>
                  <th className="py-2 pr-4">Tanggal</th>
                  <th className="py-2 pr-4">Waktu</th>
                  <th className="py-2 pr-4">Materi/Topik</th>
                  <th className="py-2 pr-4">Pengajar</th>
                  <th className="py-2 pr-4">Catatan</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: palette.silver1 }}
              >
                {lessons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center"
                      style={{ color: palette.silver2 }}
                    >
                      Belum ada pelajaran terjadwal.
                    </td>
                  </tr>
                ) : (
                  lessons.map((l) => (
                    <tr key={l.id} className="align-middle">
                      <td className="py-3 pr-4">
                        {l.date ? dateLong(l.date) : "-"}
                      </td>
                      <td className="py-3 pr-4">{l.time ?? "-"}</td>
                      <td className="py-3 pr-4 font-medium">{l.title}</td>
                      <td className="py-3 pr-4">{l.teacher ?? "-"}</td>
                      <td className="py-3 pr-4">{l.note ?? "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="pt-3 text-xs" style={{ color: palette.silver2 }}>
              Menampilkan {lessons.length} pelajaran
            </div>
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
