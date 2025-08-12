// src/pages/sekolahislamku/finance/FinancePage.tsx
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import axios from "@/lib/axios";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";

import {
  Wallet,
  CreditCard,
  AlertTriangle,
  Filter,
  Download,
  Plus,
  Calendar,
  Search,
  CheckCircle2,
} from "lucide-react";

/* ================= Types ================ */
export type InvoiceStatus = "unpaid" | "partial" | "paid" | "overdue";

export interface InvoiceItem {
  id: string;
  title: string; // e.g. SPP Agustus - Kelas 6A
  student_id?: string;
  student_name?: string;
  class_name?: string;
  due_date: string; // ISO
  amount: number; // nominal
  paid_amount?: number; // sudah dibayar
  status: InvoiceStatus;
  type?: string; // SPP/Seragam/Daftar Ulang
}

export interface PaymentItem {
  id: string;
  date: string; // ISO
  payer_name?: string; // siswa/ortu
  invoice_title?: string;
  amount: number;
  method?: string; // cash/transfer/virtual account
}

/* =============== Helpers =============== */
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

/* =============== Main Page =============== */
export default function SchoolFinance() {
  const { isDark } = useHtmlDarkMode();
  const theme: Palette = isDark ? colors.dark : colors.light;
  const qc = useQueryClient();

  // filters
  const today = new Date();
  const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
  const [month, setMonth] = useState<string>(ym);
  const [kelas, setKelas] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<InvoiceStatus | "semua">("semua");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"invoices" | "payments">("invoices");
  const [type, setType] = useState<string | undefined>(undefined);

  // ====== Summary (snapshot)
  const summary = useQuery({
    queryKey: ["finance-summary", { month }],
    queryFn: async () => {
      const res = await axios.get("/api/a/finance/summary", {
        params: { month },
      });
      return res.data as {
        billed: number; // total tertagih bulan ini
        collected: number; // total pembayaran masuk bulan ini
        outstanding: number; // total tunggakan (across invoices)
        alerts?: number; // jumlah tagihan perlu perhatian
      };
    },
  });

  // ====== Invoices
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

  const paymentsQuery = useQuery({
    queryKey: ["payments", { month, q }],
    queryFn: async () => {
      const res = await axios.get("/api/a/payments", { params: { month, q } });
      return res.data as { list: PaymentItem[] };
    },
  });

  const invoices = invoicesQuery.data?.list ?? [];
  const payments = paymentsQuery.data?.list ?? [];
  const classes = invoicesQuery.data?.classes ?? ["1A", "1B", "2A", "2B", "3A"]; // fallback demo
  const types = invoicesQuery.data?.types ?? [
    "SPP",
    "Seragam",
    "Buku",
    "Daftar Ulang",
  ];

  // ====== Actions
  const exportMutation = useMutation({
    mutationFn: async () => {
      // let backend return a file url or blob; here just call endpoint
      return axios.get("/api/a/finance/export", {
        params: { month },
        responseType: "blob",
      });
    },
  });

  const markPaid = useMutation({
    mutationFn: async (payload: { id: string }) =>
      axios.post(`/api/a/invoices/${payload.id}/mark-paid`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });

  const billed = summary.data?.billed ?? 0;
  const collected = summary.data?.collected ?? 0;
  const outstanding = summary.data?.outstanding ?? 0;

  return (
    <>
      <ParentTopBar palette={theme} title="Keuangan" />
      <div className="lg:flex lg:items-start lg:gap-4 lg:p-4 lg:pt-6">
        {/* Sidebar kiri */}
        <SchoolSidebarNav palette={theme} className="hidden lg:block" />

        {/* Konten kanan */}
        <main className="flex-1 mx-auto max-w-3xl py-6 space-y-5">
          {/* Header + actions */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl grid place-items-center"
                style={{ background: theme.white3, color: theme.quaternary }}
              >
                <Wallet size={20} />
              </div>
              <div>
                <h1
                  className="text-xl font-semibold"
                  style={{ color: theme.quaternary }}
                >
                  Keuangan
                </h1>
                <p className="text-sm" style={{ color: theme.secondary }}>
                  Kelola tagihan & pembayaran.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Btn
                palette={theme}
                size="sm"
                variant="outline"
                onClick={() => exportMutation.mutate()}
              >
                <Download size={16} /> Export
              </Btn>
              <NavLink to="/sekolah/keuangan/tagihan/buat">
                <Btn
                  palette={theme}
                  size="sm"
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <Plus size={16} /> Buat Tagihan
                </Btn>
              </NavLink>
              <NavLink to="/sekolah/keuangan/pembayaran/rekam">
                <Btn
                  palette={theme}
                  size="sm"
                  variant="quaternary"
                  className="flex items-center gap-2"
                >
                  <CreditCard size={16} /> Rekam Pembayaran
                </Btn>
              </NavLink>
            </div>
          </div>

          {/* Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: theme.secondary }}>
                    Tertagih Bulan Ini
                  </p>
                  <div
                    className="text-2xl font-semibold"
                    style={{ color: theme.quaternary }}
                  >
                    {idr(billed)}
                  </div>
                </div>
                <Calendar size={18} />
              </div>
            </SectionCard>
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: theme.secondary }}>
                    Tunggakan
                  </p>
                  <div
                    className="text-2xl font-semibold"
                    style={{ color: theme.quaternary }}
                  >
                    {idr(outstanding)}
                  </div>
                </div>
                <Badge variant="warning" palette={theme}>
                  Perlu perhatian
                </Badge>
              </div>
            </SectionCard>
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: theme.secondary }}>
                    Pembayaran Masuk
                  </p>
                  <div
                    className="text-2xl font-semibold"
                    style={{ color: theme.quaternary }}
                  >
                    {idr(collected)}
                  </div>
                </div>
                <CheckCircle2 size={18} />
              </div>
            </SectionCard>
          </div>

          {/* Filter bar */}
          <SectionCard palette={theme} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search */}
              <div
                className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2 border"
                style={{ borderColor: theme.white3, background: theme.white1 }}
              >
                <Search size={16} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={
                    tab === "invoices"
                      ? "Cari tagihan / siswa…"
                      : "Cari pembayaran…"
                  }
                  className="w-full bg-transparent outline-none"
                  style={{ color: theme.quaternary }}
                />
              </div>

              {/* Month */}
              <div
                className="rounded-xl border px-3 py-2"
                style={{
                  borderColor: theme.white3,
                  background: theme.white1,
                  color: theme.quaternary,
                }}
              >
                <div className="text-xs" style={{ color: theme.secondary }}>
                  Bulan
                </div>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="bg-transparent outline-none"
                />
              </div>

              {/* Class & Status only for invoices */}
              {tab === "invoices" && (
                <>
                  <div
                    className="rounded-xl border px-3 py-2"
                    style={{
                      borderColor: theme.white3,
                      background: theme.white1,
                      color: theme.quaternary,
                    }}
                  >
                    <div className="text-xs" style={{ color: theme.secondary }}>
                      Kelas
                    </div>
                    <select
                      value={kelas ?? ""}
                      onChange={(e) => setKelas(e.target.value || undefined)}
                      className="bg-transparent outline-none"
                    >
                      <option value="">Semua</option>
                      {classes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className="rounded-xl border px-3 py-2"
                    style={{
                      borderColor: theme.white3,
                      background: theme.white1,
                      color: theme.quaternary,
                    }}
                  >
                    <div className="text-xs" style={{ color: theme.secondary }}>
                      Jenis
                    </div>
                    <select
                      value={type ?? ""}
                      onChange={(e) => setType(e.target.value || undefined)}
                      className="bg-transparent outline-none"
                    >
                      <option value="">Semua</option>
                      {types.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className="rounded-xl border px-3 py-2"
                    style={{
                      borderColor: theme.white3,
                      background: theme.white1,
                      color: theme.quaternary,
                    }}
                  >
                    <div className="text-xs" style={{ color: theme.secondary }}>
                      Status
                    </div>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="bg-transparent outline-none"
                    >
                      <option value="semua">Semua</option>
                      <option value="unpaid">Belum Bayar</option>
                      <option value="partial">Sebagian</option>
                      <option value="paid">Lunas</option>
                      <option value="overdue">Terlambat</option>
                    </select>
                  </div>
                </>
              )}

              <Btn
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  invoicesQuery.refetch();
                  paymentsQuery.refetch();
                }}
                palette={theme}
              >
                <Filter size={16} /> Terapkan
              </Btn>
            </div>
          </SectionCard>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("invoices")}
              className={`px-3 py-2 rounded-xl text-sm border ${tab === "invoices" ? "font-semibold" : ""}`}
              style={{
                borderColor: theme.silver1,
                color: tab === "invoices" ? theme.quaternary : theme.secondary,
                background: tab === "invoices" ? theme.white2 : theme.white1,
              }}
            >
              Tagihan
            </button>
            <button
              onClick={() => setTab("payments")}
              className={`px-3 py-2 rounded-xl text-sm border ${tab === "payments" ? "font-semibold" : ""}`}
              style={{
                borderColor: theme.silver1,
                color: tab === "payments" ? theme.quaternary : theme.secondary,
                background: tab === "payments" ? theme.white2 : theme.white1,
              }}
            >
              Pembayaran
            </button>
          </div>

          {tab === "invoices" ? (
            <SectionCard palette={theme} className="p-2 md:p-4">
              <div className="overflow-auto">
                <table className="min-w-[950px] w-full">
                  <thead>
                    <tr
                      className="text-left text-sm"
                      style={{ color: theme.secondary }}
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
                          style={{ color: theme.secondary }}
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
                            style={{ color: theme.warning1 }}
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
                          style={{ color: theme.secondary }}
                        >
                          Belum ada tagihan.
                        </td>
                      </tr>
                    )}

                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-t"
                        style={{ borderColor: theme.white3 }}
                      >
                        <td className="py-3 align-top">
                          <div
                            className="font-medium"
                            style={{ color: theme.quaternary }}
                          >
                            {inv.title}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: theme.secondary }}
                          >
                            {inv.type ?? "-"}
                          </div>
                        </td>
                        <td
                          className="py-3 align-top"
                          style={{ color: theme.quaternary }}
                        >
                          {inv.student_name ?? "-"}
                        </td>
                        <td
                          className="py-3 align-top"
                          style={{ color: theme.primary }}
                        >
                          {inv.class_name ?? "-"}
                        </td>
                        <td
                          className="py-3 align-top"
                          style={{ color: theme.quaternary }}
                        >
                          {dateFmt(inv.due_date)}
                        </td>
                        <td
                          className="py-3 align-top"
                          style={{ color: theme.quaternary }}
                        >
                          {idr(inv.amount)}
                        </td>
                        <td className="py-3 align-top">
                          {inv.status === "paid" && (
                            <Badge variant="success" palette={theme}>
                              Lunas
                            </Badge>
                          )}
                          {inv.status === "partial" && (
                            <Badge variant="info" palette={theme}>
                              Sebagian
                            </Badge>
                          )}
                          {inv.status === "unpaid" && (
                            <Badge variant="outline" palette={theme}>
                              Belum Bayar
                            </Badge>
                          )}
                          {inv.status === "overdue" && (
                            <Badge variant="warning" palette={theme}>
                              Terlambat
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 align-top">
                          <div className="flex items-center gap-2 justify-end">
                            <NavLink to={`/sekolah/keuangan/tagihan/${inv.id}`}>
                              Detail
                            </NavLink>
                            {inv.status !== "paid" && (
                              <Btn
                                size="sm"
                                palette={theme}
                                onClick={() => markPaid.mutate({ id: inv.id })}
                              >
                                Tandai Lunas
                              </Btn>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                className="mt-3 text-xs flex items-center justify-between"
                style={{ color: theme.secondary }}
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
            <SectionCard palette={theme} className="p-2 md:p-4">
              <div className="overflow-auto">
                <table className="min-w-[850px] w-full">
                  <thead>
                    <tr
                      className="text-left text-sm"
                      style={{ color: theme.secondary }}
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
                          style={{ color: theme.secondary }}
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
                            style={{ color: theme.warning1 }}
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
                          style={{ color: theme.secondary }}
                        >
                          Belum ada pembayaran.
                        </td>
                      </tr>
                    )}

                    {payments.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t"
                        style={{ borderColor: theme.white3 }}
                      >
                        <td
                          className="py-3 align-top"
                          style={{ color: theme.quaternary }}
                        >
                          {dateFmt(p.date)}
                        </td>
                        <td
                          className="py-3 align-top"
                          style={{ color: theme.quaternary }}
                        >
                          {p.payer_name ?? "-"}
                        </td>
                        <td
                          className="py-3 align-top"
                          style={{ color: theme.primary }}
                        >
                          {p.invoice_title ?? "-"}
                        </td>
                        <td
                          className="py-3 align-top"
                          style={{ color: theme.quaternary }}
                        >
                          {p.method ?? "-"}
                        </td>
                        <td
                          className="py-3 align-top"
                          style={{ color: theme.quaternary }}
                        >
                          {idr(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className="mt-3 text-xs flex items-center justify-between"
                style={{ color: theme.secondary }}
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
        </main>
      </div>
    </>
  );
}
