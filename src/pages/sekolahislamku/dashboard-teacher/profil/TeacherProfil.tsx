// src/pages/sekolahislamku/pages/teacher/TeacherProfil.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  SectionCard,
  Badge,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import {
  User,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  MapPin,
  ArrowLeft,
  GraduationCap,
  Building,
  Award,
  Clock,
  MessageCircle,
  Users,
  Edit,
  Camera,
} from "lucide-react";

import ModalEditRingkasan from "./ModalEditRingkasan";
import ModalEditProfilLengkap from "./ModalEditProfil";
import ModalEditInformasiMengajar from "./ModalEditRingkasMengajar";

/* ===== Helpers ===== */
const dateLong = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

const hijriWithWeekday = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const TODAY_ISO = new Date().toISOString();

type TeacherProfilProps = {
  showBack?: boolean;
  backLabel?: string;
};

/* ===== Data Dummy ===== */
const initialProfile = {
  user_fullname: "Budi Hadi, S.Pd., M.Pd.",
  user_profile_date_of_birth: "1995-06-10",
  user_profile_place_of_birth: "Surabaya",
  user_profile_location: "Jawa Timur",
  user_profile_city: "Surabaya",
  user_profile_phone_number: "+6281234567890",
  user_email: "budi.hadi@sekolahislamku.id",
  user_profile_company: "Sekolah Islam Terpadu Al-Ikhlas",
  user_profile_position: "Guru Matematika & Koordinator Olimpiade",
  user_profile_avatar: "",
};

const initialTeacher = {
  user_teacher_field: "Matematika Terapan & Olimpiade",
  users_teacher_short_bio:
    "Guru berpengalaman dengan spesialisasi olimpiade matematika dan pengembangan kurikulum inovatif.",
  users_teacher_long_bio:
    "Mengajar sejak 2013 dengan fokus pada pengembangan kemampuan problem solving siswa. Berpengalaman dalam kurikulum nasional, Cambridge, dan persiapan olimpiade tingkat nasional dan internasional. Aktif dalam penelitian pendidikan matematika dan pengembangan media pembelajaran digital.",
  users_teacher_greeting:
    "Assalamualaikum warahmatullahi wabarakatuh. Selamat datang di kelas matematika yang menyenangkan! Mari kita jelajahi keindahan matematika bersama-sama.",
  users_teacher_education:
    "S1 Pendidikan Matematika UIN Sunan Ampel; S2 Pendidikan Matematika Unesa",
  users_teacher_activity:
    "Pembina Tim Olimpiade Matematika, Penulis Buku Modul, Narasumber Workshop Guru, Peneliti Pendidikan",
  users_teacher_experience_years: 11,
  users_teacher_is_active: true,
  users_teacher_rating: 4.8,
  users_teacher_total_students: 245,
  users_teacher_subjects: ["Matematika", "Aljabar", "Geometri", "Statistika"],
  users_teacher_achievements: [
    "Guru Berprestasi Tingkat Provinsi 2022",
    "Pembina Tim Olimpiade Juara Nasional 2021",
    "Sertifikat Trainer Cambridge Mathematics",
  ],
};

