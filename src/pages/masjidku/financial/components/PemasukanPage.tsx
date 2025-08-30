// src/pages/dkm/keuangan/PemasukanPage.tsx
// Halaman pemasukan masjid: filter bulan, statistik,
// daftar pemasukan harian, dan ekspor CSV

import React, { useState, useMemo, ChangeEvent } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { pickTheme, ThemeName, type Palette } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import {
  ArrowDownCircle,
  CalendarDays,
  Tag,
  Clock,
  FileDown,
  TrendingUp,
  DollarSign,
} from "lucide-react";

// =====================
// Types
// =====================
interface IncomeTransaction {
  id: string;
  date_iso: string;
  description: string;
  category?: string;
  amount: number;
  source?: string;
}

interface IncomeStats {
  total_income: number;
  transaction_count: number;
  avg_per_transaction: number;
  top_category: string;
}

// =====================
// Utils
// =====================
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium" });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const exportToCSV = (
  transactions: IncomeTransaction[],
  slug: string,
  month: string
) => {
  const header = [
    "Tanggal",
    "Waktu",
    "Deskripsi",
    "Kategori",
    "Sumber",
    "Nominal",
  ];
  const rows = transactions.map((t) => [
    formatDate(t.date_iso),
    formatTime(t.date_iso),
    `"${(t.description || "").replace(/"/g, '""')}"`,
    `"${(t.category || "-").replace(/"/g, '""')}"`,
    `"${(t.source || "-").replace(/"/g, '""')}"`,
    t.amount,
  ]);
  const csvContent = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pemasukan-${slug}-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// =====================
// Dummy Fallback Data
// =====================
const dummyTransactions: IncomeTransaction[] = [
  {
    id: "dummy-1",
    date_iso: new Date().toISOString(),
    description: "Donasi Jumat",
    category: "Donasi",
    amount: 150000,
    source: "Hamba Allah",
  },
  {
    id: "dummy-2",
    date_iso: new Date().toISOString(),
    description: "Sewa Aula",
    category: "Penyewaan",
    amount: 300000,
    source: "Acara Pernikahan",
  },
];

// =====================
// Sub Components
// =====================
const MonthFilter: React.FC<{
  month: string;
  onMonthChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  theme: Palette;
}> = ({ month, onMonthChange, onExport, theme }) => (
  <div
    className="mt-4 rounded-xl border p-3 flex flex-wrap gap-3 items-center justify-between"
    style={{ backgroundColor: theme.white1, borderColor: theme.silver1 }}
  >
    <label
      className="flex items-center gap-2 text-sm whitespace-nowrap"
      style={{ color: theme.black1 }}
    >
      <CalendarDays size={18} />
      Pilih Bulan
    </label>
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <input
        type="month"
        value={month}
        onChange={onMonthChange}
        className="rounded-md px-2 py-1 text-sm ring-1 flex-1 min-w-[120px]"
        style={{
          backgroundColor: theme.white2,
          color: theme.black1,
          borderColor: theme.white3,
        }}
      />
      <button
        onClick={onExport}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:opacity-90 transition w-full sm:w-auto justify-center"
        style={{
          backgroundColor: theme.white2,
          color: theme.black1,
          border: `1px solid ${theme.white3}`,
        }}
      >
        <FileDown size={16} /> Ekspor CSV
      </button>
    </div>
  </div>
);

const StatsGrid: React.FC<{
  stats?: IncomeStats;
  loading: boolean;
  theme: Palette;
}> = ({ stats, loading, theme }) => {
  const items = [
    {
      title: "Total Pemasukan",
      value: stats ? formatCurrency(stats.total_income) : "-",
      icon: <DollarSign size={20} />,
    },
    {
      title: "Jumlah Transaksi",
      value: stats?.transaction_count || "-",
      icon: <TrendingUp size={20} />,
    },
    {
      title: "Rata-rata per Transaksi",
      value: stats ? formatCurrency(stats.avg_per_transaction) : "-",
      icon: <ArrowDownCircle size={20} />,
    },
    {
      title: "Kategori Terbanyak",
      value: stats?.top_category || "-",
      icon: <Tag size={20} />,
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl p-4 ring-1"
          style={{ backgroundColor: theme.white1, borderColor: theme.white3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium truncate"
              style={{ color: theme.silver2 }}
            >
              {item.title}
            </span>
            <div style={{ color: theme.success1 }}>{item.icon}</div>
          </div>
          <div
            className="text-lg font-bold truncate"
            style={{ color: theme.success1 }}
          >
            {loading ? "..." : item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

const IncomeList: React.FC<{
  transactions: IncomeTransaction[];
  loading: boolean;
  error: boolean;
  theme: Palette;
}> = ({ transactions, loading, error, theme }) => {
  const grouped = useMemo(() => {
    const map: Record<string, IncomeTransaction[]> = {};
    transactions.forEach((t) => {
      const date = formatDate(t.date_iso);
      map[date] = [...(map[date] || []), t];
    });
    return Object.entries(map).sort(
      (a, b) =>
        new Date(b[1][0].date_iso).getTime() -
        new Date(a[1][0].date_iso).getTime()
    );
  }, [transactions]);

  if (loading)
    return (
      <p className="text-center py-8" style={{ color: theme.silver2 }}>
        Memuat data pemasukan…
      </p>
    );
  if (error)
    return (
      <p className="text-center py-8" style={{ color: theme.error1 }}>
        Gagal memuat data pemasukan.
      </p>
    );
  if (!transactions.length) {
    return (
      <div className="text-center py-8">
        <ArrowDownCircle
          size={48}
          className="mx-auto mb-3 opacity-50"
          style={{ color: theme.silver2 }}
        />
        <p className="text-sm" style={{ color: theme.silver2 }}>
          Belum ada pemasukan untuk bulan ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grouped.map(([dateLabel, items]) => {
        const dailyTotal = items.reduce((sum, t) => sum + t.amount, 0);
        return (
          <div
            key={dateLabel}
            className="rounded-xl border overflow-hidden"
            style={{
              backgroundColor: theme.white1,
              borderColor: theme.silver1,
            }}
          >
            <div
              className="px-4 py-3 flex flex-wrap items-center justify-between gap-2"
              style={{
                backgroundColor: theme.white2,
                borderBottom: `1px solid ${theme.white3}`,
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: theme.black2 }}
              >
                {dateLabel}
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: theme.success1 }}
              >
                +{formatCurrency(dailyTotal)}
              </span>
            </div>
            <ul className="divide-y" style={{ borderColor: theme.white3 }}>
              {items.map((t) => (
                <li
                  key={t.id}
                  className="px-4 py-3 flex flex-wrap justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium mb-1 truncate"
                      style={{ color: theme.black1 }}
                    >
                      {t.description}
                    </p>
                    <div
                      className="flex flex-wrap items-center gap-2 text-xs"
                      style={{ color: theme.silver2 }}
                    >
                      <span className="flex items-center gap-1">
                        <Tag size={12} /> {t.category || "Umum"}
                      </span>{" "}
                      •
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatTime(t.date_iso)}
                      </span>
                      {t.source && (
                        <>
                          {" "}
                          •{" "}
                          <span className="truncate max-w-[120px]">
                            {t.source}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <p
                    className="text-sm font-bold shrink-0"
                    style={{ color: theme.success1 }}
                  >
                    +{formatCurrency(t.amount)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

// =====================
// Main Component
// =====================
const PemasukanPage: React.FC = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const [searchParams, setSearchParams] = useSearchParams();
  const [month, setMonth] = useState(
    searchParams.get("month") || new Date().toISOString().slice(0, 7)
  );

  const onMonthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    setMonth(newMonth);
    setSearchParams((sp) => {
      sp.set("month", newMonth);
      return sp;
    });
  };

  const { data: statsResp, isLoading: loadingStats } = useQuery<{
    data: IncomeStats;
  }>({
    queryKey: ["income-stats", slug, month],
    queryFn: async () =>
      (
        await axios.get(`/public/masjids/${slug}/financials/income/stats`, {
          params: { month },
        })
      ).data,
    enabled: !!slug && !!month,
    staleTime: 120000,
  });

  const {
    data: incomeResp,
    isLoading: loadingIncome,
    isError: errorIncome,
  } = useQuery<{ data: IncomeTransaction[] }>({
    queryKey: ["income-transactions", slug, month],
    queryFn: async () =>
      (
        await axios.get(`/public/masjids/${slug}/financials/income`, {
          params: { month },
        })
      ).data,
    enabled: !!slug && !!month,
    staleTime: 120000,
  });

  // TODO: hapus dummyTransactions saat API sudah siap
  const transactions = [...(incomeResp?.data ?? []), ...dummyTransactions];

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <PageHeaderUser
        title="Data Pemasukan"
        onBackClick={() => navigate(-1)}
        withPaddingTop
      />

      <MonthFilter
        month={month}
        onMonthChange={onMonthChange}
        onExport={() => exportToCSV(transactions, slug, month)}
        theme={theme}
      />

      <StatsGrid stats={statsResp?.data} loading={loadingStats} theme={theme} />

      <section className="mt-6">
        <header className="flex items-center gap-2 mb-4">
          <ArrowDownCircle size={20} style={{ color: theme.success1 }} />
          <h2 className="text-lg font-semibold" style={{ color: theme.black1 }}>
            Riwayat Pemasukan
          </h2>
        </header>

        <IncomeList
          transactions={transactions}
          loading={loadingIncome}
          error={errorIncome}
          theme={theme}
        />
      </section>

      <BottomNavbar />
    </div>
  );
};

export default PemasukanPage;
