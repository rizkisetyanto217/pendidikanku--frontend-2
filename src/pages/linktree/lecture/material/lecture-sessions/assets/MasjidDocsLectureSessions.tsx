import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { FileText, Download } from "lucide-react";
import FormattedDate from "@/constants/formattedDate";

interface LectureSessionsAsset {
  lecture_sessions_asset_id: string;
  lecture_sessions_asset_title: string;
  lecture_sessions_asset_file_url: string;
  lecture_sessions_asset_created_at: string;
}

const getFileExtensionLabel = (url: string): string => {
  const ext = url.split(".").pop()?.split("?")[0]?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "PDF";
    case "doc":
    case "docx":
      return "DOCX";
    case "xls":
    case "xlsx":
      return "XLSX";
    case "ppt":
    case "pptx":
      return "PPT";
    default:
      return ext?.toUpperCase() || "FILE";
  }
};

const getFileExtensionLabelColor = (
  ext: string,
  isDark: boolean
): { backgroundColor: string; color: string } => {
  const theme = isDark ? colors.dark : colors.light;
  switch (ext.toLowerCase()) {
    case "pdf":
      return { backgroundColor: "#FFD700", color: "#000000" }; // gold
    case "doc":
    case "docx":
      return { backgroundColor: "#4A90E2", color: "#FFFFFF" }; // biru Word
    case "xls":
    case "xlsx":
      return { backgroundColor: "#21A366", color: "#FFFFFF" }; // hijau Excel
    case "ppt":
    case "pptx":
      return { backgroundColor: "#D24726", color: "#FFFFFF" }; // oranye PowerPoint
    default:
      return {
        backgroundColor: theme.specialColor,
        color: "#000000",
      };
  }
};

export default function MasjidDocsLectureSessions() {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  
  const {
    data: documents = [],
    isLoading,
    isError,
  } = useQuery<LectureSessionsAsset[]>({
    queryKey: ["lecture-sessions-documents", id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-assets/filter?lecture_session_id=${id}&file_type=3,4,5,6`
      );
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-28 max-w-2xl mx-auto">
      <PageHeaderUser
        title="Dokumen"
        onBackClick={() => {
          navigate(`/masjid/${slug}/soal-materi/${id}`);
        }}
      />

      {isLoading ? (
        <div className="mt-6 text-base text-gray-500 dark:text-white/70">
          Memuat dokumen...
        </div>
      ) : isError ? (
        <div className="mt-6 text-base text-red-500">Gagal memuat dokumen.</div>
      ) : documents.length === 0 ? (
        <div className="mt-6 text-base text-gray-500 dark:text-white/70 text-center">
          Belum ada dokumen tersedia.
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {documents.map((doc) => {
            const ext = getFileExtensionLabel(
              doc.lecture_sessions_asset_file_url
            );
            const labelStyle = getFileExtensionLabelColor(ext, isDark);
            return (
              <div
                key={doc.lecture_sessions_asset_id}
                onClick={() =>
                  window.open(doc.lecture_sessions_asset_file_url, "_blank")
                }
                className="cursor-pointer border rounded-xl p-4 flex justify-between items-center"
                style={{
                  backgroundColor: theme.white1,
                  borderColor: theme.silver1,
                }}
              >
                <div>
                  <p
                    className="text-base font-medium"
                    style={{ color: theme.primary }}
                  >
                    {doc.lecture_sessions_asset_title}
                  </p>
                  <FormattedDate
                    value={doc.lecture_sessions_asset_created_at}
                    fullMonth={false}
                    className="text-base mt-1 text-gray-500 dark:text-white/70"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={16} style={{ color: theme.primary }} />
                  <span
                    className="text-[14px] font-bold px-2 py-1 rounded"
                    style={labelStyle}
                  >
                    {ext}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(
                        doc.lecture_sessions_asset_file_url,
                        `${doc.lecture_sessions_asset_title}.${ext.toLowerCase()}`
                      );
                    }}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition"
                  >
                    <Download size={16} style={{ color: theme.primary }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
