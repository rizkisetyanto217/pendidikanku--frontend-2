// src/lib/axios.ts
import axios from "axios";

const TOKEN_KEY = "access_token";

const api = axios.create({
  baseURL: "https://masjidkubackend4-production.up.railway.app",
  withCredentials: true, // aman ON jika backend juga pakai cookie
});

api.interceptors.request.use((cfg) => {
  const t =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  cfg.headers = cfg.headers ?? {};
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {}
    }
    return Promise.reject(err);
  }
);

export default api;
