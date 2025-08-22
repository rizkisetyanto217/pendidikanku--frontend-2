import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import DkmLayout from "@/layout/DKMLayout";
import DKMSettingParent from "@/layout/DKMSettingLayout";

// Halaman DKM
import DashboardAdminDkm from "@/pages/dashboard/dkm/home/DKMHome";
import ProfilMasjid from "@/pages/dashboard/dkm/profile/masjid/DKMProfile";
import ProfileDKMPengajar from "@/pages/dashboard/dkm/profile/dkm/DKMProfileDKMTeacher";
import Kajian from "@/pages/dashboard/dkm/lecture/lecture-sessions/DKMLectureSessions";
import Sertifikat from "@/pages/dashboard/dkm/certificate/DKMCertificate";
import Keuangan from "@/pages/dashboard/dkm/finance/DKMFinance";
import Postingan from "@/pages/dashboard/dkm/post/DKMPostParent";

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
import DKMLectureSessions from "@/pages/dashboard/dkm/lecture/lecture-sessions/DKMLectureSessions";
import DKMLecture from "@/pages/dashboard/dkm/lecture/lecture/DKMLecture";
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
import DKMAddLectureSession from "@/pages/dashboard/dkm/lecture/lecture-sessions/detail/add-edit/DKMAddEditLectureSessions";
import DKMAddEditLectureSession from "@/pages/dashboard/dkm/lecture/lecture-sessions/detail/add-edit/DKMAddEditLectureSessions";
import DKMAddEditLecture from "@/pages/dashboard/dkm/lecture/lecture/detail/DKMAddEditLecture";
import MasjidLinkTree from "@/pages/linktree/MasjidLinkTreeHome";
import MasjidDonationMasjid from "@/pages/linktree/finansial/donation/MasjidDonation";
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
import MasjidMyProfile from "@/pages/linktree/activity/setting/MasjidMyProfile";
import MasjidMyActivity from "@/pages/linktree/activity/my-activity/MasjidMyActivity";
import MasjidPost from "@/pages/linktree/post/main/MasjidPost";
import MasjidDetailPost from "@/pages/linktree/post/main/MasjidDetailPost";
import MasjidDetailDonation from "@/pages/linktree/post/main/MasjidDetailMotivation";
import MasjidSettingLayout from "@/layout/masjid/MasjidSettingLayout";
import MasjidAppereance from "@/pages/linktree/activity/setting/MasjidAppereance";
import MasjidSupportUs from "@/pages/linktree/activity/setting/MasjidSupportUs";
import MasjidPartnership from "@/pages/linktree/activity/setting/MasjidPartnership";
import MasjidFaq from "@/pages/linktree/activity/setting/MasjidFaq";
import MasjidSettingMenu from "@/layout/masjid/MasjidSettingMenu";
import MasjidMyDonation from "@/pages/linktree/finansial/report/MasjidMyDonation";

