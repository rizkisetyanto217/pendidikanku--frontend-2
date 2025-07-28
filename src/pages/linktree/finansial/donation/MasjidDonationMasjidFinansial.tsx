import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import BottomNavbar from "@/components/common/public/ButtonNavbar";

// ========================
// Sub-komponen: Card Donasi Masjid
// ========================
function MasjidDonationCard({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div
      className="p-4 rounded-xl shadow space-y-3"
      style={{ backgroundColor: theme.white1 }}
    >
      <p
        className="font-semibold text-sm md:text-base mb-1"
        style={{ color: theme.success1 }}
      >
        Donasi Masjid
      </p>
      <input
        inputMode="numeric"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border rounded text-right text-sm md:text-base"
        style={{
          backgroundColor: theme.white3,
          color: theme.black1,
          borderColor: theme.silver1,
        }}
      />
      <p className="text-xs md:text-sm mt-1" style={{ color: theme.silver2 }}>
        100% dana akan digunakan untuk operasional Masjid.
      </p>
    </div>
  );
}

// ========================
// Sub-komponen: Card Dukungan Masjidku
// ========================
function MasjidkuDonationCard({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div
      className="p-4 rounded-xl shadow space-y-3"
      style={{ backgroundColor: theme.white1 }}
    >
      <p
        className="font-semibold text-sm md:text-base mb-1"
        style={{ color: theme.quaternary }}
      >
        Dukungan untuk Masjidku (opsional)
      </p>
      <input
        inputMode="numeric"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border rounded text-right text-sm md:text-base"
        style={{
          backgroundColor: theme.white3,
          color: theme.black1,
          borderColor: theme.silver1,
        }}
      />
      <p className="text-xs md:text-sm mt-1" style={{ color: theme.silver2 }}>
        Diperuntukkan untuk pengembangan aplikasi Masjidku.
      </p>
      <a
        href="#"
        className="text-xs underline mt-1 inline-flex items-center space-x-1"
        style={{ color: theme.silver2 }}
      >
        <span>→</span>
        <span>Tentang proyek Masjidku</span>
      </a>
    </div>
  );
}

// ========================
// Komponen Utama: Halaman Donasi
// ========================
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
  } = useQuery({
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
      <PublicNavbar masjidName="Donasi Saya" />

      {/* Section Donasi */}
      <section className="pt-20 px-4">
        <div className="max-w-xl mx-auto space-y-4">
          <MasjidDonationCard
            value={formatCurrency(masjidDonation)}
            onChange={handleCurrencyInput(setMasjidDonation)}
          />

          <MasjidkuDonationCard
            value={formatCurrency(masjidkuDonation)}
            onChange={handleCurrencyInput(setMasjidkuDonation)}
          />
        </div>
      </section>

      {/* Tombol Aksi */}
      <div className="left-0 right-0 z-40 px-4 py-4 flex flex-col items-center space-y-2">
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
          className="w-full max-w-xl py-3 rounded font-semibold text-sm md:text-base"
          style={{
            backgroundColor: themeColors.primary,
            color: themeColors.white1,
          }}
        >
          Lanjut
        </button>
      </div>

      <BottomNavbar />
    </>
  );
}
