// src/pages/masjid/RegisterLembaga.tsx (masjid_id version)
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import axios from "@/lib/axios";
import {
  MapPin,
  Image as ImageIcon,
  Link as LinkIcon,
  Globe,
  Landmark,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Info,
} from "lucide-react";

/* =======================
   Utils
======================= */
const CREATE_ENDPOINT = "api/u/masjids/user"; // ← ganti jika perlu

function extractLatLngFromGmaps(url: string) {
  try {
    // Support: https://maps.google.com/?q=-7.3,112.7  atau  .../@-7.3,112.7,15z
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
    if (qMatch) {
      return { lat: parseFloat(qMatch[1]), lon: parseFloat(qMatch[2]) };
    }
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lon: parseFloat(atMatch[2]) };
    }
  } catch {}
  return null;
}

const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

/* =======================
   Types
======================= */
type FormState = {
  masjid_name: string;
  masjid_bio_short: string;
  masjid_location: string;
  masjid_latitude: string;
  masjid_longitude: string;

  masjid_image_url: string;
  masjid_image_file?: File | null;
  masjid_google_maps_url: string;

  masjid_domain: string;

  masjid_instagram_url: string;
  masjid_whatsapp_url: string;
  masjid_youtube_url: string;
  masjid_facebook_url: string;
  masjid_tiktok_url: string;
  masjid_whatsapp_group_ikhwan_url: string;
  masjid_whatsapp_group_akhwat_url: string;
};

