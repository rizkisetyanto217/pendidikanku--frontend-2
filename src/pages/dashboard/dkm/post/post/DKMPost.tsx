import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import SimpleTable from "@/components/common/main/SimpleTable";
import StatusBadge from "@/components/common/main/MainStatusBadge";
import FormattedDate from "@/constants/formattedDate";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import ConfirmModal from "@/components/common/home/ConfirmModal"; // 🆕 import

interface Post {
  post_id: string;
  post_title: string;
  post_content: string;
  post_image_url: string | null;
  post_is_published: boolean;
  post_type: string;
  post_created_at: string;
  like_count: number;
  is_liked_by_user: boolean;
  post_theme: {
    post_theme_name: string;
  };
}

export default function DKMPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const { user, isLoggedIn, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];

  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: posts,
    isLoading,
    isError,
  } = useQuery<Post[]>({
    queryKey: ["posts", masjidId],
    enabled: !!masjidId && isLoggedIn && !isUserLoading,
    queryFn: async () => {
      const res = await axios.get(`/api/a/posts/by-masjid`, {
        withCredentials: true,
      });
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
      setIsDeleting(true);
      await axios.delete(`/api/a/posts/${postToDelete.post_id}`, {
        withCredentials: true,
      });
      queryClient.invalidateQueries({ queryKey: ["posts", masjidId] });
    } catch (err) {
      console.error("❌ Delete failed", err);
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  const columns = [
    "No",
    "Gambar",
    "Judul",
    "Tema",
    "Tanggal",
    "Status",
    "Suka",
    "Aksi",
  ];

  const rows =
    posts?.map((post, i) => [
      i + 1,
      <ShimmerImage
        src={post.post_image_url ?? "/mock/kajian.jpg"}
        alt="Post"
        className="w-12 h-12 object-cover rounded"
        shimmerClassName="rounded"
      />,
      <span className="font-medium">{post.post_title}</span>,
      post.post_theme?.post_theme_name || "-",
      <FormattedDate value={post.post_created_at} />,
      <StatusBadge
        text={post.post_is_published ? "Dipublikasikan" : "Draft"}
        variant={post.post_is_published ? "success" : "warning"}
      />,
      <span>{post.like_count}</span>,
      <ActionEditDelete
        onEdit={() => navigate(`/dkm/post/tambah-edit`, { state: post })}
        onDelete={() => setPostToDelete(post)} // ✅ trigger modal
      />,
    ]) ?? [];

  return (
    <>
      <PageHeader
        title="Post Masjid ini"
        actionButton={{ label: "Tambah Post", to: "/dkm/post/tambah-edit" }}
      />

      {isUserLoading || isLoading ? <p>Loading...</p> : null}
      {isError && <p className="text-red-500">Gagal memuat data.</p>}

      {!isLoading && !isError && (
        <SimpleTable
          columns={columns}
          rows={rows}
          onRowClick={(i) =>
            navigate(`/dkm/post/detail/${posts![i].post_id}`, {
              state: posts![i],
            })
          }
        />
      )}

      <ConfirmModal
        isOpen={!!postToDelete}
        title="Hapus Post?"
        message={`Apakah kamu yakin ingin menghapus post "${postToDelete?.post_title}"? Tindakan ini tidak bisa dibatalkan.`}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmText="Hapus"
        cancelText="Batal"
      />
    </>
  );
}
