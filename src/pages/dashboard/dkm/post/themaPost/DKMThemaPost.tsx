import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import FormattedDate from "@/constants/formattedDate";
import SimpleTable from "@/components/common/main/SimpleTable";

interface PostTheme {
  post_theme_id: string;
  post_theme_name: string;
  post_theme_description: string;
  post_theme_masjid_id: string;
  post_theme_created_at: string;
}

export default function DKMThemaPost() {
  const { user, isLoggedIn, isLoading: isUserLoading } = useCurrentUser();
  const masjidId = user?.masjid_admin_ids?.[0];

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

  const columns = ["No", "Nama Tema", "Deskripsi", "Tanggal Dibuat"];
  const rows =
    themes?.map((item, i) => [
      i + 1,
      item.post_theme_name,
      item.post_theme_description,
      <FormattedDate value={item.post_theme_created_at} />,
    ]) ?? [];

  return (
    <>
      <PageHeader
        title="Tema Post Masjid"
        actionButton={{ label: "Tambah Tema", to: "/dkm/post-tema/tambah-edit" }}
      />

      {isUserLoading || isLoading ? <p>Loading...</p> : null}
      {isError && <p className="text-red-500">Gagal memuat data.</p>}
      {!isLoading && !isError && <SimpleTable columns={columns} rows={rows} />}
    </>
  );
}