import MasjidMyStats from "@/pages/linktree/activity/my-activity/MasjidMyStats";
import DKMThemaPost from "@/pages/dashboard/dkm/post/themaPost/DKMThemaPost";
import DKMPost from "@/pages/dashboard/dkm/post/post/DKMPost";
import DKMPostParent from "@/pages/dashboard/dkm/post/DKMPostParent";
import DKMAddEditThemaPost from "@/pages/dashboard/dkm/post/themaPost/DKMAddEditThemaPost";
import DKMAddEditPost from "@/pages/dashboard/dkm/post/post/DKMAddEditPost";
import DKMDetailPost from "@/pages/dashboard/dkm/post/post/DKMDetailPost";
import DKMDetailThemaPost from "@/pages/dashboard/dkm/post/themaPost/DKMDetailThemaPost";
import MasjidInformationLecture from "@/pages/linktree/lecture/material/lecture/main/MasjidInformationLecture";
import MasjidSholat from "@/pages/linktree/home/sholat/MasjidSholat";
import MasjidAllMyLecture from "@/pages/linktree/activity/my-activity/MasjidAllMyLecture";
import MasjidMyNotesLectureSessions from "@/pages/linktree/lecture/material/lecture-sessions/arsip/MasjidMyNotesLectureSessions";
import DKMEditProfileDKMTeacher from "@/pages/dashboard/dkm/profile/dkm/DKMEditProfileDKMTeacher";
import MasjidkuHome from "@/pages/masjidku/MasjidkuHome";
import MasjidMaterialByMonth from "@/pages/linktree/lecture/material/lecture-sessions-by-month/MasjidLectureSessionsByMonth";
import MasjidDetailSummaryLecture from "@/pages/linktree/lecture/material/lecture/materials/MasjidDetailSummaryLecture";
import MasjidDetailDKMPengajarMobile from "@/pages/linktree/profil/MasjidDetailDKMPengajarProfilMobile";
import MasjidkuLayout from "@/layout/MasjidkuLayout";
import MasjidkuFinancial from "@/pages/masjidku/financial/MasjidkuFinacial";
import MasjidkuListMasjid from "@/pages/masjidku/masjid/MasjidkuListMasjid";
import MasjidkuProfil from "@/pages/masjidku/profil/MasjidkuProfil";
import MasjidkuProgram from "@/pages/masjidku/program/MasjidkuProgram";
import ParentHome from "@/pages/sekolahislamku/dashboard-student/StudentDashboard";
import StudentProgressDetail from "@/pages/sekolahislamku/dashboard-student/progress/StudentProgress";
import StudentDashboard from "@/pages/sekolahislamku/dashboard-student/StudentDashboard";
import StudentFInance from "@/pages/sekolahislamku/dashboard-student/finance/StudentFinance";
import StudentSchedule from "@/pages/sekolahislamku/dashboard-student/schedule/StudentSchedule";
import StudentAnnouncement from "@/pages/sekolahislamku/dashboard-student/announcement/StudentAnnouncement";
import StudentRaport from "@/pages/sekolahislamku/dashboard-student/progress/raport/StudentRaport";
import StudentNotesSummary from "@/pages/sekolahislamku/dashboard-student/progress/notes-summary/StudentNotesSummary";
import StudentAbsence from "@/pages/sekolahislamku/dashboard-student/progress/absence/StudentAbsence";
import StudentLayout from "@/layout/StudentLayout";
import TeacherDashboard from "@/pages/sekolahislamku/dashboard-teacher/TeacherDashboard";
import SchoolDashboard from "@/pages/sekolahislamku/dashboard-school/SchoolDashboard";
import TeacherClass from "@/pages/sekolahislamku/dashboard-teacher/class/TeacherClass";
import TeacherAttendance from "@/pages/sekolahislamku/dashboard-teacher/attendance/TeacherAttendance";
import TeacherGrading from "@/pages/sekolahislamku/dashboard-teacher/grade/TeacherGrade";
import TeacherAnnouncements from "@/pages/sekolahislamku/dashboard-teacher/announcement/TeacherAnnouncement";
import SchoolStudent from "@/pages/sekolahislamku/dashboard-school/student-(pending)/SchoolStudent";
import SchoolTeacher from "@/pages/sekolahislamku/dashboard-school/teacher/SchoolTeacher";
import SchoolClasses from "@/pages/sekolahislamku/dashboard-school/class/SchoolClass";
import SchoolAttendance from "@/pages/sekolahislamku/dashboard-school/attendance/SchoolAttendance";
import SchoolFinance from "@/pages/sekolahislamku/dashboard-school/finance/SchoolFinance";
import SchoolAnnouncement from "@/pages/sekolahislamku/dashboard-school/announcement/SchoolAnnouncement";
import StudentDetailAnnouncement from "@/pages/sekolahislamku/dashboard-student/announcement/StudentDetailAnnouncement";
import TeacherSchedule from "@/pages/sekolahislamku/dashboard-teacher/schedule/TeacherSchedule";
import TeacherClassAttendance from "@/pages/sekolahislamku/dashboard-teacher/class/TeacherClassAttendance";

