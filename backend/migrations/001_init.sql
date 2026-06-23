CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  student_id TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  floor TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seats (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  zone TEXT NOT NULL DEFAULT '',
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, label)
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  room_id TEXT NOT NULL REFERENCES rooms(id),
  seat_id TEXT NOT NULL REFERENCES seats(id),
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  CHECK (end_time > start_time),
  CHECK (start_time >= TIME '08:00' AND end_time <= TIME '22:00')
);

ALTER TABLE reservations
  ADD CONSTRAINT reservations_no_overlap
  EXCLUDE USING gist (
    seat_id WITH =,
    tsrange(reservation_date + start_time, reservation_date + end_time, '[)') WITH &&
  )
  WHERE (status = 'confirmed');

CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_seats_room ON seats(room_id);

INSERT INTO rooms (id, code, name, description, floor)
VALUES
  ('room-cs-lab', 'CS-LAB', 'CS Lab', 'Computer science laboratory', '2'),
  ('room-cs-meeting', 'CS-MEETING', 'CS Meeting Room', 'Small meeting and review room', '2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO seats (id, room_id, label, zone, position_x, position_y)
VALUES
  ('seat-cs-a01', 'room-cs-lab', 'A01', 'A', 12, 20),
  ('seat-cs-a02', 'room-cs-lab', 'A02', 'A', 28, 20),
  ('seat-cs-a03', 'room-cs-lab', 'A03', 'A', 44, 20),
  ('seat-cs-a04', 'room-cs-lab', 'A04', 'A', 60, 20),
  ('seat-cs-a05', 'room-cs-lab', 'A05', 'A', 76, 20),
  ('seat-cs-a06', 'room-cs-lab', 'A06', 'A', 92, 20),
  ('seat-cs-b01', 'room-cs-lab', 'B01', 'B', 20, 52),
  ('seat-cs-b02', 'room-cs-lab', 'B02', 'B', 40, 52),
  ('seat-cs-c01', 'room-cs-lab', 'C01', 'C', 60, 76),
  ('seat-cs-c02', 'room-cs-lab', 'C02', 'C', 80, 76),
  ('seat-mt-a01', 'room-cs-meeting', 'M01', 'Meeting', 25, 36),
  ('seat-mt-a02', 'room-cs-meeting', 'M02', 'Meeting', 45, 36),
  ('seat-mt-a03', 'room-cs-meeting', 'M03', 'Meeting', 65, 36),
  ('seat-mt-a04', 'room-cs-meeting', 'M04', 'Meeting', 85, 36)
ON CONFLICT (id) DO NOTHING;
