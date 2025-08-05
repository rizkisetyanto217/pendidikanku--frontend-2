import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { getMasjidIdFromSession } from "@/utils/auth";
import { useDebounce } from "use-debounce";

type Teacher = {
  masjid_teachers_user_id: string;
  user_name: string;
};

type User = {
  id: string;
  user_name: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SelectMasjidTeacher({ value, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [debouncedSearch] = useDebounce(search, 1000);
  const { isDark } = useHtmlDarkMode(); // ✅ ambil isDark-nya
  const theme = isDark ? colors.dark : colors.light;

  const {
    data: teacherData,
    isLoading: loadingTeachers,
    error: teacherError,
    refetch: refetchTeachers,
  } = useQuery({
    queryKey: ["masjid-teachers"],
    queryFn: async () => {
      const res = await axios.get("/api/a/masjid-teachers/by-masjid");
      return res.data.data.teachers as Teacher[];
    },
  });

  const {
    data: userData,
    isLoading: loadingUsers,
    error: userError,
  } = useQuery({
    queryKey: ["search-user", debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch.length < 3) return [];
      const res = await axios.get(`/api/a/users/search?q=${debouncedSearch}`);
      return res.data.data.users as User[];
    },
    enabled: search.length >= 3 && showSearch,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCreateTeacher = async (u: User) => {
    try {
      const masjid_id = getMasjidIdFromSession();
      await axios.post("/api/a/masjid-teachers", {
        masjid_teachers_masjid_id: masjid_id,
        masjid_teachers_user_id: u.id,
      });
      await refetchTeachers();
      onChange(u.id);
      setShowSearch(false);
      setSearch("");
    } catch (err) {
      console.error("❌ Gagal tambah pengajar:", err);
    }
  };

  console.log("🌙 isDark:", isDark);
  console.log("🎨 theme.white1:", theme.white1);

  return (
    <div className="w-full space-y-1">
      <label
        className="block text-sm font-medium"
        style={{ color: theme.black2 }}
      >
        Pilih Pengajar
      </label>

      <div className="relative">
        <select
          id="select-teacher"
          name="lecture_session_teacher_id"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm px-4 py-2.5 pr-10 border rounded-lg appearance-none transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
          style={{
            backgroundColor: theme.white2, // 🔄 Perbaikan di sini
            borderColor: theme.silver1,
            color: theme.black1,
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none",
          }}
        >
          <option value="">-- Pilih pengajar --</option>
          {teacherData?.map((t) => (
            <option
              key={t.masjid_teachers_user_id}
              value={t.masjid_teachers_user_id}
            >
              {t.user_name}
            </option>
          ))}
        </select>

        {/* Icon dropdown */}
        <div
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          style={{ color: theme.black2 }}
        >
          ^
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowSearch((v) => !v)}
        className="text-sm mt-1"
        style={{ color: theme.quaternary }}
      >
        {showSearch ? "Tutup pencarian" : "Tambah pengajar"}
      </button>

      {showSearch && (
        <div className="mt-2 space-y-1">
          <input
            type="text"
            placeholder="Cari user..."
            value={search}
            onChange={handleSearch}
            className="w-full text-sm px-4 py-2.5 border rounded-lg"
            style={{
              backgroundColor: theme.white1,
              borderColor: theme.silver1,
              color: theme.black1,
            }}
          />

          {loadingUsers && (
            <p className="text-sm" style={{ color: theme.silver2 }}>
              🔄 Memuat hasil pencarian...
            </p>
          )}
          {search.length > 0 && search.length < 3 && (
            <p className="text-sm" style={{ color: theme.silver2 }}>
              Ketik minimal 3 huruf.
            </p>
          )}
          {!loadingUsers && userData?.length === 0 && (
            <p className="text-sm" style={{ color: theme.silver2 }}>
              Tidak ditemukan hasil.
            </p>
          )}
          {!loadingUsers &&
            userData?.map((u) => (
              <div
                key={u.id}
                className="cursor-pointer px-4 py-2 border rounded text-sm"
                style={{
                  borderColor: theme.silver1,
                  backgroundColor: theme.white2,
                  color: theme.black1,
                }}
                onClick={() => handleCreateTeacher(u)}
              >
                {u.user_name}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
