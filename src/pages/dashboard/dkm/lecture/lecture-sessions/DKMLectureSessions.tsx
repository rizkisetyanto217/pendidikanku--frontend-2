import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useDeleteLectureSession } from "./detail/add-edit/useDeleteDKMLectureSessions";
import axios from "@/lib/axios";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import StatusBadge from "@/components/common/main/MainStatusBadge";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";
import toast from "react-hot-toast";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { useNavigate } from "react-router-dom";
import SimpleTable from "@/components/common/main/SimpleTable";
import FormattedDate from "@/constants/formattedDate";
import { useCurrentUser } from "@/hooks/useCurrentUser"; // ⬅️ tambahkan
import ShimmerImage from "@/components/common/main/ShimmerImage";
import { useState } from "react";
import ConfirmModal from "@/components/common/home/ConfirmModal";
import ShowImageFull from "@/components/pages/home/ShowImageFull";

interface LectureSession {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_title: string;
  lecture_session_description: string;
  lecture_session_teacher_name: string;
  lecture_session_start_time: string;
  lecture_session_place: string;
  lecture_session_image_url: string | null;
  lecture_session_is_active: boolean;
  lecture_session_approved_by_dkm_at: boolean;
}

export default function DKMLectureSessions() {
  const { mutate: deleteLectureSession } = useDeleteLectureSession();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const queryClient = useQueryClient(); // ⬅️ Tambahkan ini
  const { user, isLoggedIn, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0]; // ⬅️ ambil dari user cookie

  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    data: LectureSession | null;
  }>({
    isOpen: false,
    data: null,
  });
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  // console.log("👤 Current user:", user);
  // console.log("🏢 Masjid ID:", masjidId);

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery<LectureSession[], Error, LectureSession[], [string]>({
    queryKey: ["lecture-sessions"],
    queryFn: async () => {
      if (!masjidId) throw new Error("Masjid ID tidak ditemukan");
      const res = await axios.get("/api/a/lecture-sessions/by-masjid", {
        withCredentials: true, // ⬅️ penting untuk kirim cookie
      });
      console.log("✅ [fetchLectureSessions] Sukses:", res.data.data);
      return res.data.data as LectureSession[];
    },
    enabled: !!masjidId && isLoggedIn && !isUserLoading,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  if (isUserLoading || isLoading) {
    return <p>Loading...</p>;
  }

  if (isError || !data) {
    return <p className="text-red-500">Gagal memuat data.</p>;
  }

  const columns = [
    "No",
    "Gambar",
    "Judul",
    "Tema",
    "Tanggal",
    "Status",
    "Aksi",
  ];

  const now = new Date();

  const rows = data.map((session, i) => {
    const startTime = new Date(session.lecture_session_start_time);
    const isUpcoming = startTime > now;

    return [
      i + 1,
      session.lecture_session_image_url ? (
        <ShimmerImage
          src={session.lecture_session_image_url}
          alt="Kajian"
          className="w-12 h-12 object-cover rounded cursor-pointer"
          shimmerClassName="rounded"
          onClick={(e) => {
            e.stopPropagation(); // ⛔️ stop bubbling ke row
            setShowImageModal(session.lecture_session_image_url!);
          }}
        />
      ) : (
        <div className="w-12 h-12" />
      ),

      <span className="font-medium">{session.lecture_session_title}</span>,
      session.lecture_title,
      <FormattedDate value={session.lecture_session_start_time} />,
      <div className="flex flex-wrap gap-1">
        {/* Badge status soal & materi */}
        <StatusBadge
          text={
            session.lecture_session_approved_by_dkm_at
              ? "Soal & Materi tersedia"
              : "Soal & Materi dalam Proses"
          }
          variant={
            session.lecture_session_approved_by_dkm_at ? "info" : "warning"
          }
        />
        {/* Badge status aktif */}
        {/* <StatusBadge
          text={session.lecture_session_is_active ? "Aktif" : "Nonaktif"}
          variant={session.lecture_session_is_active ? "success" : "error"}
        /> */}
        {/* Badge status waktu */}
        <StatusBadge
          text={isUpcoming ? "Kajian Mendatang" : "Kajian Selesai"}
          variant={isUpcoming ? "info" : "secondary"}
        />
      </div>,
      <div onClick={(e) => e.stopPropagation()}>
        <ActionEditDelete
          onEdit={() =>
            navigate(`/dkm/kajian/tambah-edit/${session.lecture_session_id}`)
          }
          onDelete={() => {
            setConfirmDeleteModal({ isOpen: true, data: session });
          }}
        />
      </div>,
    ];
  });

  return (
    <>
      <PageHeader
        title="Kajian Terbaru"
        actionButton={{
          label: "Tambah Kajian",
          to: "/dkm/kajian/tambah-edit",
        }}
      />
      <SimpleTable
        columns={columns}
        rows={rows}
        onRowClick={(i) =>
          navigate(`/dkm/kajian/kajian-detail/${data[i].lecture_session_id}`, {
            state: data[i],
          })
        }
      />
      {confirmDeleteModal.data && (
        <ConfirmModal
          isOpen={confirmDeleteModal.isOpen}
          title="Hapus Sesi Kajian"
          message={`Apakah Anda yakin ingin menghapus kajian "${confirmDeleteModal.data.lecture_session_title}"?`}
          confirmText="Hapus"
          cancelText="Batal"
          onClose={() => setConfirmDeleteModal({ isOpen: false, data: null })}
          onConfirm={() => {
            if (!confirmDeleteModal.data) return;
            deleteLectureSession(confirmDeleteModal.data.lecture_session_id, {
              onSuccess: () => {
                toast.success("Sesi kajian berhasil dihapus");
                queryClient.setQueryData(
                  ["lecture-sessions"],
                  (old?: LectureSession[]) => {
                    return old?.filter(
                      (s) =>
                        s.lecture_session_id !==
                        confirmDeleteModal.data?.lecture_session_id
                    );
                  }
                );
              },
              onError: () => toast.error("Gagal menghapus sesi kajian"),
              onSettled: () =>
                setConfirmDeleteModal({ isOpen: false, data: null }),
            });
          }}
        />
      )}
      {showImageModal && (
        <ShowImageFull
          url={showImageModal}
          onClose={() => setShowImageModal(null)}
        />
      )}
    </>
  );
}
