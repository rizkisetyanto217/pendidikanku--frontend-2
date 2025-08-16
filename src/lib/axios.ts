import axios from "axios";

const api = axios.create({
  baseURL: "https://masjidkubackend4-production.up.railway.app",
  // withCredentials: false, // tidak perlu kalau pakai Bearer
});

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("access_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default api;
