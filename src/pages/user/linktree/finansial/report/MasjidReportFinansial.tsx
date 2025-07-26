import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { Tabs, TabsContent } from "@/components/common/main/Tabs";
import api from "@/lib/axios";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

const FinancialReportPage = () => {
  const [tab, setTab] = useState("recent");
  const { slug } = useParams();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  // 1. Get Masjid Data
  const { data: masjidRes, isLoading: isMasjidLoading } = useQuery({
    queryKey: ["masjid-detail", slug],
    queryFn: async () => {
      const res = await api.get(`/public/masjids/${slug}`);
      console.log("🏷️ Detail masjid berhasil:", res.data);
      return res.data;
    },
    enabled: !!slug,
  });

  const masjidId = masjidRes?.data?.masjid_id;
  const masjidName = masjidRes?.data?.masjid_name;
  console.log("🆔 masjidId:", masjidId);
  console.log("🏛️ masjidName:", masjidName);

  // 2. Get Donations
  const { data: donations, isLoading: isDonasiLoading } = useQuery({
    queryKey: ["masjid-donations", masjidId],
    queryFn: async () => {
      const res = await api.get(`/public/donations/masjid/${masjidId}`);
      console.log("📦 Data donasi:", res.data);
      return res.data;
    },
    enabled: !!masjidId,
    staleTime: 1000 * 60 * 3,
  });

  const stats = useMemo(() => {
    const total = donations?.reduce(
      (acc: number, curr: any) => acc + curr.donation_amount,
      0
    );
    const count = donations?.length || 0;
    return { total, count };
  }, [donations]);

  const renderDonationList = () => {
    if (isDonasiLoading)
      return (
        <p className="text-sm" style={{ color: themeColors.silver2 }}>
          Memuat donasi...
        </p>
      );
    if (!donations?.length)
      return (
        <p className="text-sm" style={{ color: themeColors.silver2 }}>
          Belum ada donasi
        </p>
      );

    return donations.map((item: any) => (
      <div
        key={item.donation_id}
        className="flex justify-between px-4 py-2 rounded"
        style={{ border: `1px solid ${themeColors.silver1}` }}
      >
        <p className="text-sm capitalize" style={{ color: themeColors.black1 }}>
          {item.donation_name || "Anonim"}
        </p>
        <div className="text-right text-sm">
          <p style={{ color: themeColors.black1 }}>
            Rp. {item.donation_amount.toLocaleString("id-ID")}
          </p>
          <p className="text-xs" style={{ color: themeColors.silver2 }}>
            {new Date(item.created_at).toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>
    ));
  };

  const renderMotivationMessages = () => {
    const messages = donations?.filter((d: any) => d.donation_message);
    if (!messages?.length) return null;

    return (
      <div className="space-y-2 mt-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: themeColors.primary }}
        >
          Motivasi & Doa
        </h3>
        {messages.map((d: any) => (
          <div
            key={d.donation_id}
            className="rounded p-3 space-y-2"
            style={{ border: `1px solid ${themeColors.silver1}` }}
          >
            <div className="flex justify-between items-center">
              <p
                className="text-sm font-medium"
                style={{ color: themeColors.black1 }}
              >
                {d.donation_name || "Anonim"}
              </p>
              <button
                className="text-xs"
                style={{ color: themeColors.primary }}
              >
                Bagikan
              </button>
            </div>
            <p className="text-sm" style={{ color: themeColors.silver2 }}>
              {d.donation_message}
            </p>
          </div>
        ))}
      </div>
    );
  };

  if (isMasjidLoading) {
    return (
      <p className="p-4 text-sm" style={{ color: themeColors.silver2 }}>
        Memuat data masjid...
      </p>
    );
  }

  return (
    <>
        <PageHeaderUser
          title="Laporan Keuangan"
          onBackClick={() => history.back()}
        />

        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { label: "Terbaru", value: "recent" },
            { label: "Informasi", value: "info" },
          ]}
        />

        <TabsContent value="recent" current={tab}>
          <div className="mt-4 space-y-4">
            {/* Statistik Dinamis */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded"
              style={{ border: `1px solid ${themeColors.silver1}` }}
            >
              <div>
                <p className="text-sm" style={{ color: themeColors.black1 }}>
                  Rp. {stats.total?.toLocaleString("id-ID") || 0}
                </p>
                <p className="text-xs" style={{ color: themeColors.silver2 }}>
                  {stats.count} Donatur
                </p>
              </div>
              <div className="text-2xl">📊</div>
            </div>

            {/* Donasi */}
            <div className="space-y-2">
              <h3
                className="text-sm font-semibold"
                style={{ color: themeColors.black1 }}
              >
                Donasi
              </h3>
              {renderDonationList()}
            </div>

            {/* Motivasi */}
            {renderMotivationMessages()}
          </div>
        </TabsContent>

        <TabsContent value="info" current={tab}>
          <p className="text-sm p-4" style={{ color: themeColors.silver2 }}>
            [Coming soon]
          </p>
        </TabsContent>

    </>
  );
};

export default FinancialReportPage;