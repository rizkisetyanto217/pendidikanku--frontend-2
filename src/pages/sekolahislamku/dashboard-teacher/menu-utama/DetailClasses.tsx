// src/pages/sekolahislamku/pages/academic/ClassDetail.tsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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

import {
  Users,
  Clock,
  MapPin,
  GraduationCap,
  ArrowLeft,
  Calendar,
  BookOpen,
  FileText,
  UserCheck,
  UserX,
  Heart,
  Ban,
  Wifi,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";

/* =============== Types =============== */
type AttendanceStatus = "hadir" | "sakit" | "izin" | "alpa" | "online";

type Student = {
  id: string;
  name: string;
  nisn: string;
  parentPhone?: string;
  parentEmail?: string;
  todayStatus: AttendanceStatus;
};

type Schedule = {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
};

type Assignment = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  submitted: number;
  total: number;
};

type Material = {
  id: string;
  title: string;
  subject: string;
  uploadDate: string;
  fileType: string;
};

export type ClassDetail = {
  id: string;
  name: string;
  room?: string;
  homeroom: string;
  homeroomPhone?: string;
  homeroomEmail?: string;
  assistants?: string[];
  studentsCount: number;
  academicTerm: string;
  cohortYear: number;
  students: Student[];
  schedule: Schedule[];
  assignments: Assignment[];
  materials: Material[];
};

type TabType = "students" | "schedule" | "assignments" | "materials";

const QK = {
  DETAIL: (id: string) => ["class-detail", id] as const,
};

/* =============== Helpers =============== */
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
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
const hijriLong = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* =============== Fake Data =============== */
const TODAY_FIXED = atLocalNoon(new Date());
const TODAY_ISO = TODAY_FIXED.toISOString();

const MOCK_CLASS_DETAIL: ClassDetail = {
  id: "1",
  name: "Kelas 1A",
  room: "Aula 1",
  homeroom: "Ustadz Abdullah",
  homeroomPhone: "08123456789",
  homeroomEmail: "abdullah@sekolah.id",
  assistants: ["Ustadzah Sarah"],
  studentsCount: 25,
  academicTerm: "2025/2026 — Ganjil",
  cohortYear: 2025,
  students: [
    {
      id: "1",
      name: "Ahmad Faisal",
      nisn: "0051234567",
      parentPhone: "08111111111",
      parentEmail: "faisal.parent@email.com",
      todayStatus: "hadir",
    },
    {
      id: "2",
      name: "Fatimah Zahra",
      nisn: "0051234568",
      parentPhone: "08222222222",
      parentEmail: "fatimah.parent@email.com",
      todayStatus: "hadir",
    },
    {
      id: "3",
      name: "Muhammad Ali",
      nisn: "0051234569",
      parentPhone: "08333333333",
      todayStatus: "sakit",
    },
    {
      id: "4",
      name: "Khadijah Sari",
      nisn: "0051234570",
      parentPhone: "08444444444",
      todayStatus: "izin",
    },
    {
      id: "5",
      name: "Umar Khattab",
      nisn: "0051234571",
      parentPhone: "08555555555",
      todayStatus: "hadir",
    },
  ],
  schedule: [
    {
      id: "1",
      day: "Senin",
      time: "07:30-08:30",
      subject: "Tahsin & Tajwid",
      teacher: "Ustadz Abdullah",
      room: "Aula 1",
    },
    {
      id: "2",
      day: "Senin",
      time: "08:30-09:30",
      subject: "Hafalan Juz 30",
      teacher: "Ustadzah Sarah",
      room: "Aula 1",
    },
    {
      id: "3",
      day: "Selasa",
      time: "07:30-08:30",
      subject: "Fiqih",
      teacher: "Ustadz Ahmad",
      room: "Aula 1",
    },
    {
      id: "4",
      day: "Selasa",
      time: "08:30-09:30",
      subject: "Akhlak",
      teacher: "Ustadzah Maryam",
      room: "Aula 1",
    },
  ],
  assignments: [
    {
      id: "1",
      title: "Hafalan Surah Al-Fatihah",
      subject: "Tahsin & Tajwid",
      dueDate: "2025-09-20",
      submitted: 20,
      total: 25,
    },
    {
      id: "2",
      title: "Menulis Huruf Hijaiyah",
      subject: "Tahsin & Tajwid",
      dueDate: "2025-09-22",
      submitted: 15,
      total: 25,
    },
    {
      id: "3",
      title: "Praktik Wudhu",
      subject: "Fiqih",
      dueDate: "2025-09-25",
      submitted: 18,
      total: 25,
    },
  ],
  materials: [
    {
      id: "1",
      title: "Panduan Tajwid Dasar",
      subject: "Tahsin & Tajwid",
      uploadDate: "2025-09-10",
      fileType: "PDF",
    },
    {
      id: "2",
      title: "Audio Bacaan Surah Al-Fatihah",
      subject: "Tahsin & Tajwid",
      uploadDate: "2025-09-12",
      fileType: "MP3",
    },
    {
      id: "3",
      title: "Tata Cara Wudhu",
      subject: "Fiqih",
      uploadDate: "2025-09-15",
      fileType: "PDF",
    },
  ],
};

