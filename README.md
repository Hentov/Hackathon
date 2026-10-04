# GPU Share

Rent idle graphics cards by the hour, and see the energy every rental uses.
Made for a 48-hour hackathon with the theme **"the energy around us"**.

## Features

- Register and log in (passwords are stored as bcrypt hashes). Every account can both rent and host.
- Home page with the Saved energy panel (saved hours and kWh) and a GPU list that can be filtered by model.
- GPU details with the host rating, a 24-hour bar of the free hours, and a live price and kWh for the chosen time.
- Booking with checks on the server: no past times, no overlapping bookings, only inside the free hours.
- Simulated card payment. A valid-looking card works, a card ending in `0002` is declined. Nothing is stored.
- My bookings: upcoming, active and ended rentals, connection details during the rental, and a rating form.
- Host a GPU: set the price and daily free hours, add remote access (for example an AnyDesk ID), edit it later.
- Profile page with the saved hours and kWh of the host.

Energy: `kWh = watts x hours / 1000`. For example an RTX 4090 at 450 W for 3 hours uses 1.35 kWh.


## Run it

You need a recent Node.js (LTS).

```bash
# 1. Backend: install, create the database and fill it with example data
npm install
node database/setup.js
node database/seed.js
node server.js            # runs on http://localhost:3000

# 2. Frontend (in a second terminal)
cd Use-my-GPU
npm install
npm run dev               # runs on http://localhost:5173
```

Open http://localhost:5173.

The seed creates 9 users, 14 GPUs, 4 bookings and 3 reviews. All example accounts use the
password `demo1234`, for example `emma@example.com` (renter) and `alex@example.com` (host).
Running the seed again deletes the current data and recreates the examples.

## Notes about this prototype

- The payment is simulated and no card data is stored.
- Login is a prototype: the browser sends the user id and there are no tokens yet.
- Connection details are given only to the person who booked, and only while the rental is active.
  The site does not yet end the remote session by itself when the booked time is over.
- GPUs without saved remote access show a placeholder ID and password.

## Next steps

- A small program on the host PC that ends access when the time is over, and isolates the renter in a container
- Real payments with a payment provider
- Measure the real power use of the GPU and show the saved energy as CO2
- One shared server, login with tokens, cancellations and an earnings page for hosts
