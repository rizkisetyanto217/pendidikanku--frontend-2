import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import InputField from "@/components/common/main/InputField";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function DKMAddEditThemaPost() {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0]; // ✅ konsisten

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      toast.error("Nama dan deskripsi wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "/api/a/post-themes",
        {
          post_theme_name: name,
          post_theme_description: description,
          post_theme_masjid_id: masjidId,
        },
        { withCredentials: true }
      );
      toast.success("Tema berhasil ditambahkan");
      navigate("/dkm/post-tema");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan tema");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Tambah Tema Post" backTo="/dkm/post-tema" />

      <form onSubmit={handleSubmit} className="space-y-6 p-4 max-w-xl">
        <InputField
          label="Nama Tema"
          name="post_theme_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Kajian Fiqih"
        />

        <InputField
          label="Deskripsi Tema"
          name="post_theme_description"
          type="textarea"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tema kajian mengenai fiqih ibadah dan muamalah"
        />

        <div className="pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Tema"}
          </Button>
        </div>
      </form>
    </>
  );
}
