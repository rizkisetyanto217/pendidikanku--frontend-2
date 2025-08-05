import { useLocation, useNavigate } from "react-router-dom";
import FormattedDate from "@/constants/formattedDate";
import StatusBadge from "@/components/common/main/MainStatusBadge";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { Button } from "@/components/ui/button";
import ShimmerImage from "@/components/common/main/ShimmerImage";

interface PostDetail {
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

export default function DKMDetailPost() {
  const location = useLocation();
  const navigate = useNavigate();
  const post = location.state as PostDetail | undefined;

  if (!post) {
    return <div className="p-4 text-red-600">Post tidak ditemukan</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Detail Post"
        backTo="/dkm/post"
        actionButton={{
          label: "Edit Post",
          to: "/dkm/post/tambah-edit",
          state: post,
        }}
      />

      {/* Gambar dan Deskripsi */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Gambar di kiri */}
        {post.post_image_url && (
          <ShimmerImage
            src={post.post_image_url}
            alt={post.post_title}
            className="w-full lg:w-72 h-auto rounded shadow"
            shimmerClassName="rounded"
          />
        )}

        {/* Konten di kanan */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{post.post_title}</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <FormattedDate value={post.post_created_at} /> •{" "}
            {post.post_theme?.post_theme_name || "Tanpa Tema"}
          </div>

          <div className="mt-2">
            <StatusBadge
              text={post.post_is_published ? "Aktif" : "Draft"}
              variant={post.post_is_published ? "success" : "warning"}
            />
          </div>

          <div className="whitespace-pre-line text-base leading-relaxed mt-4">
            {post.post_content}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            <span className="font-semibold">Disukai:</span> {post.like_count} Jamaah
          </div>
        </div>
      </div>
    </div>
  );
}
