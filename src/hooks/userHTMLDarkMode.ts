import { useState, useEffect } from "react";

export default function useHtmlDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  useEffect(() => {
    const html = document.documentElement;

    const savedTheme = localStorage.getItem("theme");
    const prefersDark =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Sinkronisasi class di <html>
    if (prefersDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    // Update state jika class berubah
    const updateIsDark = () => {
      setIsDark(html.classList.contains("dark"));
    };

    const observer = new MutationObserver(updateIsDark);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    // Set state awal setelah perubahan class dilakukan
    updateIsDark();

    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleDark = () => {
    const html = document.documentElement;
    const newDark = !html.classList.contains("dark");
    html.classList.toggle("dark", newDark);
    setIsDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  const setDarkMode = (value: boolean) => {
    const html = document.documentElement;
    html.classList.toggle("dark", value);
    setIsDark(value);
    localStorage.setItem("theme", value ? "dark" : "light");
  };

  return { isDark, toggleDark, setDarkMode };
}
