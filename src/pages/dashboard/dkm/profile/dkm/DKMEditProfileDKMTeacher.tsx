import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import InputField from "@/components/common/main/InputField"; // pastikan path-nya sesuai

interface Profile {
  masjid_profile_teacher_dkm_id: string;
  masjid_profile_teacher_dkm_name: string;
  masjid_profile_teacher_dkm_role: string;
  masjid_profile_teacher_dkm_description: string;
  masjid_profile_teacher_dkm_message: string;
  masjid_profile_teacher_dkm_image_url: string;
  masjid_profile_teacher_dkm_created_at: string;
}

export default function DKMEditProfileDKMTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const { data, isLoading } = useQuery<Profile>({
    queryKey: ["masjid-profile-teacher-dkm", id],
    queryFn: async () => {
      const res = await axios.get(`/public/masjid-profile-teacher-dkm/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const [form, setForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`/api/a/masjid-profile-teacher-dkm/${id}`, form);
      navigate("/dkm/pengajar");
    } catch (err) {
      console.error("Gagal update", err);
    }
  };

  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Profil Pengajar"
        onBackClick={() => navigate(-1)}
      />

      <div className="space-y-4">
        <InputField
          label="Nama"
          name="masjid_profile_teacher_dkm_name"
          value={form.masjid_profile_teacher_dkm_name}
          onChange={handleChange}
        />

        <InputField
          label="Peran / Jabatan"
          name="masjid_profile_teacher_dkm_role"
          value={form.masjid_profile_teacher_dkm_role}
          onChange={handleChange}
        />

        <InputField
          label="Sambutan"
          name="masjid_profile_teacher_dkm_message"
          as="textarea"
          value={form.masjid_profile_teacher_dkm_message}
          onChange={handleChange}
        />

        <InputField
          label="Deskripsi"
          name="masjid_profile_teacher_dkm_description"
          as="textarea"
          value={form.masjid_profile_teacher_dkm_description}
          onChange={handleChange}
        />

        <InputField
          label="Gambar URL"
          name="masjid_profile_teacher_dkm_image_url"
          value={form.masjid_profile_teacher_dkm_image_url}
          onChange={handleChange}
        />

        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded text-white"
          style={{ backgroundColor: themeColors.primary }}
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
