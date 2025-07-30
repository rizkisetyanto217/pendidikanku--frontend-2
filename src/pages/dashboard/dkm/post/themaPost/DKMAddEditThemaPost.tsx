import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import InputField from "@/components/common/main/InputField";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface PostTheme {
  post_theme_id: string;
  post_theme_name: string;
  post_theme_description: string;
}

export default function DKMAddEditThemaPost() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state as PostTheme | undefined;

  const { user, isLoggedIn, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill jika edit
  useEffect(() => {
    if (editData) {
      setName(editData.post_theme_name);
      setDescription(editData.post_theme_description);
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      toast.error("Nama dan deskripsi wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      if (editData) {
        // UPDATE
        await axios.put(
          `/api/a/post-themes/${editData.post_theme_id}`,
          {
            post_theme_name: name,
            post_theme_description: description,
            post_theme_masjid_id: masjidId,
          },
          { withCredentials: true }
        );
        toast.success("Tema berhasil diperbarui");
      } else {
        // CREATE
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
      }

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
      <PageHeader
        title={editData ? "Edit Tema Post" : "Tambah Tema Post"}
        backTo="/dkm/post-tema"
      />

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
            {loading
              ? editData
                ? "Menyimpan Perubahan..."
                : "Menyimpan..."
              : editData
                ? "Update Tema"
                : "Simpan Tema"}
          </Button>
        </div>
      </form>
    </>
  );
}
