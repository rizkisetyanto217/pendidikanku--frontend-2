import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

interface LectureMaterialItem {
  id: string;
  title: string;
  teacher: string;
  masjidName: string;
  location: string;
  time: string;
  status: "tersedia" | "proses";
}

export default function LectureMaterialList({
  data,
}: {
  data: LectureMaterialItem[];
}) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div
          key={item.id}
          className="p-3 rounded-md shadow-sm"
          style={{
            backgroundColor: theme.white1,
            border: `1px solid ${theme.silver1}`,
          }}
        >
          <p className="font-semibold text-sm mb-2" style={{ color: theme.black1 }}>
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

          <div className="mt-2 inline-block">
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
          </div>
        </div>
      ))}
    </div>
  );
}
