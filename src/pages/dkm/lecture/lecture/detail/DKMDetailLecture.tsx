import {
  BookOpen,
  FileText,
  Home,
  MessageSquare,
  PlayCircle,
  StickyNote,
  Users,
  Video,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";

interface Lecture {
  lecture_id: string;
  lecture_title: string;
  lecture_description: string;
  lecture_image_url: string | null;
  lecture_teachers: string | null;
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

  const lecture = state as Lecture;

  const navItems = [
    {
      icon: <Home size={20} />,
      label: "Informasi",
      to: `/dkm/tema/tema-detail/${id}/informasi`,
    },
    {
      icon: <BookOpen size={20} />,
      label: "Latihan Soal",
      to: `/dkm/tema/tema-detail/${id}/latihan-soal`,
    },
    {
      icon: <FileText size={20} />,
      label: "Materi Lengkap",
      to: `/dkm/tema/tema-detail/${id}/materi-lengkap`,
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Masukan & Saran",
      to: `/dkm/tema/tema-detail/${id}/saran-masukan`,
    },
    {
      icon: <PlayCircle size={20} />,
      label: "Kumpulan Kajian",
      to: `/dkm/tema/tema-detail/${id}/semua-kajian`,
    },
    {
      icon: <Video size={20} />,
      label: "Video Pembelajaran",
      to: `/dkm/tema/tema-detail/${id}/video`,
    },
    {
      icon: <StickyNote size={20} />,
      label: "Ringkasan",
      to: `/dkm/tema/tema-detail/${id}/ringkasan`,
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Tanya Jawab",
      to: `/dkm/tema/tema-detail/${id}/tanya-jawab`,
    },
    {
      icon: <FileText size={20} />,
      label: "Dokumen",
      to: `/dkm/tema/tema-detail/${id}/dokumentasi`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader title="Kajian Detail" backTo="/dkm/tema" />

      {/* Kartu Kajian */}
      <div
        className="p-2 rounded-xl  flex flex-col lg:flex-row gap-4"
        style={{ backgroundColor: theme.white1 }}
      >
        <img
          src={lecture?.lecture_image_url ?? "/mock/kajian.jpg"}
          alt="Poster Kajian"
          className="w-full lg:w-40 h-40 object-cover rounded-md"
        />
        <div className="flex-1">
          <h3
            className="text-lg font-semibold"
            style={{ color: theme.primary }}
          >
            {lecture?.lecture_title}
          </h3>
          <p className="text-sm" style={{ color: theme.silver2 }}>
            {lecture?.lecture_created_at?.split("T")[0]} / Aula utama Masjid
          </p>
          <p
            className="text-sm font-medium mt-2"
            style={{ color: theme.black2 }}
          >
            {lecture?.lecture_teachers ?? "Pengajar belum ditentukan"}
          </p>
          <p className="text-sm mt-1" style={{ color: theme.silver2 }}>
            {lecture?.lecture_description}
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
              👤 {lecture?.total_lecture_sessions ?? 0} Pertemuan
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
              onClick={() => navigate(item.to, { state: lecture })}
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
