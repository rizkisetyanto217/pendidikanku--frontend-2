import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import FormattedDate from "@/constants/formattedDate";

interface PostTheme {
  post_theme_id: string;
  post_theme_name: string;
  post_theme_description: string;
  post_theme_created_at: string;
}

export default function DKMDetailThemaPost() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const data = location.state as PostTheme | undefined;

  if (!data) {
    return (
      <div className="p-4 text-red-600 font-semibold">
        Data tema tidak ditemukan.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Detail Tema Post"
        backTo="/dkm/post-tema"
        actionButton={{
          label: "Edit",
          onClick: () =>
            navigate("/dkm/post-tema/tambah-edit", { state: data }),
        }}
      />

      <div
        className="p-6 max-w-2xl rounded-lg shadow"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
            Nama Tema
          </h2>
          <p>{data.post_theme_name}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
            Deskripsi
          </h2>
          <p>{data.post_theme_description}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
            Tanggal Dibuat
          </h2>
          <p>
            <FormattedDate value={data.post_theme_created_at} />
          </p>
        </div>
      </div>
    </>
  );
}
