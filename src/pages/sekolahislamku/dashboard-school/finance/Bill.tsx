import * as React from "react";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import { colors } from "@/constants/colorsThema";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Wallet,
  ArrowLeft,
  Calendar as CalendarIcon,
  Receipt,
  ShieldCheck,
} from "lucide-react";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

/* ===================== Types ===================== */
export interface BillItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // ISO
  status: "unpaid" | "paid" | "overdue";
  description?: string;
  invoiceNo?: string;
}

/* ===================== Helpers ===================== */
const badgeVariants = {
  unpaid: "secondary",
  overdue: "destructive",
  paid: "success",
} as const;

const statusText: Record<BillItem["status"], string> = {
  unpaid: "Belum bayar",
  overdue: "Terlambat",
  paid: "Lunas",
};

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/** TODO: sambungkan ke API-mu kalau mau fallback fetch by id */
async function fetchBillById(id: string): Promise<BillItem | null> {
  console.warn("[Bill] fetchBillById belum diimplementasikan. ID:", id);
  return null;
}

/* ===================== Page ===================== */
export default function Bill({
  palette: paletteProp,
}: { palette?: Palette } = {}) {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const linkState = (location.state ?? {}) as {
    bill?: BillItem;
    payUrl?: string;
    basePath?: string;
  };

  const palette: Palette = paletteProp ?? colors.light;

  const [bill, setBill] = React.useState<BillItem | null | undefined>(
    linkState.bill
  );
  const [loading, setLoading] = React.useState<boolean>(
    !linkState.bill && !!id
  );
  const [error, setError] = React.useState<string | null>(null);
  const payUrl = linkState.payUrl ?? null;

  React.useEffect(() => {
    let mounted = true;
    if (!bill && id) {
      (async () => {
        try {
          setLoading(true);
          const res = await fetchBillById(id);
          if (!mounted) return;
          if (res) setBill(res);
          else setError("Data tagihan tidak ditemukan.");
        } catch (e) {
          console.error(e);
          if (mounted) setError("Gagal memuat data tagihan.");
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    }
    return () => {
      mounted = false;
    };
  }, [bill, id]);

  const isPaid = bill?.status === "paid";
  const backHref =
    linkState.basePath ?? (slug ? `/${slug}/sekolah/all-invoices` : "..");

  const handleBayar = () => {
    if (isPaid || !bill) return;
    if (payUrl) {
      window.location.href = payUrl;
      return;
    }
    alert("Integrasi pembayaran belum dikonfigurasi.");
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* TopBar sama seperti dashboard */}
      <ParentTopBar palette={palette} title="Tagihan & Pembayaran" />

      {/* ====== CONTAINER LAYOUT SAMA ====== */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar kiri */}
          <aside className="lg:col-span-3">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Konten kanan */}
          <section className="lg:col-span-9 space-y-6 min-w-0">
            {/* Breadcrumb kecil */}
            <div className="flex items-center gap-2">
              <Btn
                variant="ghost"
                size="sm"
                palette={palette}
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Kembali
              </Btn>
              {/* <Link
                to={backHref}
                className="text-sm underline"
                style={{ color: palette.secondary }}
              >
                Lihat semua tagihan
              </Link> */}
            </div>

            {/* Kartu Detail Tagihan */}
            <SectionCard palette={palette} className="w-full">
              {/* Header card */}
              <div
                className="p-4 md:p-5 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${palette.silver1}` }}
              >
                <div className="flex items-center gap-2">
                  <Wallet size={22} color={palette.quaternary} />
                  <h2 className="text-lg md:text-xl font-semibold">
                    Detail Tagihan
                  </h2>
                </div>
                {bill && (
                  <Badge
                    variant={badgeVariants[bill.status]}
                    palette={palette}
                    className="shrink-0"
                  >
                    {statusText[bill.status]}
                  </Badge>
                )}
              </div>

              {/* Body */}
              <div className="px-4 md:px-5 py-5">
                {loading && (
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Memuat data tagihan…
                  </div>
                )}
                {!loading && error && (
                  <div className="text-sm" style={{ color: palette.error1 }}>
                    {error}
                  </div>
                )}
                {!loading && !error && !bill && (
                  <div className="text-sm" style={{ color: palette.silver2 }}>
                    Data tagihan tidak tersedia.
                  </div>
                )}

                {bill && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Info */}
                    <div className="lg:col-span-2 space-y-4">
                      <div
                        className="rounded-2xl border p-4"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white2,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-base md:text-lg font-semibold truncate">
                              {bill.title}
                            </div>
                            {bill.invoiceNo && (
                              <div
                                className="text-xs"
                                style={{ color: palette.black2 }}
                              >
                                No. Invoice: {bill.invoiceNo}
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div
                              className="text-xs"
                              style={{ color: palette.black2 }}
                            >
                              Total
                            </div>
                            <div className="text-xl md:text-2xl font-bold">
                              {formatIDR(bill.amount)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon size={16} />
                            <span>Jatuh tempo: {dateFmt(bill.dueDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Receipt size={16} />
                            <span>Status: {statusText[bill.status]}</span>
                          </div>
                        </div>

                        {bill.description && (
                          <p
                            className="mt-3 text-sm leading-relaxed"
                            style={{ color: palette.black2 }}
                          >
                            {bill.description}
                          </p>
                        )}
                      </div>

                      <div
                        className="rounded-2xl border p-4 flex items-start gap-3"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white2,
                        }}
                      >
                        <ShieldCheck
                          size={18}
                          className="mt-0.5"
                          color={palette.quaternary}
                        />
                        <p
                          className="text-sm"
                          style={{ color: palette.black2 }}
                        >
                          Pembayaran diproses secara aman. Simpan bukti
                          transaksi setelah berhasil.
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <div
                        className="rounded-2xl border p-4 sticky top-20"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white2,
                        }}
                      >
                        <div
                          className="mb-2 text-sm"
                          style={{ color: palette.black2 }}
                        >
                          Total Pembayaran
                        </div>
                        <div className="mb-4 text-2xl font-bold">
                          {bill ? formatIDR(bill.amount) : "-"}
                        </div>

                        <Btn
                          size="lg"
                          palette={palette}
                          className="w-full"
                          disabled={isPaid}
                          onClick={handleBayar}
                        >
                          {isPaid ? "Sudah Dibayar" : "Bayar Sekarang"}
                        </Btn>

                        {!isPaid && payUrl && (
                          <a
                            href={payUrl}
                            className="block text-center text-sm underline mt-2"
                            style={{ color: palette.secondary }}
                          >
                            Buka tautan pembayaran
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
}
