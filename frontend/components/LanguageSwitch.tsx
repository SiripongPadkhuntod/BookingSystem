"use client";

import { Languages } from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n";

const languages: Language[] = ["th", "en"];

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-600">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400" title="Language">
        <Languages size={16} />
      </span>
      {languages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={`h-8 rounded-lg px-3 uppercase transition ${
            language === item ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50"
          }`}
          aria-pressed={language === item}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
