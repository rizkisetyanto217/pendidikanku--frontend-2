// React & libs
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import axios from "@/lib/axios";

// UI primitives
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

// Layout
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

// Icons (hanya yang dipakai)
import {
  Wallet,
  CreditCard,
  AlertTriangle,
  Download,
  Plus,
  Calendar,
  CheckCircle2,
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

/* =============== Page =============== */
export default function SchoolFinance() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
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
  const classes = invoicesQuery.data?.classes ?? ["1A", "1B", "2A", "2B", "3A"];
  const types = invoicesQuery.data?.types ?? [
    "SPP",
    "Seragam",
    "Buku",
    "Daftar Ulang",
  ];

  // ===== Actions =====
  const markPaid = useMutation({
    mutationFn: async (payload: { id: string }) =>
      axios.post(`/api/a/invoices/${payload.id}/mark-paid`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });

  // Create (BUAT) invoice
  const createInvoice = useMutation({
    mutationFn: async (payload: {
      title: string;
      amount: number;
      due_date: string; // yyyy-mm-dd atau ISO—sesuaikan backend
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
    // TODO: buka modal detail tagihan kalau sudah tersedia
    console.log("Detail invoice:", inv);
  };

  return (
    <>
      {/* Export */}
      <Export
        open={openExport}
        onClose={() => setOpenExport(false)}
        palette={palette}
        onSubmit={({ month, format, file }) => {
          console.log("UI ONLY:", { month, format, file });
        }}
      />

      {/* Rekam Pembayaran */}
      <Pembayaran
        open={openPay}
        onClose={() => setOpenPay(false)}
        onSubmit={(data) => {
          console.log("Pembayaran baru:", data);
        }}
        palette={palette}
        invoiceOptions={invoices.map((inv) => ({
          value: inv.id,
          label: `${inv.title} — ${inv.student_name ?? "-"}`,
        }))}
      />

      {/* TopBar */}
      <ParentTopBar
        palette={palette}
        title="Keuangan"
        gregorianDate={gregorianISO}
        hijriDate={hijriLong(gregorianISO)}
        dateFmt={dateLong}
      />

      <div className="lg:flex lg:items-start lg:gap-4 lg:p-4 lg:pt-6">
        {/* Sidebar kiri */}
        <ParentSidebar palette={palette} className="hidden lg:block" />

        {/* Konten kanan */}
        <main className="flex-1 mx-auto w-full max-w-6xl py-4 md:py-6 space-y-5 px-3 md:px-0">
          {/* Header + actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl grid place-items-center"
                style={{
                  background: palette.white3,
                  color: palette.quaternary,
                }}
              >
                <Wallet size={20} />
              </div>
              <div>
                <h1
                  className="text-lg md:text-xl font-semibold"
                 
                >
                  Keuangan
                </h1>
                <p className="text-sm" style={{ color: palette.black2 }}>
                  Kelola tagihan & pembayaran.
                </p>
              </div>
            </div>

            {/* Actions: desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Btn
                onClick={() => setOpenExport(true)}
                palette={palette}
                size="sm"
                variant="outline"
              >
                <Download size={16} /> Export
              </Btn>
              <Btn
                type="button"
                onClick={() => setOpenCreate(true)}
                palette={palette}
                size="sm"
                variant="default"
                className="gap-1"
              >
                <Plus size={16} />
                <span className="sm:inline">Tagihan</span>
              </Btn>
              <Btn
                palette={palette}
                size="sm"
                variant="quaternary"
                className="flex items-center gap-2"
                onClick={() => setOpenPay(true)}
              >
                <CreditCard size={16} /> Rekam Pembayaran
              </Btn>
            </div>

            {/* Actions: mobile */}
            <div className="md:hidden flex flex-wrap gap-2">
              <Btn
                type="button"
                palette={palette}
                size="sm"
                variant="default"
                className="flex items-center gap-2 flex-1 justify-center"
                onClick={() => setOpenCreate(true)}
              >
                <Plus size={16} />
                <span>Tagihan</span>
              </Btn>
              <Btn
                palette={palette}
                size="sm"
                variant="quaternary"
                onClick={() => setOpenPay(true)}
                className="flex items-center gap-2 flex-1 justify-center"
              >
                <CreditCard size={16} />
                <span>Pembayaran</span>
              </Btn>
              <Btn
                onClick={() => setOpenExport(true)}
                palette={palette}
                size="sm"
                variant="outline"
                className="flex items-center gap-2 flex-1 justify-center"
              >
                <Download size={16} />
                <span>Export</span>
              </Btn>
            </div>
          </div>

          {/* Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <SectionCard palette={palette} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: palette.black2 }}>
                    Tertagih Bulan Ini
                  </p>
                  <div
                    className="text-xl md:text-2xl font-semibold"
                    style={{ color: palette.quaternary }}
                  >
                    {idr(summary.data?.billed)}
                  </div>
                </div>
                <Calendar size={18} />
              </div>
            </SectionCard>
            <SectionCard palette={palette} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: palette.black2 }}>
                    Tunggakan
                  </p>
                  <div
                    className="text-xl md:text-2xl font-semibold"
                    style={{ color: palette.quaternary }}
                  >
                    {idr(summary.data?.outstanding)}
                  </div>
                </div>
                <Badge variant="warning" palette={palette}>
                  Perlu perhatian
                </Badge>
              </div>
            </SectionCard>
            <SectionCard palette={palette} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: palette.black2 }}>
                    Pembayaran Masuk
                  </p>
                  <div
                    className="text-xl md:text-2xl font-semibold"
                    style={{ color: palette.quaternary }}
                  >
                    {idr(summary.data?.collected)}
                  </div>
                </div>
                <CheckCircle2 size={18} />
              </div>
            </SectionCard>
          </div>

          {/* Content */}
          {tab === "invoices" ? (
            <SectionCard palette={palette} className="p-2 md:p-4">
              {/* Mobile list */}
              <ul
                className="md:hidden divide-y"
                style={{ borderColor: palette.white3 }}
              >
                {invoicesQuery.isLoading && (
                  <li
                    className="py-6 text-center"
                    style={{ color: palette.secondary }}
                  >
                    Memuat data…
                  </li>
                )}
                {invoicesQuery.isError && (
                  <li className="py-6">
                    <div
                      className="flex items-center gap-2 justify-center text-sm"
                      style={{ color: palette.warning1 }}
                    >
                      <AlertTriangle size={16} /> Terjadi kesalahan.
                      <button
                        className="underline"
                        onClick={() => invoicesQuery.refetch()}
                      >
                        Coba lagi
                      </button>
                    </div>
                  </li>
                )}
                {!invoicesQuery.isLoading && invoices.length === 0 && (
                  <li
                    className="py-8 text-center"
                    style={{ color: palette.secondary }}
                  >
                    Belum ada tagihan.
                  </li>
                )}
                {invoices.map((inv) => {
                  const due = normalizeISOToLocalNoon(inv.due_date);
                  return (
                    <li key={inv.id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div
                            className="font-medium"
                            style={{ color: palette.quaternary }}
                          >
                            {inv.title}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: palette.secondary }}
                          >
                            {inv.type ?? "-"} • {inv.class_name ?? "-"}
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div
                                className="text-xs"
                                style={{ color: palette.secondary }}
                              >
                                Jatuh Tempo
                              </div>
                              <div style={{ color: palette.quaternary }}>
                                {dateFmt(due)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className="text-xs"
                                style={{ color: palette.secondary }}
                              >
                                Nominal
                              </div>
                              <div
                                className="font-medium"
                                style={{ color: palette.quaternary }}
                              >
                                {idr(inv.amount)}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            {inv.status === "paid" && (
                              <Badge variant="success" palette={palette}>
                                Lunas
                              </Badge>
                            )}
                            {inv.status === "partial" && (
                              <Badge variant="info" palette={palette}>
                                Sebagian
                              </Badge>
                            )}
                            {inv.status === "unpaid" && (
                              <Badge variant="outline" palette={palette}>
                                Belum Bayar
                              </Badge>
                            )}
                            {inv.status === "overdue" && (
                              <Badge variant="warning" palette={palette}>
                                Terlambat
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button
                            type="button"
                            className="underline text-sm"
                            style={{ color: palette.primary }}
                            onClick={() => onDetail(inv)}
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
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Desktop table */}
              <div className="hidden md:block overflow-auto">
                <table className="min-w-[950px] w-full">
                  <thead>
                    <tr
                      className="text-left text-sm"
                      style={{ color: palette.secondary }}
                    >
                      <th className="py-3">Judul</th>
                      <th>Nama Siswa</th>
                      <th>Kelas</th>
                      <th>Jatuh Tempo</th>
                      <th>Nominal</th>
                      <th>Status</th>
                      <th className="text-right pr-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesQuery.isLoading && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center"
                          style={{ color: palette.secondary }}
                        >
                          Memuat data…
                        </td>
                      </tr>
                    )}
                    {invoicesQuery.isError && (
                      <tr>
                        <td colSpan={7} className="py-8">
                          <div
                            className="flex items-center gap-2 justify-center text-sm"
                            style={{ color: palette.warning1 }}
                          >
                            <AlertTriangle size={16} /> Terjadi kesalahan.{" "}
                            <button
                              className="underline"
                              onClick={() => invoicesQuery.refetch()}
                            >
                              Coba lagi
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!invoicesQuery.isLoading && invoices.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-10 text-center"
                          style={{ color: palette.secondary }}
                        >
                          Belum ada tagihan.
                        </td>
                      </tr>
                    )}

                    {invoices.map((inv) => {
                      const due = normalizeISOToLocalNoon(inv.due_date);
                      return (
                        <tr
                          key={inv.id}
                          className="border-t"
                          style={{ borderColor: palette.white3 }}
                        >
                          <td className="py-3 align-top">
                            <div
                              className="font-medium"
                              style={{ color: palette.quaternary }}
                            >
                              {inv.title}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: palette.secondary }}
                            >
                              {inv.type ?? "-"}
                            </div>
                          </td>
                          <td
                            className="py-3 align-top"
                            style={{ color: palette.quaternary }}
                          >
                            {inv.student_name ?? "-"}
                          </td>
                          <td
                            className="py-3 align-top"
                            style={{ color: palette.primary }}
                          >
                            {inv.class_name ?? "-"}
                          </td>
                          <td
                            className="py-3 align-top"
                            style={{ color: palette.quaternary }}
                          >
                            {dateFmt(due)}
                          </td>
                          <td
                            className="py-3 align-top"
                            style={{ color: palette.quaternary }}
                          >
                            {idr(inv.amount)}
                          </td>
                          <td className="py-3 align-top">
                            {inv.status === "paid" && (
                              <Badge variant="success" palette={palette}>
                                Lunas
                              </Badge>
                            )}
                            {inv.status === "partial" && (
                              <Badge variant="info" palette={palette}>
                                Sebagian
                              </Badge>
                            )}
                            {inv.status === "unpaid" && (
                              <Badge variant="outline" palette={palette}>
                                Belum Bayar
                              </Badge>
                            )}
                            {inv.status === "overdue" && (
                              <Badge variant="warning" palette={palette}>
                                Terlambat
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 align-top">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                className="underline"
                                style={{ color: palette.primary }}
                                onClick={() => onDetail(inv)}
                              >
                                Detail
                              </button>
                              {inv.status !== "paid" && (
                                <Btn
                                  size="sm"
                                  palette={palette}
                                  onClick={() =>
                                    markPaid.mutate({ id: inv.id })
                                  }
                                >
                                  Tandai Lunas
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

              <div
                className="mt-3 text-xs flex items-center justify-between"
                style={{ color: palette.secondary }}
              >
                <div>
                  {invoicesQuery.isFetching
                    ? "Memuat ulang…"
                    : `Menampilkan ${invoices.length} tagihan`}
                </div>
                <button
                  className="underline"
                  onClick={() => invoicesQuery.refetch()}
                >
                  Refresh
                </button>
              </div>
            </SectionCard>
          ) : (
            <SectionCard palette={palette} className="p-2 md:p-4">
              {/* payments view */}
              <ul
                className="md:hidden divide-y"
                style={{ borderColor: palette.white3 }}
              >
                {paymentsQuery.isLoading && (
                  <li
                    className="py-6 text-center"
                    style={{ color: palette.secondary }}
                  >
                    Memuat data…
                  </li>
                )}
                {paymentsQuery.isError && (
                  <li className="py-6">
                    <div
                      className="flex items-center gap-2 justify-center text-sm"
                      style={{ color: palette.warning1 }}
                    >
                      <AlertTriangle size={16} /> Terjadi kesalahan.{" "}
                      <button
                        className="underline"
                        onClick={() => paymentsQuery.refetch()}
                      >
                        Coba lagi
                      </button>
                    </div>
                  </li>
                )}
                {!paymentsQuery.isLoading && payments.length === 0 && (
                  <li
                    className="py-8 text-center"
                    style={{ color: palette.secondary }}
                  >
                    Belum ada pembayaran.
                  </li>
                )}
                {payments.map((p) => {
                  const dt = normalizeISOToLocalNoon(p.date);
                  return (
                    <li key={p.id} className="py-3">
                      <div className="min-w-0">
                        <div
                          className="font-medium"
                          style={{ color: palette.quaternary }}
                        >
                          {idr(p.amount)}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: palette.secondary }}
                        >
                          {p.method ?? "-"} • {p.invoice_title ?? "-"}
                        </div>
                        <div
                          className="mt-2 text-sm"
                          style={{ color: palette.quaternary }}
                        >
                          {dateFmt(dt)} — {p.payer_name ?? "-"}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="hidden md:block overflow-auto">
                <table className="min-w-[850px] w-full">
                  <thead>
                    <tr
                      className="text-left text-sm"
                      style={{ color: palette.secondary }}
                    >
                      <th className="py-3">Tanggal</th>
                      <th>Nama</th>
                      <th>Tagihan</th>
                      <th>Metode</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsQuery.isLoading && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center"
                          style={{ color: palette.secondary }}
                        >
                          Memuat data…
                        </td>
                      </tr>
                    )}
                    {paymentsQuery.isError && (
                      <tr>
                        <td colSpan={5} className="py-8">
                          <div
                            className="flex items-center gap-2 justify-center text-sm"
                            style={{ color: palette.warning1 }}
                          >
                            <AlertTriangle size={16} /> Terjadi kesalahan.{" "}
                            <button
                              className="underline"
                              onClick={() => paymentsQuery.refetch()}
                            >
                              Coba lagi
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {!paymentsQuery.isLoading && payments.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center"
                          style={{ color: palette.secondary }}
                        >
                          Belum ada pembayaran.
                        </td>
                      </tr>
                    )}
                    {payments.map((p) => {
                      const dt = normalizeISOToLocalNoon(p.date);
                      return (
                        <tr
                          key={p.id}
                          className="border-t"
                          style={{ borderColor: palette.white3 }}
                        >
                          <td
                            className="py-3 align-top"
                            style={{ color: palette.quaternary }}
                          >
                            {dateFmt(dt)}
                          </td>
                          <td
                            className="py-3 align-top"
                            style={{ color: palette.quaternary }}
                          >
                            {p.payer_name ?? "-"}
                          </td>
                          <td
                            className="py-3 align-top"
                            style={{ color: palette.primary }}
                          >
                            {p.invoice_title ?? "-"}
                          </td>
                          <td
                            className="py-3 align-top"
                            style={{ color: palette.quaternary }}
                          >
                            {p.method ?? "-"}
                          </td>
                          <td
                            className="py-3 align-top"
                            style={{ color: palette.quaternary }}
                          >
                            {idr(p.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div
                className="mt-3 text-xs flex items-center justify-between"
                style={{ color: palette.secondary }}
              >
                <div>
                  {paymentsQuery.isFetching
                    ? "Memuat ulang…"
                    : `Menampilkan ${payments.length} pembayaran`}
                </div>
                <button
                  className="underline"
                  onClick={() => paymentsQuery.refetch()}
                >
                  Refresh
                </button>
              </div>
            </SectionCard>
          )}

          {/* FAB mobile */}
          <div className="md:hidden fixed right-4 bottom-20">
            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="h-12 w-12 rounded-full grid place-items-center shadow-lg"
              style={{
                background: palette.primary,
                color: palette.white1,
                boxShadow: "0 10px 20px rgba(0,0,0,.15)",
              }}
              aria-label="Buat Tagihan"
            >
              <Plus size={20} />
            </button>
          </div>
        </main>
      </div>

      {/* ====== Modals (render di akhir) ====== */}
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
    </>
  );
}
