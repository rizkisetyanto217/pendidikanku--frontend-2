import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { pickTheme, ThemeName } from "@/constants/thema";
import { useNavigate } from "react-router-dom";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

import {
  Building2,
  Users as UsersIcon,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  CalendarDays,
  Loader2,
  Eye,
  ArrowLeft,
} from "lucide-react";

/* ===================== CONFIG ===================== */
// Toggle untuk pakai data dummy (tanpa backend). Set ke false jika API siap.
const USE_DUMMY = true;

/* ===================== TYPES ====================== */
export type Room = {
  id: string;
  name: string;
  capacity: number;
  location?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type RoomsResponse = {
  data: Room[];
  pagination: { limit: number; offset: number; total: number };
};

type RoomStats = {
  total: number;
  active: number;
  inUseNow: number;
  availableToday: number;
};

type ApiRoomPayload = {
  room_name: string;
  room_capacity: number;
  room_location: string | null;
  room_is_active: boolean;
};

/* ===================== QK ========================= */
const QK = {
  ROOMS: (q: string, limit: number, offset: number) =>
    ["rooms", q, limit, offset] as const,
  ROOM: (id: string) => ["room", id] as const,
  ROOM_STATS: ["room-stats"] as const,
};

/* ===================== UTILS ====================== */
const atLocalNoonISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
};

const emptyRooms = (limit: number, offset: number): RoomsResponse => ({
  data: [] as Room[],
  pagination: { limit, offset, total: 0 },
});

const ensureRoomsResponse = (
  x: RoomsResponse | undefined,
  limit: number,
  offset: number
): RoomsResponse => x ?? emptyRooms(limit, offset);

