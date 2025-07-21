import React, { ReactNode } from "react";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";

type TabsProps = {
  tabs: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
};

export const Tabs = ({ tabs, value, onChange }: TabsProps) => {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div
      className="flex rounded-md overflow-hidden"
      style={{
        border: `1px solid ${theme.silver1}`,
        backgroundColor: theme.white2,
      }}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className="flex-1 px-4 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: isActive ? theme.white1 : theme.white2,
              color: isActive ? theme.black1 : theme.silver2,
              borderBottom: isActive ? `2px solid ${theme.primary}` : "none",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

type TabsContentProps = {
  value: string;
  children: ReactNode;
  current: string;
};

export const TabsContent = ({ value, children, current }: TabsContentProps) => {
  return value === current ? <div className="mt-4">{children}</div> : null;
};
