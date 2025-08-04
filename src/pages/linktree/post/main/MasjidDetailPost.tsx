import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Share2 } from "lucide-react";
import axios from "@/lib/axios";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import FormattedDate from "@/constants/formattedDate";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
  like_count: number;
  is_liked_by_user: boolean;
}

export default function MasjidDetailPost() {
  const { slug = "", postId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoggedIn } = useCurrentUser();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery<Post | null>({
    queryKey: ["detailPost", slug, postId],
    queryFn: async () => {
      const res = await axios.get(`/public/posts/${postId}`);
      return res.data?.data ?? null;
    },
    enabled: !!slug && !!postId,
  });

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (post) {
      setLikeCount(post.like_count);
      setIsLiked(post.is_liked_by_user);
    }
  }, [post]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      alert("Silakan login untuk menyukai postingan.");
      return;
    }

    try {
      await axios.post(`/public/post-likes/${slug}/toggle`, {
        post_id: postId,
      });
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
      queryClient.invalidateQueries({ queryKey: ["detailPost", slug, postId] });
      queryClient.invalidateQueries({ queryKey: ["masjidPosts", slug] }); // optional: sinkron juga ke daftar
    } catch (err) {
      console.error("❌ Gagal like:", err);
      alert("Gagal menyukai postingan. Coba lagi nanti.");
    }
  };

  const shareUrl = `${window.location.origin}/masjid/${slug}/post/${postId}`;

  if (isLoading) {
    return <p className="text-center mt-20 text-sm">Memuat postingan...</p>;
  }

  if (isError) {
    return (
      <p className="text-center mt-20 text-sm text-red-500">
        Gagal memuat postingan.
      </p>
    );
  }

  if (!post) {
    return (
      <p className="text-center mt-20 text-sm">Postingan tidak ditemukan.</p>
    );
  }

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
          <ShimmerImage
            src={post.post_image_url}
            alt="Gambar Post"
            className="w-full aspect-[4/3] object-cover rounded-xl"
            shimmerClassName="rounded-xl"
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

          <FormattedDate
            value={post.post_created_at}
            fullMonth
            className="text-xs"
          />

          <div
            className="flex items-center justify-between pt-2 text-xs"
            style={{ color: themeColors.silver2 }}
          >
            {/* LIKE */}
            <div
              className="flex items-center space-x-1 cursor-pointer"
              onClick={handleLike}
            >
              <Heart
                size={14}
                fill={isLiked ? themeColors.primary : "none"}
                stroke={isLiked ? themeColors.primary : themeColors.silver2}
              />
              <span>{likeCount} Suka</span>
            </div>

            {/* SHARE */}
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
