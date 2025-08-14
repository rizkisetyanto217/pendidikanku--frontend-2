// @/pages/masjidku/financial/routes.jsx
import { Route } from "react-router-dom";
import SaldoAkhirPage from "./components/SaldoAkhirPage";
import PemasukanPage from "./components/PemasukanPage";
import PengeluaranPage from "./components/PengeluaranPage";

export const financeRoutes = [
  {
    path: "financial/saldo-akhir", // Hapus prefix /masjidku/
    element: <SaldoAkhirPage />,
  },
  {
    path: "financial/pemasukan",
    element: <PemasukanPage />,
  },
  {
    path: "financial/pengeluaran",
    element: <PengeluaranPage />,
  },
];
