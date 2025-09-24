// src/pages/sekolahislamku/pages/student/StudentProfil.tsx
import React, { useState } from "react";
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
  Award,
  Users,
  Camera,
} from "lucide-react";

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

/* ===== Data Dummy ===== */
const dummyStudent = {
  fullname: "Ahmad Fauzi",
  nis: "202512345",
  class: "X IPA 1",
  birthDate: "2010-04-15",
  birthPlace: "Jakarta",
  address: "Jl. Merdeka No. 45, Jakarta",
  phone: "+628123456789",
  email: "ahmad.fauzi@student.sekolahislamku.id",
  avatar: "",
  achievements: [
    "Juara 1 Olimpiade Matematika 2024",
    "Juara 2 MTQ Antar Sekolah 2023",
    "Peserta Lomba Cerdas Cermat Nasional 2022",
  ],
  subjects: ["Matematika", "Fisika", "Kimia", "Tahfidz", "Bahasa Arab"],
};

/* ===== Main Component ===== */
const StudentProfil: React.FC = () => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();
  const isFromMenuUtama = location.pathname.includes("/menu-utama/");

  const [avatarPreview, setAvatarPreview] = useState(dummyStudent.avatar);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top bar */}
      <ParentTopBar
        palette={palette}
        title="Profil Siswa"
        gregorianDate={new Date().toISOString()}
        showBack={isFromMenuUtama}
      />

      <main className="w-full px-4 py-4 md:py-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <ParentSidebar palette={palette} />
          </aside>

          {/* Konten utama */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
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
                        alt={dummyStudent.fullname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(dummyStudent.fullname)
                    )}
                  </div>
                  <button
                    type="button"
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
                      {dummyStudent.fullname}
                    </h1>
                    <p
                      className="text-sm font-medium"
                      style={{ color: palette.primary }}
                    >
                      {dummyStudent.class}
                    </p>
                  </div>
                  <Badge palette={palette} variant="success">
                    Aktif
                  </Badge>
                </div>
              </div>
            </SectionCard>

            {/* Info dasar */}
            <SectionCard palette={palette}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>NIS:</strong> {dummyStudent.nis}
                </div>
                <div>
                  <strong>Tanggal Lahir:</strong>{" "}
                  {dateLong(dummyStudent.birthDate)}
                </div>
                <div>
                  <strong>Tempat Lahir:</strong> {dummyStudent.birthPlace}
                </div>
                <div>
                  <strong>Alamat:</strong> {dummyStudent.address}
                </div>
                <div>
                  <strong>Telepon:</strong> {dummyStudent.phone}
                </div>
                <div>
                  <strong>Email:</strong> {dummyStudent.email}
                </div>
              </div>
            </SectionCard>

            {/* Subjects */}
            <SectionCard palette={palette}>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">Mata Pelajaran</h3>
                <div className="flex flex-wrap gap-2">
                  {dummyStudent.subjects.map((sub, i) => (
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
                <h3 className="font-semibold text-lg mb-3">Prestasi</h3>
                <ul className="space-y-2 text-sm">
                  {dummyStudent.achievements.map((a, i) => (
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
      </main>
    </div>
  );
};

export default StudentProfil;
