import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Receipt, ArrowLeft } from "lucide-react";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

/* ---------------- Types ---------------- */
type BillItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // ISO
  status: "unpaid" | "paid" | "overdue";
};

type LocationState = {
  bills?: BillItem[];
  parentName?: string;
  gregorianDate?: string;
  hijriDate?: string;
};

/* ---------------- Fake fetch (samakan dengan StudentDashboard untuk fallback) ---------------- */
async function fetchParentHome() {
  return Promise.resolve({
    parentName: "Bapak/Ibu",
    hijriDate: "16 Muharram 1447 H",
    gregorianDate: new Date().toISOString(),
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

/* ---------------- Helpers ---------------- */
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

/* ================= Page ================= */
export default function ListFinance() {
  const { state } = useLocation() as { state?: LocationState };
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  const { data } = useQuery({
    queryKey: ["parent-home-single"], // sama dengan dashboard
    queryFn: fetchParentHome,
    staleTime: 60_000,
  });

  // Prioritaskan bills dari state (klik "Lihat semua"), kalau tidak ada ambil dari fetch.
  const bills: BillItem[] = state?.bills ?? data?.bills ?? [];

  // Urutkan: overdue -> unpaid -> paid; lalu dueDate terdekat
  const sorted = useMemo(() => {
    const priority = { overdue: 0, unpaid: 1, paid: 2 } as const;
    return [...bills].sort((a, b) => {
      const p = priority[a.status] - priority[b.status];
      if (p !== 0) return p;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [bills]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={state?.parentName ?? "Daftar Tagihan"}
        hijriDate={state?.hijriDate}
        gregorianDate={state?.gregorianDate ?? new Date().toISOString()}
        dateFmt={dateLong}
        showBack
      />

      <main className="w-full px-4 md:px-6  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            <div className="md:flex hidden items-center gap-3">
              <Link to=".." relative="path">
                <Btn palette={palette} variant="ghost" size="md">
                  <ArrowLeft size={20} className="mr-1" />
                </Btn>
              </Link>
              <h1 className="font-semibold text-lg">List Tagihan</h1>
            </div>

            <SectionCard palette={palette}>
              <div className="p-4 md:p-6">
                <h2 className="text-base md:text-lg font-semibold flex items-center gap-2 mb-4">
                  <Receipt size={18} />
                  Semua Tagihan
                </h2>

                <div className="space-y-3">
                  {sorted.map((b) => {
                    const isOverdue = b.status === "overdue";
                    const isPaid = b.status === "paid";
                    return (
                      <div
                        key={b.id}
                        className="rounded-xl border p-3 md:p-4 flex items-start justify-between gap-3"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white1,
                        }}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold">{b.title}</div>
                          <div
                            className="text-xs mt-1 flex items-center gap-2 flex-wrap"
                            style={{ color: palette.black2 }}
                          >
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={12} />
                              Jatuh tempo: {dateLong(b.dueDate)}
                            </span>
                            <Badge
                              palette={palette}
                              variant={
                                isPaid
                                  ? "success"
                                  : isOverdue
                                    ? "destructive"
                                    : "warning"
                              }
                            >
                              {isPaid
                                ? "Lunas"
                                : isOverdue
                                  ? "Terlambat"
                                  : "Belum Dibayar"}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold">{formatIDR(b.amount)}</div>
                          <div className="mt-2">
                            {isPaid ? (
                              <Btn
                                palette={palette}
                                size="sm"
                                variant="outline"
                                disabled
                              >
                                Lunas
                              </Btn>
                            ) : (
                              <Link to={`${b.id}`}>
                                <Btn palette={palette} size="sm">
                                  Bayar
                                </Btn>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {sorted.length === 0 && (
                    <div
                      className="text-center py-10 rounded-xl border-2 border-dashed"
                      style={{
                        borderColor: palette.silver1,
                        color: palette.silver2,
                        background: palette.white1,
                      }}
                    >
                      Tidak ada tagihan.
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
