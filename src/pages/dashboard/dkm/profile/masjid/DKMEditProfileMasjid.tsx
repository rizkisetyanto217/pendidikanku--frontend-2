import React, { useState } from "react";
import RichEditor from "@/components/common/main/RichEditor";
import InputField from "@/components/common/main/InputField";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/home/PageHeaderDashboard";

export default function DKMEditProfilMasjid() {
  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState("");
  const [latarBelakang, setLatarBelakang] = useState("");
  const [lainnya, setLainnya] = useState("");
  const [tahunDidirikan, setTahunDidirikan] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [ttdFile, setTtdFile] = useState<File | null>(null);
  const [stempelFile, setStempelFile] = useState<File | null>(null);

  const { user } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masjidId) {
      toast.error("Masjid ID tidak ditemukan");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("masjid_profile_story", latarBelakang);
      formData.append("masjid_profile_visi", visi);
      formData.append("masjid_profile_misi", misi);
      formData.append("masjid_profile_other", lainnya);
      formData.append("masjid_profile_founded_year", tahunDidirikan);

      if (logoFile) formData.append("logo", logoFile);
      if (ttdFile) formData.append("ttd_ketua", ttdFile);
      if (stempelFile) formData.append("stempel", stempelFile);

      await axios.put(`/api/a/masjid-profiles/${masjidId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("Profil Masjid berhasil diperbarui");
      navigate("/dkm/profil-masjid");
    } catch (error) {
      console.error("❌ Gagal simpan profil:", error);
      toast.error("Gagal menyimpan profil masjid");
    }
  };

  return (
    <>
      <PageHeader title="Edit Profil Masjid" backTo="/dkm/profil-masjid" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rich text editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RichEditor
            label="Visi"
            value={visi}
            onChange={setVisi}
            placeholder="Masukkan deskripsi"
          />
          <RichEditor
            label="Latar Belakang"
            value={latarBelakang}
            onChange={setLatarBelakang}
            placeholder="Masukkan deskripsi"
          />
          <RichEditor
            label="Misi"
            value={misi}
            onChange={setMisi}
            placeholder="Masukkan deskripsi"
          />
          <RichEditor
            label="Lainnya"
            value={lainnya}
            onChange={setLainnya}
            placeholder="Masukkan deskripsi"
          />
        </div>

        {/* Tahun */}
        <InputField
          label="Tahun Didirikan"
          name="tahun_didirikan"
          type="number"
          value={tahunDidirikan}
          onChange={(e) => setTahunDidirikan(e.target.value)}
          placeholder="Contoh: 1999"
        />

        {/* Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Logo Masjid (.png / .jpg)"
            name="logo_masjid"
            type="file"
            onChange={(e) =>
              setLogoFile((e.target as HTMLInputElement).files?.[0] || null)
            }
          />
          <InputField
            label="TTD Ketua DKM (.png / .jpg)"
            name="ttd_ketua"
            type="file"
            onChange={(e) =>
              setTtdFile((e.target as HTMLInputElement).files?.[0] || null)
            }
          />
          <InputField
            label="Stempel Masjid (.png / .jpg)"
            name="stempel_masjid"
            type="file"
            onChange={(e) =>
              setStempelFile((e.target as HTMLInputElement).files?.[0] || null)
            }
          />
        </div>

        {/* Submit */}
        <div className="flex justify-between items-center pt-4">
          <span className="text-sm text-muted-foreground">
            Butuh dibuatkan Logo, Profil dan Stempel Masjid?
          </span>
          <Button type="submit">Simpan Data</Button>
        </div>
      </form>
    </>
  );
}
