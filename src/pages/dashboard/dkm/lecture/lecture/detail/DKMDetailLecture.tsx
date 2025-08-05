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
import ShimmerImage from "@/components/common/main/ShimmerImage";
import cleanTranscriptHTML from "@/constants/cleanTransciptHTML";

interface Lecture {
  lecture_id: string;
  lecture_title: string;
  lecture_description: string;
  lecture_image_url: string | null;
  lecture_teachers: any;
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
    error,
  } = useQuery<Lecture, Error>({
    queryKey: ["lecture", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await axios.get(`/api/a/lectures/${id}`);
      return res.data.data;
    },
    initialData: initialLecture,
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
    { icon: <Video size={20} />, label: "Video Audio", to: "video" },
    { icon: <StickyNote size={20} />, label: "Ringkasan", to: "ringkasan" },
    {
      icon: <MessageSquare size={20} />,
      label: "Tanya Jawab",
      to: "tanya-jawab",
    },
    { icon: <FileText size={20} />, label: "Dokumen", to: "dokumen" },
  ];

  if (isLoading) return <p className="text-sm text-gray-500">Memuat data...</p>;

  if (isError && !lecture) {
    // Hanya render error jika benar-benar tidak ada data sama sekali
    const errMsg =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      "Data tidak ditemukan.";
    return (
      <p className="text-sm text-red-500 p-4">
        Gagal memuat data kajian. {errMsg}
      </p>
    );
  }

  if (!lecture) {
    // Jika data belum tersedia (bahkan dari initialData), tampilkan placeholder
    return <p className="text-sm text-gray-500">Memuat data kajian...</p>;
  }

  // Nama Pengajar
  let teacherName = "Pengajar belum ditentukan";
  if (Array.isArray(lecture.lecture_teachers)) {
    const names = lecture.lecture_teachers
      .map((t: any) => t?.name?.trim())
      .filter(Boolean);
    if (names.length > 0) teacherName = names.join(", ");
  } else if (typeof lecture.lecture_teachers === "string") {
    teacherName = lecture.lecture_teachers;
  } else if (lecture.lecture_teachers?.name) {
    teacherName = lecture.lecture_teachers.name;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tema Detail" backTo="/dkm/tema" />

      {/* Kartu Kajian */}
      <div
        className="p-2 rounded-xl flex flex-col lg:flex-row gap-4"
        style={{ backgroundColor: theme.white1 }}
      >
        <ShimmerImage
          src={lecture.lecture_image_url || ""}
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
          <div
            className="text-sm mt-1 leading-relaxed"
            style={{ color: theme.silver2 }}
            dangerouslySetInnerHTML={{
              __html: cleanTranscriptHTML(lecture.lecture_description),
            }}
          />

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
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
