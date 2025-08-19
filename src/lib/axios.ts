// // src/lib/axios.ts
// import axios from "axios";

// const TOKEN_KEY = "access_token";

// const api = axios.create({
//   baseURL: "https://masjidkubackend4-production.up.railway.app",
//   withCredentials: true, // aman ON jika backend juga pakai cookie
// });

// api.interceptors.request.use((cfg) => {
//   const t =
//     typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
//   cfg.headers = cfg.headers ?? {};
//   if (t) cfg.headers.Authorization = `Bearer ${t}`;
//   return cfg;
// });

// api.interceptors.response.use(
//   (r) => r,
//   (err) => {
//     if (err?.response?.status === 401) {
//       try {
//         localStorage.removeItem(TOKEN_KEY);
//       } catch {}
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;

// src/lib/axios.ts
import axiosLib, { type AxiosRequestConfig } from "axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://masjidkubackend4-production.up.railway.app";

const axios = axiosLib.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// ---- type metadata biar enak dipakai di interceptor
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: { id?: string; start?: number };
  }
}

const DEBUG_API = (import.meta.env.VITE_DEBUG_API ?? "true") !== "false";

// util aman untuk browser/SSR
const now = () =>
  typeof performance !== "undefined" && performance.now
    ? performance.now()
    : Date.now();

const uuid = () => {
  const rnd =
    typeof globalThis !== "undefined" &&
    (globalThis as any).crypto &&
    (globalThis as any).crypto.randomUUID
      ? (globalThis as any).crypto.randomUUID()
      : String(Date.now() + Math.random());
  return rnd;
};

// ================== REQUEST ==================
axios.interceptors.request.use((config) => {
  if (DEBUG_API) {
    config.metadata ??= {};
    config.metadata.start = now();
    config.metadata.id = uuid();

    // ❗ Penting: JANGAN set header custom apa pun di sini (hindari preflight CORS)
    // Kalau perlu correlation-id, izinkan dulu di CORS backend.

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

// ================== RESPONSE ==================
axios.interceptors.response.use(
  (res) => {
    if (DEBUG_API) {
      const dur = now() - (res.config.metadata?.start ?? now());

      // Warning bila server mengembalikan HTML (biasanya salah proxy/baseURL)
      const ct = String(res.headers?.["content-type"] || "");
      if (typeof res.data === "string" && ct.includes("text/html")) {
        console.warn(
          "[API] got HTML from",
          res.config.url,
          "→ kemungkinan proxy/baseURL salah."
        );
      }

      console.groupCollapsed(
        `%cAPI ⇠ ${res.status} ${res.config.method?.toUpperCase()} ${res.config.url} (${dur.toFixed(0)}ms)`,
        "color:#22c55e;font-weight:600"
      );
      console.log("reqId:", res.config.metadata?.id);
      console.log("response:", res.data);
      console.groupEnd();
    }
    return res;
  },
  (error) => {
    if (DEBUG_API) {
      const cfg = error.config as AxiosRequestConfig | undefined;
      const dur = now() - (cfg?.metadata?.start ?? now());
      const status = error.response?.status ?? "ERR";
      console.groupCollapsed(
        `%cAPI ✖ ${status} ${cfg?.method?.toUpperCase?.() ?? ""} ${cfg?.url ?? ""} (${dur.toFixed(0)}ms)`,
        "color:#ef4444;font-weight:700"
      );
      if (error.response) {
        console.log("response.data:", error.response.data);
        console.log("response.headers:", error.response.headers);
      } else {
        console.log("message:", error.message);
      }
      console.groupEnd();
    }
    return Promise.reject(error);
  }
);

export default axios;
