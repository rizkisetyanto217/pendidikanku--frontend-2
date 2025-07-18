import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { useDeleteLectureSession } from "./useDeleteDKMLectureSessions";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import StatusBadge from "@/components/common/main/statusBadge";
import ActionEditDelete from "@/components/common/main/actionEditDelete";
import toast from "react-hot-toast";
import PageHeader from "@/components/common/PageHeader";
import { useNavigate } from "react-router-dom"; // ⬅️ Pastikan sudah di-import
import SimpleTable from "@/components/common/main/SimpleTable";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import FormattedDate from "@/constants/formattedDate";

interface TokenPayload {
  masjid_admin_ids: string[];
}

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
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  const masjidId = token
    ? jwtDecode<TokenPayload>(token).masjid_admin_ids?.[0]
    : null;

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery<LectureSession[], Error, LectureSession[], [string]>({
    queryKey: ["lecture-sessions"],
    queryFn: async () => {
      if (!token) throw new Error("Token tidak tersedia");

      const res = await axios.get("/api/a/lecture-sessions/by-masjid", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ [fetchLectureSessions] Sukses:", res.data.data);
      return res.data.data as LectureSession[];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    retry: 1,
    onError: (err: Error) => {
      console.error("❌ [fetchLectureSessions] Gagal:", err.message);
    },
  } as UseQueryOptions<
    LectureSession[], // TQueryFnData
    Error, // TError
    LectureSession[], // TData
    [string] // TQueryKey
  >);

  if (isLoading) {
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

  const rows = data.map((session, i) => [
    i + 1,
    <img
      src={session.lecture_session_image_url ?? "/mock/kajian.jpg"}
      alt="Kajian"
      className="w-12 h-12 object-cover rounded"
    />,
    <span className="font-medium">{session.lecture_session_title}</span>,
    session.lecture_title,
    <FormattedDate value={session.lecture_session_start_time} />,
    <div className="flex flex-wrap gap-1">
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
      <StatusBadge
        text={session.lecture_session_is_active ? "Aktif" : "Nonaktif"}
        variant={session.lecture_session_is_active ? "success" : "error"}
      />
    </div>,
    <div onClick={(e) => e.stopPropagation()}>
      <ActionEditDelete
        onEdit={() =>
          navigate(`/dkm/kajian/tambah-edit/${session.lecture_session_id}`)
        }
        onDelete={() => {
          if (confirm("Yakin ingin menghapus sesi kajian ini?")) {
            deleteLectureSession(session.lecture_session_id, {
              onSuccess: () => toast.success("Sesi kajian berhasil dihapus"),
              onError: () => toast.error("Gagal menghapus sesi kajian"),
            });
          }
        }}
      />
    </div>,
  ]);

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
    </>
  );
}
