import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Constants & utils
import { colors } from "@/constants/colorsThema";

// UI primitives
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

// Icons
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Receipt,
  ShieldCheck,
} from "lucide-react";

// Layout components
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
      {/* TopBar */}
      <ParentTopBar showBack palette={palette} title="Tagihan & Pembayaran" />

      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar kiri */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Konten kanan */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 justify-between">
              <div className="md:flex hidden items-center gap-3">
                <Btn
                  variant="ghost"
                  palette={palette}
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                </Btn>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Info utama */}
              <div className="lg:col-span-2 space-y-4">
                <SectionCard palette={palette} className="p-5">
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
                    <>
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
                    </>
                  )}
                </SectionCard>

                <SectionCard
                  palette={palette}
                  className="p-4 flex items-start gap-3"
                >
                  <ShieldCheck
                    size={18}
                    className="mt-0.5"
                    color={palette.quaternary}
                  />
                  <p className="text-sm" style={{ color: palette.black2 }}>
                    Pembayaran diproses secara aman. Simpan bukti transaksi
                    setelah berhasil.
                  </p>
                </SectionCard>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <SectionCard
                  palette={palette}
                  className="p-4 sticky top-20 space-y-4"
                >
                  <div className="text-sm" style={{ color: palette.black2 }}>
                    Total Pembayaran
                  </div>
                  <div className="text-2xl font-bold">
                    {bill ? formatIDR(bill.amount) : "-"}
                  </div>
                  <Btn
                    size="lg"
                    palette={palette}
                    className="w-full"
                    disabled={isPaid}
                    onClick={handleBayar}
                  >
                    {isPaid ? "Sudah Dibayar" : "Hubungi Sekarang"}
                  </Btn>
                  {!isPaid && payUrl && (
                    <a
                      href={payUrl}
                      className="block text-center text-sm underline"
                      style={{ color: palette.secondary }}
                    >
                      Buka tautan pembayaran
                    </a>
                  )}
                </SectionCard>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
