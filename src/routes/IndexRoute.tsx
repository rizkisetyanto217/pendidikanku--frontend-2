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
// import Register from "@/pages/dashboard/auth/Register";

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
import SchoolAttendance from "@/pages/sekolahislamku/dashboard-school/attendance-(pending)/SchoolAttendance";
import SchoolFinance from "@/pages/sekolahislamku/dashboard-school/finance/SchoolFinance";
import SchoolAnnouncement from "@/pages/sekolahislamku/dashboard-school/announcement/SchoolAnnouncement";
import StudentDetailAnnouncement from "@/pages/sekolahislamku/dashboard-student/announcement/StudentDetailAnnouncement";
import TeacherSchedule from "@/pages/sekolahislamku/dashboard-teacher/schedule/TeacherSchedule";
import TeacherClassAttendance from "@/pages/sekolahislamku/dashboard-teacher/class/TeacherClassAttendance";

// School Routes
import AllSchedule from "@/pages/sekolahislamku/dashboard-school/dashboard/AllSchedule";
import AllAnnouncement from "@/pages/sekolahislamku/dashboard-school/dashboard/AllAnnouncement";
import AllInvoices from "@/pages/sekolahislamku/dashboard-school/dashboard/AllInvoices";
import TryoutTahfizhExam from "@/pages/sekolahislamku/dashboard-school/dashboard/TryoutTahfizhExam";

