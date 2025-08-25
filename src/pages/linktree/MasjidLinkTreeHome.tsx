import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useResponsive } from "@/hooks/isResponsive";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  BookOpen,
  Share as ShareIcon,
  Share2,
  Phone,
  HeartHandshake,
  Copy,
  Link as LinkIcon,
  ExternalLink,
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

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, []);
  return { copied, copy };
}

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-pulse">
      <div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-4 w-40 mt-4 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-4 w-72 mt-2 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-10 mt-6 rounded-xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-8 mt-3 rounded-xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-32 mt-8 rounded-2xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
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

  const { copied, copy } = useCopy();

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });
    setTimeout(updateArrowVisibility, 50);
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });
    setTimeout(updateArrowVisibility, 50);
  };

  const {
    data: masjidData,
    isLoading: loadingMasjid,
    error: masjidError,
  } = useQuery<Masjid>({
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
      return res.data?.data?.slice(0, 10) ?? [];
    },
    enabled: !!slug,
    staleTime: 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handleShareClick = () => {
    if (!masjidData) return;
    if (navigator.share) {
      navigator
        .share({ title: masjidData.masjid_name, url: currentUrl })
        .catch(() => {
          setShowShareMenu((s) => !s);
        });
    } else {
      setShowShareMenu((s) => !s);
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

  const waURL = useMemo(
    () => buildSosmedUrl("whatsapp", masjidData?.masjid_whatsapp_url),
    [masjidData?.masjid_whatsapp_url]
  );
  const igURL = useMemo(
    () => buildSosmedUrl("instagram", masjidData?.masjid_instagram_url),
    [masjidData?.masjid_instagram_url]
  );
  const ytURL = useMemo(
    () => buildSosmedUrl("youtube", masjidData?.masjid_youtube_url),
    [masjidData?.masjid_youtube_url]
  );
  const fbURL = useMemo(
    () => buildSosmedUrl("facebook", masjidData?.masjid_facebook_url),
    [masjidData?.masjid_facebook_url]
  );
  const ttURL = useMemo(
    () => buildSosmedUrl("tiktok", masjidData?.masjid_tiktok_url),
    [masjidData?.masjid_tiktok_url]
  );

  const donateURL = masjidData?.masjid_donation_link || undefined;

  const openMapsHref = useMemo(() => {
    const q = masjidData?.masjid_location?.trim();
    if (!q) return undefined;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }, [masjidData?.masjid_location]);

  if (loadingMasjid || loadingKajian || loadingUser) return <LoadingSkeleton />;
  if (masjidError || !masjidData)
    return (
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-20 text-center">
        <p className="text-lg font-medium">Masjid tidak ditemukan.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ChevronLeft size={16} /> Kembali
        </button>
      </div>
    );

  return (
    <>
      <PublicNavbar masjidName={masjidData.masjid_name} />

      <div className="w-full max-w-2xl mx-auto min-h-screen pb-28 overflow-auto bg-no-repeat bg-center pt-16">
        <div className="px-4">
          {/* HERO */}
          <div
            className="relative rounded-2xl overflow-hidden border"
            style={{ borderColor: themeColors.silver1 }}
          >
            <div className="h-40 sm:h-52 w-full bg-gray-100 dark:bg-gray-800">
              <ShimmerImage
                src={masjidData.masjid_image_url || "/images/cover-masjid.jpg"}
                alt={masjidData.masjid_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <button
              onClick={handleShareClick}
              aria-label="Bagikan"
              className="absolute top-3 right-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-900/70 backdrop-blur text-sm shadow hover:bg-white"
            >
              <ShareIcon size={16} /> Bagikan sekarang
            </button>

            {/* Sheet share manual */}
            {showShareMenu && (
              <div
                ref={shareMenuRef}
                className="absolute top-12 right-3 z-20 w-64 rounded-xl border bg-white dark:bg-gray-900 shadow-md p-2"
              >
                <button
                  onClick={() => copy(currentUrl)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Copy size={16} /> {copied ? "Tersalin!" : "Salin tautan"}
                </button>
                {igURL && (
                  <a
                    href={igURL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <LinkIcon size={16} /> Buka Instagram
                  </a>
                )}
                {fbURL && (
                  <a
                    href={fbURL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <LinkIcon size={16} /> Buka Facebook
                  </a>
                )}
                {ttURL && (
                  <a
                    href={ttURL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <LinkIcon size={16} /> Buka TikTok
                  </a>
                )}
              </div>
            )}

            {/* Info ringkas */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-end gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden border bg-white/40 backdrop-blur">
                  <ShimmerImage
                    src={
                      masjidData.masjid_image_url || "/images/masjid-avatar.png"
                    }
                    alt={masjidData.masjid_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-white font-bold text-xl leading-tight line-clamp-2">
                    {masjidData.masjid_name}
                  </h1>
                  {masjidData.masjid_bio_short && (
                    <p className="text-white/90 text-sm line-clamp-1">
                      {masjidData.masjid_bio_short}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {openMapsHref && (
              <a
                href={openMapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <MapPin size={16} /> Peta
              </a>
            )}
            {waURL && (
              <a
                href={
                  buildWhatsAppContact(
                    masjidData.masjid_whatsapp_url,
                    `Assalamualaikum, saya ingin bertanya tentang kegiatan di ${masjidData.masjid_name}.`
                  ) || waURL
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Phone size={16} /> WhatsApp
              </a>
            )}
            <button
              onClick={handleShareClick}
              className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Share2 size={16} /> Bagikan
            </button>
            {donateURL && (
              <a
                href={donateURL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <HeartHandshake size={16} /> Donasi
              </a>
            )}
          </div>

          {/* Sosmed icons */}
          {(waURL || igURL || ytURL || fbURL || ttURL) && (
            <div className="flex items-center gap-3 mt-4">
              {waURL && (
                <a
                  href={waURL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <img
                    src="/icons/whatsapp.svg"
                    alt="WhatsApp"
                    className="w-5 h-5"
                  />
                </a>
              )}
              {igURL && (
                <a
                  href={igURL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <img
                    src="/icons/instagram.svg"
                    alt="Instagram"
                    className="w-5 h-5"
                  />
                </a>
              )}
              {ytURL && (
                <a
                  href={ytURL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <img
                    src="/icons/youtube.svg"
                    alt="YouTube"
                    className="w-5 h-5"
                  />
                </a>
              )}
              {fbURL && (
                <a
                  href={fbURL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <img
                    src="/icons/facebook.svg"
                    alt="Facebook"
                    className="w-5 h-5"
                  />
                </a>
              )}
              {ttURL && (
                <a
                  href={ttURL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <img
                    src="/icons/tiktok.svg"
                    alt="TikTok"
                    className="w-5 h-5"
                  />
                </a>
              )}
            </div>
          )}

          <BorderLine />

          {/* Slider Kajian */}
          <div className="relative">
            <h2
              className="text-lg font-semibold mb-3 mt-2"
              style={{ color: themeColors.black1 }}
            >
              Kajian Mendatang
            </h2>

            {(!kajianList || kajianList.length === 0) && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Belum ada jadwal kajian.
              </div>
            )}

            {kajianList && kajianList.length > 0 && (
              <div className="relative">
                {showLeft && (
                  <button
                    onClick={scrollLeft}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800/80 hover:bg-white/95 p-1.5 rounded-full shadow"
                    aria-label="Scroll kiri"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}

                {showRight && (
                  <button
                    onClick={scrollRight}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800/80 hover:bg-white/95 p-1.5 rounded-full shadow"
                    aria-label="Scroll kanan"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}

                <div className="overflow-hidden">
                  <div
                    ref={sliderRef}
                    className="flex overflow-x-auto no-scrollbar gap-3 pr-3 snap-x scroll-smooth"
                  >
                    {kajianList.map((kajian) => (
                      <div
                        key={kajian.lecture_session_id}
                        onClick={() =>
                          navigate(
                            `/masjid/${slug}/jadwal-kajian/${kajian.lecture_session_id}`
                          )
                        }
                        className="flex-shrink-0 snap-start w-[200px] sm:w-[220px] md:w-[240px] rounded-xl overflow-hidden border cursor-pointer hover:opacity-90 transition"
                        style={{
                          backgroundColor: themeColors.white1,
                          borderColor: themeColors.silver1,
                        }}
                      >
                        <ShimmerImage
                          src={kajian.lecture_session_image_url || ""}
                          alt={kajian.lecture_session_title}
                          className="w-full aspect-[4/5] object-cover"
                        />
                        <div className="p-2.5">
                          <h3
                            className="font-semibold text-sm line-clamp-2"
                            style={{ color: themeColors.black1 }}
                            title={kajian.lecture_session_title}
                          >
                            {kajian.lecture_session_title}
                          </h3>
                          <p
                            className="text-xs mt-1 line-clamp-1"
                            style={{ color: themeColors.black2 }}
                            title={kajian.lecture_session_teacher_name}
                          >
                            {kajian.lecture_session_teacher_name || "-"}
                          </p>
                          <p
                            className="text-xs line-clamp-1"
                            style={{ color: themeColors.black2 }}
                          >
                            {kajian.lecture_session_start_time ? (
                              <FormattedDate
                                value={kajian.lecture_session_start_time}
                              />
                            ) : (
                              "-"
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <span
                    className="text-sm underline cursor-pointer hover:opacity-80 transition"
                    style={{ color: themeColors.black2 }}
                    onClick={() => navigate(`/masjid/${slug}/jadwal-kajian`)}
                  >
                    Lihat semua kajian
                  </span>
                </div>
              </div>
            )}
          </div>

          <BorderLine />

          {/* Jadwal Sholat */}
          <SholatScheduleCard location="DKI Jakarta" slug={slug || ""} />

          <BorderLine />

          {/* SECTION: INFO MASJID */}
          <div className="mb-4 mt-4">
            <h2
              className="text-lg font-semibold"
              style={{ color: themeColors.black1 }}
            >
              Tentang Masjid
            </h2>
            <p className="text-sm mt-1" style={{ color: themeColors.black2 }}>
              Dikelola oleh DKM Masjid untuk ummat muslim
            </p>

            {masjidData.masjid_location && (
              <a
                href={openMapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base inline-flex flex-col gap-0.5 pb-2 pt-2"
                style={{ color: themeColors.black2 }}
              >
                <span className="inline-flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{masjidData.masjid_location}</span>
                  <ExternalLink size={14} className="opacity-70" />
                </span>
                <span className="underline text-sm mt-0.5">
                  Lihat di Google Maps
                </span>
              </a>
            )}
          </div>

          <BorderLine />

          {/* MENU UTAMA */}
          <div>
            <h2
              className="text-lg font-semibold mb-2"
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
              {donateURL && (
                <CartLink
                  label="Donasi"
                  icon={<HeartHandshake size={18} />}
                  href={donateURL}
                  internal={false}
                />
              )}
            </div>
          </div>

          {/* Modal Sosmed */}
          <SocialMediaModal
            show={showSocialModal}
            onClose={() => setShowSocialModal(false)}
            data={{
              masjid_instagram_url: masjidData.masjid_instagram_url,
              masjid_whatsapp_url: masjidData.masjid_whatsapp_url,
              masjid_youtube_url: masjidData.masjid_youtube_url,
              masjid_facebook_url: masjidData.masjid_facebook_url,
              masjid_tiktok_url: masjidData.masjid_tiktok_url,
              masjid_whatsapp_group_ikhwan_url:
                masjidData.masjid_whatsapp_group_ikhwan_url,
              masjid_whatsapp_group_akhwat_url:
                masjidData.masjid_whatsapp_group_akhwat_url,
            }}
          />

          {/* Bottom Navigation */}
          <BottomNavbar />
        </div>
      </div>
    </>
  );
}
