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
import { Wallet, Calendar, CheckCircle2, ArrowLeft } from "lucide-react";

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
  due_date: string; // ISO
  amount: number;
  paid_amount?: number;
  status: InvoiceStatus;
  type?: string;
}

export interface PaymentItem {
  id: string;
  date: string; // ISO
  payer_name?: string;
  invoice_title?: string;
  amount: number;
  method?: string;
}

type SchoolFinanceProps = {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
};

/* ================= Dummy Data ================= */
const dummySummary = {
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

/* =============== Page =============== */
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

  // ===== Summary dengan dummy data =====
  const summary = useQuery({
    queryKey: ["finance-summary", { month }],
    queryFn: async () => {
      // Simulasi API call dengan dummy data
      return new Promise<typeof dummySummary>((resolve) => {
        setTimeout(() => resolve(dummySummary), 500);
      });
    },
    initialData: dummySummary,
  });

  // ===== Invoices dengan dummy data =====
  const invoicesQuery = useQuery({
    queryKey: ["invoices", { month, kelas, status, q, type }],
    queryFn: async () => {
      // Simulasi API call dengan dummy data dan filtering
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

  // ===== Payments dengan dummy data =====
  const paymentsQuery = useQuery({
    queryKey: ["payments", { month, q }],
    queryFn: async () => {
      // Simulasi API call dengan dummy data dan filtering
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

  // ===== Actions =====
  const markPaid = useMutation({
    mutationFn: async (payload: { id: string }) => {
      // Simulasi API call
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
      // Simulasi API call
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

  const onDetail = (inv: InvoiceItem) => {
    console.log("Detail invoice:", inv);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* TopBar */}
      <ParentTopBar
        palette={palette}
        title="Keuangan"
        gregorianDate={gregorianISO}
        hijriDate={hijriLong(gregorianISO)}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-3 sm:py-4 md:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-9 space-y-4 sm:space-y-6 min-w-0 order-1 lg:order-2">
            {/* Header */}
            <div className="mx-auto max-w-6xl flex gap-4 items-center">
              {showBack && (
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                  {backLabel}
                </Btn>
              )}
            </div>

            {/* Snapshot */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <KpiTile
                palette={palette}
                label="Tertagih Bulan Ini"
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
                label="Pembayaran Masuk"
                value={idr(summary.data?.collected)}
                icon={<CheckCircle2 size={18} />}
              />
            </section>

            {/* Tab Navigation */}
            <div className="flex gap-1 sm:gap-2 overflow-x-auto">
              <Btn
                palette={palette}
                variant={tab === "invoices" ? "default" : "outline"}
                onClick={() => setTab("invoices")}
                className="whitespace-nowrap text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Tagihan</span>
                <span className="sm:hidden">Tagihan</span>
                <span className="ml-1">({invoices.length})</span>
              </Btn>
              <Btn
                palette={palette}
                variant={tab === "payments" ? "default" : "outline"}
                onClick={() => setTab("payments")}
                className="whitespace-nowrap text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Pembayaran</span>
                <span className="sm:hidden">Bayar</span>
                <span className="ml-1">({payments.length})</span>
              </Btn>
            </div>

            {/* Content (Invoices/Payments) */}
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
        onSubmit={({ month, format, file }) => {
          console.log("Export UI only:", { month, format, file });
        }}
      />
      <Pembayaran
        open={openPay}
        onClose={() => setOpenPay(false)}
        onSubmit={(data) => console.log("Pembayaran:", data)}
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
        onSubmit={(data) => {
          createInvoice.mutate({
            title: data.title,
            amount: Number(data.amount),
            due_date: data.due_date,
            class_name: data.class_name || undefined,
            type: data.type || undefined,
            student_id: data.student_id || undefined,
            description: data.description || undefined,
          });
        }}
      />
    </div>
  );
};

export default SchoolFinance;

/* ================= Small UI helpers ================= */
function KpiTile({
  palette,
  label,
  value,
  icon,
}: {
  palette: Palette;
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}) {
  return (
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
            className="text-xs sm:text-sm truncate"
            style={{ color: palette.black2 }}
          >
            {label}
          </div>
          <div className="text-lg sm:text-xl font-semibold truncate">
            {value}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function InvoiceTable({
  palette,
  invoices,
  query,
  onDetail,
  markPaid,
}: {
  palette: Palette;
  invoices: InvoiceItem[];
  query: ReturnType<typeof useQuery<any>>;
  onDetail: (inv: InvoiceItem) => void;
  markPaid: ReturnType<typeof useMutation<any, any, { id: string }>>;
}) {
  return (
    <SectionCard palette={palette}>
      <div className="p-4 font-medium">Daftar Tagihan</div>

      {/* Mobile View */}
      <div className="block md:hidden">
        {query.isLoading ? (
          <div className="py-8 text-center">Memuat data…</div>
        ) : invoices.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Tidak ada data tagihan
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {invoices.map((inv) => {
              const due = normalizeISOToLocalNoon(inv.due_date);
              return (
                <div
                  key={inv.id}
                  className="border rounded-lg p-4 space-y-3"
                  style={{ borderColor: palette.silver1 }}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{inv.title}</div>
                      <div className="text-xs opacity-70">{inv.type}</div>
                    </div>
                    <div className="ml-2">
                      {inv.status === "paid" && (
                        <Badge palette={palette} variant="success">
                          Lunas
                        </Badge>
                      )}
                      {inv.status === "partial" && (
                        <Badge palette={palette} variant="info">
                          Sebagian
                        </Badge>
                      )}
                      {inv.status === "unpaid" && (
                        <Badge palette={palette} variant="outline">
                          Belum Bayar
                        </Badge>
                      )}
                      {inv.status === "overdue" && (
                        <Badge palette={palette} variant="warning">
                          Terlambat
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Siswa:</span>
                    <span>{inv.student_name ?? "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kelas:</span>
                    <span>{inv.class_name ?? "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Jatuh Tempo:</span>
                    <span>{dateFmt(due)}</span>
                  </div>

                  {/* Amount */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nominal:</span>
                    <div className="text-right">
                      <div className="font-medium">{idr(inv.amount)}</div>
                      {inv.paid_amount && (
                        <div className="text-xs opacity-70">
                          Dibayar: {idr(inv.paid_amount)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex gap-2 pt-2 border-t"
                    style={{ borderColor: palette.silver1 }}
                  >
                    <button
                      onClick={() => onDetail(inv)}
                      className="underline text-sm flex-1 text-left"
                      style={{ color: palette.primary }}
                    >
                      Detail
                    </button>
                    {inv.status !== "paid" && (
                      <Btn
                        size="md"
                        palette={palette}
                        onClick={() => markPaid.mutate({ id: inv.id })}
                        disabled={markPaid.isPending}
                        className="flex-shrink-0 text-xs"
                      >
                        <p className="text-xs">
                       
                          {markPaid.isPending ? "..." : "Tandai Lunas"}
                        </p>
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
      <div className="hidden md:block overflow-x-auto p-5">
        <table className="min-w-[850px] w-full text-sm">
          <thead style={{ color: palette.silver2 }}>
            <tr>
              <th className="py-3 px-4 text-left">Judul</th>
              <th className="py-3 px-4 text-left">Nama Siswa</th>
              <th className="py-3 px-4 text-left">Kelas</th>
              <th className="py-3 px-4 text-left">Jatuh Tempo</th>
              <th className="py-3 px-4 text-left">Nominal</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: palette.silver1 }}>
            {query.isLoading && (
              <tr>
                <td colSpan={7} className="py-8 text-center">
                  Memuat data…
                </td>
              </tr>
            )}
            {invoices.map((inv) => {
              const due = normalizeISOToLocalNoon(inv.due_date);
              return (
                <tr key={inv.id} className="hover:bg-gray-50/50 ">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium">{inv.title}</div>
                      <div className="text-xs opacity-70">{inv.type}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">{inv.student_name ?? "-"}</td>
                  <td className="py-4 px-4">{inv.class_name ?? "-"}</td>
                  <td className="py-4 px-4">{dateFmt(due)}</td>
                  <td className="py-4 px-4">
                    <div className="font-medium">{idr(inv.amount)}</div>
                    {inv.paid_amount && (
                      <div className="text-xs opacity-70">
                        Dibayar: {idr(inv.paid_amount)}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {inv.status === "paid" && (
                      <Badge palette={palette} variant="success">
                        Lunas
                      </Badge>
                    )}
                    {inv.status === "partial" && (
                      <Badge palette={palette} variant="info">
                        Sebagian
                      </Badge>
                    )}
                    {inv.status === "unpaid" && (
                      <Badge palette={palette} variant="outline" className="text-center items-center flex">
                        Belum Bayar
                      </Badge>
                    )}
                    {inv.status === "overdue" && (
                      <Badge palette={palette} variant="warning">
                        Terlambat
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex gap-2 justify-end items-center">
                      <button
                        onClick={() => onDetail(inv)}
                        className="underline text-sm"
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
                          className="text-xs px-2 py-1"
                        >
                          {markPaid.isPending ? "..." : "Tandai Lunas"}
                        </Btn>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!query.isLoading && invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  Tidak ada data tagihan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function PaymentTable({
  palette,
  payments,
  query,
}: {
  palette: Palette;
  payments: PaymentItem[];
  query: ReturnType<typeof useQuery<any>>;
}) {
  return (
    <SectionCard palette={palette}>
      <div className="p-4 font-medium">Daftar Pembayaran</div>

      {/* Mobile View */}
      <div className="block md:hidden">
        {query.isLoading ? (
          <div className="py-8 text-center">Memuat data…</div>
        ) : payments.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Tidak ada data pembayaran
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {payments.map((p) => {
              const dt = normalizeISOToLocalNoon(p.date);
              return (
                <div
                  key={p.id}
                  className="border rounded-lg p-4 space-y-3"
                  style={{ borderColor: palette.silver1 }}
                >
                  {/* Date & Amount */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{dateFmt(dt)}</div>
                      <div
                        className="text-lg font-bold mt-1"
                        style={{ color: palette.primary }}
                      >
                        {idr(p.amount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded"
                        style={{
                          backgroundColor: palette.primary2,
                          color: palette.primary,
                        }}
                      >
                        {p.method === "Transfer Bank" && "🏦"}
                        {p.method === "Tunai" && "💵"}
                        {p.method === "E-Wallet" && "📱"}
                        {p.method ?? "-"}
                      </span>
                    </div>
                  </div>

                  {/* Payer Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pembayar:</span>
                      <span className="font-medium">{p.payer_name ?? "-"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Untuk Tagihan:</span>
                      <span className="text-right flex-1 ml-2">
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
        <table className="min-w-[700px] w-full text-sm">
          <thead style={{ color: palette.silver2 }}>
            <tr>
              <th className="py-3 px-4 text-left">Tanggal</th>
              <th className="py-3 px-4 text-left">Nama</th>
              <th className="py-3 px-4 text-left">Tagihan</th>
              <th className="py-3 px-4 text-left">Metode</th>
              <th className="py-3 px-4 text-left">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: palette.silver1 }}>
            {query.isLoading && (
              <tr>
                <td colSpan={5} className="py-8 text-center">
                  Memuat data…
                </td>
              </tr>
            )}
            {payments.map((p) => {
              const dt = normalizeISOToLocalNoon(p.date);
              return (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-4">{dateFmt(dt)}</td>
                  <td className="py-4 px-4 font-medium">
                    {p.payer_name ?? "-"}
                  </td>
                  <td className="py-4 px-4">{p.invoice_title ?? "-"}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-2">
                      {p.method === "Transfer Bank" && "🏦"}
                      {p.method === "Tunai" && "💵"}
                      {p.method === "E-Wallet" && "📱"}
                      <span>{p.method ?? "-"}</span>
                    </span>
                  </td>
                  <td
                    className="py-4 px-4 font-medium text-lg"
                    style={{ color: palette.primary }}
                  >
                    {idr(p.amount)}
                  </td>
                </tr>
              );
            })}
            {!query.isLoading && payments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Tidak ada data pembayaran
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
