import { Link } from "react-router-dom";
import { Bell, ChevronRight, Edit3, Trash2, Plus } from "lucide-react";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

/* ================= Types ================= */
export interface Announcement {
  id: string;
  title: string;
  date: string; // ISO
  body: string;
  type?: "info" | "warning" | "success";
  slug?: string;
}

export type AnnouncementsListCardProps<TSeeAllState = unknown> = {
  palette: Palette;
  items: Announcement[];
  dateFmt: (iso: string) => string;
  seeAllPath: string;
  /** Optional: state yang akan dikirim ke halaman “lihat semua” */
  seeAllState?: TSeeAllState;
  getDetailHref?: (a: Announcement) => string;
  getEditHref?: (a: Announcement) => string;
  onEdit?: (a: Announcement) => void;
  onDelete?: (a: Announcement) => void;
  showActions?: boolean;
  canAdd?: boolean;
  onAdd?: () => void;
  addHref?: string;
  deletingId?: string | null;
  className?: string;
};

const generateSlug = (text: string) =>
  (text ?? "")
    .toLowerCase()
    .trim()
    .replace(/[_—–]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ================= Component ================= */
export default function AnnouncementsListCard<TSeeAllState = unknown>({
  palette,
  items,
  dateFmt,
  seeAllPath,
  seeAllState,
  getDetailHref,
  getEditHref,
  onEdit,
  onDelete,
  showActions = true,
  canAdd = false,
  onAdd,
  addHref,
  deletingId,
  className = "",
}: AnnouncementsListCardProps<TSeeAllState>) {
  const isEmpty = !items || items.length === 0;

  return (
    <SectionCard palette={palette} className={className}>
      {/* ===== Header ===== */}
      <div
        className="p-4 md:p-5 pb-3 border-b"
        style={{ borderColor: palette.silver1 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
            <Bell size={20} color={palette.quaternary} />
            Pengumuman
          </h3>

          <div className="hidden md:flex flex-wrap items-center gap-2">
            {canAdd &&
              (onAdd ? (
                <Btn size="sm" palette={palette} onClick={onAdd}>
                  <Plus className="mr-1" size={16} />
                </Btn>
              ) : addHref ? (
                <Link to={addHref}>
                  <Btn size="sm" palette={palette}>
                    <Plus className="mr-1" size={16} />
                  </Btn>
                </Link>
              ) : null)}

            {/* tombol lihat semua desktop */}
            <Link to={seeAllPath} state={seeAllState as unknown}>
              <Btn
                variant="ghost"
                size="sm"
                palette={palette}
                className="gap-1"
              >
                Lihat semua
                <ChevronRight size={16} />
              </Btn>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== List ===== */}
      <div className="p-4 md:p-5 space-y-3">
        {isEmpty && (
          <div
            className="rounded-xl border p-4 text-sm"
            style={{ borderColor: palette.silver1, color: palette.silver2 }}
          >
            Belum ada pengumuman.
          </div>
        )}

        {!isEmpty &&
          items.map((a) => {
            const slug = a.slug || generateSlug(a.title);
            const detailHref = getDetailHref
              ? getDetailHref(a)
              : `/pengumuman/${slug}`;
            const editHref = getEditHref?.(a) ?? detailHref;
            const isDeleting = deletingId === a.id;

            return (
              <div
                key={a.id}
                className="rounded-xl border transition-all hover:translate-x-[1px]"
                style={{
                  borderColor: palette.silver1,
                  background: palette.white1,
                }}
              >
                <div className="p-3 sm:p-4 md:p-5 grid gap-3 md:gap-4 md:grid-cols-[1fr,auto]">
                  {/* Left: content */}
                  <Link to={detailHref} className="min-w-0 block">
                    <div className="font-medium truncate">{a.title}</div>
                    <div
                      className="mt-0.5 text-[12px]"
                      style={{ color: palette.black2 }}
                    >
                      {dateFmt(a.date)}
                    </div>
                    <p
                      className="text-sm mt-2 line-clamp-3"
                      style={{ color: palette.black2 }}
                    >
                      {a.body}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
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

                  {/* Right: actions (edit/hapus) */}
                  {showActions && (
                    <div className="flex items-center gap-2 justify-end">
                      {onEdit && (
                        <Btn
                          size="sm"
                          variant="outline"
                          palette={palette}
                          onClick={() => onEdit(a)}
                        >
                          <Edit3 size={14} />
                        </Btn>
                      )}
                      {onDelete && (
                        <Btn
                          size="sm"
                          variant="quaternary"
                          palette={palette}
                          onClick={() => onDelete(a)}
                          disabled={isDeleting}
                        >
                          <Trash2 size={14} />
                        </Btn>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* ===== Footer tombol khusus mobile ===== */}
      <div className="px-4 pb-4 md:hidden">
        <Link to={seeAllPath} state={seeAllState as unknown}>
          <Btn
            size="sm"
            variant="ghost"
            palette={palette}
            className="w-full flex items-center justify-center gap-1"
          >
            Lihat semua
            <ChevronRight size={16} />
          </Btn>
        </Link>
      </div>
    </SectionCard>
  );
}
