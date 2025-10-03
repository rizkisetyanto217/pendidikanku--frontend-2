// src/pages/sekolahislamku/pages/finance/SchoolSpp.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

// UI primitives
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
  BarChart2,
  Filter as FilterIcon,
  RefreshCcw,
  Download,
  ArrowLeft,
} from "lucide-react";

/* ================= Helpers ================= */
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

/* ================= Page ================= */
const SchoolSpp: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const gregorianISO = toLocalNoonISO(new Date());

  // Filters
  const today = new Date();
  const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState<string>(ym);
  const [kelas, setKelas] = useState<string>("");
  const [status, setStatus] = useState<SppStatus | "semua">("semua");
  const [q, setQ] = useState<string>("");

  // State modal
  const [detailBill, setDetailBill] = useState<SppBillRow | null>(null);
  const [tagihBill, setTagihBill] = useState<SppBillRow | null>(null);

  // Dummy data
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
  const classOptions = billsQ.data?.classes ?? [];

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
        showBack
      />

      <main className="w-full px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Back */}
            <div className="md:flex hidden gap-3 items-center">
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
                {/* Bulan */}
                <div>
                  <div
                    className="text-sm mb-1"
                    style={{ color: palette.black2 }}
                  >
                    Bulan
                  </div>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full h-11 rounded-lg border px-3 text-sm bg-transparent"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.black1,
                    }}
                  />
                </div>
                {/* Kelas */}
                <div>
                  <div
                    className="text-sm mb-1"
                    style={{ color: palette.black2 }}
                  >
                    Kelas
                  </div>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full h-11 rounded-lg border px-3 text-sm bg-transparent"
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
                {/* Status */}
                <div>
                  <div
                    className="text-sm mb-1"
                    style={{ color: palette.black2 }}
                  >
                    Status
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-11 rounded-lg border px-3 text-sm bg-transparent"
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
                {/* Cari */}
                <div className="md:col-span-2">
                  <div
                    className="text-sm mb-1"
                    style={{ color: palette.black2 }}
                  >
                    Cari siswa/ID
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Ketik nama siswa…"
                      className="w-full h-11 rounded-lg border px-3 text-sm bg-transparent"
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
                    style={{ color: palette.black2 }}
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
                            <Btn
                              palette={palette}
                              size="sm"
                              variant="outline"
                              onClick={() => setDetailBill(r)}
                            >
                              Detail
                            </Btn>
                            {r.status !== "paid" && (
                              <Btn
                                palette={palette}
                                size="sm"
                                onClick={() => setTagihBill(r)}
                              >
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

      {/* Modals */}
      <SppDetailModal
        bill={detailBill}
        onClose={() => setDetailBill(null)}
        palette={palette}
      />
      <SppTagihModal
        bill={tagihBill}
        onClose={() => setTagihBill(null)}
        palette={palette}
      />
    </div>
  );
};

export default SchoolSpp;

/* ================= Modals ================= */
function SppDetailModal({
  bill,
  onClose,
  palette,
}: {
  bill: SppBillRow | null;
  onClose: () => void;
  palette: Palette;
}) {
  if (!bill) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="w-[min(480px,94vw)] rounded-2xl shadow-xl p-5 bg-white"
        style={{ color: palette.black1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Detail Tagihan</h3>
          <button
            className="text-sm px-2 py-1 rounded-lg"
            style={{ color: palette.black2 }}
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
        <div className="grid gap-3 text-sm">
          <InfoRow label="Nama" value={bill.student_name} />
          <InfoRow label="ID" value={bill.student_id} />
          <InfoRow label="Kelas" value={bill.class_name ?? "-"} />
          <InfoRow label="Nominal" value={idr(bill.amount)} />
          <InfoRow
            label="Jatuh Tempo"
            value={new Date(bill.due_date).toLocaleDateString("id-ID")}
          />
          <InfoRow
            label="Status"
            value={
              <Badge
                palette={palette}
                variant={
                  bill.status === "paid"
                    ? "success"
                    : bill.status === "partial"
                      ? "info"
                      : bill.status === "unpaid"
                        ? "outline"
                        : "warning"
                }
              >
                {bill.status === "paid"
                  ? "Lunas"
                  : bill.status === "partial"
                    ? "Sebagian"
                    : bill.status === "unpaid"
                      ? "Belum Bayar"
                      : "Terlambat"}
              </Badge>
            }
          />
        </div>
      </div>
    </div>
  );
}

function SppTagihModal({
  bill,
  onClose,
  palette,
}: {
  bill: SppBillRow | null;
  onClose: () => void;
  palette: Palette;
}) {
  if (!bill) return null;

  const handleSend = () => {
    alert(`Notifikasi tagihan dikirim ke ${bill.student_name}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="w-[min(420px,94vw)] rounded-2xl shadow-xl p-5 bg-white"
        style={{ color: palette.black1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-3">Tagih SPP</h3>
        <p className="text-sm mb-4">
          Kirim notifikasi penagihan kepada{" "}
          <span className="font-medium">{bill.student_name}</span> untuk nominal{" "}
          <span className="font-medium">{idr(bill.amount)}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <Btn palette={palette} variant="ghost" onClick={onClose}>
            Batal
          </Btn>
          <Btn palette={palette} onClick={handleSend}>
            Kirim Tagihan
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ================= Helpers ================= */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm opacity-70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