/* =======================
   Component
======================= */
export default function RegisterDetailAdminMasjid() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    masjid_name: "",
    masjid_bio_short: "",
    masjid_location: "",
    masjid_latitude: "",
    masjid_longitude: "",

    masjid_image_url: "",
    masjid_image_file: null,
    masjid_google_maps_url: "",

    masjid_domain: "",

    masjid_instagram_url: "",
    masjid_whatsapp_url: "",
    masjid_youtube_url: "",
    masjid_facebook_url: "",
    masjid_tiktok_url: "",
    masjid_whatsapp_group_ikhwan_url: "",
    masjid_whatsapp_group_akhwat_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadPct, setUploadPct] = useState<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const styles = useMemo(
    () => ({
      pageBg: {
        background: `linear-gradient(135deg, ${theme.white1}, ${theme.white2})`,
      },
      card: {
        backgroundColor: theme.white1,
        borderColor: theme.white3,
        color: theme.black1,
      },
      input: {
        backgroundColor: theme.white1,
        color: theme.black1,
        borderColor: theme.white3,
      },
      muted: { color: theme.silver2 },
      ringFocus: `0 0 0 3px ${theme.primary}33`,
      primaryBtn: {
        backgroundColor: theme.primary,
        color: theme.white1,
      },
      ghostBtn: {
        backgroundColor: isDark ? theme.white2 : theme.white1,
        borderColor: theme.white3,
        color: theme.black1,
      },
      chip: {
        backgroundColor: theme.white2,
        border: `1px solid ${theme.white3}`,
        color: theme.black1,
      },
    }),
    [theme, isDark]
  );

  /* =======================
     Validation
  ======================= */
  const nameValid = form.masjid_name.trim().length >= 3;
  const lat = Number(form.masjid_latitude);
  const lon = Number(form.masjid_longitude);
  const latValid =
    form.masjid_latitude === "" || (lat >= -90 && lat <= 90 && !isNaN(lat));
  const lonValid =
    form.masjid_longitude === "" || (lon >= -180 && lon <= 180 && !isNaN(lon));
  const domainValid =
    form.masjid_domain === "" || domainRegex.test(form.masjid_domain);

  const canSubmit = nameValid && latValid && lonValid && !loading;

  /* =======================
     Handlers
  ======================= */
  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((s) => ({ ...s, [key]: e.target.value }));
      setError("");
      setSuccess("");
    };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setForm((s) => ({ ...s, masjid_image_file: f }));
    setError("");
    setSuccess("");
  };

  const applyGmaps = () => {
    const parsed = extractLatLngFromGmaps(form.masjid_google_maps_url.trim());
    if (parsed) {
      setForm((s) => ({
        ...s,
        masjid_latitude: String(parsed.lat),
        masjid_longitude: String(parsed.lon),
      }));
    } else {
      setError(
        "Tidak dapat membaca koordinat dari link Google Maps. Pastikan format URL benar."
      );
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung Geolocation.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((s) => ({
          ...s,
          masjid_latitude: String(pos.coords.latitude.toFixed(6)),
          masjid_longitude: String(pos.coords.longitude.toFixed(6)),
        }));
      },
      () => setError("Gagal mengambil lokasi perangkat.")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canSubmit) {
      setError("Mohon periksa kembali isian wajib dan format data.");
      return;
    }

    setLoading(true);
    setUploadPct(0);

    // siapkan abort untuk request lama bila ada
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const fd = new FormData();

      // Wajib/utama
      fd.append("masjid_name", form.masjid_name.trim());

      // Opsional / teks
      if (form.masjid_bio_short.trim())
        fd.append("masjid_bio_short", form.masjid_bio_short.trim());
      if (form.masjid_location.trim())
        fd.append("masjid_location", form.masjid_location.trim());
      if (form.masjid_google_maps_url.trim())
        fd.append("masjid_google_maps_url", form.masjid_google_maps_url.trim());
      if (form.masjid_domain.trim())
        fd.append("masjid_domain", form.masjid_domain.trim());

      // Koordinat (opsional)
      if (form.masjid_latitude.trim())
        fd.append("masjid_latitude", form.masjid_latitude.trim());
      if (form.masjid_longitude.trim())
        fd.append("masjid_longitude", form.masjid_longitude.trim());

      // Gambar (pilih salah satu: file atau url)
      if (form.masjid_image_file) {
        fd.append("masjid_image_file", form.masjid_image_file);
      } else if (form.masjid_image_url.trim()) {
        fd.append("masjid_image_url", form.masjid_image_url.trim());
      }

      // Sosial
      const socials: (keyof FormState)[] = [
        "masjid_instagram_url",
        "masjid_whatsapp_url",
        "masjid_youtube_url",
        "masjid_facebook_url",
        "masjid_tiktok_url",
        "masjid_whatsapp_group_ikhwan_url",
        "masjid_whatsapp_group_akhwat_url",
      ];
      socials.forEach((k) => {
        const v = form[k]?.toString().trim();
        if (v) fd.append(k, v);
      });

      const res = await axios.post(CREATE_ENDPOINT, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: abortRef.current.signal,
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          setUploadPct(Math.round((evt.loaded * 100) / evt.total));
        },
      });

      // Ambil masjid_id dari response
      const masjidId =
        (res.data as any)?.data?.masjid_id ??
        (res.data as any)?.masjid_id ??
        (res.data as any)?.data?.id ??
        (res.data as any)?.id ??
        null;

      setSuccess("Masjid berhasil didaftarkan. Mengarahkan…");
      setTimeout(() => {
        if (masjidId) {
          navigate(
            `/dkm/profil-masjid?id=${encodeURIComponent(String(masjidId))}`
          );
        } else {
          navigate("/dkm");
        }
      }, 900);
    } catch (err: any) {
      if (err?.name === "CanceledError") {
        // dibatalkan user; jangan tampilkan error merah
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Gagal mendaftarkan masjid.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen py-10 px-4 md:px-6" style={styles.pageBg}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: theme.black1 }}
          >
            Registrasi Masjid
          </h1>
          <p className="mt-1 text-sm" style={styles.muted}>
            Isi data di bawah ini untuk mengaktifkan lembaga Anda. Anda dapat
            melengkapinya lagi nanti dari dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-6 md:p-8" style={styles.card}>
          {/* Info banner */}
          <div
            className="mb-6 rounded-xl px-3 py-2 text-xs flex items-center gap-2"
            style={styles.chip}
          >
            <Info className="h-4 w-4" />
            Beberapa kolom opsional. Minimal isi <b>Nama Masjid</b>.
          </div>

          {/* Alerts */}
          {!!error && (
            <div
              className="mb-5 rounded-xl px-3 py-2 text-sm border flex items-center gap-2"
              style={{
                backgroundColor: isDark
                  ? `${theme.error1}10`
                  : `${theme.error1}0D`,
                borderColor: `${theme.error1}33`,
                color: theme.error1,
              }}
            >
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          )}
          {!!success && (
            <div
              className="mb-5 rounded-xl px-3 py-2 text-sm border flex items-center gap-2"
              style={{
                backgroundColor: isDark
                  ? `${theme.success1}10`
                  : `${theme.success1}0D`,
                borderColor: `${theme.success1}33`,
                color: theme.success1,
              }}
            >
              <CheckCircle2 className="h-4 w-4" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama */}
            <div className="grid md:grid-cols-1 gap-4">
              <Field
                label="Nama Masjid"
                icon={
                  <Landmark className="h-5 w-5" style={styles.muted as any} />
                }
              >
                <input
                  type="text"
                  value={form.masjid_name}
                  onChange={onChange("masjid_name")}
                  required
                  className="w-full rounded-xl border px-10 py-3 outline-none"
                  style={{ ...styles.input }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = styles.ringFocus)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </Field>
            </div>

            {/* Bio & Lokasi */}
            <div className="grid md:grid-cols-2 gap-4">
              <Field
                label="Deskripsi Singkat"
                icon={<Info className="h-5 w-5" style={styles.muted as any} />}
              >
                <textarea
                  value={form.masjid_bio_short}
                  onChange={onChange("masjid_bio_short")}
                  rows={3}
                  className="w-full rounded-xl border px-4 py-3 outline-none"
                  style={{ ...styles.input }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = styles.ringFocus)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </Field>

              <Field
                label="Alamat/Lokasi (teks)"
                icon={
                  <MapPin className="h-5 w-5" style={styles.muted as any} />
                }
              >
                <input
                  type="text"
                  value={form.masjid_location}
                  onChange={onChange("masjid_location")}
                  className="w-full rounded-xl border px-10 py-3 outline-none"
                  style={{ ...styles.input }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = styles.ringFocus)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </Field>
            </div>

            {/* Koordinat */}
            <div className="grid md:grid-cols-3 gap-4">
              <Field
                label="Latitude"
                icon={
                  <Compass className="h-5 w-5" style={styles.muted as any} />
                }
              >
                <input
                  type="number"
                  step="0.000001"
                  value={form.masjid_latitude}
                  onChange={onChange("masjid_latitude")}
                  className="w-full rounded-xl border px-10 py-3 outline-none"
                  style={{ ...styles.input }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = styles.ringFocus)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                {!latValid && (
                  <SmallError>Rentang latitude −90 .. 90.</SmallError>
                )}
              </Field>

              <Field
                label="Longitude"
                icon={
                  <Compass className="h-5 w-5" style={styles.muted as any} />
                }
              >
                <input
                  type="number"
                  step="0.000001"
                  value={form.masjid_longitude}
                  onChange={onChange("masjid_longitude")}
                  className="w-full rounded-xl border px-10 py-3 outline-none"
                  style={{ ...styles.input }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = styles.ringFocus)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                {!lonValid && (
                  <SmallError>Rentang longitude −180 .. 180.</SmallError>
                )}
              </Field>

              <div className="flex gap-2 items-end">
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="w-full rounded-xl border px-4 py-3 text-sm"
                  style={styles.ghostBtn}
                >
                  Gunakan Lokasi Saya
                </button>
              </div>
            </div>

            {/* Google Maps URL */}
            <Field
              label="Google Maps URL"
              icon={
                <LinkIcon className="h-5 w-5" style={styles.muted as any} />
              }
            >
              <div className="flex gap-2">
                <input
                  type="url"
                  value={form.masjid_google_maps_url}
                  onChange={onChange("masjid_google_maps_url")}
                  placeholder="Tempelkan link Google Maps"
                  className="w-full rounded-xl border px-10 py-3 outline-none"
                  style={{ ...styles.input }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = styles.ringFocus)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                <button
                  type="button"
                  onClick={applyGmaps}
                  className="px-4 rounded-xl border text-sm whitespace-nowrap"
                  style={styles.ghostBtn}
                >
                  Ambil Koordinat
                </button>
              </div>
            </Field>

            {/* Domain (opsional) */}
            <Field
              label="Custom Domain (opsional)"
              icon={<Globe className="h-5 w-5" style={styles.muted as any} />}
            >
              <input
                type="text"
                value={form.masjid_domain}
                onChange={onChange("masjid_domain")}
                placeholder="contoh: alikhlas.sch.id"
                className="w-full rounded-xl border px-10 py-3 outline-none"
                style={{ ...styles.input }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = styles.ringFocus)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              {!domainValid && form.masjid_domain && (
                <SmallError>Format domain tidak valid.</SmallError>
              )}
            </Field>

            {/* Gambar */}
            <div className="grid md:grid-cols-2 gap-4">
              <Field
                label="URL Gambar (opsional)"
                icon={
                  <ImageIcon className="h-5 w-5" style={styles.muted as any} />
                }
              >
                <input
                  type="url"
                  value={form.masjid_image_url}
                  onChange={onChange("masjid_image_url")}
                  placeholder="https://..."
                  className="w-full rounded-xl border px-10 py-3 outline-none"
                  style={{ ...styles.input }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = styles.ringFocus)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </Field>
              <Field
                label="Upload Gambar (opsional)"
                icon={
                  <ImageIcon className="h-5 w-5" style={styles.muted as any} />
                }
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  className="w-full rounded-xl border px-4 py-3 outline-none"
                  style={{ ...styles.input, paddingLeft: "2.5rem" }}
                />
              </Field>
            </div>

            {/* Sosial Media */}
            <div>
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: theme.black1 }}
              >
                Sosial Media (opsional)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <UrlField
                  label="Instagram"
                  value={form.masjid_instagram_url}
                  onChange={onChange("masjid_instagram_url")}
                  styles={styles}
                />
                <UrlField
                  label="WhatsApp"
                  value={form.masjid_whatsapp_url}
                  onChange={onChange("masjid_whatsapp_url")}
                  styles={styles}
                />
                <UrlField
                  label="YouTube"
                  value={form.masjid_youtube_url}
                  onChange={onChange("masjid_youtube_url")}
                  styles={styles}
                />
                <UrlField
                  label="Facebook"
                  value={form.masjid_facebook_url}
                  onChange={onChange("masjid_facebook_url")}
                  styles={styles}
                />
                <UrlField
                  label="TikTok"
                  value={form.masjid_tiktok_url}
                  onChange={onChange("masjid_tiktok_url")}
                  styles={styles}
                />
                <UrlField
                  label="WA Group Ikhwan"
                  value={form.masjid_whatsapp_group_ikhwan_url}
                  onChange={onChange("masjid_whatsapp_group_ikhwan_url")}
                  styles={styles}
                />
                <UrlField
                  label="WA Group Akhwat"
                  value={form.masjid_whatsapp_group_akhwat_url}
                  onChange={onChange("masjid_whatsapp_group_akhwat_url")}
                  styles={styles}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              {loading && uploadPct > 0 && (
                <span className="text-xs" style={styles.muted}>
                  Mengunggah… {uploadPct}%
                </span>
              )}
              {loading && (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  className="rounded-xl px-4 py-3 border"
                  style={styles.ghostBtn}
                >
                  Batalkan
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl px-5 py-3 border"
                style={styles.ghostBtn}
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                style={styles.primaryBtn}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…
                  </>
                ) : (
                  <>
                    Simpan & Lanjutkan <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Catatan kecil */}
        <p className="mt-4 text-xs text-center" style={styles.muted}>
          Dengan mengirim data ini, Anda menyetujui ketentuan & kebijakan yang
          berlaku.
        </p>
      </div>
    </div>
  );
}

/* =======================
   Small Bits
======================= */
function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <div className="relative mt-2">
        <span className="absolute inset-y-0 left-3 flex items-center">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

function UrlField({
  label,
  value,
  onChange,
  styles,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  styles: any;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <div className="relative mt-2">
        <span className="absolute inset-y-0 left-3 flex items-center">
          <LinkIcon className="h-5 w-5" style={styles.muted as any} />
        </span>
        <input
          type="url"
          value={value}
          onChange={onChange}
          placeholder="https://..."
          className="w-full rounded-xl border px-10 py-3 outline-none"
          style={{ ...styles.input }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = styles.ringFocus)}
          onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
        />
      </div>
    </div>
  );
}

function SmallError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-red-500">{children}</p>;
}
