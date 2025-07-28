import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, Share2 } from "lucide-react";
import axios from "@/lib/axios";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

interface Post {
  post_id: string;
  post_title: string;
  post_content: string;
  post_image_url?: string;
  post_type: string;
  post_created_at: string;
  post_theme?: {
    post_theme_name: string;
  };
}

export default function MasjidDetailPost() {
  const { slug = "", postId = "" } = useParams();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  console.log("🪪 Params:", { slug, postId });

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery<Post | null>({
    queryKey: ["detailPost", slug, postId],
    queryFn: async () => {
      const res = await axios.get(`/public/posts/${postId}`);
      console.log("📦 API Response:", res.data);
      return res.data?.data ?? null;
    },
    enabled: !!slug && !!postId,
  });

  if (isLoading) {
    return <p className="text-center mt-20 text-sm">Memuat postingan...</p>;
  }

  if (isError) {
    console.error("❌ Error saat mengambil data post:", error);
    return (
      <p className="text-center mt-20 text-sm text-red-500">
        Gagal memuat postingan.
      </p>
    );
  }

  if (!post) {
    console.warn("⚠️ Post kosong atau tidak ditemukan.");
    return (
      <p className="text-center mt-20 text-sm">Postingan tidak ditemukan.</p>
    );
  }

  const shareUrl = `${window.location.origin}/masjid/${slug}/post/${post.post_id}`;

  return (
    <>
      <PageHeaderUser
        title="Detail Postingan"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className="space-y-4">
        {post.post_image_url && (
          <img
            src={post.post_image_url}
            alt="Gambar Post"
            className="w-full aspect-[4/3] object-cover rounded-xl"
          />
        )}

        <div
          className="space-y-1 py-2"
          style={{
            borderColor: themeColors.silver1,
            backgroundColor: isDark ? themeColors.white2 : themeColors.white1,
          }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: themeColors.black2 }}
          >
            {post.post_theme?.post_theme_name || "Tanpa Tema"}
          </p>

          <p
            className="text-lg font-bold"
            style={{ color: themeColors.black2 }}
          >
            {post.post_title}
          </p>

          <p className="text-sm" style={{ color: themeColors.silver4 }}>
            {post.post_content}
          </p>

          <p className="text-xs" style={{ color: themeColors.silver2 }}>
            {new Date(post.post_created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <div
            className="flex items-center justify-between pt-2 text-xs"
            style={{ color: themeColors.silver2 }}
          >
            <div className="flex items-center space-x-1">
              <Heart size={14} />
              <span>Suka</span>
            </div>

            <div
              className="flex items-center space-x-1 cursor-pointer"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.post_title,
                    text: post.post_content,
                    url: shareUrl,
                  });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                  alert("Link telah disalin ke clipboard");
                }
              }}
            >
              <Share2 size={16} />
              <span>Bagikan</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
