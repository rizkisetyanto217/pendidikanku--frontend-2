// src/lib/axios.ts — cookie-based token + masjid context + debug

import axiosLib, { AxiosError } from "axios";

/* ====== ENV CONFIG ====== */
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://masjidkubackend4-production.up.railway.app";

const WITH_CREDENTIALS =
  (import.meta.env.VITE_WITH_CREDENTIALS ?? "false") === "true"; // default false
const DEBUG_API = (import.meta.env.VITE_DEBUG_API ?? "true") === "true";
const SEND_X_REQUESTED_WITH =
  (import.meta.env.VITE_SEND_X_REQUESTED_WITH ?? "false") === "true";

// nama cookie token (kompatibel dgn TOKEN_KEY lama)
export const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY ?? "access_token";
// kalau ingin mematikan Authorization header (mis. pakai HttpOnly cookie dari server)
const SEND_AUTH_HEADER =
  (import.meta.env.VITE_SEND_AUTH_HEADER ?? "true") === "true";

export const LOGOUT_PATH = import.meta.env.VITE_LOGOUT_PATH ?? "/api/logout";
export const LOGOUT_METHOD = String(
  import.meta.env.VITE_LOGOUT_METHOD ?? "GET"
).toUpperCase();

/* ====== COOKIE HELPERS ====== */
const hasDocument = () => typeof document !== "undefined";
const escapeRe = (s: string) => s.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");

export function getAuthToken(): string | null {
  if (!hasDocument()) return null;
  const m = document.cookie.match(
    new RegExp(`(?:^|; )${escapeRe(TOKEN_KEY)}=([^;]*)`)
  );
  return m ? decodeURIComponent(m[1]) : null;
}

export function setAuthToken(token: string | null, remember = true) {
  if (!hasDocument()) return;
  if (!token) return clearAuthToken();

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const parts = [
    `${TOKEN_KEY}=${encodeURIComponent(token)}`,
    "Path=/",
    "SameSite=Lax",
    secure ? "Secure" : "",
  ].filter(Boolean);

  // remember -> cookie persist 30 hari; else session cookie
  if (remember) {
    const maxAge = 60 * 60 * 24 * 30;
    parts.push(`Max-Age=${maxAge}`);
  }
  document.cookie = parts.join("; ");
}

export function clearAuthToken() {
  if (!hasDocument()) return;
  document.cookie = `${TOKEN_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
}

/* ====== MIGRASI DARI STORAGE (kompatibilitas versi lama) ====== */
(function migrateTokenFromStorageToCookie() {
  try {
    const fromLS = localStorage.getItem(TOKEN_KEY);
    const fromSS = sessionStorage.getItem(TOKEN_KEY);
    const legacy = fromLS || fromSS;
    if (legacy && !getAuthToken()) {
      // jika dulu user centang remember → kemungkinan ada di LS
      setAuthToken(legacy, !!fromLS);
    }
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
})();

/* ====== INSTANCE ====== */
const api = axiosLib.create({
  baseURL: API_BASE,
  withCredentials: WITH_CREDENTIALS,
  timeout: 60_000,
});

declare module "axios" {
  // sekadar untuk logging durasi req/res
  interface AxiosRequestConfig {
    metadata?: { id?: string; start?: number };
  }
}

/* ====== UTILS ====== */
const now =
  typeof performance !== "undefined" && performance.now
    ? () => performance.now()
    : () => Date.now();

const uuid =
  globalThis.crypto?.randomUUID?.bind(globalThis.crypto) ??
  (() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);

/* ====== INTERCEPTORS ====== */
api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  if (SEND_X_REQUESTED_WITH)
    (config.headers as any)["X-Requested-With"] = "XMLHttpRequest";

  // attach Bearer dari cookie (jika diizinkan)
  const token = getAuthToken();
  if (SEND_AUTH_HEADER && token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  // attach konteks masjid
  try {
    const ctxMasjidId = localStorage.getItem("ctx_masjid_id");
    if (ctxMasjidId) (config.headers as any)["X-Masjid-ID"] = ctxMasjidId;
  } catch {}

  if (DEBUG_API) {
    config.metadata ??= {};
    config.metadata.start = now();
    config.metadata.id = uuid();
    const { method, url, params, data } = config;
    console.groupCollapsed(
      `%cAPI ⇢ ${String(method).toUpperCase()} ${url}`,
      "color:#0ea5e9;font-weight:600"
    );
    console.log("reqId:", config.metadata.id);
    if (params) console.log("params:", params);
    if (data) console.log("data:", data);
    console.groupEnd();
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (DEBUG_API) {
      const dur = now() - (res.config.metadata?.start ?? now());
      console.groupCollapsed(
        `%cAPI ⇠ ${res.status} ${res.config.method?.toUpperCase()} ${
          res.config.url
        } (${dur.toFixed(0)}ms)`,
        "color:#22c55e;font-weight:600"
      );
      console.log("response:", res.data);
      console.groupEnd();
    }
    return res;
  },
  (error: AxiosError) => {
    const status = error.response?.status ?? "ERR";
    if (DEBUG_API) {
      console.groupCollapsed(
        `%cAPI ✖ ${status} ${error.config?.url ?? ""}`,
        "color:#ef4444;font-weight:700"
      );
      console.log("error:", error.response?.data || error.message);
      console.groupEnd();
    }
    if (error.response?.status === 401) {
      clearAuthToken();
      window.dispatchEvent(
        new CustomEvent("auth:unauthorized", { detail: { source: "axios" } })
      );
    }
    return Promise.reject(error);
  }
);

/* ====== LOGOUT HELPER ====== */
export async function apiLogout() {
  try {
    if (LOGOUT_METHOD === "POST") await api.post(LOGOUT_PATH);
    else await api.get(LOGOUT_PATH);
  } catch {
    // abaikan error API saat logout
  } finally {
    clearAuthToken();
    window.dispatchEvent(
      new CustomEvent("auth:logout", { detail: { source: "axios" } })
    );
  }
}

export default api;
