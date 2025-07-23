import {
  BookOpen,
  FileText,
  Home,
  MessageSquare,
  PlayCircle,
  StickyNote,
  Video,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";

interface Lecture {
  lecture_id: string;
  lecture_title: string;
  lecture_description: string;
  lecture_image_url: string | null;
  lecture_teachers: any; // Bisa string atau object
  total_lecture_sessions: number | null;
  lecture_is_active: boolean;
  lecture_created_at: string;
}

export default function DKMDetailLecture() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const initialLecture = state as Lecture | undefined;

  const {
    data: lecture,
    isLoading,
    isError,
  } = useQuery<Lecture>({
    queryKey: ["lecture", id],
    enabled: !!id, // Tetap fetch walaupun ada state
    queryFn: async () => {
      const res = await axios.get(`/api/a/lectures/${id}`);
      console.log("🚀 ~ response from /api/a/lectures/:id", res.data);
      return res.data.data;
    },
    initialData: initialLecture, // ini masih oke untuk immediate render
    staleTime: 1000 * 60 * 5,
  });

  const navItems = [
    { icon: <Home size={20} />, label: "Informasi", to: "informasi" },
    { icon: <BookOpen size={20} />, label: "Latihan Soal", to: "latihan-soal" },
    {
      icon: <FileText size={20} />,
      label: "Materi Lengkap",
      to: "materi-lengkap",
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Masukan & Saran",
      to: "saran-masukan",
    },
    {
      icon: <PlayCircle size={20} />,
      label: "Kumpulan Kajian",
      to: "semua-kajian",
    },
    { icon: <Video size={20} />, label: "Video Pembelajaran", to: "video" },
    { icon: <StickyNote size={20} />, label: "Ringkasan", to: "ringkasan" },
    {
      icon: <MessageSquare size={20} />,
      label: "Tanya Jawab",
      to: "tanya-jawab",
    },
    { icon: <FileText size={20} />, label: "Dokumen", to: "dokumen" },
  ];

  if (isLoading) return <p>Loading...</p>;
  if (isError || !lecture)
    return <p className="text-red-500">Gagal memuat data kajian.</p>;

  const teacherName = Array.isArray(lecture.lecture_teachers)
    ? lecture.lecture_teachers
        .map((t: any) => t.name?.trim())
        .filter((name) => name)
        .join(", ") || "Pengajar belum ditentukan"
    : typeof lecture.lecture_teachers === "string"
      ? lecture.lecture_teachers
      : (lecture.lecture_teachers?.name ?? "Pengajar belum ditentukan");

  return (
    <div className="space-y-6">
      <PageHeader title="Kajian Detail" backTo="/dkm/tema" />

      {/* Kartu Kajian */}
      <div
        className="p-2 rounded-xl flex flex-col lg:flex-row gap-4"
        style={{ backgroundColor: theme.white1 }}
      >
        <img
          src={lecture.lecture_image_url ?? "/mock/kajian.jpg"}
          alt="Poster Kajian"
          className="w-full lg:w-40 h-40 object-cover rounded-md"
        />
        <div className="flex-1">
          <h3
            className="text-lg font-semibold"
            style={{ color: theme.primary }}
          >
            {lecture.lecture_title}
          </h3>
          <p className="text-sm" style={{ color: theme.silver2 }}>
            {lecture.lecture_created_at?.split("T")[0]} / Aula utama Masjid
          </p>
          <p
            className="text-sm font-medium mt-2"
            style={{ color: theme.black2 }}
          >
            {teacherName}
          </p>
          <p className="text-sm mt-1" style={{ color: theme.silver2 }}>
            {lecture.lecture_description}
          </p>
          <div className="flex justify-between items-center mt-3">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded"
              style={{
                backgroundColor: theme.specialColor,
                color: theme.white1,
              }}
            >
              Sertifikat
            </span>
            <span className="text-sm" style={{ color: theme.silver2 }}>
              👤 {lecture.total_lecture_sessions ?? 0} Pertemuan
            </span>
          </div>
        </div>
      </div>

      {/* Navigasi Utama */}
      <div>
        <h4
          className="text-base font-semibold mb-3"
          style={{ color: theme.black1 }}
        >
          Navigasi Utama
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() =>
                navigate(
                  `/dkm/tema/tema-detail/${lecture.lecture_id}/${item.to}`,
                  {
                    state: lecture,
                  }
                )
              }
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition"
              style={{
                backgroundColor: theme.white1,
                border: `1px solid ${theme.silver1}`,
              }}
            >
              <div
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: theme.black1 }}
              >
                {item.icon}
                {item.label}
              </div>
              <span style={{ color: theme.silver2 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
