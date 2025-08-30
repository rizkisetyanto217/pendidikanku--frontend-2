// src/pages/masjid/RegisterLembaga.tsx (refactor pakai InputField + Success Lock Modal)
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import axios, { apiLogout } from "@/lib/axios"; // ⬅️ pastikan export-nya ada
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
  LogOut,
} from "lucide-react";

// ⬇️ sesuaikan path InputField
import InputField from "@/components/common/main/InputField";

/* =======================
   Utils
======================= */
const CREATE_ENDPOINT = "api/u/masjids/user"; // ← ganti jika perlu

function extractLatLngFromGmaps(url: string) {
  try {
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
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      muted: { color: theme.silver2 },
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
      errorBg: isDark ? `${theme.error1}10` : `${theme.error1}0D`,
      errorBorder: `${theme.error1}33`,
      successBg: isDark ? `${theme.success1}10` : `${theme.success1}0D`,
      successBorder: `${theme.success1}33`,
      // Modal
      modalBackdrop: `rgba(0,0,0,${isDark ? 0.65 : 0.5})`,
    }),
    [theme, isDark]
  );

  // Lock scroll saat modal open
  useEffect(() => {
    if (showSuccessModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showSuccessModal]);

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

      // Ambil masjid_id dari response (disimpan kalau nanti mau dipakai)
      const masjidId =
        (res.data as any)?.data?.masjid_id ??
        (res.data as any)?.masjid_id ??
        (res.data as any)?.data?.id ??
        (res.data as any)?.id ??
        null;

      setSuccess("Masjid berhasil didaftarkan.");
      // ⬇️ tampilkan modal kunci; jangan navigate otomatis
      setShowSuccessModal(true);
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

  const handleLogoutAndGoLogin = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await apiLogout(); // ⬅️ clear session/token server & client
    } catch (e) {
      // abaikan error, tetap paksa redirect
      console.error("apiLogout error (ignored):", e);
    } finally {
      setIsLoggingOut(false);
      navigate("/login", { replace: true });
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
                backgroundColor: styles.errorBg,
                borderColor: styles.errorBorder,
                color: theme.error1,
              }}
            >
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          )}
          {!!success && !showSuccessModal && (
            <div
              className="mb-5 rounded-xl px-3 py-2 text-sm border flex items-center gap-2"
              style={{
                backgroundColor: styles.successBg,
                borderColor: styles.successBorder,
                color: theme.success1,
              }}
            >
              <CheckCircle2 className="h-4 w-4" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama */}
            <div className="grid md:grid-cols-1 gap-4">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5" style={styles.muted as any} />
                <span className="text-sm" style={{ color: theme.black1 }}>
                  Data Utama
                </span>
              </div>
              <InputField
                label="Nama Masjid"
                name="masjid_name"
                value={form.masjid_name}
                onChange={onChange("masjid_name")}
                placeholder="Masukkan nama masjid"
                type="text"
              />
            </div>

            {/* Bio & Lokasi */}
            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="Deskripsi Singkat"
                name="masjid_bio_short"
                value={form.masjid_bio_short}
                onChange={onChange("masjid_bio_short")}
                as="textarea"
                rows={3}
                placeholder="Tulis deskripsi singkat masjid"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-5 w-5" style={styles.muted as any} />
                  <span className="text-sm" style={{ color: theme.black1 }}>
                    Alamat/Lokasi (teks)
                  </span>
                </div>
                <InputField
                  label=""
                  name="masjid_location"
                  value={form.masjid_location}
                  onChange={onChange("masjid_location")}
                  placeholder="Jl. Contoh No. 1, Kota"
                />
              </div>
            </div>

            {/* Koordinat */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="h-5 w-5" style={styles.muted as any} />
                  <span className="text-sm" style={{ color: theme.black1 }}>
                    Koordinat
                  </span>
                </div>
                <InputField
                  label="Latitude"
                  name="masjid_latitude"
                  type="number"
                  value={form.masjid_latitude}
                  onChange={onChange("masjid_latitude")}
                  placeholder="-7.123456"
                />
                {!latValid && (
                  <SmallError>Rentang latitude −90 .. 90.</SmallError>
                )}
              </div>

              <div className="pt-6 md:pt-0">
                <InputField
                  label="Longitude"
                  name="masjid_longitude"
                  type="number"
                  value={form.masjid_longitude}
                  onChange={onChange("masjid_longitude")}
                  placeholder="112.654321"
                />
                {!lonValid && (
                  <SmallError>Rentang longitude −180 .. 180.</SmallError>
                )}
              </div>

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
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LinkIcon className="h-5 w-5" style={styles.muted as any} />
                <span className="text-sm" style={{ color: theme.black1 }}>
                  Google Maps
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <InputField
                    label="Google Maps URL"
                    name="masjid_google_maps_url"
                    type="url"
                    value={form.masjid_google_maps_url}
                    onChange={onChange("masjid_google_maps_url")}
                    placeholder="Tempelkan link Google Maps"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyGmaps}
                  className="px-4 rounded-xl border text-sm whitespace-nowrap h-[42px] md:h-auto mt-[22px]"
                  style={styles.ghostBtn}
                >
                  Ambil Koordinat
                </button>
              </div>
            </div>

            {/* Domain (opsional) */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-5 w-5" style={styles.muted as any} />
                <span className="text-sm" style={{ color: theme.black1 }}>
                  Custom Domain (opsional)
                </span>
              </div>
              <InputField
                label=""
                name="masjid_domain"
                value={form.masjid_domain}
                onChange={onChange("masjid_domain")}
                placeholder="contoh: alikhlas.sch.id"
              />
              {!domainValid && form.masjid_domain && (
                <SmallError>Format domain tidak valid.</SmallError>
              )}
            </div>

            {/* Gambar */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="h-5 w-5" style={styles.muted as any} />
                  <span className="text-sm" style={{ color: theme.black1 }}>
                    URL Gambar (opsional)
                  </span>
                </div>
                <InputField
                  label=""
                  name="masjid_image_url"
                  type="url"
                  value={form.masjid_image_url}
                  onChange={onChange("masjid_image_url")}
                  placeholder="https://..."
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="h-5 w-5" style={styles.muted as any} />
                  <span className="text-sm" style={{ color: theme.black1 }}>
                    Upload Gambar (opsional)
                  </span>
                </div>
                <InputField
                  label="Upload Gambar"
                  name="masjid_image_file"
                  type="file"
                  accept="image/*"
                  onFileChange={onFile}
                />
              </div>
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
                <InputField
                  label="Instagram"
                  name="masjid_instagram_url"
                  type="url"
                  value={form.masjid_instagram_url}
                  onChange={onChange("masjid_instagram_url")}
                  placeholder="https://instagram.com/..."
                />
                <InputField
                  label="WhatsApp"
                  name="masjid_whatsapp_url"
                  type="url"
                  value={form.masjid_whatsapp_url}
                  onChange={onChange("masjid_whatsapp_url")}
                  placeholder="https://wa.me/..."
                />
                <InputField
                  label="YouTube"
                  name="masjid_youtube_url"
                  type="url"
                  value={form.masjid_youtube_url}
                  onChange={onChange("masjid_youtube_url")}
                  placeholder="https://youtube.com/@..."
                />
                <InputField
                  label="Facebook"
                  name="masjid_facebook_url"
                  type="url"
                  value={form.masjid_facebook_url}
                  onChange={onChange("masjid_facebook_url")}
                  placeholder="https://facebook.com/..."
                />
                <InputField
                  label="TikTok"
                  name="masjid_tiktok_url"
                  type="url"
                  value={form.masjid_tiktok_url}
                  onChange={onChange("masjid_tiktok_url")}
                  placeholder="https://tiktok.com/@..."
                />
                <InputField
                  label="WA Group Ikhwan"
                  name="masjid_whatsapp_group_ikhwan_url"
                  type="url"
                  value={form.masjid_whatsapp_group_ikhwan_url}
                  onChange={onChange("masjid_whatsapp_group_ikhwan_url")}
                  placeholder="https://chat.whatsapp.com/..."
                />
                <InputField
                  label="WA Group Akhwat"
                  name="masjid_whatsapp_group_akhwat_url"
                  type="url"
                  value={form.masjid_whatsapp_group_akhwat_url}
                  onChange={onChange("masjid_whatsapp_group_akhwat_url")}
                  placeholder="https://chat.whatsapp.com/..."
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

      {/* =======================
          SUCCESS LOCK MODAL
          (muncul setelah registrasi sukses, hanya 1 tombol)
      ======================== */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-labelledby="success-title"
          aria-describedby="success-desc"
          // tanpa onClick: tidak bisa close lewat backdrop
          style={{ backgroundColor: styles.modalBackdrop }}
        >
          <div
            className="mx-4 w-full max-w-md rounded-2xl border p-6 shadow-xl"
            style={{
              backgroundColor: theme.white1,
              borderColor: theme.white3,
              color: theme.black1,
            }}
            // cegah bubbling ke backdrop
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isDark
                    ? `${theme.success1}15`
                    : `${theme.success1}12`,
                }}
              >
                <CheckCircle2 className="h-6 w-6" color={theme.success1} />
              </div>
              <h2 id="success-title" className="text-lg font-semibold">
                Registrasi Berhasil
              </h2>
            </div>

            <p id="success-desc" className="text-sm" style={styles.muted}>
              Akun lembaga Anda telah aktif. Demi sinkron sesi, silakan login
              kembali untuk mulai mengelola profil masjid.
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleLogoutAndGoLogin}
                disabled={isLoggingOut}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.white1,
                }}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengarahkan ke Login…
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Login kembali
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmallError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-red-500">{children}</p>;
}
