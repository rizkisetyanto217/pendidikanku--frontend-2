// src/pages/pendaftaran/PendaftaranPage.tsx
import React, { useMemo } from "react";
import { ModalRegister } from "../components/RegisterModalUser";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

export default function RegisterDetailUser() {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  const styles = useMemo(
    () => ({
      pageBg: { backgroundColor: theme.white2 },
      card: {
        backgroundColor: theme.white1,
        borderColor: theme.white3,
        color: theme.black1,
      },
      title: { color: theme.black1 },
      subtitle: { color: theme.silver2 },
    }),
    [theme]
  );

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-6"
      style={styles.pageBg}
    >
      <div
        className="w-full max-w-3xl rounded-2xl shadow-sm ring-1 p-6"
        style={{
          backgroundColor: styles.card.backgroundColor,
          borderColor: styles.card.borderColor,
          color: styles.card.color,
        }}
      >
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={styles.title}
        >
          Pendaftaran Peserta Baru
        </h1>
        <p className="mt-2 text-sm md:text-base" style={styles.subtitle}>
          Silakan klik tombol di bawah untuk memulai proses pendaftaran.
        </p>

        <div className="mt-6">
          <ModalRegister
            slug="murid"
            onSubmit={async (payload) => {
              console.log("submit payload:", payload);
            }}
          />
        </div>
      </div>
    </div>
  );
}
