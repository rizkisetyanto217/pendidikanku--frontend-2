import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

export default function MasjidkuProfil() {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <>
      <PageHeaderUser
        title="Profil MasjidKu"
        onBackClick={() => navigate(`/`)}
      />

      <div
        className="max-w-3xl mx-auto p-6 space-y-6 rounded-xl "
        style={{
          backgroundColor: theme.white1, // kartu latar mengikuti tema
          borderColor: theme.white3, // garis halus
        }}
      >
        {/* Judul */}
        <h1 className="text-2xl font-bold" style={{ color: theme.primary }}>
          Profil MasjidKu
        </h1>

        {/* Latar Belakang */}
        <section>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: theme.quaternary }}
          >
            Latar Belakang
          </h2>
          <p
            className="text-justify leading-relaxed"
            style={{ color: theme.black1 }}
          >
            MasjidKu lahir dari kebutuhan untuk menghadirkan solusi digital yang
            memudahkan pengelolaan masjid di seluruh Indonesia. Di era modern,
            peran masjid tidak hanya sebatas tempat ibadah, tetapi juga sebagai
            pusat edukasi, sosial, dan pemberdayaan umat. Namun, banyak masjid
            yang masih mengandalkan sistem manual dalam pencatatan keuangan,
            pengelolaan jadwal kegiatan, dan komunikasi dengan jamaah.
          </p>
          <p
            className="text-justify leading-relaxed mt-3"
            style={{ color: theme.black1 }}
          >
            Melihat tantangan tersebut, MasjidKu hadir sebagai platform digital
            yang memadukan kemudahan teknologi dengan nilai-nilai islami.
            Melalui aplikasi dan website, kami membantu masjid untuk
            menyampaikan informasi secara cepat, transparan, dan mudah diakses,
            sehingga jamaah dapat terhubung lebih erat dengan kegiatan
            masjidnya.
          </p>
        </section>

        {/* Tujuan */}
        <section>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: theme.quaternary }}
          >
            Tujuan
          </h2>
          <ul
            className="list-disc pl-5 space-y-2 leading-relaxed"
            style={{ color: theme.black1 }}
          >
            <li>
              Mempermudah pengurus masjid dalam mengelola kegiatan, jadwal
              sholat, kajian, dan acara lainnya secara digital.
            </li>
            <li>
              Menyediakan sistem pencatatan dan pelaporan keuangan masjid yang
              transparan dan akuntabel, sehingga meningkatkan kepercayaan
              jamaah.
            </li>
            <li>
              Memperkuat hubungan antara masjid dan jamaah melalui penyampaian
              informasi yang cepat, tepat, dan interaktif.
            </li>
            <li>
              Mendukung program dakwah dan edukasi dengan memanfaatkan media
              digital yang mudah diakses oleh berbagai kalangan.
            </li>
            <li>
              Menjadi wadah kolaborasi antar masjid untuk saling berbagi
              pengalaman, sumber daya, dan inspirasi dalam memajukan pelayanan
              kepada umat.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
