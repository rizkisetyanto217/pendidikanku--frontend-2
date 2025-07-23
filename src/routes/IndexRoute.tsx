import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import DkmLayout from "@/layout/DKMLayout";
import DkmSettingLayout from "@/layout/DKMSettingLayout";

// Halaman DKM
import DashboardAdminDkm from "@/pages/dashboard/dkm/home/DKMHome";
import ProfilMasjid from "@/pages/dashboard/dkm/profile/masjid/DKMProfile";
import ProfileDKMPengajar from "@/pages/dashboard/dkm/profile/dkm/DKMProfileDKMTeacher";
import Kajian from "@/pages/dashboard/dkm/lecture/lecture-sessions/main/DKMLectureSessions";
import Sertifikat from "@/pages/dashboard/dkm/certificate/DKMCertificate";
import Keuangan from "@/pages/dashboard/dkm/finance/DKMFinance";
import Postingan from "@/pages/dashboard/dkm/post/DKMPost";

// Halaman Setting DKM
import ProfilSayaDkm from "@/pages/dashboard/dkm/setting/DKMHomeMyProfile";
import Appereance from "@/pages/dashboard/dkm/setting/DKMAppereance";
import SupportUs from "@/pages/dashboard/dkm/setting/DKMSupportUs";
import Partnership from "@/pages/dashboard/dkm/setting/DKMPartnership";
import FaqPage from "@/pages/dashboard/dkm/setting/DKMFaq";

// Halaman Penulis
import AuthorHome from "@/pages/dashboard/author/home/AuthorHome";

// Halaman Auth
import Login from "@/pages/dashboard/auth/Login";
import Register from "@/pages/dashboard/auth/Register";

// Not Found
import NotFound from "@/pages/NotFound";

