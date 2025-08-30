// src/pages/sekolahislamku/attendance/AttendancePage.tsx
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import axios from "@/lib/axios";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";

import {
  CalendarDays,
  Users,
  UserCog,
  Search,
  Filter,
  Check,
  X,
  Clock,
  AlertTriangle,
} from "lucide-react";
import ParentSidebar from "../../components/home/ParentSideBar";

/* ================= Types ================ */
export type AttendeeType = "siswa" | "guru";
export type AttendanceStatus =
  | "hadir"
  | "izin"
  | "sakit"
  | "alfa"
  | "terlambat";

export interface AttendanceRow {
  id: string;
  name: string;
  class_or_subject?: string;
  role: AttendeeType;
  time?: string;
  status: AttendanceStatus;
}

/* ================= Helper mapping warna ================ */
const C = (p: Palette) => ({
  heading: p.black1,
  text: p.black2,
  muted: p.secondary,
  accent: p.primary,
  border: p.white3,
  surface: p.white1,
  chip: p.white3,
});

/* =============== Main Page =============== */
export default function SchoolAttendance() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const c = C(palette);
  const qc = useQueryClient();

  // filters
  const todayISO = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState<string>(todayISO);
  const [tipe, setTipe] = useState<AttendeeType>("siswa");
  const [kelas, setKelas] = useState<string | undefined>(undefined);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<AttendanceStatus | "semua">("semua");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // ====== Fetch list
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["attendance", { tanggal, tipe, kelas, q, status }],
    queryFn: async () => {
      const params: Record<string, string> = { date: tanggal, type: tipe };
      if (kelas) params.class = kelas;
      if (q) params.q = q;
      if (status !== "semua") params.status = status;
      const res = await axios.get("/api/a/attendance", { params });
      return res.data as {
        list: AttendanceRow[];
        total: number;
        present?: number;
        late?: number;
        absent?: number;
        classes?: string[];
        subjects?: string[];
      };
    },
  });

  const rows = data?.list ?? [];
  const classes = data?.classes ?? ["1A", "1B", "2A", "2B", "3A"];

  const stats = useMemo(() => {
    const total = data?.total ?? rows.length;
    const present =
      data?.present ?? rows.filter((r) => r.status === "hadir").length;
    const late =
      data?.late ?? rows.filter((r) => r.status === "terlambat").length;
    const absent =
      data?.absent ?? rows.filter((r) => r.status === "alfa").length;
    const rate = total ? Math.round((present / total) * 100) : 0;
    return { total, present, late, absent, rate };
  }, [data, rows]);

  // ====== Mutations
  const markMutation = useMutation({
    mutationFn: async (payload: {
      ids: string[];
      status: AttendanceStatus;
    }) => {
      return axios.post("/api/a/attendance/mark", {
        date: tanggal,
        type: tipe,
        status: payload.status,
        ids: payload.ids,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const handleBulk = (s: AttendanceStatus) => {
    if (selectedIds.length === 0) return;
    markMutation.mutate({ ids: selectedIds, status: s });
  };

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    rows.forEach((r) => (next[r.id] = checked));
    setSelected(next);
  };

  const toggleOne = (id: string, checked: boolean) =>
    setSelected((p) => ({ ...p, [id]: checked }));

  return (
    <>
      <ParentTopBar palette={palette} title="Kehadiran" />
      <div className="lg:flex lg:items-start lg:gap-4 lg:p-4 lg:pt-6">
        <ParentSidebar palette={palette} className="hidden lg:block" />

        <main className="flex-1 mx-auto max-w-3xl py-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl grid place-items-center"
                style={{ background: c.chip, color: c.accent }}
              >
                <CalendarDays size={20} />
              </div>
              <div>
                <h1
                  className="text-xl font-semibold"
                  style={{ color: c.heading }}
                >
                  Absensi
                </h1>
                <p className="text-sm" style={{ color: c.muted }}>
                  Cek & tandai kehadiran harian.
                </p>
              </div>
            </div>
            <Btn
              palette={palette}
              size="sm"
              variant="outline"
              onClick={() => refetch()}
            >
              Refresh
            </Btn>
          </div>

          {/* Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <SectionCard palette={palette} className="p-4">
              <p className="text-sm" style={{ color: c.muted }}>
                Kehadiran Hari Ini saja
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: c.heading }}
              >
                {stats.rate}%
              </p>
            </SectionCard>
            <SectionCard palette={palette} className="p-4">
              <p className="text-sm" style={{ color: c.muted }}>
                Hadir
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: c.heading }}
              >
                {stats.present}
              </p>
            </SectionCard>
            <SectionCard palette={palette} className="p-4">
              <p className="text-sm" style={{ color: c.muted }}>
                Terlambat
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: c.heading }}
              >
                {stats.late}
              </p>
            </SectionCard>
            <SectionCard palette={palette} className="p-4">
              <p className="text-sm" style={{ color: c.muted }}>
                Alfa
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ color: c.heading }}
              >
                {stats.absent}
              </p>
            </SectionCard>
          </div>

          {/* Filters */}
          <SectionCard palette={palette} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search */}
              <div
                className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2 border"
                style={{ borderColor: c.border, background: c.surface }}
              >
                <Search size={16} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={`Cari nama, ${tipe === "siswa" ? "NIS" : "NIP"}, email…`}
                  className="w-full bg-transparent outline-none"
                  style={{ color: c.heading }}
                />
              </div>

              {/* Dropdowns */}
              {/* ...semua select box sama, pakai border: c.border, bg: c.surface, color heading */}
              {/* Status */}
              {/* Btn Terapkan */}
            </div>
          </SectionCard>

          {/* Bulk actions */}
          {/* ...tetap, tidak banyak perubahan warna */}

          {/* Table */}
          <SectionCard palette={palette} className="p-2 md:p-4">
            <table className="min-w-[900px] w-full">
              <thead style={{ background: palette.white2 }}>
                <tr className="text-left text-sm" style={{ color: c.muted }}>
                  <th className="py-3 w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </th>
                  <th>Nama</th>
                  <th>{tipe === "siswa" ? "Kelas" : "Mapel"}</th>
                  <th>Tipe</th>
                  <th>Status</th>
                  <th>Waktu</th>
                  <th className="text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center"
                      style={{ color: c.muted }}
                    >
                      Memuat data…
                    </td>
                  </tr>
                )}
                {/* ...error & empty states sama */}
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t"
                    style={{ borderColor: c.border }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={!!selected[r.id]}
                        onChange={(e) => toggleOne(r.id, e.target.checked)}
                      />
                    </td>
                    <td style={{ color: c.heading }}>{r.name}</td>
                    <td style={{ color: c.accent }}>
                      {r.class_or_subject ?? "-"}
                    </td>
                    <td style={{ color: c.text }}>
                      {r.role === "siswa" ? (
                        <>
                          <Users size={14} /> Siswa
                        </>
                      ) : (
                        <>
                          <UserCog size={14} /> Guru
                        </>
                      )}
                    </td>
                    <td>
                      {r.status === "hadir" && (
                        <Badge variant="success" palette={palette}>
                          Hadir
                        </Badge>
                      )}
                      {r.status === "terlambat" && (
                        <Badge variant="warning" palette={palette}>
                          Terlambat
                        </Badge>
                      )}
                      {r.status === "izin" && (
                        <Badge variant="info" palette={palette}>
                          Izin
                        </Badge>
                      )}
                      {r.status === "sakit" && (
                        <Badge variant="secondary" palette={palette}>
                          Sakit
                        </Badge>
                      )}
                      {r.status === "alfa" && (
                        <Badge variant="destructive" palette={palette}>
                          Alfa
                        </Badge>
                      )}
                    </td>
                    <td style={{ color: c.text }}>{r.time ?? "-"}</td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <NavLink
                          to={`/sekolah/${r.role === "siswa" ? "murid" : "guru"}/${r.id}`}
                          className="underline text-sm"
                          style={{ color: c.accent }}
                        >
                          Lihat Profil
                        </NavLink>
                        <Btn
                          size="sm"
                          palette={palette}
                          variant="outline"
                          onClick={() =>
                            markMutation.mutate({
                              ids: [r.id],
                              status: "hadir",
                            })
                          }
                        >
                          Tandai Hadir
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        </main>
      </div>
    </>
  );
}
