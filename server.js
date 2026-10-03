const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("./database/db");

// Optional real connection details a host can save with a listing (added without resetting the database)
for (const col of ["conn_jupyter_url", "conn_jupyter_token", "conn_ssh_command", "conn_ssh_password"]) {
  const has = db.prepare("PRAGMA table_info(gpus)").all().some((c) => c.name === col);
  if (!has) db.exec(`ALTER TABLE gpus ADD COLUMN ${col} TEXT`);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello, GPU Share!" });
});

app.post("/api/register", (req, res) => {
  const { name, password, role } = req.body;
  const username = (req.body.username || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: "Missing data" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
    return res.status(409).json({ error: "This email is already registered" });
  }
  if (db.prepare("SELECT id FROM users WHERE username = ?").get(username)) {
    return res.status(409).json({ error: "This username is taken" });
  }

  const userRole = role === "owner" ? "owner" : "renter";
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)")
    .run(name, username, email, hash, userRole);

  res.json({ id: info.lastInsertRowid, name, username, email, role: userRole });
});

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  const email = (req.body.email || "").trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
    return res.status(401).json({ error: "Wrong email or password" });
  }
  res.json({ id: user.id, name: user.name, username: user.username, email: user.email, role: user.role });
});

app.get("/api/stats", (req, res) => {
  const rows = db.prepare("SELECT available_from, available_to FROM gpus").all();
  const toHours = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  };
  let total = 0;
  for (const r of rows) total += toHours(r.available_to) - toHours(r.available_from);
  const e = db
    .prepare(
      `SELECT COALESCE(SUM(g.power_w * (strftime('%s', b.end_time || ':00') - strftime('%s', b.start_time || ':00')) / 3600.0 / 1000.0), 0) AS kwh
         FROM bookings b JOIN gpus g ON g.id = b.gpu_id
        WHERE b.status != 'cancelled'`
    )
    .get();
  const h = db
    .prepare(
      `SELECT COALESCE(SUM((strftime('%s', end_time || ':00') - strftime('%s', start_time || ':00')) / 3600.0), 0) AS hours
         FROM bookings WHERE status != 'cancelled'`
    )
    .get();
  res.json({
    availableGpus: rows.length,
    totalHours: Math.round(total),
    energyKwh: Math.round(e.kwh * 10) / 10,
    savedHours: Math.round(h.hours * 10) / 10,
  });
});

app.get("/api/gpu-models", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT model FROM gpus ORDER BY model").all();
  res.json(rows.map((r) => r.model));
});

app.get("/api/gpus", (req, res) => {
  const model = (req.query.model || "").trim();
  const rows = db
    .prepare(
      `SELECT g.id, g.model, g.vram_gb, g.power_w, g.price_per_hour,
              g.available_from, g.available_to, g.photo,
              u.username AS owner_username,
              (SELECT ROUND(AVG(r.stars), 1)
                 FROM reviews r
                 JOIN bookings b ON b.id = r.booking_id
                 JOIN gpus g2 ON g2.id = b.gpu_id
                WHERE g2.owner_id = g.owner_id) AS owner_rating
         FROM gpus g
         JOIN users u ON u.id = g.owner_id
        WHERE (? = '' OR g.model = ?)
        ORDER BY g.price_per_hour`
    )
    .all(model, model);
  res.json(rows);
});


// ---------- helpers for bookings ----------
const pad = (n) => String(n).padStart(2, "0");
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
// "23:59" means "until the end of the day"
const windowEnd = (t) => (t === "23:59" ? 1440 : toMinutes(t));
// "YYYY-MM-DD" + minutes from midnight (may be >= 1440) -> "YYYY-MM-DD HH:MM"
const stamp = (date, minutes) => {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};
const nowStamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const money = (n) => Number(n.toFixed(2));

// Mock payment: nothing real is charged and the card is NEVER stored.
// Any valid-looking card works. A card number ending in 0002 is "declined" (demo).
function mockCharge(card) {
  const number = String((card && card.number) || "").replace(/\s+/g, "");
  const cvc = String((card && card.cvc) || "");
  const exp = String((card && card.exp) || "");
  if (!/^\d{13,19}$/.test(number)) return "Invalid card number";
  if (!/^\d{3,4}$/.test(cvc)) return "Invalid CVC";
  const m = exp.match(/^(\d{2})\/(\d{2})$/);
  if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) return "Expiry must look like MM/YY";
  const expEnd = new Date(2000 + Number(m[2]), Number(m[1]), 1); // first day after the expiry month
  if (expEnd <= new Date()) return "Card has expired";
  if (number.endsWith("0002")) return "Payment declined by the bank";
  return null;
}

