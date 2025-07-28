import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

interface Donation {
  donation_id: string;
  donation_name: string;
  donation_message: string;
  donation_amount: number;
  donation_status: string;
  created_at: string;
}

export default function MasjidDetailDonation() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const {
    data: donation,
    isLoading,
    isError,
  } = useQuery<Donation | null>({
    queryKey: ["donationDetail", id],
    queryFn: async () => {
      const res = await axios.get(`/public/donations/by-id/${id}`);
      return res.data ?? null;
    },
    enabled: !!id,
  });

  if (isLoading) return <p className="text-center mt-10">Memuat donasi...</p>;
  if (isError || !donation)
    return (
      <p className="text-center mt-10 text-red-500">Donasi tidak ditemukan.</p>
    );

  return (
    <>
      <PageHeaderUser
        title="Detail Donasi"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div
        className="m-4 p-4 rounded-xl space-y-2"
        style={{
          backgroundColor: isDark ? themeColors.white2 : themeColors.white1,
          color: themeColors.black2,
          border: `1px solid ${themeColors.silver1}`,
        }}
      >
        <p className="text-sm font-semibold">💝 Donatur:</p>
        <p className="text-base font-bold">{donation.donation_name}</p>

        <p className="text-sm mt-2" style={{ color: themeColors.silver4 }}>
          {donation.donation_message}
        </p>

        <p className="text-sm" style={{ color: themeColors.silver2 }}>
          Tanggal:{" "}
          {new Date(donation.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <p className="text-sm" style={{ color: themeColors.silver2 }}>
          Status: {donation.donation_status}
        </p>

        <p className="text-sm" style={{ color: themeColors.silver2 }}>
          Jumlah Donasi: Rp{donation.donation_amount.toLocaleString("id-ID")}
        </p>
      </div>
    </>
  );
}
