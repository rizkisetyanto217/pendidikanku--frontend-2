// src/pages/sekolahislamku/dashboard-school/rooms/DetailRoomSchool.tsx
import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { pickTheme, ThemeName } from "@/constants/thema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import { ArrowLeft, Loader2, Building2, MapPin, Users } from "lucide-react";
import { seed, Room } from "./RoomSchool";

/* ===================== CONFIG ===================== */
const USE_DUMMY = true;

/* ===================== QK ========================= */
const QK = {
  ROOM: (id: string) => ["room", id] as const,
};

/* ===================== UTILS ====================== */
const atLocalNoonISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x.toISOString();
};

/* ================== API QUERY =================== */
function useRoomQuery(id: string) {
  return useQuery<Room>({
    queryKey: QK.ROOM(id),
    queryFn: async () => {
      const res = await axios.get<{ data: Room }>(`/api/a/rooms/${id}`, {
        withCredentials: true,
      });
      return res.data.data;
    },
    enabled: !USE_DUMMY && !!id,
    staleTime: 60_000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 0,
  });
}

/* ============== REUSABLE COMPONENTS ============== */
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  palette: Palette;
}

function InfoRow({ label, value, palette }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs opacity-90" style={{ color: palette.black1 }}>
        {label}
      </span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );
}

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
  palette: Palette;
}

