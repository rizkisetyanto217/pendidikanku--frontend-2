import React, { useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Wallet, FileText, CheckCircle2, ArrowLeft } from "lucide-react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "../../components/home/ParentTopBar";
import ParentSidebar from "../../components/home/ParentSideBar";

/* =========================
   Types
========================= */
type BillStatus = "unpaid" | "paid" | "overdue";
type BillItem = { id: string; name: string; qty?: number; amount: number };

interface BillDetail {
  id: string;
  title: string;
  invoiceNo: string;
  createdAt: string; // ISO
  dueDate: string; // ISO
  status: BillStatus;
  student: { name: string; className: string };
  items: BillItem[];
  discount?: number;
  adminFee?: number;
  total: number;
  payment?: { date: string; method: string; ref: string };
}

/* =========================
   Date helpers (timezone-safe)
========================= */
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
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

const hijriLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

/* =========================
   Currency
========================= */
const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/* =========================
   Fake API (dummy)
========================= */
async function fetchBillDetail(billId: string): Promise<BillDetail> {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();

  const datasets: Record<string, Omit<BillDetail, "total">> = {
    "paid-example": {
      id: "paid-example",
      title: "SPP Juli 2025",
      invoiceNo: "INV-2025-07-014",
      createdAt: iso(new Date(now.getFullYear(), 6, 1)),
      dueDate: iso(new Date(now.getFullYear(), 6, 10)),
      status: "paid",
      student: { name: "Ahmad", className: "TPA A" },
      items: [
        { id: "i1", name: "SPP Bulanan", amount: 150_000 },
        { id: "i2", name: "Infaq Kegiatan", amount: 10_000 },
      ],
      discount: 0,
      adminFee: 2_500,
      payment: {
        date: iso(new Date(now.getFullYear(), 6, 5, 9, 12)),
        method: "Midtrans (VA BSI)",
        ref: "MID-VA-7F3K2Q",
      },
    },
    "overdue-example": {
      id: "overdue-example",
      title: "SPP Juni 2025",
      invoiceNo: "INV-2025-06-098",
      createdAt: iso(new Date(now.getFullYear(), 5, 1)),
      dueDate: iso(new Date(now.getFullYear(), 5, 10)),
      status: "overdue",
      student: { name: "Ahmad", className: "TPA A" },
      items: [
        { id: "i1", name: "SPP Bulanan", amount: 150_000 },
        { id: "i2", name: "Denda Keterlambatan", amount: 5_000 },
      ],
      discount: 0,
      adminFee: 0,
    },
    default: {
      id: billId || "b1",
      title: "SPP Agustus 2025",
      invoiceNo: "INV-2025-08-001",
      createdAt: iso(new Date(now.getFullYear(), 7, 1)),
      dueDate: iso(new Date(now.getFullYear(), 7, 17)),
      status: "unpaid",
      student: { name: "Ahmad", className: "TPA A" },
      items: [
        { id: "i1", name: "SPP Bulanan", amount: 150_000 },
        { id: "i2", name: "Buku Panduan Iqra", qty: 1, amount: 20_000 },
      ],
      discount: 10_000,
      adminFee: 2_500,
    },
  };

  const data = datasets[billId] ?? datasets.default;
  const subtotal = data.items.reduce(
    (acc, it) => acc + it.amount * (it.qty ?? 1),
    0
  );
  const total = subtotal - (data.discount ?? 0) + (data.adminFee ?? 0);
  return { ...data, total };
}

