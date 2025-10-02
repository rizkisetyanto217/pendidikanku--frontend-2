import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

// UI primitives & layout
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// Icons
import {
  Wallet,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Download,
} from "lucide-react";

// Modals
import Export from "./modal/Export";
import Pembayaran from "./modal/Payment";
import CreateInvoiceModal from "./modal/SchoolBill";

/* ================== Date helpers ================== */
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};

const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();

const normalizeISOToLocalNoon = (iso?: string) =>
  iso ? toLocalNoonISO(new Date(iso)) : undefined;

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const hijriLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const idr = (n?: number) =>
  n == null
    ? "-"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(n);

const dateFmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/* ================= Types ================= */
export type InvoiceStatus = "unpaid" | "partial" | "paid" | "overdue";

export interface InvoiceItem {
  id: string;
  title: string;
  student_id?: string;
  student_name?: string;
  class_name?: string;
  due_date: string;
  amount: number;
  paid_amount?: number;
  status: InvoiceStatus;
  type?: string;
}

export interface PaymentItem {
  id: string;
  date: string;
  payer_name?: string;
  invoice_title?: string;
  amount: number;
  method?: string;
}

interface Summary {
  billed: number;
  collected: number;
  outstanding: number;
  alerts: number;
}

type SchoolFinanceProps = {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
};

/* ================= Dummy Data ================= */
const dummySummary: Summary = {
  billed: 15750000,
  collected: 10800000,
  outstanding: 4950000,
  alerts: 2,
};

const dummyInvoices: InvoiceItem[] = [
  {
    id: "inv001",
    title: "SPP September 2025",
    student_id: "stu001",
    student_name: "Ahmad Fauzi",
    class_name: "1A",
    due_date: "2025-09-15T12:00:00.000Z",
    amount: 500000,
    status: "paid",
    type: "SPP",
  },
  {
    id: "inv002",
    title: "Uang Seragam",
    student_id: "stu002",
    student_name: "Siti Nurhaliza",
    class_name: "1B",
    due_date: "2025-09-20T12:00:00.000Z",
    amount: 350000,
    status: "unpaid",
    type: "Seragam",
  },
  {
    id: "inv003",
    title: "Buku Semester 1",
    student_id: "stu003",
    student_name: "Budi Santoso",
    class_name: "2A",
    due_date: "2025-09-10T12:00:00.000Z",
    amount: 400000,
    paid_amount: 200000,
    status: "partial",
    type: "Buku",
  },
  {
    id: "inv004",
    title: "SPP Agustus 2025",
    student_id: "stu004",
    student_name: "Dewi Lestari",
    class_name: "3C",
    due_date: "2025-08-30T12:00:00.000Z",
    amount: 500000,
    status: "overdue",
    type: "SPP",
  },
  {
    id: "inv005",
    title: "Uang Kegiatan",
    student_id: "stu005",
    student_name: "Andi Pratama",
    class_name: "2B",
    due_date: "2025-09-25T12:00:00.000Z",
    amount: 200000,
    status: "paid",
    type: "Kegiatan",
  },
  {
    id: "inv006",
    title: "Praktikum Lab",
    student_id: "stu006",
    student_name: "Fatimah Zahra",
    class_name: "3A",
    due_date: "2025-09-22T12:00:00.000Z",
    amount: 150000,
    status: "unpaid",
    type: "Praktikum",
  },
];

const dummyPayments: PaymentItem[] = [
  {
    id: "pay001",
    date: "2025-09-14T12:00:00.000Z",
    payer_name: "Ahmad Fauzi",
    invoice_title: "SPP September 2025",
    amount: 500000,
    method: "Transfer Bank",
  },
  {
    id: "pay002",
    date: "2025-09-12T12:00:00.000Z",
    payer_name: "Budi Santoso",
    invoice_title: "Buku Semester 1",
    amount: 200000,
    method: "Tunai",
  },
  {
    id: "pay003",
    date: "2025-09-16T12:00:00.000Z",
    payer_name: "Andi Pratama",
    invoice_title: "Uang Kegiatan",
    amount: 200000,
    method: "E-Wallet",
  },
  {
    id: "pay004",
    date: "2025-09-11T12:00:00.000Z",
    payer_name: "Siti Aminah",
    invoice_title: "SPP Agustus 2025",
    amount: 500000,
    method: "Transfer Bank",
  },
];

