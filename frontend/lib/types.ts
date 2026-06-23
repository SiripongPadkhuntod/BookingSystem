export type Role = "user" | "admin";

export type User = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  studentId: string;
  department: string;
  role: Role;
  isActive: boolean;
};

export type Room = {
  id: string;
  code: string;
  name: string;
  description: string;
  floor: string;
  isActive: boolean;
};

export type Seat = {
  id: string;
  roomId: string;
  label: string;
  zone: string;
  position: {
    x: number;
    y: number;
  };
  isActive: boolean;
};

export type Reservation = {
  id: string;
  userId: string;
  roomId: string;
  seatId: string;
  date: string;
  startTime: string;
  endTime: string;
  note: string;
  status: "confirmed" | "cancelled";
  user?: User;
  room?: Room;
  seat?: Seat;
};

export type AuthResult = {
  token: string;
  user: User;
};
