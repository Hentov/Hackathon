const db = require("./db");

// Clear existing demo data so the seed can be safely re-run.
// Delete in reverse dependency order.
db.exec(`
  DELETE FROM reviews;
  DELETE FROM bookings;
  DELETE FROM gpus;
  DELETE FROM users;
`);

// --------------------------------------------------
// Users / GPU owners
// --------------------------------------------------

const insertUser = db.prepare(`
  INSERT INTO users (name, email, password_hash, role, description)
  VALUES (?, ?, ?, ?, ?)
`);

const owners = [
  {
    name: "Alex Morgan",
    email: "alex@example.com",
    password_hash: "demo_hash",
    role: "owner",
    description: "AI developer with a powerful home workstation.",
  },
  {
    name: "Sofia Ivanova",
    email: "sofia@example.com",
    password_hash: "demo_hash",
    role: "owner",
    description: "Freelance 3D artist renting out unused GPU capacity.",
  },
  {
    name: "Daniel Petroff",
    email: "daniel@example.com",
    password_hash: "demo_hash",
    role: "owner",
    description: "Machine learning enthusiast with several GPUs.",
  },
  {
    name: "Maya Chen",
    email: "maya@example.com",
    password_hash: "demo_hash",
    role: "owner",
    description: "Software engineer with spare computing capacity.",
  },
  {
    name: "Victor Rossi",
    email: "victor@example.com",
    password_hash: "demo_hash",
    role: "owner",
    description: "Game developer who shares his workstation when idle.",
  },
];

const ownerIds = {};

for (const owner of owners) {
  const result = insertUser.run(
    owner.name,
    owner.email,
    owner.password_hash,
    owner.role,
    owner.description
  );

  ownerIds[owner.name] = result.lastInsertRowid;
}

// --------------------------------------------------
// Renters
// --------------------------------------------------

const renters = [
  {
    name: "Emma Wilson",
    email: "emma@example.com",
    password_hash: "demo_hash",
    role: "renter",
    description: "AI student experimenting with machine learning.",
  },
  {
    name: "Liam Brown",
    email: "liam@example.com",
    password_hash: "demo_hash",
    role: "renter",
    description: "Indie developer working on a computer vision project.",
  },
];

const renterIds = {};

for (const renter of renters) {
  const result = insertUser.run(
    renter.name,
    renter.email,
    renter.password_hash,
    renter.role,
    renter.description
  );

  renterIds[renter.name] = result.lastInsertRowid;
}

// --------------------------------------------------
// GPUs
// --------------------------------------------------