// ---------- One GPU + its upcoming booked slots ----------
app.get("/api/gpus/:id", (req, res) => {
  const gpu = db
    .prepare(
      `SELECT g.id, g.model, g.vram_gb, g.power_w, g.price_per_hour,
              g.available_from, g.available_to, g.photo,
              u.username AS owner_username,
              (SELECT ROUND(AVG(r.stars), 1)
                 FROM reviews r
                 JOIN bookings b ON b.id = r.booking_id
                 JOIN gpus g2 ON g2.id = b.gpu_id
                WHERE g2.owner_id = g.owner_id) AS owner_rating
         FROM gpus g JOIN users u ON u.id = g.owner_id
        WHERE g.id = ?`
    )
    .get(req.params.id);
  if (!gpu) return res.status(404).json({ error: "GPU not found" });
  const busy = db
    .prepare(
      `SELECT start_time, end_time FROM bookings
        WHERE gpu_id = ? AND status != 'cancelled' AND end_time > ?
        ORDER BY start_time`
    )
    .all(gpu.id, nowStamp());
  res.json({ ...gpu, busy });
});

// ---------- Book + (mock) pay ----------
app.post("/api/bookings", (req, res) => {
  const { user_id, gpu_id, date, start, hours, card } = req.body;
  const h = Number(hours);
  if (!user_id || !gpu_id || !date || !start || !Number.isInteger(h) || h < 1) {
    return res.status(400).json({ error: "Missing or invalid booking data" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(start)) {
    return res.status(400).json({ error: "Invalid date or time format" });
  }
  const user = db.prepare("SELECT id FROM users WHERE id = ?").get(user_id);
  if (!user) return res.status(401).json({ error: "Unknown user" });
  const gpu = db.prepare("SELECT * FROM gpus WHERE id = ?").get(gpu_id);
  if (!gpu) return res.status(404).json({ error: "GPU not found" });

  const startMin = toMinutes(start);
  const endMin = startMin + h * 60;
  if (startMin < toMinutes(gpu.available_from) || endMin > windowEnd(gpu.available_to)) {
    return res.status(400).json({
      error: `This GPU is only available daily from ${gpu.available_from} to ${gpu.available_to}`,
    });
  }

  const startTime = stamp(date, startMin);
  const endTime = stamp(date, endMin);
  if (startTime <= nowStamp()) {
    return res.status(400).json({ error: "The start time must be in the future" });
  }

  const clash = db
    .prepare(
      `SELECT id FROM bookings
        WHERE gpu_id = ? AND status != 'cancelled'
          AND start_time < ? AND end_time > ?`
    )
    .get(gpu.id, endTime, startTime);
  if (clash) return res.status(409).json({ error: "This time slot is already booked" });

  const payError = mockCharge(card);
  if (payError) return res.status(402).json({ error: payError });

  const total = money(gpu.price_per_hour * h);
  const info = db
    .prepare(
      `INSERT INTO bookings (user_id, gpu_id, start_time, end_time, total_price, status)
       VALUES (?, ?, ?, ?, ?, 'paid')`
    )
    .run(user.id, gpu.id, startTime, endTime, total);
  res.json({
    id: info.lastInsertRowid,
    gpu_id: gpu.id,
    model: gpu.model,
    start_time: startTime,
    end_time: endTime,
    hours: h,
    total_price: total,
    energy_kwh: money((gpu.power_w * h) / 1000),
    status: "paid",
  });
});

// ---------- My bookings ----------
app.get("/api/bookings", (req, res) => {
  const userId = Number(req.query.user_id);
  if (!userId) return res.status(400).json({ error: "user_id is required" });
  const rows = db
    .prepare(
      `SELECT b.id, b.gpu_id, b.start_time, b.end_time, b.total_price, b.status,
              g.model, g.power_w, u.username AS owner_username,
              r.stars AS stars, r.comment AS comment
         FROM bookings b
         JOIN gpus g ON g.id = b.gpu_id
         JOIN users u ON u.id = g.owner_id
         LEFT JOIN reviews r ON r.booking_id = b.id
        WHERE b.user_id = ?
        ORDER BY b.start_time DESC`
    )
    .all(userId);
  const now = nowStamp();
  res.json(
    rows.map((b) => {
      const hours =
        (new Date(b.end_time.replace(" ", "T") + ":00Z") -
          new Date(b.start_time.replace(" ", "T") + ":00Z")) /
        3600000;
      return {
        ...b,
        hours,
        energy_kwh: money((b.power_w * hours) / 1000),
        status: b.status === "paid" && b.end_time <= now ? "completed" : b.status,
        phase: b.status === "cancelled" ? "ended" : b.end_time <= now ? "ended" : b.start_time <= now ? "active" : "upcoming",
      };
    })
  );
});

// ---------- Rate a booking (1-5 stars) ----------
app.post("/api/reviews", (req, res) => {
  const { user_id, booking_id, comment } = req.body;
  const stars = Number(req.body.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ error: "Stars must be a number from 1 to 5" });
  }
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(booking_id);
  if (!booking || booking.user_id !== Number(user_id)) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (booking.status === "cancelled") {
    return res.status(400).json({ error: "This booking was cancelled" });
  }
  // Prototype: you can rate right after paying so it can be shown in the demo.
  // For a real product, require booking.end_time <= nowStamp().
  const exists = db.prepare("SELECT id FROM reviews WHERE booking_id = ?").get(booking.id);
  if (exists) return res.status(409).json({ error: "You already rated this booking" });
  db.prepare("INSERT INTO reviews (booking_id, stars, comment) VALUES (?, ?, ?)").run(
    booking.id,
    stars,
    (comment || "").toString().slice(0, 500)
  );
  res.json({ ok: true });
});