// School Routes
import AllSchedule from "@/pages/sekolahislamku/dashboard-school/components/dashboard/AllSchedule";
import AllAnnouncement from "@/pages/sekolahislamku/dashboard-school/components/dashboard/AllAnnouncement";
import AllInvoices from "@/pages/sekolahislamku/dashboard-school/components/dashboard/AllInvoices";
import TryoutTahfizhExam from "@/pages/sekolahislamku/dashboard-school/components/dashboard/TryoutTahfizhExam";

import { financeRoutes } from "@/pages/masjidku/financial/routes";
import SchoolManageClass from "@/pages/sekolahislamku/dashboard-school/class/detail/SchoolDetailClass";
import SchoolBooks from "@/pages/sekolahislamku/dashboard-school/books/SchoolBooks";
import SchoolDetailBook from "@/pages/sekolahislamku/dashboard-school/books/detail/SchoolDetailBook";
import AllAnnouncementTeacher from "@/pages/sekolahislamku/dashboard-teacher/components/dashboard/AllAnnouncementTeacher";
import AllTodaySchedule from "@/pages/sekolahislamku/dashboard-teacher/class/components/AllTodaySchedhule";
import ScheduleThreeDays from "@/pages/sekolahislamku/dashboard-teacher/class/components/ScheduleThreeDays";
import AllAssignment from "@/pages/sekolahislamku/dashboard-teacher/class/components/AllAssignment";

