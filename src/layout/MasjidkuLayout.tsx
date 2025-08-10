import { Outlet } from "react-router-dom";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import BottomNavbar from "@/components/common/public/ButtonNavbar";

export default function MasjidkuLayout() {
  return (
    <div className="min-h-screen flex flex-col">
     
      <main className="flex-1 w-full max-w-2xl mx-auto px-4">
        <Outlet /> {/* semua halaman public akan ditampilkan di sini */}
      </main>
      {/* <BottomNavbar /> */}
    </div>
  );
}