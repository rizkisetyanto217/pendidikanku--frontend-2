import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import RichEditor from "@/components/common/main/RichEditor";

export default function MasjidMyNotesLectureSessions() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { lecture_session_slug, slug } = useParams<{
    slug: string;
    lecture_session_slug: string;
  }>();

  const [note, setNote] = useState("");

  // ✅ Ambil data kehadiran & catatan pribadi
  const { data, isLoading } = useQuery({
    queryKey: ["personalNotes", lecture_session_slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/user-lecture-sessions-attendance/${lecture_session_slug}/by-slug`
      );
      return res.data;
    },
    enabled: !!lecture_session_slug,
  });

  // ✅ Set default note dari data awal
  useEffect(() => {
    if (data?.user_lecture_sessions_attendance_personal_notes) {
      setNote(data.user_lecture_sessions_attendance_personal_notes);
    }
  }, [data]);

  // ✅ Mutasi simpan catatan
  const mutation = useMutation({
    mutationFn: async () => {
      return axios.put(
        `/api/a/user-lecture-sessions-attendance/${data.user_lecture_sessions_attendance_id}`,
        {
          user_lecture_sessions_attendance_personal_notes: note,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["personalNotes", lecture_session_slug],
      });
      alert("✅ Catatan berhasil disimpan");
    },
    onError: () => {
      alert("❌ Gagal menyimpan catatan.");
    },
  });

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <PageHeaderUser
        title="Catatan Pribadi Saya"
        onBackClick={() => {
          navigate(`/masjid/${slug}/soal-materi/${lecture_session_slug}`);
        }}
      />

      {isLoading ? (
        <div
          className="text-sm mt-6 text-center"
          style={{ color: theme.silver2 }}
        >
          Memuat data...
        </div>
      ) : (
        <>
          <div className="mt-6">
            <RichEditor
              label="Catatan Pribadi"
              value={note}
              onChange={(val) => setNote(val)}
              placeholder="Tulis catatan pribadi Anda di sini..."
            />
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="mt-4 px-4 py-2 rounded text-sm font-semibold"
            style={{
              backgroundColor: theme.primary,
              color: theme.white1,
            }}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        </>
      )}
    </div>
  );
}
