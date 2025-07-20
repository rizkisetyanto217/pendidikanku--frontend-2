// MasjidProfileDetail.tsx
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { useNavigate } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

export default function MasjidProfileDetail() {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  // Dummy data
  const data = {
    tahun_didirikan: "2020",
    latar_belakang:
      "Masjid At-Taqwa didirikan pada tahun 2000 dengan tujuan untuk menjadi tempat ibadah untuk warga Ciracas dan sekitarnya.",
    visi: "Masjid At-Taqwa didirikan pada tahun 2000 dengan tujuan untuk menjadi tempat ibadah untuk warga Ciracas dan sekitarnya.",
    misi: "Masjid At-Taqwa didirikan pada tahun 2000 dengan tujuan untuk menjadi tempat ibadah untuk warga Ciracas dan sekitarnya.",
    lainnya:
      "Masjid At-Taqwa didirikan pada tahun 2000 dengan tujuan untuk menjadi tempat ibadah untuk warga Ciracas dan sekitarnya.",
  };

  const InfoItem = ({ label, content }: { label: string; content: string }) => (
    <div className="mb-4">
      <p style={{ color: themeColors.quaternary, fontWeight: 600 }}>{label}</p>
      <p style={{ color: themeColors.black1, fontSize: "0.875rem" }}>
        {content}
      </p>
    </div>
  );

  return (
    <div className="min-h-screenrounded-md">
      <div className="mx-auto">
        <PageHeaderUser
          title="Profil Lembaga"
          onBackClick={() => {
            if (window.history.length > 1) navigate(-1);
          }}
        />

        <div className="mt-4 p-4" style={{ backgroundColor: themeColors.white1 }}>
          <InfoItem label="Tahun Didirikan" content={data.tahun_didirikan} />
          <InfoItem label="Latar Belakang" content={data.latar_belakang} />
          <InfoItem label="Visi" content={data.visi} />
          <InfoItem label="Misi" content={data.misi} />
          <InfoItem label="Lainnya" content={data.lainnya} />
        </div>
      </div>
    </div>
  );
}
