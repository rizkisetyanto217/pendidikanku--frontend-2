// MasjidProfileDetail.tsx
import PageHeader from "@/components/common/PageHeader";
import { useNavigate } from "react-router-dom";

export default function MasjidProfileDetail() {
  const navigate = useNavigate();

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
      <p className="text-sky-600 font-semibold">{label}</p>
      <p className="text-gray-800 text-sm">{content}</p>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Profil Lembaga"
          onBackClick={() => {
            if (window.history.length > 1) navigate(-1);
          }}
        />

        <div className="mt-4">
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
