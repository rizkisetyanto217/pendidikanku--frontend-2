import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/lib/axios";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { Download } from "lucide-react";
import FormattedDate from "@/constants/formattedDate";

/* =========================
   Types
========================= */
interface LectureSessionsAsset {
  lecture_sessions_asset_id: string;
  lecture_sessions_asset_title: string;
  lecture_sessions_asset_file_url: string;
  lecture_sessions_asset_created_at: string;
  lecture_sessions_asset_file_type?: number;
  lecture_sessions_asset_file_type_label?: string;
}

type ApiResponse =
  | LectureSessionsAsset[]
  | { data: LectureSessionsAsset[]; message?: string };

/* =========================
   Helpers
========================= */
const extractExt = (url: string): string => {
  try {
    const u = new URL(url);
    const pathname = decodeURIComponent(u.pathname);
    const last = pathname.split("/").pop() || "";
    const raw = last.includes(".") ? last.split(".").pop() || "" : "";
    return raw.toLowerCase();
  } catch {
    const noQuery = url.split("?")[0];
    const last = noQuery.split("/").pop() || "";
    const raw = last.includes(".") ? last.split(".").pop() || "" : "";
    return raw.toLowerCase();
  }
};

const toLabel = (ext: string): string => {
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
      return ext ? ext.toUpperCase() : "FILE";
  }
};

const labelColors = (
  ext: string,
  isDark: boolean
): { backgroundColor: string; color: string } => {
  const theme = isDark ? colors.dark : colors.light;
  switch (ext) {
    case "pdf":
      return { backgroundColor: "#FFD700", color: "#000000" };
    case "doc":
    case "docx":
      return { backgroundColor: "#4A90E2", color: "#FFFFFF" };
    case "xls":
    case "xlsx":
      return { backgroundColor: "#21A366", color: "#FFFFFF" };
    case "ppt":
    case "pptx":
      return { backgroundColor: "#D24726", color: "#FFFFFF" };
    default:
      return { backgroundColor: theme.specialColor, color: "#000000" };
  }
};

/* =========================
   Item Component
========================= */
function DocItem({
  asset,
  isDark,
  onDownload,
}: {
  asset: LectureSessionsAsset;
  isDark: boolean;
  onDownload: (url: string, filename: string) => void;
}) {
  const theme = isDark ? colors.dark : colors.light;
  const rawExt = extractExt(asset.lecture_sessions_asset_file_url);
  const label = toLabel(rawExt);
  const badgeStyle = labelColors(rawExt, isDark);
  const safeFilename = rawExt
    ? `${asset.lecture_sessions_asset_title}.${rawExt}`
    : asset.lecture_sessions_asset_title;

  return (
    <div
      onClick={() =>
        window.open(
          asset.lecture_sessions_asset_file_url,
          "_blank",
          "noopener,noreferrer"
        )
      }
      className="cursor-pointer border rounded-xl p-4 flex justify-between items-center"
      style={{ backgroundColor: theme.white1, borderColor: theme.silver1 }}
      role="button"
      aria-label={`Buka dokumen ${asset.lecture_sessions_asset_title}`}
    >
      <div>
        <p className="text-base font-medium" style={{ color: theme.primary }}>
          {asset.lecture_sessions_asset_title}
        </p>
        <FormattedDate
          value={asset.lecture_sessions_asset_created_at}
          className="text-base mt-1 text-gray-500 dark:text-white/70"
        />
      </div>

      <div className="flex items-center gap-2">
        <span
          className="text-[14px] font-bold px-2 py-1 rounded"
          style={badgeStyle}
        >
          {label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(asset.lecture_sessions_asset_file_url, safeFilename);
          }}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition"
          aria-label={`Unduh ${asset.lecture_sessions_asset_title}`}
          title="Unduh"
        >
          <Download size={16} style={{ color: theme.primary }} />
        </button>
      </div>
    </div>
  );
}

/* =========================
   Page
========================= */
export default function MasjidDocsLectureSessions() {
  const { lecture_session_slug = "", slug = "" } = useParams<{
    lecture_session_slug: string;
    slug: string;
  }>();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();

  const theme = useMemo(() => (isDark ? colors.dark : colors.light), [isDark]);

  const handleDownload = useCallback((url: string, filename: string) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const {
    data: documents = [],
    isLoading,
    isError,
    error,
  } = useQuery<LectureSessionsAsset[], any>({
    queryKey: ["lecture-sessions-documents", lecture_session_slug],
    enabled: !!lecture_session_slug,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const res = await axios.get<ApiResponse>(
        `/public/lecture-sessions-assets/filter-slug`,
        {
          params: {
            lecture_session_slug,
            file_type: "3,4,5,6",
          },
        }
      );
      const payload = (res.data as any)?.data ?? res.data;
      return Array.isArray(payload) ? payload : [];
    },
    select: (rows) =>
      // pastikan urut terbaru dulu (kalau backend belum order)
      [...rows].sort(
        (a, b) =>
          new Date(b.lecture_sessions_asset_created_at).getTime() -
          new Date(a.lecture_sessions_asset_created_at).getTime()
      ),
  });

  return (
    <div className="pb-28 max-w-2xl mx-auto">
      <PageHeaderUser
        title="Dokumen"
        onBackClick={() =>
          navigate(`/masjid/${slug}/soal-materi/${lecture_session_slug}`)
        }
      />

      {isLoading ? (
        <div className="mt-6 text-base text-gray-500 dark:text-white/70">
          Memuat dokumen...
        </div>
      ) : isError ? (
        <div className="mt-6 text-base text-red-500">
          Gagal memuat dokumen
          {error?.response?.data?.message
            ? `: ${error.response.data.message}`
            : "."}
        </div>
      ) : documents.length === 0 ? (
        <div className="mt-6 text-base text-gray-500 dark:text-white/70 text-center">
          Belum ada dokumen tersedia.
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {documents.map((doc) => (
            <DocItem
              key={doc.lecture_sessions_asset_id}
              asset={doc}
              isDark={isDark}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
