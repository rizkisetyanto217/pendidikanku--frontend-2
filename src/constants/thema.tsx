// src/constants/colorsThema.ts
export type ThemeName = "default" | "sunrise" | "midnight";

export type Palette = {
  primary: string;
  primary2: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  success1: string;
  success2: string;
  white1: string;
  white2: string;
  white3: string;
  black1: string;
  black2: string;
  error1: string;
  error2: string;
  warning1: string;
  silver1: string;
  silver2: string;
  silver4: string;
  specialColor: string;
};

export type ThemeVariant = { light: Palette; dark: Palette };

// ===== DEFAULT =====
const defaultLight: Palette = {
  primary: "#007074",
  primary2: "#0070741F",
  secondary: "#769596",
  tertiary: "#A3DADB",
  quaternary: "#229CC8",
  success1: "#57B236",
  success2: "#E1FFF8",
  white1: "#FFFFFF",
  white2: "#FAFAFA",
  white3: "#EEEEEE",
  black1: "#222222",
  black2: "#333333",
  error1: "#D1403F",
  error2: "#FFEDE7",
  warning1: "#F59D09",
  silver1: "#DDDDDD",
  silver2: "#888888",
  silver4: "#4B4B4B",
  specialColor: "#FFCC00",
};
const defaultDark: Palette = {
  primary: "#007074",
  primary2: "#00707433",
  secondary: "#5A7070",
  tertiary: "#75C4C4",
  quaternary: "#1D7CA5",
  success1: "#3D8A2A",
  success2: "#143A37",
  white1: "#1C1C1C",
  white2: "#2A2A2A",
  white3: "#3A3A3A",
  black1: "#EAEAEA",
  black2: "#CCCCCC",
  error1: "#C53030",
  error2: "#331111",
  warning1: "#B86B00",
  silver1: "#555555",
  silver2: "#AAAAAA",
  silver4: "#B0B0B0",
  specialColor: "#FFD700",
};

// ===== SUNRISE =====
const sunriseLight: Palette = {
  primary: "#F97316",
  primary2: "#F9731633",
  secondary: "#F59E0B",
  tertiary: "#FDBA74",
  quaternary: "#FBBF24",
  success1: "#22C55E",
  success2: "#DCFCE7",
  white1: "#FFF7ED",
  white2: "#FFEEDD",
  white3: "#FDE68A",
  black1: "#2A2A2A",
  black2: "#3B3B3B",
  error1: "#DC2626",
  error2: "#FECACA",
  warning1: "#F59E0B",
  silver1: "#E8E2DA",
  silver2: "#938C84",
  silver4: "#6B635B",
  specialColor: "#FFD27A",
};
const sunriseDark: Palette = {
  primary: "#FDBA74",
  primary2: "#FDBA7433",
  secondary: "#F59E0B",
  tertiary: "#F97316",
  quaternary: "#FB923C",
  success1: "#34D399",
  success2: "#0B3A2A",
  white1: "#161311",
  white2: "#201A16",
  white3: "#2B221B",
  black1: "#F5F2EE",
  black2: "#E2D9D0",
  error1: "#F87171",
  error2: "#3A1414",
  warning1: "#F59E0B",
  silver1: "#5A4F46",
  silver2: "#B9A89A",
  silver4: "#CAB6A4",
  specialColor: "#FFD27A",
};

// ===== MIDNIGHT =====
const midnightLight: Palette = {
  primary: "#1E3A8A",
  primary2: "#1E3A8A33",
  secondary: "#3B82F6",
  tertiary: "#60A5FA",
  quaternary: "#7C3AED",
  success1: "#10B981",
  success2: "#E7FFF1",
  white1: "#F7FAFC",
  white2: "#EEF2F7",
  white3: "#E6EAF0",
  black1: "#1A2230",
  black2: "#2A3446",
  error1: "#DC2626",
  error2: "#FFE8E8",
  warning1: "#F59E0B",
  silver1: "#D6DFEA",
  silver2: "#91A0B6",
  silver4: "#5C6B83",
  specialColor: "#8AB4F8",
};
const midnightDark: Palette = {
  primary: "#0B1220",
  primary2: "#0B122033",
  secondary: "#1E40AF",
  tertiary: "#312E81",
  quaternary: "#6D28D9",
  success1: "#10B981",
  success2: "#06281E",
  white1: "#0C1018",
  white2: "#121926",
  white3: "#172132",
  black1: "#E6EDF7",
  black2: "#C6D1E4",
  error1: "#F87171",
  error2: "#31141A",
  warning1: "#D97706",
  silver1: "#2B3447",
  silver2: "#8A99B4",
  silver4: "#A8B4CC",
  specialColor: "#7AA2F7",
};

export const colors: Record<ThemeName, ThemeVariant> = {
  default: { light: defaultLight, dark: defaultDark },
  sunrise: { light: sunriseLight, dark: sunriseDark },
  midnight: { light: midnightLight, dark: midnightDark },
};

// helper optional
export function pickTheme(themeName: ThemeName, isDark: boolean): Palette {
  const v = colors[themeName] ?? colors.default;
  return isDark ? v.dark : v.light;
}
