import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import FormattedDate from "@/constants/formattedDate";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import ShowImageFull from "@/components/pages/home/ShowImageFull";
import { useState } from "react";

export default function MasjidDetailLecture() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const [showImageModal, setShowImageModal] = useState(false);

  const {
    data: kajian,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["detail-agenda", id],
    queryFn: async () => {
      const res = await axios.get(`/public/lecture-sessions-u/by-id/${id}`);
      return res.data;
    },
    enabled: !!id,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <p className="p-4">Memuat data...</p>;
  if (isError || !kajian)
    return (
      <p className="p-4 text-red-500">
        Gagal memuat data kajian. {String(error)}
      </p>
    );

  const handleBack = () => {
    // 1) prioritas: from (kirim saat push ke halaman ini)
    if (location.state && (location.state as any).from) {
      navigate((location.state as any).from);
      return;
    }
    // 2) ada riwayat? (React Router v6 simpan idx di history.state)
    const idx =
      (window.history.state && (window.history.state as any).idx) ?? 0;
    if (idx > 0) {
      navigate(-1);
      return;
    }
    // 3) fallback
    navigate(`/masjid/${slug}/jadwal-kajian`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeaderUser title="Detail Kajian" onBackClick={handleBack} />

      <div
        className="rounded-md shadow-sm"
        style={{
          backgroundColor: theme.white1,
          color: theme.black1,
        }}
      >
        <div className="md:flex md:gap-6">
          {/* Gambar Kajian */}
          <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto md:h-[420px] rounded-xl overflow-hidden">
            <ShimmerImage
              src={
                kajian.lecture_session_image_url
                  ? decodeURIComponent(kajian.lecture_session_image_url)
                  : undefined
              }
              alt={kajian.lecture_session_title}
              className="w-full h-full object-cover cursor-pointer"
              shimmerClassName="rounded"
              onClick={() => setShowImageModal(true)}
            />
          </div>

          {/* Info */}
          <div className="w-full md:w-1/2 space-y-4 p-4">
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: theme.quaternary }}
              >
                Informasi Kajian
              </h2>
              <ul className="text-sm space-y-1 mt-1">
                <li>
                  📘 <strong>Materi:</strong> {kajian.lecture_session_title}
                </li>
                <li>
                  👤 <strong>Pengajar:</strong>{" "}
                  {kajian.lecture_session_teacher_name || "-"}
                </li>
                <li>
                  🕒 <strong>Jadwal:</strong>{" "}
                  <FormattedDate
                    value={kajian.lecture_session_start_time}
                    fullMonth
                    className="inline"
                  />
                </li>
                <li>
                  📍 <strong>Tempat:</strong>{" "}
                  {kajian.lecture_session_place || "-"}
                </li>
              </ul>
            </div>

            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: theme.quaternary }}
              >
                Keterangan
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: theme.black2 }}
              >
                {kajian.lecture_session_description ||
                  "Tidak ada deskripsi yang tersedia."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showImageModal && kajian.lecture_session_image_url && (
        <ShowImageFull
          url={kajian.lecture_session_image_url}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}
