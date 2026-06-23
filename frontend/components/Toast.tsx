"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

type ToastProps = {
  open: boolean;
  message: string;
  onClose: () => void;
};

export function Toast({ open, message, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, 3600);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed right-4 top-4 z-[60] w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl sm:right-6 sm:top-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <CheckCircle2 size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">{message}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
