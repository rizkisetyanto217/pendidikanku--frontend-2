import { Link } from "react-router-dom";
import { ChevronRight, Wallet } from "lucide-react";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export interface BillItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // ISO
  status: "unpaid" | "paid" | "overdue";
}

export default function BillsSectionCard({
  palette,
  bills,
  dateFmt,
  formatIDR,
  seeAllPath = "/tagihan",
  getPayHref = (b) => `/tagihan/${b.id}`,
  className = "",
}: {
  palette: Palette;
  bills: BillItem[];
  dateFmt: (iso: string) => string;
  formatIDR: (n: number) => string;
  seeAllPath?: string;
  getPayHref?: (bill: BillItem) => string;
  className?: string;
}) {
  const unpaid = bills.filter((b) => b.status !== "paid");

  return (
    <SectionCard
      palette={palette}
      className={`w-full min-w-0 h-full flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="p-4  pb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <Wallet size={20} color={palette.quaternary} />
          Tagihan & Pembayaran
        </h3>
        <Link to={seeAllPath}>
          <Btn size="sm" variant="ghost" palette={palette}>
            Lihat semua <ChevronRight className="ml-1" size={16} />
          </Btn>
        </Link>
      </div>

      {/* List (isi mengisi sisa tinggi kartu) */}
      <div className="px-4 md:px-5 pb-4 pt-2 space-y-3 min-w-0 flex-1">
        {unpaid.length === 0 && (
          <div style={{ fontSize: 14, color: palette.silver2 }}>
            Tidak ada tagihan yang belum dibayar. Alhamdulillah!
          </div>
        )}

        {unpaid.map((bill) => (
          <div
            key={bill.id}
            className="rounded-xl border p-3"
            style={{ borderColor: palette.silver1, background: palette.white2 }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{bill.title}</div>
                <div style={{ fontSize: 12, color: palette.silver2 }}>
                  Jatuh tempo: {dateFmt(bill.dueDate)}
                </div>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 md:justify-end">
                <div className="flex items-center gap-2 md:block md:text-right">
                  <div className="text-sm font-semibold">
                    {formatIDR(bill.amount)}
                  </div>
                  <div className="md:mt-1">
                    <Badge
                      variant={
                        bill.status === "overdue"
                          ? "destructive"
                          : bill.status === "paid"
                            ? "success"
                            : "secondary"
                      }
                      palette={palette}
                      className="w-fit"
                    >
                      {bill.status === "unpaid"
                        ? "Belum bayar"
                        : bill.status === "overdue"
                          ? "Terlambat"
                          : "Lunas"}
                    </Badge>
                  </div>
                </div>

                <Link to={getPayHref(bill)} className="w-full md:w-auto">
                  <Btn size="sm" palette={palette} className="w-full md:w-auto">
                    Bayar
                  </Btn>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
