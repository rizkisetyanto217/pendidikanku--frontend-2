import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { useNavigate, useParams } from "react-router-dom";

interface LectureMaterialItem {
  id: string;
  title: string;
  teacher: string;
  masjidName: string;
  location: string;
  time: string;
  status: "tersedia" | "proses";
  gradeResult?: number;
  attendanceStatus?: number;
}

export default function LectureMaterialList({
  data,
}: {
  data: LectureMaterialItem[];
}) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const { slug = "" } = useParams();

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div
          key={item.id}
          onClick={() => navigate(`/masjid/${slug}/soal-materi/${item.id}`)}
          className="p-3 rounded-md shadow-sm cursor-pointer transition hover:opacity-90"
          style={{
            backgroundColor: theme.white1,
            border: `1px solid ${theme.silver1}`,
          }}
        >
          <p
            className="font-semibold text-sm mb-2"
            style={{ color: theme.black1 }}
          >
            {item.title}
          </p>
          <p className="text-xs mb-1" style={{ color: theme.silver2 }}>
            {item.teacher}
          </p>
          <p className="text-xs mb-1" style={{ color: theme.silver2 }}>
            {item.masjidName}, {item.location}
          </p>
          <p className="text-xs mb-1" style={{ color: theme.silver2 }}>
            {item.time}
          </p>

          {/* Badge status soal & materi */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {item.status === "tersedia" ? (
              <span
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: theme.success2,
                  color: theme.success1,
                }}
              >
                Soal & Materi tersedia
              </span>
            ) : (
              <span
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: theme.white3,
                  color: theme.silver2,
                }}
              >
                Soal & Materi dalam proses
              </span>
            )}

            {/* Progress: Nilai */}
            {item.gradeResult !== undefined && (
              <span
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor:
                    item.gradeResult >= 70 ? theme.success2 : theme.white3,
                  color:
                    item.gradeResult >= 70 ? theme.success1 : theme.warning1,
                }}
              >
                Nilai: {item.gradeResult}
              </span>
            )}

            {/* Progress: Kehadiran */}
            {item.attendanceStatus !== undefined && (
              <span
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor:
                    item.attendanceStatus === 1 ? theme.primary2 : theme.white3,
                  color:
                    item.attendanceStatus === 1 ? theme.primary : theme.silver2,
                }}
              >
                {item.attendanceStatus === 1 ? "✅ Hadir" : "❌ Tidak Hadir"}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
