"use client";

import { Languages } from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n";

const languages: Language[] = ["th", "en"];

export function LanguageSwitch({ variant = "default" }: { variant?: "default" | "dark" }) {
  const { language, setLanguage } = useLanguage();

  const containerClass = variant === "dark" 
    ? "inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/80 p-1 text-xs font-medium text-slate-200"
    : "inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-xs font-medium text-slate-700";

  const iconClass = variant === "dark" ? "text-slate-400" : "text-slate-500";
  const getButtonClass = (item: Language) => {
    if (variant === "dark") {
      return language === item 
        ? "bg-white text-slate-900" 
        : "text-slate-400 hover:text-white";
    }
    return language === item 
      ? "bg-slate-900 text-white" 
      : "text-slate-500 hover:text-slate-900";
  };

  return (
    <div className={containerClass}>
      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${iconClass}`} title="Language">
        <Languages size={14} />
      </span>
      {languages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={`h-6 rounded-md px-2 uppercase transition ${getButtonClass(item)}`}
          aria-pressed={language === item}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
