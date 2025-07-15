import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/PageHeader";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { Plus, X } from "lucide-react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function DKMVideoLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { id } = useParams();

  // ...
  const { data: videoAssets, isLoading: isVideoLoading } = useQuery<
    {
      lecture_sessions_asset_file_url: string;
      lecture_sessions_asset_title: string;
    }[]
  >({
    queryKey: ["lecture-session-videos", id],
    queryFn: async () => {
      if (!id) return [];

      const res = await axios.get(`/api/a/lecture-sessions-assets/filter`, {
        params: {
          lecture_session_id: id,
          file_type: 1,
        },
      });

      console.log("✅ Response dari API:", res.data);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!id,
  });

  const [newLink, setNewLink] = useState("");
  const [localLinks, setLocalLinks] = useState<string[]>([]);

  const allYoutubeLinks = [
    ...(videoAssets?.map((v) => v.lecture_sessions_asset_file_url) || []),
    ...localLinks,
  ];

  console.log("📦 Video dari server:", videoAssets);
  console.log("➕ Link lokal (belum disimpan):", localLinks);
  console.log("📺 Semua link YouTube (gabungan):", allYoutubeLinks);

  const [activeIndex, setActiveIndex] = useState(0);

  const addYoutubeLink = () => {
    if (newLink.trim()) {
      console.log("➕ Menambahkan link baru:", newLink);
      setLocalLinks((prev) => [...prev, newLink.trim()]);
      setNewLink("");
      setActiveIndex(allYoutubeLinks.length); // set ke video baru
    }
  };

  const removeYoutubeLink = (index: number) => {
    const originalLength = videoAssets?.length || 0;
    console.log("🗑️ Hapus link index:", index);

    if (index < originalLength) {
      toast.error("Link dari server tidak bisa dihapus langsung.");
      console.warn(
        "⚠️ Tidak bisa hapus link dari server:",
        allYoutubeLinks[index]
      );
      return;
    }

    const localIndex = index - originalLength;
    const updated = localLinks.filter((_, i) => i !== localIndex);
    console.log("✅ Link yang tersisa setelah hapus:", updated);

    setLocalLinks(updated);
    if (activeIndex === index) setActiveIndex(0);
    else if (index < activeIndex) setActiveIndex((prev) => prev - 1);
  };

  const getYoutubeEmbed = (url: string) => {
    const idMatch = url.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
    return idMatch?.[1] ?? "";
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Video & Rekaman" onBackClick={() => history.back()} />

      <div
        className="p-5 rounded-2xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        {/* VIDEO PLAYER */}
        {allYoutubeLinks.length > 0 && (
          <div className="aspect-video w-full mb-6 rounded-xl overflow-hidden bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${getYoutubeEmbed(allYoutubeLinks[activeIndex])}`}
              title="YouTube Video"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* LIST VIDEO LINKS */}
        <div className="mb-6 flex flex-wrap gap-3">
          {allYoutubeLinks.map((link, index) => (
            <div
              key={index}
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
                {link.replace("https://www.youtube.com/watch?v=", "")}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeYoutubeLink(index);
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* FORM INPUT */}
        <div className="space-y-5 text-sm">
          {/* Add New YouTube */}
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

          {/* Tombol Simpan (optional implementasi untuk POST nanti) */}
          <div className="pt-4 flex justify-end">
            <button
              className="px-4 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: theme.primary,
                color: theme.white1,
              }}
              onClick={() => toast("Implementasi simpan belum tersedia")}
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
