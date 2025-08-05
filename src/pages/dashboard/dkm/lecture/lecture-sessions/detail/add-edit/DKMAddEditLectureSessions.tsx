import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import toast from "react-hot-toast";
import InputField from "@/components/common/main/InputField";
import RichEditor from "@/components/common/main/RichEditor";
import LectureSelectField from "../components/LectureSelectField";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import SelectMasjidTeacher from "../components/SelectMasjidTeacher";
import SubmitActionButtons from "@/components/common/main/SubmitActionButton";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

export default function DKMAddEditLectureSession() {
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEditMode = !!id;
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

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

  const isFormValid = () => {
    return (
      form.lecture_session_title.trim() &&
      form.lecture_session_description.trim() &&
      form.lecture_session_teacher_id &&
      form.lecture_session_start_time &&
      form.lecture_session_end_time &&
      form.lecture_session_place &&
      form.lecture_session_lecture_id
    );
  };

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
  }, [id, isEditMode]);

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

        {!currentUser?.masjid_admin_ids?.[0] ? (
          <p className="text-sm text-gray-500">Memuat informasi masjid...</p>
        ) : (
          <LectureSelectField
            masjidId={currentUser.masjid_admin_ids[0]}
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
          <label
            className="text-sm font-medium"
            style={{ color: theme.black1 }}
          >
            Upload Gambar Kajian
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm rounded px-3 py-2"
            style={{
              backgroundColor: theme.white2,
              color: theme.black1,
              border: `1px solid ${theme.silver1}`,
            }}
          />
          {form.lecture_session_image_url && (
            <ShimmerImage
              src={form.lecture_session_image_url}
              alt="Preview Gambar"
              className="w-32 h-32 object-cover rounded mt-2"
              shimmerClassName="rounded"
            />
          )}
        </div>

        <SubmitActionButtons
          isPending={isPending}
          isEditMode={isEditMode}
          disabled={!isFormValid()}
        />
      </form>
    </div>
  );
}
