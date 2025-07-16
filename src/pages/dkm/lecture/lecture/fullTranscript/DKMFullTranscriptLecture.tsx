import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/PageHeader";
import axios from "@/lib/axios";
import { ExternalLink } from "lucide-react";

interface Summary {
  lecture_sessions_material_id: string;
  lecture_sessions_material_title: string;
  lecture_sessions_material_summary: string;
  lecture_sessions_material_created_at: string;
  lecture_sessions_material_transcript_full : string
}

export default function DKMTranscriptLecture() {
  const { id } = useParams(); // lecture_id
  const { state } = useLocation();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const { data, isLoading, isError } = useQuery<Summary[]>({
    queryKey: ["lecture-sessions-summary", id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-materials/filter?lecture_id=${id}&type=transcript`
      );
      return res.data.data;
    },
    enabled: !!id,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ringkasan Kajian"
        backTo={`/dkm/tema/tema-detail/${id}`}
      />

      <div
        className="rounded-xl p-4 overflow-x-auto"
        style={{ backgroundColor: theme.white1 }}
      >
        <table className="w-full text-sm table-auto">
          <thead>
            <tr style={{ color: theme.black1 }}>
              <th className="text-left py-2 px-2">No</th>
              <th className="text-left py-2 px-2">Judul</th>
              <th className="text-left py-2 px-2">Deskripsi</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-red-500">
                  Gagal memuat data.
                </td>
              </tr>
            ) : !Array.isArray(data) || data.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  Data tidak tersedia.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.lecture_sessions_material_id}
                  className="border-t"
                >
                  <td className="py-2 px-2">{index + 1}</td>
                  <td className="py-2 px-2">
                    {item.lecture_sessions_material_title}
                  </td>
                  <td className="py-2 px-2 text-gray-600 dark:text-gray-300">
                    {item.lecture_sessions_material_transcript_full}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className="px-2 py-1 text-xs rounded-full font-semibold"
                      style={{
                        backgroundColor: "#DEF7EC",
                        color: "#03543F",
                      }}
                    >
                      Aktif
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <button
                      className="p-1"
                      onClick={() =>
                        window.open(
                          `/dkm/tema/summary-detail/${item.lecture_sessions_material_id}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink size={16} style={{ color: theme.black1 }} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
