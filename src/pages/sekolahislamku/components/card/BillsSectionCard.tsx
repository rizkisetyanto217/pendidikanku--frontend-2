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
  dueDate: string; // ISO date string
  status: "unpaid" | "paid" | "overdue";
}

interface BillsSectionCardProps {
  palette: Palette;
  bills: BillItem[];
  dateFmt: (iso: string) => string;
  formatIDR: (n: number) => string;
  seeAllPath?: string;
  getPayHref?: (bill: BillItem) => string;
  className?: string;
}

const getBadgeVariant = (status: BillItem["status"]) => {
  switch (status) {
    case "overdue":
      return "destructive";
    case "paid":
      return "success";
    default:
      return "secondary";
  }
};

const getStatusText = (status: BillItem["status"]) => {
  switch (status) {
    case "unpaid":
      return "Belum bayar";
    case "overdue":
      return "Terlambat";
    case "paid":
      return "Lunas";
    default:
      return "Belum bayar";
  }
};

const EmptyState = ({ palette }: { palette: Palette }) => (
  <div style={{ fontSize: 14, color: palette.silver2 }}>
    Tidak ada tagihan yang belum dibayar. Alhamdulillah!
  </div>
);

const BillCard = ({
  bill,
  palette,
  dateFmt,
  formatIDR,
  getPayHref,
}: {
  bill: BillItem;
  palette: Palette;
  dateFmt: (iso: string) => string;
  formatIDR: (n: number) => string;
  getPayHref: (bill: BillItem) => string;
}) => (
  <div
    className="rounded-xl border p-3"
    style={{
      borderColor: palette.silver1,
      background: palette.white2,
    }}
  >
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Bill Info */}
      <div className="min-w-0">
        <div className="font-medium truncate">{bill.title}</div>
        <div style={{ fontSize: 12, color: palette.silver2 }}>
          Jatuh tempo: {dateFmt(bill.dueDate)}
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <div className="flex items-center gap-2 md:flex-col md:items-center md:gap-1 md:min-w-0 md:flex-1">
          <div className="text-sm font-semibold text-center md:text-center">
            {formatIDR(bill.amount)}
          </div>
          <Badge
            variant={getBadgeVariant(bill.status)}
            palette={palette}
            className="w-auto md:w-auto md:mt-0  text-center"
          >
            {getStatusText(bill.status)}
          </Badge>
        </div>

        <Link
          to={getPayHref(bill)}
          className="w-full md:w-auto md:flex-shrink-0"
        >
          <Btn
            size="sm"
            palette={palette}
            className="w-full md:w-auto md:px-6 md:mt-5"
          >
            Bayar
          </Btn>
        </Link>
      </div>
    </div>
  </div>
);

export default function BillsSectionCard({
  palette,
  bills,
  dateFmt,
  formatIDR,
  seeAllPath = "/tagihan",
  getPayHref = (b) => `/tagihan/${b.id}`,
  className = "",
}: BillsSectionCardProps) {
  const unpaidBills = bills.filter((bill) => bill.status !== "paid");

  return (
    <SectionCard
      palette={palette}
      className={`w-full min-w-0 h-full flex flex-col it ${className}`}
    >
      {/* Header */}
      <div className="p-3 pb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <Wallet size={20} color={palette.quaternary} />
          Tagihan & Pembayaran
        </h3>

        <Link to={"/sekolah/semua-tagihan"}>
          <Btn
            size="sm"
            variant="ghost"
            palette={palette}
            className="flex items-center gap-1"
          >
            Lihat semua
            <ChevronRight size={16} />
          </Btn>
        </Link>
      </div>

      {/* Bills List */}
      <div className="px-4 md:px-4 pb-4 pt-2 space-y-3 min-w-0 flex-1">
        {unpaidBills.length === 0 ? (
          <EmptyState palette={palette} />
        ) : (
          unpaidBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              palette={palette}
              dateFmt={dateFmt}
              formatIDR={formatIDR}
              getPayHref={getPayHref}
            />
          ))
        )}
      </div>
    </SectionCard>
  );
}
