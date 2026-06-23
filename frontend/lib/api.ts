import type { AuthResult, Reservation, Room, Seat, User } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
const TOKEN_KEY = "bookingSystemToken";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed");
  }
  return payload as T;
}

export const api = {
  login: (body: { identifier: string; password: string }) =>
    request<AuthResult>("/api/auth/login", { method: "POST", body: JSON.stringify(body), auth: false }),
  register: (body: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    studentId: string;
  }) => request<AuthResult>("/api/auth/register", { method: "POST", body: JSON.stringify(body), auth: false }),
  me: () => request<User>("/api/auth/me"),
  rooms: async () => (await request<{ data: Room[] }>("/api/rooms")).data,
  seats: async (roomId: string) => (await request<{ data: Seat[] }>(`/api/rooms/${roomId}/seats`)).data,
  reservations: async (params: URLSearchParams) =>
    (await request<{ data: Reservation[] }>(`/api/reservations?${params.toString()}`)).data,
  myReservations: async () => (await request<{ data: Reservation[] }>("/api/reservations/me")).data,
  createReservation: (body: {
    roomId: string;
    seatId: string;
    date: string;
    startTime: string;
    endTime: string;
    note: string;
  }) => request<Reservation>("/api/reservations", { method: "POST", body: JSON.stringify(body) }),
  cancelReservation: (id: string) => request<void>(`/api/reservations/${id}`, { method: "DELETE" }),
  adminRooms: async () => (await request<{ data: Room[] }>("/api/admin/rooms")).data,
  adminCreateRoom: (body: {
    code: string;
    name: string;
    description: string;
    floor: string;
    isActive: boolean;
  }) => request<Room>("/api/admin/rooms", { method: "POST", body: JSON.stringify(body) }),
  adminUpdateRoom: (id: string, body: {
    code: string;
    name: string;
    description: string;
    floor: string;
    isActive: boolean;
  }) => request<Room>(`/api/admin/rooms/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  adminSeats: async (roomId: string) => (await request<{ data: Seat[] }>(`/api/admin/rooms/${roomId}/seats`)).data,
  adminCreateSeat: (roomId: string, body: {
    label: string;
    zone: string;
    x: number;
    y: number;
    isActive: boolean;
  }) => request<Seat>(`/api/admin/rooms/${roomId}/seats`, { method: "POST", body: JSON.stringify(body) }),
  adminUpdateSeat: (roomId: string, seatId: string, body: {
    label: string;
    zone: string;
    x: number;
    y: number;
    isActive: boolean;
  }) => request<Seat>(`/api/admin/rooms/${roomId}/seats/${seatId}`, { method: "PUT", body: JSON.stringify(body) }),
  adminUsers: async () => (await request<{ data: User[] }>("/api/admin/users")).data,
  adminUpdateUserRole: (id: string, role: User["role"]) =>
    request<User>(`/api/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) })
};
