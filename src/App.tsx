// src/App.tsx
import AppRoutes from "@/routes/IndexRoute";
import { Toaster } from "react-hot-toast";
import "./index.css";
import ScrollToTop from "./components/common/home/ScroolToTop";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// ⬇️ Import ThemeProvider
import { ThemeProvider } from "@/hooks/themeContext";

function App() {
  // ⬇️ Trigger sekali di awal load (prefetch user)
  useCurrentUser();

  return (
    <ThemeProvider>
      <ScrollToTop />
      <AppRoutes />
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
