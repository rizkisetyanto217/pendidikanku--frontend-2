import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useIsMobile } from "@/hooks/isMobile";
import { Share } from "lucide-react";
import { useState } from "react";
import { useRef, useEffect } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

const currentUrl = window.location.href;

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
  masjid_donation_link?: string;
}

interface Kajian {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_image_url: string;
  lecture_session_teacher_name: string;
  lecture_session_place: string;
  lecture_session_start_time: string;
}

export default function PublicLinktree() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isMobile = useIsMobile();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const { data: masjidData, isLoading: loadingMasjid } = useQuery<Masjid>({
    queryKey: ["masjid", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/masjids/${slug}`);
      return res.data?.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: kajianList, isLoading: loadingKajian } = useQuery<Kajian[]>({
    queryKey: ["kajianListBySlug", slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-u/mendatang/${slug}`
      );
      return res.data?.data?.slice(0, 3) ?? [];
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const handleShareClick = () => {
    if (!masjidData) return;
    if (isMobile && navigator.share) {
      navigator.share({ title: masjidData.masjid_name, url: currentUrl });
    } else {
      setShowShareMenu(true);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    }
    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareMenu]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    alert("Link berhasil disalin!");
  };

  if (loadingMasjid || loadingKajian || !masjidData)
    return <div>Loading...</div>;

  const DarkToggle = () => (
    <button
      onClick={toggleDark}
      className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
  if (isMobile) {
    return (
      <div className="w-full min-h-screen p-4 pb-28 overflow-auto bg-cover bg-no-repeat bg-center">
        <DarkToggle />

        {kajianList && kajianList.length > 0 && (
          <div className="overflow-x-auto mb-4 p-2 pt-4">
            <div className="flex space-x-4 w-max">
              {kajianList.map((kajian, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    navigate(
                      `/masjid/${slug}/jadwal-kajian/${kajian.lecture_session_id}`
                    )
                  }
                  className="min-w-[260px] max-w-xs rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-90 transition"
                  style={{ backgroundColor: themeColors.white1 }}
                >
                  <img
                    src={
                      kajian.lecture_session_image_url ||
                      "/assets/placeholder/lecture.png"
                    }
                    alt={kajian.lecture_session_title}
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="p-3">
                    <h2
                      className="font-semibold text-sm truncate"
                      style={{
                        color: themeColors.black1,
                      }}
                    >
                      {kajian.lecture_session_title}
                    </h2>

                    <p
                      className="text-xs"
                      style={{ color: themeColors.silver2 }}
                    >
                      {kajian.lecture_session_teacher_name} •{" "}
                      {kajian.lecture_session_start_time
                        ? new Date(
                            kajian.lecture_session_start_time
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: themeColors.silver4 }}
                    >
                      {kajian.lecture_session_place}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h1
            className="text-xl font-semibold pb-2"
            style={{ color: isDark ? colors.dark.black1 : colors.light.black1 }}
          >
            {masjidData.masjid_name}
          </h1>
          <p className="text-sm" style={{ color: themeColors.silver2 }}>
            {masjidData.masjid_location}
          </p>
          <p
            className="text-xs italic pb-2"
            style={{ color: themeColors.silver4 }}
          >
            {masjidData.masjid_bio_short}
          </p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3">
              {masjidData.masjid_instagram_url && (
                <a
                  href={masjidData.masjid_instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/icons/instagram.svg"
                    alt="IG"
                    className="w-6 h-6"
                  />
                </a>
              )}
              {masjidData.masjid_youtube_url && (
                <a
                  href={masjidData.masjid_youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/icons/youtube.svg" alt="YT" className="w-6 h-6" />
                </a>
              )}
              {masjidData.masjid_whatsapp_url && (
                <a
                  href={masjidData.masjid_whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/icons/whatsapp.svg" alt="WA" className="w-6 h-6" />
                </a>
              )}
            </div>

            <button
              onClick={handleShareClick}
              className="flex items-center space-x-1 text-sm mt-3"
              style={{ color: themeColors.quaternary }}
            >
              <Share size={16} />
              <span>Bagikan</span>
            </button>

            {showShareMenu && (
              <div
                ref={shareMenuRef}
                className="mt-2 p-3 border rounded shadow w-full"
                style={{
                  backgroundColor: themeColors.white1,
                  borderColor: themeColors.silver1,
                }}
              >
                <p
                  className="text-xs mb-2"
                  style={{ color: themeColors.black2 }}
                >
                  Bagikan link:
                </p>

                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="w-full text-xs p-1 border rounded mb-2"
                  style={{
                    backgroundColor: themeColors.white3,
                    borderColor: themeColors.silver1,
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
                      `Assalamualaikum! Cek profil masjid ${masjidData.masjid_name} di sini: ${currentUrl}`
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
        </div>

        <div className="space-y-2 mb-4">
          <LinkItem
            label="Profil Masjid"
            icon="🏛️"
            href={`/masjid/${masjidData.masjid_slug}/profil`}
            internal
          />
          <LinkItem
            label="Lokasi"
            icon="📍"
            href={masjidData.masjid_google_maps_url}
          />
          <LinkItem
            label="Jadwal Kajian"
            icon="📆"
            href={`/masjid/${masjidData.masjid_slug}/jadwal-kajian`}
            internal
          />
          <LinkItem
            label="Soal & Materi Kajian"
            icon="📚"
            href={`/masjid/${masjidData.masjid_slug}/soal-materi-kajian`}
            internal
          />
          <LinkItem
            label="Laporan Keuangan"
            icon="📰"
            href={`/masjid/${masjidData.masjid_slug}/keuangan`}
            internal
          />
        </div>

        <div
          className="fixed bottom-0 left-0 w-full p-4 border-t shadow-md"
          style={{
            backgroundColor: themeColors.white1,
            borderColor: themeColors.silver1,
          }}
        >
          <button
            onClick={() => navigate(`/masjid/${masjidData.masjid_slug}/donasi`)}
            className="block w-full text-center py-3 rounded font-bold"
            style={{
              backgroundColor: themeColors.primary,
              color: themeColors.white1,
            }}
          >
            Donasi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full pt-5 flex items-center justify-center"
      style={{
        backgroundColor: themeColors.white2,
        overflow: "hidden", // ⬅️ tidak bisa scroll
      }}
    >
      <div
        className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center p-6 rounded-xl shadow"
        style={{ backgroundColor: themeColors.white1 }}
      >
        {/* Gambar Kajian */}
        <div className="relative">
          {kajianList && kajianList.length > 0 && (
            <div className="relative overflow-hidden">
              <div className="flex overflow-x-auto no-scrollbar space-x-4 pr-4 snap-x">
                {kajianList.map((kajian, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      navigate(
                        `/masjid/${slug}/jadwal-kajian/${kajian.lecture_session_id}`
                      )
                    }
                    className="flex-shrink-0 snap-start w-[320px] rounded-lg overflow-hidden shadow"
                    style={{ backgroundColor: themeColors.white1 }}
                  >
                    <img
                      src={kajian.lecture_session_image_url}
                      alt={kajian.lecture_session_title}
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="p-3">
                      <h2
                        className="font-semibold text-sm truncate"
                        style={{ color: themeColors.black1 }}
                      >
                        {kajian.lecture_session_title}
                      </h2>

                      <p
                        className="text-xs"
                        style={{ color: themeColors.silver2 }}
                      >
                        {kajian.lecture_session_teacher_name} •{" "}
                        {kajian.lecture_session_start_time
                          ? new Date(
                              kajian.lecture_session_start_time
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: themeColors.silver4 }}
                      >
                        {kajian.lecture_session_place}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Masjid Info */}
        <div className="space-y-4">
          <div>
            <h1
              className="text-2xl font-semibold pb-2"
              style={{ color: themeColors.black1 }}
            >
              {masjidData.masjid_name}
            </h1>

            <p className="text-sm pb-2" style={{ color: themeColors.silver2 }}>
              {masjidData.masjid_location}
            </p>
            <p
              className="text-xs italic pb-2"
              style={{ color: themeColors.silver4 }}
            >
              {masjidData.masjid_bio_short}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3">
              {masjidData.masjid_instagram_url && (
                <a
                  href={masjidData.masjid_instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/icons/instagram.svg"
                    alt="IG"
                    className="w-6 h-6"
                  />
                </a>
              )}
              {masjidData.masjid_youtube_url && (
                <a
                  href={masjidData.masjid_youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/icons/youtube.svg" alt="YT" className="w-6 h-6" />
                </a>
              )}
              {masjidData.masjid_whatsapp_url && (
                <a
                  href={masjidData.masjid_whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/icons/whatsapp.svg" alt="WA" className="w-6 h-6" />
                </a>
              )}
            </div>

            <div className="relative">
              <button
                onClick={handleShareClick}
                className="flex items-center space-x-1 text-sm"
                style={{ color: themeColors.quaternary }}
              >
                <Share size={16} />
                <span>Bagikan</span>
              </button>

              {showShareMenu && (
                <div
                  ref={shareMenuRef}
                  className="absolute z-10 mt-2 p-3 border rounded shadow w-64 right-0"
                  style={{
                    backgroundColor: themeColors.white1,
                    borderColor: themeColors.silver1,
                  }}
                >
                  <p
                    className="text-xs mb-2"
                    style={{ color: themeColors.black2 }}
                  >
                    Bagikan link:
                  </p>

                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="w-full text-xs p-1 border rounded mb-2"
                    style={{
                      backgroundColor: themeColors.white3,
                      borderColor: themeColors.silver1,
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
                      href={`https://wa.me/?text=${encodeURIComponent(`Assalamualaikum! Cek profil masjid ${masjidData.masjid_name} di sini: ${currentUrl}`)}`}
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
          </div>

          <div className="space-y-2">
            <LinkItem
              label="Profil Masjid"
              icon="🏛️"
              href={`/masjid/${masjidData.masjid_slug}/profil`}
              internal
            />
            <LinkItem
              label="Lokasi"
              icon="📍"
              href={masjidData.masjid_google_maps_url}
            />
            <LinkItem
              label="Jadwal Kajian"
              icon="📆"
              href={`/masjid/${masjidData.masjid_slug}/jadwal-kajian`}
              internal
            />
            <LinkItem
              label="Soal & Materi Kajian"
              icon="📚"
              href={`/masjid/${masjidData.masjid_slug}/soal-materi-kajian`}
              internal
            />
            <LinkItem
              label="Laporan Keuangan"
              icon="📰"
              href={`/masjid/${masjidData.masjid_slug}/keuangan`}
              internal
            />
          </div>

          <button
            onClick={() => navigate(`/masjid/${masjidData.masjid_slug}/donasi`)}
            className="block w-full text-center py-3 rounded font-bold"
            style={{
              backgroundColor: themeColors.primary,
              color: themeColors.white1,
            }}
          >
            Donasi
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkItem({
  label,
  icon,
  href,
  internal = false,
}: {
  label: string;
  icon: string;
  href?: string;
  internal?: boolean;
}) {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const handleClick = () => {
    if (href) {
      if (internal) {
        navigate(href);
      } else {
        window.open(href, "_blank", "noopener noreferrer");
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer flex items-center justify-between p-3 rounded hover:opacity-90"
      style={{
        backgroundColor: themeColors.white2,
        border: `1px solid ${themeColors.silver1}`,
      }}
    >
      <span className="flex items-center space-x-2">
        <span>{icon}</span>
        <span style={{ color: themeColors.black1 }}>{label}</span>
      </span>
      <span style={{ color: themeColors.silver4 }}>›</span>
    </div>
  );
}
