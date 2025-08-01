// File ini cocok digunakan ulang untuk halaman user dan halaman Linktree publik
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { Tabs, TabsContent } from "@/components/common/main/Tabs";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { Check } from "lucide-react";

export default function MasjidVideoAudioDetailLectureSessions() {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const [tab, setTab] = useState("youtube");
  const [activeIndex, setActiveIndex] = useState(0);
  const { id, slug } = useParams<{ id: string; slug: string }>();

  const { data: assets = [] } = useQuery({
    queryKey: ["lecture-session-assets", id],
    queryFn: async () => {
      const res = await axios.get("/public/lecture-sessions-assets/filter", {
        params: { lecture_session_id: id, file_type: "1,2" },
      });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const videoAssets = assets.filter(
    (a) => a.lecture_sessions_asset_file_type === 1
  );
  const audioAssets = assets.filter(
    (a) => a.lecture_sessions_asset_file_type === 2
  );
  const currentAssets = tab === "youtube" ? videoAssets : audioAssets;

  const getYoutubeEmbed = (url: string) => {
    const idMatch = url.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
    return idMatch?.[1] ?? "";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeaderUser
        title="Video & Audio"
        onBackClick={() => {
          navigate(`/masjid/${slug}/soal-materi/${id}`);
        }}
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { label: "YouTube", value: "youtube" },
          { label: "Audio", value: "audio" },
        ]}
      />

      <div
        className="rounded-2xl shadow-sm overflow-hidden pt-4"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        {/* Video YouTube */}
        {tab === "youtube" && videoAssets.length > 0 && (
          <div
            className="aspect-video w-full"
            style={{ backgroundColor: theme.black1 }}
          >
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${getYoutubeEmbed(videoAssets[activeIndex]?.lecture_sessions_asset_file_url)}`}
              title="YouTube Video"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Audio player & list */}
        <div className="p-5">
          <TabsContent value="audio" current={tab}>
            {audioAssets.length > 0 && (
              <div className="w-full mb-6">
                <audio
                  controls
                  className="w-full"
                  src={
                    audioAssets[activeIndex]?.lecture_sessions_asset_file_url
                  }
                />
              </div>
            )}
          </TabsContent>

          <ul className="space-y-2">
            {currentAssets.map((asset, index) => (
              <li
                key={asset.lecture_sessions_asset_id}
                onClick={() => setActiveIndex(index)}
                className="cursor-pointer rounded-lg border px-4 py-3 flex items-center justify-between transition"
                style={{
                  backgroundColor:
                    activeIndex === index ? theme.primary2 : theme.white2,
                  borderColor:
                    activeIndex === index ? theme.primary : theme.silver1,
                  color: theme.black1,
                  borderWidth: 1,
                }}
              >
                <span className="text-sm font-medium">
                  {asset.lecture_sessions_asset_title}
                </span>
                {activeIndex === index && (
                  <Check size={16} style={{ color: theme.primary }} />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
