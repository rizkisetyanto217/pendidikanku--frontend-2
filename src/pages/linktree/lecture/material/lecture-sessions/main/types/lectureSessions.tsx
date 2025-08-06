
export interface LectureMaterialItem {
  id: string;
lecture_session_slug: string; // ✅ WAJIB ADA
  imageUrl?: string;
  title: string;
  teacher: string;
  masjidName: string;
  location: string;
  time: string;
  status: "tersedia" | "proses";
  gradeResult?: number;
  attendanceStatus?: number;
  lectureId: string;
}
