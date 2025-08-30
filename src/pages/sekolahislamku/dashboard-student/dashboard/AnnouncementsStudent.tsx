// src/pages/sekolahislamku/student/AnnouncementsStudent.tsx
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Search, ArrowLeft } from "lucide-react";

import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";

/* ---------- Types ---------- */
export type Announcement = {
  id: string;
  title: string;
  date: string; // ISO
  body: string;
  type?: "info" | "warning" | "success";
};

type LocationState = {
  items?: Announcement[];
  heading?: string;
};

/* ---------- Helpers ---------- */
const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* ---------- Page ---------- */
export default function AnnouncementsStudent() {
  const { state } = useLocation() as { state?: LocationState };
  const navigate = useNavigate();

  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);

  // ⬇️ sumber data HANYA dari state yang dikirim StudentDashboard
  const sourceItems = state?.items ?? [];

  // UI state: search + filter
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "info" | "warning" | "success">(
    "all"
  );

  const items = useMemo(() => {
    let arr = sourceItems;
    if (type !== "all") arr = arr.filter((a) => (a.type ?? "info") === type);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      arr = arr.filter(
        (a) =>
          a.title.toLowerCase().includes(s) || a.body.toLowerCase().includes(s)
      );
    }
    return [...arr].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [sourceItems, q, type]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title={state?.heading ?? "Semua Pengumuman"}
        gregorianDate={new Date().toISOString()}
        dateFmt={dateFmt}
      />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          <ParentSidebar palette={palette} />

          <div className="flex-1 space-y-6">
            <Btn
              palette={palette}
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Kembali
            </Btn>

            <SectionCard palette={palette}>
              {/* Header */}
              <div
                className="p-4 md:p-5 pb-3 border-b"
                style={{ borderColor: palette.silver1 }}
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <Bell size={20} color={palette.quaternary} />
                    Pengumuman
                  </h1>
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 md:p-5 pt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(["all", "info", "warning", "success"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className="px-3 py-1.5 rounded-lg border text-sm"
                      style={{
                        background:
                          type === t ? palette.primary2 : palette.white1,
                        color: type === t ? palette.primary : palette.black1,
                        borderColor:
                          type === t ? palette.primary : palette.silver1,
                      }}
                    >
                      {t === "all" ? "Semua" : t}
                    </button>
                  ))}
                </div>

                <div
                  className="flex items-center gap-3 rounded-xl border px-3 py-2.5 md:px-4 md:py-3 max-w-lg"
                  style={{
                    borderColor: palette.silver1,
                    background: palette.white1,
                  }}
                >
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari judul atau isi pengumuman…"
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: palette.black1 }}
                  />
                </div>
              </div>

              {/* List */}
              <div className="px-4 pb-5 space-y-3">
                {items.length === 0 ? (
                  <div
                    className="rounded-xl border p-4 text-sm"
                    style={{
                      borderColor: palette.silver1,
                      color: palette.silver2,
                    }}
                  >
                    Tidak ada pengumuman. (Buka dari dashboard agar data ikut
                    terkirim.)
                  </div>
                ) : (
                  items.map((a) => (
                    <Link
                      key={a.id}
                      to={`/murid/pengumuman/detail/${a.id}`}
                      className="block rounded-xl border p-4 hover:shadow-sm transition"
                      style={{
                        borderColor: palette.silver1,
                        background: palette.white1,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{a.title}</div>
                          <div
                            className="text-xs mt-0.5"
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
                        </div>
                        <Badge
                          palette={palette}
                          variant={
                            a.type === "warning"
                              ? "warning"
                              : a.type === "success"
                                ? "success"
                                : "info"
                          }
                        >
                          {a.type ?? "info"}
                        </Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
