import { useLocation, useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import FormattedDate from "@/constants/formattedDate";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import cleanTranscriptHTML from "@/constants/cleanTransciptHTML"; // pastikan path-nya sesuai

interface Lecture {
  lecture_id: string;
  lecture_title: string;
  lecture_description: string;
  lecture_image_url: string | null;
  lecture_teachers:
    | string
    | { id: string; name: string }[]
    | { id: string; name: string }
    | null;
  total_lecture_sessions: number | null;
  lecture_is_active: boolean;
  lecture_created_at: string;
}

export default function DKMInformationLecture() {
  const { state } = useLocation();
  const lecture = state as Lecture;
  const navigate = useNavigate();

  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  return (
    <div className="space-y-6">
      <PageHeader title="Informasi Tema" onBackClick={() => history.back()} />

      <div
        className="bg-white dark:bg-gray-800 p-2"
        style={{ backgroundColor: theme.white1 }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Gambar Kajian */}
          <ShimmerImage
            src={lecture.lecture_image_url || ""}
            alt="Poster Kajian"
            className="w-full lg:w-40 h-40 object-cover rounded-md"
          />

          {/* Info */}
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold" style={{ color: theme.primary }}>
              {lecture?.lecture_title}
            </h3>

            <p className="text-sm" style={{ color: theme.silver2 }}>
              Dimulai:{" "}
              <FormattedDate value={lecture?.lecture_created_at} fullMonth /> -
              20.00 WIB
            </p>

            <p className="text-sm font-medium" style={{ color: theme.black2 }}>
              {Array.isArray(lecture.lecture_teachers)
                ? lecture.lecture_teachers
                    .map((t) => t.name?.trim())
                    .filter(Boolean)
                    .join(", ") || "Pengajar belum ditentukan"
                : typeof lecture.lecture_teachers === "string"
                  ? lecture.lecture_teachers
                  : (lecture.lecture_teachers?.name ??
                    "Pengajar belum ditentukan")}
            </p>

            <div
              className="text-sm prose dark:prose-invert max-w-none"
              style={{ color: theme.silver2 }}
              dangerouslySetInnerHTML={{
                __html: cleanTranscriptHTML(lecture?.lecture_description || ""),
              }}
            />

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
            onClick={() =>
              navigate(`/dkm/tema/tambah-edit/${lecture.lecture_id}`, {
                state: lecture,
              })
            }
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
