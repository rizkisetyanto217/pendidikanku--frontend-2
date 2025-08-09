import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "@/components/common/main/InputField";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import api from "@/lib/axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import toast from "react-hot-toast";

interface MasjidData {
  masjid_instagram_url: string;
  masjid_whatsapp_url: string;
  masjid_youtube_url: string;
  masjid_facebook_url: string;
  masjid_tiktok_url: string;
  masjid_whatsapp_group_ikhwan_url: string;
  masjid_whatsapp_group_akhwat_url: string;
}

export default function DkmEditSosmedProfile() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();

  const { user, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];

  const [form, setForm] = useState<MasjidData>({
    masjid_instagram_url: "",
    masjid_whatsapp_url: "",
    masjid_youtube_url: "",
    masjid_facebook_url: "",
    masjid_tiktok_url: "",
    masjid_whatsapp_group_ikhwan_url: "",
    masjid_whatsapp_group_akhwat_url: "",
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;

    if (!masjidId) {
      alert("ID masjid tidak ditemukan.");
      navigate("/dkm/profil-masjid");
      return;
    }

    const fetchMasjidData = async () => {
      try {
        const res = await api.get(`/public/masjids/verified/${masjidId}`, {
          withCredentials: true,
        });
        const data = res.data?.data;

        console.log("✅ Data sosial media masjid berhasil diambil:", data);

        if (!data) {
          alert("Data masjid tidak ditemukan.");
          navigate("/dkm/profil-masjid");
          return;
        }

        setForm({
          masjid_instagram_url: data.masjid_instagram_url || "",
          masjid_whatsapp_url: data.masjid_whatsapp_url || "",
          masjid_youtube_url: data.masjid_youtube_url || "",
          masjid_facebook_url: data.masjid_facebook_url || "",
          masjid_tiktok_url: data.masjid_tiktok_url || "",
          masjid_whatsapp_group_ikhwan_url:
            data.masjid_whatsapp_group_ikhwan_url || "",
          masjid_whatsapp_group_akhwat_url:
            data.masjid_whatsapp_group_akhwat_url || "",
        });

        setLoading(false);
      } catch (error) {
        console.error("❌ Gagal ambil data masjid:", error);
        alert("Gagal mengambil data masjid.");
        navigate("/dkm/profil-masjid");
      }
    };

    fetchMasjidData();
  }, [isUserLoading, masjidId, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masjidId) return toast.error("ID masjid tidak ditemukan.");

    setSaving(true);
    try {
      console.log("📤 Data yang akan dikirim:", form);

      const res = await api.put(`/api/a/masjids`, form, {
        withCredentials: true,
      });

      toast.success(
        res.data?.message || "Data sosial media berhasil disimpan."
      );

      // 🔄 Refresh data masjid
      const refresh = await api.get(`/public/masjids/verified/${masjidId}`);
      const data = refresh.data?.data;

      setForm({
        masjid_instagram_url: data.masjid_instagram_url || "",
        masjid_whatsapp_url: data.masjid_whatsapp_url || "",
        masjid_youtube_url: data.masjid_youtube_url || "",
        masjid_facebook_url: data.masjid_facebook_url || "",
        masjid_tiktok_url: data.masjid_tiktok_url || "",
        masjid_whatsapp_group_ikhwan_url:
          data.masjid_whatsapp_group_ikhwan_url || "",
        masjid_whatsapp_group_akhwat_url:
          data.masjid_whatsapp_group_akhwat_url || "",
      });

      // Navigasi balik jika kamu ingin langsung ke halaman profil
      navigate("/dkm/profil-masjid");
    } catch (err: any) {
      console.error(
        "❌ Gagal menyimpan sosial media:",
        err.response?.data || err
      );
      toast.error(
        err.response?.data?.message || "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Sosial Media Masjid" backTo="/dkm/profil-masjid" />
      <div
        className="space-y-6 rounded-xl"
        style={{
          backgroundColor: theme.white1,
          color: theme.black1,
          minHeight: "100%",
        }}
      >
        {loading || isUserLoading ? (
          <p>Loading...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <InputField
              label="Instagram"
              name="masjid_instagram_url"
              value={form.masjid_instagram_url}
              onChange={handleChange}
              placeholder="Masukkan link"
            />
            <InputField
              label="Whatsapp"
              name="masjid_whatsapp_url"
              value={form.masjid_whatsapp_url}
              onChange={handleChange}
              placeholder="Masukkan link"
            />
            <InputField
              label="Youtube"
              name="masjid_youtube_url"
              value={form.masjid_youtube_url}
              onChange={handleChange}
              placeholder="Masukkan link"
            />
            <InputField
              label="Facebook"
              name="masjid_facebook_url"
              value={form.masjid_facebook_url}
              onChange={handleChange}
              placeholder="Masukkan link"
            />
            <InputField
              label="Tiktok"
              name="masjid_tiktok_url"
              value={form.masjid_tiktok_url}
              onChange={handleChange}
              placeholder="Masukkan link"
            />
            <InputField
              label="Grup WhatsApp Ikhwan"
              name="masjid_whatsapp_group_ikhwan_url"
              value={form.masjid_whatsapp_group_ikhwan_url}
              onChange={handleChange}
              placeholder="Link grup ikhwan"
            />
            <InputField
              label="Grup WhatsApp Akhwat"
              name="masjid_whatsapp_group_akhwat_url"
              value={form.masjid_whatsapp_group_akhwat_url}
              onChange={handleChange}
              placeholder="Link grup akhwat"
            />

            <div className="md:col-span-1 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg text-white font-medium transition"
                style={{ backgroundColor: theme.primary }}
              >
                {saving ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