const insertGpu = db.prepare(`
  INSERT INTO gpus (
    owner_id,
    model,
    vram_gb,
    power_w,
    price_per_hour,
    available_from,
    available_to,
    photo
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const gpus = [
  {
    owner: "Alex Morgan",
    model: "NVIDIA RTX 4090",
    vram: 24,
    power: 450,
    price: 0.85,
    from: "18:00",
    to: "23:59",
    photo: "rtx-4090.jpg",
  },
  {
    owner: "Alex Morgan",
    model: "NVIDIA RTX 3090",
    vram: 24,
    power: 350,
    price: 0.65,
    from: "09:00",
    to: "22:00",
    photo: "rtx-3090.jpg",
  },
  {
    owner: "Sofia Ivanova",
    model: "NVIDIA RTX 4080 SUPER",
    vram: 16,
    power: 320,
    price: 0.70,
    from: "17:00",
    to: "23:59",
    photo: "rtx-4080-super.jpg",
  },
  {
    owner: "Sofia Ivanova",
    model: "NVIDIA RTX 4070 Ti SUPER",
    vram: 16,
    power: 285,
    price: 0.55,
    from: "18:00",
    to: "23:00",
    photo: "rtx-4070-ti-super.jpg",
  },
  {
    owner: "Daniel Petroff",
    model: "NVIDIA RTX 4070 SUPER",
    vram: 12,
    power: 220,
    price: 0.45,
    from: "08:00",
    to: "20:00",
    photo: "rtx-4070-super.jpg",
  },
  {
    owner: "Daniel Petroff",
    model: "NVIDIA RTX 3080",
    vram: 10,
    power: 320,
    price: 0.40,
    from: "10:00",
    to: "23:00",
    photo: "rtx-3080.jpg",
  },
  {
    owner: "Maya Chen",
    model: "NVIDIA RTX 4060 Ti",
    vram: 16,
    power: 165,
    price: 0.30,
    from: "18:00",
    to: "23:59",
    photo: "rtx-4060-ti.jpg",
  },
  {
    owner: "Maya Chen",
    model: "NVIDIA RTX 3070",
    vram: 8,
    power: 220,
    price: 0.30,
    from: "12:00",
    to: "22:00",
    photo: "rtx-3070.jpg",
  },
  {
    owner: "Victor Rossi",
    model: "NVIDIA RTX 3060 Ti",
    vram: 8,
    power: 200,
    price: 0.25,
    from: "18:00",
    to: "23:59",
    photo: "rtx-3060-ti.jpg",
  },
  {
    owner: "Victor Rossi",
    model: "NVIDIA RTX 3060",
    vram: 12,
    power: 170,
    price: 0.22,
    from: "09:00",
    to: "21:00",
    photo: "rtx-3060.jpg",
  },
  {
    owner: "Alex Morgan",
    model: "NVIDIA RTX 2080 Ti",
    vram: 11,
    power: 250,
    price: 0.28,
    from: "20:00",
    to: "23:59",
    photo: "rtx-2080-ti.jpg",
  },
  {
    owner: "Daniel Petroff",
    model: "NVIDIA RTX 4060",
    vram: 8,
    power: 115,
    price: 0.20,
    from: "08:00",
    to: "23:00",
    photo: "rtx-4060.jpg",
  },
];

const gpuIds = [];

for (const gpu of gpus) {
  const result = insertGpu.run(
    ownerIds[gpu.owner],
    gpu.model,
    gpu.vram,
    gpu.power,
    gpu.price,
    gpu.from,
    gpu.to,
    gpu.photo
  );

  gpuIds.push(result.lastInsertRowid);
}

// --------------------------------------------------
// Bookings
// --------------------------------------------------

const insertBooking = db.prepare(`
  INSERT INTO bookings (
    user_id,
    gpu_id,
    start_time,
    end_time,
    total_price,
    status
  )
  VALUES (?, ?, ?, ?, ?, ?)
`);

const booking1 = insertBooking.run(
  renterIds["Emma Wilson"],
  gpuIds[0],
  "2026-10-01 18:00",
  "2026-10-01 21:00",
  0.85 * 3,
  "completed"
);

const booking2 = insertBooking.run(
  renterIds["Liam Brown"],
  gpuIds[4],
  "2026-10-01 14:00",
  "2026-10-01 18:00",
  0.45 * 4,
  "completed"
);

const booking3 = insertBooking.run(
  renterIds["Emma Wilson"],
  gpuIds[8],
  "2026-10-02 19:00",
  "2026-10-02 22:00",
  0.25 * 3,
  "paid"
);

// --------------------------------------------------
// Reviews
// --------------------------------------------------

const insertReview = db.prepare(`
  INSERT INTO reviews (booking_id, stars, comment)
  VALUES (?, ?, ?)
`);

insertReview.run(
  booking1.lastInsertRowid,
  5,
  "Very fast GPU and everything worked perfectly."
);

insertReview.run(
  booking2.lastInsertRowid,
  4,
  "Good performance for the price. Easy to use."
);

// --------------------------------------------------
// Done
// --------------------------------------------------

console.log("Database seeded successfully!");
console.log(`Inserted ${owners.length} owners.`);
console.log(`Inserted ${renters.length} renters.`);
console.log(`Inserted ${gpus.length} GPUs.`);
console.log("Inserted 3 bookings.");
console.log("Inserted 2 reviews.");

db.close();