// import { schoolRoutes } from "@/pages/sekolahislamku/dashboard-school/routes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* === Public Routes Masjidku === */}
      <Route element={<MasjidkuLayout />}>
        <Route index element={<MasjidkuHome />} />
        <Route path="finansial" element={<MasjidkuFinancial />} />
        <Route path="masjid" element={<MasjidkuListMasjid />} />
        <Route path="profil" element={<MasjidkuProfil />} />
        <Route path="program" element={<MasjidkuProgram />} />
        {financeRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path.replace("/masjidku/", "")} // Hapus prefix karena sudah di dalam MasjidkuLayout
            element={route.element}
          />
        ))}
      </Route>
      {/* ==== Public Routes ==== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      // 1. Tanpa layout untuk LinkTree
      <Route path="masjid/:slug" index element={<MasjidLinkTree />} />
      // 2. Dengan layout untuk halaman lainnya
      <Route path="/" element={<MasjidLayout />}>
        <Route path="masjid/:slug">
          {/* ==== Public Routes ==== */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          {/* Profil Masjid */}
          <Route path="profil">
            <Route index element={<MasjidProfile />} />
            <Route path="dkm-pengajar" element={<MasjidDKMPengajarProfil />} />
            <Route path="sambutan" element={<MasjidDetailSpeech />} />
            {/* Group DKM & Pengajar */}
            <Route path="dkm-pengajar">
              <Route index element={<MasjidDKMPengajarProfil />} />
              <Route
                path="detail/:id"
                element={<MasjidDetailDKMPengajarMobile />}
              />
            </Route>
            <Route path="detail" element={<MasjidProfileDetail />} />
          </Route>
          {/* Home  */}
          <Route path="sholat" element={<MasjidSholat />} />
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
          <Route
            path="soal-materi/:lecture_session_slug"
            element={<MasjidLectureSessions />}
          />
          <Route
            path="soal-materi/:lecture_session_slug/informasi"
            element={<MasjidInformationLectureSessions />}
          />
          <Route
            path="soal-materi/:lecture_session_slug/latihan-soal"
            element={<MasjidQuizLectureSessions />}
          />
          <Route
            path="soal-materi/:lecture_session_slug/latihan-soal/hasil"
            element={<MasjidResultQuizLectureSessions />}
          />
          <Route
            path="soal-materi/:lecture_session_slug/video-audio"
            element={<MasjidVideoAudioLectureSessions />}
          />
          <Route
            path="soal-materi/:lecture_session_slug/materi-lengkap"
            element={<MasjidFullTranscriptLectureSessions />}
          />
          <Route
            path="soal-materi/:lecture_session_slug/ringkasan"
            element={<MasjidSummaryLectureSessions />}
          />
          <Route
            path="soal-materi/:lecture_session_slug/catatanku"
            element={<MasjidMyNotesLectureSessions />}
          />
          <Route
            path="soal-materi/:lecture_session_slug/dokumen"
            element={<MasjidDocsLectureSessions />}
          />
          {/* Materi per Bulan */}
          <Route
            path="materi-bulan/:month"
            element={<MasjidMaterialByMonth />}
          />
          {/* Tema */}
          <Route
            path="tema/:lecture_slug"
            element={<MasjidLectureMaterial />}
          />
          <Route
            path="tema/:lecture_slug/informasi"
            element={<MasjidInformationLecture />}
          />
          <Route
            path="tema/:lecture_slug/certificate/:user_exam_id"
            element={<MasjidCertificateLecture />}
          />
          <Route
            path="tema/:lecture_slug/dokumen"
            element={<MasjidDocsLecture />}
          />
          <Route
            path="tema/:lecture_slug/video-audio"
            element={<MasjidVideoAudioLecture />}
          />
          <Route
            path="tema/:lecture_slug/ujian"
            element={<MasjidExamLecture />}
          />
          <Route
            path="tema/:lecture_slug/ujian/hasil"
            element={<MasjidResultExamLecture />}
          />
          <Route
            path="tema/:lecture_slug/latihan-soal"
            element={<MasjidQuizLecture />}
          />
          <Route
            path="tema/:lecture_slug/materi-lengkap"
            element={<MasjidFullTransciptLecture />}
          />
          <Route
            path="tema/:lecture_slug/ringkasan"
            element={<MasjidSummaryLecture />}
          />
          <Route
            path="tema/:lecture_slug/ringkasan/detail"
            element={<MasjidDetailSummaryLecture />}
          />{" "}
          {/* detail */}
          <Route path="post" element={<MasjidPost />} />
          <Route path="post/:postId" element={<MasjidDetailPost />} />
          <Route path="motivation/:id" element={<MasjidDetailDonation />} />
          {/* Activity  */}
          <Route path="aktivitas" element={<MasjidMyActivity />} />
          {/* Menu Activity  */}
          <Route
            path="aktivitas/kajian-saya"
            element={<MasjidAllMyLecture />}
          />
          <Route path="aktivitas/donasi-saya" element={<MasjidMyDonation />} />
          <Route path="aktivitas/statistik-saya" element={<MasjidMyStats />} />
          {/* Nested setting layout */}
          <Route path="aktivitas/pengaturan" element={<MasjidSettingLayout />}>
            <Route path="menu" element={<MasjidSettingMenu />} />
            <Route path="profil-saya" element={<MasjidMyProfile />} />
            <Route path="tampilan" element={<MasjidAppereance />} />
            <Route path="dukung-kami" element={<MasjidSupportUs />} />
            <Route path="kerjasama" element={<MasjidPartnership />} />
            <Route path="tanya-jawab" element={<MasjidFaq />} />
          </Route>
        </Route>
      </Route>
      {/*  */}
      {/*  */}
      {/* ==== Protected Routes - DKM ==== */}
      <Route element={<RequireRoleRoute allowedRoles={["dkm"]} />}>
        <Route path="/dkm" element={<DkmLayout />}>
          {/* <Route index element={<DashboardAdminDkm />} /> */}
          <Route index element={<Navigate to="profil-masjid" replace />} />

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
            {/* 🆕 Edit Pengajar */}
          </Route>
          <Route
            path="pengajar/edit/:id"
            element={<DKMEditProfileDKMTeacher />}
          />

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
          <Route path="post" element={<DKMPostParent />}>
            <Route index element={<DKMPost />} />
            <Route path="tambah-edit" element={<DKMAddEditPost />} />
            <Route path="tambah-edit/:id" element={<DKMAddEditPost />} />
            <Route path="detail/:id" element={<DKMDetailPost />} />
          </Route>
          <Route path="post-tema" element={<DKMPostParent />}>
            <Route index element={<DKMThemaPost />} />
            <Route path="tambah-edit" element={<DKMAddEditThemaPost />} />
            <Route path="tambah-edit/:id" element={<DKMAddEditThemaPost />} />
            <Route path="detail/:id" element={<DKMDetailThemaPost />} />
          </Route>

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
      {/*  */}
      {/*  */}
      {/* ==== Protected Routes - Author ==== */}
      <Route element={<RequireRoleRoute allowedRoles={["author"]} />}>
        <Route path="/author" element={<AuthorLayout />}>
          <Route index element={<AuthorHome />} />
        </Route>
      </Route>
      {/* ==== Protected Routes - Teacher ==== */}
      {/* <Route element={<RequireRoleRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherHome />} />
        </Route>
      </Route> */}
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
      <Route path=":slug/murid" element={<StudentLayout />}>
        <Route index element={<StudentDashboard />} />

        <Route path="progress" element={<StudentProgressDetail />} />
        <Route path="progress/raport" element={<StudentRaport />} />

        <Route path="finance" element={<StudentFInance />} />
        <Route path="jadwal" element={<StudentSchedule />} />

        <Route path="pengumuman">
          <Route index element={<StudentAnnouncement />} />
          <Route path="detail/:id" element={<StudentDetailAnnouncement />} />
        </Route>

        <Route path="absensi" element={<StudentAbsence />} />
        <Route path="catatan" element={<StudentNotesSummary />} />
      </Route>
      <Route path=":slug/guru" element={<StudentLayout />}>
        <Route index element={<TeacherDashboard />} />
        <Route path="kehadiran" element={<TeacherAttendance />} />
        <Route path="penilaian" element={<TeacherGrading />} />
        <Route path="pengumuman" element={<TeacherAnnouncements />} />
        <Route path="all-today-schedule" element={<AllTodaySchedule />} />
        <Route path="jadwal" element={<TeacherSchedule />} />
        <Route path="schedule-3-hari" element={<ScheduleThreeDays />} />
        <Route path="assignments" element={<AllAssignment />} />
        <Route
          path="all-announcement-teacher"
          element={<AllAnnouncementTeacher />}
        />
        <Route path="kelas">
          <Route index element={<TeacherClass />} />
          <Route path="jadwal" element={<TeacherSchedule />} />
          <Route path="all-today-schedule" element={<AllTodaySchedule />} />
          <Route path="kehadiran" element={<TeacherClassAttendance />} />
          <Route path="schedule-3-hari" element={<ScheduleThreeDays />} />
        </Route>
      </Route>
      <Route path=":slug/sekolah" element={<StudentLayout />}>
        <Route index element={<SchoolDashboard />} />
        <Route path="murid" element={<SchoolStudent />} />
        <Route path="all-schedule" element={<AllSchedule />} />
        <Route path="all-invoices" element={<AllInvoices />} />
        <Route path="tryout-tahfizh-exam" element={<TryoutTahfizhExam />} />
        <Route path="all-announcement" element={<AllAnnouncement />} />
        <Route path="guru" element={<SchoolTeacher />} />
        <Route path="kelas">
          <Route index element={<SchoolClasses />} />
          <Route path="detail/:id" element={<SchoolManageClass />} />
        </Route>
        <Route path="kehadiran" element={<SchoolAttendance />} />
        <Route path="keuangan" element={<SchoolFinance />} />
        <Route path="pengumuman" element={<SchoolAnnouncement />} />
        <Route path="buku">
          <Route index element={<SchoolBooks />} />
          <Route path="detail/:id" element={<SchoolDetailBook />} />
        </Route>
      </Route>
      {/* ==== 404 ==== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
