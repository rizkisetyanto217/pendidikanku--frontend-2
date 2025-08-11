import React, { useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  FileDown,
  CalendarDays,
  Tag,
  Clock,
} from "lucide-react";

/* ================= Types ================ */
type FinanceSummary = {
  month: string; // "2025-08"
  total_income: number; // pemasukan bulan ini
  total_expense: number; // pengeluaran bulan ini
  ending_balance: number; // saldo akhir s/d bulan ini
};

type Transaction = {
  id: string;
  date_iso: string; // "2025-08-10T12:34:00Z"
  description: string;
  category?: string;
  amount: number; // nominal positif
  type: "income" | "expense"; // tipe transaksi
};

/* ============== Utils/format ============= */
const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium" });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

/* ========= CSV Export (client-side) ======== */
const toCSV = (rows: Transaction[]) => {
  const header = [
    "Tanggal",
    "Waktu",
    "Deskripsi",
    "Kategori",
    "Tipe",
    "Nominal",
  ];
  const lines = rows.map((t) => [
    fmtDate(t.date_iso),
    fmtTime(t.date_iso),
    `"${(t.description || "").replace(/"/g, '""')}"`,
    `"${(t.category || "-").replace(/"/g, '""')}"`,
    t.type,
    t.amount.toString(),
  ]);
  return [header, ...lines].map((r) => r.join(",")).join("\n");
};

export default function MasjidkuFinancial() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const [searchParams, setSearchParams] = useSearchParams();
  const monthParam =
    searchParams.get("month") || new Date().toISOString().slice(0, 7); // YYYY-MM
  const [month, setMonth] = useState(monthParam);

  // sync ke URL saat ganti bulan
  const onMonthChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const m = e.target.value;
    setMonth(m);
    setSearchParams((sp) => {
      sp.set("month", m);
      return sp;
    });
  };

  /* ======== Queries ======== */
  const {
    data: summaryResp,
    isLoading: loadingSummary,
    isError: errorSummary,
  } = useQuery<{ data: FinanceSummary }>({
    queryKey: ["financials-summary", slug, month],
    queryFn: async () =>
      (
        await axios.get(`/public/masjids/${slug}/financials/summary`, {
          params: { month },
        })
      ).data,
    enabled: !!slug && !!month,
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: txResp,
    isLoading: loadingTx,
    isError: errorTx,
  } = useQuery<{ data: Transaction[] }>({
    queryKey: ["financials", slug, month],
    queryFn: async () =>
      (
        await axios.get(`/public/masjids/${slug}/financials`, {
          params: { month },
        })
      ).data,
    enabled: !!slug && !!month,
    staleTime: 2 * 60 * 1000,
  });

  const summary = summaryResp?.data;
  const transactions = txResp?.data ?? [];

  const grouped = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    for (const t of transactions) {
      const key = fmtDate(t.date_iso);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    // urut tanggal terbaru dulu
    const entries = Object.entries(map).sort(
      (a, b) =>
        new Date(b[1][0]?.date_iso || 0).getTime() -
        new Date(a[1][0]?.date_iso || 0).getTime()
    );
    return entries;
  }, [transactions]);

  const handleExport = () => {
    if (!transactions.length) return;
    const blob = new Blob([toCSV(transactions)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-keuangan-${slug}-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <PageHeaderUser
        title="Laporan Keuangan"
        onBackClick={() => navigate(`/`)}
        withPaddingTop
      />

      {/* Filter Bulan + Export */}
      <div
        className="mt-2 rounded-xl border p-3 flex items-center justify-between gap-3"
        style={{ backgroundColor: theme.white1, borderColor: theme.silver1 }}
      >
        <label
          className="flex items-center gap-2 text-sm"
          style={{ color: theme.black1 }}
        >
          <CalendarDays size={18} />
          <span>Pilih Bulan</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={onMonthChange}
            className="rounded-md px-2 py-1 text-sm ring-1"
            style={{
              backgroundColor: theme.white2,
              color: theme.black1,
              borderColor: theme.white3,
            }}
          />
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:opacity-90 transition"
            style={{
              backgroundColor: theme.white2,
              color: theme.black1,
              border: `1px solid ${theme.white3}`,
            }}
          >
            <FileDown size={16} />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div
          className="rounded-xl p-3 ring-1"
          style={{
            backgroundColor: theme.white1,
            borderColor: theme.white3,
            color: theme.black1,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: theme.silver2 }}>
              Saldo Akhir
            </span>
            <Wallet size={18} />
          </div>
          <div className="text-sm font-semibold">
            {loadingSummary
              ? "..."
              : summary
                ? fmtIDR(summary.ending_balance)
                : "-"}
          </div>
        </div>

        <div
          className="rounded-xl p-3 ring-1"
          style={{
            backgroundColor: theme.white1,
            borderColor: theme.white3,
            color: theme.black1,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: theme.silver2 }}>
              Pemasukan
            </span>
            <ArrowDownCircle size={18} />
          </div>
          <div
            className="text-sm font-semibold"
            style={{ color: theme.success1 }}
          >
            {loadingSummary
              ? "..."
              : summary
                ? fmtIDR(summary.total_income)
                : "-"}
          </div>
        </div>

        <div
          className="rounded-xl p-3 ring-1"
          style={{
            backgroundColor: theme.white1,
            borderColor: theme.white3,
            color: theme.black1,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: theme.silver2 }}>
              Pengeluaran
            </span>
            <ArrowUpCircle size={18} />
          </div>
          <div
            className="text-sm font-semibold"
            style={{ color: theme.error1 }}
          >
            {loadingSummary
              ? "..."
              : summary
                ? fmtIDR(summary.total_expense)
                : "-"}
          </div>
        </div>
      </div>

      {/* Daftar Transaksi */}
      <div className="mt-4 space-y-3">
        {loadingTx && (
          <div className="text-sm" style={{ color: theme.silver2 }}>
            Memuat transaksi…
          </div>
        )}
        {errorTx && (
          <div className="text-sm" style={{ color: theme.error1 }}>
            Gagal memuat transaksi.
          </div>
        )}
        {!loadingTx && !transactions.length && (
          <div className="text-sm" style={{ color: theme.silver2 }}>
            Belum ada transaksi untuk bulan ini.
          </div>
        )}

        {grouped.map(([dateLabel, items]) => (
          <div
            key={dateLabel}
            className="rounded-xl border overflow-hidden"
            style={{
              backgroundColor: theme.white1,
              borderColor: theme.silver1,
            }}
          >
            <div
              className="px-3 py-2 text-xs font-semibold"
              style={{
                backgroundColor: theme.white2,
                color: theme.black2,
                borderBottom: `1px solid ${theme.white3}`,
              }}
            >
              {dateLabel}
            </div>

            <ul className="divide-y" style={{ borderColor: theme.white3 }}>
              {items.map((t) => {
                const positive = t.type === "income";
                return (
                  <li key={t.id} className="px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div
                          className="text-sm font-medium"
                          style={{ color: theme.black1 }}
                        >
                          {t.description}
                        </div>
                        <div
                          className="flex items-center gap-2 mt-1 text-xs"
                          style={{ color: theme.silver2 }}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Tag size={12} /> {t.category || "-"}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} /> {fmtTime(t.date_iso)}
                          </span>
                        </div>
                      </div>

                      <div
                        className="text-sm font-semibold shrink-0 text-right"
                        style={{
                          color: positive ? theme.success1 : theme.error1,
                        }}
                      >
                        {positive ? "+" : "-"}
                        {fmtIDR(t.amount)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <BottomNavbar />
    </div>
  );
}
