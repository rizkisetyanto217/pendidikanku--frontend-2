import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useResponsive } from "@/hooks/isResponsive";
import { Share } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  BookOpen,
  Share2,
  Phone,
} from "lucide-react";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import BorderLine from "@/components/common/main/Border";
import CartLink from "@/components/common/main/CardLink";
import FormattedDate from "@/constants/formattedDate";
import SholatScheduleCard from "@/components/pages/home/SholatSchedule";
import SocialMediaModal from "@/components/pages/home/SocialMediaModal";
import ShimmerImage from "@/components/common/main/ShimmerImage";

const currentUrl = typeof window !== "undefined" ? window.location.href : "";

// Types
interface Masjid {
  masjid_id: string;
  masjid_name: string;
  masjid_bio_short?: string;
  masjid_location?: string;
  masjid_image_url?: string;
  masjid_google_maps_url?: string;
  masjid_slug: string;
  masjid_instagram_url?: string;
  masjid_whatsapp_url?: string;
  masjid_youtube_url?: string;
  masjid_facebook_url?: string;
  masjid_tiktok_url?: string;
  masjid_donation_link?: string;
  masjid_created_at: string;
  // ✅ tambah ini
  masjid_whatsapp_group_ikhwan_url?: string;
  masjid_whatsapp_group_akhwat_url?: string;
}

interface Kajian {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_image_url: string;
  lecture_session_teacher_name: string;
  lecture_session_place: string;
  lecture_session_start_time: string;
}

/* =========================
   Helpers: normalisasi sosmed
========================= */
type SosmedKind = "instagram" | "whatsapp" | "youtube" | "facebook" | "tiktok";

function buildSosmedUrl(kind: SosmedKind, raw?: string): string | null {
  if (!raw) return null;
  const v0 = raw.trim();
  if (!v0) return null;

  const isURL = /^https?:\/\//i.test(v0);
  switch (kind) {
    case "instagram": {
      const v = v0.replace(/^@/, "");
      return isURL ? v0 : `https://instagram.com/${v}`;
    }
    case "whatsapp": {
      // ambil digit saja, ubah 0 awal -> 62
      const digits = v0.replace(/[^\d]/g, "").replace(/^0/, "62");
      return isURL ? v0 : digits ? `https://wa.me/${digits}` : null;
    }
    case "youtube": {
      return isURL ? v0 : `https://${v0}`;
    }
    case "facebook": {
      return isURL ? v0 : `https://facebook.com/${v0}`;
    }
    case "tiktok": {
      const v = v0.replace(/^@/, "");
      return isURL ? v0 : `https://tiktok.com/@${v}`;
    }
    default:
      return null;
  }
}

function buildWhatsAppContact(raw?: string, message?: string): string | null {
  const base = buildSosmedUrl("whatsapp", raw);
  if (!base) return null;
  if (!message) return base;
  const text = encodeURIComponent(message);
  return base.includes("?") ? `${base}&text=${text}` : `${base}?text=${text}`;
}

