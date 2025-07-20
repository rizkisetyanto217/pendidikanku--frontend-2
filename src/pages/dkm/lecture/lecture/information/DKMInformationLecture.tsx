import { useLocation } from "react-router-dom";
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

export default function DKMInformationLecture() {
  const { state } = useLocation();
  const lecture = state as Lecture;

  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Informasi Tema"
        onBackClick={() => history.back()} // atau navigate(-1)
      />

      {/* Konten */}
      <div
        className="bg-white dark:bg-gray-800 p-2"
        style={{ backgroundColor: theme.white1 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Gambar Kajian */}
          <img
            src={lecture?.lecture_image_url ?? "/mock/kajian.jpg"}
            alt="Poster Kajian"
            className="w-full md:w-48 h-48 object-cover rounded-md"
          />

          {/* Info */}
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold" style={{ color: theme.primary }}>
              {lecture?.lecture_title}
            </h3>
            <p className="text-sm" style={{ color: theme.silver2 }}>
              Dimulai:{" "}
              {new Date(lecture?.lecture_created_at).toLocaleDateString(
                "id-ID",
                {
                  weekday: "long",
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                }
              )}{" "}
              - 20.00 WIB
            </p>
            <p className="text-sm font-medium" style={{ color: theme.black2 }}>
              {lecture?.lecture_teachers ?? "Pengajar belum ditentukan"}
            </p>
            <p className="text-sm" style={{ color: theme.silver2 }}>
              {lecture?.lecture_description}
            </p>

            <div className="flex gap-3 mt-2">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: theme.specialColor,
                  color: theme.white1,
                }}
              >
                Sertifikat
              </span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full border"
                style={{
                  color: theme.primary,
                  borderColor: theme.primary,
                }}
              >
                👤 {lecture?.total_lecture_sessions ?? 0} Pertemuan
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Edit */}
        <div className="flex justify-end mt-6">
          <button
            className="px-6 py-2 rounded-md font-semibold"
            style={{
              backgroundColor: theme.primary,
              color: theme.white1,
            }}
          >
            Edit Tema
          </button>
        </div>
      </div>
    </div>
  );
}
