import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/lib/axios"; // Pastikan path-nya sesuai dengan letak file api.ts Anda
import axios, { AxiosError } from "axios"; // Import AxiosError untuk menangani error dari Axios
import PageHeader from "@/components/common/PageHeader"; // Gantilah dengan path yang sesuai

declare global {
  interface Window {
    snap: any; // Menambahkan snap di window
  }
}

const MasjidDonationConfirmMasjid = () => {
  const [searchParams] = useSearchParams();
  const masjidDonation = Number(searchParams.get("masjid")) || 0;
  const masjidkuDonation = Number(searchParams.get("masjidku")) || 0;
  const fee = 6500;
  const total = masjidDonation + masjidkuDonation + fee;
  const navigate = useNavigate();

  const format = (n: number) =>
    `Rp ${new Intl.NumberFormat("id-ID").format(n)}`;

  // Memuat script Snap.js secara dinamis
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", "Mid-client-l1lXV0xwBLRhI_62");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Perbaikan error handling yang benar
  const handlePayment = async () => {
    const donationData = {
      donation_amount: total,
      donation_message: "Donasi test dari rendi",
      donation_name: "rendi",
      donation_email: "muhammadrizkisetyanto217@gmail.com",
      donation_masjid_id: "fdb6ae90-5900-42f0-a9b9-deb25bf438f2",
    };

    // 🐛 Debug: Log data yang akan dikirim
    console.log(
      "📤 Sending donation data:",
      JSON.stringify(donationData, null, 2)
    );
    console.log("🌐 API Base URL:", api.defaults.baseURL);
    console.log("📋 Request headers:", api.defaults.headers);

    try {
      // 🔍 Debug: Tambah explicit headers
      const response = await api.post("/public/donations", donationData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("✅ Response status:", response.status);
      console.log("📥 Response data:", response.data);

      if (response.status === 200) {
        const snapToken = response.data.snap_token;

        if (window.snap) {
          window.snap.pay(snapToken, {
            onSuccess: (result: any) => {
              console.log("💳 Payment success:", result);
              navigate("/donation-success");
            },
            onPending: (result: any) => {
              console.log("⏳ Payment pending:", result);
              alert("Pembayaran sedang diproses...");
            },
            onError: (result: any) => {
              console.log("❌ Payment error:", result);
              alert("Pembayaran gagal. Silakan coba lagi.");
            },
          });
        } else {
          alert("Payment system not ready. Please refresh the page.");
        }
      }
    } catch (error) {
      // 🐛 Debug: Log error detail lengkap
      console.error("🚨 Full error object:", error);

      if (axios.isAxiosError(error)) {
        console.log("📊 Error details:");
        console.log("- Status:", error.response?.status);
        console.log("- Status Text:", error.response?.statusText);
        console.log("- Response Data:", error.response?.data);
        console.log("- Request URL:", error.config?.url);
        console.log("- Request Method:", error.config?.method);
        console.log("- Request Headers:", error.config?.headers);
        console.log("- Request Data:", error.config?.data);

        if (error.response) {
          const errorMessage =
            error.response.data?.error ||
            error.response.data?.message ||
            "Server error";
          alert(`❌ Server Error (${error.response.status}): ${errorMessage}`);
        } else if (error.request) {
          console.error("🌐 Network error - no response:", error.request);
          alert("❌ Network Error: Tidak dapat terhubung ke server");
        } else {
          console.error("⚙️ Request setup error:", error.message);
          alert(`❌ Request Error: ${error.message}`);
        }
      } else {
        console.error("🤷 Unknown error:", error);
        alert("❌ Unknown Error");
      }
    }
  };

  // 🔍 Debug: Test koneksi API saat component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("🧪 Testing API connection...");
        const response = await api.get("/");
        console.log("✅ API connection test successful:", response.status);
      } catch (error) {
        console.error("❌ API connection test failed:", error);
      }
    };

    testConnection();
  }, []);

  return (
    <>
      <PageHeader
        title="Donasi Saya"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className="max-w-md mx-auto">
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
          <button
            onClick={handlePayment}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold"
          >
            Lanjut
          </button>
        </div>
      </div>
    </>
  );
};

export default MasjidDonationConfirmMasjid;
