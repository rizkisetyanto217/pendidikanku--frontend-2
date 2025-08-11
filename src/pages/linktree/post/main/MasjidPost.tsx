import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Heart, Share2 } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import axios from "@/lib/axios";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import SharePopover from "@/components/common/public/SharePopover";
import FormattedDate from "@/constants/formattedDate";
import CommonCardList from "@/components/common/main/CommonCardList";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import LoginPromptModal from "@/components/common/home/LoginPromptModal";

function InlineShare({ title, url }: { title: string; url: string }) {
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;
  const [showShare, setShowShare] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert("Link berhasil disalin!");
    setShowShare(false);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation(); // cegah trigger ke parent
          setShowShare(!showShare);
        }}
        className="flex items-center space-x-1 text-sm"
        style={{ color: themeColors.quaternary }}
      >
        <Share2 size={16} />
        <span>Bagikan</span>
      </button>

      {showShare && (
        <div
          className="absolute z-50 mt-2 p-3 border rounded shadow w-64 right-0"
          style={{
            backgroundColor: themeColors.white1,
            borderColor: themeColors.silver1,
          }}
        >
          <p className="text-xs mb-2" style={{ color: themeColors.black2 }}>
            Bagikan link:
          </p>
          <input
            type="text"
            readOnly
            value={url}
            className="w-full text-xs p-1 border rounded mb-2"
            style={{
              backgroundColor: themeColors.white3,
              borderColor: themeColors.silver1,
              color: themeColors.black1,
            }}
          />
          <div className="flex justify-between">
            <button
              onClick={handleCopy}
              className="text-sm font-semibold hover:underline"
              style={{ color: themeColors.success1 }}
            >
              Salin Link
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Assalamualaikum! Lihat ini yuk: ${title} — ${url}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold hover:underline"
              style={{ color: themeColors.success1 }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

interface Post {
  post_id: string;
  post_title: string;
  post_content: string;
  post_image_url?: string;
  post_type: string; // bisa masjid | motivasi | image | lainnya
  post_created_at: string;
  post_theme?: {
    post_theme_name: string;
  };
  like_count: number;
  is_liked_by_user: boolean;
}

export default function MasjidPost() {
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;
  const [activeTab, setActiveTab] = useState<"masjid" | "motivasi">("masjid");
  const { slug = "" } = useParams<{ slug: string }>();
  const { user, isLoggedIn } = useCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showHeartId, setShowHeartId] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptSource, setLoginPromptSource] = useState<
    "like" | "bookmark" | null
  >(null);

  const { data: posts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["masjidPosts", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/posts/by-masjid/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  // Normalisasi post_type agar "image", "video", dll dianggap "masjid"
  const normalizedPosts = Array.isArray(posts)
    ? posts.map((post) => ({
        ...post,
        post_type: post.post_type === "motivasi" ? "motivasi" : "masjid",
      }))
    : [];

  const filteredPosts = normalizedPosts.filter(
    (post) => post.post_type === activeTab
  );

  const handlePostLike = async (postId: string, isAlreadyLiked: boolean) => {
    if (!isLoggedIn) {
      setLoginPromptSource("like");
      setShowLoginPrompt(true);
      return;
    }

    try {
      // ✅ Tampilkan animasi ❤️ hanya kalau BELUM di-like
      if (!isAlreadyLiked) {
        setShowHeartId(postId);
        setTimeout(() => setShowHeartId(null), 800);
      }

      await axios.post(`/public/post-likes/${slug}/toggle`, {
        post_id: postId,
      });

      queryClient.invalidateQueries({ queryKey: ["masjidPosts", slug] });
    } catch (err) {
      console.error("Gagal like:", err);
    }
  };

  const handleDoubleClickLike = async (post: Post) => {
    if (!isLoggedIn) {
      setLoginPromptSource("like");
      setShowLoginPrompt(true);
      return;
    }

    if (post.is_liked_by_user) return;

    try {
      setShowHeartId(post.post_id);
      setTimeout(() => setShowHeartId(null), 800);

      await axios.post(`/public/post-likes/${slug}/toggle`, {
        post_id: post.post_id,
      });

      queryClient.invalidateQueries({ queryKey: ["masjidPosts", slug] });
    } catch (err) {
      console.error("Gagal like:", err);
    }
  };

  return (
    <>
      <PublicNavbar masjidName="Postingan" />
      <div className="pt-20 space-y-4 pb-20">
        {/* === POSTINGAN === */}
        {isLoadingPosts ? (
          <p
            className="text-center text-sm"
            style={{ color: themeColors.silver2 }}
          >
            Memuat postingan...
          </p>
        ) : filteredPosts.length === 0 ? (
          <div
            className="text-center text-sm pt-10"
            style={{ color: themeColors.silver2 }}
          >
            Belum ada postingan.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <CommonCardList key={post.post_id}>
              {post.post_image_url && (
                // <Link to={`/masjid/${slug}/post/${post.post_id}`}>
                <div className="relative">
                  <ShimmerImage
                    src={post.post_image_url}
                    alt="Post Gambar"
                    className="w-full aspect-[4/3] object-cover rounded-lg"
                    shimmerClassName="rounded-lg"
                    onDoubleClick={() => handleDoubleClickLike(post)}
                  />

                  {showHeartId === post.post_id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Heart
                        size={64}
                        className="text-white animate-ping-fast"
                        fill="white"
                      />
                    </div>
                  )}
                </div>

                // </Link>
              )}

              <div className="space-y-1 p-4">
                {/* <Link to={`/masjid/${slug}/post/${post.post_id}`}> */}
                <p
                  className="font-semibold text-base"
                  style={{ color: themeColors.black2 }}
                >
                  {post.post_theme?.post_theme_name || "Tanpa Tema"}
                </p>
                <p className="text-base" style={{ color: themeColors.silver4 }}>
                  <strong>{post.post_title}</strong> – {post.post_content}
                </p>
                {/* </Link> */}

                <FormattedDate
                  value={post.post_created_at}
                  fullMonth
                  className="text-sm pt-1"
                />

                <div className="flex items-center justify-between pt-2 text-xs">
                  <div className="flex items-center space-x-4">
                    <div
                      className="flex items-center space-x-1 cursor-pointer"
                      onClick={() =>
                        handlePostLike(post.post_id, post.is_liked_by_user)
                      }
                    >
                      <Heart
                        size={20}
                        fill={
                          post.is_liked_by_user ? themeColors.primary : "none"
                        }
                        stroke={
                          post.is_liked_by_user
                            ? themeColors.primary
                            : themeColors.black2
                        }
                      />

                      <span>{post.like_count} Suka</span>
                    </div>

                    {/* <div className="flex items-center space-x-1">
                      <Bookmark size={14} />
                      <span>Dukungan</span>
                    </div> */}
                  </div>
                  <InlineShare
                    title={post.post_title}
                    url={`${window.location.origin}/masjid/${slug}/post/${post.post_id}`}
                  />
                </div>
              </div>
            </CommonCardList>
          ))
        )}
        <BottomNavbar />
        <LoginPromptModal
          show={showLoginPrompt}
          onClose={() => {
            setShowLoginPrompt(false);
            setLoginPromptSource(null);
          }}
          onLogin={() => (window.location.href = "/login")}
          showContinueButton={false}
          title={
            loginPromptSource === "like"
              ? "Login untuk Menyukai Postingan"
              : "Login untuk Mendukung Postingan"
          }
          message={
            loginPromptSource === "like"
              ? "Silakan login untuk memberi like pada postingan ini."
              : "Silakan login untuk mendukung atau menyimpan postingan ini."
          }
        />
      </div>
    </>
  );
}
