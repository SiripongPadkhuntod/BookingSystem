"use client";

import { AppShell } from "@/components/AppShell";
import { Toast } from "@/components/Toast";
import { SvgSeatMap } from "@/components/SvgSeatMap";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import type { Room, Seat, User } from "@/lib/types";
import { DoorOpen, MapPinned, Plus, ShieldCheck, UsersRound, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const emptyRoomForm = {
  code: "",
  name: "",
  description: "",
  floor: "",
  svgMap: "",
  isActive: true
};

const emptySeatForm = {
  label: "",
  zone: "",
  x: 50,
  y: 50,
  isActive: true
};

export default function AdminPage() {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [seatForm, setSeatForm] = useState(emptySeatForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"maps" | "roles" | "users">("maps");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSeatMapPicker, setShowSeatMapPicker] = useState(false);

  const selectedRoom = useMemo(() => rooms.find((room) => room.id === selectedRoomId), [rooms, selectedRoomId]);
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter((u) => 
      u.firstName.toLowerCase().includes(q) || 
      u.lastName.toLowerCase().includes(q) || 
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q) ||
      u.studentId.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const loadRooms = async () => {
    const data = await api.adminRooms();
    setRooms(data);
    setSelectedRoomId((current) => current || data[0]?.id || "");
  };

  const loadSeats = async (roomId: string) => {
    if (!roomId) {
      setSeats([]);
      return;
    }
    setSeats(await api.adminSeats(roomId));
  };

  const loadUsers = async () => {
    setUsers(await api.adminUsers());
  };

  const loadAll = async () => {
    setLoading(true);
    setMessage("");
    try {
      await Promise.all([loadRooms(), loadUsers()]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.adminLoadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadSeats(selectedRoomId).catch((err) => setMessage(err instanceof Error ? err.message : t.adminLoadFailed));
  }, [selectedRoomId]);

  const createRoom = async () => {
    setSaving(true);
    setMessage("");
    try {
      const room = await api.adminCreateRoom(roomForm);
      setToastMessage(t.roomSaved);
      setRoomForm(emptyRoomForm);
      await loadRooms();
      setSelectedRoomId(room.id);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.adminSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const toggleRoom = async (room: Room) => {
    setSaving(true);
    setMessage("");
    try {
      await api.adminUpdateRoom(room.id, { ...room, isActive: !room.isActive });
      setToastMessage(!room.isActive ? t.roomOpened : t.roomClosed);
      await loadRooms();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.adminSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const createSeat = async () => {
    if (!selectedRoomId) return;
    setSaving(true);
    setMessage("");
    try {
      await api.adminCreateSeat(selectedRoomId, seatForm);
      setToastMessage(t.seatSaved);
      setSeatForm(emptySeatForm);
      await loadSeats(selectedRoomId);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.adminSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const toggleSeat = async (seat: Seat) => {
    setSaving(true);
    setMessage("");
    try {
      await api.adminUpdateSeat(seat.roomId, seat.id, {
        label: seat.label,
        zone: seat.zone,
        x: seat.position.x,
        y: seat.position.y,
        isActive: !seat.isActive
      });
      setToastMessage(!seat.isActive ? t.seatOpened : t.seatClosed);
      await loadSeats(seat.roomId);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.adminSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const deleteSeat = async (seat: Seat) => {
    if (!confirm("Are you sure you want to delete this seat?")) return;
    setSaving(true);
    setMessage("");
    try {
      await api.adminDeleteSeat(seat.roomId, seat.id);
      setToastMessage("Seat deleted");
      await loadSeats(seat.roomId);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to delete seat");
    } finally {
      setSaving(false);
    }
  };

  const updateUserRole = async (user: User, role: User["role"]) => {
    setSaving(true);
    setMessage("");
    try {
      await api.adminUpdateUserRole(user.id, role);
      setToastMessage(t.roleSaved);
      await loadUsers();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.adminSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const updateUserStatus = async (user: User, isActive: boolean) => {
    setSaving(true);
    setMessage("");
    try {
      await api.adminUpdateUserStatus(user.id, isActive);
      setToastMessage(isActive ? "User activated" : "User deactivated");
      await loadUsers();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t.adminSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-500">{t.admin}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{t.adminTitle}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t.adminDescription}</p>
        </div>

        {message && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>}

        <div className="flex items-center gap-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("maps")}
            className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "maps" ? "border-b-2 border-red-700 text-red-700 dark:border-red-500 dark:text-red-500" : "border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
          >
            {t.manageRooms}
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "roles" ? "border-b-2 border-red-700 text-red-700 dark:border-red-500 dark:text-red-500" : "border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
          >
            {t.manageRoles}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "users" ? "border-b-2 border-red-700 text-red-700 dark:border-red-500 dark:text-red-500" : "border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"}`}
          >
            User Management
          </button>
        </div>

        {activeTab === "maps" && (
          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="card p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <MapPinned size={22} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">{t.manageRooms}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.manageRoomsHint}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field px-3 py-3" placeholder={t.roomCode} value={roomForm.code} onChange={(event) => setRoomForm({ ...roomForm, code: event.target.value })} />
              <input className="field px-3 py-3" placeholder={t.roomName} value={roomForm.name} onChange={(event) => setRoomForm({ ...roomForm, name: event.target.value })} />
              <input className="field px-3 py-3" placeholder={t.floor} value={roomForm.floor} onChange={(event) => setRoomForm({ ...roomForm, floor: event.target.value })} />
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={roomForm.isActive} onChange={(event) => setRoomForm({ ...roomForm, isActive: event.target.checked })} />
                {t.openForBooking}
              </label>
              <textarea className="field min-h-20 px-3 py-3 sm:col-span-2" placeholder={t.description} value={roomForm.description} onChange={(event) => setRoomForm({ ...roomForm, description: event.target.value })} />
              <textarea className="field min-h-20 px-3 py-3 sm:col-span-2 font-mono text-xs" placeholder="<g>...</g> (SVG Map Code)" value={roomForm.svgMap} onChange={(event) => setRoomForm({ ...roomForm, svgMap: event.target.value })} />
              <button onClick={createRoom} disabled={saving || !roomForm.code || !roomForm.name} className="button-primary flex items-center justify-center gap-2 px-4 py-3 sm:col-span-2">
                <Plus size={18} />
                {t.addMapRoom}
              </button>
            </div>

            <div className="mt-5 space-y-2">
              {loading ? (
                <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">{t.loading}...</div>
              ) : rooms.map((room) => (
                <div key={room.id} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${selectedRoomId === room.id ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20" : "border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/50"}`}>
                  <button onClick={() => setSelectedRoomId(room.id)} className="min-w-0 text-left">
                    <div className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">{room.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{room.code} · {room.floor || "-"}</div>
                  </button>
                  <button onClick={() => toggleRoom(room)} disabled={saving} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${room.isActive ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-900/30" : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700/50 dark:text-slate-400 dark:hover:bg-slate-800"}`}>
                    {room.isActive ? t.active : t.inactive}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <DoorOpen size={22} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">{t.manageSeats}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedRoom?.name ?? t.chooseRoom}</p>
              </div>
              {selectedRoom && (
                <button
                  type="button"
                  onClick={() => setShowSeatMapPicker(!showSeatMapPicker)}
                  className={`ml-auto flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${showSeatMapPicker ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}
                >
                  <MapPinned size={16} />
                  Visual Picker
                </button>
              )}
            </div>

            {showSeatMapPicker && selectedRoom && (
              <div className="mb-5 overflow-hidden rounded-xl border border-red-200 dark:border-red-900/50">
                <div className="bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  Click anywhere on the map to set X and Y coordinates.
                </div>
                <SvgSeatMap
                  seats={[...seats, {
                    id: "preview-seat",
                    roomId: selectedRoom.id,
                    label: seatForm.label || "★",
                    zone: seatForm.zone,
                    position: { x: seatForm.x, y: seatForm.y },
                    isActive: seatForm.isActive
                  }]}
                  reservedSeatIds={new Set()}
                  selectedSeatId="preview-seat"
                  roomCode={selectedRoom.code}
                  roomSvg={selectedRoom.svgMap}
                  onSelectSeat={() => {}}
                  onClickMap={(x, y) => {
                    setSeatForm((prev) => ({ ...prev, x, y }));
                  }}
                />
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field px-3 py-3" placeholder={t.seatLabel} value={seatForm.label} onChange={(event) => setSeatForm({ ...seatForm, label: event.target.value })} />
              <input className="field px-3 py-3" placeholder={t.zone} value={seatForm.zone} onChange={(event) => setSeatForm({ ...seatForm, zone: event.target.value })} />
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-500">X: {seatForm.x}</span>
                <input className="w-full accent-red-700" type="range" min={0} max={100} value={seatForm.x} onChange={(event) => setSeatForm({ ...seatForm, x: Number(event.target.value) })} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-500">Y: {seatForm.y}</span>
                <input className="w-full accent-red-700" type="range" min={0} max={100} value={seatForm.y} onChange={(event) => setSeatForm({ ...seatForm, y: Number(event.target.value) })} />
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={seatForm.isActive} onChange={(event) => setSeatForm({ ...seatForm, isActive: event.target.checked })} />
                {t.openForBooking}
              </label>
              <button onClick={createSeat} disabled={saving || !selectedRoomId || !seatForm.label} className="button-primary flex items-center justify-center gap-2 px-4 py-3">
                <Plus size={18} />
                {t.addSeat}
              </button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {seats.map((seat) => (
                <div key={seat.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950 dark:text-slate-100">{seat.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{seat.zone || "-"} · X {seat.position.x} · Y {seat.position.y}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleSeat(seat)} disabled={saving} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${seat.isActive ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-900/30" : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700/50 dark:text-slate-400 dark:hover:bg-slate-800"}`}>
                        {seat.isActive ? t.active : t.inactive}
                      </button>
                      <button onClick={() => deleteSeat(seat)} disabled={saving} className="rounded-lg border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/30" title="Delete Seat">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {activeTab === "roles" && (
          <section className="card p-5">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  <UsersRound size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">{t.manageRoles}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.manageRolesHint}</p>
                </div>
              </div>
              <input 
                type="text" 
                placeholder="Search name or email..." 
                className="field px-3 py-2 text-sm sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">{user.displayName || `${user.firstName} ${user.lastName}`}</div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    </div>
                    <ShieldCheck size={18} className={user.role === "admin" ? "text-red-700 dark:text-red-500" : "text-slate-300 dark:text-slate-600"} />
                  </div>
                  <select className="field mt-4 px-3 py-3" value={user.role} onChange={(event) => updateUserRole(user, event.target.value as User["role"])}>
                    <option value="user">{t.userRole}</option>
                    <option value="admin">{t.adminRole}</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "users" && (
          <section className="card p-5">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  <UsersRound size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">User Management</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Enable or disable user access</p>
                </div>
              </div>
              <input 
                type="text" 
                placeholder="Search name or email..." 
                className="field px-3 py-2 text-sm sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className={`rounded-xl border p-4 ${user.isActive ? "border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/50" : "border-red-100 bg-red-50/30 opacity-75 dark:border-red-900/50 dark:bg-red-900/10"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">{user.displayName || `${user.firstName} ${user.lastName}`}</div>
                      <div className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${user.isActive ? "text-emerald-600" : "text-red-600"}`}>
                      {user.isActive ? "Active" : "Disabled"}
                    </span>
                    <button
                      onClick={() => updateUserStatus(user, !user.isActive)}
                      disabled={saving}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                        user.isActive 
                          ? "border-red-200 text-red-700 hover:bg-red-50" 
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {user.isActive ? "Disable Login" : "Enable Login"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <Toast open={Boolean(toastMessage)} message={toastMessage} onClose={() => setToastMessage("")} />
      </div>
    </AppShell>
  );
}
