import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
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
}: {
  palette: Palette;
  bills: BillItem[];
  dateFmt: (iso: string) => string;
  formatIDR: (n: number) => string;
  seeAllPath?: string;
  getPayHref?: (bill: BillItem) => string;
}) {
  const unpaid = bills.filter((b) => b.status !== "paid");

  return (
    <SectionCard palette={palette} className="lg:col-span-2">
      <div className="p-4 md:p-5 pb-2 flex flex-row items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <Wallet size={20} color={palette.quaternary} /> Tagihan & Pembayaran
        </h3>
        <Link to={seeAllPath}>
          <Btn size="sm" variant="ghost" palette={palette}>
            Lihat semua
          </Btn>
        </Link>
      </div>

      <div className="sm:p-4 md:pt-1 pt-2 space-y-3">
        {unpaid.length === 0 && (
          <div style={{ fontSize: 14, color: palette.silver2 }}>
            Tidak ada tagihan yang belum dibayar. Alhamdulillah!
          </div>
        )}

        {unpaid.map((bill) => (
          <SectionCard
            key={bill.id}
            palette={palette}
            className="p-3"
            style={{ background: palette.white2 }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="font-medium">{bill.title}</div>
                <div style={{ fontSize: 12, color: palette.silver2 }}>
                  Jatuh tempo: {dateFmt(bill.dueDate)}
                </div>
              </div>

              {/* kanan: amount + badge sejajar di mobile, stack di desktop */}
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
          </SectionCard>
        ))}
      </div>
    </SectionCard>
  );
}
