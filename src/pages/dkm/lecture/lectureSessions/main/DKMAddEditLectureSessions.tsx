import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/PageHeader";
import toast from "react-hot-toast";
import InputField from "@/components/common/main/InputField";
import RichEditor from "@/components/common/main/RichEditor";
import LectureSelectField from "./components/LectureSelectField";
import { getMasjidIdFromSession } from "@/utils/auth";
import SelectMasjidTeacher from "./components/SelectMasjidTeacher";
import SubmitActionButtons from "@/components/common/main/SubmitActionButton";

export default function DKMAddEditLectureSession() {
  const masjidIdFromToken = getMasjidIdFromSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEditMode = !!id;

  const [form, setForm] = useState({
    lecture_session_title: "",
    lecture_session_description: "",
    lecture_session_teacher_id: "",
    lecture_session_teacher_name: "",
    lecture_session_start_time: "",
    lecture_session_end_time: "",
    lecture_session_place: "",
    lecture_session_lecture_id: "",
    lecture_session_image_file: null as File | null,
    lecture_session_image_url: "",
  });

  useEffect(() => {
    if (isEditMode) {
      axios.get(`/api/a/lecture-sessions/by-id/${id}`).then((res) => {
        const data = res.data;
        setForm({
          lecture_session_title: data.lecture_session_title || "",
          lecture_session_description: data.lecture_session_description || "",
          lecture_session_teacher_id: data.lecture_session_teacher_id || "",
          lecture_session_teacher_name: data.lecture_session_teacher_name || "",
          lecture_session_start_time:
            data.lecture_session_start_time?.slice(0, 16) || "",
          lecture_session_end_time:
            data.lecture_session_end_time?.slice(0, 16) || "",
          lecture_session_place: data.lecture_session_place || "",
          lecture_session_lecture_id: data.lecture_session_lecture_id || "",
          lecture_session_image_url: data.lecture_session_image_url || "",
          lecture_session_image_file: null,
        });
      });
    }
  }, [id]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("lecture_session_title", form.lecture_session_title);
      data.append(
        "lecture_session_description",
        form.lecture_session_description
      );
      data.append(
        "lecture_session_teacher_id",
        form.lecture_session_teacher_id
      );
      data.append(
        "lecture_session_teacher_name",
        form.lecture_session_teacher_name
      );
      data.append(
        "lecture_session_start_time",
        form.lecture_session_start_time + ":00Z"
      );
      data.append(
        "lecture_session_end_time",
        form.lecture_session_end_time + ":00Z"
      );
      data.append("lecture_session_place", form.lecture_session_place);
      data.append(
        "lecture_session_lecture_id",
        form.lecture_session_lecture_id
      );

      if (form.lecture_session_image_file) {
        data.append(
          "lecture_session_image_url",
          form.lecture_session_image_file
        );
      }

      const method = isEditMode ? axios.put : axios.post;
      const url = isEditMode
        ? `/api/a/lecture-sessions/${id}`
        : "/api/a/lecture-sessions";

      const res = await method(url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        isEditMode
          ? "Berhasil mengubah sesi kajian"
          : "Berhasil membuat sesi kajian"
      );
      queryClient.invalidateQueries({ queryKey: ["lecture-sessions"] });
      navigate("/dkm/kajian");
    },
    onError: () => {
      toast.error("Gagal menyimpan sesi kajian");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        lecture_session_image_file: file,
        lecture_session_image_url: URL.createObjectURL(file),
      }));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? "Edit Kajian" : "Buat Kajian"}
        onBackClick={() => history.back()}
      />

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

        <SelectMasjidTeacher
          value={form.lecture_session_teacher_id}
          onChange={(val) =>
            setForm((prev) => ({
              ...prev,
              lecture_session_teacher_id: val,
            }))
          }
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

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Upload Gambar Kajian
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded"
          />
          {form.lecture_session_image_url && (
            <img
              src={form.lecture_session_image_url}
              alt="Preview Gambar"
              className="w-32 h-32 object-cover rounded mt-2"
            />
          )}
        </div>

        <SubmitActionButtons isPending={isPending} isEditMode={isEditMode} />
      </form>
    </div>
  );
}
