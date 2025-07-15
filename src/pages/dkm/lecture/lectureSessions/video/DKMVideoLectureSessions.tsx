import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { Plus, X } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

export default function DKMVideoLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { id } = useParams();

  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=ysz5S6PUM-U",
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [newLink, setNewLink] = useState("");

  const [audioUrl, setAudioUrl] = useState(
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  );

  const addYoutubeLink = () => {
    if (newLink.trim()) {
      setYoutubeLinks((prev) => [...prev, newLink.trim()]);
      setNewLink("");
      setActiveIndex(youtubeLinks.length); // set ke video baru
    }
  };

  const removeYoutubeLink = (index: number) => {
    const newLinks = youtubeLinks.filter((_, i) => i !== index);
    setYoutubeLinks(newLinks);
    if (activeIndex === index) {
      setActiveIndex(0);
    } else if (index < activeIndex) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const navigate = useNavigate();

  const getYoutubeEmbed = (url: string) => {
    const idMatch = url.match(/(?:v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
    return idMatch?.[1] ?? "";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Video & Rekaman"
        onBackClick={() => history.back()} // ✅ BENAR
      />

      <div
        className="p-5 rounded-2xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        {/* VIDEO PLAYER */}
        {youtubeLinks.length > 0 && (
          <div className="aspect-video w-full mb-6 rounded-xl overflow-hidden bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${getYoutubeEmbed(
                youtubeLinks[activeIndex]
              )}`}
              title="YouTube Video"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* LIST VIDEO LINKS */}
        <div className="mb-6 flex flex-wrap gap-3">
          {youtubeLinks.map((link, index) => (
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

          {/* Audio Link */}
          <div className="space-y-1">
            <label
              className="font-medium block"
              style={{ color: theme.black1 }}
            >
              Link Audio
            </label>
            <audio controls src={audioUrl} className="w-full">
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-4 flex justify-end">
            <button
              className="px-4 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: theme.primary,
                color: theme.white1,
              }}
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
