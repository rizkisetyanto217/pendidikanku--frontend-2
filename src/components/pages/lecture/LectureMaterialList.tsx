import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { useNavigate, useParams } from "react-router-dom";

interface LectureMaterialItem {
  id: string;
  imageUrl?: string;
  title: string;
  teacher: string;
  masjidName: string;
  location: string;
  time: string;
  status: "tersedia" | "proses";
  gradeResult?: number;
  attendanceStatus?: number; // 1: hadir
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
    <div className="space-y-3">
      {data.map((item) => (
        <div
          key={item.id}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/masjid/${slug}/soal-materi/${item.id}`);
          }}
          className="flex rounded-xl shadow-sm cursor-pointer transition hover:opacity-90"
          style={{
            backgroundColor: theme.white1,
            border: `1px solid ${theme.silver1}`,
          }}
        >
          {/* Gambar Kajian */}
          {item.imageUrl && (
            <div
              className="aspect-[4/5] w-[90px] min-h-[112px] flex-shrink-0 overflow-hidden rounded-lg border"
              style={{ borderColor: theme.white3 }}
            >
              <img
                src={decodeURIComponent(item.imageUrl)}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Konten */}
          <div className="flex flex-col justify-between flex-1 py-3 pr-3 px-4 md:px-3">
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: theme.black1 }}
              >
                {item.title}
              </p>
              <p className="text-xs" style={{ color: theme.silver2 }}>
                {item.teacher}
              </p>
              <p className="text-xs" style={{ color: theme.silver2 }}>
                {item.time}
              </p>
            </div>

            {/* Badge Bar */}
            <div className="flex flex-wrap gap-2 mt-2">
              {/* Kehadiran */}
              {item.attendanceStatus !== undefined &&
                item.attendanceStatus !== 0 && (
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor:
                        item.attendanceStatus === 1
                          ? theme.success2
                          : item.attendanceStatus === 2
                            ? theme.black1
                            : theme.white3,
                      color:
                        item.attendanceStatus === 1
                          ? theme.success1
                          : item.attendanceStatus === 2
                            ? theme.black1
                            : theme.silver2,
                    }}
                  >
                    {item.attendanceStatus === 1
                      ? "Hadir Tatap Muka ✅"
                      : item.attendanceStatus === 2
                        ? "Hadir Online 💻"
                        : "Tidak Hadir"}
                  </span>
                )}

              {/* Materi & Soal */}
              {item.gradeResult === undefined && (
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor:
                      item.status === "tersedia"
                        ? theme.warning1
                        : theme.white3,
                    color:
                      item.status === "tersedia"
                        ? theme.warning1
                        : theme.silver2,
                  }}
                >
                  {item.status === "tersedia"
                    ? "Materi & Soal Tersedia"
                    : "Dalam Proses"}
                </span>
              )}

              {/* Nilai */}
              {item.gradeResult !== undefined && (
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor:
                      item.gradeResult >= 70 ? theme.primary2 : theme.success1,
                    color:
                      item.gradeResult >= 70 ? theme.primary : theme.success2,
                  }}
                >
                  Nilai : {item.gradeResult}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
