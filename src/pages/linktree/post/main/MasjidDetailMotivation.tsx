import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import FormattedDate from "@/constants/formattedDate";

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
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
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
          backgroundColor: isDark ? theme.white2 : theme.white1,
          color: theme.black2,
          border: `1px solid ${theme.silver1}`,
        }}
      >
        <p className="text-sm font-semibold">💝 Donatur:</p>
        <p className="text-base font-bold">{donation.donation_name}</p>

        <p className="text-sm mt-2" style={{ color: theme.silver4 }}>
          {donation.donation_message}
        </p>

        <FormattedDate value={donation.created_at} fullMonth />

        <p className="text-sm" style={{ color: theme.silver2 }}>
          Status: {donation.donation_status}
        </p>

        <p className="text-sm" style={{ color: theme.silver2 }}>
          Jumlah Donasi: Rp{donation.donation_amount.toLocaleString("id-ID")}
        </p>
      </div>
    </>
  );
}