// ---------- Connection details for a booking ----------
// DEMO credentials: they are derived from the booking id, so they are stable and need no
// extra table. When the host agent exists, this is where the real address will come from.
const CONNECT_SECRET = process.env.CONNECT_SECRET || "gpushare-demo-secret";
const CONNECT_HOST = process.env.CONNECT_HOST || "198.51.100.24";
const token = (label, bookingId) =>
  crypto.createHmac("sha256", CONNECT_SECRET).update(label + ":" + bookingId).digest("hex").slice(0, 10);

app.get("/api/bookings/:id/connection", (req, res) => {
  const userId = Number(req.query.user_id);
  const b = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  if (!b || !userId || b.user_id !== userId) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (b.status === "cancelled") {
    return res.status(410).json({ error: "This booking was cancelled" });
  }
  const now = nowStamp();
  if (b.end_time <= now) {
    return res.status(410).json({ error: "This rental has ended, the connection details are no longer available" });
  }
  const real = db
    .prepare("SELECT conn_jupyter_url, conn_jupyter_token, conn_ssh_command, conn_ssh_password FROM gpus WHERE id = ?")
    .get(b.gpu_id);
  const hasReal = real && (real.conn_jupyter_url || real.conn_ssh_command);
  const out = {
    booking_id: b.id,
    phase: b.start_time <= now ? "active" : "upcoming",
    start_time: b.start_time,
    end_time: b.end_time,
    host: CONNECT_HOST,
    ssh_user: `gpu${b.gpu_id}`,
    ssh_port: 2200 + b.gpu_id,
    ssh_command: `ssh gpu${b.gpu_id}@${CONNECT_HOST} -p ${2200 + b.gpu_id}`,
    password: token("pw", b.id),
    jupyter_url: `http://${CONNECT_HOST}:${8800 + b.gpu_id}`,
    jupyter_token: token("jt", b.id),
    demo: true,
  };
  if (hasReal) {
    // The host saved real details: show those instead of the demo values
    out.ssh_command = real.conn_ssh_command || "";
    out.password = real.conn_ssh_password || "";
    out.jupyter_url = real.conn_jupyter_url || "";
    out.jupyter_token = real.conn_jupyter_token || "";
    out.demo = false;
  }
  res.json(out);
});

