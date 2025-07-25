import React from "react";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import QRCodeLink from "@/components/common/main/QRCodeLink";

export default function MasjidCertificateLecture() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

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
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: theme.primary }}
            />
            <div
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: theme.primary }}
            />
          </div>
        </div>

        <h2
          className="text-center font-semibold text-lg"
          style={{ color: theme.primary }}
        >
          Sertifikat Kelulusan
        </h2>
        <p className="text-center text-sm" style={{ color: theme.silver2 }}>
          No. 221/03-05-2025
        </p>

        <div className="text-center text-sm" style={{ color: theme.black1 }}>
          <p>Diberikan Kepada</p>
          <p className="font-semibold text-base">Nama Lengkap</p>
          <p>Nomor Induk Peserta : 10202025</p>
        </div>

        <div className="text-center text-sm" style={{ color: theme.black1 }}>
          <p>
            Atas pencapaiannya sebagai peserta telah menyelesaikan pembelajaran
          </p>
          <p className="font-semibold" style={{ color: theme.primary }}>
            Fiqh Mawaris - Masjid At-Taqwa Ciracas
          </p>
          <p>
            Dengan Nilai <span className="font-bold">90 (Baik Sekali)</span>
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
