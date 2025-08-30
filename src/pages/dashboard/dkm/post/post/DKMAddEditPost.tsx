// src/pages/dkm/post/DKMAddEditPost.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useHtmlDarkMode from "@/hooks/useHTMLThema"; // ✅ pakai hook baru
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import InputField from "@/components/common/main/InputField";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { pickTheme, ThemeName, type Palette } from "@/constants/thema"; // ✅ import ThemeName + Palette
import ShimmerImage from "@/components/common/main/ShimmerImage";
import RichEditor from "@/components/common/main/RichEditor";

interface PostTheme {
  post_theme_id: string;
  post_theme_name: string;
}

interface Post {
  post_id: string;
  post_title: string;
  post_content: string;
  post_image_url: string | null;
  post_theme: PostTheme;
}

export default function DKMAddEditPost() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];

  const post = location.state as Post | undefined;

  const { isDark, themeName } = useHtmlDarkMode();
  const theme: Palette = pickTheme(themeName as ThemeName, isDark);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [themeId, setThemeId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.post_title);
      setContent(post.post_content);
      setThemeId(post.post_theme?.post_theme_id || "");
      setImagePreviewUrl(post.post_image_url || null);
    }
  }, [post]);

  const { data: themes = [], isLoading: isLoadingThemes } = useQuery<
    PostTheme[]
  >({
    queryKey: ["post-themes"],
    queryFn: async () => {
      const res = await axios.get("/api/a/post-themes/by-masjid", {
        withCredentials: true,
      });
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!themeId) return toast.error("Silakan pilih tema terlebih dahulu");
    if (!masjidId) return toast.error("Masjid ID tidak ditemukan");

    const formData = new FormData();
    formData.append("post_title", title);
    formData.append("post_content", content);
    formData.append("post_theme_id", themeId);
    formData.append("post_is_published", "true");
    if (imageFile) formData.append("post_image_url", imageFile);

    try {
      setLoading(true);

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

      queryClient.invalidateQueries({ queryKey: ["posts", masjidId] });
      navigate("/dkm/post");
    } catch (error) {
      console.error(error);
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

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-4 max-w-5xl"
        encType="multipart/form-data"
      >
        {/* Form Kiri */}
        <div className="space-y-6">
          <InputField
            label="Judul Post"
            name="post_title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Fiqh Syafi'i 2"
          />

          <RichEditor
            label="Isi Konten"
            value={content}
            onChange={setContent}
            placeholder="Isi konten post"
          />

          <div>
            <label
              className="block mb-1 font-medium text-sm"
              style={{ color: theme.black1 }}
            >
              Pilih Tema Post
            </label>
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm focus:outline-none"
              style={{
                backgroundColor: theme.white2,
                color: theme.black1,
                border: `1px solid ${theme.silver1}`,
              }}
              required
              disabled={isLoadingThemes}
            >
              <option value="">-- Pilih Tema --</option>
              {themes.map((t) => (
                <option key={t.post_theme_id} value={t.post_theme_id}>
                  {t.post_theme_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Kanan */}
        <div className="space-y-6">
          <div className="space-y-1">
            <label
              className="text-sm font-medium"
              style={{ color: theme.black1 }}
            >
              Upload Gambar Post
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  setImageFile(file);
                  setImagePreviewUrl(URL.createObjectURL(file));
                }
              }}
              className="block w-full text-sm rounded px-3 py-2"
              style={{
                backgroundColor: theme.white2,
                color: theme.black1,
                border: `1px solid ${theme.silver1}`,
              }}
            />

            {imagePreviewUrl && (
              <ShimmerImage
                src={imagePreviewUrl}
                alt="Preview Gambar"
                className="w-full max-w-xs object-cover rounded mt-2"
                shimmerClassName="rounded"
              />
            )}
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
        </div>
      </form>
    </>
  );
}
