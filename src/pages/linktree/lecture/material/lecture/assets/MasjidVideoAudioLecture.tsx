import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

interface Asset {
  lecture_sessions_asset_id: string;
  lecture_sessions_asset_title: string;
  lecture_sessions_asset_file_url: string;
  lecture_sessions_asset_file_type: number;
  lecture_sessions_asset_file_type_label: string;
}

interface GroupedAsset {
  lecture_session_id: string;
  lecture_session_title: string;
  assets: Asset[];
}

export default function MasjidVideoAudioLecture() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { id } = useParams(); // lecture_id

  const { data: groupedAssets = [], isLoading } = useQuery<GroupedAsset[]>({
    queryKey: ["lecture-assets", id],
    queryFn: async () => {
      const res = await axios.get(
        "/public/lecture-sessions-assets/filter-by-lecture-id",
        {
          params: { lecture_id: id, file_type: "1,2" },
        }
      );
      return res.data?.data || [];
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const getYoutubeEmbed = (url: string) => {
    const match = url?.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] || "";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeaderUser
        title="Video & Audio Kajian"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      {isLoading ? (
        <div className="text-center text-sm text-silver-500 mt-4">
          Memuat data...
        </div>
      ) : groupedAssets.length === 0 ? (
        <div
          className="rounded-2xl p-4 shadow-sm text-center mt-4"
          style={{
            backgroundColor: theme.white1,
            color: theme.black1,
          }}
        >
          <p className="text-sm text-silver-400">Belum ada data video/audio.</p>
        </div>
      ) : (
        groupedAssets.map((group) => (
          <div
            key={group.lecture_session_id}
            className="rounded-2xl shadow-md overflow-hidden mb-6"
            style={{
              backgroundColor: theme.white1,
              borderColor: theme.silver2,
              color: theme.black1,
            }}
          >
            <div className="p-4 space-y-4">
              <h2 className="text-sm font-semibold">
                {group.lecture_session_title?.trim() || "Tanpa Judul"}
              </h2>

              {group.assets.map((asset) => {
                const isVideo = asset.lecture_sessions_asset_file_type === 1;
                const isAudio = asset.lecture_sessions_asset_file_type === 2;
                const embedId = getYoutubeEmbed(
                  asset.lecture_sessions_asset_file_url
                );

                return (
                  <div
                    key={asset.lecture_sessions_asset_id}
                    className="space-y-2 border-t pt-4"
                    style={{ borderColor: theme.silver2 }}
                  >
                    <p className="text-sm font-medium">
                      {asset.lecture_sessions_asset_title || "Tanpa Judul"}
                    </p>

                    <p className="text-xs text-silver-500 italic">
                      {asset.lecture_sessions_asset_file_type_label || ""}
                    </p>

                    {isVideo && embedId && (
                      <div
                        className="aspect-video w-full rounded-xl overflow-hidden"
                        style={{ backgroundColor: theme.black1 }}
                      >
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${embedId}`}
                          title={asset.lecture_sessions_asset_title}
                          allowFullScreen
                        />
                      </div>
                    )}

                    {isAudio && asset.lecture_sessions_asset_file_url && (
                      <audio
                        controls
                        className="w-full"
                        src={asset.lecture_sessions_asset_file_url}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
