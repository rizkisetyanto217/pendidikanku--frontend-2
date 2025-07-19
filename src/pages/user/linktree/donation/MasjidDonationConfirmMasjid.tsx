import PageHeader from "@/components/common/PageHeader";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function MasjidDonationConfirmMasjid() {
  const [searchParams] = useSearchParams();
  const masjidDonation = Number(searchParams.get("masjid")) || 0;
  const masjidkuDonation = Number(searchParams.get("masjidku")) || 0;
  const fee = 6500;
  const total = masjidDonation + masjidkuDonation + fee;
  const navigate = useNavigate();

  const format = (n: number) =>
    `Rp ${new Intl.NumberFormat("id-ID").format(n)}`;

  return (
    <>
      <PageHeader
        title="Donasi Saya"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className=" max-w-md mx-auto">
        <p className="text-sm text-gray-700">
          Berikut adalah rincian donasi detail
        </p>

        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">No</th>
                <th className="p-3">Deskripsi</th>
                <th className="p-3 text-right">Rincian</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3">1</td>
                <td className="p-3">Nominal Donasi</td>
                <td className="p-3 text-right">{format(masjidDonation)}</td>
              </tr>
              <tr>
                <td className="p-3">2</td>
                <td className="p-3">Biaya Transaksi</td>
                <td className="p-3 text-right">{format(fee)}</td>
              </tr>
              <tr>
                <td className="p-3">3</td>
                <td className="p-3">Dukungan Perkembangan Aplikasi</td>
                <td className="p-3 text-right">{format(masjidkuDonation)}</td>
              </tr>
              <tr className="bg-emerald-100 font-semibold">
                <td className="p-3" colSpan={2}>
                  Total Transfer
                </td>
                <td className="p-3 text-right">{format(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          * Biaya transaksi digunakan untuk kebutuhan sistem pembayaran.
          <br />* Dukungan perkembangan aplikasi digunakan untuk operasional dan
          pengembangan fitur Masjidku.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 py-4 bg-white border-t shadow-md">
        <div className="max-w-xl mx-auto">
          <button className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold">
            Lanjut
          </button>
        </div>
      </div>
    </>
  );
}
