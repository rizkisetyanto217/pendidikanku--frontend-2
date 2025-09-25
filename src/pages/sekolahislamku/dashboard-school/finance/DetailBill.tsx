import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

// Theme & utils
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

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
  ArrowLeft,
  Calendar,
  User,
  CreditCard,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Edit3,
  Trash2,
} from "lucide-react";

// Types from main component
export type InvoiceStatus = "unpaid" | "partial" | "paid" | "overdue";

export interface InvoiceDetail {
  id: string;
  title: string;
  description?: string;
  student_id?: string;
  student_name?: string;
  class_name?: string;
  created_date: string;
  due_date: string;
  amount: number;
  paid_amount?: number;
  status: InvoiceStatus;
  type?: string;
  payment_history: PaymentHistoryItem[];
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  method?: string;
  notes?: string;
  receipt_number?: string;
}

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

const timeFmt = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

/* ================= Dummy Data ================= */
const dummyInvoiceDetail: InvoiceDetail = {
  id: "inv001",
  title: "SPP September 2025",
  description: "Pembayaran SPP untuk bulan September 2025 kelas 1A",
  student_id: "stu001",
  student_name: "Ahmad Fauzi",
  class_name: "1A",
  created_date: "2025-09-01T12:00:00.000Z",
  due_date: "2025-09-15T12:00:00.000Z",
  amount: 500000,
  paid_amount: 500000,
  status: "paid",
  type: "SPP",
  payment_history: [
    {
      id: "pay001",
      date: "2025-09-14T12:00:00.000Z",
      amount: 500000,
      method: "Transfer Bank",
      notes: "Transfer via BCA",
      receipt_number: "TRX20250914001",
    },
  ],
};

/* ================= Status Badge Component ================= */
const StatusBadge: React.FC<{ status: InvoiceStatus; palette: Palette }> = ({
  status,
  palette,
}) => {
  const statusConfig = {
    paid: { variant: "success" as const, icon: "✓", label: "Lunas" },
    partial: { variant: "info" as const, icon: "◐", label: "Sebagian" },
    unpaid: { variant: "outline" as const, icon: "○", label: "Belum Bayar" },
    overdue: { variant: "warning" as const, icon: "⚠", label: "Terlambat" },
  };

  const config = statusConfig[status];

  return (
    <Badge palette={palette} variant={config.variant}>
      <span className="flex items-center gap-1">
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    </Badge>
  );
};

/* ================= Loading Component ================= */
const LoadingSpinner: React.FC<{ text?: string; palette: Palette }> = ({
  text = "Memuat...",
  palette,
}) => (
  <div className="py-12 text-center">
    <div
      className="inline-flex items-center gap-2"
      style={{ color: palette.black2 }}
    >
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      {text}
    </div>
  </div>
);

/* ================= Info Row Component ================= */
const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  palette: Palette;
  className?: string;
}> = ({ icon, label, value, palette, className = "" }) => (
  <div className={`flex items-start gap-3 ${className}`}>
    <span
      className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
      style={{ backgroundColor: palette.primary2, color: palette.primary }}
    >
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <div className="text-sm" style={{ color: palette.black2 }}>
        {label}
      </div>
      <div className="font-medium text-base mt-1">{value}</div>
    </div>
  </div>
);

