import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import SimpleTable from "@/components/common/main/SimpleTable";
import StatusBadge from "@/components/common/main/MainStatusBadge";
import FormattedDate from "@/constants/formattedDate";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ActionEditDelete from "@/components/common/main/MainActionEditDelete";
import ShimmerImage from "@/components/common/main/ShimmerImage";

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
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const { user, isLoggedIn, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0]; // ✅ fix ini

  const {
    data: posts,
    isLoading,
    isError,
  } = useQuery<Post[]>({
    queryKey: ["posts", masjidId], // ✅ ganti dari masjidSlug ke masjidId
    enabled: !!masjidId && isLoggedIn && !isUserLoading,
    queryFn: async () => {
      const res = await axios.get(`/api/a/posts/by-masjid`, {
        withCredentials: true,
      });
      console.log("✅ DKM Post", res.data.data);
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const columns = [
    "No",
    "Gambar",
    "Judul",
    "Tema",
    "Tanggal",
    "Status",
    "Suka",
    "Aksi", // ✅ Tambahkan kolom aksi
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
        onEdit={() =>
          navigate(`/dkm/post/tambah-edit`, {
            state: post,
          })
        }
        onDelete={() => {
          // implement delete confirmation/modal or handler here
          console.log("🗑️ Delete post:", post.post_id);
        }}
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
    </>
  );
}
