import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import LectureMaterialList from "@/components/pages/lecture/LectureMaterialList";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import FormattedDate from "@/constants/formattedDate";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import { LectureMaterialItem } from "@/pages/linktree/lecture/material/lecture-sessions/main/types/lectureSessions";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface LectureSession {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_slug: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_place: string;
  lecture_session_image_url: string;
  lecture_session_approved_by_dkm_at: string | null;
  lecture_session_lecture_id: string;
  lecture_title: string;
  user_grade_result?: number;
  user_attendance_status?: number;
}

export default function MasjidMaterialByMonth() {
  const { slug, month } = useParams();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();

  const { data: currentUser } = useCurrentUser(); // ambil user saat ini

  const { data: sessions = [], isLoading } = useQuery<LectureSession[]>({
    queryKey: ["kajianByMonth", slug, month, currentUser?.id],
    queryFn: async () => {
      const headers = currentUser?.id ? { "X-User-Id": currentUser.id } : {};
      const res = await axios.get(
        `/public/lecture-sessions-u/by-masjid-slug/${slug}/by-month/${month}`,
        { headers }
      );
      console.log("📦 Data sesi kajian:", res.data);
      return res.data?.data ?? [];
    },
    enabled: !!slug && !!month,
  });

  const mappedMaterial: LectureMaterialItem[] = sessions.map((item) => ({
    id: item.lecture_session_id,
    title: item.lecture_session_title,
    teacher: item.lecture_session_teacher_name,
    masjidName: "",
    location: item.lecture_session_place,
    time: (
      <FormattedDate value={item.lecture_session_start_time} fullMonth />
    ) as unknown as string,
    lecture_session_slug: item.lecture_session_slug,
    status: item.lecture_session_approved_by_dkm_at ? "tersedia" : "proses",
    lectureId: item.lecture_session_lecture_id,
    gradeResult: item.user_grade_result,
    attendanceStatus: item.user_attendance_status,
    imageUrl: item.lecture_session_image_url,
  }));

  return (
    <>
      <PageHeaderUser
        title="Kajian Detail"
        onBackClick={() => {
          navigate(`/masjid/${slug}/soal-materi?tab=tanggal`);
        }}
      />

      <div className="space-y-3">
        <LectureMaterialList data={mappedMaterial} />
      </div>
    </>
  );
}
