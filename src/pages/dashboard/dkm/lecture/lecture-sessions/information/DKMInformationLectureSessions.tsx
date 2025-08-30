import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import FormattedDate from "@/constants/formattedDate";
import cleanTranscriptHTML from "@/constants/cleanTransciptHTML";
import ShimmerImage from "@/components/common/main/ShimmerImage";
import ShowImageFull from "@/components/pages/home/ShowImageFull";
import {
  BookOpen,
  User,
  CalendarClock,
  MapPin,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function DKMInformationLectureSessions() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: session } = useLocation();
  const [showImageModal, setShowImageModal] = useState(false);

  if (!session) {
    return (
      <p className="text-sm text-red-500">Data sesi kajian tidak tersedia.</p>
    );
  }

  const {
    lecture_session_title,
    lecture_session_description,
    lecture_session_teacher_name,
    lecture_session_start_time,
    lecture_session_place,
    lecture_session_approved_by_dkm_at,
    lecture_session_image_url,
  } = session;

  return (
    <div
      className="pb-16 max-w-4xl mx-auto"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      <PageHeader
        title="Informasi Sesi Kajian"
        onBackClick={() => navigate(`/dkm/kajian/kajian-detail/${id}`)}
      />

      <div
        className="rounded-xl overflow-hidden border flex flex-col md:flex-row mt-4"
        style={{ borderColor: theme.silver1 }}
      >
        {/* Gambar kiri */}
        <div
          className="w-full md:w-1/2 md:h-auto overflow-hidden aspect-[4/3] md:aspect-auto"
          style={{
            borderRight: `1px solid ${theme.silver1}`,
          }}
        >
          <ShimmerImage
            src={
              lecture_session_image_url
                ? decodeURIComponent(lecture_session_image_url)
                : undefined
            }
            alt="Gambar Kajian"
            className="w-full h-full object-cover cursor-pointer"
            shimmerClassName="rounded-none"
            onClick={() => setShowImageModal(true)}
          />
        </div>

        {/* Informasi kanan */}
        <div className="flex-1 p-4 space-y-3 text-sm">
          <InfoItem
            icon={<BookOpen size={16} />}
            label="Judul"
            value={lecture_session_title}
          />
          <InfoItem
            icon={<User size={16} />}
            label="Ustadz"
            value={lecture_session_teacher_name}
          />
          <InfoItem
            icon={<CalendarClock size={16} />}
            label="Jadwal"
            value={
              <FormattedDate value={lecture_session_start_time} fullMonth />
            }
          />
          <InfoItem
            icon={<MapPin size={16} />}
            label="Lokasi"
            value={lecture_session_place}
          />
          <InfoItem
            icon={
              lecture_session_approved_by_dkm_at ? (
                <CheckCircle2 size={16} />
              ) : (
                <Clock size={16} />
              )
            }
            label="Status Materi"
            value={
              lecture_session_approved_by_dkm_at
                ? "Soal & Materi tersedia ✓"
                : "Dalam proses ✕"
            }
          />

          {/* Deskripsi */}
          <div>
            <span className="flex items-center gap-1 font-medium text-gray-500 dark:text-gray-300 mb-1">
              <FileText size={16} /> Deskripsi:
            </span>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              style={{ color: theme.silver2 }}
              dangerouslySetInnerHTML={{
                __html: cleanTranscriptHTML(lecture_session_description || ""),
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal gambar */}
      {showImageModal && lecture_session_image_url && (
        <ShowImageFull
          url={lecture_session_image_url}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}

// ✅ Komponen baris info dengan ikon
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <p className="flex items-start gap-1">
      <span className="flex items-center gap-1 font-medium text-gray-500 dark:text-gray-300">
        {icon} {label}:
      </span>{" "}
      <span className="ml-1">{value}</span>
    </p>
  );
}
