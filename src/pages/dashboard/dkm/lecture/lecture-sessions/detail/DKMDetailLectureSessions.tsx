import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { BookOpen, PlayCircle, StickyNote, Video, Home } from "lucide-react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import NavigationCard from "./components/NavigationCard";
import FormattedDate from "@/constants/formattedDate";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import cleanTranscriptHTML from "@/constants/cleanTransciptHTML";
import ConfirmModal from "@/components/common/home/ConfirmModal";
import { useState } from "react";
import ShowImageFull from "@/components/pages/home/ShowImageFull";

interface LectureSessionDetail {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_description: string;
  lecture_session_teacher_id: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_end_time: string;
  lecture_session_place: string;
  lecture_session_image_url: string;
  lecture_session_lecture_id: string;
  lecture_session_masjid_id: string;
  lecture_title: string;
  lecture_session_approved_by_dkm_at: string | null;
}

export default function DKMDetailLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  const {
    data: session,
    isLoading,
    isError,
    refetch,
  } = useQuery<LectureSessionDetail>({
    queryKey: ["lecture-session-detail", id],
    queryFn: async () => {
      const res = await axios.get(`/api/a/lecture-sessions/by-id/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { mutate: approveSession, isPending: isApproving } = useMutation({
    mutationFn: async () => {
      return await axios.patch(`/api/a/lecture-sessions/${id}/approve-dkm`);
    },
    onSuccess: () => {
      toast.success("Kajian berhasil disetujui oleh DKM");
      refetch();
    },
    onError: () => toast.error("Gagal menyetujui kajian"),
  });

  if (isLoading)
    return <p className="text-gray-500">Memuat data sesi kajian...</p>;
  if (isError || !session)
    return <p className="text-red-500">Data sesi kajian tidak tersedia.</p>;

  const navigations = [
    { icon: <Home size={36} />, label: "Informasi", to: "informasi" },
    { icon: <Video size={36} />, label: "Video Audio", to: "video-audio" },
    { icon: <BookOpen size={36} />, label: "Latihan Soal", to: "latihan-soal" },
    { icon: <StickyNote size={36} />, label: "Materi", to: "ringkasan" },
    { icon: <PlayCircle size={36} />, label: "Dokumen", to: "dokumen" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kajian Detail"
        onBackClick={() => navigate(`/dkm/kajian`)}
      />

      <div
        className="rounded-2xl shadow-sm flex flex-col md:flex-row gap-6"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        <div className="flex-shrink-0 w-full md:w-48">
          <ShimmerImage
            src={session.lecture_session_image_url ?? ""}
            alt="Poster Kajian"
            className="rounded-xl w-full h-auto object-cover aspect-[3/4]"
            shimmerClassName="rounded-xl"
            onClick={() => setShowImageModal(session.lecture_session_image_url)}
          />
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          <h2
            className="text-xl font-semibold"
            style={{ color: theme.primary }}
          >
            {session.lecture_session_title}
          </h2>
          <p className="text-sm font-medium" style={{ color: theme.silver2 }}>
            <FormattedDate
              value={session.lecture_session_start_time}
              fullMonth
            />{" "}
            / {session.lecture_session_place}
          </p>
          <p className="text-sm font-semibold" style={{ color: theme.black1 }}>
            {session.lecture_session_teacher_name}
          </p>

          <div
            className="text-sm mt-1 leading-relaxed prose prose-sm prose-slate max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: cleanTranscriptHTML(session.lecture_session_description),
            }}
          />

          <div className="flex justify-between items-start mt-4 flex-wrap gap-2">
            {/* KIRI: STATUS + BUTTON */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
              {/* STATUS */}
              <div
                className="flex items-center text-xs font-semibold px-3 py-1 rounded-full gap-1 transition"
                style={{
                  backgroundColor: session.lecture_session_approved_by_dkm_at
                    ? (theme.success1 ?? "#16a34a")
                    : theme.silver1,
                  color: session.lecture_session_approved_by_dkm_at
                    ? theme.white1
                    : theme.black2,
                }}
              >
                {session.lecture_session_approved_by_dkm_at ? "✅" : "⏳"}
                {session.lecture_session_approved_by_dkm_at
                  ? " Soal & Materi tersedia"
                  : " Soal & Materi dalam proses"}
              </div>

              {/* BUTTON APPROVE */}
              {!session.lecture_session_approved_by_dkm_at && (
                <button
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isApproving}
                >
                  {isApproving ? "Menyetujui..." : "Setujui Kajian"}
                </button>
              )}
            </div>

            {/* KANAN: PESERTA */}
            <div
              className="flex items-center text-sm font-medium"
              style={{ color: theme.silver2 }}
            >
              <span className="mr-1">👤</span> 40 peserta
            </div>
            <ConfirmModal
              isOpen={showConfirmModal}
              onClose={() => setShowConfirmModal(false)}
              onConfirm={() => {
                approveSession();
                setShowConfirmModal(false);
              }}
              title="Setujui Sesi Kajian"
              message="Apakah Anda yakin ingin menyetujui sesi kajian ini? Setelah disetujui, soal dan materi dapat diakses oleh peserta."
              confirmText="Setujui"
              cancelText="Batal"
              isLoading={isApproving}
            />
          </div>
        </div>
      </div>

      <div>
        <h4
          className="text-lg font-semibold mb-4"
          style={{ color: theme.primary }}
        >
          Navigasi Utama
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {navigations.map((item) => (
            <NavigationCard key={item.label} {...item} state={session} />
          ))}
        </div>
      </div>
      {showImageModal && (
        <ShowImageFull
          url={showImageModal}
          onClose={() => setShowImageModal(null)}
        />
      )}
    </div>
  );
}
