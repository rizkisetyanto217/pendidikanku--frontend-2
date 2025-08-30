import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

interface Asset {
  lecture_sessions_asset_id: string;
  lecture_sessions_asset_title: string;
  lecture_sessions_asset_file_url: string;
  lecture_sessions_asset_file_type: number; // 3,4,5,6 = dokumen
  lecture_sessions_asset_file_type_label: string;
}

interface GroupedAsset {
  lecture_session_id: string;
  lecture_session_title: string;
  assets: Asset[];
}

export default function MasjidDocsLecture() {
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  // ✅ ambil slug dari route
  const { lecture_slug } = useParams<{ lecture_slug: string }>();

  const { data: groupedAssets = [], isLoading } = useQuery<GroupedAsset[]>({
    queryKey: ["lecture-docs-by-slug", lecture_slug, "3,4,5,6"],
    queryFn: async () => {
      const res = await axios.get(
        "/public/lecture-sessions-assets/filter-by-lecture-slug",
        { params: { lecture_slug, file_type: "3,4,5,6" } }
      );
      return res.data?.data || [];
    },
    enabled: !!lecture_slug,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeaderUser
        title="Dokumen Kajian"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      {isLoading ? (
        <div className="text-center text-sm text-silver-500">
          Memuat data...
        </div>
      ) : groupedAssets.length === 0 ? (
        <div
          className="p-5 rounded-2xl shadow-sm"
          style={{ backgroundColor: theme.white1, color: theme.black1 }}
        >
          <p className="text-sm text-silver-400">
            Belum ada dokumen yang tersedia.
          </p>
        </div>
      ) : (
        groupedAssets.map((group) => (
          <div
            key={group.lecture_session_id}
            className="p-4 rounded-2xl shadow-md space-y-4"
            style={{ backgroundColor: theme.white1, color: theme.black1 }}
          >
            <h2 className="text-sm font-semibold">
              {group.lecture_session_title?.trim() || "Tanpa Judul"}
            </h2>

            {group.assets.map((asset) => (
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

                <a
                  href={asset.lecture_sessions_asset_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-blue-500 text-sm underline"
                >
                  Lihat Dokumen
                </a>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