/* =========================
   Component
========================= */
export default function PublicLinktree() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { isDesktop } = useResponsive();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const [searchParams] = useSearchParams();
  const cacheKey = searchParams.get("k") || "default";

  const sliderRef = useRef<HTMLDivElement>(null);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const [showSocialModal, setShowSocialModal] = useState(false);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });
    setTimeout(updateArrowVisibility, 50);
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });
    setTimeout(updateArrowVisibility, 50);
  };

  const { data: masjidData, isLoading: loadingMasjid } = useQuery<Masjid>({
    queryKey: ["masjid", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/masjids/${slug}`);
      return res.data?.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: kajianList, isLoading: loadingKajian } = useQuery<Kajian[]>({
    queryKey: ["kajianListBySlug", slug, cacheKey],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-u/mendatang/${slug}`
      );
      return res.data?.data?.slice(0, 3) ?? [];
    },
    enabled: !!slug,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handleShareClick = () => {
    if (!masjidData) return;
    if (isDesktop && navigator.share) {
      navigator.share({ title: masjidData.masjid_name, url: currentUrl });
    } else {
      setShowShareMenu(true);
    }
  };

  const updateArrowVisibility = () => {
    const el = sliderRef.current;
    if (!el) return;
    const atStart = Math.floor(el.scrollLeft) <= 0;
    const atEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth;
    setShowLeft(!atStart);
    setShowRight(!atEnd);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateArrowVisibility();
    el.addEventListener("scroll", updateArrowVisibility);
    return () => el.removeEventListener("scroll", updateArrowVisibility);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(updateArrowVisibility, 100);
    return () => clearTimeout(timeout);
  }, [kajianList]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    }
    if (showShareMenu)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareMenu]);

  if (loadingMasjid || loadingKajian || loadingUser || !masjidData) {
    return <div>Loading...</div>;
  }

  // URL sosmed yang sudah dinormalisasi
  const waURL = buildSosmedUrl("whatsapp", masjidData.masjid_whatsapp_url);
  const igURL = buildSosmedUrl("instagram", masjidData.masjid_instagram_url);
  const ytURL = buildSosmedUrl("youtube", masjidData.masjid_youtube_url);

  return (
    <>
      {/* NAVBAR */}
      <PublicNavbar masjidName={masjidData.masjid_name} />

      <div className="w-full max-w-2xl mx-auto min-h-screen pb-28 overflow-auto bg-cover bg-no-repeat bg-center pt-16">
        <div className="p-4">
          <h2
            className="text-base font-semibold mb-4 mt-4"
            style={{ color: themeColors.black1 }}
          >
            Kajian Mendatang
          </h2>

          {/* Slider Kajian */}
          <div className="relative">
            {kajianList && kajianList.length > 0 && (
              <div className="relative">
                {showLeft && (
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                {showRight && (
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}

                <div className="overflow-hidden">
                  <div
                    ref={sliderRef}
                    className="flex overflow-x-auto no-scrollbar space-x-4 pr-4 snap-x scroll-smooth"
                  >
                    {kajianList.map((kajian, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          navigate(
                            `/masjid/${slug}/jadwal-kajian/${kajian.lecture_session_id}`
                          )
                        }
                        className="flex-shrink-0 snap-start w-[320px] rounded-lg overflow-hidden shadow cursor-pointer hover:opacity-90 transition"
                        style={{ backgroundColor: themeColors.white1 }}
                      >
                        <ShimmerImage
                          src={kajian.lecture_session_image_url || ""}
                          alt={kajian.lecture_session_title}
                          className="w-full aspect-[3/4] rounded-lg"
                        />
                        <div className="p-3">
                          <h2
                            className="font-semibold text-base truncate"
                            style={{ color: themeColors.black1 }}
                          >
                            {kajian.lecture_session_title}
                          </h2>
                          <p
                            className="text-base"
                            style={{ color: themeColors.black2 }}
                          >
                            {kajian.lecture_session_teacher_name} •{" "}
                            {kajian.lecture_session_start_time ? (
                              <FormattedDate
                                value={kajian.lecture_session_start_time}
                              />
                            ) : (
                              "-"
                            )}
                          </p>
                          <p
                            className="text-base"
                            style={{ color: themeColors.black2 }}
                          >
                            {kajian.lecture_session_place}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-right ">
                  <span
                    className="text-sm underline cursor-pointer hover:text-primary transition"
                    style={{ color: themeColors.quaternary }}
                    onClick={() => navigate(`/masjid/${slug}/jadwal-kajian`)}
                  >
                    Kajian Terbaru Lainnya
                  </span>
                </div>
              </div>
            )}
          </div>

          <BorderLine />

          <SholatScheduleCard location="DKI Jakarta" slug={slug || ""} />

          {/* --- SECTION: INFO MASJID --- */}
          <div className="mb-4 mt-4">
            <h1
              className="text-lg font-semibold"
              style={{ color: themeColors.black1 }}
            >
              {masjidData.masjid_name}
            </h1>
            <p className="text-base mt-2" style={{ color: themeColors.black2 }}>
              Dikelola oleh DKM Masjid untuk ummat muslim
            </p>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                masjidData.masjid_location || ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base inline-flex flex-col gap-0.5 pb-2 pt-2"
              style={{ color: themeColors.black2 }}
            >
              <span className="inline-flex items-center gap-0.5">
                <span>{masjidData.masjid_location || "-"}</span>
              </span>
              <span className="underline text-sm mt-0.5">Alamat Masjid</span>
            </a>

            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-3">
                {waURL && (
                  <a href={waURL} target="_blank" rel="noreferrer">
                    <ShimmerImage
                      src="/icons/whatsapp.svg"
                      alt="WhatsApp"
                      className="w-6 h-6"
                      shimmerClassName="rounded"
                    />
                  </a>
                )}
                {igURL && (
                  <a href={igURL} target="_blank" rel="noreferrer">
                    <ShimmerImage
                      src="/icons/instagram.svg"
                      alt="Instagram"
                      className="w-6 h-6"
                      shimmerClassName="rounded"
                    />
                  </a>
                )}
                {ytURL && (
                  <a href={ytURL} target="_blank" rel="noreferrer">
                    <ShimmerImage
                      src="/icons/youtube.svg"
                      alt="YouTube"
                      className="w-6 h-6"
                      shimmerClassName="rounded"
                    />
                  </a>
                )}
              </div>

              <button
                onClick={handleShareClick}
                className="flex items-center space-x-1 text-sm"
                style={{ color: themeColors.quaternary }}
              >
                <Share size={16} />
                <span>Bagikan</span>
              </button>
            </div>
          </div>

          <BorderLine />

          {/* --- SECTION: MENU UTAMA --- */}
          <div>
            <h2
              className="text-base font-semibold mb-2"
              style={{ color: themeColors.black1 }}
            >
              Menu Utama
            </h2>
            <div className="space-y-2 pt-2">
              <CartLink
                label="Profil Masjid"
                icon={<MapPin size={18} />}
                href={`/masjid/${masjidData.masjid_slug}/profil`}
              />
              <CartLink
                label="Jadwal Kajian"
                icon={<BookOpen size={18} />}
                href={`/masjid/${masjidData.masjid_slug}/jadwal-kajian`}
              />
              <CartLink
                label="Grup Masjid & Sosial Media"
                icon={<Share2 size={18} />}
                onClick={() => setShowSocialModal(true)}
              />
              <CartLink
                label="Hubungi Kami"
                icon={<Phone size={18} />}
                href={
                  buildWhatsAppContact(
                    masjidData.masjid_whatsapp_url,
                    `Assalamualaikum, saya ingin bertanya tentang kegiatan di ${masjidData.masjid_name}.`
                  ) || `/masjid/${masjidData.masjid_slug}/profil`
                }
                internal={false}
              />

              {/* Modal Sosmed */}
              <SocialMediaModal
                show={showSocialModal}
                onClose={() => setShowSocialModal(false)}
                data={{
                  masjid_instagram_url: masjidData.masjid_instagram_url,
                  masjid_whatsapp_url: masjidData.masjid_whatsapp_url,
                  masjid_youtube_url: masjidData.masjid_youtube_url,
                  masjid_facebook_url: (masjidData as any).masjid_facebook_url, // jika ada di tipe, pindahkan ke interface Masjid di atas
                  masjid_tiktok_url: (masjidData as any).masjid_tiktok_url,
                  // ✅ kirim juga group
                  masjid_whatsapp_group_ikhwan_url:
                    masjidData.masjid_whatsapp_group_ikhwan_url,
                  masjid_whatsapp_group_akhwat_url:
                    masjidData.masjid_whatsapp_group_akhwat_url,
                }}
              />
            </div>
          </div>

          {/* Bottom Navigation */}
          <BottomNavbar />
        </div>
      </div>
    </>
  );
}