/* ================= Main Component ================= */
const DetailBill: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const gregorianISO = toLocalNoonISO(new Date());
  const isFromMenuUtama = location.pathname.includes("/menu-utama/");

  // ===== Query =====
  const invoiceQuery = useQuery({
    queryKey: ["invoice-detail", id],
    queryFn: async (): Promise<InvoiceDetail> => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(dummyInvoiceDetail), 500);
      });
    },
    enabled: !!id,
  });

  const invoice = invoiceQuery.data;

  // ===== Mutations =====
  const markPaid = useMutation({
    mutationFn: async (payload: { id: string; amount?: number }) => {
      return new Promise<void>((resolve) => {
        console.log("Marking invoice as paid:", payload);
        setTimeout(resolve, 1000);
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoice-detail", id] });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (payload: { id: string }) => {
      return new Promise<void>((resolve) => {
        console.log("Deleting invoice:", payload);
        setTimeout(resolve, 1000);
      });
    },
    onSuccess: () => {
      navigate("/keuangan");
    },
  });

  // ===== Event Handlers =====
  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    console.log("Edit invoice:", id);
    // Navigate to edit page or open edit modal
  };

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus tagihan ini?")) {
      deleteInvoice.mutate({ id: id! });
    }
  };

  const handleMarkPaid = () => {
    if (!invoice) return;
    const remainingAmount = invoice.amount - (invoice.paid_amount || 0);
    markPaid.mutate({ id: invoice.id, amount: remainingAmount });
  };

  const handleDownloadReceipt = (paymentId: string) => {
    console.log("Download receipt for payment:", paymentId);
    // Implement receipt download logic
  };

  const getPaymentMethodIcon = (method?: string) => {
    const iconMap: Record<string, string> = {
      "Transfer Bank": "🏦",
      Tunai: "💵",
      "E-Wallet": "📱",
    };
    return iconMap[method || ""] || "💳";
  };

  if (invoiceQuery.isLoading) {
    return (
      <div
        className="min-h-full w-full"
        style={{ background: palette.white2, color: palette.black1 }}
      >
        <ParentTopBar
          palette={palette}
          title="Detail Tagihan"
          gregorianDate={gregorianISO}
          hijriDate={hijriLong(gregorianISO)}
          dateFmt={dateLong}
          showBack
        />
        <main className="w-full px-4 md:px-6 md:py-8">
          <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
            <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
              <ParentSidebar palette={palette} />
            </aside>
            <section className="flex-1">
              <LoadingSpinner
                text="Memuat detail tagihan..."
                palette={palette}
              />
            </section>
          </div>
        </main>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div
        className="min-h-full w-full"
        style={{ background: palette.white2, color: palette.black1 }}
      >
        <ParentTopBar
          palette={palette}
          title="Detail Tagihan"
          gregorianDate={gregorianISO}
          hijriDate={hijriLong(gregorianISO)}
          dateFmt={dateLong}
          showBack={true}
        />
        <main className="w-full px-4 md:px-6 md:py-8">
          <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
            <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
              <ParentSidebar palette={palette} />
            </aside>
            <section className="flex-1">
              <div className="py-12 text-center">
                <div className="text-4xl mb-3">❌</div>
                <div className="font-medium mb-1">Tagihan Tidak Ditemukan</div>
                <div className="text-sm mb-4" style={{ color: palette.black2 }}>
                  Tagihan dengan ID tersebut tidak ada atau telah dihapus
                </div>
                <Btn palette={palette} onClick={handleGoBack}>
                  Kembali ke Daftar Tagihan
                </Btn>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  const dueDate = normalizeISOToLocalNoon(invoice.due_date);
  const createdDate = normalizeISOToLocalNoon(invoice.created_date);
  const isOverdue = invoice.status === "overdue";
  const remainingAmount = invoice.amount - (invoice.paid_amount || 0);

  return (
    <div
      className="min-h-full w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* TopBar */}
      <ParentTopBar
        palette={palette}
        title="Detail Tagihan"
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

          {/* Main Content */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-3 items-center">
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={handleGoBack}
                  className="md:inline-flex items-center gap-2 hidden "
                >
                  <ArrowLeft size={20} />
                </Btn>
                <div>
                  <h1 className="text-lg font-semibold">{invoice.title}</h1>
                  <p className="text-sm" style={{ color: palette.black2 }}>
                    ID: {invoice.id}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Btn
                  palette={palette}
                  variant="outline"
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </Btn>
                <Btn
                  palette={palette}
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={deleteInvoice.isPending}
                  className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Hapus</span>
                </Btn>
              </div>
            </div>

            {/* Status Banner */}
            {isOverdue && (
              <div
                className="p-4 rounded-lg border-l-4"
                style={{
                  backgroundColor: `${palette.warning1}15`,
                  borderLeftColor: palette.warning1,
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: palette.warning1 }}
                  />
                  <div>
                    <div
                      className="font-medium"
                      style={{ color: palette.warning1 }}
                    >
                      Tagihan Terlambat
                    </div>
                    <div
                      className="text-sm mt-1"
                      style={{ color: palette.black2 }}
                    >
                      Tagihan ini telah melewati batas waktu pembayaran pada{" "}
                      {dateFmt(dueDate)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Invoice Information */}
              <SectionCard palette={palette}>
                <div
                  className="px-4 py-4 border-b"
                  style={{ borderColor: palette.silver1 }}
                >
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText size={20} />
                    Informasi Tagihan
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <InfoRow
                    icon={<User size={16} />}
                    label="Nama Siswa"
                    value={invoice.student_name || "-"}
                    palette={palette}
                  />
                  <InfoRow
                    icon={<FileText size={16} />}
                    label="Kelas"
                    value={invoice.class_name || "-"}
                    palette={palette}
                  />
                  <InfoRow
                    icon={<Calendar size={16} />}
                    label="Tanggal Dibuat"
                    value={dateFmt(createdDate)}
                    palette={palette}
                  />
                  <InfoRow
                    icon={<Clock size={16} />}
                    label="Jatuh Tempo"
                    value={
                      <span
                        className={
                          isOverdue ? "text-red-600 font-semibold" : ""
                        }
                      >
                        {dateFmt(dueDate)}
                      </span>
                    }
                    palette={palette}
                  />
                  <InfoRow
                    icon={
                      <Badge palette={palette} variant="outline">
                        {invoice.type || "Umum"}
                      </Badge>
                    }
                    label="Jenis Tagihan"
                    value=""
                    palette={palette}
                  />
                  {invoice.description && (
                    <InfoRow
                      icon={<FileText size={16} />}
                      label="Keterangan"
                      value={invoice.description}
                      palette={palette}
                    />
                  )}
                </div>
              </SectionCard>

              {/* Payment Summary */}
              <SectionCard palette={palette}>
                <div
                  className="px-4 py-4 border-b"
                  style={{ borderColor: palette.silver1 }}
                >
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CreditCard size={20} />
                    Ringkasan Pembayaran
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span style={{ color: palette.black2 }}>
                      Total Tagihan:
                    </span>
                    <span className="font-bold text-xl">
                      {idr(invoice.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span style={{ color: palette.black2 }}>
                      Sudah Dibayar:
                    </span>
                    <span
                      className="font-semibold text-lg"
                      style={{ color: palette.primary }}
                    >
                      {idr(invoice.paid_amount || 0)}
                    </span>
                  </div>
                  <div
                    className="h-px"
                    style={{ backgroundColor: palette.silver1 }}
                  ></div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Sisa Tagihan:</span>
                    <span
                      className={`font-bold text-xl ${
                        remainingAmount > 0 ? "text-red-600" : ""
                      }`}
                      style={{
                        color:
                          remainingAmount === 0 ? palette.primary : undefined,
                      }}
                    >
                      {idr(remainingAmount)}
                    </span>
                  </div>
                  <div className="pt-2">
                    <StatusBadge status={invoice.status} palette={palette} />
                  </div>
                  {remainingAmount > 0 && (
                    <div className="pt-2">
                      <Btn
                        palette={palette}
                        onClick={handleMarkPaid}
                        disabled={markPaid.isPending}
                        className="w-full"
                      >
                        {markPaid.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin"></div>
                            Memproses...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            Tandai Lunas
                          </div>
                        )}
                      </Btn>
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Payment History */}
            {invoice.payment_history.length > 0 && (
              <SectionCard palette={palette}>
                <div
                  className="px-4 py-4 border-b"
                  style={{ borderColor: palette.silver1 }}
                >
                  <h3 className="font-semibold text-lg">Riwayat Pembayaran</h3>
                  <p className="text-sm mt-1" style={{ color: palette.black2 }}>
                    {invoice.payment_history.length} pembayaran tercatat
                  </p>
                </div>
                <div
                  className="divide-y"
                  style={{ borderColor: palette.silver1 }}
                >
                  {invoice.payment_history.map((payment) => {
                    const paymentDate = normalizeISOToLocalNoon(payment.date);
                    return (
                      <div key={payment.id} className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">
                                {getPaymentMethodIcon(payment.method)}
                              </span>
                              <div>
                                <div className="font-semibold text-lg">
                                  {idr(payment.amount)}
                                </div>
                                <div
                                  className="text-sm"
                                  style={{ color: palette.black2 }}
                                >
                                  {dateFmt(paymentDate)} •{" "}
                                  {timeFmt(paymentDate)}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <span style={{ color: palette.black2 }}>
                                  Metode:{" "}
                                </span>
                                <span className="font-medium">
                                  {payment.method || "Tidak diketahui"}
                                </span>
                              </div>
                              {payment.receipt_number && (
                                <div>
                                  <span style={{ color: palette.black2 }}>
                                    No. Kuitansi:{" "}
                                  </span>
                                  <span className="font-mono text-sm">
                                    {payment.receipt_number}
                                  </span>
                                </div>
                              )}
                              {payment.notes && (
                                <div>
                                  <span style={{ color: palette.black2 }}>
                                    Catatan:{" "}
                                  </span>
                                  <span>{payment.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Btn
                              palette={palette}
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReceipt(payment.id)}
                              className="inline-flex items-center gap-2"
                            >
                              <Download size={14} />
                              <span className="hidden sm:inline">Kuitansi</span>
                            </Btn>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default DetailBill;
