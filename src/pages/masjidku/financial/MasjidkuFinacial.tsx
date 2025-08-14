import React, { useMemo, useState } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  Link,
} from "react-router-dom";
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
  month: string;
  total_income: number;
  total_expense: number;
  ending_balance: number;
};

type Transaction = {
  id: string;
  date_iso: string;
  description: string;
  category?: string;
  amount: number;
  type: "income" | "expense";
};

/* ============== Utils/format ============= */
const formatUtils = {
  currency: (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n),

  date: (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium" }),

  time: (iso: string) =>
    new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
};

/* ========= CSV Export (client-side) ======== */
const exportToCSV = (
  transactions: Transaction[],
  slug: string,
  month: string
) => {
  const header = [
    "Tanggal",
    "Waktu",
    "Deskripsi",
    "Kategori",
    "Tipe",
    "Nominal",
  ];
  const lines = transactions.map((t) => [
    formatUtils.date(t.date_iso),
    formatUtils.time(t.date_iso),
    `"${(t.description || "").replace(/"/g, '""')}"`,
    `"${(t.category || "-").replace(/"/g, '""')}"`,
    t.type,
    t.amount.toString(),
  ]);

  const csv = [header, ...lines].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `laporan-keuangan-${slug}-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ================= Sub Components ================ */
interface MonthFilterProps {
  month: string;
  onMonthChange: React.ChangeEventHandler<HTMLInputElement>;
  onExport: () => void;
  theme: any;
}

const MonthFilter: React.FC<MonthFilterProps> = ({
  month,
  onMonthChange,
  onExport,
  theme,
}) => (
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
        onClick={onExport}
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
);

interface SummaryCardProps {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  color?: string;
  loading: boolean;
  theme: any;
  linkTo: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  color,
  loading,
  theme,
  linkTo,
}) => (
  <div
    className="rounded-xl p-3 ring-1"
    style={{
      backgroundColor: theme.white1,
      borderColor: theme.white3,
      color: theme.black1,
    }}
  >
    <Link to={linkTo}>
      <div className="flex items-center justify-between mb-2 cursor-pointer">
        <span className="text-xs" style={{ color: theme.silver2 }}>
          {title}
        </span>
        {icon}
      </div>
    </Link>
    <div
      className="text-sm font-semibold"
      style={{ color: color || theme.black1 }}
    >
      {loading
        ? "..."
        : value !== undefined
          ? formatUtils.currency(value)
          : "-"}
    </div>
  </div>
);

interface SummaryGridProps {
  summary: FinanceSummary | undefined;
  loading: boolean;
  theme: any;
}

const SummaryGrid: React.FC<SummaryGridProps> = ({
  summary,
  loading,
  theme,
}) => {
  const summaryItems = [
    {
      title: "Saldo Akhir",
      value: summary?.ending_balance,
      icon: <Wallet size={18} />,
      linkTo: "/financial/saldo-akhir",
    },
    {
      title: "Pemasukan",
      value: summary?.total_income,
      icon: <ArrowDownCircle size={18} />,
      color: theme.success1,
      linkTo: "/financial/pemasukan",
    },
    {
      title: "Pengeluaran",
      value: summary?.total_expense,
      icon: <ArrowUpCircle size={18} />,
      color: theme.error1,
      linkTo: "/financial/pengeluaran",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mt-3">
      {summaryItems.map((item, index) => (
        <SummaryCard
          key={index}
          title={item.title}
          value={item.value}
          icon={item.icon}
          color={item.color}
          loading={loading}
          theme={theme}
          linkTo={item.linkTo}
        />
      ))}
    </div>
  );
};

interface TransactionItemProps {
  transaction: Transaction;
  theme: any;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  theme,
}) => {
  const isIncome = transaction.type === "income";

  return (
    <li className="px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium" style={{ color: theme.black1 }}>
            {transaction.description}
          </div>
          <div
            className="flex items-center gap-2 mt-1 text-xs"
            style={{ color: theme.silver2 }}
          >
            <span className="inline-flex items-center gap-1">
              <Tag size={12} /> {transaction.category || "-"}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} /> {formatUtils.time(transaction.date_iso)}
            </span>
          </div>
        </div>
        <div
          className="text-sm font-semibold shrink-0 text-right"
          style={{
            color: isIncome ? theme.success1 : theme.error1,
          }}
        >
          {isIncome ? "+" : "-"}
          {formatUtils.currency(transaction.amount)}
        </div>
      </div>
    </li>
  );
};

interface TransactionGroupProps {
  dateLabel: string;
  transactions: Transaction[];
  theme: any;
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({
  dateLabel,
  transactions,
  theme,
}) => (
  <div
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
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          theme={theme}
        />
      ))}
    </ul>
  </div>
);

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  error: boolean;
  theme: any;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading,
  error,
  theme,
}) => {
  const groupedTransactions = useMemo(() => {
    const map: Record<string, Transaction[]> = {};

    transactions.forEach((transaction) => {
      const key = formatUtils.date(transaction.date_iso);
      if (!map[key]) map[key] = [];
      map[key].push(transaction);
    });

    // Sort by date (newest first)
    return Object.entries(map).sort(
      (a, b) =>
        new Date(b[1][0]?.date_iso || 0).getTime() -
        new Date(a[1][0]?.date_iso || 0).getTime()
    );
  }, [transactions]);

  if (loading) {
    return (
      <div className="text-sm" style={{ color: theme.silver2 }}>
        Memuat transaksi…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm" style={{ color: theme.error1 }}>
        Gagal memuat transaksi.
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-sm" style={{ color: theme.silver2 }}>
        Belum ada transaksi untuk bulan ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groupedTransactions.map(([dateLabel, items]) => (
        <TransactionGroup
          key={dateLabel}
          dateLabel={dateLabel}
          transactions={items}
          theme={theme}
        />
      ))}
    </div>
  );
};

/* ================= Main Component ================ */
export default function MasjidkuFinancial() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const [searchParams, setSearchParams] = useSearchParams();
  const monthParam =
    searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(monthParam);

  const onMonthChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const newMonth = e.target.value;
    setMonth(newMonth);
    setSearchParams((sp) => {
      sp.set("month", newMonth);
      return sp;
    });
  };

  /* ======== API Queries ======== */
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

  const handleExport = () => {
    if (!transactions.length) return;
    exportToCSV(transactions, slug, month);
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <PageHeaderUser
        title="Laporan Keuangan"
        onBackClick={() => navigate(`/`)}
        withPaddingTop
      />

      <MonthFilter
        month={month}
        onMonthChange={onMonthChange}
        onExport={handleExport}
        theme={theme}
      />

      <SummaryGrid summary={summary} loading={loadingSummary} theme={theme} />

      <div className="mt-4">
        <TransactionList
          transactions={transactions}
          loading={loadingTx}
          error={errorTx}
          theme={theme}
        />
      </div>

      <BottomNavbar />
    </div>
  );
}