/* =============== Fake API =============== */
async function fetchClassDetail(id: string): Promise<ClassDetail> {
  // Simulate API call
  return Promise.resolve({ ...MOCK_CLASS_DETAIL, id });
}

function useClassDetail(id: string) {
  return useQuery({
    queryKey: QK.DETAIL(id),
    queryFn: () => fetchClassDetail(id),
    enabled: !!id,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/* =============== Components =============== */
const AttendanceStatusBadge = ({
  status,
  palette,
}: {
  status: AttendanceStatus;
  palette: Palette;
}) => {
  const statusConfig = {
    hadir: { label: "Hadir", color: "text-green-600", bg: "bg-green-100" },
    sakit: { label: "Sakit", color: "text-yellow-600", bg: "bg-yellow-100" },
    izin: { label: "Izin", color: "text-blue-600", bg: "bg-blue-100" },
    alpa: { label: "Alpa", color: "text-red-600", bg: "bg-red-100" },
    online: { label: "Online", color: "text-purple-600", bg: "bg-purple-100" },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${config.color} ${config.bg}`}
    >
      {config.label}
    </span>
  );
};

const TabButton = ({
  active,
  onClick,
  children,
  palette,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  palette: Palette;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? "text-white" : ""
    }`}
    style={{
      backgroundColor: active ? palette.primary : "transparent",
      color: active ? "white" : palette.black2,
    }}
  >
    {children}
  </button>
);

/* =============== Main Page =============== */
const ClassDetail: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();

  const { data: classDetail, isFetching } = useClassDetail(id || "");
  const [activeTab, setActiveTab] = useState<TabType>("students");

  if (!id) {
    return <div>Class ID not found</div>;
  }

  if (isFetching) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: palette.white2 }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: palette.white2 }}
      >
        <div>Class not found</div>
      </div>
    );
  }

  const attendanceSummary = classDetail.students.reduce(
    (acc, student) => {
      acc[student.todayStatus] = (acc[student.todayStatus] || 0) + 1;
      return acc;
    },
    {} as Record<AttendanceStatus, number>
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Kelas"
        gregorianDate={TODAY_ISO}
        hijriDate={hijriLong(TODAY_ISO)}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <ParentSidebar palette={palette} />

          <div className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <SectionCard palette={palette}>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Btn
                    palette={palette}
                    variant="ghost"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft size={20} />
                  </Btn>
                  <div className="flex-1">
                    <h1
                      className="font-bold text-2xl"
                      style={{ color: palette.black1 }}
                    >
                      {classDetail.name}
                    </h1>
                    <p
                      className="text-sm mt-1"
                      style={{ color: palette.black2 }}
                    >
                      {classDetail.academicTerm} • Angkatan{" "}
                      {classDetail.cohortYear}
                    </p>
                  </div>
                  <Badge palette={palette} variant="outline">
                    {classDetail.room}
                  </Badge>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap
                      size={16}
                      style={{ color: palette.primary }}
                    />
                    <div>
                      <div
                        className="font-medium text-sm"
                        style={{ color: palette.black1 }}
                      >
                        {classDetail.homeroom}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: palette.black2 }}
                      >
                        Wali Kelas
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users size={16} style={{ color: palette.primary }} />
                    <div>
                      <div
                        className="font-medium text-sm"
                        style={{ color: palette.black1 }}
                      >
                        {classDetail.studentsCount} Siswa
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: palette.black2 }}
                      >
                        Total Siswa
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <UserCheck size={16} style={{ color: palette.primary }} />
                    <div>
                      <div
                        className="font-medium text-sm"
                        style={{ color: palette.black1 }}
                      >
                        {attendanceSummary.hadir || 0} Hadir
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: palette.black2 }}
                      >
                        Hari Ini
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Tabs */}
            <SectionCard palette={palette}>
              <div className="p-6">
                <div className="flex gap-2 overflow-x-auto">
                  <TabButton
                    active={activeTab === "students"}
                    onClick={() => setActiveTab("students")}
                    palette={palette}
                  >
                    Siswa ({classDetail.students.length})
                  </TabButton>
                  <TabButton
                    active={activeTab === "schedule"}
                    onClick={() => setActiveTab("schedule")}
                    palette={palette}
                  >
                    Jadwal ({classDetail.schedule.length})
                  </TabButton>
                  <TabButton
                    active={activeTab === "assignments"}
                    onClick={() => setActiveTab("assignments")}
                    palette={palette}
                  >
                    Tugas ({classDetail.assignments.length})
                  </TabButton>
                  <TabButton
                    active={activeTab === "materials"}
                    onClick={() => setActiveTab("materials")}
                    palette={palette}
                  >
                    Materi ({classDetail.materials.length})
                  </TabButton>
                </div>
              </div>
            </SectionCard>

            {/* Content */}
            <div className="space-y-4">
              {activeTab === "students" && (
                <div className="grid gap-4">
                  {classDetail.students.map((student) => (
                    <SectionCard key={student.id} palette={palette}>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3
                              className="font-medium"
                              style={{ color: palette.black1 }}
                            >
                              {student.name}
                            </h3>
                            <p
                              className="text-sm mt-1"
                              style={{ color: palette.black2 }}
                            >
                              NISN: {student.nisn}
                            </p>
                            {student.parentPhone && (
                              <div
                                className="flex items-center gap-2 text-xs mt-2"
                                style={{ color: palette.black2 }}
                              >
                                <Phone size={12} />
                                <span>{student.parentPhone}</span>
                              </div>
                            )}
                          </div>
                          <AttendanceStatusBadge
                            status={student.todayStatus}
                            palette={palette}
                          />
                        </div>
                      </div>
                    </SectionCard>
                  ))}
                </div>
              )}

              {activeTab === "schedule" && (
                <div className="grid gap-4">
                  {classDetail.schedule.map((item) => (
                    <SectionCard key={item.id} palette={palette}>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3
                              className="font-medium"
                              style={{ color: palette.black1 }}
                            >
                              {item.subject}
                            </h3>
                            <p
                              className="text-sm mt-1"
                              style={{ color: palette.black2 }}
                            >
                              {item.teacher}
                            </p>
                            <div
                              className="flex items-center gap-4 text-xs mt-2"
                              style={{ color: palette.black2 }}
                            >
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{item.day}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{item.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={12} />
                                <span>{item.room}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  ))}
                </div>
              )}

              {activeTab === "assignments" && (
                <div className="grid gap-4">
                  {classDetail.assignments.map((assignment) => (
                    <SectionCard key={assignment.id} palette={palette}>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3
                              className="font-medium"
                              style={{ color: palette.black1 }}
                            >
                              {assignment.title}
                            </h3>
                            <p
                              className="text-sm mt-1"
                              style={{ color: palette.black2 }}
                            >
                              {assignment.subject}
                            </p>
                            <div
                              className="flex items-center gap-4 text-xs mt-2"
                              style={{ color: palette.black2 }}
                            >
                              <span>
                                Deadline: {formatDate(assignment.dueDate)}
                              </span>
                              <span>
                                Dikumpulkan: {assignment.submitted}/
                                {assignment.total}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              palette={palette}
                              variant={
                                assignment.submitted === assignment.total
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {Math.round(
                                (assignment.submitted / assignment.total) * 100
                              )}
                              %
                            </Badge>
                            <Btn
                              palette={palette}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigate(
                                  `/sekolahislamku/academic/assignment/${assignment.id}`
                                );
                              }}
                            >
                              <ChevronRight size={14} />
                            </Btn>
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  ))}
                </div>
              )}

              {activeTab === "materials" && (
                <div className="grid gap-4">
                  {classDetail.materials.map((material) => (
                    <SectionCard key={material.id} palette={palette}>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3
                              className="font-medium"
                              style={{ color: palette.black1 }}
                            >
                              {material.title}
                            </h3>
                            <p
                              className="text-sm mt-1"
                              style={{ color: palette.black2 }}
                            >
                              {material.subject}
                            </p>
                            <div
                              className="flex items-center gap-4 text-xs mt-2"
                              style={{ color: palette.black2 }}
                            >
                              <span>
                                Upload: {formatDate(material.uploadDate)}
                              </span>
                              <span>Format: {material.fileType}</span>
                            </div>
                          </div>
                          <Btn palette={palette} size="sm" variant="ghost">
                            <ChevronRight size={14} />
                          </Btn>
                        </div>
                      </div>
                    </SectionCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClassDetail;
