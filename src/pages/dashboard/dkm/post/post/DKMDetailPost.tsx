import { useLocation, useNavigate } from "react-router-dom";
import FormattedDate from "@/constants/formattedDate";
import StatusBadge from "@/components/common/main/MainStatusBadge";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { Button } from "@/components/ui/button";

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
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Detail Post"
        backTo="/dkm/post"
        actionButton={{
          label: "Edit Post",
          to: "/dkm/post/tambah-edit",
          state: post,
        }}
      />

      {post.post_image_url && (
        <img
          src={post.post_image_url}
          alt={post.post_title}
          className="w-full h-auto rounded shadow"
        />
      )}

      <div>
        <h2 className="text-2xl font-bold">{post.post_title}</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <FormattedDate value={post.post_created_at} /> •{" "}
          {post.post_theme?.post_theme_name || "Tanpa Tema"}
        </div>
        <div className="mt-2">
          <StatusBadge
            text={post.post_is_published ? "Dipublikasikan" : "Draft"}
            variant={post.post_is_published ? "success" : "warning"}
          />
        </div>
      </div>

      <div className="whitespace-pre-line text-base leading-relaxed">
        {post.post_content}
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-semibold">Disukai:</span> {post.like_count}
      </div>

      <div className="pt-4">
        <Button variant="outline" onClick={() => navigate("/dkm/post")}>
          Kembali ke Daftar Post
        </Button>
      </div>
    </div>
  );
}
