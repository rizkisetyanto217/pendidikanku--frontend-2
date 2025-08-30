import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Wallet,
  BadgeCheck,
  Printer,
} from "lucide-react";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

/* ------------ Types ------------ */
export type BillItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // ISO
  status: "unpaid" | "paid" | "overdue";
};

type LocationState = {
  bill?: BillItem; // dikirim dari tombol Bayar
  parentName?: string; // opsional, untuk topbar
  hijriDate?: string;
  gregorianDate?: string;
};

/* ------------ Fallback fetch (sama pola dengan dashboard) ------------ */
async function fetchParentHome() {
  return Promise.resolve({
    parentName: "Bapak/Ibu",
    gregorianDate: new Date().toISOString(),
    hijriDate: "16 Muharram 1447 H",
    bills: [
      {
        id: "b1",
        title: "SPP Agustus 2025",
        amount: 150000,
        dueDate: new Date(
          new Date().setDate(new Date().getDate() + 5)
        ).toISOString(),
        status: "unpaid",
      },
      {
        id: "b2",
        title: "Seragam Olahraga",
        amount: 80000,
        dueDate: new Date(
          new Date().setDate(new Date().getDate() - 3)
        ).toISOString(),
        status: "overdue",
      },
      {
        id: "b3",
        title: "Buku Paket",
        amount: 120000,
        dueDate: new Date().toISOString(),
        status: "paid",
      },
    ] as BillItem[],
  });
}

/* ------------ Helpers ------------ */
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

const statusVariant = (s: BillItem["status"]) =>
  s === "paid" ? "success" : s === "overdue" ? "destructive" : "warning";

/* ============== Page ============== */
export default function InvoiceTagihan() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state?: LocationState };
  const navigate = useNavigate();

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const { data } = useQuery({
    queryKey: ["parent-home-single"],
    queryFn: fetchParentHome,
    staleTime: 60_000,
  });

  // Cari bill: prioritas dari state, kalau tidak ada cari dari fetch
  const billFromState = state?.bill;
  const bill = useMemo<BillItem | undefined>(() => {
    if (billFromState) return billFromState;
    return data?.bills?.find((b) => b.id === id);
  }, [billFromState, data?.bills, id]);

  // Local paid simulation (tanpa API)
  const [isPaidLocal, setPaidLocal] = useState(false);
  const effectiveStatus: BillItem["status"] = isPaidLocal
    ? "paid"
    : (bill?.status ?? "unpaid");

  const handlePay = () => {
    // Di sini nanti ganti dengan call ke API gateway/payment
    setPaidLocal(true);
    // Bisa juga diarahkan ke page sukses pembayaran
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={state?.parentName ?? "Invoice Tagihan"}
        hijriDate={state?.hijriDate ?? data?.hijriDate}
        gregorianDate={state?.gregorianDate ?? data?.gregorianDate}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <Btn
                palette={palette}
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} className="mr-1" />
                Kembali
              </Btn>
              <Btn
                palette={palette}
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer size={16} className="mr-1" />
                Cetak / Unduh
              </Btn>
            </div>

            <SectionCard palette={palette}>
              <div className="p-4 md:p-6">
                {!bill ? (
                  <div
                    className="text-center py-10 rounded-xl border-2 border-dashed"
                    style={{
                      borderColor: palette.black2,
                      color: palette.black2,
                      background: palette.white1,
                    }}
                  >
                    Tagihan tidak ditemukan.
                  </div>
                ) : (
                  <>
                    {/* Header invoice */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <h1 className="text-lg md:text-xl font-bold">
                          Invoice #{bill.id.toUpperCase()}
                        </h1>
                        <div
                          className="text-sm mt-1 flex items-center gap-2 flex-wrap"
                          style={{ color: palette.black2 }}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Wallet size={16} />
                            {bill.title}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={16} />
                            Jatuh tempo: {dateLong(bill.dueDate)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        palette={palette}
                        variant={statusVariant(effectiveStatus)}
                      >
                        {effectiveStatus === "paid"
                          ? "Lunas"
                          : effectiveStatus === "overdue"
                            ? "Terlambat"
                            : "Belum Bayar"}
                      </Badge>
                    </div>

                    {/* Ringkasan item */}
                    <div
                      className="overflow-x-auto rounded-xl border"
                      style={{ borderColor: palette.silver1 }}
                    >
                      <table className="w-full text-sm">
                        <thead style={{ background: palette.white2 }}>
                          <tr>
                            <th className="text-left py-3 px-4">Deskripsi</th>
                            <th className="text-right py-3 px-4 w-40">
                              Jumlah
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ background: palette.white1 }}>
                            <td className="py-3 px-4">{bill.title}</td>
                            <td className="py-3 px-4 text-right">
                              {formatIDR(bill.amount)}
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="py-3 px-4 text-right font-semibold"
                              colSpan={1}
                              style={{ background: palette.white2 }}
                            >
                              Total
                            </td>
                            <td
                              className="py-3 px-4 text-right font-semibold"
                              style={{ background: palette.white2 }}
                            >
                              {formatIDR(bill.amount)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Action */}
                    <div className="mt-4 flex  items-center gap-2 justify-end">
                      <Btn
                        palette={palette}
                        onClick={handlePay}
                        disabled={effectiveStatus === "paid"}
                      >
                        {effectiveStatus === "paid" ? (
                          <>
                            <BadgeCheck size={16} className="mr-2" />
                            Sudah Dibayar
                          </>
                        ) : (
                          "Bayar Sekarang"
                        )}
                      </Btn>

                      {effectiveStatus !== "paid" &&
                        bill.status === "overdue" && (
                          <span
                            className="text-sm"
                            style={{ color: "#EF4444" }}
                          >
                            Tagihan melewati jatuh tempo.
                          </span>
                        )}
                    </div>

                    {/* Footer catatan */}
                    <p
                      className="mt-4 text-xs"
                      style={{ color: palette.black2 }}
                    >
                      *Simpan invoice ini untuk arsip Anda. Klik “Cetak / Unduh”
                      untuk menyimpan sebagai PDF.
                    </p>
                  </>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
