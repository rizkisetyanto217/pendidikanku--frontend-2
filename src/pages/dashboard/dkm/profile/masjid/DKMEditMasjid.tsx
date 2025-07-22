import React from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode"; // asumsi kamu punya hook ini
import { colors } from "@/constants/colorsThema";
import PageHeader from "@/components/common/home/PageHeaderDashboard";

export default function DKMEditMasjid() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div
      className="max-w-5xl mx-auto lg:p-6 rounded-2xl"
      style={{
        backgroundColor: theme.white1,
        borderColor: theme.silver1,
      }}
    >
      <PageHeader title="Sosial Media Masjid" backTo="/dkm/profil-masjid" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Masjid */}
        <div>
          <label
            className="block mb-2 text-sm font-medium"
            style={{ color: theme.black1 }}
          >
            Nama Masjid
          </label>
          <input
            type="text"
            placeholder="Masukan nama masjid"
            className="w-full rounded-lg border px-4 py-2 text-sm"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver1,
              color: theme.black1,
            }}
          />
        </div>

        {/* Tentang Masjid */}
        <div>
          <label
            className="block mb-2 text-sm font-medium"
            style={{ color: theme.black1 }}
          >
            Tentang ( Maksimal 30 kata )
          </label>
          <textarea
            placeholder="Masukan tentang masjid"
            rows={4}
            className="w-full rounded-lg border px-4 py-2 text-sm"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver1,
              color: theme.black1,
            }}
          />
        </div>

        {/* Gambar Masjid */}
        <div>
          <label
            className="block mb-2 text-sm font-medium"
            style={{ color: theme.black1 }}
          >
            Profil Masjid Gambar
          </label>
          <p className="text-sm mb-2" style={{ color: theme.silver2 }}>
            File yang diizinkan berbentuk .png dan .jpg
          </p>
          <div
            className="w-full h-40 border-2 border-dashed rounded-lg flex items-center justify-center text-center text-sm cursor-pointer"
            style={{
              color: theme.silver2,
              borderColor: theme.silver1,
              backgroundColor: isDark ? theme.white2 : "#F9FAFB",
            }}
          >
            Click to browse or drag and drop your files
          </div>
        </div>

        {/* Alamat */}
        <div>
          <label
            className="block mb-2 text-sm font-medium"
            style={{ color: theme.black1 }}
          >
            Alamat
          </label>
          <textarea
            placeholder="Masukan alamat"
            rows={4}
            className="w-full rounded-lg border px-4 py-2 text-sm"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver1,
              color: theme.black1,
            }}
          />
        </div>

        {/* Link Maps */}
        <div className="md:col-span-2">
          <label
            className="block mb-2 text-sm font-medium"
            style={{ color: theme.black1 }}
          >
            Link Alamat Google Maps (Jika ada)
          </label>
          <input
            type="text"
            placeholder="Masukan link maps"
            className="w-full rounded-lg border px-4 py-2 text-sm"
            style={{
              backgroundColor: theme.white2,
              borderColor: theme.silver1,
              color: theme.black1,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-sm" style={{ color: theme.silver2 }}>
          Butuh dibuatkan Logo, Profil dan Stempel Masjid?
        </p>
        <button
          className="px-6 py-2 text-white rounded-lg text-sm"
          style={{
            backgroundColor: theme.primary,
            color: "#fff",
          }}
        >
          Simpan Data
        </button>
      </div>
    </div>
  );
}
