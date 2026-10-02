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
  const email = (req.body.email || "").trim().toLowerCase();
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Липсват данни" });
  }
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) {
    return res.status(409).json({ error: "Този имейл вече е регистриран" });
  }
  const userRole = role === "owner" ? "owner" : "renter";
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
    .run(name, email, hash, userRole);
  res.json({ id: info.lastInsertRowid, name, email, role: userRole });
});

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  const email = (req.body.email || "").trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
    return res.status(401).json({ error: "Грешен имейл или парола" });
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.listen(3000, () => console.log("Running on http://localhost:3000"));