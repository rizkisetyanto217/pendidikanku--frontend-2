// src/pages/sekolahislamku/pages/teacher/Certificate.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import {
  SectionCard,
  Btn,
  Badge,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import {
  Award,
  ExternalLink,
  ArrowLeft,
  Plus,
  Calendar,
  Building,
  Download,
  Eye,
  Star,
  BookOpen,
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

/* ===== Types ===== */
type Certificate = {
  id: string;
  name: string;
  issuer: string;
  year: number;
  category: string;
  credential_url?: string;
  has_credential: boolean;
  description: string;
};

/* ===== Fake Data Sertifikat ===== */
const certificates: Certificate[] = [
  {
    id: "1",
    name: "Sertifikat Pendidik Profesional",
    issuer: "Kementerian Agama RI",
    year: 2023,
    category: "Profesi",
    has_credential: true,
    credential_url: "https://sertifikat-kemenag.id/prof123",
    description:
      "Sertifikat kompetensi sebagai pendidik profesional di lembaga pendidikan Islam",
  },
  {
    id: "2",
    name: "Pelatihan Kurikulum Merdeka",
    issuer: "Kemendikbud Ristek",
    year: 2024,
    category: "Pelatihan",
    has_credential: true,
    credential_url: "https://guru.kemdikbud.id/merdeka456",
    description:
      "Pelatihan implementasi kurikulum merdeka untuk pendidikan dasar",
  },
  {
    id: "3",
    name: "Workshop Pembelajaran Berbasis IT",
    issuer: "LPMP Jawa Timur",
    year: 2024,
    category: "Workshop",
    has_credential: false,
    description:
      "Workshop pengintegrasian teknologi informasi dalam pembelajaran",
  },
  {
    id: "4",
    name: "Sertifikat Tahfidz Al-Quran",
    issuer: "Pondok Modern Gontor",
    year: 2022,
    category: "Keagamaan",
    has_credential: true,
    credential_url: "https://gontor.ac.id/tahfidz789",
    description: "Sertifikat hafalan Al-Quran 30 Juz dengan sanad yang jelas",
  },
  {
    id: "5",
    name: "Pelatihan Metodologi Mengajar",
    issuer: "Universitas Islam Negeri",
    year: 2023,
    category: "Pelatihan",
    has_credential: false,
    description: "Pelatihan metodologi pengajaran modern untuk pendidik Muslim",
  },
];

/* ===== Main Page ===== */
type CertificateProps = {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
};

const TeacherCertificate: React.FC<CertificateProps> = ({
  showBack = false,
  backTo,
  backLabel = "Kembali",
}) => {
  const { isDark, themeName } = useHtmlDarkMode();
  const palette: Palette = pickTheme(themeName as ThemeName, isDark);
  const navigate = useNavigate();

  const [filter, setFilter] = useState<
    "all" | "profesi" | "pelatihan" | "workshop" | "keagamaan"
  >("all");

  const filteredCertificates = certificates.filter(
    (cert) => filter === "all" || cert.category.toLowerCase() === filter
  );

  const getCategoryVariant = (category: string) => {
    switch (category.toLowerCase()) {
      case "profesi":
        return "success";
      case "keagamaan":
        return "outline";
      case "pelatihan":
        return "outline";
      case "workshop":
        return "outline";
      default:
        return "outline";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "profesi":
        return Star;
      case "keagamaan":
        return BookOpen;
      default:
        return Award;
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        title="Sertifikat & Kompetensi"
        gregorianDate={TODAY_ISO}
        hijriDate={hijriWithWeekday(TODAY_ISO)}
        dateFmt={dateLong}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <ParentSidebar palette={palette} />

          <div className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Btn
                  palette={palette}
                  onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
                  variant="ghost"
                >
                  <ArrowLeft size={20} />
                </Btn>
                <div>
                  <h1 className="font-semibold text-xl">Sertifikat Saya</h1>
                  <p className="text-sm mt-1" style={{ color: palette.black2 }}>
                    {certificates.length} sertifikat terdaftar
                  </p>
                </div>
              </div>
              <Btn palette={palette}>
                <Plus size={16} />
                Tambah Sertifikat
              </Btn>
            </div>

            {/* Filter Tabs */}
            <SectionCard palette={palette}>
              <div className="p-4">
                <div className="flex gap-1 overflow-x-auto">
                  {[
                    { key: "all", label: "Semua" },
                    { key: "profesi", label: "Profesi" },
                    { key: "keagamaan", label: "Keagamaan" },
                    { key: "pelatihan", label: "Pelatihan" },
                    { key: "workshop", label: "Workshop" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        filter === key ? "text-white" : ""
                      }`}
                      style={{
                        backgroundColor:
                          filter === key ? palette.primary : "transparent",
                        color: filter === key ? "white" : palette.black2,
                      }}
                      onClick={() => setFilter(key as any)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* Certificates Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredCertificates.length === 0 ? (
                <div className="md:col-span-2">
                  <SectionCard palette={palette}>
                    <div className="p-12 text-center">
                      <Award
                        size={48}
                        style={{ color: palette.silver1 }}
                        className="mx-auto mb-4"
                      />
                      <h3 className="font-medium text-lg mb-2">
                        Belum Ada Sertifikat
                      </h3>
                      <p
                        className="text-sm mb-4"
                        style={{ color: palette.black2 }}
                      >
                        Mulai tambahkan sertifikat untuk melengkapi profil
                        profesional Anda
                      </p>
                      <Btn palette={palette}>
                        <Plus size={16} />
                        Tambah Sertifikat Pertama
                      </Btn>
                    </div>
                  </SectionCard>
                </div>
              ) : (
                filteredCertificates.map((cert) => {
                  const CategoryIcon = getCategoryIcon(cert.category);

                  return (
                    <SectionCard
                      key={cert.id}
                      palette={palette}
                      className="hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: palette.primary + "20" }}
                          >
                            <CategoryIcon
                              size={20}
                              style={{ color: palette.primary }}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-base line-clamp-2 mb-1">
                                {cert.name}
                              </h3>
                              <Badge
                                palette={palette}
                                variant={getCategoryVariant(cert.category)}
                              >
                                {cert.category}
                              </Badge>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div
                                className="flex items-center gap-2 text-sm"
                                style={{ color: palette.black2 }}
                              >
                                <Building size={14} />
                                <span>{cert.issuer}</span>
                              </div>
                              <div
                                className="flex items-center gap-2 text-sm"
                                style={{ color: palette.black2 }}
                              >
                                <Calendar size={14} />
                                <span>{cert.year}</span>
                              </div>
                            </div>

                            <p
                              className="text-sm line-clamp-2 mb-4"
                              style={{ color: palette.black2 }}
                            >
                              {cert.description}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {cert.has_credential ? (
                                <>
                                  <Btn
                                    palette={palette}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Eye size={14} />
                                    Lihat
                                  </Btn>
                                  {cert.credential_url && (
                                    <a
                                      href={cert.credential_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Btn
                                        palette={palette}
                                        size="sm"
                                        variant="outline"
                                      >
                                        <ExternalLink size={14} />
                                        Verifikasi
                                      </Btn>
                                    </a>
                                  )}
                                </>
                              ) : (
                                <Badge palette={palette} variant="outline">
                                  Tidak tersedia digital
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  );
                })
              )}
            </div>

            {/* Summary Stats */}
            {certificates.length > 0 && (
              <SectionCard palette={palette}>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-4">
                    Ringkasan Sertifikat
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: palette.primary }}
                      >
                        {certificates.length}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: palette.black2 }}
                      >
                        Total Sertifikat
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: palette.primary }}
                      >
                        {certificates.filter((c) => c.has_credential).length}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: palette.black2 }}
                      >
                        Tersedia Digital
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: palette.primary }}
                      >
                        {
                          certificates.filter((c) => c.category === "Keagamaan")
                            .length
                        }
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: palette.black2 }}
                      >
                        Sertifikat Agama
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: palette.primary }}
                      >
                        {new Date().getFullYear() -
                          Math.min(...certificates.map((c) => c.year))}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: palette.black2 }}
                      >
                        Tahun Pengalaman
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherCertificate;
