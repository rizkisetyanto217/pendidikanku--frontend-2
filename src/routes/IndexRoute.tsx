import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import DkmLayout from "@/layout/DKMLayout";
import DkmSettingLayout from "@/layout/DKMSettingLayout";

// Halaman DKM
import DashboardAdminDkm from "@/pages/dkm/home/DKMHome";
import ProfilMasjid from "@/pages/dkm/profile/masjid/DKMProfile";
import ProfileDKMPengajar from "@/pages/dkm/profile/dkm/DKMProfileDKMTeacher";
import Kajian from "@/pages/dkm/lecture/lecture-sessions/main/DKMLectureSessions";
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
import TreasurerLayout from "@/layout/TreasurerLayout";
import AdminLayout from "@/layout/AdminLayout";
import TeacherHome from "@/pages/teacher/home/TeacherHome";
import TreasurerHome from "@/pages/treasurer/home/TreasurerHome";
import AdminHome from "@/pages/admin/home/AdminHome";
import DkmEditSosmedProfile from "@/pages/dkm/profile/masjid/DKMEditSosmedMasjid";
import DKMEditMasjid from "@/pages/dkm/profile/masjid/DKMEditMasjid";
import DKMEditProfileMasjid from "@/pages/dkm/profile/masjid/DKMEditProfileMasjid";
import DKMLectureSessions from "@/pages/dkm/lecture/lecture-sessions/main/DKMLectureSessions";
import DKMLecture from "@/pages/dkm/lecture/lecture/main/DKMLecture";
import DKMLectureParent from "@/pages/dkm/lecture/DKMLectureParent";
import DKMDetailLectureSessions from "@/pages/dkm/lecture/lecture-sessions/detail/DKMDetailLectureSessions";
import DKMInformationLectureSessions from "@/pages/dkm/lecture/lecture-sessions/information/DKMInformationLectureSessions";
import DKMVideoLectureSessions from "@/pages/dkm/lecture/lecture-sessions/video/DKMVideoLectureSessions";
import DKMQuizLectureSessions from "@/pages/dkm/lecture/lecture-sessions/quiz/DKMQuizLectureSessions";
import DKMFullTranscriptLectureSessions from "@/pages/dkm/lecture/lecture-sessions/fullTranscipt/DKMFullTranscriptLectureSessions";
import DKMDocumentLectureSessions from "@/pages/dkm/lecture/lecture-sessions/document/DKMdocumentLectureSessions";
import DKMSummaryLectureSessions from "@/pages/dkm/lecture/lecture-sessions/summary/DKMSummaryLectureSessions";
import DKMStatsQuizLectureSessions from "@/pages/dkm/lecture/lecture-sessions/quiz/DKMStatsQuizLectureSessions";
import DKMDetailLecture from "@/pages/dkm/lecture/lecture/detail/DKMDetailLecture";
import DKMInformationLecture from "@/pages/dkm/lecture/lecture/information/DKMInformationLecture";
import DKMVideoLecture from "@/pages/dkm/lecture/lecture/video/DKMVideoLecture";
import DKMQuizLecture from "@/pages/dkm/lecture/lecture/quiz/DKMQuizLecture";
import DKMFullTranscriptLecture from "@/pages/dkm/lecture/lecture/full-transcript/DKMFullTranscriptLecture";
import DKMSummaryLecture from "@/pages/dkm/lecture/lecture/summary/DKMSummaryLecture";
import DKMDocumentLecture from "@/pages/dkm/lecture/lecture/document/DKMDocumentLecture";
import DKMAllLectureLectureSessions from "@/pages/dkm/lecture/lecture/all-lecture-sessions/DKMAllLectureSession";
import DKMSuggestLecture from "@/pages/dkm/lecture/lecture/suggest/DKMSuggestLecture";
import DKMAddLectureSession from "@/pages/dkm/lecture/lecture-sessions/main/DKMAddEditLectureSessions";
import DKMAddEditLectureSession from "@/pages/dkm/lecture/lecture-sessions/main/DKMAddEditLectureSessions";
import DKMAddEditLecture from "@/pages/dkm/lecture/lecture/main/DKMAddEditLecture";
import MasjidLinkTree from "@/pages/user/linktree/MasjidLinkTreeHome";
import MasjidDonationMasjid from "@/pages/user/linktree/finansial/MasjidDonationMasjidFinansial";
import MasjidLayout from "@/pages/user/MasjidLayout";
import MasjidDonationConfirmDonation from "@/pages/user/linktree/finansial/MasjidDonationConfirmFinansial";
import MasjidProfile from "@/pages/user/linktree/profil/MasjidProfil";
import MasjidDKMPengajarProfil from "@/pages/user/linktree/profil/MasjidDKMPengajarProfil";
import MasjidDetailSpeech from "@/pages/user/linktree/profil/MasjidDetailSpeechProfil";
import MasjidProfileDetail from "@/pages/user/linktree/profil/MasjidDetailProfil";
import MasjidScheduleLecture from "@/pages/user/linktree/lecture/MasjidScheduleLecture";
import MasjidReportFinansial from "@/pages/user/linktree/finansial/MasjidReportFinansial";
import MasjidDetailLecture from "@/pages/user/linktree/lecture/MasjidDetailLecture";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ==== Public Routes ==== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<MasjidLayout />}>
        <Route path="masjid/:slug">
          <Route index element={<MasjidLinkTree />} />

          <Route path="profil">
            <Route index element={<MasjidProfile />} />
            <Route path="dkm-pengajar" element={<MasjidDKMPengajarProfil />} />
            <Route path="sambutan" element={<MasjidDetailSpeech />} />
            <Route path="detail" element={<MasjidProfileDetail />} />
          </Route>

          <Route path="donasi" element={<MasjidDonationMasjid />} />
          <Route
            path="donasi/konfirmasi"
            element={<MasjidDonationConfirmDonation />}
          />

          <Route path="keuangan" element={<MasjidReportFinansial />} />
          <Route path="jadwal-kajian" element={<MasjidScheduleLecture />} />

          {/* ✅ Detail Agenda Kajian */}
          <Route path="kajian/:id" element={<MasjidDetailLecture />} />
        </Route>
      </Route>

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
            <Route path="tambah-edit" element={<DKMAddEditLectureSession />} />
            <Route
              path="tambah-edit/:id"
              element={<DKMAddEditLectureSession />}
            />

            {/* ✅ Tambahan */}
            <Route
              path="kajian-detail/:id"
              element={<DKMDetailLectureSessions />}
            />
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
              path="kajian-detail/:id/statistik-soal"
              element={<DKMStatsQuizLectureSessions />}
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
            <Route path="tambah-edit" element={<DKMAddEditLecture />} />
            <Route path="tambah-edit/:id" element={<DKMAddEditLecture />} />
            {/* ✅ Tambahan */}
            <Route path="tema-detail/:id" element={<DKMDetailLecture />} />
            <Route
              path="tema-detail/:id/semua-kajian"
              element={<DKMAllLectureLectureSessions />}
            />
            <Route
              path="tema-detail/:id/informasi"
              element={<DKMInformationLecture />}
            />
            <Route path="tema-detail/:id/video" element={<DKMVideoLecture />} />
            <Route
              path="tema-detail/:id/latihan-soal"
              element={<DKMQuizLecture />}
            />
            <Route
              path="tema-detail/:id/materi-lengkap"
              element={<DKMFullTranscriptLecture />}
            />
            <Route
              path="tema-detail/:id/saran-masukan"
              element={<DKMSuggestLecture />}
            />
            <Route
              path="tema-detail/:id/ringkasan"
              element={<DKMSummaryLecture />}
            />
            <Route
              path="tema-detail/:id/dokumentasi"
              element={<DKMDocumentLecture />}
            />
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
  );
}
