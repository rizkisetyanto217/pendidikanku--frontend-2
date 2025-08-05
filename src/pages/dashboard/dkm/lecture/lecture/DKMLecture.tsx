import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
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
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const { user, isLoggedIn, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0]; // ⬅️ ambil dari cookie

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
        withCredentials: true, // ⬅️ kirim cookie
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
      <ShimmerImage
        src={lecture.lecture_image_url ?? ""}
        alt="Gambar Kajian"
        className="w-12 h-12 object-cover rounded"
        shimmerClassName="rounded"
      />,
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
            if (confirm("Yakin ingin menghapus kajian ini?")) {
              deleteLecture(lecture.lecture_id, {
                onSuccess: () => toast.success("Berhasil menghapus kajian"),
                onError: () => toast.error("Gagal menghapus kajian"),
              });
            }
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
    </>
  );
}
