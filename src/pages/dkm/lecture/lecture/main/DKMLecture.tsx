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
    queryKey: ["lectures", masjidId],
    enabled: !!masjidId,
    queryFn: async () => {
      const res = await axios.get(`/public/lectures/by-masjid/${masjidId}`);
      return res.data.data as Lecture[];
    },
  });

  return (
    <>
      <PageHeader
        title="Tema Kajian"
        actionButton={{
          label: "Tambah Kajian",
          to: "/dkm/kajian/tambah",
        }}
      />
      {isLoading ? (
        <p>Loading...</p>
      ) : isError || !lectures ? (
        <p className="text-red-500">Gagal memuat data.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead style={{ backgroundColor: theme.success2 }}>
              <tr>
                <th className="px-4 py-2 text-left">No</th>
                <th className="px-4 py-2 text-left">Gambar</th>
                <th className="px-4 py-2 text-left">Judul</th>
                <th className="px-4 py-2 text-left">Deskripsi</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Pendaftaran</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lectures.map((lecture, i) => (
                <tr
                  key={lecture.lecture_id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  style={{ borderColor: theme.silver1 }}
                  onClick={() =>
                    navigate(`/dkm/tema/tema-detail/${lecture.lecture_id}`, {
                      state: lecture,
                    })
                  }
                >
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">
                    <img
                      src={lecture.lecture_image_url ?? "/mock/kajian.jpg"}
                      alt="Gambar Kajian"
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {lecture.lecture_title}
                  </td>
                  <td className="px-4 py-2">{lecture.lecture_description}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        lecture.lecture_is_active
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {lecture.lecture_is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {lecture.lecture_is_registration_required ? "Ya" : "Tidak"}
                  </td>
                  <td
                    className="px-4 py-2"
                    onClick={(e) => e.stopPropagation()} // 🔒 Hindari trigger dari tr onClick
                  >
                    <ActionEditDelete
                      onEdit={() => console.log("Edit", lecture.lecture_id)}
                      onDelete={() => {
                        if (confirm("Yakin ingin menghapus kajian ini?")) {
                          deleteLecture(lecture.lecture_id, {
                            onSuccess: () =>
                              toast.success("Berhasil menghapus kajian"),
                            onError: () =>
                              toast.error("Gagal menghapus kajian"),
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
