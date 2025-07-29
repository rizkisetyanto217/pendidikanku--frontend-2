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

interface Donation {
  donation_id: string;
  donation_user_id?: string;
  donation_name?: string;
  donation_message: string;
  created_at: string;
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

  const { data: posts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["masjidPosts", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/posts/by-masjid/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const { data: donations = [], isLoading: isLoadingDonations } = useQuery<
    Donation[]
  >({
    queryKey: ["masjidDonations", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/donations/by-masjid/${slug}`);
      return res.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  // Normalisasi post_type agar "image", "video", dll dianggap "masjid"
  const normalizedPosts = posts.map((post) => ({
    ...post,
    post_type: post.post_type === "motivasi" ? "motivasi" : "masjid",
  }));

  const filteredPosts = normalizedPosts.filter(
    (post) => post.post_type === activeTab
  );

  const handlePostLike = async (postId: string) => {
    if (!isLoggedIn) {
      alert("Silakan login untuk menyukai postingan.");
      return;
    }

    try {
      await axios.post(`/public/post-likes/${slug}/toggle`, {
        post_id: postId,
      });
      queryClient.invalidateQueries({ queryKey: ["masjidPosts", slug] });
    } catch (err) {
      console.error("Gagal like:", err);
    }
  };

  const handleDonationLike = async (donationId: string) => {
    if (!isLoggedIn) {
      alert("Silakan login untuk menyukai donasi.");
      return;
    }

    try {
      await axios.post(`/public/donations/likes/${slug}/toggle`, {
        donation_like_donation_id: donationId,
      });
      queryClient.invalidateQueries({ queryKey: ["masjidDonations", slug] });
    } catch (err) {
      console.error("Gagal like donasi:", err);
    }
  };

  return (
    <>
      <PublicNavbar masjidName="Postingan" />
      <div className="pt-16 space-y-4">
        {/* Tabs */}
        <div className="flex items-center justify-start space-x-2">
          {(["masjid", "motivasi"] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className="px-4 py-1 rounded-full border text-sm font-medium capitalize"
              style={{
                backgroundColor:
                  activeTab === tabKey ? themeColors.primary : "transparent",
                color: activeTab === tabKey ? "#fff" : themeColors.black2,
                borderColor:
                  activeTab === tabKey
                    ? themeColors.primary
                    : themeColors.silver1,
              }}
            >
              {tabKey === "masjid" ? "🕌 Masjid" : "✍️ Motivasi & Doa"}
            </button>
          ))}
        </div>

        {/* === POSTINGAN === */}
        {isLoadingPosts ? (
          <p
            className="text-center text-sm"
            style={{ color: themeColors.silver2 }}
          >
            Memuat postingan...
          </p>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.post_id}
              className="block rounded-xl border"
              style={{
                borderColor: themeColors.silver1,
                backgroundColor: isDark
                  ? themeColors.white2
                  : themeColors.white1,
              }}
            >
              {post.post_image_url && (
                <Link to={`/masjid/${slug}/post/${post.post_id}`}>
                  <img
                    src={post.post_image_url}
                    alt="Post Gambar"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </Link>
              )}

              <div className="px-4 py-3 space-y-1">
                <Link to={`/masjid/${slug}/post/${post.post_id}`}>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: themeColors.black2 }}
                  >
                    {post.post_theme?.post_theme_name || "Tanpa Tema"}
                  </p>
                  <p className="text-sm" style={{ color: themeColors.silver4 }}>
                    <strong>{post.post_title}</strong> – {post.post_content}
                  </p>
                </Link>

                {/* Sisa non-link, bebas klik */}
                <p
                  className="text-xs pt-1"
                  style={{ color: themeColors.silver2 }}
                >
                  {new Date(post.post_created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="flex items-center justify-between pt-2 text-xs">
                  <div className="flex items-center space-x-4">
                    <div
                      className="flex items-center space-x-1 cursor-pointer"
                      onClick={() => handlePostLike(post.post_id)}
                    >
                      <Heart
                        size={14}
                        fill={
                          post.is_liked_by_user ? themeColors.primary : "none"
                        }
                      />
                      <span>{post.like_count} Suka</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Bookmark size={14} />
                      <span>Dukungan</span>
                    </div>
                  </div>
                  <InlineShare
                    title={post.post_title}
                    url={`${window.location.origin}/masjid/${slug}/post/${post.post_id}`}
                  />
                </div>
              </div>
            </div>
          ))
        )}

        {activeTab === "motivasi" &&
          !isLoadingDonations &&
          donations.length > 0 && (
            <>
              <p
                className="pt-4 text-sm font-semibold"
                style={{ color: themeColors.black2 }}
              >
                💝 Doa & Dukungan dari Donatur:
              </p>

              {donations.map((donation) => {
                const shareUrl = `${window.location.origin}/masjid/${slug}/motivation/${donation.donation_id}`;
                const donorName =
                  donation.donation_name ||
                  `User ${donation.donation_user_id?.slice(0, 5)}`;

                return (
                  <div
                    key={donation.donation_id}
                    className="rounded-xl border px-4 py-3 cursor-pointer"
                    style={{
                      borderColor: themeColors.primary,
                      backgroundColor: isDark
                        ? themeColors.white2
                        : themeColors.white1,
                    }}
                    onClick={() =>
                      navigate(
                        `/masjid/${slug}/motivation/${donation.donation_id}`
                      )
                    }
                  >
                    <p
                      className="font-semibold text-sm"
                      style={{ color: themeColors.black2 }}
                    >
                      {donorName}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: themeColors.silver4 }}
                    >
                      {donation.donation_message}
                    </p>
                    <p
                      className="text-xs pt-1"
                      style={{ color: themeColors.silver2 }}
                    >
                      {new Date(donation.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>

                    <div
                      className="flex items-center justify-between pt-2 text-xs"
                      style={{ color: themeColors.silver2 }}
                    >
                      <div
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // hindari klik ke detail
                          handleDonationLike(donation.donation_id);
                        }}
                      >
                        <Heart
                          size={14}
                          fill={
                            donation.is_liked_by_user
                              ? themeColors.primary
                              : "none"
                          }
                          stroke={
                            donation.is_liked_by_user
                              ? themeColors.primary
                              : themeColors.silver2
                          }
                        />
                        <span>{donation.like_count} Suka</span>
                      </div>

                      <InlineShare title={donorName} url={shareUrl} />
                    </div>
                  </div>
                );
              })}
            </>
          )}

        <BottomNavbar />
      </div>
    </>
  );
}
