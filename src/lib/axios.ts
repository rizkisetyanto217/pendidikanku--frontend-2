import axios from 'axios'

const api = axios.create({
  baseURL: 'https://masjidkubackend4-production.up.railway.app',
  withCredentials: true, // ⬅️ agar kirim & terima cookie
})

export default api
