import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import {
  BookOpen,
  FileText,
  Home,
  PlayCircle,
  StickyNote,
  Video,
} from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import NavigationCard from "./components/NavigationCard";
import FormattedDate from "@/constants/formattedDate";

// ✅ Tipe data sesi kajian
interface LectureSessionDetail {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_description: string;
  lecture_session_teacher_id: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_end_time: string;
  lecture_session_place: string;
  lecture_session_image_url: string;
  lecture_session_lecture_id: string;
  lecture_session_masjid_id: string;
  lecture_title: string;
  lecture_session_approved_by_admin_id: string | null;
  lecture_session_approved_by_admin_at: string | null;
  lecture_session_approved_by_author_id: string | null;
  lecture_session_approved_by_author_at: string | null;
  lecture_session_approved_by_teacher_id: string | null;
  lecture_session_approved_by_teacher_at: string | null;
  lecture_session_approved_by_dkm_at: string | null;
  lecture_session_is_active: boolean;
  lecture_session_created_at: string;
  lecture_session_updated_at: string;
}

export default function DKMDetailLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.session;
  const from = location.state?.from || -1;

  const {
    data: fetchedSession,
    isLoading,
    isError,
  } = useQuery<LectureSessionDetail>({
    queryKey: ["lecture-session-detail", id],
    queryFn: async () => {
      const res = await axios.get(`/api/a/lecture-sessions/by-id/${id}`);
      console.log("✅ Data sesi kajian:", res.data);
      return res.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return <p className="text-gray-500">Memuat data sesi kajian...</p>;
  }

  if (isError || !fetchedSession) {
    return <p className="text-red-500">Data sesi kajian tidak tersedia.</p>;
  }

  const {
    lecture_session_title,
    lecture_session_description,
    lecture_session_teacher_name,
    lecture_session_start_time,
    lecture_session_place,
    lecture_session_image_url,
    lecture_session_approved_by_dkm_at,
  } = fetchedSession;

  const navigations = [
    { icon: <Home size={36} />, label: "Informasi", to: "informasi" },
    { icon: <Video size={36} />, label: "Video Audio", to: "video-audio" },
    { icon: <BookOpen size={36} />, label: "Latihan Soal", to: "latihan-soal" },
    {
      icon: <FileText size={36} />,
      label: "Materi Lengkap",
      to: "materi-lengkap",
    },
    { icon: <StickyNote size={36} />, label: "Ringkasan", to: "ringkasan" },
    { icon: <PlayCircle size={36} />, label: "Dokumen", to: "dokumen" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kajian Detail sekarang"
        onBackClick={() =>
          typeof from === "string" ? navigate(from) : navigate(-1)
        }
      />

      {/* Kartu Kajian */}
      <div
        className="rounded-2xl shadow-sm flex flex-col md:flex-row gap-6"
        style={{
          backgroundColor: theme.white1,
          color: theme.black1,
        }}
      >
        <div className="flex-shrink-0 w-full md:w-48">
          <img
            src={lecture_session_image_url ?? "/mock/kajian.jpg"}
            alt="Poster Kajian"
            className="rounded-xl w-full h-auto object-cover aspect-[3/4]"
          />
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          <h2
            className="text-xl font-semibold leading-snug"
            style={{ color: theme.primary }}
          >
            {lecture_session_title}
          </h2>

          <p className="text-sm font-medium" style={{ color: theme.silver2 }}>
            <FormattedDate value={lecture_session_start_time} fullMonth /> /{" "}
            {lecture_session_place}
          </p>

          <p className="text-sm font-semibold" style={{ color: theme.black1 }}>
            {lecture_session_teacher_name}
          </p>

          <p
            className="text-sm mt-1 leading-relaxed"
            style={{ color: theme.silver2 }}
          >
            {lecture_session_description}
          </p>

          <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
            <div
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: theme.tertiary,
                color: theme.white1,
              }}
            >
              {lecture_session_approved_by_dkm_at
                ? "Soal & Materi tersedia"
                : "Soal & Materi dalam proses"}
            </div>
            <div
              className="flex items-center text-sm font-medium"
              style={{ color: theme.silver2 }}
            >
              <span className="mr-1">👤</span> 40 peserta
            </div>
          </div>
        </div>
      </div>

      {/* Navigasi */}
      <div>
        <h4
          className="text-lg font-semibold mb-4"
          style={{ color: theme.primary }}
        >
          Navigasi Utama
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {navigations.map((item) => (
            <NavigationCard key={item.label} {...item} state={fetchedSession} />
          ))}
        </div>
      </div>
    </div>
  );
}
