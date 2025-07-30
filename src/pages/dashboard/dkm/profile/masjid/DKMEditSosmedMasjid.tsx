import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "@/components/common/main/InputField";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import api from "@/lib/axios";
import { useCurrentUser } from "@/hooks/useCurrentUser"; // ⬅️ Ambil dari cookie

interface MasjidData {
  masjid_instagram_url: string;
  masjid_whatsapp_url: string;
  masjid_youtube_url: string;
}

export default function DkmEditSosmedProfile() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const location = useLocation();
  const navigate = useNavigate();

  const { user, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];

  const [form, setForm] = useState<MasjidData>({
    masjid_instagram_url: "",
    masjid_whatsapp_url: "",
    masjid_youtube_url: "",
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

    const state = location.state as {
      instagram?: string;
      whatsapp?: string;
      youtube?: string;
    };

    if (!state) {
      alert("Data sosial media tidak tersedia.");
      navigate("/dkm/profil-masjid");
      return;
    }

    setForm({
      masjid_instagram_url: state.instagram || "",
      masjid_whatsapp_url: state.whatsapp || "",
      masjid_youtube_url: state.youtube || "",
    });

    setLoading(false);
  }, [isUserLoading, masjidId, location.state, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masjidId) return alert("ID masjid tidak ditemukan.");

    setSaving(true);
    try {
      const res = await api.put(`/api/a/masjids/${masjidId}`, form, {
        withCredentials: true,
      });
      alert(res.data.message || "Data berhasil disimpan.");
      navigate("/dkm/profil-masjid");
    } catch (err) {
      console.error("❌ Gagal simpan:", err);
      alert("Terjadi kesalahan saat menyimpan data.");
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
            <div className="md:col-span-2">
              <InputField
                label="Youtube"
                name="masjid_youtube_url"
                value={form.masjid_youtube_url}
                onChange={handleChange}
                placeholder="Masukkan link"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
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
