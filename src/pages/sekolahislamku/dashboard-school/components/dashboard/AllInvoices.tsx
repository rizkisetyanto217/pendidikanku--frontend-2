// src/pages/sekolahislamku/tagihan/AllInvoices.tsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import {
  SectionCard,
  Btn,
  type Palette,
} from "@/pages/sekolahislamku/components/ui/Primitives";
import ParentTopBar from "@/pages/sekolahislamku/components/home/ParentTopBar";
import ParentSidebar from "@/pages/sekolahislamku/components/home/ParentSideBar";
import axios from "@/lib/axios";
import { ArrowLeft } from "lucide-react";

/* ===== Types ===== */
type BillItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // ISO
  status: "unpaid" | "paid" | "overdue";
};

type LocationState = {
  bills?: BillItem[];
  heading?: string;
};

/* ===== Small UI ===== */
interface Tagihan {
  id: string;
  nama: string;
  jumlah: number;
  status: "Lunas" | "Belum Lunas";
  tanggalJatuhTempo: string;
}

function toTagihan(b: BillItem): Tagihan {
  return {
    id: b.id,
    nama: b.title,
    jumlah: b.amount,
    status: b.status === "paid" ? "Lunas" : "Belum Lunas",
    tanggalJatuhTempo: new Date(b.dueDate).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  };
}

const TableHeader = ({ palette }: { palette: Palette }) => (
  <thead>
    <tr
      style={{
        background: palette.white1,
        borderBottom: `2px solid ${palette.silver1}`,
      }}
    >
      <th
        className="p-3 text-center border font-semibold"
        style={{ borderColor: palette.silver1 }}
      >
        No
      </th>
      <th
        className="p-3 text-left border font-semibold"
        style={{ borderColor: palette.silver1 }}
      >
        Nama Tagihan
      </th>
      <th
        className="p-3 text-right border font-semibold"
        style={{ borderColor: palette.silver1 }}
      >
        Jumlah
      </th>
      <th
        className="p-3 text-center border font-semibold"
        style={{ borderColor: palette.silver1 }}
      >
        Status
      </th>
      <th
        className="p-3 text-center border font-semibold"
        style={{ borderColor: palette.silver1 }}
      >
        Jatuh Tempo
      </th>
    </tr>
  </thead>
);

const Row = ({
  tagihan,
  index,
  palette,
}: {
  tagihan: Tagihan;
  index: number;
  palette: Palette;
}) => (
  <tr style={{ background: index % 2 === 0 ? palette.white1 : palette.white2 }}>
    <td
      className="p-3 border text-center"
      style={{ borderColor: palette.silver1 }}
    >
      {index + 1}
    </td>
    <td
      className="p-3 border font-medium"
      style={{ borderColor: palette.silver1 }}
    >
      {tagihan.nama}
    </td>
    <td
      className="p-3 border text-right font-semibold"
      style={{ borderColor: palette.silver1 }}
    >
      Rp {tagihan.jumlah.toLocaleString("id-ID")}
    </td>
    <td
      className="p-3 border text-center"
      style={{ borderColor: palette.silver1 }}
    >
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          tagihan.status === "Lunas"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {tagihan.status}
      </span>
    </td>
    <td
      className="p-3 border text-center"
      style={{ borderColor: palette.silver1 }}
    >
      {tagihan.tanggalJatuhTempo}
    </td>
  </tr>
);

const Total = ({ data, palette }: { data: Tagihan[]; palette: Palette }) => {
  const totalBelum = data
    .filter((d) => d.status !== "Lunas")
    .reduce((n, d) => n + d.jumlah, 0);
  const totalSemua = data.reduce((n, d) => n + d.jumlah, 0);
  return (
    <SectionCard palette={palette} className="p-4">
      <h3 className="text-lg font-semibold mb-3">Ringkasan Tagihan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          className="text-start p-3 rounded-lg"
          style={{ background: palette.white1 }}
        >
          <p className="text-sm opacity-70">Total Tagihan</p>
          <p className="text-xl font-bold">
            Rp {totalSemua.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-red-50">
          <p className="text-sm text-red-600">Belum Lunas</p>
          <p className="text-xl font-bold text-red-700">
            Rp {totalBelum.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg">
          <p className="text-sm opacity-70">Jumlah Tagihan</p>
          <p className="text-xl font-bold">{data.length} item</p>
        </div>
      </div>
    </SectionCard>
  );
};

/* ===== Page ===== */
export default function AllInvoices() {
  const { isDark } = useHtmlDarkMode();
  const palette = (isDark ? colors.dark : colors.light) as Palette;
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();

  // Ambil dari state (yang dikirim BillsSectionCard). Kalau kosong, boleh fetch API sendiri.
  // NOTE: kalau butuh fetch beneran, ganti endpoint di bawah ini sesuai backend kamu.
  const bills: BillItem[] = state?.bills ?? [];

  // OPTIONAL fallback (kalau user langsung buka URL tanpa lewat dashboard)
  // const { data: fetched } = useQuery({
  //   queryKey: ["all-bills"],
  //   queryFn: async () => {
  //     const res = await axios.get<{ data: BillItem[] }>("/api/a/finance/outstanding-bills", { withCredentials: true });
  //     return res.data?.data ?? [];
  //   },
  //   enabled: bills.length === 0,
  //   staleTime: 60_000,
  // });
  // const source = bills.length ? bills : (fetched ?? []);

  const source = bills; // pakai state dulu

  const tagihanList: Tagihan[] = useMemo(() => source.map(toTagihan), [source]);
  const currentDate = new Date().toISOString();

  return (
    <div
      className="min-h-screen w-full transition-colors duration-200"
      style={{ background: palette.white2, color: palette.black1 }}
    >
      <ParentTopBar
        palette={palette}
        gregorianDate={currentDate}
        title={state?.heading ?? "Semua Tagihan"}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="lg:flex lg:items-start lg:gap-6">
          <div className="lg:w-64 mb-6 lg:mb-0">
            <ParentSidebar palette={palette} />
          </div>

          <div className="flex-1 space-y-6">
            <ArrowLeft onClick={() => navigate(-1)} className="font-boldd cursor-pointer" />

            <Total data={tagihanList} palette={palette} />

            <SectionCard palette={palette} className="p-0 overflow-hidden">
              <div
                className="p-4 border-b"
                style={{ borderColor: palette.silver1 }}
              >
                <h2 className="text-xl font-semibold">Daftar Tagihan</h2>
                <p className="text-sm opacity-70 mt-1">
                  Berikut adalah daftar semua tagihan sekolah
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <TableHeader palette={palette} />
                  <tbody>
                    {tagihanList.length > 0 ? (
                      tagihanList.map((t, i) => (
                        <Row
                          key={t.id}
                          tagihan={t}
                          index={i}
                          palette={palette}
                        />
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center opacity-60"
                          style={{ borderColor: palette.silver1 }}
                        >
                          Tidak ada tagihan yang ditemukan
                        </td>
                      </tr>
                    )}
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
