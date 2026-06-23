"use client";

import { AppShell } from "@/components/AppShell";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Toast } from "@/components/Toast";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { todayISO } from "@/lib/time";
import type { Reservation, Room } from "@/lib/types";
import { CalendarX, RefreshCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ViewMode = "mine" | "browse";
type PeriodMode = "day" | "week" | "month";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthValue(value: string) {
  return value.slice(0, 7);
}

function weekRange(value: string) {
  const base = new Date(`${value}T00:00:00`);
  const day = base.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(base);
  start.setDate(base.getDate() + mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

function ReservationTable({
  reservations,
  loading,
  emptyLabel,
  actionLabel,
  onCancel
}: {
  reservations: Reservation[];
  loading: boolean;
  emptyLabel: string;
  actionLabel?: string;
  onCancel?: (reservation: Reservation) => void;
}) {
  const { t } = useLanguage();

  return (
    <section className="card overflow-hidden">
      <div className="hidden grid-cols-6 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 md:grid dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-300">
        <div>{t.date}</div>
        <div>{t.time}</div>
        <div>{t.room}</div>
        <div>{t.seat}</div>
        <div>{t.bookedBy}</div>
        <div className="text-right">{t.manage}</div>
      </div>
      {loading ? (
        <div className="p-8 text-center text-slate-500">{t.loading}...</div>
      ) : reservations.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <CalendarX className="mx-auto mb-3 text-slate-400" />
          {emptyLabel}
        </div>
      ) : (
        reservations.map((reservation) => (
          <div key={reservation.id} className="grid gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0 md:grid-cols-6 md:items-center dark:border-slate-700/30">
            <div>
              <span className="text-xs font-semibold text-slate-400 md:hidden dark:text-slate-500">{t.date}</span>
              <div className="font-medium text-slate-900 dark:text-slate-100">{reservation.date.slice(0, 10)}</div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 md:hidden dark:text-slate-500">{t.time}</span>
              <div className="text-slate-600 dark:text-slate-400">{reservation.startTime}-{reservation.endTime}</div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 md:hidden dark:text-slate-500">{t.room}</span>
              <div className="text-slate-600 dark:text-slate-400">{reservation.room?.name ?? reservation.roomId}</div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 md:hidden dark:text-slate-500">{t.seat}</span>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{reservation.seat?.label ?? reservation.seatId}</div>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 md:hidden dark:text-slate-500">{t.bookedBy}</span>
              <div className="truncate text-slate-600 dark:text-slate-400">
                {reservation.user ? (reservation.user.displayName || `${reservation.user.firstName} ${reservation.user.lastName}`) : "-"}
              </div>
            </div>
            <div className="text-right">
              {onCancel && actionLabel ? (
                <button onClick={() => onCancel(reservation)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                  {actionLabel}
                </button>
              ) : (
                <span className="text-slate-400">-</span>
              )}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

export default function ReservationsPage() {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<ViewMode>("mine");
  const [periodMode, setPeriodMode] = useState<PeriodMode>("day");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [periodDate, setPeriodDate] = useState(todayISO());
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [browseReservations, setBrowseReservations] = useState<Reservation[]>([]);
  const [myLoading, setMyLoading] = useState(true);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const periodLabel = useMemo(() => {
    if (periodMode === "month") return monthValue(periodDate);
    if (periodMode === "week") {
      const range = weekRange(periodDate);
      return `${range.startDate} - ${range.endDate}`;
    }
    return periodDate;
  }, [periodDate, periodMode]);

  const loadMine = () => {
    setMyLoading(true);
    api.myReservations().then(setMyReservations).finally(() => setMyLoading(false));
  };

  const loadBrowse = () => {
    setBrowseLoading(true);
    const params = new URLSearchParams();
    if (roomId) params.set("roomId", roomId);
    if (periodMode === "day") params.set("date", periodDate);
    if (periodMode === "week") {
      const range = weekRange(periodDate);
      params.set("startDate", range.startDate);
      params.set("endDate", range.endDate);
    }
    if (periodMode === "month") params.set("month", monthValue(periodDate));
    api.reservations(params).then(setBrowseReservations).finally(() => setBrowseLoading(false));
  };

  useEffect(() => {
    loadMine();
    api.rooms().then((data) => {
      setRooms(data);
      setRoomId(data[0]?.id ?? "");
    });
  }, []);

  useEffect(() => {
    if (activeView === "browse") loadBrowse();
  }, [activeView, periodDate, periodMode, roomId]);

  const cancel = async () => {
    if (!cancelTarget) return;
    setMessage("");
    setCancelling(true);
    try {
      await api.cancelReservation(cancelTarget.id);
      setToastMessage(t.cancelled);
      setCancelTarget(null);
      loadMine();
      if (activeView === "browse") loadBrowse();
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
            <p className="text-sm font-semibold text-red-700 dark:text-red-500">{t.reservations}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{t.reservationsTitle}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t.reservationsDescription}</p>
          </div>
          <button onClick={activeView === "mine" ? loadMine : loadBrowse} className="button-secondary flex items-center justify-center gap-2 px-4 py-3">
            <RefreshCcw size={18} />
            {t.refresh}
          </button>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
          {[
            { value: "mine", label: t.myReservationsTab },
            { value: "browse", label: t.browseReservationsTab }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveView(item.value as ViewMode)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeView === item.value ? "bg-slate-950 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {message && <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div>}

        {activeView === "browse" && (
          <section className="card p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{t.room}</span>
                <select className="field px-3 py-3" value={roomId} onChange={(event) => setRoomId(event.target.value)}>
                  <option value="">{t.allRooms}</option>
                  {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{t.viewBy}</span>
                <select className="field px-3 py-3" value={periodMode} onChange={(event) => setPeriodMode(event.target.value as PeriodMode)}>
                  <option value="day">{t.day}</option>
                  <option value="week">{t.week}</option>
                  <option value="month">{t.month}</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{periodMode === "month" ? t.month : t.date}</span>
                <input
                  className="field px-3 py-3"
                  type={periodMode === "month" ? "month" : "date"}
                  value={periodMode === "month" ? monthValue(periodDate) : periodDate}
                  onChange={(event) => setPeriodDate(periodMode === "month" ? `${event.target.value}-01` : event.target.value)}
                />
              </label>
              <button onClick={loadBrowse} className="button-primary flex items-center justify-center gap-2 px-4 py-3">
                <Search size={18} />
                {t.search}
              </button>
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-400">
              {t.showing}: <span className="font-semibold text-slate-950 dark:text-slate-200">{periodLabel}</span>
            </div>
          </section>
        )}

        {activeView === "mine" ? (
          <ReservationTable
            reservations={myReservations}
            loading={myLoading}
            emptyLabel={t.emptyReservations}
            actionLabel={t.cancel}
            onCancel={setCancelTarget}
          />
        ) : (
          <ReservationTable
            reservations={browseReservations}
            loading={browseLoading}
            emptyLabel={t.emptyBrowseReservations}
          />
        )}

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
                <dt className="text-slate-500 dark:text-slate-400">{t.date}</dt>
                <dd className="font-semibold text-slate-950 dark:text-slate-200">{cancelTarget.date.slice(0, 10)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">{t.time}</dt>
                <dd className="font-semibold text-slate-950 dark:text-slate-200">{cancelTarget.startTime}-{cancelTarget.endTime}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">{t.room}</dt>
                <dd className="font-semibold text-slate-950 dark:text-slate-200">{cancelTarget.room?.name ?? cancelTarget.roomId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">{t.seat}</dt>
                <dd className="font-semibold text-slate-950 dark:text-slate-200">{cancelTarget.seat?.label ?? cancelTarget.seatId}</dd>
              </div>
            </dl>
          )}
        </ConfirmModal>
        <Toast open={Boolean(toastMessage)} message={toastMessage} onClose={() => setToastMessage("")} />
      </div>
    </AppShell>
  );
}
