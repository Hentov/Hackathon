CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'renter' CHECK (role IN ('renter','owner')),
  description TEXT
);

CREATE TABLE IF NOT EXISTS gpus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  model TEXT NOT NULL,
  vram_gb INTEGER NOT NULL,
  power_w INTEGER NOT NULL,
  price_per_hour REAL NOT NULL,
  available_from TEXT NOT NULL,
  available_to TEXT NOT NULL,
  photo TEXT,
  conn_jupyter_url TEXT,
  conn_jupyter_token TEXT,
  conn_ssh_command TEXT,
  conn_ssh_password TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  gpu_id INTEGER NOT NULL REFERENCES gpus(id),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  total_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','completed','cancelled'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL UNIQUE REFERENCES bookings(id),
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT
);