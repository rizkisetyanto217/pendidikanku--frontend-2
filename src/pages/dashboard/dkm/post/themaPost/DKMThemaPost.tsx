import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import FormattedDate from "@/constants/formattedDate";
import SimpleTable from "@/components/common/main/SimpleTable";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/common/home/ConfirmModal"; // pastikan path sesuai strukturmu
import { useState } from "react";

interface PostTheme {
  post_theme_id: string;
  post_theme_name: string;
  post_theme_description: string;
  post_theme_masjid_id: string;
  post_theme_created_at: string;
}

export default function DKMThemaPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isLoggedIn, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];

  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: themes,
    isLoading,
    isError,
  } = useQuery<PostTheme[]>({
    queryKey: ["post-themes", masjidId],
    enabled: !!masjidId && isLoggedIn && !isUserLoading,
    queryFn: async () => {
      const res = await axios.get("/api/a/post-themes/by-masjid", {
        withCredentials: true,
      });
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleDelete = async () => {
    if (!selectedDeleteId) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/api/a/post-themes/${selectedDeleteId}`, {
        withCredentials: true,
      });

      toast.success("Tema berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["post-themes", masjidId] });
      setShowConfirm(false);
      setSelectedDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus tema");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = ["No", "Nama Tema", "Deskripsi", "Tanggal Dibuat", "Aksi"];

  const rows =
    themes?.map((item, i) => [
      i + 1,
      item.post_theme_name,
      item.post_theme_description,
      <FormattedDate value={item.post_theme_created_at} />,
      <ActionEditDelete
        onEdit={() =>
          navigate("/dkm/post-tema/tambah-edit", {
            state: item,
          })
        }
        onDelete={() => {
          setSelectedDeleteId(item.post_theme_id);
          setShowConfirm(true);
        }}
      />,
    ]) ?? [];

  return (
    <>
      <PageHeader
        title="Tema Post Masjid"
        actionButton={{
          label: "Tambah Tema",
          to: "/dkm/post-tema/tambah-edit",
        }}
      />

      {isUserLoading || isLoading ? <p>Loading...</p> : null}
      {isError && <p className="text-red-500">Gagal memuat data.</p>}
      {!isLoading && !isError && (
        <SimpleTable
          columns={columns}
          rows={rows}
          onRowClick={(i) =>
            navigate(`/dkm/post-tema/detail/${themes![i].post_theme_id}`, {
              state: themes![i],
            })
          }
        />
      )}

      {/* 🔽 Modal konfirmasi hapus */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Hapus Tema"
        message="Apakah Anda yakin ingin menghapus tema ini?"
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={isDeleting}
      />
    </>
  );
}
