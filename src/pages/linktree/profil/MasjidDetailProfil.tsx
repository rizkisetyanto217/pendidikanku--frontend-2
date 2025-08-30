// MasjidProfileDetail.tsx
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate, useParams } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import parse from "html-react-parser";
import cleanTranscriptHTML from "@/constants/cleanTransciptHTML"; // ← pakai util clean HTML

export default function MasjidProfileDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["masjid-profile-detail", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/masjid-profiles/by-slug/${slug}`);
      return res.data.data as {
        masjid_profile_founded_year?: number;
        masjid_profile_description?: string;
      };
    },
    enabled: !!slug,
  });

  const InfoItem = ({
    label,
    content,
  }: {
    label: string;
    content: React.ReactNode;
  }) => (
    <div className="mb-4">
      <p style={{ color: theme.quaternary, fontWeight: 600 }}>{label}</p>
      <div
        className="text-base leading-relaxed"
        style={{ color: theme.black1 }}
      >
        {content}
      </div>
    </div>
  );

  // Bersihkan HTML sebelum render
  const cleanedDesc = data?.masjid_profile_description
    ? cleanTranscriptHTML(data.masjid_profile_description)
    : "";

  return (
    <div className="min-h-screen rounded-md">
      <div className="mx-auto">
        <PageHeaderUser
          title="Profil Lembaga"
          onBackClick={() => {
            if (window.history.length > 1) navigate(-1);
          }}
        />

        <div className="p-2">
          {isLoading ? (
            <p>Memuat data…</p>
          ) : isError ? (
            <p>Gagal memuat data profil masjid.</p>
          ) : (
            <>
              <InfoItem
                label="Tahun Didirikan"
                content={data?.masjid_profile_founded_year ?? "-"}
              />
              <InfoItem
                label="Deskripsi"
                content={cleanedDesc ? parse(cleanedDesc) : "-"}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
