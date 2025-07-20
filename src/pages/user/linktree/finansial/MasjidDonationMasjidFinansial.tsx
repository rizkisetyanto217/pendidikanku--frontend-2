import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

interface Masjid {
  masjid_id: string;
  masjid_name: string;
  masjid_slug: string;
  masjid_location?: string;
}

export default function DonationMasjid() {
  const [masjidDonation, setMasjidDonation] = useState(0);
  const [masjidkuDonation, setMasjidkuDonation] = useState(0);

  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const {
    data: masjidData,
    isLoading,
    isError,
  } = useQuery<Masjid>({
    queryKey: ["masjid-detail", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/masjids/${slug}`);
      return res.data?.data;
    },
    enabled: !!slug,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const formatCurrency = (value: number) =>
    `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;

  const handleCurrencyInput =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^\d]/g, "");
      setter(Math.max(Number(rawValue), 0));
    };

  const handleSubmit = () => {
    navigate(
      `/masjid/${masjidData?.masjid_slug}/donasi/konfirmasi?masjid_id=${masjidData?.masjid_id}&masjid=${masjidDonation}&masjidku=${masjidkuDonation}`
    );
  };

  if (isLoading || !masjidData) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">Gagal memuat data.</div>;

  return (
    <>
      <PageHeaderUser
        title="Donasi Saya"
        onBackClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate(`/masjid/${masjidData.masjid_slug}`);
          }
        }}
      />

      {/* Donasi Masjid */}
      <section className="space-y-2">
        <div className="max-w-md mx-auto">
          <p
            className="font-semibold text-sm md:text-base mb-2"
            style={{ color: themeColors.success1 }}
          >
            Donasi Masjid
          </p>
          <input
            inputMode="numeric"
            value={formatCurrency(masjidDonation)}
            onChange={handleCurrencyInput(setMasjidDonation)}
            className="w-full p-2 border rounded text-sm md:text-base text-right mb-2"
            style={{
              backgroundColor: themeColors.white1,
              color: themeColors.black1,
              borderColor: themeColors.silver1,
            }}
          />
          <p
            className="text-xs md:text-sm"
            style={{ color: themeColors.silver2 }}
          >
            100% dana donasi akan diperuntukkan untuk operasional Masjid.
          </p>
        </div>
      </section>

      {/* Dukungan Masjidku */}
      <section className="space-y-2">
        <div className="max-w-md mx-auto">
          <p
            className="font-semibold text-sm md:text-base mb-2"
            style={{ color: themeColors.quaternary }}
          >
            Dukungan untuk Masjidku (opsional)
          </p>
          <input
            inputMode="numeric"
            value={formatCurrency(masjidkuDonation)}
            onChange={handleCurrencyInput(setMasjidkuDonation)}
            className="w-full p-2 border rounded text-sm md:text-base text-right mb-2"
            style={{
              backgroundColor: themeColors.white1,
              color: themeColors.black1,
              borderColor: themeColors.silver1,
            }}
          />
          <p
            className="text-xs md:text-sm mb-2"
            style={{ color: themeColors.silver2 }}
          >
            Diperuntukkan untuk operasional dan pengembangan proyek Masjidku.
          </p>
          <a
            href="#"
            className="text-sm md:text-base underline flex items-center space-x-1"
            style={{ color: themeColors.silver2 }}
          >
            <span>→</span>
            <span>Tentang Projek Masjidku</span>
          </a>
        </div>
      </section>

      {/* Tombol Aksi */}
      <div
        className="fixed bottom-0 left-0 w-full border-t shadow-md px-4 py-4 flex flex-col items-center space-y-2"
        style={{ backgroundColor: themeColors.white1 }}
      >
        <button
          className="w-full max-w-xl flex justify-between items-center font-medium px-4 py-2 rounded text-sm md:text-base"
          style={{
            backgroundColor: themeColors.quaternary,
            color: themeColors.white1,
          }}
        >
          <span>Lihat riwayat donasi saya</span>
          <span>›</span>
        </button>

        <button
          onClick={handleSubmit}
          className="w-full py-3 max-w-xl rounded font-semibold text-sm md:text-base"
          style={{
            backgroundColor: themeColors.primary,
            color: themeColors.white1,
          }}
        >
          Lanjut
        </button>
      </div>
    </>
  );
}
