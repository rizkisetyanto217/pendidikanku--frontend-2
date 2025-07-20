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
  const [debouncedSearch] = useDebounce(search, 1000); // jeda 1000ms
  const isDark = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const {
    data: teacherData,
    isLoading: loadingTeachers,
    error: teacherError,
    refetch: refetchTeachers,
  } = useQuery({
    queryKey: ["masjid-teachers"],
    queryFn: async () => {
      console.log("[SelectMasjidTeacher] Fetching daftar pengajar...");
      const res = await axios.get("/api/a/masjid-teachers/by-masjid");
      const list = res.data.data.teachers as Teacher[];
      console.log("[SelectMasjidTeacher] Dapat", list.length, "pengajar.");
      return list;
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

      console.log(
        "[SelectMasjidTeacher] Mencari user dengan kata kunci:",
        debouncedSearch
      );
      const res = await axios.get(`/api/a/users/search?q=${debouncedSearch}`);
      const list = res.data.data.users as User[];
      console.log("[SelectMasjidTeacher] Ditemukan", list.length, "user.");
      return list;
    },

    enabled: search.length >= 3 && showSearch,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCreateTeacher = async (u: User) => {
    try {
      const masjid_id = getMasjidIdFromSession();
      if (!masjid_id) {
        throw new Error("Masjid ID tidak ditemukan di session token.");
      }

      console.log(`[SelectMasjidTeacher] Menambahkan pengajar baru: ${u.id}`);

      console.log("Payload yang dikirim:", {
        masjid_teachers_masjid_id: masjid_id,
        masjid_teachers_user_id: u.id,
      });

      await axios.post("/api/a/masjid-teachers", {
        masjid_teachers_masjid_id: masjid_id,
        masjid_teachers_user_id: u.id,
      });

      // Refresh data pengajar
      await refetchTeachers();

      onChange(u.id);
      setShowSearch(false);
      setSearch("");
      console.log("[SelectMasjidTeacher] Pengajar berhasil ditambahkan.");
    } catch (err) {
      console.error("[SelectMasjidTeacher] Gagal menambahkan pengajar:", err);
    }
  };

  if (teacherError)
    console.warn(
      "[SelectMasjidTeacher] Gagal fetch daftar pengajar:",
      teacherError
    );
  if (userError)
    console.warn(
      "[SelectMasjidTeacher] Gagal fetch hasil pencarian user:",
      userError
    );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" style={{ color: theme.black1 }}>
        Pilih Pengajar
      </label>
      <select
        id="select-teacher"
        name="teacher_id"
        value={value}
        onChange={(e) => {
          console.log(
            "[SelectMasjidTeacher] Pengajar dipilih dari select:",
            e.target.value
          );
          onChange(e.target.value);
        }}
        className="w-full p-2 rounded border appearance-none bg-white text-black border-gray-300 dark:bg-[#1C1C1C] dark:text-white dark:border-gray-600"
      >
        <option value="">-- Pilih pengajar --</option>
        {teacherData?.map((t) => (
          <option
            key={t.masjid_teachers_user_id}
            value={t.masjid_teachers_user_id}
          >
            {t.user_name} ({t.masjid_teachers_user_id})
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => {
          console.log(
            `[SelectMasjidTeacher] Toggle form pencarian user: ${!showSearch}`
          );
          setShowSearch((v) => !v);
        }}
        className="text-sm mt-1"
        style={{ color: theme.quaternary }}
      >
        {showSearch ? "Tutup pencarian" : "Tambah pengajar"}
      </button>

      {showSearch && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Cari user..."
            value={search}
            onChange={handleSearch}
            className="w-full p-2 rounded"
            style={{
              backgroundColor: theme.white1,
              color: theme.black1,
              border: `1px solid ${theme.silver1}`,
            }}
          />
          <div className="mt-2 space-y-1">
            {loadingUsers && (
              <p className="text-sm" style={{ color: theme.silver2 }}>
                🔄 Memuat hasil pencarian...
              </p>
            )}
            {search.length > 0 && search.length < 3 && (
              <p className="text-sm" style={{ color: theme.silver2 }}>
                Ketik minimal 3 huruf untuk mencari.
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
                  className="cursor-pointer p-2 rounded border"
                  style={{
                    borderColor: theme.silver1,
                    backgroundColor: theme.white2,
                    color: theme.black1,
                  }}
                  onClick={() => handleCreateTeacher(u)}
                >
                  {u.user_name} ({u.id})
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
