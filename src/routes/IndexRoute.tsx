import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import DkmLayout from "@/layout/DKMLayout";
import DkmSettingLayout from "@/layout/DKMSettingLayout";

// Halaman DKM
import DashboardAdminDkm from "@/pages/dkm/home/DKMHome";
import ProfilMasjid from "@/pages/dkm/profile/masjid/DKMProfile";
import ProfileDKMPengajar from "@/pages/dkm/profile/dkm/DKMProfileDKMTeacher";
import Kajian from "@/pages/dkm/lecture/lectureSessions/main/DKMLectureSessions";
import Sertifikat from "@/pages/dkm/certificate/DKMCertificate";
import Keuangan from "@/pages/dkm/finance/DKMFinance";
import Postingan from "@/pages/dkm/post/DKMPost";

// Halaman Setting DKM
import ProfilSayaDkm from "@/pages/dkm/setting/DKMHomeMyProfile";
import Appereance from "@/pages/dkm/setting/DKMAppereance";
import SupportUs from "@/pages/dkm/setting/DKMSupportUs";
import Partnership from "@/pages/dkm/setting/DKMPartnership";
import FaqPage from "@/pages/dkm/setting/DKMFaq";

// Halaman Penulis
import AuthorHome from "@/pages/author/home/AuthorHome";

// Halaman Auth
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Not Found
import NotFound from "@/pages/NotFound";

// Auth Route Guard
import RequireRoleRoute from "./RequireRoleRoute";
import AuthorLayout from "@/layout/AuthorLayout";
import TeacherLayout from "@/layout/TeacherLayout";
import DashboardTeacher from "@/pages/teacher/home/TeacherHome";
import TreasurerLayout from "@/layout/TreasurerLayout";
import AdminLayout from "@/layout/AdminLayout";
import TeacherHome from "@/pages/teacher/home/TeacherHome";
import TreasurerHome from "@/pages/treasurer/home/TreasurerHome";
import AdminHome from "@/pages/admin/home/AdminHome";
import DkmEditSosmedProfile from "@/pages/dkm/profile/masjid/DKMEditSosmedMasjid";
import DKMEditMasjid from "@/pages/dkm/profile/masjid/DKMEditMasjid";
import DKMEditProfileMasjid from "@/pages/dkm/profile/masjid/DKMEditProfileMasjid";
import DKMLectureSessions from "@/pages/dkm/lecture/lectureSessions/main/DKMLectureSessions";
import DKMLecture from "@/pages/dkm/lecture/lecture/main/DKMLecture";
import DKMLectureParent from "@/pages/dkm/lecture/DKMLectureParent";
import DKMDetailLectureSessions from "@/pages/dkm/lecture/lectureSessions/detail/DKMDetailLectureSessions";
import DKMInformationLectureSessions from "@/pages/dkm/lecture/lectureSessions/information/DKMInformationLectureSessions";
import DKMVideoLectureSessions from "@/pages/dkm/lecture/lectureSessions/video/DKMVideoLectureSessions";
import DKMQuizLectureSessions from "@/pages/dkm/lecture/lectureSessions/quiz/DKMQuizLectureSessions";
import DKMFullTranscriptLectureSessions from "@/pages/dkm/lecture/lectureSessions/fullTranscipt/DKMFullTranscriptLectureSessions";
import DKMDocumentLectureSessions from "@/pages/dkm/lecture/lecture/document/DKMDocumentLectureSession";
import DKMSummaryLectureSessions from "@/pages/dkm/lecture/lectureSessions/summary/DKMSummaryLectureSessions";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==== Public Routes ==== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==== Protected Routes - DKM ==== */}
        <Route element={<RequireRoleRoute allowedRoles={["dkm"]} />}>
          <Route path="/dkm" element={<DkmLayout />}>
            <Route index element={<DashboardAdminDkm />} />

            {/* Profil Masjid */}
            <Route path="profil-masjid" element={<ProfilMasjid />}>
              <Route path="edit-sosmed" element={<DkmEditSosmedProfile />} />
              <Route path="edit-masjid" element={<DKMEditMasjid />} />
              <Route
                path="edit-profil-masjid"
                element={<DKMEditProfileMasjid />}
              />
            </Route>
            <Route path="profil-dkm" element={<ProfileDKMPengajar />} />

            <Route path="kajian" element={<DKMLectureParent />}>
              <Route index element={<DKMLectureSessions />} />
              <Route path="kajian-detail/:id" element={<DKMDetailLectureSessions />} />
              <Route
                path="kajian-detail/:id/informasi"
                element={<DKMInformationLectureSessions />}
              />
              <Route
                path="kajian-detail/:id/video"
                element={<DKMVideoLectureSessions />}
              />
              <Route
                path="kajian-detail/:id/latihan-soal"
                element={<DKMQuizLectureSessions />}
              />
              <Route
                path="kajian-detail/:id/materi-lengkap"
                element={<DKMFullTranscriptLectureSessions />}
              />
              <Route
                path="kajian-detail/:id/ringkasan"
                element={<DKMSummaryLectureSessions />}
              />
              <Route
                path="kajian-detail/:id/dokumentasi"
                element={<DKMDocumentLectureSessions />}
              />
            </Route>

            <Route path="tema" element={<DKMLectureParent />}>
              <Route index element={<DKMLecture />} />
            </Route>

            <Route path="sertifikat" element={<Sertifikat />} />
            <Route path="keuangan" element={<Keuangan />} />
            <Route path="postingan" element={<Postingan />} />

            {/* Nested setting layout */}
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
        <Route element={<RequireRoleRoute allowedRoles={["author"]} />}>
          <Route path="/author" element={<AuthorLayout />}>
            <Route index element={<AuthorHome />} />
          </Route>
        </Route>

        {/* ==== Protected Routes - Teacher ==== */}
        <Route element={<RequireRoleRoute allowedRoles={["teacher"]} />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<TeacherHome />} />
          </Route>
        </Route>

        {/* ==== Protected Routes - Teacher ==== */}
        <Route element={<RequireRoleRoute allowedRoles={["treasurer"]} />}>
          <Route path="/treasurer" element={<TreasurerLayout />}>
            <Route index element={<TreasurerHome />} />
          </Route>
        </Route>

        {/* ==== Protected Routes - Teacher ==== */}
        <Route element={<RequireRoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
          </Route>
        </Route>

        {/* ==== 404 ==== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