/* =========================
   Small bits
========================= */
function Row({
  left,
  right,
  palette,
  boldRight,
  className,
  style,
  ...rest
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  palette: Palette;
  boldRight?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  // default teks hitam; masih bisa dioverride
  const mergedStyle: React.CSSProperties = {
    color: palette.black2,
    ...(style || {}),
  };

  return (
    <div
      className={`flex items-center justify-between py-1 text-sm ${className ?? ""}`}
      style={mergedStyle}
      {...rest}
    >
      <span style={{ color: palette.silver2 }}>{left}</span>
      <span style={{ fontWeight: boldRight ? 700 : 500 }}>{right}</span>
    </div>
  );
}

function FinanceHeaderCard({
  palette,
  data,
}: {
  palette: Palette;
  data?: BillDetail;
}) {
  return (
    <SectionCard palette={palette} className="p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ background: palette.primary2 }}
          >
            <Wallet size={18} color={palette.primary} />
          </div>
          <div>
            <div className="font-semibold">{data?.title ?? "—"}</div>
            <div className="text-sm" style={{ color: palette.black2 }}>
              {data
                ? `Invoice ${data.invoiceNo} • Jatuh tempo ${dateLong(data.dueDate)}`
                : "—"}
            </div>
          </div>
        </div>

        {data && (
          <div className="flex flex-col gap-2 sm:flex-row">
            {data.status !== "paid" ? (
              <Link
                to={`/tagihan/${data.id}/bayar`}
                className="w-full sm:w-auto"
              >
                <Btn palette={palette} className="w-full sm:w-auto">
                  Bayar Sekarang
                </Btn>
              </Link>
            ) : (
              <div className="flex gap-2">
                <Btn variant="success" palette={palette}>
                  <CheckCircle2 size={16} /> Lunas
                </Btn>
              </div>
            )}
            <Btn variant="outline" palette={palette}>
              <FileText size={16} /> Unduh Invoice
            </Btn>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function ItemsTable({
  palette,
  items,
  loading,
}: {
  palette: Palette;
  items?: BillItem[];
  loading?: boolean;
}) {
  return (
    <SectionCard palette={palette} className="p-4 md:p-5 lg:col-span-2">
      <div className="font-medium mb-2">Rincian Tagihan</div>
      <div
        className="rounded-xl border"
        style={{ borderColor: palette.silver1, background: palette.white2 }}
      >
        <div
          className="grid grid-cols-12 px-3 py-2 text-xs"
          style={{ color: palette.black2 }}
        >
          <div className="col-span-7">Item</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-3 text-right">Jumlah</div>
        </div>

        {loading && (
          <div
            className="px-3 py-3 text-sm"
            style={{ color: palette.silver2 }}
            aria-live="polite"
          >
            Memuat...
          </div>
        )}

        {!loading &&
          (items ?? []).map((it) => (
            <div
              key={it.id}
              className="grid grid-cols-12 px-3 py-2 border-t"
              style={{ borderColor: palette.silver1 }}
            >
              <div className="col-span-7">{it.name}</div>
              <div className="col-span-2 text-right">{it.qty ?? 1}x</div>
              <div className="col-span-3 text-right">
                {formatIDR(it.amount)}
              </div>
            </div>
          ))}

        {!loading && (!items || items.length === 0) && (
          <div className="px-3 py-3 text-sm" style={{ color: palette.silver2 }}>
            Tidak ada item.
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function SummaryCard({
  palette,
  data,
}: {
  palette: Palette;
  data?: BillDetail;
}) {
  const subtotal = useMemo(
    () => (data?.items ?? []).reduce((a, b) => a + b.amount * (b.qty ?? 1), 0),
    [data?.items]
  );

  return (
    <SectionCard palette={palette} className="p-4 md:p-5">
      <div className="font-medium mb-2">Ringkasan</div>
      <div
        className="rounded-xl border p-3"
        style={{
          borderColor: palette.silver1,
          background: palette.white2,
          color: palette.black2,
        }}
      >
        <Row
          left="Siswa"
          right={`${data?.student.name ?? "—"} • ${data?.student.className ?? "—"}`}
          palette={palette}
        />
        <Row
          left="Tanggal dibuat"
          right={data ? dateLong(data.createdAt) : "—"}
          palette={palette}
        />
        <Row
          left="Jatuh tempo"
          right={data ? dateLong(data.dueDate) : "—"}
          palette={palette}
        />

        <div
          className="my-2 border-t"
          style={{ borderColor: palette.silver1 }}
        />

        <Row left="Subtotal" right={formatIDR(subtotal)} palette={palette} />
        {data?.discount ? (
          <Row
            left="Diskon"
            right={`- ${formatIDR(data.discount)}`}
            palette={palette}
          />
        ) : null}
        {data?.adminFee ? (
          <Row
            left="Biaya admin"
            right={formatIDR(data.adminFee)}
            palette={palette}
          />
        ) : null}

        <div
          className="mt-2 border-t"
          style={{ borderColor: palette.silver1 }}
        />

        <Row
          left={<span className="font-semibold">Total</span>}
          right={formatIDR(data?.total ?? 0)}
          palette={palette}
          boldRight
        />
      </div>

      {data?.payment && (
        <div className="mt-3">
          <div className="text-sm font-medium mb-1">Pembayaran</div>
          <div
            className="rounded-xl border p-3 text-sm"
            style={{ borderColor: palette.silver1, background: palette.white2 }}
          >
            <div style={{ color: palette.silver2 }}>Tanggal</div>
            <div className="font-medium">{dateLong(data.payment.date)}</div>

            <div className="mt-2" style={{ color: palette.silver2 }}>
              Metode
            </div>
            <div className="font-medium">{data.payment.method}</div>

            <div className="mt-2" style={{ color: palette.silver2 }}>
              Ref
            </div>
            <div className="font-medium">{data.payment.ref}</div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/* =========================
   Page
========================= */
export default function StudentFinance() {
  const { billId: billIdParam } = useParams();
  const billId = billIdParam || "default";
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const isFromMenuUtama = location.pathname.includes("/menu-utama/");

  const { data, isLoading, error } = useQuery({
    queryKey: ["bill-detail", billId],
    queryFn: () => fetchBillDetail(billId),
    staleTime: 60_000,
  });

  const topbarGregorianISO = useMemo(() => toLocalNoonISO(new Date()), []);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        gregorianDate={topbarGregorianISO}
        hijriDate={hijriLong(topbarGregorianISO)}
        title="Pembayaran"
        dateFmt={dateLong}
        showBack={isFromMenuUtama}
      />

      <main className="w-full px-4 md:px-6 py-4  md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            <div className="md:flex hidden items-center gap-3">
              <Btn
                palette={palette}
                onClick={() => navigate(-1)}
                variant="ghost"
                className="cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft size={20} />
              </Btn>

              <h1 className="text-lg font-semibold">Pembayaran</h1>
            </div>
            {error ? (
              <SectionCard palette={palette} className="p-4">
                <div style={{ color: palette.primary }}>
                  Gagal memuat data tagihan.
                </div>
              </SectionCard>
            ) : (
              <>
                <FinanceHeaderCard palette={palette} data={data} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <ItemsTable
                    palette={palette}
                    items={data?.items}
                    loading={isLoading}
                  />
                  <SummaryCard palette={palette} data={data} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
