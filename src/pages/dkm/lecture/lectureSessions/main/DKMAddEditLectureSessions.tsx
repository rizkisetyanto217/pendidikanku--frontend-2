import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/PageHeader";
import toast from "react-hot-toast";
import InputField from "@/components/common/main/InputField";
import RichEditor from "@/components/common/main/RichEditor";
import LectureSelectField from "./components/LectureSelectField";
import { getMasjidIdFromSession } from "@/utils/auth";

export default function DKMAddEditLectureSession() {
  const masjidIdFromToken = getMasjidIdFromSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    lecture_session_title: "",
    lecture_session_description: "",
    lecture_session_teacher_id: "",
    lecture_session_teacher_name: "",
    lecture_session_start_time: "",
    lecture_session_end_time: "",
    lecture_session_place: "",
    lecture_session_lecture_id: "",
    lecture_session_masjid_id: "",
    lecture_session_image_url: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axios.post("/api/a/lecture-sessions", form);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Berhasil membuat sesi kajian");
      queryClient.invalidateQueries({ queryKey: ["lecture-sessions"] });
      navigate("/dkm/kajian");
    },
    onError: () => {
      toast.error("Gagal membuat sesi kajian");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Buat Kajian" onBackClick={() => history.back()} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
        className="space-y-4"
      >
        <InputField
          label="Judul Kajian"
          name="lecture_session_title"
          value={form.lecture_session_title}
          placeholder="Judul Kajian"
          onChange={handleChange}
        />

        <RichEditor
          label="Deskripsi Kajian"
          value={form.lecture_session_description}
          onChange={(val) =>
            setForm((prev) => ({
              ...prev,
              lecture_session_description: val,
            }))
          }
        />

        {masjidIdFromToken && (
          <LectureSelectField
            masjidId={masjidIdFromToken}
            name="lecture_session_lecture_id"
            value={form.lecture_session_lecture_id}
            onChange={handleChange}
          />
        )}

        <InputField
          label="ID Pengajar (Jika punya akun)"
          name="lecture_session_teacher_id"
          value={form.lecture_session_teacher_id}
          placeholder="UUID Pengajar"
          onChange={handleChange}
        />

        <InputField
          label="Tanggal & Jam Mulai"
          name="lecture_session_start_time"
          value={form.lecture_session_start_time}
          type="datetime-local"
          onChange={handleChange}
        />

        <InputField
          label="Tanggal & Jam Selesai"
          name="lecture_session_end_time"
          value={form.lecture_session_end_time}
          type="datetime-local"
          onChange={handleChange}
        />

        <InputField
          label="Tempat"
          name="lecture_session_place"
          value={form.lecture_session_place}
          placeholder="Misal: Aula Utama, Ruang 1, dll"
          onChange={handleChange}
        />

        <InputField
          label="ID Masjid"
          name="lecture_session_masjid_id"
          value={form.lecture_session_masjid_id}
          placeholder="UUID Masjid"
          onChange={handleChange}
        />

        <InputField
          label="URL Gambar Kajian"
          name="lecture_session_image_url"
          value={form.lecture_session_image_url}
          placeholder="https://..."
          type="url"
          onChange={handleChange}
        />

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded"
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Simpan Sekarang"}
          </button>
        </div>
      </form>
    </div>
  );
}
