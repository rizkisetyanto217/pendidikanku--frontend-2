import SemuaJadwal from "./dashboard/SemuaJadwal";
import SemuaPengumuman from "./dashboard/SemuaPengumuman";
import SemuaTagihan from "./dashboard/SemuaTagihan";
import TryoutUjianTahfiz from "./dashboard/TryoutUjianTahfizh";

// Route sekarang bisa langsung:
export const schoolRoutes = [
  {
    path: "semua-jadwal",
    element: <SemuaJadwal />,
  },
  {
    path: "semua-tagihan",
    element: <SemuaTagihan />,
  },
  {
    path: "tryout-ujian-tahfizh",
    element: <TryoutUjianTahfiz />,
  },
  {
    path: "semua-pengumuman",
    element: <SemuaPengumuman />,
  },
];
