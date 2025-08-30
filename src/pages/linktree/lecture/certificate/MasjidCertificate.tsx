import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import QRCodeLink from "@/components/common/main/QRCodeLink";

export default function MasjidCertificateLecture() {
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const { user_exam_id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["certificate-by-user-exam", user_exam_id],
    queryFn: async () => {
      const res = await axios.get(
        `/public/certificates/by-user-exam/${user_exam_id}`
      );
      console.log("📦 Data sertifikat:", res.data);
      return res.data;
    },
    enabled: !!user_exam_id,
  });

  const formatGrade = (n: number | null | undefined): string => {
    if (n == null) return "-";
    if (n >= 91) return `${n} (Istimewa)`;
    if (n >= 81) return `${n} (Sangat Baik)`;
    if (n >= 71) return `${n} (Baik)`;
    if (n >= 61) return `${n} (Cukup)`;
    return `${n} (Perlu Bimbingan)`;
  };

  if (isLoading) {
    return <p className="text-center py-10">Memuat sertifikat...</p>;
  }

  const certificate = data;

  return (
    <div
      className="min-h-screen space-y-4 pb-20"
      style={{ backgroundColor: theme.white2 }}
    >
      <PageHeaderUser
        title="Sertifikat"
        onBackClick={() => {
          if (window.history.length > 1) window.history.back();
        }}
      />

      <div
        className="rounded-lg p-6 space-y-3"
        style={{
          backgroundColor: theme.tertiary,
          color: theme.black1,
        }}
      >
        <h2
          className="text-center font-semibold text-lg"
          style={{ color: theme.primary }}
        >
          {certificate?.certificate_title || "Sertifikat Kelulusan"}
        </h2>
        <p className="text-center text-sm" style={{ color: theme.silver2 }}>
          No. 221/03-05-2025
        </p>

        <div className="text-center text-sm" style={{ color: theme.black1 }}>
          <p>Diberikan Kepada</p>
          <p className="font-semibold text-base">
            {certificate?.user_lecture_exam_user_name || "Nama Tidak Diketahui"}
          </p>
          <p>Nomor Induk Peserta : 10202025</p>
        </div>

        <div className="text-center text-sm" style={{ color: theme.black1 }}>
          <p>
            Atas pencapaiannya sebagai peserta telah menyelesaikan pembelajaran
          </p>
          <p className="font-semibold" style={{ color: theme.primary }}>
            {certificate?.lecture_title} - {certificate?.masjid_name}
          </p>
          <p>
            Dengan Nilai{" "}
            <span className="font-bold">
              {formatGrade(certificate?.user_lecture_exam_grade_result)}
            </span>
          </p>
          <p>
            Semoga ilmu yang telah dipelajari bermanfaat dan mendapatkan ridho
            Allah ta'ala
          </p>
        </div>

        <div className="flex justify-between items-center mt-6 flex-wrap gap-y-6">
          <div className="text-center w-[30%] min-w-[100px]">
            <div
              className="w-20 h-10 rounded-sm mb-1 mx-auto"
              style={{ backgroundColor: theme.black1 }}
            />
            <p className="text-xs" style={{ color: theme.silver2 }}>
              Ustadz Fehri, Lc
            </p>
            <p className="text-xs" style={{ color: theme.silver4 }}>
              Pengajar
            </p>
          </div>

          <div className="w-[30%] min-w-[100px]">
            <QRCodeLink value={window.location.href} />
          </div>

          <div className="text-center w-[30%] min-w-[100px]">
            <div
              className="w-20 h-10 rounded-sm mb-1 mx-auto"
              style={{ backgroundColor: theme.black1 }}
            />
            <p className="text-xs" style={{ color: theme.silver2 }}>
              Bapak Hendi
            </p>
            <p className="text-xs" style={{ color: theme.silver4 }}>
              Ketua DKM
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-3">
        <Button className="w-full" style={{ backgroundColor: theme.primary }}>
          Unduh Sertifikat
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          style={{
            color: theme.black1,
            borderColor: theme.silver1,
            backgroundColor: theme.white1,
          }}
        >
          <Share2 className="w-4 h-4" /> Bagikan Sertifikat
        </Button>
      </div>
    </div>
  );
}