/* ===== Main Page ===== */
const TeacherProfil: React.FC<TeacherProfilProps> = ({
  showBack = false,
  backLabel = "Kembali",
}) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "overview" | "profile" | "teaching"
  >("overview");

  // state user
  const [userProfile, setUserProfile] = useState(initialProfile);
  const [userTeacher, setUserTeacher] = useState(initialTeacher);

  // modal states
  const [openRingkasanEdit, setOpenRingkasanEdit] = useState(false);
  const [openProfilEdit, setOpenProfilEdit] = useState(false);
  const [openMengajarEdit, setOpenMengajarEdit] = useState(false);

  // avatar
  const [avatarPreview, setAvatarPreview] = useState(
    userProfile.user_profile_avatar || ""
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  /* ===== LocalStorage Persistence ===== */
  useEffect(() => {
    const savedProfile = localStorage.getItem("teacherProfile");
    const savedTeacher = localStorage.getItem("teacherTeacher");
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedTeacher) setUserTeacher(JSON.parse(savedTeacher));
  }, []);

  useEffect(() => {
    localStorage.setItem("teacherProfile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("teacherTeacher", JSON.stringify(userTeacher));
  }, [userTeacher]);

  /* ===== Avatar Upload ===== */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUserProfile((prev) => ({ ...prev, user_profile_avatar: previewUrl }));

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload gagal");
      const data = await res.json();
      if (data.url) {
        setAvatarPreview(data.url);
        setUserProfile((prev) => ({
          ...prev,
          user_profile_avatar: data.url,
        }));
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Profil Guru"
        gregorianDate={TODAY_ISO}
        hijriDate={hijriWithWeekday(TODAY_ISO)}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <ParentSidebar palette={palette} />
          <div className="flex-1 min-w-0 space-y-6">
            <div className="font-semibold text-lg flex items-center ">
              <div className="  flex items-center gap-x-3 ">
                {showBack && (
                  <Btn
                    palette={palette}
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    className="cursor-pointer mr-3"
                  >
                    <ArrowLeft
                      aria-label={backLabel}
                      // title={backLabel}

                      size={20}
                    />
                  </Btn>
                )}
              </div>
              {/* <h1 className="flex items-center text-lg font-semibold">Pfofil Guru</h1>\\\\ */}
            </div>
            {/* Header */}
            <SectionCard palette={palette}>
              <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Avatar */}
                <div className="relative mx-auto md:mx-0">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-lg font-semibold text-white overflow-hidden"
                    style={{ backgroundColor: palette.primary }}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt={userProfile.user_fullname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(userProfile.user_fullname)
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id="avatarInput"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("avatarInput")?.click()
                    }
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: palette.primary }}
                  >
                    <Camera size={16} />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <div>
                    <h1 className="text-base font-semibold">
                      {userProfile.user_fullname}
                    </h1>
                    <p
                      className="text-sm font-medium"
                      style={{ color: palette.primary }}
                    >
                      {userTeacher.user_teacher_field}
                    </p>
                  </div>
                  <Badge
                    palette={palette}
                    variant={
                      userTeacher.users_teacher_is_active
                        ? "success"
                        : "outline"
                    }
                  >
                    {userTeacher.users_teacher_is_active
                      ? "Aktif Mengajar"
                      : "Nonaktif"}
                  </Badge>

                  {/* Edit Button */}
                  <div className="pt-2 flex justify-center md:justify-end">
                    {activeTab === "overview" && (
                      <Btn
                        palette={palette}
                        size="sm"
                        onClick={() => setOpenRingkasanEdit(true)}
                      >
                        <Edit size={16} /> Ringkasan
                      </Btn>
                    )}
                    {activeTab === "profile" && (
                      <Btn
                        palette={palette}
                        size="sm"
                        onClick={() => setOpenProfilEdit(true)}
                      >
                        <Edit size={16} /> Profil
                      </Btn>
                    )}
                    {activeTab === "teaching" && (
                      <Btn
                        palette={palette}
                        size="sm"
                        onClick={() => setOpenMengajarEdit(true)}
                      >
                        <Edit size={16} /> Mengajar
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Tabs */}
            <SectionCard palette={palette}>
              <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                {[
                  { key: "overview", label: "Ringkasan" },
                  { key: "profile", label: "Profil" },
                  { key: "teaching", label: "Mengajar" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    className={`flex flex-col items-center justify-center py-2 text-xs md:text-sm font-medium ${
                      activeTab === key ? "text-white" : ""
                    }`}
                    style={{
                      backgroundColor:
                        activeTab === key ? palette.primary : "transparent",
                      color: activeTab === key ? "white" : palette.black2,
                    }}
                    onClick={() => setActiveTab(key as any)}
                  >
                    {/* <Icon size={14} className="mb-1" /> */}
                    {label}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* ====== CONTENT (tetap sama persis) ====== */}
            {activeTab === "overview" && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Kolom Kiri */}
                <div className="space-y-6">
                  {/* Greeting */}
                  <SectionCard palette={palette}>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <MessageCircle
                          size={20}
                          style={{ color: palette.primary }}
                        />
                        <h3 className="font-semibold text-lg">Salam Pembuka</h3>
                      </div>
                      <div
                        className="p-4 rounded-lg italic text-sm leading-relaxed"
                        style={{ backgroundColor: palette.silver1 + "40" }}
                      >
                        "{userTeacher.users_teacher_greeting}"
                      </div>
                    </div>
                  </SectionCard>

                  {/* Short Bio */}
                  <SectionCard palette={palette}>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-3">
                        Tentang Saya
                      </h3>
                      <p className="text-sm leading-relaxed">
                        {userTeacher.users_teacher_short_bio}
                      </p>
                    </div>
                  </SectionCard>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-6">
                  {/* Subjects */}
                  <SectionCard palette={palette}>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-3">
                        Mata Pelajaran
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {userTeacher.users_teacher_subjects.map((sub, i) => (
                          <Badge key={i} palette={palette} variant="outline">
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </SectionCard>

                  {/* Achievements */}
                  <SectionCard palette={palette}>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-3">
                        Penghargaan
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {userTeacher.users_teacher_achievements.map((a, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span
                              className="w-2 h-2 rounded-full mt-2"
                              style={{ backgroundColor: palette.primary }}
                            />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Info */}
                <SectionCard palette={palette}>
                  <div className="p-6 space-y-2 text-sm">
                    <div>Nama: {userProfile.user_fullname}</div>
                    <div>Telepon: {userProfile.user_profile_phone_number}</div>
                    <div>Email: {userProfile.user_email}</div>
                    <div>
                      Lokasi: {userProfile.user_profile_city},{" "}
                      {userProfile.user_profile_location}
                    </div>
                    <div>
                      Lahir: {userProfile.user_profile_place_of_birth},{" "}
                      {dateLong(userProfile.user_profile_date_of_birth)}
                    </div>
                  </div>
                </SectionCard>

                {/* Professional Info */}
                <SectionCard palette={palette}>
                  <div className="p-6 space-y-2 text-sm">
                    <div>Instansi: {userProfile.user_profile_company}</div>
                    <div>Posisi: {userProfile.user_profile_position}</div>
                    <div>Pendidikan: {userTeacher.users_teacher_education}</div>
                    <div>
                      Pengalaman: {userTeacher.users_teacher_experience_years}{" "}
                      tahun
                    </div>
                  </div>
                </SectionCard>

                {/* Long Bio */}
                <SectionCard palette={palette}>
                  <div className="p-6 text-sm leading-relaxed">
                    {userTeacher.users_teacher_long_bio}
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === "teaching" && (
              <div className="grid gap-6 md:grid-cols-2">
                <SectionCard palette={palette}>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">
                      Kegiatan Mengajar
                    </h3>
                    <p className="text-sm">
                      {userTeacher.users_teacher_activity}
                    </p>
                  </div>
                </SectionCard>

                <SectionCard palette={palette}>
                  <div className="p-6 text-sm space-y-2">
                    <div>Rating: {userTeacher.users_teacher_rating}/5.0</div>
                    <div>
                      Total Siswa: {userTeacher.users_teacher_total_students}
                    </div>
                    <div>
                      Pengalaman: {userTeacher.users_teacher_experience_years}{" "}
                      tahun
                    </div>
                    <div>
                      Status:{" "}
                      {userTeacher.users_teacher_is_active
                        ? "Aktif"
                        : "Nonaktif"}
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ModalEditRingkasan
        open={openRingkasanEdit}
        onClose={() => setOpenRingkasanEdit(false)}
        initial={{
          greeting: userTeacher.users_teacher_greeting,
          shortBio: userTeacher.users_teacher_short_bio,
          subjects: userTeacher.users_teacher_subjects,
        }}
        palette={palette}
        onSubmit={(data) =>
          setUserTeacher((prev) => ({
            ...prev,
            users_teacher_greeting: data.greeting,
            users_teacher_short_bio: data.shortBio,
            users_teacher_subjects: data.subjects,
          }))
        }
      />

      <ModalEditProfilLengkap
        open={openProfilEdit}
        onClose={() => setOpenProfilEdit(false)}
        initial={{
          fullname: userProfile.user_fullname,
          phone: userProfile.user_profile_phone_number,
          email: userProfile.user_email,
          city: userProfile.user_profile_city,
          location: userProfile.user_profile_location,
          birthPlace: userProfile.user_profile_place_of_birth,
          birthDate: userProfile.user_profile_date_of_birth,
          company: userProfile.user_profile_company,
          position: userProfile.user_profile_position,
          education: userTeacher.users_teacher_education,
          experience: userTeacher.users_teacher_experience_years,
        }}
        palette={palette}
        onSubmit={(data) => {
          setUserProfile((prev) => ({
            ...prev,
            user_fullname: data.fullname,
            user_profile_phone_number: data.phone,
            user_email: data.email,
            user_profile_city: data.city,
            user_profile_location: data.location,
            user_profile_place_of_birth: data.birthPlace,
            user_profile_date_of_birth: data.birthDate,
            user_profile_company: data.company,
            user_profile_position: data.position,
          }));
          setUserTeacher((prev) => ({
            ...prev,
            users_teacher_education: data.education,
            users_teacher_experience_years: data.experience,
          }));
        }}
      />

      <ModalEditInformasiMengajar
        open={openMengajarEdit}
        onClose={() => setOpenMengajarEdit(false)}
        initial={{
          activity: userTeacher.users_teacher_activity,
          rating: userTeacher.users_teacher_rating,
          totalStudents: userTeacher.users_teacher_total_students,
          experience: userTeacher.users_teacher_experience_years,
          isActive: userTeacher.users_teacher_is_active,
        }}
        palette={palette}
        onSubmit={(data) =>
          setUserTeacher((prev) => ({
            ...prev,
            users_teacher_activity: data.activity,
            users_teacher_rating: data.rating,
            users_teacher_total_students: data.totalStudents,
            users_teacher_experience_years: data.experience,
            users_teacher_is_active: data.isActive,
          }))
        }
      />
    </div>
  );
};

export default TeacherProfil;
