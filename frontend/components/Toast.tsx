"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

type Tone = "success" | "error";

type ToastProps = {
  open: boolean;
  message: string;
  tone?: Tone;
  onClose: () => void;
};

type ToastItem = {
  id: string;
  message: string;
  tone: Tone;
  isLeaving: boolean;
};

export function Toast({ open, message, tone = "success", onClose }: ToastProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (open && message) {
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((prev) => {
        // limit to max 3, new ones on top
        return [{ id, message, tone, isLeaving: false }, ...prev].slice(0, 3);
      });
      
      // Consume the message immediately
      onClose();

      // Auto dismiss after 3 seconds
      setTimeout(() => {
        dismissToast(id);
      }, 3000);
    }
  }, [open, message, tone, onClose]);

  const dismissToast = (id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isLeaving: true } : t))
    );
    // Remove from state after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[60] flex flex-col gap-3 sm:right-6 sm:top-6 pointer-events-none">
      {toasts.map((t) => {
        const isError = t.tone === "error";
        return (
          <div
            key={t.id}
            className={`pointer-events-auto w-[calc(100vw-2rem)] max-w-sm rounded-2xl border bg-white p-4 shadow-2xl transition-all duration-300 ease-in-out ${
              isError ? "border-red-200" : "border-emerald-200"
            } ${
              t.isLeaving ? "translate-x-[120%] opacity-0" : "animate-slide-in"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {isError ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