/* ================= Status Badge Component ================= */
const StatusBadge: React.FC<{ status: InvoiceStatus; palette: Palette }> = ({
  status,
  palette,
}) => {
  const statusConfig = {
    paid: { variant: "success" as const, icon: "✓", label: "Lunas" },
    partial: { variant: "info" as const, icon: "◐", label: "Sebagian" },
    unpaid: { variant: "outline" as const, icon: "○", label: "Belum Bayar" },
    overdue: { variant: "warning" as const, icon: "⚠", label: "Terlambat" },
  };

  const config = statusConfig[status];

  return (
    <Badge palette={palette} variant={config.variant}>
      <span className="flex items-center gap-1">
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    </Badge>
  );
};

/* ================= Loading Component ================= */
const LoadingSpinner: React.FC<{ text?: string; palette: Palette }> = ({
  text = "Memuat...",
  palette,
}) => (
  <div className="py-12 text-center">
    <div
      className="inline-flex items-center gap-2"
      style={{ color: palette.black2 }}
    >
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      {text}
    </div>
  </div>
);

/* ================= Empty State Component ================= */
const EmptyState: React.FC<{
  icon: string;
  title: string;
  description: string;
  palette: Palette;
}> = ({ icon, title, description, palette }) => (
  <div className="py-12 text-center">
    <div className="text-4xl mb-3">{icon}</div>
    <div className="font-medium mb-1">{title}</div>
    <div className="text-sm" style={{ color: palette.black2 }}>
      {description}
    </div>
  </div>
);

/* ================= KPI Tile Component ================= */
const KpiTile: React.FC<{
  palette: Palette;
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}> = ({ palette, label, value, icon }) => (
  <SectionCard palette={palette}>
    <div className="p-3 sm:p-4 md:p-5 flex items-center gap-3">
      <span
        className="h-8 w-8 sm:h-10 sm:w-10 grid place-items-center rounded-xl flex-shrink-0"
        style={{ background: palette.primary2, color: palette.primary }}
      >
        {icon ?? <Wallet size={16} className="sm:w-[18px] sm:h-[18px]" />}
      </span>
      <div className="min-w-0 flex-1">
        <div
          className="text-sm sm:text-sm truncate"
          style={{ color: palette.black2 }}
        >
          {label}
        </div>
        <div className="text-lg sm:text-xl font-semibold truncate">{value}</div>
      </div>
    </div>
  </SectionCard>
);