// Auth Route Guard
import RequireRoleRoute from "./RequireRoleRoute";
import AuthorLayout from "@/layout/AuthorLayout";
import TeacherLayout from "@/layout/TeacherLayout";
import TreasurerLayout from "@/layout/TreasurerLayout";
import AdminLayout from "@/layout/AdminLayout";
import TeacherHome from "@/pages/dashboard/teacher/home/TeacherHome";
import TreasurerHome from "@/pages/dashboard/treasurer/home/TreasurerHome";
import AdminHome from "@/pages/dashboard/admin/home/AdminHome";
import DkmEditSosmedProfile from "@/pages/dashboard/dkm/profile/masjid/DKMEditSosmedMasjid";
import DKMEditMasjid from "@/pages/dashboard/dkm/profile/masjid/DKMEditMasjid";
import DKMEditProfileMasjid from "@/pages/dashboard/dkm/profile/masjid/DKMEditProfileMasjid";
import DKMLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/main/DKMLectureSessions";
import DKMLecture from "@/pages/dashboard/dkm/lecture/lecture/main/DKMLecture";
import DKMLectureParent from "@/pages/dashboard/dkm/lecture/DKMLectureParent";
import DKMDetailLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/detail/DKMDetailLectureSessions";
import DKMInformationLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/information/DKMInformationLectureSessions";
import DKMVideoLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/assets/DKMVideoAudioLectureSessions";
import DKMQuizLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/quiz/DKMQuizLectureSessions";
import DKMFullTranscriptLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/materials/fullTranscipt/DKMFullTranscriptLectureSessions";
import DKMDocumentLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/assets/DKMdocumentLectureSessions";
import DKMSummaryLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/materials/summary/DKMSummaryLectureSessions";
import DKMStatsQuizLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/quiz/DKMStatsQuizLectureSessions";
import DKMDetailLecture from "@/pages/dashboard/dkm/lecture/lecture/detail/DKMDetailLecture";
import DKMInformationLecture from "@/pages/dashboard/dkm/lecture/lecture/information/DKMInformationLecture";
import DKMVideoLecture from "@/pages/dashboard/dkm/lecture/lecture/assets/DKMVideoAudioLecture";
import DKMQuizLecture from "@/pages/dashboard/dkm/lecture/lecture/quiz/DKMQuizLecture";
import DKMFullTranscriptLecture from "@/pages/dashboard/dkm/lecture/lecture/materials/DKMFullTranscriptLecture";
import DKMSummaryLecture from "@/pages/dashboard/dkm/lecture/lecture/materials/DKMSummaryLecture";
import DKMDocumentLecture from "@/pages/dashboard/dkm/lecture/lecture/assets/DKMDocumentLecture";
import DKMAllLectureLectureSessions from "@/pages/dashboard/dkm/lecture/lecture/all-lecture-sessions/DKMAllLectureSession";
import DKMSuggestLecture from "@/pages/dashboard/dkm/lecture/lecture/suggest/DKMSuggestLecture";
import DKMAddLectureSession from "@/pages/dashboard/dkm/lecture/lecture-sessions/main/DKMAddEditLectureSessions";
import DKMAddEditLectureSession from "@/pages/dashboard/dkm/lecture/lecture-sessions/main/DKMAddEditLectureSessions";
import DKMAddEditLecture from "@/pages/dashboard/dkm/lecture/lecture/main/DKMAddEditLecture";
import MasjidLinkTree from "@/pages/user/linktree/MasjidLinkTreeHome";
import MasjidDonationMasjid from "@/pages/user/linktree/finansial/donation/MasjidDonationMasjidFinansial";
import MasjidLayout from "@/pages/user/MasjidLayout";
import MasjidDonationConfirmDonation from "@/pages/user/linktree/finansial/donation/MasjidDonationConfirmFinansial";
import MasjidProfile from "@/pages/user/linktree/profil/MasjidProfil";
import MasjidDKMPengajarProfil from "@/pages/user/linktree/profil/MasjidDKMPengajarProfil";
import MasjidDetailSpeech from "@/pages/user/linktree/profil/MasjidDetailSpeechProfil";
import MasjidProfileDetail from "@/pages/user/linktree/profil/MasjidDetailProfil";
import MasjidScheduleLecture from "@/pages/user/linktree/lecture/schedule/MasjidScheduleLecture";
import MasjidReportFinansial from "@/pages/user/linktree/finansial/report/MasjidReportFinansial";
import MasjidDetailLecture from "@/pages/user/linktree/lecture/MasjidDetailLecture";
import MasjidDonationMotivation from "@/pages/user/linktree/finansial/donation/MasjidDonationMotivation";
import MasjidLectureMaterial from "@/pages/user/linktree/lecture/material/MasjidLectureMaterial";
import MasjidDetailLectureMaterial from "@/pages/user/linktree/lecture/material/lecture-sessions/detail/MasjidDetailLectureMaterial";
import MasjidInformationDetailLectureSessions from "@/pages/user/linktree/lecture/material/lecture-sessions/main/MasjidInformationDetailLectureSessions";
import MasjidQuizDetailLectureSessions from "@/pages/user/linktree/lecture/material/lecture-sessions/quizzes/MasjidQuizDetailLectureSessions";
import MasjidFullTranscriptDetailLectureSessions from "@/pages/user/linktree/lecture/material/lecture-sessions/materials/MasjidFullTranscriptLectureSessions";
import MasjidSummaryDetailLectureSessions from "@/pages/user/linktree/lecture/material/lecture-sessions/materials/MasjidSummaryDetailLectureSessions";
import MasjidDocsDetailLectureSessions from "@/pages/user/linktree/lecture/material/lecture-sessions/assets/MasjidDocsLectureSessions";
import MasjidResultQuizDetailLectureSessions from "@/pages/user/linktree/lecture/material/lecture-sessions/quizzes/MasjidResultQuizDetailLectureSessions";
import DKMAddEditDocumentLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/assets/DKMAddEditDocumentLectureSessions";
import MasjidVideoAudioDetailLectureSessions from "@/pages/user/linktree/lecture/material/lecture-sessions/assets/MasjidVideoAudioDetailLectureSessions";
import DKMAddEditFullTransciptLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/materials/fullTranscipt/DKMAddEditFullTransciptLectureSessions";
import DKMAddEditSummaryLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/materials/summary/DKMAddEditSummaryLectureSessions";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ==== Public Routes ==== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<MasjidLayout />}>
        <Route path="masjid/:slug">
          {/* Halaman utama (Linktree) */}
          <Route index element={<MasjidLinkTree />} />

          {/* Profil Masjid */}
          <Route path="profil">
            <Route index element={<MasjidProfile />} />
            <Route path="dkm-pengajar" element={<MasjidDKMPengajarProfil />} />
            <Route path="sambutan" element={<MasjidDetailSpeech />} />
            <Route path="detail" element={<MasjidProfileDetail />} />
          </Route>

          {/* Donasi */}
          <Route path="donasi" element={<MasjidDonationMasjid />} />
          <Route
            path="donasi/konfirmasi"
            element={<MasjidDonationConfirmDonation />}
          />
          <Route path="donasi/pesan" element={<MasjidDonationMotivation />} />

          {/* Laporan Keuangan */}
          <Route path="keuangan" element={<MasjidReportFinansial />} />

          {/* Jadwal Kajian dan Detail */}
          <Route path="jadwal-kajian" element={<MasjidScheduleLecture />} />
          <Route path="jadwal-kajian/:id" element={<MasjidDetailLecture />} />

          {/* Soal & Materi Kajian */}
          <Route
            path="soal-materi-kajian"
            element={<MasjidLectureMaterial />}
          />

          {/* Detail & Sub Halaman */}
          <Route
            path="soal-materi-kajian/:id"
            element={<MasjidDetailLectureMaterial />}
          />
          <Route
            path="soal-materi-kajian/:id/informasi"
            element={<MasjidInformationDetailLectureSessions />}
          />
          <Route
            path="soal-materi-kajian/:id/latihan-soal"
            element={<MasjidQuizDetailLectureSessions />}
          />
          <Route
            path="soal-materi-kajian/:id/latihan-soal/hasil"
            element={<MasjidResultQuizDetailLectureSessions />}
          />
          <Route
            path="soal-materi-kajian/:id/video-audio"
            element={<MasjidVideoAudioDetailLectureSessions />}
          />

          <Route
            path="soal-materi-kajian/:id/materi-lengkap"
            element={<MasjidFullTranscriptDetailLectureSessions />}
          />
          <Route
            path="soal-materi-kajian/:id/ringkasan"
            element={<MasjidSummaryDetailLectureSessions />}
          />
          <Route
            path="soal-materi-kajian/:id/dokumen"
            element={<MasjidDocsDetailLectureSessions />}
          />
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

            {/* Detail & Subhalaman */}
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
            
            {/* Materi Lengkap */}
            <Route
              path="kajian-detail/:id/materi-lengkap"
              element={<DKMFullTranscriptLectureSessions />}
            />
            <Route
              path="kajian-detail/:id/materi-lengkap/tambah-edit"
              element={<DKMAddEditFullTransciptLectureSessions />}
            />
            <Route
              path="kajian-detail/:id/materi-lengkap/tambah-edit/:materialId"
              element={<DKMAddEditFullTransciptLectureSessions />}
            />

            {/* Ringkasan */}
            <Route
              path="kajian-detail/:id/ringkasan"
              element={<DKMSummaryLectureSessions />}
            />
            <Route
              path="kajian-detail/:id/ringkasan/tambah-edit"
              element={<DKMAddEditSummaryLectureSessions />}
            />
            <Route
              path="kajian-detail/:id/ringkasan/tambah-edit/:materialId"
              element={<DKMAddEditSummaryLectureSessions />}
            />

            {/* Dokumen */}
            <Route
              path="kajian-detail/:id/dokumen"
              element={<DKMDocumentLectureSessions />}
            />
            <Route
              path="kajian-detail/:id/dokumen/tambah-edit"
              element={<DKMAddEditDocumentLectureSessions />}
            />
            <Route
              path="kajian-detail/:id/dokumen/tambah-edit/:docId"
              element={<DKMAddEditDocumentLectureSessions />}
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
              path="tema-detail/:id/dokumen"
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
