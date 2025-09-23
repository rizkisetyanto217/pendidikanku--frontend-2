import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

import {
  ArrowLeft,
  MapPin,
  Link as LinkIcon,
  Users,
  Building2,
  MonitorPlay,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

/* ===== Types (sama dengan AcademicSchool) ===== */
type ClassRoom = {
  class_rooms_masjid_id: string;
  class_rooms_name: string;
  class_rooms_code: string;
  class_rooms_location: string;
  class_rooms_is_virtual: boolean;
  class_rooms_floor?: number;
  class_rooms_capacity: number;
  class_rooms_description?: string;
  class_rooms_is_active?: boolean;
  class_rooms_features?: string[];
};

/* ===== Dummy fallback kalau tidak ada state ===== */
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

/* ===== Helpers ===== */
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

export default function ManagementAcademic() {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  // ambil data room dari state (opsional)
  const { state } = useLocation() as { state?: { room?: ClassRoom } };
  const [rooms, setRooms] = useState<ClassRoom[]>(
    state?.room ? [state.room] : DUMMY_ROOMS
  );

  const topbarISO = toLocalNoonISO(new Date());

  // handler dummy
  const handleDelete = (code: string) => {
    if (window.confirm("Hapus ruang ini?")) {
      setRooms((prev) => prev.filter((r) => r.class_rooms_code !== code));
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Manajemen Ruang Kelas"
        gregorianDate={topbarISO}
        dateFmt={dateLong}
        showBack={true}
      />

      <main className="w-full px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Main */}
          <section className="flex-1 flex flex-col space-y-8 min-w-0">
            <div className="flex items-center justify-between ">
              <div className="md:flex hidden items-center gap-3">
                <Btn
                  palette={palette}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 p-5"
                >
                  <ArrowLeft size={20} className="mr-1" />
                </Btn>
                <h1 className="md:flex hidden items-center text-lg font-semibold ">
                  Kelola Akademik
                </h1>
              </div>
              <Btn palette={palette} size="sm" variant="ghost">
                <Plus size={16} className="mr-1 " />
              </Btn>
            </div>

            <SectionCard palette={palette} className="p-5">
              <div className="space-y-4">
                {rooms.length === 0 ? (
                  <div
                    className="rounded-xl border p-4 text-sm text-center"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.silver2,
                    }}
                  >
                    Belum ada ruang terdaftar.
                  </div>
                ) : (
                  rooms.map((room) => (
                    <div
                      key={room.class_rooms_code}
                      className="rounded-xl border p-4 flex flex-col gap-3"
                      style={{
                        borderColor: palette.silver1,
                        background: palette.white1,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">
                            {room.class_rooms_name}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: palette.silver2 }}
                          >
                            {room.class_rooms_code}
                          </div>
                        </div>
                        <Badge
                          palette={palette}
                          variant={
                            room.class_rooms_is_virtual ? "info" : "black1"
                          }
                        >
                          {room.class_rooms_is_virtual ? "Virtual" : "Fisik"}
                        </Badge>
                      </div>

                      <div
                        className="text-sm flex items-center gap-2"
                        style={{ color: palette.black2 }}
                      >
                        {room.class_rooms_is_virtual ? (
                          <LinkIcon size={14} />
                        ) : (
                          <MapPin size={14} />
                        )}
                        {room.class_rooms_location}
                      </div>

                      <div
                        className="flex flex-wrap gap-4 text-sm"
                        style={{ color: palette.black2 }}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Users size={14} /> {room.class_rooms_capacity} kursi
                        </span>
                        {!room.class_rooms_is_virtual &&
                          room.class_rooms_floor && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 size={14} /> Lantai{" "}
                              {room.class_rooms_floor}
                            </span>
                          )}
                      </div>

                      {room.class_rooms_description && (
                        <p
                          className="text-sm"
                          style={{ color: palette.black2 }}
                        >
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

                      <div className="flex items-center justify-end gap-2">
                        <Btn palette={palette} size="sm" variant="secondary">
                          <Pencil size={14} className="mr-1" /> Edit
                        </Btn>
                        <Btn
                          palette={palette}
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(room.class_rooms_code)}
                        >
                          <Trash2 size={14} className="mr-1" /> Hapus
                        </Btn>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
}
