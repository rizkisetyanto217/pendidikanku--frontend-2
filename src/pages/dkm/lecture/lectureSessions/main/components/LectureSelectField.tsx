import React from "react";
import { useQuery } from "@tanstack/react-query";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import axios from "@/lib/axios";

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
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

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
      });
      return res.data.data;
    },
    enabled: !!masjidId,
    staleTime: 1000 * 60 * 5,
  });

  if (isError) {
    return (
      <p className="text-sm text-red-500">
        Gagal memuat daftar tema kajian: {error.message}
      </p>
    );
  }

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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={isLoading}
        className="w-full text-sm px-4 py-2.5 border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
        style={{
          backgroundColor: theme.white2,
          borderColor: theme.silver1,
          color: theme.black1,
        }}
      >
        <option value="" disabled>
          {isLoading ? "Memuat..." : "Pilih Tema Kajian"}
        </option>
        {lectures.map(({ lecture_id, lecture_title }) => (
          <option key={lecture_id} value={lecture_id}>
            {lecture_title}
          </option>
        ))}
      </select>
    </div>
  );
}
