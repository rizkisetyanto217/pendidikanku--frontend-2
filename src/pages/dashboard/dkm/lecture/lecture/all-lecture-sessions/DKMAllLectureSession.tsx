import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import SimpleTable from "@/components/common/main/SimpleTable";
import { ReactNode } from "react";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import StatusBadge from "@/components/common/main/MainStatusBadge";
import { ExternalLink } from "lucide-react";
import FormattedDate from "@/constants/formattedDate"; // pastikan path sesuai

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
    `/public/lecture-sessions-u/by-lecture/${lectureId}`
  );
  return Array.isArray(res.data.data) ? res.data.data : [];
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
      <FormattedDate value={session.lecture_session_start_time} fullMonth />,
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
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/dkm/kajian/kajian-detail/${session.lecture_session_id}`, {
            state: {
              session,
              from: location.pathname,
            },
          });
        }}
      >
        <ExternalLink size={16} />
      </button>,
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
      />
    </>
  );
}
