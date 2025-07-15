import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import ActionEditDelete from "@/components/common/main/actionEditDelete";
import toast from "react-hot-toast";
import { useDeleteLecture } from "./useDeleteLecture";
import PageHeader from "@/components/common/PageHeader";
import { useNavigate } from "react-router-dom";
import SimpleTable from "@/components/common/main/SimpleTable";
import StatusBadge from "@/components/common/main/statusBadge";

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

  const token = sessionStorage.getItem("token");
  const masjidId = token
    ? jwtDecode<{ masjid_admin_ids: string[] }>(token).masjid_admin_ids?.[0]
    : null;

  const {
    data: lectures,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["lectures"],
    enabled: !!token,
    queryFn: async () => {
      const res = await axios.get(`/api/a/lectures/by-masjid`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.data as Lecture[];
    },
  });

  const columns = ["No", "Gambar", "Judul", "Deskripsi", "Status", "Aksi"];

  const rows =
    lectures?.map((lecture, i) => [
      i + 1,
      <img
        src={lecture.lecture_image_url ?? "/mock/kajian.jpg"}
        alt="Gambar Kajian"
        className="w-12 h-12 object-cover rounded"
      />,
      <span className="font-medium">{lecture.lecture_title}</span>,
      lecture.lecture_description,
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
          onEdit={() => console.log("Edit", lecture.lecture_id)}
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

  if (isLoading) return <p>Loading...</p>;
  if (isError || !lectures)
    return <p className="text-red-500">Gagal memuat data.</p>;

  return (
    <>
      <PageHeader
        title="Tema Kajian"
        actionButton={{
          label: "Tambah Kajian",
          to: "/dkm/kajian/tambah",
        }}
      />
      <SimpleTable
        columns={columns}
        rows={rows}
        onRowClick={(i) =>
          navigate(`/dkm/tema/tema-detail/${lectures[i].lecture_id}`, {
            state: lectures[i],
          })
        }
      />
    </>
  );
}
