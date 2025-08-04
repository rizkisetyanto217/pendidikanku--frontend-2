import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useDeleteLectureSession } from "./useDeleteDKMLectureSessions";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import StatusBadge from "@/components/common/main/MainStatusBadge";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";
import toast from "react-hot-toast";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { useNavigate } from "react-router-dom";
import SimpleTable from "@/components/common/main/SimpleTable";
import FormattedDate from "@/constants/formattedDate";
import { useCurrentUser } from "@/hooks/useCurrentUser"; // ⬅️ tambahkan
import ShimmerImage from "@/components/common/main/ShimmerImage";

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

  const { user, isLoggedIn, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0]; // ⬅️ ambil dari user cookie

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

  const rows = data.map((session, i) => [
    i + 1,
    <ShimmerImage
      src={session.lecture_session_image_url ?? ""}
      alt="Kajian"
      className="w-12 h-12 object-cover rounded"
      shimmerClassName="rounded"
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
        title="Kajian Terbaru ini"
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
