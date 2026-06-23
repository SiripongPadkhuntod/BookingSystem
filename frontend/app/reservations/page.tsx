"use client";

import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ConfirmModal";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import type { Reservation } from "@/lib/types";
import { CalendarX, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

export default function ReservationsPage() {
  const { t } = useLanguage();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    setLoading(true);
    api.myReservations().then(setReservations).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async () => {
    if (!cancelTarget) return;
    setMessage("");
    setCancelling(true);
    try {
      await api.cancelReservation(cancelTarget.id);
      setMessage(t.cancelled);
      setCancelTarget(null);
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.cancelFailed);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-red-700">{t.reservations}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{t.myReservationsTitle}</h1>
            <p className="mt-2 text-sm text-slate-600">{t.myReservationsDescription}</p>
          </div>
          <button onClick={load} className="button-secondary flex items-center justify-center gap-2 px-4 py-3">
            <RefreshCcw size={18} />
            {t.refresh}
          </button>
        </div>

        {message && <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div>}

        <section className="card overflow-hidden">
          <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
            <div>{t.date}</div>
            <div>{t.time}</div>
            <div>{t.room}</div>
            <div>{t.seat}</div>
            <div className="text-right">{t.manage}</div>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-500">{t.loading}...</div>
          ) : reservations.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <CalendarX className="mx-auto mb-3 text-slate-400" />
              {t.emptyReservations}
            </div>
          ) : (
            reservations.map((reservation) => (
              <div key={reservation.id} className="grid grid-cols-5 items-center border-b border-slate-100 px-4 py-4 text-sm last:border-b-0">
                <div className="font-medium text-slate-900">{reservation.date.slice(0, 10)}</div>
                <div className="text-slate-600">{reservation.startTime}-{reservation.endTime}</div>
                <div className="text-slate-600">{reservation.room?.name ?? reservation.roomId}</div>
                <div className="font-semibold text-slate-900">{reservation.seat?.label ?? reservation.seatId}</div>
                <div className="text-right">
                  <button onClick={() => setCancelTarget(reservation)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                    {t.cancel}
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <ConfirmModal
          open={Boolean(cancelTarget)}
          title={t.confirmCancelTitle}
          description={t.confirmCancelDescription}
          confirmLabel={t.cancelReservation}
          cancelLabel={t.back}
          tone="danger"
          loading={cancelling}
          onConfirm={cancel}
          onClose={() => {
            if (!cancelling) setCancelTarget(null);
          }}
        >
          {cancelTarget && (
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">{t.date}</dt>
                <dd className="font-semibold text-slate-950">{cancelTarget.date.slice(0, 10)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">{t.time}</dt>
                <dd className="font-semibold text-slate-950">{cancelTarget.startTime}-{cancelTarget.endTime}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">{t.room}</dt>
                <dd className="font-semibold text-slate-950">{cancelTarget.room?.name ?? cancelTarget.roomId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">{t.seat}</dt>
                <dd className="font-semibold text-slate-950">{cancelTarget.seat?.label ?? cancelTarget.seatId}</dd>
              </div>
            </dl>
          )}
        </ConfirmModal>
      </div>
    </AppShell>
  );
}
