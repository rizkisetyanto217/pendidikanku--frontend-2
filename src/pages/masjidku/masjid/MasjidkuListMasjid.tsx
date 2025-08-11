import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  MapPin,
  CheckCircle2,
  Instagram,
  Youtube,
  Music2,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

type Masjid = {
  masjid_id: string;
  masjid_name: string;
  masjid_domain?: string;
  masjid_location?: string;
  masjid_image_url?: string;
  masjid_google_maps_url?: string;
  masjid_slug: string;
  masjid_is_verified?: boolean;
  masjid_instagram_url?: string;
  masjid_whatsapp_url?: string;
  masjid_youtube_url?: string;
  masjid_facebook_url?: string;
  masjid_tiktok_url?: string;
  masjid_created_at?: string;
};

const isValid = (v?: string) => {
  if (!v) return false;
  const s = v.trim().toLowerCase();
  if (!s || s === "update" || s === "fb") return false;
  return (
    s.startsWith("http") || s.startsWith("wa.me") || s.startsWith("maps.app")
  );
};

const fmtDate = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium" });
  } catch {
    return "";
  }
};

/** helper ikon dari public/icons */
const SvgIcon: React.FC<{
  name: "facebook" | "whatsapp" | "gmaps";
  size?: number;
  alt?: string;
}> = ({ name, size = 16, alt }) => (
  <img
    src={`/icons/${name}.svg`}
    alt={alt || name}
    width={size}
    height={size}
    loading="lazy"
    style={{ display: "inline-block" }}
  />
);

export default function MasjidkuListMasjid() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<{ data: Masjid[] }>({
    queryKey: ["public-masjids"],
    queryFn: async () => (await axios.get("/public/masjids")).data,
    staleTime: 5 * 60 * 1000,
  });

  const list = data?.data ?? [];
  const openExternal = (url: string) =>
    window.open(url, "_blank", "noopener,noreferrer");

  return (
    <>
      <PageHeaderUser
        title="Masjid yang Sudah Terdaftar"
        onBackClick={() => navigate(`/`)}
        withPaddingTop
      />

      <div className="pb-24 max-w-2xl mx-auto">
        {isLoading && (
          <div className="text-sm" style={{ color: theme.silver2 }}>
            Memuat daftar masjid…
          </div>
        )}

        {isError && (
          <div className="text-sm" style={{ color: theme.error1 }}>
            Gagal memuat data. Coba lagi.
          </div>
        )}

        {!isLoading && !list.length && (
          <div className="text-sm" style={{ color: theme.silver2 }}>
            Belum ada data masjid.
          </div>
        )}

        <div className="space-y-3">
          {list.map((m) => {
            const socials = [
              {
                icon: <SvgIcon name="facebook" alt="Facebook" />,
                url: m.masjid_facebook_url,
                label: "Facebook",
              },
              {
                icon: <Instagram size={16} />,
                url: m.masjid_instagram_url,
                label: "Instagram",
              },
              {
                icon: <Youtube size={16} />,
                url: m.masjid_youtube_url,
                label: "Youtube",
              },
              {
                icon: <SvgIcon name="whatsapp" alt="WhatsApp" />,
                url: m.masjid_whatsapp_url,
                label: "WhatsApp",
              },
              {
                icon: <Music2 size={16} />,
                url: m.masjid_tiktok_url,
                label: "Tiktok",
              },
            ].filter((s) => isValid(s.url));

            const website =
              m.masjid_domain && m.masjid_domain.startsWith("http")
                ? m.masjid_domain
                : m.masjid_domain
                  ? `https://${m.masjid_domain}`
                  : undefined;

            const handleCardClick = () => {
              if (website) openExternal(website);
              else navigate(`/masjid/${m.masjid_slug}`);
            };

            const joined = fmtDate(m.masjid_created_at);

            return (
              <div
                key={m.masjid_id}
                role="button"
                tabIndex={0}
                onClick={handleCardClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick();
                  }
                }}
                className="rounded-xl border p-3 flex gap-3 cursor-pointer hover:opacity-95 transition"
                style={{
                  backgroundColor: theme.white1,
                  borderColor: theme.silver1,
                  color: theme.black1,
                }}
              >
                {/* image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={m.masjid_image_url || ""}
                    alt={m.masjid_name}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==")
                    }
                  />
                </div>

                {/* content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold truncate"
                    style={{ color: theme.black1 }}
                  >
                    {m.masjid_name}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 pt-2">
                    {m.masjid_is_verified && (
                      <span
                        className="inline-flex items-center gap-1 text-base px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: theme.primary2,
                          color: theme.primary,
                        }}
                      >
                        <CheckCircle2 size={14} /> Terverifikasi
                      </span>
                    )}
                    {joined && (
                      <span
                        className="text-sm"
                        style={{ color: theme.silver2 }}
                      >
                        Bergabung {joined}
                      </span>
                    )}
                  </div>

                  {m.masjid_location && (
                    <div className="flex items-start gap-1.5 mt-2 text-base">
                      <MapPin
                        size={20}
                        style={{ color: theme.black2, marginTop: 2 }}
                      />
                      <span
                        className="line-clamp-2"
                        style={{ color: theme.black2 }}
                      >
                        {m.masjid_location}
                      </span>
                    </div>
                  )}

                  {/* socials + maps */}
                  <div className="flex items-center flex-wrap gap-2 mt-3">
                    {isValid(m.masjid_google_maps_url) && (
                      <a
                        href={m.masjid_google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-base px-2 py-1 rounded ring-1"
                        style={{
                          color: theme.black2,
                          borderColor: theme.black2,
                        }}
                      >
                        <SvgIcon name="gmaps" alt="Google Maps" />
                        Maps
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-base px-2 py-1 rounded ring-1"
                        style={{
                          color: theme.black2,
                          borderColor: theme.silver1,
                        }}
                      >
                        {s.icon}
                        {s.label}
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/masjid/${m.masjid_slug}`);
                      }}
                      className="px-3 py-1.5 rounded-md text-base font-medium hover:opacity-90 transition"
                      style={{
                        backgroundColor: theme.primary,
                        color: theme.white1,
                      }}
                    >
                      Kunjungi Profil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
