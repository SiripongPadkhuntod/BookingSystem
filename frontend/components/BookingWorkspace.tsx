"use client";

import { CalendarDays, CheckCircle2, Clock, DoorOpen, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { nextSlot, timeSlots, todayISO } from "@/lib/time";
import type { Reservation, Room, Seat } from "@/lib/types";

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

  useEffect(() => {
    setEndTime(nextSlot(startTime));
  }, [startTime]);

  const reservedSeatIds = useMemo(() => {
    return new Set(
      reservations
        .filter((reservation) => reservation.startTime < endTime && reservation.endTime > startTime)
        .map((reservation) => reservation.seatId)
    );
  }, [reservations, startTime, endTime]);

  const selectedRoom = rooms.find((room) => room.id === roomId);
  const selectedSeat = seats.find((seat) => seat.id === seatId);

  const submit = async () => {
    if (!seatId) {
      setMessage(t.selectSeatFirst);
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await api.createReservation({ roomId, seatId, date, startTime, endTime, note });
      setMessage(t.bookingSuccess);
      setNote("");
      const updated = await api.reservations(new URLSearchParams({ roomId, date }));
      setReservations(updated);
      setSeatId("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.bookingFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-red-700">{t.bookingKicker}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{t.bookingTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">{t.bookingDescription}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          {selectedRoom?.name ?? t.chooseRoom} · {date} · {startTime}-{endTime}
        </div>
      </div>

      <section className="card p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-4">
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
          <label>
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Clock size={16} /> {t.start}</span>
            <select className="field px-3 py-3" value={startTime} onChange={(event) => setStartTime(event.target.value)}>
              {timeSlots.slice(0, -1).map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t.end}</span>
            <select className="field px-3 py-3" value={endTime} onChange={(event) => setEndTime(event.target.value)}>
              {timeSlots.filter((slot) => slot > startTime).map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
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

          <div className="relative min-h-[460px] rounded-xl border border-slate-200 bg-slate-50">
            {seats.map((seat) => {
              const reserved = reservedSeatIds.has(seat.id);
              const selected = seat.id === seatId;
              return (
                <button
                  key={seat.id}
                  disabled={reserved}
                  onClick={() => setSeatId(seat.id)}
                  className={`absolute flex h-14 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                    reserved
                      ? "border-slate-200 bg-slate-200 text-slate-400"
                      : selected
                        ? "border-red-700 bg-red-700 text-white shadow-lg"
                        : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50"
                  }`}
                  style={{ left: `${seat.position.x}%`, top: `${seat.position.y}%` }}
                >
                  {seat.label}
                </button>
              );
            })}
          </div>
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

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t.note}</span>
            <textarea className="field min-h-28 px-3 py-3" value={note} onChange={(event) => setNote(event.target.value)} placeholder={t.notePlaceholder} />
          </label>

          {message && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          <button onClick={submit} disabled={saving} className="button-primary mt-5 flex w-full items-center justify-center gap-2 px-4 py-3">
            <CheckCircle2 size={18} />
            {saving ? t.bookingNow : t.confirmBooking}
          </button>
        </aside>
      </div>
    </div>
  );
}
