import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import SimpleTable from "@/components/common/main/SimpleTable";
import { ReactNode } from "react";
import ActionEditDelete from "@/components/common/main/actionEditDelete";
import toast from "react-hot-toast";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/main/statusBadge";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

export interface LectureSession {
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
  lecture_session_approved_by_admin_id: string | null;
  lecture_session_approved_by_admin_at: string | null;
  lecture_session_approved_by_author_id: string | null;
  lecture_session_approved_by_author_at: string | null;
  lecture_session_approved_by_teacher_id: string | null;
  lecture_session_approved_by_teacher_at: string | null;
  lecture_session_approved_by_dkm_at: string | null;
  lecture_session_is_active: boolean;
  lecture_session_created_at: string;
  lecture_session_updated_at: string;
  total_kajian?: number;
}

const fetchLectureSessions = async (
  lectureId: string
): Promise<LectureSession[]> => {
  const res = await axios.get(
    `/public/lecture-sessions/by-lecture-sessions/${lectureId}`
  );
  if (!res?.data || !Array.isArray(res.data.data)) return [];
  return res.data.data as LectureSession[];
};

export default function DKMAllLectureSession() {
  const { id: lectureId } = useParams();
  const navigate = useNavigate();

  const {
    data: sessions = [],
    isLoading,
    isError,
  } = useQuery<LectureSession[]>({
    queryKey: ["lecture-sessions", lectureId],
    queryFn: () => fetchLectureSessions(lectureId!),
    enabled: !!lectureId,
  });

  const columns = useMemo(
    () => ["No", "Gambar", "Tema", "Jumlah", "Tanggal", "Status", "Aksi"],
    []
  );

  const rows: ReactNode[][] = useMemo(() => {
    return sessions.map((session, index) => [
      index + 1,
      <img
        src={session.lecture_session_image_url}
        alt="gambar"
        className="w-10 h-10 rounded object-cover"
      />,
      session.lecture_session_title,
      session.total_kajian || "-",
      format(
        new Date(session.lecture_session_start_time),
        "EEEE, dd MMMM yyyy - HH:mm",
        {
          locale: localeID,
        }
      ),
      <>
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
      </>,
      <div onClick={(e) => e.stopPropagation()}>
        <ActionEditDelete
          onEdit={() =>
            navigate(`/dkm/kajian/sesi/edit/${session.lecture_session_id}`)
          }
          onDelete={() => {
            if (confirm("Yakin ingin menghapus sesi kajian ini?")) {
              console.log("Delete", session.lecture_session_id);
              toast.success("Berhasil menghapus sesi kajian (mock)");
            }
          }}
        />
      </div>,
    ]);
  }, [sessions, navigate]);

  const emptyText = useMemo(() => {
    if (isLoading) return "Memuat data...";
    if (isError) return "Gagal memuat data.";
    return "Belum ada sesi kajian.";
  }, [isLoading, isError]);

  return (
    <>
      <PageHeader
        title="Seluruh Kajian"
        onBackClick={() => history.back()}
        actionButton={{
          label: "Tambah Kajian",
          to: "/dkm/kajian/tambah",
        }}
      />
      <SimpleTable
        columns={columns}
        rows={isLoading || isError ? [] : rows}
        emptyText={emptyText}
        onRowClick={(i) => {
          const session = sessions[i];
          navigate(`/dkm/kajian/kajian-detail/${session.lecture_session_id}`, {
            state: session,
          });
        }}
      />
    </>
  );
}