/* ================= Invoice Table Component ================= */
const InvoiceTable: React.FC<{
  palette: Palette;
  invoices: InvoiceItem[];
  query: any;
  onDetail: (inv: InvoiceItem) => void;
  markPaid: any;
}> = ({ palette, invoices, query, onDetail, markPaid }) => (
  <SectionCard palette={palette}>
    <div
      className="px-4 py-4 border-b"
      style={{ borderColor: palette.silver1 }}
    >
      <h3 className="font-semibold text-lg">Daftar Tagihan</h3>
      <p className="text-sm mt-1" style={{ color: palette.black2 }}>
        {invoices.length} tagihan ditemukan
      </p>
    </div>

    {/* Mobile View */}
    <div className="block md:hidden">
      {query.isLoading ? (
        <LoadingSpinner text="Memuat data tagihan..." palette={palette} />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Tidak ada tagihan"
          description="Belum ada data tagihan untuk periode ini"
          palette={palette}
        />
      ) : (
        <div className="divide-y" style={{ borderColor: palette.silver1 }}>
          {invoices.map((inv) => {
            const due = normalizeISOToLocalNoon(inv.due_date);
            const isOverdue = inv.status === "overdue";

            return (
              <div
                key={inv.id}
                className={`p-4 hover:bg-opacity-50 transition-colors ${
                  isOverdue ? "bg-red-50" : ""
                }`}
                style={{
                  backgroundColor: isOverdue
                    ? `${palette.warning1}10`
                    : undefined,
                }}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base mb-1 truncate">
                      {inv.title}
                    </div>
                    {inv.type && (
                      <span
                        className="inline-block px-2 py-1 text-sm rounded-md"
                        style={{
                          backgroundColor: palette.primary2,
                          color: palette.primary,
                        }}
                      >
                        {inv.type}
                      </span>
                    )}
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <StatusBadge status={inv.status} palette={palette} />
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                  <div>
                    <span style={{ color: palette.black2 }}>Siswa:</span>
                    <div className="font-medium truncate">
                      {inv.student_name ?? "-"}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: palette.black2 }}>Kelas:</span>
                    <div className="font-medium">{inv.class_name ?? "-"}</div>
                  </div>
                  <div>
                    <span style={{ color: palette.black2 }}>Jatuh Tempo:</span>
                    <div
                      className={`font-medium ${isOverdue ? "text-red-600" : ""}`}
                    >
                      {dateFmt(due)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: palette.black2 }}>Nominal:</span>
                    <div className="font-semibold text-lg">
                      {idr(inv.amount)}
                    </div>
                    {inv.paid_amount && (
                      <div
                        className="text-sm"
                        style={{ color: palette.black2 }}
                      >
                        Dibayar: {idr(inv.paid_amount)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex gap-2 pt-3 border-t"
                  style={{ borderColor: palette.silver1 }}
                >
                  <button
                    onClick={() => onDetail(inv)}
                    className="text-sm underline hover:no-underline transition-all"
                    style={{ color: palette.primary }}
                  >
                    Lihat Detail
                  </button>
                  {inv.status !== "paid" && (
                    <Btn
                      size="sm"
                      palette={palette}
                      onClick={() => markPaid.mutate({ id: inv.id })}
                      disabled={markPaid.isPending}
                      className="ml-auto text-sm px-3 py-1"
                    >
                      {markPaid.isPending ? (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                          Proses...
                        </div>
                      ) : (
                        "Tandai Lunas"
                      )}
                    </Btn>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Desktop View */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: palette.white2 }}>
            {[
              "Tagihan",
              "Siswa",
              "Kelas",
              "Jatuh Tempo",
              "Nominal",
              "Status",
              "Aksi",
            ].map((header) => (
              <th
                key={header}
                className={`py-4 px-4 font-semibold border-b ${
                  header === "Aksi" ? "text-center" : "text-left"
                }`}
                style={{ borderColor: palette.silver1, color: palette.black2 }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: palette.silver1 }}>
          {query.isLoading && (
            <tr>
              <td colSpan={7}>
                <LoadingSpinner
                  text="Memuat data tagihan..."
                  palette={palette}
                />
              </td>
            </tr>
          )}
          {!query.isLoading && invoices.length === 0 && (
            <tr>
              <td colSpan={7}>
                <EmptyState
                  icon="📋"
                  title="Tidak ada tagihan"
                  description="Belum ada data tagihan untuk periode ini"
                  palette={palette}
                />
              </td>
            </tr>
          )}
          {invoices.map((inv) => {
            const due = normalizeISOToLocalNoon(inv.due_date);
            const isOverdue = inv.status === "overdue";

            return (
              <tr
                key={inv.id}
                className={`hover:bg-gray-50 transition-colors ${
                  isOverdue ? "bg-red-50" : ""
                }`}
                style={{
                  backgroundColor: isOverdue
                    ? `${palette.warning1}08`
                    : undefined,
                }}
              >
                <td className="py-4 px-4">
                  <div className="font-semibold text-base mb-1">
                    {inv.title}
                  </div>
                  {inv.type && (
                    <span
                      className="inline-block px-2 py-1 text-sm rounded-md"
                      style={{
                        backgroundColor: palette.primary2,
                        color: palette.primary,
                      }}
                    >
                      {inv.type}
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 font-medium">
                  {inv.student_name ?? "-"}
                </td>
                <td className="py-4 px-4 font-medium">
                  {inv.class_name ?? "-"}
                </td>
                <td className="py-4 px-4">
                  <div
                    className={`font-medium ${isOverdue ? "text-red-600" : ""}`}
                  >
                    {dateFmt(due)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-semibold text-base">
                    {idr(inv.amount)}
                  </div>
                  {inv.paid_amount && (
                    <div
                      className="text-sm mt-1"
                      style={{ color: palette.black2 }}
                    >
                      Dibayar: {idr(inv.paid_amount)}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <StatusBadge status={inv.status} palette={palette} />
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2 justify-center items-center">
                    <button
                      onClick={() => onDetail(inv)}
                      className="text-sm underline hover:no-underline transition-all px-2 py-1"
                      style={{ color: palette.primary }}
                    >
                      Detail
                    </button>
                    {inv.status !== "paid" && (
                      <Btn
                        size="sm"
                        palette={palette}
                        onClick={() => markPaid.mutate({ id: inv.id })}
                        disabled={markPaid.isPending}
                        className="text-sm px-3 py-1"
                      >
                        {markPaid.isPending ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                            Proses...
                          </div>
                        ) : (
                          "Tandai Lunas"
                        )}
                      </Btn>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </SectionCard>
);

/* ================= Payment Table Component ================= */
const PaymentTable: React.FC<{
  palette: Palette;
  payments: PaymentItem[];
  query: any;
}> = ({ palette, payments, query }) => {
  const getPaymentMethodIcon = (method?: string) => {
    const iconMap: Record<string, string> = {
      "Transfer Bank": "🏦",
      Tunai: "💵",
      "E-Wallet": "📱",
    };
    return iconMap[method || ""] || "💳";
  };

  return (
    <SectionCard palette={palette}>
      <div
        className="px-4 py-4 border-b"
        style={{ borderColor: palette.silver1 }}
      >
        <h3 className="font-semibold text-lg">Daftar Pembayaran</h3>
        <p className="text-sm mt-1" style={{ color: palette.black2 }}>
          {payments.length} pembayaran ditemukan
        </p>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        {query.isLoading ? (
          <LoadingSpinner text="Memuat data pembayaran..." palette={palette} />
        ) : payments.length === 0 ? (
          <EmptyState
            icon="💸"
            title="Tidak ada pembayaran"
            description="Belum ada data pembayaran untuk periode ini"
            palette={palette}
          />
        ) : (
          <div className="divide-y" style={{ borderColor: palette.silver1 }}>
            {payments.map((p) => {
              const dt = normalizeISOToLocalNoon(p.date);
              return (
                <div
                  key={p.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-base mb-1">
                        {dateFmt(dt)}
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: palette.primary }}
                      >
                        {idr(p.amount)}
                      </div>
                    </div>
                    <div className="ml-3">
                      <span
                        className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg font-medium"
                        style={{
                          backgroundColor: palette.primary2,
                          color: palette.primary,
                        }}
                      >
                        <span>{getPaymentMethodIcon(p.method)}</span>
                        <span>{p.method ?? "Tidak diketahui"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span
                        className="text-sm"
                        style={{ color: palette.black2 }}
                      >
                        Pembayar:
                      </span>
                      <span className="font-semibold text-base">
                        {p.payer_name ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span
                        className="text-sm flex-shrink-0"
                        style={{ color: palette.black2 }}
                      >
                        Untuk Tagihan:
                      </span>
                      <span className="text-right text-sm font-medium ml-3">
                        {p.invoice_title ?? "-"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: palette.white2 }}>
              {[
                "Tanggal",
                "Pembayar",
                "Untuk Tagihan",
                "Metode Bayar",
                "Jumlah",
              ].map((header, index) => (
                <th
                  key={header}
                  className={`py-4 px-4 font-semibold border-b ${
                    index === 3
                      ? "text-center"
                      : index === 4
                        ? "text-right"
                        : "text-left"
                  }`}
                  style={{
                    borderColor: palette.silver1,
                    color: palette.black2,
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: palette.silver1 }}>
            {query.isLoading && (
              <tr>
                <td colSpan={5}>
                  <LoadingSpinner
                    text="Memuat data pembayaran..."
                    palette={palette}
                  />
                </td>
              </tr>
            )}
            {!query.isLoading && payments.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon="💸"
                    title="Tidak ada pembayaran"
                    description="Belum ada data pembayaran untuk periode ini"
                    palette={palette}
                  />
                </td>
              </tr>
            )}
            {payments.map((p) => {
              const dt = normalizeISOToLocalNoon(p.date);
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium">{dateFmt(dt)}</td>
                  <td className="py-4 px-4 font-semibold text-base">
                    {p.payer_name ?? "-"}
                  </td>
                  <td className="py-4 px-4">
                    <div
                      className="max-w-sm truncate"
                      title={p.invoice_title ?? "-"}
                    >
                      {p.invoice_title ?? "-"}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: palette.primary2,
                        color: palette.primary,
                      }}
                    >
                      <span>{getPaymentMethodIcon(p.method)}</span>
                      <span>{p.method ?? "Tidak diketahui"}</span>
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div
                      className="font-bold text-lg"
                      style={{ color: palette.primary }}
                    >
                      {idr(p.amount)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

/* ================= Main Component ================= */
const SchoolFinance: React.FC<SchoolFinanceProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const gregorianISO = toLocalNoonISO(new Date());
  const isFromMenuUtama = location.pathname.includes("/menu-utama/");

  // ===== MODALS =====
  const [openExport, setOpenExport] = useState(false);
  const [openPay, setOpenPay] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  // ===== Filters & Tabs =====
  const today = new Date();
  const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState<string>(ym);
  const [kelas, setKelas] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<InvoiceStatus | "semua">("semua");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"invoices" | "payments">("invoices");
  const [type, setType] = useState<string | undefined>(undefined);

  // ===== Summary Query =====
  const summary = useQuery({
    queryKey: ["finance-summary", { month }],
    queryFn: async (): Promise<Summary> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(dummySummary), 500);
      });
    },
    initialData: dummySummary,
  });

  // ===== Invoices Query =====
  const invoicesQuery = useQuery({
    queryKey: ["invoices", { month, kelas, status, q, type }],
    queryFn: async () => {
      let filteredInvoices = [...dummyInvoices];

      if (kelas) {
        filteredInvoices = filteredInvoices.filter(
          (inv) => inv.class_name === kelas
        );
      }

      if (status !== "semua") {
        filteredInvoices = filteredInvoices.filter(
          (inv) => inv.status === status
        );
      }

      if (q) {
        filteredInvoices = filteredInvoices.filter(
          (inv) =>
            inv.title.toLowerCase().includes(q.toLowerCase()) ||
            inv.student_name?.toLowerCase().includes(q.toLowerCase())
        );
      }

      if (type) {
        filteredInvoices = filteredInvoices.filter((inv) => inv.type === type);
      }

      return new Promise<{
        list: InvoiceItem[];
        classes: string[];
        types: string[];
      }>((resolve) => {
        setTimeout(
          () =>
            resolve({
              list: filteredInvoices,
              classes: ["1A", "1B", "2A", "2B", "3A", "3C"],
              types: ["SPP", "Seragam", "Buku", "Kegiatan", "Praktikum"],
            }),
          300
        );
      });
    },
    initialData: {
      list: dummyInvoices,
      classes: ["1A", "1B", "2A", "2B", "3A", "3C"],
      types: ["SPP", "Seragam", "Buku", "Kegiatan", "Praktikum"],
    },
  });

  // ===== Payments Query =====
  const paymentsQuery = useQuery({
    queryKey: ["payments", { month, q }],
    queryFn: async () => {
      let filteredPayments = [...dummyPayments];

      if (q) {
        filteredPayments = filteredPayments.filter(
          (pay) =>
            pay.payer_name?.toLowerCase().includes(q.toLowerCase()) ||
            pay.invoice_title?.toLowerCase().includes(q.toLowerCase())
        );
      }

      return new Promise<{ list: PaymentItem[] }>((resolve) => {
        setTimeout(() => resolve({ list: filteredPayments }), 300);
      });
    },
    initialData: { list: dummyPayments },
  });

  const invoices = invoicesQuery.data?.list ?? [];
  const payments = paymentsQuery.data?.list ?? [];
  const classes = invoicesQuery.data?.classes ?? [];
  const types = invoicesQuery.data?.types ?? [];

  // ===== Mutations =====
  const markPaid = useMutation({
    mutationFn: async (payload: { id: string }) => {
      return new Promise<void>((resolve) => {
        console.log("Marking invoice as paid:", payload);
        setTimeout(resolve, 1000);
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (payload: {
      title: string;
      amount: number;
      due_date: string;
      class_name?: string;
      type?: string;
      student_id?: string;
      description?: string;
    }) => {
      return new Promise<void>((resolve) => {
        console.log("Creating invoice:", payload);
        setTimeout(resolve, 1000);
      });
    },
    onSuccess: () => {
      setOpenCreate(false);
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });

  // ===== Event Handlers =====// ===== Event Handlers =====
  const onDetail = (inv: InvoiceItem) => {
    // Navigate ke halaman detail dengan ID invoice
    navigate(`detail/${inv.id}`);
  };

  const handleGoBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const handleExportSubmit = (data: {
    month: string;
    format: string;
    file?: File | null;
  }) => {
    console.log("Export UI only:", data);
    setOpenExport(false);
  };

  const handlePaymentSubmit = (data: any) => {
    console.log("Pembayaran:", data);
    setOpenPay(false);
  };
  const handleCreateInvoiceSubmit = (data: any) => {
    console.log("Invoice baru:", data);
    setOpenCreate(false);
  };

  return (
    <div
      className="min-h-full w-full "
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* TopBar */}
      <ParentTopBar
        palette={palette}
        title="Keuangan"
        gregorianDate={gregorianISO}
        hijriDate={hijriLong(gregorianISO)}
        dateFmt={dateLong}
        showBack={isFromMenuUtama}
      />

      <main className="w-full px-4 md:px-6  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main Content */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header */}
            <div className="md:flex hidden gap-3 items-center">
              {showBack && (
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                </Btn>
              )}
              <h1 className="text-lg font-semibold">Keuangan Sekolah</h1>
            </div>

            {/* Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-3 md:py-0">
              <KpiTile
                palette={palette}
                label="Total Tertagih"
                value={idr(summary.data?.billed)}
                icon={<Calendar size={18} />}
              />
              <KpiTile
                palette={palette}
                label="Tunggakan"
                value={idr(summary.data?.outstanding)}
                icon={<Wallet size={18} />}
              />
              <KpiTile
                palette={palette}
                label="Terkumpul"
                value={idr(summary.data?.collected)}
                icon={<CheckCircle2 size={18} />}
              />
            </section>

            {/* Action Buttons */}
            <section className="flex flex-wrap gap-2 sm:gap-3">
              <Btn
                palette={palette}
                variant="default"
                onClick={() => setOpenCreate(true)}
                className="inline-flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Buat Tagihan</span>
                <span className="sm:hidden">Buat</span>
              </Btn>
              <Btn
                palette={palette}
                variant="outline"
                onClick={() => setOpenPay(true)}
                className="inline-flex items-center gap-2 text-sm"
              >
                <Wallet size={16} />
                <span className="hidden sm:inline">Catat Pembayaran</span>
                <span className="sm:hidden">Bayar</span>
              </Btn>
              <Btn
                palette={palette}
                variant="outline"
                onClick={() => setOpenExport(true)}
                className="inline-flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </Btn>
            </section>

            {/* Tab Navigation */}
            <div className="flex gap-1 sm:gap-2 overflow-x-auto">
              <Btn
                palette={palette}
                variant={tab === "invoices" ? "default" : "outline"}
                onClick={() => setTab("invoices")}
                className="whitespace-nowrap text-sm sm:text-base flex items-center gap-2"
              >
                <span>📋</span>
                <span>Tagihan</span>
                <Badge
                  palette={palette}
                  variant="secondary"
                  className="text-sm"
                >
                  {invoices.length}
                </Badge>
              </Btn>
              <Btn
                palette={palette}
                variant={tab === "payments" ? "default" : "outline"}
                onClick={() => setTab("payments")}
                className="whitespace-nowrap text-sm sm:text-base flex items-center gap-2"
              >
                <span>💰</span>
                <span>Pembayaran</span>
                <Badge
                  palette={palette}
                  variant="secondary"
                  className="text-sm"
                >
                  {payments.length}
                </Badge>
              </Btn>
            </div>

            {/* Search and Filters */}
            {tab === "invoices" && (
              <section className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-3 opacity-50"
                  />
                  <input
                    type="text"
                    placeholder="Cari tagihan atau nama siswa..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                    style={{
                      borderColor: palette.silver1,
                      backgroundColor: palette.white1,
                    }}
                  />
                </div>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as InvoiceStatus | "semua")
                  }
                  className="px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: palette.silver1,
                    backgroundColor: palette.white1,
                  }}
                >
                  <option value="semua">Semua Status</option>
                  <option value="unpaid">Belum Bayar</option>
                  <option value="partial">Sebagian</option>
                  <option value="paid">Lunas</option>
                  <option value="overdue">Terlambat</option>
                </select>
                <select
                  value={kelas || ""}
                  onChange={(e) => setKelas(e.target.value || undefined)}
                  className="px-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: palette.silver1,
                    backgroundColor: palette.white1,
                  }}
                >
                  <option value="">Semua Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      Kelas {cls}
                    </option>
                  ))}
                </select>
              </section>
            )}

            {tab === "payments" && (
              <section className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-3 opacity-50"
                  />
                  <input
                    type="text"
                    placeholder="Cari pembayaran..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                    style={{
                      borderColor: palette.silver1,
                      backgroundColor: palette.white1,
                    }}
                  />
                </div>
              </section>
            )}

            {/* Content Tables */}
            {tab === "invoices" ? (
              <InvoiceTable
                palette={palette}
                invoices={invoices}
                query={invoicesQuery}
                onDetail={onDetail}
                markPaid={markPaid}
              />
            ) : (
              <PaymentTable
                palette={palette}
                payments={payments}
                query={paymentsQuery}
              />
            )}
          </section>
        </div>
      </main>

      {/* ====== Modals ====== */}
      <Export
        open={openExport}
        onClose={() => setOpenExport(false)}
        palette={palette}
        onSubmit={handleExportSubmit}
      />
      <Pembayaran
        open={openPay}
        onClose={() => setOpenPay(false)}
        onSubmit={handlePaymentSubmit}
        palette={palette}
        invoiceOptions={invoices.map((inv) => ({
          value: inv.id,
          label: `${inv.title} — ${inv.student_name ?? "-"}`,
        }))}
      />
      <CreateInvoiceModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        palette={palette}
        classOptions={classes}
        typeOptions={types}
        studentOptions={[]}
        loading={createInvoice.isPending}
        error={
          (createInvoice.error as any)?.response?.data?.message ??
          (createInvoice.error as any)?.message ??
          null
        }
        onSubmit={handleCreateInvoiceSubmit}
      />
    </div>
  );
};

export default SchoolFinance;
