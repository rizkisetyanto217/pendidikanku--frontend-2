// src/pages/sekolahislamku/attendance/AttendancePage.tsx
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import axios from "@/lib/axios";

import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";
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

/* ================= Types ================ */
export type AttendeeType = "siswa" | "guru";
export type AttendanceStatus =
  | "hadir"
  | "izin"
  | "sakit"
  | "alfa"
  | "terlambat";

export interface AttendanceRow {
  id: string; // attendance id or entity id
  name: string;
  class_or_subject?: string; // class for siswa, subject for guru
  role: AttendeeType; // siswa | guru
  time?: string; // ISO or HH:mm
  status: AttendanceStatus;
}

/* =============== Main Page =============== */
export default function SchoolAttendance() {
  const { isDark } = useHtmlDarkMode();
  const theme: Palette = isDark ? colors.dark : colors.light;
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
        absent?: number; // alfa
        classes?: string[]; // for siswa
        subjects?: string[]; // for guru if needed
      };
    },
  });

  const rows = data?.list ?? [];
  const classes = data?.classes ?? ["1A", "1B", "2A", "2B", "3A"]; // fallback demo

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

  // ====== Mutations (bulk mark)
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
      {/* Top navbar */}
      <ParentTopBar palette={theme} title="Kehadiran" />
      <div className="lg:flex lg:items-start lg:gap-4 lg:p-4 lg:pt-6">
        {/* Sidebar kiri */}
        <SchoolSidebarNav palette={theme} className="hidden lg:block" />

        {/* Konten kanan */}
        <main className="flex-1 mx-auto max-w-3xl py-6 space-y-5">
          {/* Header + actions */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl grid place-items-center"
                style={{ background: theme.white3, color: theme.quaternary }}
              >
                <CalendarDays size={20} />
              </div>
              <div>
                <h1
                  className="text-xl font-semibold"
                  style={{ color: theme.quaternary }}
                >
                  Absensi
                </h1>
                <p className="text-sm" style={{ color: theme.secondary }}>
                  Cek & tandai kehadiran harian.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Btn
                palette={theme}
                size="sm"
                variant="outline"
                onClick={() => refetch()}
              >
                Refresh
              </Btn>
            </div>
          </div>

          {/* Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: theme.secondary }}>
                    Kehadiran Hari Ini
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: theme.quaternary }}
                  >
                    {stats.rate}%
                  </p>
                </div>
                <Check />
              </div>
            </SectionCard>
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: theme.secondary }}>
                    Hadir
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: theme.quaternary }}
                  >
                    {stats.present}
                  </p>
                </div>
                <Badge variant="success" palette={theme}>
                  OK
                </Badge>
              </div>
            </SectionCard>
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: theme.secondary }}>
                    Terlambat
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: theme.quaternary }}
                  >
                    {stats.late}
                  </p>
                </div>
                <Clock />
              </div>
            </SectionCard>
            <SectionCard palette={theme} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: theme.secondary }}>
                    Alfa
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: theme.quaternary }}
                  >
                    {stats.absent}
                  </p>
                </div>
                <X />
              </div>
            </SectionCard>
          </div>

          {/* Filters */}
          <SectionCard palette={theme} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div
                className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2 border"
                style={{ borderColor: theme.white3, background: theme.white1 }}
              >
                <Search size={16} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={`Cari nama, ${tipe === "siswa" ? "NIS" : "NIP"}, email…`}
                  className="w-full bg-transparent outline-none"
                  style={{ color: theme.quaternary }}
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Tipe */}
                <div
                  className="rounded-xl border px-3 py-2"
                  style={{
                    borderColor: theme.white3,
                    background: theme.white1,
                    color: theme.quaternary,
                  }}
                >
                  <div className="text-xs" style={{ color: theme.secondary }}>
                    Tipe
                  </div>
                  <select
                    value={tipe}
                    onChange={(e) => setTipe(e.target.value as AttendeeType)}
                    className="bg-transparent outline-none"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                  </select>
                </div>

                {/* Tanggal */}
                <div
                  className="rounded-xl border px-3 py-2"
                  style={{
                    borderColor: theme.white3,
                    background: theme.white1,
                    color: theme.quaternary,
                  }}
                >
                  <div className="text-xs" style={{ color: theme.secondary }}>
                    Tanggal
                  </div>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="bg-transparent outline-none"
                  />
                </div>

                {/* Kelas (untuk siswa) */}
                {tipe === "siswa" && (
                  <div
                    className="rounded-xl border px-3 py-2"
                    style={{
                      borderColor: theme.white3,
                      background: theme.white1,
                      color: theme.quaternary,
                    }}
                  >
                    <div className="text-xs" style={{ color: theme.secondary }}>
                      Kelas
                    </div>
                    <select
                      value={kelas ?? ""}
                      onChange={(e) => setKelas(e.target.value || undefined)}
                      className="bg-transparent outline-none"
                    >
                      <option value="">Semua</option>
                      {classes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status */}
                <div
                  className="rounded-xl border px-3 py-2"
                  style={{
                    borderColor: theme.white3,
                    background: theme.white1,
                    color: theme.quaternary,
                  }}
                >
                  <div className="text-xs" style={{ color: theme.secondary }}>
                    Status
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="bg-transparent outline-none"
                  >
                    <option value="semua">Semua</option>
                    <option value="hadir">Hadir</option>
                    <option value="terlambat">Terlambat</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="alfa">Alfa</option>
                  </select>
                </div>

                <Btn
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => refetch()}
                  palette={theme}
                >
                  <Filter size={16} /> Terapkan
                </Btn>
              </div>
            </div>
          </SectionCard>

          {/* Bulk actions */}
          <SectionCard palette={theme} className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm" style={{ color: theme.secondary }}>
                Terpilih: {selectedIds.length}
              </div>
              <Btn
                size="sm"
                palette={theme}
                variant="success"
                onClick={() => handleBulk("hadir")}
              >
                Tandai Hadir
              </Btn>
              <Btn
                size="sm"
                palette={theme}
                variant="secondary"
                onClick={() => handleBulk("terlambat")}
              >
                Terlambat
              </Btn>
              <Btn
                size="sm"
                palette={theme}
                variant="outline"
                onClick={() => handleBulk("izin")}
              >
                Izin
              </Btn>
              <Btn
                size="sm"
                palette={theme}
                variant="outline"
                onClick={() => handleBulk("sakit")}
              >
                Sakit
              </Btn>
              <Btn
                size="sm"
                palette={theme}
                variant="destructive"
                onClick={() => handleBulk("alfa")}
              >
                Alfa
              </Btn>
            </div>
          </SectionCard>

          {/* Table */}
          <SectionCard palette={theme} className="p-2 md:p-4">
            <div className="overflow-auto">
              <table className="min-w-[900px] w-full">
                <thead>
                  <tr
                    className="text-left text-sm"
                    style={{ color: theme.secondary }}
                  >
                    <th className="py-3 w-10">
                      <input
                        type="checkbox"
                        onChange={(e) => toggleAll(e.target.checked)}
                        checked={
                          rows.length > 0 && selectedIds.length === rows.length
                        }
                        aria-label="Pilih semua"
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
                        style={{ color: theme.secondary }}
                      >
                        Memuat data…
                      </td>
                    </tr>
                  )}

                  {isError && (
                    <tr>
                      <td colSpan={7} className="py-8">
                        <div
                          className="flex items-center gap-2 justify-center text-sm"
                          style={{ color: theme.warning1 }}
                        >
                          <AlertTriangle size={16} /> Terjadi kesalahan.
                          <button
                            className="underline"
                            onClick={() => refetch()}
                          >
                            Coba lagi
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoading && rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center"
                        style={{ color: theme.secondary }}
                      >
                        Belum ada data.
                      </td>
                    </tr>
                  )}

                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t"
                      style={{ borderColor: theme.white3 }}
                    >
                      <td className="py-3 align-top">
                        <input
                          type="checkbox"
                          checked={!!selected[r.id]}
                          onChange={(e) => toggleOne(r.id, e.target.checked)}
                          aria-label={`Pilih ${r.name}`}
                        />
                      </td>
                      <td className="py-3 align-top">
                        <div
                          className="font-medium"
                          style={{ color: theme.quaternary }}
                        >
                          {r.name}
                        </div>
                      </td>
                      <td
                        className="py-3 align-top"
                        style={{ color: theme.primary }}
                      >
                        {r.class_or_subject ?? "-"}
                      </td>
                      <td
                        className="py-3 align-top"
                        style={{ color: theme.quaternary }}
                      >
                        {r.role === "siswa" ? (
                          <span className="inline-flex items-center gap-1">
                            <Users size={14} /> Siswa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <UserCog size={14} /> Guru
                          </span>
                        )}
                      </td>
                      <td className="py-3 align-top">
                        {r.status === "hadir" && (
                          <Badge variant="success" palette={theme}>
                            Hadir
                          </Badge>
                        )}
                        {r.status === "terlambat" && (
                          <Badge variant="warning" palette={theme}>
                            Terlambat
                          </Badge>
                        )}
                        {r.status === "izin" && (
                          <Badge variant="info" palette={theme}>
                            Izin
                          </Badge>
                        )}
                        {r.status === "sakit" && (
                          <Badge variant="secondary" palette={theme}>
                            Sakit
                          </Badge>
                        )}
                        {r.status === "alfa" && (
                          <Badge variant="destructive" palette={theme}>
                            Alfa
                          </Badge>
                        )}
                      </td>
                      <td
                        className="py-3 align-top"
                        style={{ color: theme.quaternary }}
                      >
                        {r.time ?? "-"}
                      </td>
                      <td className="py-3 align-top">
                        <div className="flex items-center gap-2 justify-end">
                          <NavLink
                            to={`/sekolah/${r.role === "siswa" ? "murid" : "guru"}/${r.id}`}
                            className="text-sm underline"
                          >
                            Lihat Profil
                          </NavLink>
                          <Btn
                            size="sm"
                            palette={theme}
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
            </div>

            {/* Footer state */}
            <div
              className="mt-3 text-xs flex items-center justify-between"
              style={{ color: theme.secondary }}
            >
              <div>
                {isFetching
                  ? "Memuat ulang…"
                  : `Menampilkan ${rows.length} data`}
              </div>
              <div className="flex items-center gap-2">
                <button className="underline" onClick={() => refetch()}>
                  Refresh
                </button>
              </div>
            </div>
          </SectionCard>
        </main>
      </div>
    </>
  );
}