function InfoSection({ title, children, palette }: InfoSectionProps) {
  return (
    <div className="space-y-3">
      <h3
        className="font-semibold text-base pb-2 border-b"
        style={{ borderColor: palette.silver1 }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ===================== PAGE ======================= */
export default function DetailRoomSchool() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  // Query untuk data room (disabled jika USE_DUMMY)
  const roomQuery = useRoomQuery(id || "");

  // Data room dari dummy atau API
  const room: Room | undefined = USE_DUMMY
    ? seed.find((r) => r.id === id)
    : roomQuery.data;

  const topbarGregorianISO = useMemo(() => atLocalNoonISO(new Date()), []);

  // Loading state
  if (!USE_DUMMY && roomQuery.isLoading) {
    return (
      <div
        className="min-h-screen w-full grid place-items-center"
        style={{ background: palette.white2 }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="animate-spin"
            size={32}
            style={{ color: palette.primary }}
          />
          <p className="text-sm opacity-70">Memuat data ruangan...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (!room) {
    return (
      <div
        className="min-h-screen w-full"
        style={{ background: palette.white2, color: palette.black1 }}
      >
        <ParentTopBar
          palette={palette}
          title="Detail Ruangan"
          showBack
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
        <main className="px-4 md:px-6 md:py-8">
          <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6">
            <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
              <ParentSidebar palette={palette} />
            </aside>
            <section className="flex-1">
              <SectionCard palette={palette} className="p-8 text-center">
                <Building2 size={48} className="mx-auto mb-4 opacity-30" />
                <h2 className="text-lg font-semibold mb-2">
                  Ruangan tidak ditemukan
                </h2>
                <p className="text-sm opacity-70 mb-4">
                  Data ruangan dengan ID tersebut tidak tersedia.
                </p>
                <Btn palette={palette} onClick={() => navigate(-1)}>
                  Kembali
                </Btn>
              </SectionCard>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Detail Ruangan"
        showBack
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

      <main className="w-full px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Content */}
          <section className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Btn
                palette={palette}
                variant="ghost"
                onClick={() => navigate(-1)}
                title="Kembali"
                className="md:flex hidden"
              >
                <ArrowLeft size={20} />
              </Btn>

              <div className="flex-1">
                <h1 className="font-semibold text-base">{room.name}</h1>
                {room.code && (
                  <p className="text-sm opacity-70 mt-1">Kode: {room.code}</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SectionCard palette={palette}>
                <div className="p-4 flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg grid place-items-center"
                    style={{
                      background: palette.primary2,
                      color: palette.primary,
                    }}
                  >
                    <Users size={20} />
                  </div>
                  <div>
                    <div
                      className="text-xs opacity-90"
                      style={{ color: palette.black1 }}
                    >
                      Kapasitas
                    </div>
                    <div className="text-lg font-semibold">{room.capacity}</div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard palette={palette}>
                <div className="p-4 flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg grid place-items-center"
                    style={{
                      background: palette.primary2,
                      color: palette.primary,
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div
                      className="text-xs opacity-90"
                      style={{ color: palette.black1 }}
                    >
                      Lokasi
                    </div>
                    <div className="text-sm font-medium">
                      {room.location || "—"}
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Wrapper grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informasi Dasar */}
              <SectionCard palette={palette}>
                <div className="p-5 space-y-4">
                  <InfoSection title="Informasi Dasar" palette={palette}>
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      style={{ color: palette.black1 }}
                    >
                      <InfoRow
                        label="Nama Ruangan"
                        value={room.name}
                        palette={palette}
                      />
                      <InfoRow
                        label="Kode"
                        value={room.code ?? "—"}
                        palette={palette}
                      />
                      <InfoRow
                        label="Kapasitas"
                        value={`${room.capacity} siswa`}
                        palette={palette}
                      />
                      <InfoRow
                        label="Lokasi"
                        value={room.location ?? "—"}
                        palette={palette}
                      />
                      <InfoRow
                        label="Status"
                        value={
                          <Badge
                            palette={palette}
                            variant={room.is_active ? "success" : "outline"}
                          >
                            {room.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        }
                        palette={palette}
                      />
                    </div>
                    {room.description && (
                      <div className="pt-2">
                        <InfoRow
                          label="Deskripsi"
                          value={room.description}
                          palette={palette}
                        />
                      </div>
                    )}
                  </InfoSection>
                </div>
              </SectionCard>

              {/* Virtual Room Info */}
              {room.is_virtual && (
                <SectionCard palette={palette}>
                  <div className="p-5 space-y-4">
                    <InfoSection
                      title="Informasi Virtual Room"
                      palette={palette}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoRow
                          label="Platform"
                          value={room.platform ?? "—"}
                          palette={palette}
                        />
                        <InfoRow
                          label="Meeting ID"
                          value={room.meeting_id ?? "—"}
                          palette={palette}
                        />
                        <InfoRow
                          label="Passcode"
                          value={room.passcode ?? "—"}
                          palette={palette}
                        />
                        <InfoRow
                          label="Join URL"
                          value={
                            room.join_url ? (
                              <a
                                href={room.join_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all"
                              >
                                {room.join_url}
                              </a>
                            ) : (
                              "—"
                            )
                          }
                          palette={palette}
                        />
                      </div>
                    </InfoSection>
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Features */}
            {room.features && room.features.length > 0 && (
              <SectionCard palette={palette}>
                <div className="p-5 space-y-3">
                  <h3
                    className="font-semibold text-base pb-2 border-b"
                    style={{ borderColor: palette.silver1 }}
                  >
                    Fasilitas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {room.features.map((feature, idx) => (
                      <Badge key={idx} palette={palette} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Schedule */}
            {room.schedule && room.schedule.length > 0 && (
              <SectionCard palette={palette}>
                <div className="p-5 space-y-3 items-center flex-col">
                  <h3
                    className="font-semibold text-base pb-2 border-b"
                    style={{ borderColor: palette.silver1 }}
                  >
                    Jadwal
                  </h3>
                  <div className="space-y-2 md:flex  items-center justify-center gap-3">
                    {room.schedule.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border w-full gap-x-3 flex-col  items-center "
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white1,
                        }}
                      >r
                      
                        <div className="font-medium text-sm mb-1">
                          {s.label}
                        </div>
                        <div className="text-xs opacity-70">
                          {s.day ?? s.date} • {s.from} – {s.to} • Grup {s.group}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Notes */}
            {room.notes && room.notes.length > 0 && (
              <SectionCard palette={palette}>
                <div className="p-5 space-y-3">
                  <h3
                    className="font-semibold text-base pb-2 border-b"
                    style={{ borderColor: palette.silver1 }}
                  >
                    Catatan
                  </h3>
                  <div className="space-y-2">
                    {room.notes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border"
                        style={{
                          borderColor: palette.silver1,
                          background: palette.white1,
                        }}
                      >
                        <div className="text-xs opacity-70 mb-1">
                          {new Date(note.ts).toLocaleString("id-ID", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-sm">{note.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Metadata */}
            <SectionCard palette={palette}>
              <div className="p-5 space-y-3">
                <h3
                  className="font-semibold text-base pb-2 border-b"
                  style={{ borderColor: palette.silver1 }}
                >
                  Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow
                    label="Dibuat pada"
                    value={
                      room.created_at
                        ? new Date(room.created_at).toLocaleString("id-ID")
                        : "—"
                    }
                    palette={palette}
                  />
                  <InfoRow
                    label="Diperbarui pada"
                    value={
                      room.updated_at
                        ? new Date(room.updated_at).toLocaleString("id-ID")
                        : "—"
                    }
                    palette={palette}
                  />
                </div>
              </div>
            </SectionCard>
          </section>
        </div>
      </main>
    </div>
  );
}
