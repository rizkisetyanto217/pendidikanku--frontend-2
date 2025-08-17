import { Link } from "react-router-dom";
import { Bell, ChevronRight, Edit3, Trash2 } from "lucide-react";
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
  slug?: string;
}

// Helper slug
const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function AnnouncementsListCard({
  palette,
  items,
  dateFmt,
  seeAllPath,
  getDetailHref,
  getEditHref,
  onEdit,
  onDelete,
  showActions = true, // ← NEW: kontrol tampilkan tombol Edit/Hapus
}: {
  palette: Palette;
  items: Announcement[];
  dateFmt: (iso: string) => string;
  seeAllPath: string;
  getDetailHref?: (a: Announcement) => string;
  getEditHref?: (a: Announcement) => string;
  onEdit?: (a: Announcement) => void;
  onDelete?: (a: Announcement) => void;
  showActions?: boolean; // ← NEW
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
          const slug = a.slug || generateSlug(a.title);
          const detailHref = getDetailHref
            ? getDetailHref(a)
            : `/pengumuman/${slug}`;
          const editHref = getEditHref?.(a) ?? detailHref;

          return (
            <SectionCard
              key={a.id}
              palette={palette}
              className="p-3 transition-all hover:translate-x-[1px]"
              style={{ background: palette.white2 }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                {/* Left: text */}
                <Link to={detailHref} className="min-w-0 block">
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

                {/* Right: actions (disembunyikan jika showActions = false) */}
                {showActions && (onEdit || onDelete || getEditHref) && (
                  <div className="flex items-center gap-2 mt-3 md:mt-0 md:ml-4">
                    {onEdit ? (
                      <Btn
                        size="sm"
                        palette={palette}
                        variant="secondary"
                        onClick={() => onEdit(a)}
                      >
                        <Edit3 className="mr-1" size={16} />
                        Edit
                      </Btn>
                    ) : (
                      <Link to={editHref}>
                        <Btn size="sm" palette={palette} variant="secondary">
                          <Edit3 className="mr-1" size={16} />
                          Edit
                        </Btn>
                      </Link>
                    )}

                    <Btn
                      size="sm"
                      palette={palette}
                      onClick={() => {
                        if (onDelete) return onDelete(a);
                        if (confirm(`Hapus pengumuman "${a.title}"?`)) {
                          alert(
                            "Implement onDelete untuk menghapus di server."
                          );
                        }
                      }}
                      className="focus:outline-none"
                      style={{
                        background: palette.error1,
                        color: palette.white1,
                        borderColor: palette.error1,
                        boxShadow: `0 0 0 2px ${palette.error2} inset`,
                      }}
                    >
                      <Trash2 className="mr-1" size={16} />
                      Hapus
                    </Btn>
                  </div>
                )}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </SectionCard>
  );
}
