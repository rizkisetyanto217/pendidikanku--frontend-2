// src/pages/sekolahislamku/pages/finance/SchoolSpp.tsx

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Banknote,
  BarChart2,
  CreditCard,
  Users,
  CalendarDays,
  Filter as FilterIcon,
  RefreshCcw,
  Download,
  ArrowLeft,
} from "lucide-react";

/* ================== Date & format helpers ================== */
const atLocalNoon = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};
const toLocalNoonISO = (d: Date) => atLocalNoon(d).toISOString();
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

/* ================= Types ================= */
export type SppStatus = "unpaid" | "partial" | "paid" | "overdue";

type SppSummary = {
  month: string;
  scheduled: number;
  collected: number;
  outstanding: number;
  students_affected: number;
};

type SppBillRow = {
  id: string;
  student_id: string;
  student_name: string;
  class_name?: string;
  amount: number;
  due_date: string;
  status: SppStatus;
};

type ApiSppBillsResp = {
  list: SppBillRow[];
  classes?: string[];
};

/* =============== Page =============== */
const SchoolSpp: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const gregorianISO = toLocalNoonISO(new Date());

  // ==== Filters ====
  const today = new Date();
  const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState<string>(ym);
  const [kelas, setKelas] = useState<string>("");
  const [status, setStatus] = useState<SppStatus | "semua">("semua");
  const [q, setQ] = useState<string>("");

  // ==== Data dummy (sementara) ====
  const summaryQ = useQuery({
    queryKey: ["spp-summary", month],
    queryFn: async () => ({
      month,
      scheduled: 120,
      collected: 72000000,
      outstanding: 18500000,
      students_affected: 37,
    }),
  });

  const billsQ = useQuery({
    queryKey: ["spp-bills", { month, q, kelas, status }],
    queryFn: async () => {
      const dummy: ApiSppBillsResp = {
        list: Array.from({ length: 10 }).map((_, i) => ({
          id: `spp-${i + 1}`,
          student_id: `S-${1000 + i}`,
          student_name: `Siswa ${i + 1}`,
          class_name: ["1A", "1B", "2A", "2B"][i % 4],
          amount: 150000 + (i % 3) * 50000,
          due_date: new Date(
            today.getFullYear(),
            today.getMonth(),
            20
          ).toISOString(),
          status: (["unpaid", "partial", "paid", "overdue"] as SppStatus[])[
            i % 4
          ],
        })),
        classes: ["1A", "1B", "2A", "2B", "3A"],
      };
      return dummy;
    },
  });

  const bills = billsQ.data?.list ?? [];
  const classOptions = billsQ.data?.classes ?? ["1A", "1B", "2A", "2B"];

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="SPP"
        gregorianDate={gregorianISO}
        hijriDate={hijriLong(gregorianISO)}
        dateFmt={dateLong}
      />

      <main className="mx-auto px-7 md:py-8 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-2">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-10 space-y-6 min-w-0">
            {/* Back button biasa */}
            <div className="mx-auto Replace flex gap-4 items-center">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft size={20} />
              </Btn>
              <h1 className="text-base font-semibold">SPP Murid</h1>
            </div>

            {/* Filter */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 font-medium flex items-center gap-2">
                <FilterIcon size={18} /> Filter
              </div>
              <div className="px-4 md:px-5 pb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.black2 }}
                  >
                    Bulan
                  </div>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.black1,
                    }}
                  />
                </div>
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.black2 }}
                  >
                    Kelas
                  </div>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.black1,
                    }}
                  >
                    <option value="">Semua</option>
                    {classOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.black2 }}
                  >
                    Status
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.black1,
                    }}
                  >
                    <option value="semua">Semua</option>
                    <option value="paid">Lunas</option>
                    <option value="partial">Sebagian</option>
                    <option value="unpaid">Belum Bayar</option>
                    <option value="overdue">Terlambat</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <div
                    className="text-xs mb-1"
                    style={{ color: palette.black2 }}
                  >
                    Cari siswa/ID
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Ketik nama siswa…"
                      className="w-full h-11 rounded-lg border px-3 bg-transparent text-sm"
                      style={{
                        borderColor: palette.silver1,
                        color: palette.black1,
                      }}
                    />
                    <Btn
                      palette={palette}
                      variant="outline"
                      size="sm"
                      onClick={() => billsQ.refetch()}
                    >
                      <RefreshCcw size={16} />
                    </Btn>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Table */}
            <SectionCard palette={palette}>
              <div className="p-4 md:p-5 pb-2 flex items-center justify-between">
                <div className="font-medium">Daftar SPP</div>
                <Btn palette={palette} variant="outline" size="sm">
                  <Download size={16} /> Export
                </Btn>
              </div>
              <div className="px-4 md:px-5 pb-4 overflow-x-auto">
                <table className="w-full text-sm min-w-[880px]">
                  <thead
                    className="text-left"
                    style={{ color: palette.silver2 }}
                  >
                    <tr
                      className="border-b"
                      style={{ borderColor: palette.silver1 }}
                    >
                      <th className="py-2 pr-4">Siswa</th>
                      <th className="py-2 pr-4">Kelas</th>
                      <th className="py-2 pr-4">Nominal</th>
                      <th className="py-2 pr-4">Jatuh Tempo</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: palette.silver1 }}
                  >
                    {bills.map((r) => (
                      <tr key={r.id} className="align-middle">
                        <td className="py-3 pr-4 font-medium">
                          {r.student_name}
                        </td>
                        <td className="py-3 pr-4">{r.class_name ?? "-"}</td>
                        <td className="py-3 pr-4">{idr(r.amount)}</td>
                        <td className="py-3 pr-4">
                          {new Date(r.due_date).toLocaleDateString("id-ID")}
                        </td>
                        <td className="py-3 pr-4">
                          {r.status === "paid" && (
                            <Badge palette={palette} variant="success">
                              Lunas
                            </Badge>
                          )}
                          {r.status === "partial" && (
                            <Badge palette={palette} variant="info">
                              Sebagian
                            </Badge>
                          )}
                          {r.status === "unpaid" && (
                            <Badge palette={palette} variant="outline">
                              Belum Bayar
                            </Badge>
                          )}
                          {r.status === "overdue" && (
                            <Badge palette={palette} variant="warning">
                              Terlambat
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 pr-2">
                          <div className="flex justify-end gap-2">
                            <Btn palette={palette} size="sm" variant="outline">
                              Detail
                            </Btn>
                            {r.status !== "paid" && (
                              <Btn palette={palette} size="sm">
                                Tagih
                              </Btn>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SchoolSpp;

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
          {icon ?? <BarChart2 size={18} />}
        </span>
        <div>
          <div className="text-xs" style={{ color: palette.silver2 }}>
            {label}
          </div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </SectionCard>
  );
}
