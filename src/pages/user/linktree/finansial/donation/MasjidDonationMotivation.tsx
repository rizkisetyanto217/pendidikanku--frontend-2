import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

export default function MasjidDonationMotivation() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    contact: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      {/* Header */}
      <div className="px-4 py-6 space-y-2">
        <h1 className="text-lg font-semibold">Pesan dan Motivasi</h1>
        <p className="text-sm font-medium text-green-600">
          Alhamdulillah donasi berhasil
        </p>
        <p className="text-sm">
          Jazaakumullah khair semoga dibalas dengan yang lebih baik lagi oleh
          Allah ta'ala. Mohon lengkapi data berikut{" "}
          <span className="italic">(opsional)</span>.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4 px-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Nama Donatur</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Cth: Ahmad, Hamba Allah"
            className="w-full border rounded-md px-3 py-2 text-sm"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver2,
              color: theme.black1,
            }}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Email/No. Whatsapp
          </label>
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="Masukkan bidang"
            className="w-full border rounded-md px-3 py-2 text-sm"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver2,
              color: theme.black1,
            }}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Pesan Nasihat / Motivasi
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Masukan sambutan"
            className="w-full border rounded-md px-3 py-2 text-sm"
            rows={4}
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver2,
              color: theme.black1,
            }}
          />
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 flex items-center gap-3 bg-white border-t dark:bg-black dark:border-zinc-800">
        <button
          onClick={() => {
            // TODO: handle upload bukti transfer
            alert("Fitur upload bukti transfer coming soon");
          }}
          className="flex-1 py-2 rounded-md text-sm font-medium"
          style={{
            backgroundColor: theme.white2,
            color: theme.black1,
            border: `1px solid ${theme.silver1}`,
          }}
        >
          Bukti Transfer
        </button>

        <button
          onClick={() => {
            // Simpan dan lanjut
            console.log("Form dikirim:", form);
            navigate("/masjid/slug/selesai"); // Ganti sesuai alur final
          }}
          className="p-3 rounded-md"
          style={{ backgroundColor: theme.primary }}
        >
          <span className="text-white text-xl">➤</span>
        </button>
      </div>
    </div>
  );
}
