import AppRoutes from "@/routes/IndexRoute";
import { Toaster } from "react-hot-toast";
import "./index.css";
import ScrollToTop from "./components/common/home/ScroolToTop";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function App() {
  // ⬇️ Trigger sekali di awal load
  useCurrentUser();

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
