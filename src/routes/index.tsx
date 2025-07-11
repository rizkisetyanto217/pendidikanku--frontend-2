// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Layout
import DkmLayout from '@/layout/AdminDKMLayout'
import DkmSettingLayout from '@/layout/AdminDKMSettingLayout'
import PenulisLayout from '@/layout/PenulisLayout'

// Halaman DKM
import DashboardAdminDkm from '@/pages/dkm/home/Home'
import ProfilMasjid from '@/pages/dkm/profile/Profile'
import ProfileDKMPengajar from '@/pages/dkm/profile/ProfileDKMPengajar'
import Notifikasi from '@/pages/dkm/notification/Notifikasi'
import Kajian from '@/pages/dkm/lecture/Lecture'
import Sertifikat from '@/pages/dkm/certificate/Certificate'
import Keuangan from '@/pages/dkm/finance/Finance'
import Postingan from '@/pages/dkm/post/Post'

// Halaman Setting DKM
import ProfilSayaDkm from '@/pages/dkm/setting/Home'
import Appereance from '@/pages/dkm/setting/Appereance'

// Halaman Penulis
import DashboardPenulis from '@/pages/penulis/DashboardPenulis'

// Halaman Auth
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'

// Not Found
import NotFound from '@/pages/NotFound'
import DukunganKami from '@/pages/dkm/setting/SupportUs'
import SupportUs from '@/pages/dkm/setting/SupportUs'
import Partnership from '@/pages/dkm/setting/Partnership'
import FaqPage from '@/pages/dkm/setting/Faq'
import RequireAuth from './RequireAuth'

export default function AppRoutes() {
  return (
    

<BrowserRouter>
  <Routes>
    {/* ==== Public Routes ==== */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* ==== Protected Routes ==== */}
    <Route element={<RequireAuth />}>
      {/* ===== DKM ===== */}
      <Route path="/dkm" element={<DkmLayout />}>
        <Route index element={<DashboardAdminDkm />} />
        <Route path="profil" element={<ProfilMasjid />} />
        <Route path="profil-dkm" element={<ProfileDKMPengajar />} />
        <Route path="notifikasi" element={<Notifikasi />} />
        <Route path="kajian" element={<Kajian />} />
        <Route path="sertifikat" element={<Sertifikat />} />
        <Route path="keuangan" element={<Keuangan />} />
        <Route path="postingan" element={<Postingan />} />

        <Route element={<DkmSettingLayout />}>
          <Route path="profil-saya" element={<ProfilSayaDkm />} />
          <Route path="appereance" element={<Appereance />} />
          <Route path="support-us" element={<SupportUs />} />
          <Route path="partnership" element={<Partnership />} />
          <Route path="faq" element={<FaqPage />} />
        </Route>
      </Route>

      {/* ===== PENULIS ===== */}
      <Route path="/penulis" element={<PenulisLayout />}>
        <Route index element={<DashboardPenulis />} />
      </Route>
    </Route>

    {/* ===== 404 ===== */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
  )
}
