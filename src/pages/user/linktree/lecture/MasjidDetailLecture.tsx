import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ArrowLeft } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

export default function MasjidDetailLecture() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;
  const { slug } = useParams();


  const {
    data: kajian,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["detail-agenda", id],
    queryFn: async () => {
      console.log("[🔁 FETCH] Meminta detail kajian dari API");
      const res = await axios.get(`/public/lecture-sessions-u/by-id/${id}`);
      console.log("[🔁 RESPONSE] Detail kajian:", res.data);
      return res.data;
    },
    enabled: !!id,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // cache 5 menit
  });

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  if (isLoading) return <p className="p-4">Memuat data...</p>;
  if (isError || !kajian)
    return (
      <p className="p-4 text-red-500">
        Gagal memuat data kajian. {String(error)}
      </p>
    );

  return (
    <div className="pt-4">
      {/* Header */}
      <PageHeaderUser
        title="Detail Kajian ini"
        onBackClick={() => navigate(`/masjid/${slug}`)}
      />

      <div
        className="p-4 rounded-md shadow-sm"
        style={{
          backgroundColor: themeColors.white1,
          color: themeColors.black1,
        }}
      >
        {/* Kontainer Responsif */}
        <div className="md:flex md:gap-6">
          {/* Gambar Kajian */}
          <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto md:h-[420px] rounded-xl overflow-hidden mb-4 md:mb-0">
            <img
              src={
                kajian.lecture_session_image_url ||
                "/assets/placeholder/lecture.png"
              }
              alt={kajian.lecture_session_title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Informasi & Keterangan */}
          <div className="w-full md:w-1/2 space-y-4">
            {/* Informasi Kajian */}
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: themeColors.quaternary }}
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
                  {formatDate(kajian.lecture_session_start_time)}
                </li>
                <li>
                  📍 <strong>Tempat:</strong>{" "}
                  {kajian.lecture_session_place || "-"}
                </li>
              </ul>
            </div>

            {/* Keterangan Kajian */}
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: themeColors.quaternary }}
              >
                Keterangan
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: themeColors.black2 }}
              >
                {kajian.lecture_session_description ||
                  "Tidak ada deskripsi yang tersedia."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