// ---------- Create a listing (any user) ----------
app.post("/api/gpus", (req, res) => {
  const { owner_id, model, available_from, available_to } = req.body;
  const vram = Number(req.body.vram_gb);
  const power = Number(req.body.power_w);
  const price = Number(req.body.price_per_hour);
  const owner = db.prepare("SELECT id, role FROM users WHERE id = ?").get(owner_id);
  if (!owner) return res.status(401).json({ error: "Unknown user" });
  const name = (model || "").toString().trim();
  if (!name || name.length > 60) return res.status(400).json({ error: "Enter the GPU model (up to 60 characters)" });
  if (!Number.isInteger(vram) || vram < 1 || vram > 256) return res.status(400).json({ error: "VRAM must be a whole number from 1 to 256 GB" });
  if (!Number.isInteger(power) || power < 1 || power > 1500) return res.status(400).json({ error: "Power must be a whole number from 1 to 1500 W" });
  if (!(price > 0) || price > 100) return res.status(400).json({ error: "Price per hour must be more than 0 and at most 100" });
  if (!/^\d{2}:\d{2}$/.test(available_from || "") || !/^\d{2}:\d{2}$/.test(available_to || "")) {
    return res.status(400).json({ error: "Enter the available hours" });
  }
  if (toMinutes(available_from) >= toMinutes(available_to)) {
    return res.status(400).json({ error: "'Available from' must be earlier than 'Available to'" });
  }
  const clean = (v) => (v == null ? "" : String(v).trim());
  const jUrl = clean(req.body.conn_jupyter_url);
  const jTok = clean(req.body.conn_jupyter_token);
  const sshCmd = clean(req.body.conn_ssh_command);
  const sshPw = clean(req.body.conn_ssh_password);
  if ([jUrl, jTok, sshCmd, sshPw].some((v) => v.length > 300)) {
    return res.status(400).json({ error: "Connection details are too long" });
  }
  if (jUrl && !/^https?:\/\//i.test(jUrl)) {
    return res.status(400).json({ error: "The Jupyter address must start with http:// or https://" });
  }
  const info = db
    .prepare(
      `INSERT INTO gpus (owner_id, model, vram_gb, power_w, price_per_hour, available_from, available_to, photo,
                         conn_jupyter_url, conn_jupyter_token, conn_ssh_command, conn_ssh_password)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)`
    )
    .run(owner.id, name, vram, power, money(price), available_from, available_to,
         jUrl || null, jTok || null, sshCmd || null, sshPw || null);
  res.json({ id: info.lastInsertRowid, model: name });
});

// ---------- Change the remote access details of my own listing ----------
app.put("/api/gpus/:id/connection", (req, res) => {
  const g = db.prepare("SELECT id, owner_id FROM gpus WHERE id = ?").get(req.params.id);
  if (!g || g.owner_id !== Number(req.body.owner_id)) {
    return res.status(404).json({ error: "Listing not found" });
  }
  const clean = (v) => (v == null ? "" : String(v).trim());
  const access = clean(req.body.conn_ssh_command);
  const pw = clean(req.body.conn_ssh_password);
  if (access.length > 300 || pw.length > 300) {
    return res.status(400).json({ error: "Connection details are too long" });
  }
  db.prepare("UPDATE gpus SET conn_ssh_command = ?, conn_ssh_password = ? WHERE id = ?").run(access || null, pw || null, g.id);
  res.json({ ok: true });
});

// ---------- My listings (owners) ----------
app.get("/api/my-gpus", (req, res) => {
  const ownerId = Number(req.query.owner_id);
  if (!ownerId) return res.status(400).json({ error: "owner_id is required" });
  const now = nowStamp();
  const rows = db
    .prepare(
      `SELECT g.id, g.model, g.vram_gb, g.power_w, g.price_per_hour, g.available_from, g.available_to,
              (COALESCE(g.conn_jupyter_url, '') != '' OR COALESCE(g.conn_ssh_command, '') != '') AS has_connection,
              g.conn_ssh_command, g.conn_ssh_password,
              (SELECT COUNT(*) FROM bookings b
                WHERE b.gpu_id = g.id AND b.status != 'cancelled' AND b.end_time > ?) AS upcoming_bookings
         FROM gpus g WHERE g.owner_id = ? ORDER BY g.id DESC`
    )
    .all(now, ownerId);
  res.json(rows);
});

// ---------- Profile: hours saved ----------
// Every hour someone rents your GPU counts as +1 saved hour for you.
app.get("/api/profile", (req, res) => {
  const userId = Number(req.query.user_id);
  const user = db.prepare("SELECT id, username FROM users WHERE id = ?").get(userId);
  if (!user) return res.status(404).json({ error: "Unknown user" });
  const row = db
    .prepare(
      `SELECT COUNT(*) AS rentals,
              COALESCE(SUM((strftime('%s', b.end_time || ':00') - strftime('%s', b.start_time || ':00')) / 3600.0), 0) AS hours,
              COALESCE(SUM(g.power_w * (strftime('%s', b.end_time || ':00') - strftime('%s', b.start_time || ':00')) / 3600.0 / 1000.0), 0) AS kwh
         FROM bookings b JOIN gpus g ON g.id = b.gpu_id
        WHERE g.owner_id = ? AND b.status != 'cancelled'`
    )
    .get(userId);
  res.json({ username: user.username, saved_hours: Math.round(row.hours * 10) / 10, saved_kwh: Math.round(row.kwh * 10) / 10, rentals: row.rentals });
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));