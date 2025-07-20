import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { Plus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function DKMVideoLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [newLink, setNewLink] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: videoAssets = [], isLoading } = useQuery({
    queryKey: ["lecture-session-videos", id],
    queryFn: async () => {
      const res = await axios.get("/api/a/lecture-sessions-assets/filter", {
        params: { lecture_session_id: id, file_type: 1 },
      });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!id,
  });

  const getYoutubeEmbed = (url: string) => {
    const idMatch = url.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
    return idMatch?.[1] ?? "";
  };

  const addYoutubeLink = async () => {
    if (!newLink.trim() || !id) return;

    try {
      const payload = {
        lecture_sessions_asset_title: `Video - ${new Date().toLocaleTimeString("id-ID")}`,
        lecture_sessions_asset_file_url: newLink.trim(),
        lecture_sessions_asset_file_type: 1,
        lecture_sessions_asset_lecture_session_id: id,
      };

      await axios.post("/api/a/lecture-sessions-assets", payload);
      toast.success("Video berhasil ditambahkan");
      setNewLink("");

      // Refetch dulu
      await queryClient.invalidateQueries({
        queryKey: ["lecture-session-videos", id],
      });

      // Tunggu data benar-benar update
      setTimeout(() => {
        const latest = videoAssets?.length || 0;
        setActiveIndex(latest); // ✅ aman karena data sudah masuk
      }, 300); // kasih delay kecil agar query selesai
    } catch (err) {
      toast.error("Gagal menambahkan video");
    }
  };

  const removeYoutubeLink = async (assetId: string, index: number) => {
    try {
      await axios.delete(`/api/a/lecture-sessions-assets/${assetId}`);
      toast.success("Video berhasil dihapus");
      queryClient.invalidateQueries({
        queryKey: ["lecture-session-videos", id],
      });
      if (activeIndex === index) setActiveIndex(0);
      else if (index < activeIndex) setActiveIndex((prev) => prev - 1);
    } catch (err) {
      toast.error("Gagal menghapus video");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Video & Rekaman"
        onBackClick={() => navigate(`/dkm/kajian/kajian-detail/${id}`)}
      />

      <div
        className="p-5 rounded-2xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        {/* VIDEO PLAYER */}
        {videoAssets.length > 0 && (
          <div className="aspect-video w-full mb-6 rounded-xl overflow-hidden bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${getYoutubeEmbed(
                videoAssets[activeIndex]?.lecture_sessions_asset_file_url
              )}`}
              title="YouTube Video"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* LIST VIDEO LINKS */}
        <div className="mb-6 flex flex-wrap gap-3">
          {videoAssets.map((asset, index) => (
            <div
              key={asset.lecture_sessions_asset_id}
              className={`flex items-center gap-2 border px-3 py-1 rounded-full cursor-pointer ${
                activeIndex === index ? "border-primary" : "border-gray-300"
              }`}
              style={{
                backgroundColor:
                  activeIndex === index ? theme.primary2 : theme.white2,
                color: activeIndex === index ? theme.white1 : theme.black1,
              }}
              onClick={() => setActiveIndex(index)}
            >
              <span className="text-xs truncate max-w-[160px]">
                {asset.lecture_sessions_asset_title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeYoutubeLink(asset.lecture_sessions_asset_id, index);
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* FORM INPUT */}
        <div className="space-y-5 text-sm">
          <div className="space-y-1">
            <label
              className="font-medium block"
              style={{ color: theme.black1 }}
            >
              Tambah Link YouTube
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                style={{
                  backgroundColor: theme.white2,
                  borderColor: theme.primary2,
                  color: theme.black1,
                }}
              />
              <button
                onClick={addYoutubeLink}
                className="text-sm px-3 py-2 rounded-md font-medium"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.white1,
                }}
              >
                <Plus size={16} className="inline-block mr-1" />
                Tambah
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
