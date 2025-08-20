import { Link } from "react-router-dom";
import { Bell, ChevronRight, Edit3, Trash2, Plus } from "lucide-react";
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

const generateSlug = (text: string) =>
  (text ?? "")
    .toLowerCase()
    .trim()
    .replace(/[_—–]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AnnouncementsListCard({
  palette,
  items,
  dateFmt,
  seeAllPath,
  getDetailHref,
  getEditHref,
  onEdit,
  onDelete,
  showActions = true,
  canAdd = false,
  onAdd,
  addHref,
  deletingId,
}: {
  palette: Palette;
  items: Announcement[];
  dateFmt: (iso: string) => string;
  seeAllPath: string;
  getDetailHref?: (a: Announcement) => string;
  getEditHref?: (a: Announcement) => string;
  onEdit?: (a: Announcement) => void;
  onDelete?: (a: Announcement) => void;
  showActions?: boolean;
  canAdd?: boolean;
  onAdd?: () => void;
  addHref?: string;
  deletingId?: string | null;
}) {
  const isEmpty = !items || items.length === 0;

  return (
    <SectionCard palette={palette}>
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

          <div className="flex flex-wrap items-center gap-2">
            {canAdd &&
              (onAdd ? (
                <Btn size="sm" palette={palette} onClick={onAdd}>
                  <Plus className="mr-1" size={16} />
                  <span className="hidden xs:inline">Tambah</span>
                </Btn>
              ) : addHref ? (
                <Link to={addHref}>
                  <Btn size="sm" palette={palette}>
                    <Plus className="mr-1" size={16} />
                    <span className="hidden xs:inline">Tambah</span>
                  </Btn>
                </Link>
              ) : null)}

            <Link to={seeAllPath}>
              <Btn variant="ghost" size="sm" palette={palette}>
                <span className="hidden xs:inline">Lihat semua</span>
                <ChevronRight className="xs:ml-1" size={16} />
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
                  {/* Left: content (clickable) */}
                  <Link to={detailHref} className="min-w-0 block">
                    <div className="font-medium truncate">{a.title}</div>
                    <div
                      className="mt-0.5 text-[12px]"
                      style={{ color: palette.silver2 }}
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

                  {/* Right: actions */}
                  {showActions && (
                    <div className="flex md:flex-col items-center md:items-end justify-end gap-2 md:gap-2">
                      {onEdit ? (
                        <Btn
                          size="sm"
                          palette={palette}
                          variant="secondary"
                          onClick={() => onEdit(a)}
                          disabled={isDeleting}
                          aria-label="Edit pengumuman"
                        >
                          <Edit3 className="mr-1" size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </Btn>
                      ) : (
                        <Link to={editHref}>
                          <Btn
                            size="sm"
                            palette={palette}
                            variant="secondary"
                            disabled={isDeleting}
                            aria-label="Edit pengumuman"
                          >
                            <Edit3 className="mr-1" size={16} />
                            <span className="hidden sm:inline">Edit</span>
                          </Btn>
                        </Link>
                      )}

                      <Btn
                        size="sm"
                        palette={palette}
                        onClick={() => {
                          if (isDeleting) return;
                          if (onDelete) return onDelete(a);
                          if (confirm(`Hapus pengumuman "${a.title}"?`)) {
                            alert(
                              "Implement onDelete untuk menghapus di server."
                            );
                          }
                        }}
                        disabled={isDeleting}
                        className="focus:outline-none"
                        aria-label={
                          isDeleting ? "Sedang menghapus" : "Hapus pengumuman"
                        }
                        style={{
                          background: palette.error1,
                          color: palette.white1,
                          borderColor: palette.error1,
                          boxShadow: `0 0 0 2px ${palette.error2} inset`,
                          opacity: isDeleting ? 0.7 : 1,
                        }}
                      >
                        <Trash2 className="mr-1" size={16} />
                        <span className="hidden sm:inline">
                          {isDeleting ? "Menghapus…" : "Hapus"}
                        </span>
                      </Btn>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </SectionCard>
  );
}
