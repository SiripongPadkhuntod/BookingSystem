"use client";

import { Languages } from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n";

const languages: Language[] = ["th", "en"];

export function LanguageSwitch({ variant = "default" }: { variant?: "default" | "dark" }) {
  const { language, setLanguage } = useLanguage();

  const containerClass = variant === "dark" 
    ? "inline-flex items-center gap-1 rounded-xl bg-slate-900/40 p-1 text-sm font-semibold text-slate-300 backdrop-blur-md"
    : "inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-600";

  const iconClass = variant === "dark" ? "text-slate-400" : "text-slate-400";
  const getButtonClass = (item: Language) => {
    if (variant === "dark") {
      return language === item 
        ? "bg-slate-700/80 text-white" 
        : "text-slate-400 hover:bg-slate-800/50";
    }
    return language === item 
      ? "bg-slate-950 text-white" 
      : "text-slate-500 hover:bg-slate-50";
  };

  return (
    <div className={containerClass}>
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`} title="Language">
        <Languages size={16} />
      </span>
      {languages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={`h-8 rounded-lg px-3 uppercase transition ${getButtonClass(item)}`}
          aria-pressed={language === item}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
