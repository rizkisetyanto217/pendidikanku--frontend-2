// src/pages/sekolahislamku/academic/AcademicSchool.tsx
import React, { useMemo, useState } from "react";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
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
  CalendarDays,
  School,
  CheckCircle2,
  Clock,
  Users,
  MapPin,
  Link as LinkIcon,
  MonitorPlay,
  Building2,
  Layers,
  Grid,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ===================== Types ===================== */
type AcademicTerm = {
  academic_terms_masjid_id: string;
  academic_terms_academic_year: string; // "2025/2026"
  academic_terms_name: string; // "Ganjil"
  academic_terms_start_date: string; // ISO with TZ
  academic_terms_end_date: string; // ISO with TZ
  academic_terms_is_active: boolean;
  academic_terms_angkatan: number; // 2025
};

type ClassRoom = {
  class_rooms_masjid_id: string;
  class_rooms_name: string;
  class_rooms_code: string;
  class_rooms_location: string; // alamat fisik / URL meeting
  class_rooms_is_virtual: boolean;
  class_rooms_floor?: number;
  class_rooms_capacity: number;
  class_rooms_description?: string;
  class_rooms_is_active?: boolean;
  class_rooms_features?: string[];
};

type SchoolAcademicProps = {
  showBack?: boolean; // default: false
  backTo?: string; // optional: kalau diisi, navigate ke path ini, kalau tidak pakai nav(-1)
  backLabel?: string; // teks tombol
};

/* ===================== Dummy Data ===================== */
// Term aktif (sesuai contoh)
const DUMMY_TERM: AcademicTerm = {
  academic_terms_masjid_id: "e9876a6e-ab91-4226-84f7-cda296ec747e",
  academic_terms_academic_year: "2025/2026",
  academic_terms_name: "Ganjil",
  academic_terms_start_date: "2025-07-15T00:00:00+07:00",
  academic_terms_end_date: "2026-01-10T23:59:59+07:00",
  academic_terms_is_active: true,
  academic_terms_angkatan: 2025,
};

// Dua contoh ruang (fisik & virtual)
const DUMMY_ROOMS: ClassRoom[] = [
  {
    class_rooms_masjid_id: "e9876a6e-ab91-4226-84f7-cda296ec747e",
    class_rooms_name: "Ruang Tahfidz A",
    class_rooms_code: "R-TFZ-A",
    class_rooms_location: "Gedung Utama Lt. 2",
    class_rooms_floor: 2,
    class_rooms_capacity: 40,
    class_rooms_description: "Ruang untuk setoran hafalan & halaqah kecil.",
    class_rooms_is_virtual: false,
    class_rooms_is_active: true,
    class_rooms_features: ["AC", "Proyektor", "Whiteboard", "Karpet"],
  },
  {
    class_rooms_masjid_id: "e9876a6e-ab91-4226-84f7-cda296ec747e",
    class_rooms_name: "Kelas Daring Malam",
    class_rooms_code: "VR-NIGHT-01",
    class_rooms_location: "https://meet.google.com/abc-defg-hij",
    class_rooms_is_virtual: true,
    class_rooms_capacity: 100,
    class_rooms_description: "Sesi online untuk murid pekanan.",
    class_rooms_is_active: true,
    class_rooms_features: ["Virtual", "Google Meet", "Rekaman Otomatis"],
  },
];

/* ===================== Helpers ===================== */
const toLocalNoonISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
};
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";
const dateShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

