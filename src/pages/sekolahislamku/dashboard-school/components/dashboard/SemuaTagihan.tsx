// src/pages/sekolahislamku/tagihan/SemuaTagihan.tsx
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {

  SectionCard,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";

import  ParentTopBar  from "@/pages/sekolahislamku/components/home/StudentTopBar";
import SchoolSidebarNav from "@/pages/sekolahislamku/components/home/SchoolSideBarNav";
export default function SemuaTagihan() {
  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;

  // Data dummy tagihan
  const tagihanList = [
    { id: 1, nama: "SPP Bulan Agustus", jumlah: 150000 },
    { id: 2, nama: "TPA Bulan Agustus", jumlah: 100000 },
    { id: 3, nama: "Uang Kegiatan", jumlah: 50000 },
  ];

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      {/* Top Bar */}
      <ParentTopBar
        palette={palette}
        gregorianDate={new Date().toISOString()}
        title="Semua Tagihan"
      />

      {/* Content + Sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Sidebar kiri */}
          <SchoolSidebarNav palette={palette} />

          {/* Konten utama */}
          <div className="flex-1 space-y-6">
            <SectionCard palette={palette} className="p-3 md:p-4">
              <div
                className="overflow-x-auto rounded-xl overflow-hidden border"
                style={{ borderColor: palette.silver1 }}
              >
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr
                      style={{
                        background: palette.white1,
                        borderBottom: `1px solid ${palette.silver1}`,
                      }}
                    >
                      <th
                        className="p-2 text-left border"
                        style={{ borderColor: palette.silver1 }}
                      >
                        No
                      </th>
                      <th
                        className="p-2 text-left border"
                        style={{ borderColor: palette.silver1 }}
                      >
                        Nama Tagihan
                      </th>
                      <th
                        className="p-2 text-left border"
                        style={{ borderColor: palette.silver1 }}
                      >
                        Jumlah (Rp)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tagihanList.map((tagihan, index) => (
                      <tr
                        key={tagihan.id}
                        style={{
                          background:
                            index % 2 === 0 ? palette.white1 : palette.white2,
                        }}
                      >
                        <td
                          className="p-2 border"
                          style={{ borderColor: palette.silver1 }}
                        >
                          {index + 1}
                        </td>
                        <td
                          className="p-2 border"
                          style={{ borderColor: palette.silver1 }}
                        >
                          {tagihan.nama}
                        </td>
                        <td
                          className="p-2 border"
                          style={{ borderColor: palette.silver1 }}
                        >
                          {tagihan.jumlah.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}
