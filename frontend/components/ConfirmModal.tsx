"use client";

import { AlertTriangle, X } from "lucide-react";
import { ReactNode } from "react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: "primary" | "danger";
  loading?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "primary",
  loading = false,
  children,
  onConfirm,
  onClose
}: ConfirmModalProps) {
  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "border-red-700 bg-red-700 text-white hover:bg-red-800"
      : "border-red-700 bg-red-700 text-white hover:bg-red-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label={cancelLabel}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <section className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone === "danger" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"}`}>
            <AlertTriangle size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {children && <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">{children}</div>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${confirmClass}`}>
            {loading ? `${confirmLabel}...` : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