/* ===================== Page ===================== */
const AcademicSchool: React.FC<SchoolAcademicProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  // State kecil untuk filter rooms
  const [filter, setFilter] = useState<"all" | "physical" | "virtual">("all");

  const rooms = useMemo(() => {
    if (filter === "physical")
      return DUMMY_ROOMS.filter((r) => !r.class_rooms_is_virtual);
    if (filter === "virtual")
      return DUMMY_ROOMS.filter((r) => r.class_rooms_is_virtual);
    return DUMMY_ROOMS;
  }, [filter]);

  // KPI kecil
  const kpIs = {
    totalRooms: DUMMY_ROOMS.length,
    physical: DUMMY_ROOMS.filter((r) => !r.class_rooms_is_virtual).length,
    virtual: DUMMY_ROOMS.filter((r) => r.class_rooms_is_virtual).length,
    capacitySum: DUMMY_ROOMS.reduce(
      (s, r) => s + (r.class_rooms_capacity || 0),
      0
    ),
  };

  const topbarISO = toLocalNoonISO(new Date());

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Akademik"
        gregorianDate={topbarISO}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-6xl px-4 md:py-6  py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-9 space-y-5 min-w-0">
            <div className="flex items-center justify-between ">
              <div className="font-semibold text-lg flex items-center ">
                <div className="  flex items-center gap-x-3 ">
                  {showBack && (
                    <Btn
                      palette={palette}
                      onClick={() => navigate(-1)}
                      variant="ghost"
                      className="cursor-pointer mr-3"
                    >
                      <ArrowLeft
                        aria-label={backLabel}
                        // title={backLabel}

                        size={20}
                      />
                    </Btn>
                  )}
                </div>
                <h1 className="flex items-center ">Periode Akademik Aktif</h1>
              </div>
              
            </div>
            {/* ===== Periode Akademik (active term) ===== */}
            <SectionCard palette={palette} className="overflow-hidden">
              <div className="p-5 grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm" style={{ color: palette.black2 }}>
                    Tahun Ajaran
                  </div>
                  <div className="text-xl font-semibold">
                    {DUMMY_TERM.academic_terms_academic_year} —{" "}
                    {DUMMY_TERM.academic_terms_name}
                  </div>
                  <div
                    className="text-sm flex items-center gap-2"
                    style={{ color: palette.black2 }}
                  >
                    <CalendarDays size={16} />
                    {dateShort(DUMMY_TERM.academic_terms_start_date)} s/d{" "}
                    {dateShort(DUMMY_TERM.academic_terms_end_date)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm" style={{ color: palette.black2 }}>
                    Angkatan
                  </div>
                  <div className="text-xl font-semibold">
                    {DUMMY_TERM.academic_terms_angkatan}
                  </div>
                  <div
                    className="text-sm flex items-center gap-2"
                    style={{ color: palette.black2 }}
                  >
                    <CheckCircle2 size={16} />
                    Status:{" "}
                    {DUMMY_TERM.academic_terms_is_active ? "Aktif" : "Nonaktif"}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ===== KPI kecil untuk rooms ===== */}
            {/* <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniKPI
                palette={palette}
                icon={<Grid size={16} />}
                label="Total Ruang"
                value={kpIs.totalRooms}
              />
              <MiniKPI
                palette={palette}
                icon={<Building2 size={16} />}
                label="Ruang Fisik"
                value={kpIs.physical}
              />
              <MiniKPI
                palette={palette}
                icon={<MonitorPlay size={16} />}
                label="Ruang Virtual"
                value={kpIs.virtual}
              />
              <MiniKPI
                palette={palette}
                icon={<Users size={16} />}
                label="Total Kapasitas"
                value={kpIs.capacitySum}
              />
            </section> */}

            {/* ===== Daftar Rooms ===== */}
            <SectionCard palette={palette}>
              {/* Header + filters */}
              <div
                className="p-4 md:p-5 pb-3 border-b flex flex-wrap items-center justify-between gap-2"
                style={{ borderColor: palette.silver1 }}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Layers size={18} color={palette.quaternary} />
                  Daftar Ruang Kelas
                </div>

                <div className="flex items-center gap-2">
                  {(["all", "physical", "virtual"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className="px-3 py-1.5 rounded-lg border text-sm"
                      style={{
                        background:
                          filter === f ? palette.primary2 : palette.white1,
                        color: filter === f ? palette.primary : palette.black1,
                        borderColor:
                          filter === f ? palette.primary : palette.silver1,
                      }}
                    >
                      {f === "all"
                        ? "Semua"
                        : f === "physical"
                          ? "Fisik"
                          : "Virtual"}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="p-4 md:p-5">
                {rooms.length === 0 ? (
                  <div
                    className="rounded-xl border p-4 text-sm flex items-center gap-2"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.silver2,
                    }}
                  >
                    <Info size={16} />
                    Tidak ada ruang untuk filter ini.
                  </div>
                ) : (
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {rooms.map((r) => (
                      <li key={r.class_rooms_code}>
                        <RoomCard palette={palette} room={r} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
};

/* ===================== Small UI ===================== */
function MiniKPI({
  palette,
  icon,
  label,
  value,
}: {
  palette: Palette;
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <SectionCard palette={palette} className="p-4">
      <div className="flex items-center gap-3">
        <span
          className="h-10 w-10 grid place-items-center rounded-xl"
          style={{ background: palette.primary2, color: palette.primary }}
        >
          {icon}
        </span>
        <div>
          <div className="text-xs" style={{ color: palette.black2 }}>
            {label}
          </div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </SectionCard>
  );
}

function RoomCard({ room, palette }: { room: ClassRoom; palette: Palette }) {
  const isVirtual = room.class_rooms_is_virtual;

  return (
    <div
      className="rounded-2xl border p-4 h-full flex flex-col gap-3"
      style={{ borderColor: palette.silver1, background: palette.white1 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold truncate">{room.class_rooms_name}</div>
          <div className="text-xs mt-0.5" style={{ color: palette.black2 }}>
            Kode: {room.class_rooms_code}
          </div>
        </div>
        <Badge palette={palette} variant={isVirtual ? "info" : "black1"}>
          {isVirtual ? "Virtual" : "Fisik"}
        </Badge>
      </div>

      <div
        className="text-sm flex items-center gap-2"
        style={{ color: palette.black2 }}
      >
        {isVirtual ? <LinkIcon size={14} /> : <MapPin size={14} />}
        {room.class_rooms_location}
      </div>

      <div
        className="flex flex-wrap items-center gap-3 text-sm"
        style={{ color: palette.black2 }}
      >
        <span className="inline-flex items-center gap-1">
          <Users size={14} /> {room.class_rooms_capacity} kursi
        </span>
        {!isVirtual && room.class_rooms_floor != null && (
          <span className="inline-flex items-center gap-1">
            <Building2 size={14} /> Lantai {room.class_rooms_floor}
          </span>
        )}
      </div>

      {room.class_rooms_description && (
        <p className="text-sm" style={{ color: palette.black2 }}>
          {room.class_rooms_description}
        </p>
      )}

      {!!room.class_rooms_features?.length && (
        <div className="flex flex-wrap gap-1.5">
          {room.class_rooms_features.map((f, i) => (
            <Badge key={i} palette={palette} variant="outline">
              <span style={{ color: palette.black2 }}>{f}</span>
            </Badge>
          ))}
        </div>
      )}

      <div className="pt-1 mt-auto flex items-center justify-end gap-2">
        <Link to="detail" state={{ term: DUMMY_TERM }}>
          <Btn palette={palette} variant="secondary" size="sm">
            Detail
          </Btn>
        </Link>
        <Link to={"manage"} state={{ room }}>
          <Btn palette={palette} size="sm">
            Kelola
          </Btn>
        </Link>
      </div>
    </div>
  );
}
export default AcademicSchool;