/* ============== DUMMY IN-MEMORY STORE ============= */
const seed: Room[] = [
  {
    id: "r-101",
    name: "Kelas 3A",
    capacity: 30,
    location: "Gedung A - Lantai 2",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "r-102",
    name: "Lab Sains",
    capacity: 20,
    location: "Gedung B - Lantai 1",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "r-103",
    name: "Aula Serbaguna",
    capacity: 120,
    location: "Gedung Utama",
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function useDummyRooms() {
  const [rooms, setRooms] = useState<Room[]>(seed);

  const list = (q: string, limit: number, offset: number): RoomsResponse => {
    const kw = q.trim().toLowerCase();
    const filtered = kw
      ? rooms.filter(
          (r) =>
            r.name.toLowerCase().includes(kw) ||
            (r.location ?? "").toLowerCase().includes(kw)
        )
      : rooms;
    const total = filtered.length;
    const data = filtered.slice(offset, offset + limit);
    return { data, pagination: { limit, offset, total } };
  };

  const create = (v: Omit<Room, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString();
    const item: Room = {
      ...v,
      id: `r-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    setRooms((prev) => [item, ...prev]);
    return item;
  };

  const update = (id: string, v: Partial<Room>) => {
    const now = new Date().toISOString();
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...v, updated_at: now } : r))
    );
  };

  const remove = (id: string) =>
    setRooms((prev) => prev.filter((r) => r.id !== id));

  const stats = (): RoomStats => {
    const total = rooms.length;
    const active = rooms.filter((r) => r.is_active).length;
    const inUseNow = Math.min(active, Math.floor(active / 3)); // dummy
    const availableToday = Math.max(0, active - inUseNow);
    return { total, active, inUseNow, availableToday };
  };

  return { list, create, update, remove, stats };
}

/* ================== API QUERIES =================== */
function useRoomsQuery(search: string, limit: number, offset: number) {
  return useQuery<RoomsResponse>({
    queryKey: QK.ROOMS(search, limit, offset),
    queryFn: async () => {
      const res = await axios.get<RoomsResponse>("/api/a/rooms", {
        params: { q: search || undefined, limit, offset },
        withCredentials: true,
      });
      return ensureRoomsResponse(res.data, limit, offset);
    },
    enabled: !USE_DUMMY,
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 0,
  });
}

function useRoomStatsQuery() {
  return useQuery<RoomStats>({
    queryKey: QK.ROOM_STATS,
    queryFn: async () => {
      const res = await axios.get<{ data: RoomStats; found: boolean }>(
        "/api/a/rooms/stats",
        { withCredentials: true }
      );
      return res.data?.found
        ? res.data.data
        : { total: 0, active: 0, inUseNow: 0, availableToday: 0 };
    },
    enabled: !USE_DUMMY,
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 0,
  });
}

/* ================== FLASH BANNER ================== */
interface FlashProps {
  palette: Palette;
  flash: { type: "success" | "error"; msg: string } | null;
}

function Flash({ palette, flash }: FlashProps) {
  if (!flash) return null;
  const isOk = flash.type === "success";
  return (
    <div className="mx-auto Replace px-4">
      <div
        className="mb-3 rounded-lg px-3 py-2 text-sm"
        style={{
          background: isOk ? palette.success2 : palette.error2,
          color: isOk ? palette.success1 : palette.error1,
        }}
      >
        {flash.msg}
      </div>
    </div>
  );
}

/* ================== MODAL UPSERT ================== */
interface RoomModalProps {
  open: boolean;
  onClose: () => void;
  initial: Room | null;
  onSubmit: (v: {
    id?: string;
    name: string;
    capacity: number;
    location?: string;
    is_active: boolean;
  }) => void;
  saving?: boolean;
  error?: string | null;
  palette: Palette;
}

function RoomModal({
  open,
  onClose,
  initial,
  onSubmit,
  saving = false,
  error = null,
  palette,
}: RoomModalProps) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState<number>(30);
  const [location, setLocation] = useState("");
  const [active, setActive] = useState(true);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTouched(false);
    if (initial) {
      setName(initial.name);
      setCapacity(initial.capacity);
      setLocation(initial.location ?? "");
      setActive(initial.is_active);
    } else {
      setName("");
      setCapacity(30);
      setLocation("");
      setActive(true);
    }
  }, [open, initial]);

  if (!open) return null;

  const nameErr = touched && !name.trim() ? "Nama wajib diisi." : "";
  const capErr = touched && capacity <= 0 ? "Kapasitas harus > 0." : "";
  const disabled = saving || !name.trim() || capacity <= 0;

  const handleSubmit = () => {
    if (disabled) return;
    onSubmit({
      id: initial?.id,
      name: name.trim(),
      capacity,
      location: location.trim() || undefined,
      is_active: active,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center"
      style={{ background: "rgba(0,0,0,.35)" }}
    >
      <SectionCard
        palette={palette}
        className="w-[min(720px,94vw)] p-4 md:p-5 rounded-2xl shadow-xl"
        style={{ background: palette.white1, color: palette.black1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit Ruangan" : "Tambah Ruangan"}
          </h3>
        </div>

        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="opacity-80">Nama Ruangan</span>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Mis. 'Ruang Kelas 3B'"
            />
            {nameErr && (
              <span className="text-xs" style={{ color: palette.error1 }}>
                {nameErr}
              </span>
            )}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="opacity-80">Kapasitas</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              onBlur={() => setTouched(true)}
              placeholder="30"
            />
            {capErr && (
              <span className="text-xs" style={{ color: palette.error1 }}>
                {capErr}
              </span>
            )}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="opacity-80">Lokasi (opsional)</span>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: palette.silver2,
                background: palette.white2,
              }}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lantai 2"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <span>Aktif digunakan</span>
          </label>

          {error && !USE_DUMMY && (
            <div className="text-sm" style={{ color: palette.error1 }}>
              {error}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Btn
            palette={palette}
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Btn>
          <Btn palette={palette} onClick={handleSubmit} disabled={disabled}>
            {saving ? "Menyimpan…" : isEdit ? "Simpan" : "Tambah"}
          </Btn>
        </div>
      </SectionCard>
    </div>
  );
}

/* ================== DETAIL DRAWER ================= */
interface RoomDetailProps {
  room: Room | null;
  onClose: () => void;
  palette: Palette;
}

function RoomDetail({ room, onClose, palette }: RoomDetailProps) {
  if (!room) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end"
      style={{ background: "rgba(0,0,0,.25)" }}
      onClick={onClose}
    >
      <div
        className="w-[min(420px,94vw)] h-full p-4 overflow-auto"
        style={{
          background: palette.white1,
          color: palette.black1,
          boxShadow: "rgba(0,0,0,0.1) -6px 0 20px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold mb-2">Detail Ruangan</div>
        <div className="grid gap-2 text-sm">
          <div>
            <div className="opacity-70">Nama</div>
            <div className="font-medium">{room.name}</div>
          </div>
          <div>
            <div className="opacity-70">Kapasitas</div>
            <div className="font-medium">{room.capacity}</div>
          </div>
          <div>
            <div className="opacity-70">Lokasi</div>
            <div className="font-medium">
              {room.location || <span className="opacity-60">—</span>}
            </div>
          </div>
          <div>
            <div className="opacity-70">Status</div>
            <Badge
              palette={palette}
              variant={room.is_active ? "success" : "outline"}
            >
              {room.is_active ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
          {room.updated_at && (
            <div className="opacity-70">
              Diperbarui: {new Date(room.updated_at).toLocaleString("id-ID")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============== SMALL UI HELPERS ============== */
interface KpiTileProps {
  palette: Palette;
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  tone?: "success" | "warning" | "danger";
}

function KpiTile({ palette, label, value, icon, tone }: KpiTileProps) {
  const toneBg =
    tone === "success"
      ? palette.success2
      : tone === "warning"
        ? palette.warning1
        : tone === "danger"
          ? palette.error2
          : palette.primary2;
  const toneTxt =
    tone === "success"
      ? palette.success1
      : tone === "warning"
        ? palette.warning1
        : tone === "danger"
          ? palette.error1
          : palette.primary;

  return (
    <SectionCard palette={palette}>
      <div className="p-4 md:p-5 flex items-center gap-3">
        <span
          className="h-10 w-10 grid place-items-center rounded-xl"
          style={{ background: toneBg, color: toneTxt }}
        >
          {icon ?? <Building2 size={18} />}
        </span>
        <div>
          <div className="text-xs" style={{ color: palette.silver2 }}>
            {label}
          </div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </SectionCard>
  );
}

/* ===================== PAGE ======================= */
export default function RoomSchool() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [flash, setFlash] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Auto-hide flash messages
  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => setFlash(null), 3000);
      return () => clearTimeout(t);
    }
  }, [flash]);

  // Filter & pagination
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  // Dummy store (aktif kalau USE_DUMMY = true)
  const dummy = useDummyRooms();

  // Queries (dimatikan saat dummy)
  const roomsQ = useRoomsQuery(search, limit, offset);
  const statsQ = useRoomStatsQuery();

  // Modal & detail
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<Room | null>(null);
  const [detailRoom, setDetailRoom] = useState<Room | null>(null);

  /* ----------------- MUTATIONS ----------------- */
  const upsertMutation = useMutation({
    mutationFn: async (form: {
      id?: string;
      name: string;
      capacity: number;
      location?: string;
      is_active: boolean;
    }) => {
      if (USE_DUMMY) {
        if (form.id) {
          dummy.update(form.id, {
            name: form.name,
            capacity: form.capacity,
            location: form.location ?? null,
            is_active: form.is_active,
          });
        } else {
          dummy.create({
            name: form.name,
            capacity: form.capacity,
            location: form.location ?? null,
            is_active: form.is_active,
          });
        }
        return;
      }

      const payload: ApiRoomPayload = {
        room_name: form.name,
        room_capacity: form.capacity,
        room_location: form.location ?? null,
        room_is_active: form.is_active,
      };

      if (form.id) {
        await axios.put(`/api/a/rooms/${form.id}`, payload, {
          withCredentials: true,
        });
      } else {
        await axios.post(`/api/a/rooms`, payload, { withCredentials: true });
      }
    },
    onSuccess: async (_d, vars) => {
      setFlash({
        type: "success",
        msg: vars.id ? "Ruangan diperbarui." : "Ruangan ditambahkan.",
      });
      setModalOpen(false);
      setModalInitial(null);
      if (!USE_DUMMY) {
        await Promise.all([
          qc.invalidateQueries({ queryKey: QK.ROOMS(search, limit, offset) }),
          qc.invalidateQueries({ queryKey: QK.ROOM_STATS }),
        ]);
      }
    },
    onError: () => setFlash({ type: "error", msg: "Gagal menyimpan ruangan." }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (USE_DUMMY) {
        dummy.remove(id);
        return;
      }
      await axios.delete(`/api/a/rooms/${id}`, { withCredentials: true });
    },
    onSuccess: async () => {
      setFlash({ type: "success", msg: "Ruangan dihapus." });
      if (!USE_DUMMY) {
        await Promise.all([
          qc.invalidateQueries({ queryKey: QK.ROOMS(search, limit, offset) }),
          qc.invalidateQueries({ queryKey: QK.ROOM_STATS }),
        ]);
      }
    },
    onError: () => setFlash({ type: "error", msg: "Gagal menghapus ruangan." }),
  });

  /* ----------------- DATA MERGE ---------------- */
  const listResp: RoomsResponse = USE_DUMMY
    ? dummy.list(search, limit, offset)
    : ensureRoomsResponse(roomsQ.data, limit, offset);

  const stats: RoomStats = USE_DUMMY
    ? dummy.stats()
    : (statsQ.data ?? { total: 0, active: 0, inUseNow: 0, availableToday: 0 });

  // Computed values
  const topbarGregorianISO = useMemo(() => atLocalNoonISO(new Date()), []);
  const total = listResp.pagination.total;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Math.floor(offset / limit) + 1, pageCount);

  // Handlers
  const gotoPage = (p: number) => {
    const np = Math.min(Math.max(1, p), pageCount);
    setOffset((np - 1) * limit);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setOffset(0);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setOffset(0);
  };

  const handleAddRoom = () => {
    setModalInitial(null);
    setModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setModalInitial(room);
    setModalOpen(true);
  };

  const handleDeleteRoom = (room: Room) => {
    if (deleteMutation.isPending) return;
    const ok = confirm(`Hapus ruangan "${room.name}"?`);
    if (!ok) return;
    deleteMutation.mutate(room.id);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalInitial(null);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Manajemen Ruangan"
        gregorianDate={topbarGregorianISO}
        hijriDate={new Date(topbarGregorianISO).toLocaleDateString(
          "id-ID-u-ca-islamic-umalqura",
          { weekday: "long", day: "2-digit", month: "long", year: "numeric" }
        )}
        dateFmt={(iso) =>
          iso
            ? new Date(iso).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "-"
        }
      />

      <Flash palette={palette} flash={flash} />

      <main className="mx-auto px-7 md:py-8 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-2">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Content */}
          <section className="lg:col-span-10 space-y-5 min-w-0">
            <div className="mx-auto  flex items-center gap-3">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="cursor-pointer" size={20} />
              </Btn>

              <h1 className="font-semibold text-lg">Ruangan</h1>
            </div>
            {/* KPIs */}
            {/* <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <KpiTile
                palette={palette}
                label="Total Ruangan"
                value={stats.total}
                icon={<Building2 size={18} />}
              />
              <KpiTile
                palette={palette}
                label="Aktif"
                value={stats.active}
                icon={<UsersIcon size={18} />}
              />
              <KpiTile
                palette={palette}
                label="Dipakai Sekarang"
                value={stats.inUseNow}
                icon={<CalendarDays size={18} />}
                tone="warning"
              />
              <KpiTile
                palette={palette}
                label="Tersedia Hari Ini"
                value={stats.availableToday}
                icon={<MapPin size={18} />}
                tone="success"
              />
            </section> */}

            {/* Toolbar */}
            <SectionCard palette={palette}>
              <div className="p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 flex gap-2">
                  <input
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{
                      borderColor: palette.silver2,
                      background: palette.white2,
                      color: palette.black1,
                    }}
                    placeholder="Cari ruangan… (nama/lokasi)"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  <select
                    className="rounded-lg border px-2 py-2 text-sm"
                    style={{
                      borderColor: palette.silver2,
                      background: palette.white2,
                    }}
                    value={limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}/hal
                      </option>
                    ))}
                  </select>
                </div>
                <Btn palette={palette} onClick={handleAddRoom}>
                  <Plus size={16} className="mr-2" />
                  Tambah Ruangan
                </Btn>
              </div>
            </SectionCard>

            {/* List */}
            <SectionCard palette={palette}>
              <div className="p-3 md:p-4">
                <div className="mb-3 font-medium">Daftar Ruangan</div>

                {!USE_DUMMY && roomsQ.isLoading && (
                  <div className="text-sm opacity-70 flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Memuat
                    ruangan…
                  </div>
                )}
                {!USE_DUMMY && roomsQ.isError && (
                  <div className="text-sm opacity-70">
                    Gagal memuat ruangan.
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="text-left"
                        style={{ color: palette.silver2 }}
                      >
                        <th className="py-2 pr-3">Nama</th>
                        <th className="py-2 pr-3">Kapasitas</th>
                        <th className="py-2 pr-3">Lokasi</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2 pr-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listResp.data.map((r) => (
                        <tr
                          key={r.id}
                          className="border-t"
                          style={{ borderColor: palette.silver1 }}
                        >
                          <td className="py-2 pr-3">{r.name}</td>
                          <td className="py-2 pr-3">{r.capacity}</td>
                          <td className="py-2 pr-3">
                            {r.location ? (
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={14} /> {r.location}
                              </span>
                            ) : (
                              <span className="opacity-60">—</span>
                            )}
                          </td>
                          <td className="py-2 pr-3">
                            <Badge
                              palette={palette}
                              variant={r.is_active ? "success" : "outline"}
                            >
                              {r.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-2 justify-end">
                              <Btn
                                palette={palette}
                                variant="ghost"
                                onClick={() => setDetailRoom(r)}
                                title="Detail"
                              >
                                <Eye size={16} />
                              </Btn>
                              <Btn
                                palette={palette}
                                variant="ghost"
                                onClick={() => handleEditRoom(r)}
                                title="Edit"
                              >
                                <Edit3 size={16} />
                              </Btn>
                              <Btn
                                palette={palette}
                                variant="ghost"
                                onClick={() => handleDeleteRoom(r)}
                                title="Hapus"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 size={16} />
                              </Btn>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {listResp.data.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-6 text-center opacity-70"
                          >
                            Belum ada ruangan yang cocok.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="opacity-70">
                      Total: {total} • Halaman {page}/{pageCount}
                    </div>
                    <div className="flex items-center gap-2">
                      <Btn
                        palette={palette}
                        variant="default"
                        onClick={() => gotoPage(page - 1)}
                        disabled={page <= 1}
                      >
                        ‹ Prev
                      </Btn>
                      <Btn
                        palette={palette}
                        variant="default"
                        onClick={() => gotoPage(page + 1)}
                        disabled={page >= pageCount}
                      >
                        Next ›
                      </Btn>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </section>
        </div>
      </main>

      {/* Modals */}
      <RoomModal
        open={modalOpen}
        onClose={closeModal}
        initial={modalInitial}
        palette={palette}
        onSubmit={(form) => upsertMutation.mutate(form)}
        saving={upsertMutation.isPending && !USE_DUMMY}
        error={
          (upsertMutation.error as any)?.response?.data?.message ??
          (upsertMutation.error as any)?.message ??
          null
        }
      />
      <RoomDetail
        room={detailRoom}
        onClose={() => setDetailRoom(null)}
        palette={palette}
      />
    </div>
  );
}
