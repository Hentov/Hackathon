const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./database/db");

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
  res.json({ availableGpus: rows.length, totalHours: Math.round(total) });
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

app.listen(3000, () => console.log("Running on http://localhost:3000"));