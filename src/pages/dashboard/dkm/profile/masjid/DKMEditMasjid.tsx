import React, { useEffect, useState } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import CommonActionButton from "@/components/common/main/CommonActionButton";
import ImagePreview from "@/components/common/main/ImageReview";

export default function DKMEditMasjid() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const { user } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];
  const navigate = useNavigate();

  const [namaMasjid, setNamaMasjid] = useState("");
  const [tentang, setTentang] = useState("");
  const [alamat, setAlamat] = useState("");
  const [linkMaps, setLinkMaps] = useState("");
  const [gambarFile, setGambarFile] = useState<File | null>(null);
  const [gambarPreview, setGambarPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMasjid = async () => {
      if (!masjidId) return;

      try {
        const res = await axios.get(`/public/masjids/verified/${masjidId}`);
        const data = res.data?.data;

        setNamaMasjid(data.masjid_name || "");
        setTentang(data.masjid_bio_short || "");
        setAlamat(data.masjid_location || "");
        setLinkMaps(data.masjid_google_maps_url || "");
        setGambarPreview(data.masjid_image_url || "");
      } catch (error) {
        console.error("Gagal mengambil data masjid:", error);
        toast.error("Gagal mengambil data masjid");
      }
    };

    fetchMasjid();
  }, [masjidId]);

  const handleSubmit = async () => {
    if (!masjidId) {
      toast.error("Masjid ID tidak ditemukan");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("masjid_name", namaMasjid);
    formData.append("masjid_bio_short", tentang);
    formData.append("masjid_location", alamat);
    formData.append("masjid_map_url", linkMaps);
    if (gambarFile) formData.append("image", gambarFile);

    try {
      await axios.put(`/api/a/masjids/${masjidId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("Data masjid berhasil diperbarui");

      // ✅ Navigasi dan reload halaman
      navigate("/dkm/profil-masjid", { replace: true });
      window.location.reload();
    } catch (err) {
      console.error("❌ Gagal simpan:", err);
      toast.error("Gagal menyimpan data masjid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="max-w-5xl mx-auto rounded-2xl"
      style={{
        backgroundColor: theme.white1,
        borderColor: theme.silver1,
      }}
    >
      <PageHeader title="Edit Masjid" backTo="/dkm/profil-masjid" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Masjid */}
        <div>
          <label
            className="block mb-2 text-sm font-medium"
            style={{ color: theme.black1 }}
          >
            Nama Masjid
          </label>
          <input
            type="text"
            value={namaMasjid}
            onChange={(e) => setNamaMasjid(e.target.value)}
            placeholder="Masukan nama masjid"
            className="w-full rounded-lg border px-4 py-2 text-sm"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver1,
              color: theme.black1,
            }}
          />
        </div>

        {/* Tentang Masjid */}
        <div>
          <label
            className="block mb-2 text-sm font-medium"
            style={{ color: theme.black1 }}
          >
            Tentang ( Maksimal 30 kata )
          </label>
          <textarea
            value={tentang}
            onChange={(e) => setTentang(e.target.value)}
            placeholder="Masukan tentang masjid"
            rows={4}
            className="w-full rounded-lg border px-4 py-2 text-sm"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver1,
              color: theme.black1,
            }}
          />
        </div>

        {/* Gambar Masjid */}
        <div>
          <label
            className="block mb-2 text-sm font-medium"
            style={{ color: theme.black1 }}
          >
            Profil Masjid Gambar
          </label>
          <p className="text-sm mb-2" style={{ color: theme.silver2 }}>
            File yang diizinkan berbentuk .png dan .jpg
          </p>

          <ImagePreview label="Masjid" url={gambarPreview} />

          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setGambarFile(file);
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () =>
                  setGambarPreview(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
            className="text-sm"
          />
        </div>

        {/* Alamat */}
        <div>
          <label
            className="block mb-2 text-sm font-medium"
            style={{ color: theme.black1 }}
          >
            Alamat
          </label>
          <textarea
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Masukan alamat"
            rows={4}
            className="w-full rounded-lg border px-4 py-2 text-sm"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver1,
              color: theme.black1,
            }}
          />
        </div>

        {/* Link Maps */}
        <div className="md:col-span-2">
          <label
            className="block mb-2 text-sm font-medium"
            style={{ color: theme.black1 }}
          >
            Link Alamat Google Maps (Jika ada)
          </label>
          <input
            type="text"
            value={linkMaps}
            onChange={(e) => setLinkMaps(e.target.value)}
            placeholder="Masukan link maps"
            className="w-full rounded-lg border px-4 py-2 text-sm"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver1,
              color: theme.black1,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-sm" style={{ color: theme.silver2 }}>
          Butuh dibuatkan Logo, Profil dan Stempel Masjid?
        </p>
        <CommonActionButton
          text="Simpan Data"
          onClick={handleSubmit}
          type="button"
          className="px-6 py-2 text-sm"
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}
