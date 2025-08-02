import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import RichEditor from "@/components/common/main/RichEditor";
import InputField from "@/components/common/main/InputField";
import CommonActionButton from "@/components/common/main/CommonActionButton";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import axios from "@/lib/axios";
import FileInputField from "@/components/common/main/FileInputField";

export default function DKMEditProfilMasjid() {
  const { user } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [tahunDidirikan, setTahunDidirikan] = useState("");

  // File + Preview state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [ttdFile, setTtdFile] = useState<File | null>(null);
  const [stempelFile, setStempelFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [ttdPreview, setTtdPreview] = useState<string | null>(null);
  const [stempelPreview, setStempelPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data } = useQuery({
    queryKey: ["masjid-profile", masjidId],
    queryFn: async () => {
      const res = await axios.get(`/public/masjid-profiles/${masjidId}`);
      return res.data.data;
    },
    enabled: !!masjidId,
  });

  useEffect(() => {
    if (data) {
      setDescription(data.masjid_profile_description || "");
      setTahunDidirikan(
        data.masjid_profile_founded_year
          ? data.masjid_profile_founded_year.toString()
          : ""
      );
      // Set preview awal dari API jika belum diganti
      if (!logoPreview) setLogoPreview(data.masjid_profile_logo_url);
      if (!ttdPreview) setTtdPreview(data.masjid_profile_ttd_ketua_dkm_url);
      if (!stempelPreview) setStempelPreview(data.masjid_profile_stamp_url);
    }
  }, [data]);

  const handleImageChange =
    (
      fileSetter: (file: File | null) => void,
      previewSetter: (url: string | null) => void
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      fileSetter(file);
      previewSetter(file ? URL.createObjectURL(file) : null);
    };

  const renderImagePreview = (label: string, url?: string | null) =>
    url ? (
      <div className="mt-2">
        <p className="text-xs text-muted-foreground mb-1">
          Gambar {label} Saat Ini:
        </p>
        <img
          src={url}
          alt={`Gambar ${label}`}
          className="rounded-md w-full max-h-40 object-contain border"
        />
      </div>
    ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("masjid_profile_description", description);
      formData.append("masjid_profile_founded_year", tahunDidirikan);

      if (logoFile) formData.append("masjid_profile_logo_url", logoFile);
      if (ttdFile) formData.append("masjid_profile_ttd_ketua_dkm_url", ttdFile);
      if (stempelFile) formData.append("masjid_profile_stamp_url", stempelFile);

      const res = await axios.put("/api/a/masjid-profiles", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("Profil Masjid berhasil diperbarui");
      window.location.href = "/dkm/profil-masjid";
    } catch (error) {
      console.error("❌ Gagal simpan profil:", error);
      toast.error("Gagal menyimpan profil masjid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Edit Profil Masjid" backTo="/dkm/profil-masjid" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <RichEditor
          label="Deskripsi / Profil Masjid"
          value={description}
          onChange={setDescription}
        />
        <InputField
          label="Tahun Didirikan"
          name="tahun_didirikan"
          type="number"
          value={tahunDidirikan}
          onChange={(e) => setTahunDidirikan(e.target.value)}
          placeholder="Contoh: 1999"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FileInputField
              label="Logo Masjid (.png / .jpg)"
              name="logo_masjid"
              onChange={handleImageChange(setLogoFile, setLogoPreview)}
            />
            {renderImagePreview("Logo", logoPreview)}
          </div>
          <div>
            <FileInputField
              label="TTD Ketua DKM (.png / .jpg)"
              name="ttd_ketua"
              onChange={handleImageChange(setTtdFile, setTtdPreview)}
            />
            {renderImagePreview("TTD", ttdPreview)}
          </div>
          <div>
            <FileInputField
              label="Stempel Masjid (.png / .jpg)"
              name="stempel_masjid"
              onChange={handleImageChange(setStempelFile, setStempelPreview)}
            />
            {renderImagePreview("Stempel", stempelPreview)}
          </div>
        </div>
        <div className="flex justify-between items-center pt-4">
          <span className="text-sm text-muted-foreground">
            Butuh dibuatkan Logo, Profil dan Stempel Masjid?
          </span>
          <CommonActionButton
            type="submit"
            text={isSubmitting ? "Menyimpan..." : "Simpan Data"}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </>
  );
}
