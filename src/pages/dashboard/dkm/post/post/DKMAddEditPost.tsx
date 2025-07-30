import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import InputField from "@/components/common/main/InputField";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface PostTheme {
  post_theme_id: string;
  post_theme_name: string;
}

interface Post {
  post_id: string;
  post_title: string;
  post_content: string;
  post_image_url: string | null;
  post_theme: {
    post_theme_id: string;
    post_theme_name: string;
  };
}

export default function DKMAddEditPost() {
  const navigate = useNavigate();
  const location = useLocation();
  const post = location.state as Post | undefined;
  const { user } = useCurrentUser();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [themeId, setThemeId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Prefill untuk edit
  useEffect(() => {
    if (post) {
      setTitle(post.post_title);
      setContent(post.post_content);
      setThemeId(post.post_theme?.post_theme_id || "");
    }
  }, [post]);

  const { data: themes, isLoading: isLoadingThemes } = useQuery<PostTheme[]>({
    queryKey: ["post-themes"],
    queryFn: async () => {
      const res = await axios.get("/api/a/post-themes/by-masjid", {
        withCredentials: true,
      });
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeId) return toast.error("Silakan pilih tema terlebih dahulu");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("post_title", title);
      formData.append("post_content", content);
      formData.append("post_theme_id", themeId);
      formData.append("post_is_published", "true");
      if (imageFile) {
        formData.append("post_image_url", imageFile);
      }

      if (post?.post_id) {
        await axios.put(`/api/a/posts/${post.post_id}`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Post berhasil diperbarui");
      } else {
        await axios.post("/api/a/posts", formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Post berhasil ditambahkan");
      }

      navigate("/dkm/post");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title={post ? "Edit Post" : "Tambah Post"}
        backTo="/dkm/post"
      />

      <form onSubmit={handleSubmit} className="space-y-6 p-4 max-w-xl">
        <InputField
          label="Judul Post"
          name="post_title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Fiqh Syafi'i 2"
        />

        <InputField
          label="Isi Konten"
          name="post_content"
          type="textarea"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Isi konten post"
        />

        <div>
          <label className="block mb-1 font-medium text-sm">
            Pilih Tema Post
          </label>
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className="w-full border rounded p-2"
            required
          >
            <option value="">-- Pilih Tema --</option>
            {themes?.map((theme) => (
              <option key={theme.post_theme_id} value={theme.post_theme_id}>
                {theme.post_theme_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-sm">
            Upload Gambar (opsional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageFile(e.target.files ? e.target.files[0] : null)
            }
          />
        </div>

        <Button type="submit" disabled={loading || isLoadingThemes}>
          {loading
            ? post
              ? "Menyimpan perubahan..."
              : "Menyimpan..."
            : post
              ? "Simpan Perubahan"
              : "Simpan Post"}
        </Button>
      </form>
    </>
  );
}
