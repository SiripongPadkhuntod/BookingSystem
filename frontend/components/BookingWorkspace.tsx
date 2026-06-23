"use client";

import { CalendarDays, CheckCircle2, Clock, DoorOpen, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { ConfirmModal } from "@/components/ConfirmModal";
import { SvgSeatMap } from "@/components/SvgSeatMap";
import { Toast } from "@/components/Toast";
import { useLanguage } from "@/lib/i18n";
import { nextSlot, timeSlots, todayISO } from "@/lib/time";
import type { Reservation, Room, Seat } from "@/lib/types";

function slotIndex(value: string) {
  const index = timeSlots.indexOf(value);
  return index >= 0 ? index : 0;
}

export function BookingWorkspace() {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("08:30");
  const [seatId, setSeatId] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.rooms().then((data) => {
      setRooms(data);
      setRoomId(data[0]?.id ?? "");
    });
  }, []);

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    Promise.all([
      api.seats(roomId),
      api.reservations(new URLSearchParams({ roomId, date }))
    ]).then(([seatData, reservationData]) => {
      setSeats(seatData);
      setReservations(reservationData);
      setSeatId("");
    }).finally(() => setLoading(false));
  }, [roomId, date]);

  const reservedSeatIds = useMemo(() => {
    return new Set(
      reservations
        .filter((reservation) => reservation.startTime < endTime && reservation.endTime > startTime)
        .map((reservation) => reservation.seatId)
    );
  }, [reservations, startTime, endTime]);

  const selectedRoom = rooms.find((room) => room.id === roomId);
  const selectedSeat = seats.find((seat) => seat.id === seatId);
  const startIndex = slotIndex(startTime);
  const endIndex = slotIndex(endTime);

  const updateStartTime = (index: number) => {
    const nextStart = timeSlots[Math.min(index, timeSlots.length - 2)] ?? "08:00";
    setStartTime(nextStart);
    if (slotIndex(endTime) <= slotIndex(nextStart)) {
      setEndTime(nextSlot(nextStart));
    }
  };

  const updateEndTime = (index: number) => {
    const safeIndex = Math.max(index, startIndex + 1);
    setEndTime(timeSlots[Math.min(safeIndex, timeSlots.length - 1)] ?? "08:30");
  };

  const openConfirm = () => {
    if (!seatId) {
      setMessage(t.selectSeatFirst);
      return;
    }
    setMessage("");
    setConfirmOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.createReservation({ roomId, seatId, date, startTime, endTime, note });
      setToastTone("success");
      setToastMessage(t.bookingSuccess);
      setConfirmOpen(false);
      setNote("");
      const updated = await api.reservations(new URLSearchParams({ roomId, date }));
      setReservations(updated);
      setSeatId("");
    } catch (err) {
      setConfirmOpen(false);
      setToastTone("error");
      setToastMessage(err instanceof Error ? err.message : t.bookingFailed);
    } finally {
      setSaving(false);
    }
  };

  const isSeatReserved = seatId ? reservedSeatIds.has(seatId) : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-red-700">{t.bookingKicker}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{t.bookingTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">{t.bookingDescription}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          {selectedRoom?.name ?? t.chooseRoom} · {date}
        </div>
      </div>

      <section className="card p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><DoorOpen size={16} /> {t.room}</span>
            <select className="field px-3 py-3" value={roomId} onChange={(event) => setRoomId(event.target.value)}>
              {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><CalendarDays size={16} /> {t.date}</span>
            <input className="field px-3 py-3" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card min-h-[560px] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{t.seatMap}</h2>
              <p className="text-sm text-slate-500">{t.seatMapHint}</p>
            </div>
            {loading && <Loader2 className="animate-spin text-slate-400" />}
          </div>

          <SvgSeatMap
            seats={seats}
            reservedSeatIds={reservedSeatIds}
            selectedSeatId={seatId}
            roomCode={selectedRoom?.code}
            onSelectSeat={setSeatId}
          />
        </section>

        <aside className="card p-5">
          <h2 className="text-xl font-semibold text-slate-950">{t.bookingSummary}</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">{t.room}</dt>
              <dd className="mt-1 font-semibold text-slate-950">{selectedRoom?.name ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t.seat}</dt>
              <dd className="mt-1 font-semibold text-slate-950">{selectedSeat?.label ?? t.noSeatSelected}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{t.timeRange}</dt>
              <dd className="mt-1 font-semibold text-slate-950">{date} · {startTime}-{endTime}</dd>
            </div>
          </dl>

          <div className="mt-5 space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Clock size={16} />
              {t.timeRange}
            </div>
            <label className="block">
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-slate-700">{t.start}</span>
                <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-950">{startTime}</span>
              </div>
              <input
                className="w-full accent-red-700"
                type="range"
                min={0}
                max={timeSlots.length - 2}
                step={1}
                value={startIndex}
                onChange={(event) => updateStartTime(Number(event.target.value))}
              />
            </label>
            <label className="block">
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-slate-700">{t.end}</span>
                <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-950">{endTime}</span>
              </div>
              <input
                className="w-full accent-red-700"
                type="range"
                min={startIndex + 1}
                max={timeSlots.length - 1}
                step={1}
                value={Math.max(endIndex, startIndex + 1)}
                onChange={(event) => updateEndTime(Number(event.target.value))}
              />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t.note}</span>
            <textarea className="field min-h-28 px-3 py-3" value={note} onChange={(event) => setNote(event.target.value)} placeholder={t.notePlaceholder} />
          </label>

          {message && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          <button onClick={openConfirm} disabled={saving} className="button-primary mt-5 flex w-full items-center justify-center gap-2 px-4 py-3">
            <CheckCircle2 size={18} />
            {saving ? t.bookingNow : t.confirmBooking}
          </button>
        </aside>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={t.confirmBookingTitle}
        description={t.confirmBookingDescription}
        confirmLabel={t.confirmBooking}
        cancelLabel={t.back}
        loading={saving}
        onConfirm={submit}
        onClose={() => {
          if (!saving) setConfirmOpen(false);
        }}
      >
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{t.room}</dt>
            <dd className="font-semibold text-slate-950">{selectedRoom?.name ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{t.seat}</dt>
            <dd className="font-semibold text-slate-950">{selectedSeat?.label ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{t.timeRange}</dt>
            <dd className="font-semibold text-slate-950">{date} · {startTime}-{endTime}</dd>
          </div>
          {note && (
            <div>
              <dt className="text-slate-500">{t.note}</dt>
              <dd className="mt-1 font-medium text-slate-800">{note}</dd>
            </div>
          )}
        </dl>
      </ConfirmModal>
      <Toast open={Boolean(toastMessage)} message={toastMessage} tone={toastTone} onClose={() => setToastMessage("")} />
    </div>
  );
}
