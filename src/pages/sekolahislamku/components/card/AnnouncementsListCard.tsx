import { Link } from "react-router-dom";
import { Bell, ChevronRight, Download } from "lucide-react";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

export interface Announcement {
  id: string;
  title: string;
  date: string; // ISO
  body: string;
  type?: "info" | "warning" | "success";
}

export default function AnnouncementsListCard({
  palette,
  items,
  dateFmt,
  seeAllPath = "/notifikasi",
}: {
  palette: Palette;
  items: Announcement[];
  dateFmt: (iso: string) => string;
  seeAllPath?: string;
}) {
  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 pb-2 flex flex-row items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <Bell size={20} color={palette.quaternary} /> Pengumuman ini
        </h3>
        <div className="flex items-center gap-2">
          <Link to={seeAllPath}>
            <Btn variant="ghost" size="sm" palette={palette}>
              Lihat semua <ChevronRight className="ml-1" size={16} />
            </Btn>
          </Link>
        </div>
      </div>

      <div className="p-4 pt-2 sm:p-4 lg:px-3 lg:py-0 mb-4 space-y-3">
        {items.map((a) => (
          <SectionCard
            key={a.id}
            palette={palette}
            className="p-3"
            style={{ background: palette.white2 }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <div className="font-medium">{a.title}</div>
                <div style={{ fontSize: 12, color: palette.silver2 }}>
                  {dateFmt(a.date)}
                </div>
                <p className="text-sm mt-1" style={{ color: palette.black2 }}>
                  {a.body}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge
                    variant={
                      a.type === "warning"
                        ? "warning"
                        : a.type === "success"
                          ? "success"
                          : "info"
                    }
                    palette={palette}
                  >
                    {a.type ?? "info"}
                  </Badge>
                </div>
              </div>

              {/* actions: di bawah pada mobile, di kanan pada md+ */}
              <div className="flex items-center gap-2 mt-3 md:mt-0 md:ml-4">
                <Btn
                  size="sm"
                  palette={palette}
                  variant="white1"
                >
                  <Download className="mr-2" size={16} /> Lampiran
                </Btn>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </SectionCard>
  );
}
