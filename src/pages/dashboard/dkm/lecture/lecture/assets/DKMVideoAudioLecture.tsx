import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import FormattedDate from "@/constants/formattedDate";
import SimpleTable from "@/components/common/main/SimpleTable";
import { ExternalLink } from "lucide-react";

interface LectureSessionAsset {
  lecture_sessions_asset_id: string;
  lecture_sessions_asset_title: string;
  lecture_sessions_asset_file_url: string;
  lecture_sessions_asset_file_type_label: string;
  lecture_sessions_asset_created_at: string;
  lecture_sessions_asset_lecture_session_id: string;
}

export default function DKMVideoAudioLecture() {
  const { id: lecture_id } = useParams();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const {
    data: assets = [],
    isLoading,
    isError,
  } = useQuery<LectureSessionAsset[]>({
    queryKey: ["video-audio", lecture_id],
    queryFn: async () => {
      const res = await axios.get(`/public/lecture-sessions-assets/filter`, {
        params: {
          lecture_id,
          file_type: "1,2",
        },
      });
      return res.data || [];
    },
    enabled: typeof lecture_id === "string" && lecture_id.length > 10,
    staleTime: 1000 * 60 * 5,
  });

  const columns = ["Jenis", "Judul", "Tanggal", "Aksi"];

  const rows = assets.map((item) => {
    const isYoutube =
      item.lecture_sessions_asset_file_type_label.toLowerCase() === "youtube";

    const viewElement = isYoutube ? (
      <a
        key={item.lecture_sessions_asset_id + "-yt"}
        href={item.lecture_sessions_asset_file_url.trim()}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs underline"
        style={{ color: theme.primary }}
      >
        Tonton di YouTube
      </a>
    ) : (
      <audio
        key={item.lecture_sessions_asset_id + "-audio"}
        controls
        preload="none"
        className="w-full"
        style={{ borderRadius: 8 }}
        src={item.lecture_sessions_asset_file_url.trim()}
      />
    );

    const handleEdit = () => {
      navigate(
        `/dkm/kajian/kajian-detail/${item.lecture_sessions_asset_lecture_session_id}/video-audio`,
        {
          state: { from: location.pathname },
        }
      );
    };

    return [
      item.lecture_sessions_asset_file_type_label,
      item.lecture_sessions_asset_title,
      <FormattedDate
        key={item.lecture_sessions_asset_id + "-date"}
        value={item.lecture_sessions_asset_created_at}
        className="text-xs"
      />,
      <div
        key={item.lecture_sessions_asset_id + "-actions"}
        className="flex items-center gap-2"
      >
        {viewElement}
        <button onClick={handleEdit} className="p-1" title="Kelola Video/Audio">
          <ExternalLink size={16} style={{ color: theme.black1 }} />
        </button>
      </div>,
    ];
  });

  return (
    <div className="pb-24 space-y-4">
      <PageHeader
        title="Video & Audio Kajian"
        onBackClick={() => navigate(-1)}
      />

      {isLoading && (
        <p className="text-sm text-gray-500">Memuat video/audio...</p>
      )}

      {isError && (
        <p className="text-sm text-red-500">Gagal memuat data video/audio.</p>
      )}

      {!isLoading && assets.length === 0 && (
        <p className="text-sm text-gray-500">
          Belum ada video atau audio tersedia.
        </p>
      )}

      {!isLoading && assets.length > 0 && (
        <SimpleTable
          columns={columns}
          rows={rows}
          emptyText="Belum ada video atau audio tersedia."
        />
      )}
    </div>
  );
}
