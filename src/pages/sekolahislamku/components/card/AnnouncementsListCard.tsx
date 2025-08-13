// src/pages/sekolahislamku/components/card/AnnouncementsListCard.tsx
import { Link } from "react-router-dom";
import { Bell, ChevronRight } from "lucide-react";
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
  seeAllPath, // <- REQUIRED
  getDetailHref, // <- REQUIRED
}: {
  palette: Palette;
  items: Announcement[];
  dateFmt: (iso: string) => string;
  /** Rute halaman daftar pengumuman (WAJIB) */
  seeAllPath: string;
  /** Builder rute detail per item (WAJIB) */
  getDetailHref: (a: Announcement) => string;
}) {
  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 pb-2 flex flex-row items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <Bell size={20} color={palette.quaternary} /> Pengumuman
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
        {items.map((a) => {
          const href = getDetailHref(a);
          return (
            <SectionCard
              key={a.id}
              palette={palette}
              className="p-3 transition-all hover:translate-x-[1px]"
              style={{ background: palette.white2 }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <Link to={href} className="min-w-0 block">
                  <div className="font-medium truncate">{a.title}</div>
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
                </Link>

                <div className="flex items-center gap-2 mt-3 md:mt-0 md:ml-4">
                  <Link to={href}>
                    <Btn size="sm" palette={palette} variant="white1">
                      Buka <ChevronRight className="ml-1" size={16} />
                    </Btn>
                  </Link>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </SectionCard>
  );
}
