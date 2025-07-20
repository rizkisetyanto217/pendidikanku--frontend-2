import React, { ReactNode } from "react";

type TabsProps = {
  tabs: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
};

export const Tabs = ({ tabs, value, onChange }: TabsProps) => {
  return (
    <div className="flex border rounded-md overflow-hidden">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-all
            ${
              value === tab.value
                ? "bg-white text-black dark:bg-zinc-900 dark:text-white border-b-2 border-primary"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
        >
          {tab.label}
        </button>
      ))}
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
