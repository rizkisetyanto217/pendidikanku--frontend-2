import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ pakai useParams
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeader from "@/components/common/PageHeader";

interface Masjid {
  masjid_id: string;
  masjid_name: string;
  masjid_slug: string;
  masjid_location?: string;
}

export default function DonationMasjid() {
  const [masjidDonation, setMasjidDonation] = useState(0);
  const [masjidkuDonation, setMasjidkuDonation] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const { slug } = useParams(); // ✅ ambil slug dari route param
  const navigate = useNavigate();

  const {
    data: masjidData,
    isLoading,
    isError,
  } = useQuery<Masjid>({
    queryKey: ["masjid-detail", slug],
    queryFn: async () => {
      console.log("[FETCH] Meminta ulang data masjid detail:", slug);
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
      const numericValue = Math.max(Number(rawValue), 0);
      setter(numericValue);
    };

  const handleSubmit = () => {
    if (masjidDonation < 10000) {
      setShowWarning(true);
    } else {
      navigate(
        `/masjid/${masjidData?.masjid_slug}/donasi/konfirmasi?masjid_id=${masjidData?.masjid_id}&masjid=${masjidDonation}&masjidku=${masjidkuDonation}`
      );
    }
  };

  if (isLoading || !masjidData) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">Gagal memuat data.</div>;

  return (
    <>
      <PageHeader
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
          <p className="text-emerald-700 font-semibold text-sm md:text-base mb-2">
            Donasi Masjid
          </p>
          <input
            inputMode="numeric"
            value={formatCurrency(masjidDonation)}
            onChange={(e) => {
              setShowWarning(false);
              handleCurrencyInput(setMasjidDonation)(e);
            }}
            className={`w-full p-2 border rounded text-sm md:text-base text-right mb-2 ${
              showWarning && masjidDonation < 10000 ? "border-red-500" : ""
            }`}
          />
          {showWarning && masjidDonation < 10000 && (
            <p className="text-red-600 text-xs md:text-sm mb-2">
              Minimal donasi untuk masjid adalah Rp 10.000
            </p>
          )}
          <p className="text-xs md:text-sm text-gray-600">
            100% dana donasi akan diperuntukkan untuk operasional Masjid.
          </p>
        </div>
      </section>

      {/* Dukungan Masjidku */}
      <section className="space-y-2">
        <div className="max-w-md mx-auto">
          <p className="text-sky-700 font-semibold text-sm md:text-base mb-2">
            Dukungan untuk Masjidku (opsional)
          </p>
          <input
            inputMode="numeric"
            value={formatCurrency(masjidkuDonation)}
            onChange={handleCurrencyInput(setMasjidkuDonation)}
            className="w-full p-2 border rounded text-sm md:text-base text-right mb-2"
          />
          <p className="text-xs md:text-sm text-gray-600 mb-2">
            Diperuntukkan untuk operasional dan mewujudkan proyek jangka panjang
            masjidku
          </p>
          <a
            href="#"
            className="text-sm md:text-base text-gray-600 underline flex items-center space-x-1"
          >
            <span>→</span>
            <span>Tentang Projek Masjidku</span>
          </a>
        </div>
      </section>

      {/* Tombol aksi di bagian bawah */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md px-4 py-4 flex flex-col items-center space-y-2 ">
        <button className="w-full max-w-xl flex justify-between items-center bg-sky-500 text-white font-medium px-4 py-2 rounded text-sm md:text-base">
          <span>Lihat riwayat donasi saya</span>
          <span>›</span>
        </button>

        <button
          onClick={handleSubmit}
          className={`w-full py-3 max-w-xl rounded font-semibold text-sm md:text-base ${
            masjidDonation < 10000
              ? "bg-gray-200 text-gray-500"
              : "bg-sky-600 text-white"
          }`}
        >
          Lanjut
        </button>
      </div>
    </>
  );
}
