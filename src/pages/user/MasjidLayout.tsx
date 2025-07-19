import { Outlet } from "react-router-dom";

export default function MasjidLayout() {
  return (
    <div className="w-full min-h-screen bg-gray-50 px-4 md:px-6 py-4 md:py-6">
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <Outlet />
      </div>
    </div>
  );
}
