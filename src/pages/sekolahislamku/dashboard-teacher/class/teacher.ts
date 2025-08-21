// src/pages/sekolahislamku/api/teacher.ts
export const TEACHER_HOME_QK = ["teacher-home"] as const;

export type Announcement = {
  id: string;
  title: string;
  date: string; // ISO
  body: string;
  type?: "info" | "warning" | "success";
};

export type TodayClass = {
  id: string;
  time: string;
  className: string;
  subject: string;
  room?: string;
  studentCount?: number;
  status?: "upcoming" | "ongoing" | "done";
};

export type TeacherHomeResponse = {
  hijriDate: string;
  gregorianDate: string;
  todayClasses: TodayClass[];
  announcements: Announcement[];
};

// sementara masih mock; ganti ke axios nanti
export async function fetchTeacherHome(): Promise<TeacherHomeResponse> {
  const now = new Date();
  const iso = now.toISOString();

  return {
    hijriDate: "16 Muharram 1447 H",
    gregorianDate: iso,
    todayClasses: [
      {
        id: "tc1",
        time: "07:30",
        className: "TPA A",
        subject: "Tahsin",
        room: "Aula 1",
        studentCount: 22,
        status: "ongoing",
      },
      {
        id: "tc2",
        time: "09:30",
        className: "TPA B",
        subject: "Hafalan Juz 30",
        room: "R. Tahfiz",
        studentCount: 20,
        status: "upcoming",
      },
    ],
    announcements: [
      {
        id: "a1",
        title: "Tryout Ujian Tahfiz",
        date: iso,
        body: "Tryout internal hari Kamis. Mohon siapkan rubrik penilaian makhraj & tajwid.",
        type: "info",
      },
      {
        id: "a2",
        title: "Rapat Kurikulum",
        date: iso,
        body: "Rapat kurikulum pekan depan. Draft silabus sudah di folder bersama.",
        type: "success",
      },
    ],
  };
}
