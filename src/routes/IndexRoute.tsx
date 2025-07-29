import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import DkmLayout from "@/layout/DKMLayout";
import DKMSettingParent from "@/layout/DKMSettingLayout";

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
import DKMAppereance from "@/pages/dashboard/dkm/setting/DKMAppereance";
import SupportUs from "@/pages/dashboard/dkm/setting/DKMSupportUs";
import Partnership from "@/pages/dashboard/dkm/setting/DKMPartnership";
import DKMFaq from "@/pages/dashboard/dkm/setting/DKMFaq";

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
import DKMVideoAudioLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/assets/DKMVideoAudioLectureSessions";
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
import MasjidLinkTree from "@/pages/linktree/MasjidLinkTreeHome";
import MasjidDonationMasjid from "@/pages/linktree/finansial/donation/MasjidDonationMasjidFinansial";
import MasjidLayout from "@/pages/linktree/MasjidLayout";
import MasjidDonationConfirmDonation from "@/pages/linktree/finansial/donation/MasjidDonationConfirmFinansial";
import MasjidProfile from "@/pages/linktree/profil/MasjidProfil";
import MasjidDKMPengajarProfil from "@/pages/linktree/profil/MasjidDKMPengajarProfil";
import MasjidDetailSpeech from "@/pages/linktree/profil/MasjidDetailSpeechProfil";
import MasjidProfileDetail from "@/pages/linktree/profil/MasjidDetailProfil";
import MasjidScheduleLecture from "@/pages/linktree/lecture/schedule/MasjidScheduleLectureSessions";
import MasjidReportFinansial from "@/pages/linktree/finansial/report/MasjidReportFinansial";
import MasjidDetailLecture from "@/pages/linktree/lecture/schedule/MasjidDetailScheduleLectureSessions";
import MasjidDonationMotivation from "@/pages/linktree/finansial/donation/MasjidDonationMotivation";
import MasjidLectureMaterial from "@/pages/linktree/lecture/material/lecture/main/MasjidLecture";
import MasjidDetailLectureMaterial from "@/pages/linktree/lecture/schedule/MasjidDetailScheduleLectureSessions";
import MasjidInformationLectureSessions from "@/pages/linktree/lecture/material/lecture-sessions/main/MasjidInformationLectureSessions";
import MasjidQuizLectureSessions from "@/pages/linktree/lecture/material/lecture-sessions/quizzes/MasjidQuizLectureSessions";
import MasjidFullTranscriptLectureSessions from "@/pages/linktree/lecture/material/lecture-sessions/materials/MasjidFullTranscriptLectureSessions";
import MasjidSummaryLectureSessions from "@/pages/linktree/lecture/material/lecture-sessions/materials/MasjidSummaryLectureSessions";
import MasjidDocsLectureSessions from "@/pages/linktree/lecture/material/lecture-sessions/assets/MasjidDocsLectureSessions";
import MasjidResultQuizLectureSessions from "@/pages/linktree/lecture/material/lecture-sessions/quizzes/MasjidResultQuizLectureSessions";
import DKMAddEditDocumentLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/assets/DKMAddEditDocumentLectureSessions";
import MasjidVideoAudioLectureSessions from "@/pages/linktree/lecture/material/lecture-sessions/assets/MasjidVideoAudioLectureSessions";
import DKMAddEditFullTransciptLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/materials/fullTranscipt/DKMAddEditFullTransciptLectureSessions";
import DKMAddEditSummaryLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/materials/summary/DKMAddEditSummaryLectureSessions";
import DKMProfilMasjidParent from "@/pages/dashboard/dkm/profile/DKMProfileParent";
import MasjidMaterial from "@/pages/linktree/lecture/material/MasjidMaterial";
import MasjidCertificateLecture from "@/pages/linktree/lecture/certificate/MasjidCertificate";
import MasjidDocsLecture from "@/pages/linktree/lecture/material/lecture/assets/MasjidDocsLecture";
import MasjidVideoAudioLecture from "@/pages/linktree/lecture/material/lecture/assets/MasjidVideoAudioLecture";
import MasjidQuizLecture from "@/pages/linktree/lecture/material/lecture/quizzes/MasjidQuizLecture";
import MasjidFullTransciptLecture from "@/pages/linktree/lecture/material/lecture/materials/MasjidFullTransciptLecture";
import MasjidSummaryLecture from "@/pages/linktree/lecture/material/lecture/materials/MasjidSummaryLecture";
import MasjidLectureSessions from "@/pages/linktree/lecture/material/lecture-sessions/main/MasjidLectureSessions";
import MasjidExamLecture from "@/pages/linktree/lecture/material/lecture/exams/MasjidExamLecture";
import MasjidResultExamLecture from "@/pages/linktree/lecture/material/lecture/exams/MasjidResultExamLecture";
import MasjidMyProfile from "@/pages/linktree/activity/my-activity/MasjidMyActivity";
import MasjidMyActivity from "@/pages/linktree/activity/my-activity/MasjidMyActivity";
import MasjidPost from "@/pages/linktree/post/main/MasjidPost";
import MasjidDetailPost from "@/pages/linktree/post/main/MasjidDetailPost";
import MasjidDetailDonation from "@/pages/linktree/post/main/MasjidDetailMotivation";
import MasjidSettingLayout from "@/layout/MasjidSettingLayout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ==== Public Routes ==== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      // 1. Tanpa layout untuk LinkTree
      <Route path="masjid/:slug" index element={<MasjidLinkTree />} />
      // 2. Dengan layout untuk halaman lainnya
      <Route path="/" element={<MasjidLayout />}>
        <Route path="masjid/:slug">
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
          <Route path="soal-materi" element={<MasjidMaterial />} />
          <Route path="soal-materi/:id" element={<MasjidLectureSessions />} />
          <Route
            path="soal-materi/:id/informasi"
            element={<MasjidInformationLectureSessions />}
          />
          <Route
            path="soal-materi/:id/latihan-soal"
            element={<MasjidQuizLectureSessions />}
          />
          <Route
            path="soal-materi/:id/latihan-soal/hasil"
            element={<MasjidResultQuizLectureSessions />}
          />
          <Route
            path="soal-materi/:id/video-audio"
            element={<MasjidVideoAudioLectureSessions />}
          />
          <Route
            path="soal-materi/:id/materi-lengkap"
            element={<MasjidFullTranscriptLectureSessions />}
          />
          <Route
            path="soal-materi/:id/ringkasan"
            element={<MasjidSummaryLectureSessions />}
          />
          <Route
            path="soal-materi/:id/dokumen"
            element={<MasjidDocsLectureSessions />}
          />

          {/* Tema */}
          <Route path="tema/:id" element={<MasjidLectureMaterial />} />
          <Route
            path="tema/:id/certificate/:user_exam_id"
            element={<MasjidCertificateLecture />}
          />
          <Route path="tema/:id/dokumen" element={<MasjidDocsLecture />} />
          <Route
            path="tema/:id/video-audio"
            element={<MasjidVideoAudioLecture />}
          />
          <Route path="tema/:id/ujian" element={<MasjidExamLecture />} />
          <Route
            path="tema/:id/ujian/hasil"
            element={<MasjidResultExamLecture />}
          />
          <Route path="tema/:id/soal" element={<MasjidQuizLecture />} />
          <Route
            path="tema/:id/materi-lengkap"
            element={<MasjidFullTransciptLecture />}
          />
          <Route path="tema/:id/ringkasan" element={<MasjidSummaryLecture />} />

          <Route path="post" element={<MasjidPost />} />
          <Route path="post/:postId" element={<MasjidDetailPost />} />
          <Route path="motivation/:id" element={<MasjidDetailDonation />} />

          {/* Activity  */}
          <Route path="aktivitas" element={<MasjidMyActivity />} />

          {/* Nested setting layout */}
          <Route element={<MasjidSettingLayout />}>
            <Route path="profil-saya" element={<ProfilSayaDkm />} />
            <Route path="tampilan" element={<DKMAppereance />} />
            <Route path="dukung-kami" element={<SupportUs />} />
            <Route path="kerjasama" element={<Partnership />} />
            <Route path="tanya-jawab" element={<DKMFaq />} />
          </Route>
        </Route>
      </Route>
      {/* ==== Protected Routes - DKM ==== */}
      <Route element={<RequireRoleRoute allowedRoles={["dkm"]} />}>
        <Route path="/dkm" element={<DkmLayout />}>
          <Route index element={<DashboardAdminDkm />} />

          {/* Profil Masjid */}
          <Route path="profil-masjid" element={<DKMProfilMasjidParent />}>
            <Route index element={<ProfilMasjid />} />
            <Route path="edit-sosmed" element={<DkmEditSosmedProfile />} />
            <Route path="edit-masjid" element={<DKMEditMasjid />} />
            <Route
              path="edit-profil-masjid"
              element={<DKMEditProfileMasjid />}
            />
          </Route>
          <Route path="profil-dkm" element={<DKMProfilMasjidParent />}>
            <Route index element={<ProfileDKMPengajar />} />
          </Route>

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
              path="kajian-detail/:id/video-audio"
              element={<DKMVideoAudioLectureSessions />}
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
          <Route element={<DKMSettingParent />}>
            <Route path="profil-saya" element={<ProfilSayaDkm />} />
            <Route path="tampilan" element={<DKMAppereance />} />
            <Route path="dukung-kami" element={<SupportUs />} />
            <Route path="kerjasama" element={<Partnership />} />
            <Route path="tanya-jawab" element={<DKMFaq />} />
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
