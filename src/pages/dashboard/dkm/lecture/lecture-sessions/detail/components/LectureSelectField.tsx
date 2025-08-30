import React from "react";
import { useQuery } from "@tanstack/react-query";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import axios from "@/lib/axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface LectureSelectFieldProps {
  masjidId: string;
  name: string;
  value: string;
  label?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface LectureOption {
  lecture_id: string;
  lecture_title: string;
}

export default function LectureSelectField({
  masjidId,
  name,
  value,
  label = "Pilih Tema Kajian",
  onChange,
}: LectureSelectFieldProps) {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const {
    data: lectures = [],
    isLoading,
    isError,
    error,
  } = useQuery<LectureOption[], Error>({
    queryKey: ["lectures", masjidId],
    queryFn: async () => {
      const res = await axios.get("/api/a/lectures/by-masjid", {
        params: { masjid_id: masjidId },
        withCredentials: true,
      });
      console.log("📥 Lecture options response:", res.data);
      return res.data.data;
    },
    enabled: !!masjidId,
    staleTime: 1000 * 60 * 5,
  });

  if (!masjidId) {
    return <p className="text-sm text-gray-500">Masjid belum tersedia.</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-500">
        Gagal memuat daftar tema kajian: {error.message}
      </p>
    );
  }

  console.log("📥 Daftar tema kajian:", lectures);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium"
          style={{ color: theme.black2 }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={isLoading}
          className="w-full text-sm px-4 py-2.5 pr-10 border rounded-lg transition-all appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500"
          style={{
            backgroundColor: theme.white2,
            borderColor: theme.silver1,
            color: theme.black1,
          }}
        >
          <option value="" disabled>
            {isLoading ? "Memuat tema kajian..." : "Pilih Tema Kajian"}
          </option>
          {lectures.map((lecture) => (
            <option key={lecture.lecture_id} value={lecture.lecture_id}>
              {lecture.lecture_title}
            </option>
          ))}
        </select>

        {/* Icon dropdown */}
        <div
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: theme.black2 }}
        >
          ^
        </div>
      </div>
    </div>
  );
}
