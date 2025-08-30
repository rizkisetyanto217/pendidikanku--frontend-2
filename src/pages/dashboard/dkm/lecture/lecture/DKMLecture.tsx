import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";
import toast from "react-hot-toast";
import { useDeleteLecture } from "./detail/useDeleteLecture";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { useNavigate } from "react-router-dom";
import SimpleTable from "@/components/common/main/SimpleTable";
import StatusBadge from "@/components/common/main/MainStatusBadge";
import FormattedDate from "@/constants/formattedDate";
import { useCurrentUser } from "@/hooks/useCurrentUser"; // ⬅️ pakai cookie
import ShimmerImage from "@/components/common/main/ShimmerImage";
import { useState } from "react";
import ConfirmModal from "@/components/common/home/ConfirmModal";
import ShowImageFull from "@/components/pages/home/ShowImageFull";

interface Lecture {
  lecture_id: string;
  lecture_title: string;
  lecture_description: string;
  lecture_masjid_id: string;
  total_lecture_sessions: number | null;
  lecture_is_recurring: boolean;
  lecture_recurrence_interval: string | null;
  lecture_image_url: string | null;
  lecture_teachers: string | null;
  lecture_is_registration_required: boolean;
  lecture_is_paid: boolean;
  lecture_price: number | null;
  lecture_payment_deadline: string | null;
  lecture_capacity: number | null;
  lecture_is_public: boolean;
  lecture_is_active: boolean;
  lecture_is_certificate_generated: boolean;
  lecture_created_at: string;
  lecture_updated_at: string;
}

export default function DKMLecture() {
  const navigate = useNavigate();
  const { mutate: deleteLecture } = useDeleteLecture();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const { user, isLoggedIn, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({
    isOpen: false,
    data: null as Lecture | null,
  });

  const [showImageModal, setShowImageModal] = useState<{
    url: string;
    isOpen: boolean;
  }>({ url: "", isOpen: false });

  const {
    data: lectures,
    isLoading,
    isError,
  } = useQuery<Lecture[]>({
    queryKey: ["lectures", masjidId],
    enabled: !!masjidId && isLoggedIn && !isUserLoading,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await axios.get(`/api/a/lectures/by-masjid`, {
        withCredentials: true,
      });
      return res.data.data;
    },
  });

  const columns = [
    "No",
    "Gambar",
    "Judul",
    "Total Kajian",
    "Tanggal",
    "Status",
    "Aksi",
  ];

  const rows =
    lectures?.map((lecture, i) => [
      i + 1,
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (lecture.lecture_image_url) {
            setShowImageModal({
              url: decodeURIComponent(lecture.lecture_image_url),
              isOpen: true,
            });
          }
        }}
      >
        <ShimmerImage
          src={lecture.lecture_image_url ?? ""}
          alt="Gambar Kajian"
          className="w-12 h-12 object-cover rounded cursor-pointer"
          shimmerClassName="rounded"
        />
      </div>,
      <span className="font-medium">{lecture.lecture_title}</span>,
      lecture.total_lecture_sessions,
      <FormattedDate value={lecture.lecture_created_at} />,
      <div className="flex flex-wrap gap-1">
        <StatusBadge
          text={lecture.lecture_is_active ? "Aktif" : "Nonaktif"}
          variant={lecture.lecture_is_active ? "success" : "error"}
        />
        <StatusBadge
          text={
            lecture.lecture_is_certificate_generated
              ? "Sertifikat Aktif"
              : "Tanpa Sertifikat"
          }
          variant={
            lecture.lecture_is_certificate_generated ? "info" : "default"
          }
        />
      </div>,
      <div onClick={(e) => e.stopPropagation()}>
        <ActionEditDelete
          onEdit={() => navigate(`/dkm/tema/tambah-edit/${lecture.lecture_id}`)}
          onDelete={() => {
            setConfirmDeleteModal({ isOpen: true, data: lecture });
          }}
        />
      </div>,
    ]) ?? [];

  return (
    <>
      <PageHeader
        title="Tema Kajian"
        actionButton={{ label: "Tambah Kajian", to: "/dkm/tema/tambah-edit" }}
      />

      {isUserLoading || isLoading ? <p>Loading...</p> : null}
      {isError && <p className="text-red-500">Gagal memuat data.</p>}
      {!isLoading && !isError && (
        <SimpleTable
          columns={columns}
          rows={rows}
          onRowClick={(i) =>
            navigate(`/dkm/tema/tema-detail/${lectures![i].lecture_id}`, {
              state: lectures![i],
            })
          }
        />
      )}

      {/* Modal Gambar */}
      {showImageModal.isOpen && (
        <ShowImageFull
          url={showImageModal.url}
          onClose={() => setShowImageModal({ url: "", isOpen: false })}
        />
      )}

      {/* Modal Konfirmasi Hapus */}
      {confirmDeleteModal.data && (
        <ConfirmModal
          isOpen={confirmDeleteModal.isOpen}
          title="Hapus Tema Kajian"
          message={`Apakah Anda yakin ingin menghapus kajian "${confirmDeleteModal.data.lecture_title}"?`}
          confirmText="Hapus"
          cancelText="Batal"
          onClose={() => setConfirmDeleteModal({ isOpen: false, data: null })}
          onConfirm={() => {
            if (!confirmDeleteModal.data) return;
            deleteLecture(confirmDeleteModal.data.lecture_id, {
              onSuccess: () => toast.success("Berhasil menghapus kajian"),
              onError: () => toast.error("Gagal menghapus kajian"),
              onSettled: () =>
                setConfirmDeleteModal({ isOpen: false, data: null }),
            });
          }}
        />
      )}
    </>
  );
}
