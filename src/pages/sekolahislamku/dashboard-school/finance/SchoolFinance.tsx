// src/pages/sekolahislamku/pages/finance/SchoolFinance.tsx

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import axios from "@/lib/axios";

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
  CreditCard,
  AlertTriangle,
  Download,
  Plus,
  Calendar,
  CheckCircle2,
  ArrowLeft,
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
  showBack?: boolean; // default: false
  backTo?: string; // optional: kalau diisi, navigate ke path ini, kalau tidak pakai nav(-1)
  backLabel?: string; // teks tombol
};

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

  // ===== Summary =====
  const summary = useQuery({
    queryKey: ["finance-summary", { month }],
    queryFn: async () => {
      const res = await axios.get("/api/a/finance/summary", {
        params: { month },
      });
      return res.data as {
        billed: number;
        collected: number;
        outstanding: number;
        alerts?: number;
      };
    },
  });

  // ===== Invoices =====
  const invoicesQuery = useQuery({
    queryKey: ["invoices", { month, kelas, status, q, type }],
    queryFn: async () => {
      const params: Record<string, string> = { month };
      if (kelas) params.class = kelas;
      if (q) params.q = q;
      if (status !== "semua") params.status = status;
      if (type) params.type = type;
      const res = await axios.get("/api/a/invoices", { params });
      return res.data as {
        list: InvoiceItem[];
        classes?: string[];
        types?: string[];
      };
    },
  });

  // ===== Payments =====
  const paymentsQuery = useQuery({
    queryKey: ["payments", { month, q }],
    queryFn: async () => {
      const res = await axios.get("/api/a/payments", { params: { month, q } });
      return res.data as { list: PaymentItem[] };
    },
  });

  const invoices = invoicesQuery.data?.list ?? [];
  const payments = paymentsQuery.data?.list ?? [];
  const classes = invoicesQuery.data?.classes ?? ["1A", "1B", "2A"];
  const types = invoicesQuery.data?.types ?? ["SPP", "Seragam", "Buku"];

  // ===== Actions =====
  const markPaid = useMutation({
    mutationFn: async (payload: { id: string }) =>
      axios.post(`/api/a/invoices/${payload.id}/mark-paid`),
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
    }) => axios.post("/api/a/invoices", payload),
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

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-9 space-y-6 min-w-0">
            {/* Header */}
            <div className="mx-auto max-w-6xl flex gap-4 items-center">
              {showBack && (
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                </Btn>
              )}
              <h1 className="font-semibold text-lg">Keuangan</h1>
            </div>

            {/* Snapshot */}
            <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
      <div className="p-4 md:p-5 flex items-center gap-3">
        <span
          className="h-10 w-10 grid place-items-center rounded-xl"
          style={{ background: palette.primary2, color: palette.primary }}
        >
          {icon ?? <Wallet size={18} />}
        </span>
        <div>
          <div className="text-xs" style={{ color: palette.black2 }}>
            {label}
          </div>
          <div className="text-xl font-semibold">{value}</div>
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
      <div className="overflow-x-auto">
        <table className="min-w-[850px] w-full text-sm">
          <thead style={{ color: palette.silver2 }}>
            <tr>
              <th className="py-2">Judul</th>
              <th>Nama Siswa</th>
              <th>Kelas</th>
              <th>Jatuh Tempo</th>
              <th>Nominal</th>
              <th>Status</th>
              <th className="text-right">Aksi</th>
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
                <tr key={inv.id}>
                  <td className="py-2">{inv.title}</td>
                  <td>{inv.student_name ?? "-"}</td>
                  <td>{inv.class_name ?? "-"}</td>
                  <td>{dateFmt(due)}</td>
                  <td>{idr(inv.amount)}</td>
                  <td>
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
                  </td>
                  <td className="text-right">
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
                      >
                        Tandai Lunas
                      </Btn>
                    )}
                  </td>
                </tr>
              );
            })}
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
      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead style={{ color: palette.silver2 }}>
            <tr>
              <th className="py-2">Tanggal</th>
              <th>Nama</th>
              <th>Tagihan</th>
              <th>Metode</th>
              <th>Jumlah</th>
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
                <tr key={p.id}>
                  <td className="py-2">{dateFmt(dt)}</td>
                  <td>{p.payer_name ?? "-"}</td>
                  <td>{p.invoice_title ?? "-"}</td>
                  <td>{p.method ?? "-"}</td>
                  <td>{idr(p.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
