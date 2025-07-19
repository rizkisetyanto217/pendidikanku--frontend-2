import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useIsMobile } from "@/hooks/isMobile";
import { Share } from "lucide-react";
import { useState } from "react";
import { useRef, useEffect } from "react";

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
  lecture_session_title: string;
  lecture_session_image_url: string;
  lecture_session_teacher_name: string;
  lecture_session_place: string;
  lecture_session_start_time: string;
}

export default function PublicLinktreePage() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const isMobile = useIsMobile(); // ✅ panggil function-nya
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const { data: masjidData, isLoading: loadingMasjid } = useQuery<Masjid>({
    queryKey: ["masjid", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/masjids/${slug}`);
      return res.data?.data;
    },
    enabled: !!slug,
  });

  const { data: kajianList, isLoading: loadingKajian } = useQuery<Kajian[]>({
    queryKey: ["kajianList", masjidData?.masjid_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-u/${masjidData?.masjid_id}`
      );
      return res.data?.data?.slice(0, 3) ?? [];
    },
    enabled: !!masjidData?.masjid_id,
  });

  const handleShareClick = () => {
    if (!masjidData) return;

    if (isMobile && navigator.share) {
      navigator.share({
        title: masjidData.masjid_name,
        url: currentUrl,
      });
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

  if (isMobile) {
    return (
      <div className="w-full min-h-screen bg-white p-4 overflow-auto">
        {/* Versi Mobile */}
        {kajianList && kajianList.length > 0 && (
          <div className="overflow-x-auto mb-4">
            <div className="flex space-x-4 w-max">
              {kajianList.map((kajian, idx) => (
                <div
                  key={idx}
                  className="min-w-[260px] max-w-xs rounded-lg overflow-hidden shadow-md bg-white"
                >
                  <img
                    src={kajian.lecture_session_image_url}
                    alt={kajian.lecture_session_title}
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="p-3">
                    <h2 className="font-semibold text-sm truncate">
                      {kajian.lecture_session_title}
                    </h2>
                    <p className="text-xs text-gray-600">
                      {kajian.lecture_session_teacher_name} •{" "}
                      {kajian.lecture_session_start_time
                        ? new Date(
                            kajian.lecture_session_start_time
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {kajian.lecture_session_place}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h1 className="text-xl font-bold">{masjidData.masjid_name}</h1>
          <p className="text-sm text-gray-600">{masjidData.masjid_location}</p>
          <p className="text-xs text-gray-500 italic">
            {masjidData.masjid_bio_short}
          </p>

          <div className="flex items-center justify-between mt-2">
            {/* Sosial Media Icons */}
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

            {/* ✅ Tambahkan tombol Bagikan */}
            <button
              onClick={handleShareClick}
              className="flex items-center space-x-1 text-sm text-blue-600 mt-3"
            >
              <Share size={16} className="text-blue-600" />
              <span>Bagikan</span>
            </button>

            {/* ✅ Tampilkan popup share di mobile */}
            {showShareMenu && (
              <div
                ref={shareMenuRef}
                className="mt-2 p-3 bg-white border rounded shadow w-full"
              >
                <p className="text-xs mb-2 text-gray-700">Bagikan link:</p>

                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="w-full text-xs p-1 border rounded mb-2 bg-gray-100"
                />

                <div className="flex justify-between">
                  <button
                    onClick={handleCopy}
                    className="text-sm text-emerald-700 font-semibold hover:underline"
                  >
                    Salin Link
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Assalamualaikum! Cek profil masjid ${masjidData.masjid_name} di sini: ${currentUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 font-semibold hover:underline"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <LinkItem label="Profil Masjid" icon="🏛️" />
          <LinkItem label="Jadwal Kajian" icon="📆" />
          <LinkItem label="Soal & Materi Kajian" icon="📚" />
        </div>

        <a
          href={masjidData.masjid_donation_link || "#"}
          target="_blank"
          className="block w-full text-center py-3 rounded bg-emerald-700 text-white font-bold"
        >
          Donasi
        </a>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8 overflow-auto">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center bg-white p-6 rounded-xl shadow">
        {/* Gambar Kajian */}
        <div className="relative">
          {kajianList && kajianList.length > 0 && (
            <div className="relative overflow-hidden">
              <div className="flex overflow-x-auto no-scrollbar space-x-4 pr-4 snap-x">
                {kajianList.map((kajian, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 snap-start w-[320px] rounded-lg overflow-hidden shadow bg-white"
                  >
                    <img
                      src={kajian.lecture_session_image_url}
                      alt={kajian.lecture_session_title}
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="p-3">
                      <h2 className="font-semibold text-sm truncate">
                        {kajian.lecture_session_title}
                      </h2>
                      <p className="text-xs text-gray-600">
                        {kajian.lecture_session_teacher_name} •{" "}
                        {kajian.lecture_session_start_time
                          ? new Date(
                              kajian.lecture_session_start_time
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                      <p className="text-xs text-gray-500">
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
            <h1 className="text-2xl font-bold">{masjidData.masjid_name}</h1>
            <p className="text-sm text-gray-600">
              {masjidData.masjid_location}
            </p>
            <p className="text-xs text-gray-500 italic">
              {masjidData.masjid_bio_short}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2">
            {/* Sosial Media Icons */}
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

            {/* Tombol Bagikan */}
            {/* Tombol Bagikan */}
            <div className="relative">
              <button
                onClick={handleShareClick}
                className="flex items-center space-x-1 text-sm text-blue-600"
              >
                <Share size={16} className="text-blue-600" />
                <span>Bagikan</span>
              </button>

              {/* Share Popup */}
              {showShareMenu && (
                <div
                  ref={shareMenuRef}
                  className="absolute z-10 mt-2 p-3 bg-white border rounded shadow w-64 right-0"
                >
                  <p className="text-xs mb-2 text-gray-700">Bagikan link:</p>

                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="w-full text-xs p-1 border rounded mb-2 bg-gray-100"
                  />

                  <div className="flex justify-between">
                    <button
                      onClick={handleCopy}
                      className="text-sm text-emerald-700 font-semibold hover:underline"
                    >
                      Salin Link
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Assalamualaikum! Cek profil masjid ${masjidData.masjid_name} di sini: ${currentUrl}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 font-semibold hover:underline"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <LinkItem label="Profil Masjid" icon="🏛️" />
            <LinkItem label="Jadwal Kajian" icon="📆" />
            <LinkItem label="Soal & Materi Kajian" icon="📚" />
          </div>

          <a
            href={masjidData.masjid_donation_link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded bg-emerald-700 text-white font-bold"
          >
            Donasi
          </a>
        </div>
      </div>
    </div>
  );
}

function LinkItem({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100">
      <span className="flex items-center space-x-2">
        <span>{icon}</span>
        <span>{label}</span>
      </span>
      <span>›</span>
    </div>
  );
}
