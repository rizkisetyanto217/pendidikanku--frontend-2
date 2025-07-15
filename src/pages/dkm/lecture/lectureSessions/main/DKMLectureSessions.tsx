import { useQuery } from "@tanstack/react-query";
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
  const navigate = useNavigate(); // ⬅️ Letakkan di dalam komponen

  const token = sessionStorage.getItem("token");
  const masjidId = token
    ? jwtDecode<TokenPayload>(token).masjid_admin_ids?.[0]
    : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lecture-sessions", masjidId],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions/by-masjid/${masjidId}`
      );
      return res.data.data as LectureSession[];
    },
    enabled: !!masjidId,
  });

  return (
    <>
      <PageHeader
        title="Kajian Terbaru"
        actionButton={{
          label: "Tambah Kajian",
          to: "/dkm/kajian/tambah",
        }}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p className="text-red-500">Gagal memuat data.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead style={{ backgroundColor: theme.success2 }}>
              <tr>
                <th className="px-4 py-2 text-left">No</th>
                <th className="px-4 py-2 text-left">Gambar</th>
                <th className="px-4 py-2 text-left">Judul</th>
                <th className="px-4 py-2 text-left">Tema</th>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((session, i) => (
                <tr
                  key={session.lecture_session_id}
                  className="border-t cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  style={{ borderColor: theme.silver1 }}
                  onClick={() =>
                    navigate(
                      `/dkm/kajian/kajian-detail/${session.lecture_session_id}`,
                      {
                        state: session, // ⬅️ Kirim seluruh data session lewat state
                      }
                    )
                  }
                >
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">
                    <img
                      src={
                        session.lecture_session_image_url ?? "/mock/kajian.jpg"
                      }
                      alt="Kajian"
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {session.lecture_session_title}
                  </td>
                  <td className="px-4 py-2">{session.lecture_title}</td>
                  <td className="px-4 py-2">
                    {new Date(
                      session.lecture_session_start_time
                    ).toLocaleString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge
                        text={
                          session.lecture_session_approved_by_dkm_at
                            ? "Soal & Materi tersedia"
                            : "Soal & Materi dalam Proses"
                        }
                        variant={
                          session.lecture_session_approved_by_dkm_at
                            ? "info"
                            : "warning"
                        }
                      />
                      <StatusBadge
                        text={
                          session.lecture_session_is_active
                            ? "Aktif"
                            : "Nonaktif"
                        }
                        variant={
                          session.lecture_session_is_active
                            ? "success"
                            : "error"
                        }
                      />
                    </div>
                  </td>
                  <td
                    className="px-4 py-2"
                    onClick={(e) => e.stopPropagation()} // 🔒 Cegah event bubbling
                  >
                    <ActionEditDelete
                      onEdit={() =>
                        console.log("Edit", session.lecture_session_id)
                      }
                      onDelete={() => {
                        if (confirm("Yakin ingin menghapus sesi kajian ini?")) {
                          deleteLectureSession(session.lecture_session_id, {
                            onSuccess: () =>
                              toast.success("Sesi kajian berhasil dihapus"),
                            onError: () =>
                              toast.error("Gagal menghapus sesi kajian"),
                          });
                        }
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
