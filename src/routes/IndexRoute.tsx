import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Layout
import DkmLayout from '@/layout/DKMLayout'
import DkmSettingLayout from '@/layout/DKMSettingLayout'

// Halaman DKM
import DashboardAdminDkm from '@/pages/dkm/home/DKMHome'
import ProfilMasjid from '@/pages/dkm/profile/DKMProfile'
import ProfileDKMPengajar from '@/pages/dkm/profile/DKMProfileDKMTeacher'
import Kajian from '@/pages/dkm/lecture/DKMLectureSessions'
import Sertifikat from '@/pages/dkm/certificate/DKMCertificate'
import Keuangan from '@/pages/dkm/finance/DKMFinance'
import Postingan from '@/pages/dkm/post/DKMPost'

// Halaman Setting DKM
import ProfilSayaDkm from '@/pages/dkm/setting/DKMHomeMyProfile'
import Appereance from '@/pages/dkm/setting/DKMAppereance'
import SupportUs from '@/pages/dkm/setting/DKMSupportUs'
import Partnership from '@/pages/dkm/setting/DKMPartnership'
import FaqPage from '@/pages/dkm/setting/DKMFaq'

// Halaman Penulis
import DashboardAuthor from '@/pages/author/home/AuthorHome'

// Halaman Auth
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'

// Not Found
import NotFound from '@/pages/NotFound'

// Auth Route Guard
import RequireRoleRoute from './RequireRoleRoute'
import AuthorLayout from '@/layout/AuthorLayout'
import TeacherLayout from '@/layout/TeacherLayout'
import DashboardTeacher from '@/pages/teacher/home/TeacherHome'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==== Public Routes ==== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==== Protected Routes - DKM ==== */}
        <Route element={<RequireRoleRoute allowedRoles={['dkm']} />}>
          <Route path="/dkm" element={<DkmLayout />}>
            <Route index element={<DashboardAdminDkm />} />
            <Route path="profil" element={<ProfilMasjid />} />
            <Route path="profil-dkm" element={<ProfileDKMPengajar />} />
            <Route path="kajian" element={<Kajian />} />
            <Route path="sertifikat" element={<Sertifikat />} />
            <Route path="keuangan" element={<Keuangan />} />
            <Route path="postingan" element={<Postingan />} />

            <Route element={<DkmSettingLayout />}>
              <Route path="profil-saya" element={<ProfilSayaDkm />} />
              <Route path="tampilan" element={<Appereance />} />
              <Route path="dukung-kami" element={<SupportUs />} />
              <Route path="kerjasama" element={<Partnership />} />
              <Route path="tanya-jawab" element={<FaqPage />} />
            </Route>
          </Route>
        </Route>

        {/* ==== Protected Routes - Author ==== */}
        <Route element={<RequireRoleRoute allowedRoles={['author']} />}>
          <Route path="/author" element={<AuthorLayout />}>
            <Route index element={<DashboardAuthor />} />
          </Route>
        </Route>

        {/* ==== Protected Routes - Teacher ==== */}
        <Route element={<RequireRoleRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<DashboardTeacher />} />
          </Route>
        </Route>

        {/* ==== 404 ==== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