import { financeRoutes } from "@/pages/masjidku/financial/routes";
import SchoolManageClass from "@/pages/sekolahislamku/dashboard-school/class/detail/SchoolDetailClass";
import SchoolBooks from "@/pages/sekolahislamku/dashboard-school/books/SchoolBooks";
import SchoolDetailBook from "@/pages/sekolahislamku/dashboard-school/books/detail/SchoolDetailBook";
import AllAnnouncementTeacher from "@/pages/sekolahislamku/dashboard-teacher/dashboard/AllAnnouncementTeacher";
import AllTodaySchedule from "@/pages/sekolahislamku/dashboard-teacher/class/components/AllTodaySchedhule";
import ScheduleThreeDays from "@/pages/sekolahislamku/dashboard-teacher/class/components/ScheduleThreeDays";
import AllAssignment from "@/pages/sekolahislamku/dashboard-teacher/class/components/AllAssignment";
import DetailMateri from "@/pages/sekolahislamku/dashboard-teacher/class/components/DetailMateri";
import DetailAssignment from "@/pages/sekolahislamku/dashboard-teacher/class/components/DetailAssignment";
import Register from "@/pages/dashboard/auth/register/RegisterAdminMasjid";
import MasjidkuWebHome from "@/pages/masjidku/website/MasjidkuWebHome";
import RegisterAdminMasjid from "@/pages/dashboard/auth/register/RegisterAdminMasjid";
import RegisterUser from "@/pages/dashboard/auth/register/RegisterUser";
import RegisterDetailAdminMasjid from "@/pages/dashboard/auth/register/RegisterDetailAdminMasjid";
import DetailScheduleThreeDays from "@/pages/sekolahislamku/dashboard-teacher/class/components/DetailScheduleThreeDays";
import ScheduleSevenDays from "@/pages/sekolahislamku/dashboard-teacher/class/components/ScheduleSevenDays";
import DetailScheduleSevenDays from "@/pages/sekolahislamku/dashboard-teacher/class/components/DetailScheduleSevenDays";
import RegisterDetailUser from "@/pages/dashboard/auth/register/RegisterDetailUser";
import DetailSchedule from "@/pages/sekolahislamku/dashboard-school/dashboard/DetailSchedule";
import DetailAnnouncementTeacher from "@/pages/sekolahislamku/dashboard-teacher/dashboard/DetailAnnouncementTeacher";
import ManagementClass from "@/pages/sekolahislamku/dashboard-teacher/dashboard/ManagementClass";
import HomeroomTeacher from "@/pages/sekolahislamku/dashboard-teacher/class/components/HomeroomTeacher";
import TaskScore from "@/pages/sekolahislamku/dashboard-teacher/class/components/TaskScore";
import AttendanceManagement from "@/pages/sekolahislamku/dashboard-teacher/class/components/AttendanceManagement";
import DetailStudent from "@/pages/sekolahislamku/dashboard-teacher/class/components/DetailStudent";
import StudentScore from "@/pages/sekolahislamku/dashboard-teacher/class/components/StudentScore";
import AttendanceDetail from "@/pages/sekolahislamku/dashboard-teacher/attendance/components/AttendanceDetail";
import DetailGrading from "@/pages/sekolahislamku/dashboard-teacher/grade/components/DetailGrading";
import StudentDetail from "@/pages/sekolahislamku/dashboard-student/dashboard/StudentDetail";
import ListFinance from "@/pages/sekolahislamku/dashboard-student/dashboard/ListFinnance";
import InvoiceTagihan from "@/pages/sekolahislamku/dashboard-student/dashboard/InvoiceTagihan";
import AnnouncementsStudent from "@/pages/sekolahislamku/dashboard-student/dashboard/AnnouncementsStudent";
import AllScheduleStudent from "@/pages/sekolahislamku/dashboard-student/dashboard/AllScheduleStudent";
import DetailScheduleStudent from "@/pages/sekolahislamku/dashboard-student/dashboard/DetailScheduleStudent";
import Test from "@/pages/Test";
import DetailClass from "@/pages/sekolahislamku/dashboard-teacher/class/components/DetailClass";
import ClassAttandence from "@/pages/sekolahislamku/dashboard-teacher/class/components/ClassAttandence";
import ClassMateri from "@/pages/sekolahislamku/dashboard-teacher/class/components/ClassMateri";
import AssignmentClass from "@/pages/sekolahislamku/dashboard-teacher/class/components/AssignmentClass";
import DetailAssignmentClass from "@/pages/sekolahislamku/dashboard-teacher/class/components/DetailAssignmentClass";
import Bill from "@/pages/sekolahislamku/dashboard-school/finance/Bill";
import DetailAnnouncementStudent from "@/pages/sekolahislamku/dashboard-student/dashboard/DetailAnnouncementStudent";
import SchoolProfile from "@/pages/sekolahislamku/dashboard-school/profile/SchoolProfile";
import AcademicSchool from "@/pages/sekolahislamku/dashboard-school/academic/AcademicSchool";
import DetailAcademic from "@/pages/sekolahislamku/dashboard-school/academic/components/DetailAcademic";
import ManagementAcademic from "@/pages/sekolahislamku/dashboard-school/academic/components/ManagementAcademic";
import SchoolMenuGrids from "@/pages/sekolahislamku/dashboard-school/menu-utama/SchoolMenuGrids";
import TeacherMenuGrids from "@/pages/sekolahislamku/dashboard-teacher/menu-utama/TeacherMenuGrids";
import StudentMenuGrids from "@/pages/sekolahislamku/dashboard-student/menu-utama/StudentMenuGrids";
import RoomSchool from "@/pages/sekolahislamku/dashboard-school/menu-utama/components/RoomSchool";
import SchoolSpp from "@/pages/sekolahislamku/dashboard-school/spp/SchoolSpp";
import SchoolSubject from "@/pages/sekolahislamku/dashboard-school/subject/SchoolSubject";
import SchoolCertificate from "@/pages/sekolahislamku/dashboard-school/certificate/SchoolCertificate";
import DetailCertificate from "@/pages/sekolahislamku/dashboard-school/certificate/components/DetailCertificate";
import CalenderAcademic from "@/pages/sekolahislamku/dashboard-school/calender/CalenderAcademic";
import SchoolStatistik from "@/pages/sekolahislamku/dashboard-school/statistik/SchoolStatistik";
import SchoolSettings from "@/pages/sekolahislamku/dashboard-school/settings/SchoolSettings";
import SchoolActiveClass from "@/pages/sekolahislamku/dashboard-school/active-class/SchoolActiveClass";
import AllClasses from "@/pages/sekolahislamku/dashboard-teacher/menu-utama/AllClasses";
import ClassDetail from "@/pages/sekolahislamku/dashboard-teacher/menu-utama/DetailClasses";
import TeacherProfil from "@/pages/sekolahislamku/dashboard-teacher/profil/TeacherProfil";
import TeacherSettings from "@/pages/sekolahislamku/dashboard-teacher/menu-utama/settings/TeacherSettings";
import TeacherAssignment from "@/pages/sekolahislamku/dashboard-teacher/menu-utama/assignments/TeacherAssignment";
import Certificate from "@/pages/dashboard/dkm/certificate/DKMCertificate";
import TeacherCertificate from "@/pages/sekolahislamku/dashboard-teacher/menu-utama/certificate/Certificate";

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
        <Route path="website" element={<MasjidkuWebHome />} />
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
      <Route path="/register-sekolah" element={<RegisterAdminMasjid />} />
      <Route
        path="/register-detail-sekolah"
        element={<RegisterDetailAdminMasjid />}
      />
      <Route path="/register-user" element={<RegisterUser />} />
      // 1. Tanpa layout untuk LinkTree
      <Route path="masjid/:slug" index element={<MasjidLinkTree />} />
      // 2. Dengan layout untuk halaman lainnya
      <Route path="/" element={<MasjidLayout />}>
        <Route path="masjid/:slug">
          {/* ==== Public Routes ==== */}
          <Route path="login" element={<Login />} />
          <Route path="register-masjid" element={<RegisterAdminMasjid />} />
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
          {/* <Route path="keuangan" element={<MasjidReportFinansial />} /> */}
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
            {/* Tambahan */}
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
        <Route path="all-schedule" element={<AllScheduleStudent />} />

        <Route
          path="all-schedule/detail/:scheduleId"
          element={<DetailScheduleStudent />}
        />
        <Route path="announcements" element={<AnnouncementsStudent />} />
        <Route
          path="announcements/:id"
          element={<DetailAnnouncementStudent />}
        />
        <Route path="tagihan/:id" element={<InvoiceTagihan />} />
        <Route path="progress/raport" element={<StudentRaport />} />
        <Route path="detail" element={<StudentDetail />} />
        <Route path="finance" element={<StudentFInance />} />
        <Route path="jadwal" element={<StudentSchedule />} />
        <Route path="finnance-list" element={<ListFinance />} />
        <Route path="finnance-list/:id" element={<InvoiceTagihan />} />
        <Route path="pengumuman">
          <Route index element={<StudentAnnouncement />} />
          <Route path="detail/:id" element={<StudentDetailAnnouncement />} />
        </Route>
        <Route path="progress/absensi" element={<StudentAbsence />} />
        <Route
          path="progress/catatan-hasil"
          element={<StudentNotesSummary />}
        />
        {/* Menu Utama Murid */}
        <Route path="menu-utama">
          <Route index element={<StudentMenuGrids />} />
          <Route path="menu-utama" element={<StudentMenuGrids />} />
          <Route path="announcements" element={<AnnouncementsStudent />} />
          <Route path="progress" element={<StudentProgressDetail />} />
          <Route path="progress/raport" element={<StudentRaport />} />
          <Route path="jadwal" element={<StudentSchedule />} />
          <Route path="finance" element={<StudentFInance />} />
          <Route path="finnance-list" element={<ListFinance />} />
          <Route path="finnance-list/:id" element={<InvoiceTagihan />} />
        </Route>
      </Route>
      {/* ==== Protected Routes - Guru (teacher only) ==== */}
      <Route path=":slug/guru" element={<StudentLayout />}>
        <Route index element={<TeacherDashboard />} />
        <Route path="kehadiran" element={<TeacherAttendance />} />
        <Route path="kehadiran/:id" element={<AttendanceDetail />} />
        <Route path="profil-guru" element={<TeacherProfil />} />
        <Route path="penilaian" element={<TeacherGrading />} />
        <Route path="penilaian/:id" element={<DetailGrading />} />
        <Route path="pengumuman" element={<TeacherAnnouncements />} />
        <Route path="jadwal" element={<TeacherSchedule />} />
        <Route path="assignments" element={<AllAssignment />} />
        <Route path="assignments/:id" element={<DetailStudent />} />
        <Route path="kelas/:id/score" element={<TaskScore />} />
        <Route
          path="attendance-management"
          element={<AttendanceManagement />}
        />

        <Route path="kelas/homeroom" element={<HomeroomTeacher />} />
        <Route
          path="all-announcement-teacher"
          element={<AllAnnouncementTeacher />}
        />
        <Route
          path="all-announcement-teacher/detail/:id"
          element={<DetailAnnouncementTeacher />}
        />

        <Route path="management-class/:name" element={<ManagementClass />} />
        {/* ===== 3 Hari (GLOBAL) ===== */}
        <Route path="schedule-3-hari">
          <Route index element={<ScheduleThreeDays />} />
          <Route path=":scheduleId" element={<DetailScheduleThreeDays />} />
        </Route>

        {/* ===== 7 Hari (GLOBAL) =====
     Parent TIDAK memiliki element langsung; anak ⁠ index ⁠ & ⁠ :scheduleId ⁠ yang render. */}
        <Route path="schedule-seven-days">
          <Route index element={<ScheduleSevenDays />} />
          <Route path=":scheduleId" element={<DetailScheduleSevenDays />} />
        </Route>

        {/* (Opsional) Aliases lama → redirect */}
        <Route
          path="schedule-seven-days/*"
          element={<Navigate to="../schedule-seven-days" replace />}
        />

        {/* ===== DALAM /kelas ===== */}
        <Route path="kelas">
          <Route index element={<TeacherClass />} />
          <Route path=":id" element={<DetailClass />} />
          <Route path=":id/absensi" element={<ClassAttandence />} />
          <Route path=":id/material/:materialId" element={<DetailMateri />} />
          {/* <Route path=":id/assignment/:id" element={<DetailAssignment />} /> */}
          <Route path=":id/materi" element={<ClassMateri />} />
          <Route path=":id/tugas" element={<AssignmentClass />} />
          <Route
            path=":id/assignment/:assignmentId"
            element={<DetailAssignmentClass />}
          />
          <Route
            path=":id/student/:studentId/score"
            element={<StudentScore />}
          />
          <Route path="jadwal" element={<TeacherSchedule />} />
          <Route path="kehadiran" element={<TeacherClassAttendance />} />

          {/* 7 Hari (DALAM /kelas) — lengkap list+detail */}
          <Route path="schedule-seven-days">
            <Route index element={<ScheduleSevenDays />} />
            <Route path=":scheduleId" element={<DetailScheduleSevenDays />} />
          </Route>

          {/* (Opsional) alias lama di /kelas */}
          <Route
            path="schedule-7-hari/*"
            element={<Navigate to="../schedule-seven-days" replace />}
          />
        </Route>

        {/* Router Menu Utama Guru*/}
        <Route path="menu-utama">
          <Route index element={<TeacherMenuGrids />} />
          <Route path="all-classes">
            <Route index element={<AllClasses />} />
            <Route path=":id" element={<ClassDetail />} />
          </Route>
          <Route path="jadwal" element={<TeacherSchedule showBack />} />
          <Route path="profil-guru" element={<TeacherProfil showBack />} />
          <Route path="pengaturan" element={<TeacherSettings />} />
          <Route path="tugas" element={<TeacherAssignment />} />
          <Route path="sertifikat" element={<TeacherCertificate />} />

          <Route
            path="all-announcement-teacher"
            element={<AllAnnouncementTeacher />}
          />
          <Route path="kelas">
            <Route index element={<TeacherClass showBack />} />
            <Route path=":id" element={<DetailClass />} />
            <Route path=":id/absensi" element={<ClassAttandence />} />
            <Route path=":id/material/:materialId" element={<DetailMateri />} />
            {/* <Route path=":id/assignment/:id" element={<DetailAssignment />} /> */}
            <Route path=":id/materi" element={<ClassMateri />} />
            <Route path=":id/tugas" element={<AssignmentClass />} />
            <Route
              path=":id/assignment/:assignmentId"
              element={<DetailAssignmentClass />}
            />
            <Route
              path=":id/student/:studentId/score"
              element={<StudentScore />}
            />
            <Route path="jadwal" element={<TeacherSchedule />} />
            <Route path="kehadiran" element={<TeacherClassAttendance />} />

            {/* 7 Hari (DALAM /kelas) — lengkap list+detail */}
            <Route path="schedule-seven-days">
              <Route index element={<ScheduleSevenDays />} />
              <Route path=":scheduleId" element={<DetailScheduleSevenDays />} />
            </Route>

            {/* (Opsional) alias lama di /kelas */}
            <Route
              path="schedule-7-hari/*"
              element={<Navigate to="../schedule-seven-days" replace />}
            />
          </Route>
        </Route>
      </Route>
      {/* ==== Protected Routes - Sekolah (dkm only) ==== */}
      <Route path=":slug/sekolah" element={<StudentLayout />}>
        <Route index element={<SchoolDashboard />} />
        <Route path="murid" element={<SchoolStudent />} />
        <Route path="all-schedule" element={<AllSchedule />} />
        <Route path="profil-sekolah" element={<SchoolProfile />} />
        <Route path="keuangan" element={<SchoolFinance />} />
        <Route path="academic">
          <Route index element={<AcademicSchool />} />
          <Route path="detail" element={<DetailAcademic />} />
          <Route path="manage" element={<ManagementAcademic />} />
        </Route>

        <Route
          path="all-schedule/detail/:scheduleId"
          element={<DetailSchedule />}
        />
        {/* ✅ Tagihan */}
        <Route path="all-invoices">
          <Route index element={<AllInvoices />} />
          <Route path=":id" element={<Bill />} /> {/* detail/bayar */}
        </Route>

        <Route path="tryout-tahfizh-exam" element={<TryoutTahfizhExam />} />
        <Route path="all-announcement" element={<AllAnnouncement />} />
        <Route path="guru" element={<SchoolTeacher />} />
        <Route path="kelas">
          <Route index element={<SchoolClasses />} />
          <Route path="detail/:id" element={<SchoolManageClass />} />
        </Route>
        <Route path="kehadiran" element={<SchoolAttendance />} />

        <Route path="pengumuman" element={<SchoolAnnouncement />} />
        <Route path="buku">
          <Route index element={<SchoolBooks />} />
          <Route path="detail/:id" element={<SchoolDetailBook />} />
        </Route>
        {/* Route Menu Utama */}
        <Route path="menu-utama">
          <Route index element={<SchoolMenuGrids />} />
          {/* <Route path="academic" element={<AcademicSchool showBack />} /> */}
          <Route path="profil-sekolah" element={<SchoolProfile showBack />} />
          <Route path="keuangan" element={<SchoolFinance showBack />} />
          <Route path="guru" element={<SchoolTeacher showBack />} />
          <Route path="all-announcement" element={<AllAnnouncement />} />
          <Route path="sekolah" element={<SchoolDashboard showBack />} />
          <Route path="room-school" element={<RoomSchool />} />
          <Route path="spp" element={<SchoolSpp />} />
          <Route path="pelajaran" element={<SchoolSubject />} />
          <Route path="sertifikat" element={<SchoolCertificate />} />
          <Route path="kalender" element={<CalenderAcademic />} />
          <Route path="statistik" element={<SchoolStatistik />} />
          <Route path="pengaturan" element={<SchoolSettings />} />
          <Route path="kelas-aktif" element={<SchoolActiveClass />} />

          <Route
            path="sertifikat/detail/:classId/:studentId"
            element={<DetailCertificate />}
          />
          <Route path="murid" element={<SchoolStudent />} />

          <Route path="buku">
            <Route index element={<SchoolBooks showBack />} />
            <Route path="detail/:id" element={<SchoolDetailBook />} />
          </Route>
          <Route path="kelas">
            <Route index element={<SchoolClasses showBack />} />
            <Route path="detail/:id" element={<SchoolManageClass />} />
          </Route>
          <Route path="academic">
            <Route index element={<AcademicSchool  showBack />} />
            <Route path="detail" element={<DetailAcademic />} />
            <Route path="manage" element={<ManagementAcademic />} />
          </Route>
        </Route>
      </Route>
      {/* ==== 404 ==== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
