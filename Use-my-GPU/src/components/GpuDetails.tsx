import React, { useEffect, useMemo, useState } from 'react';
import { splitModel, type GpuItem } from './Dashboard';
import { Star } from './icons';
import Strip from './Strip';
import { api, type BookingDraft } from '../api';

interface GpuDetailsProps {
  gpu: GpuItem;
  onBack: () => void;
  onPay: (draft: BookingDraft) => void;
}

type Busy = { start_time: string; end_time: string };

const pad = (n: number) => String(n).padStart(2, '0');
const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const nowStamp = () => {
  const d = new Date();
  return `${localDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
// "2026-10-04" + minutes after midnight (may pass 1440) -> "2026-10-04 18:00"
const stamp = (date: string, minutes: number) => {
  const d = new Date(date + 'T00:00:00Z');
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};
const clock = (minutes: number) => `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;

const GpuDetails: React.FC<GpuDetailsProps> = ({ gpu, onBack, onPay }) => {
  const [date, setDate] = useState(localDate(new Date()));
  const [hours, setHours] = useState(1);
  const [start, setStart] = useState<number | null>(null);
  const [busy, setBusy] = useState<Busy[]>([]);

  // Slots that are already booked
  useEffect(() => {
    api<{ busy: Busy[] }>(`/api/gpus/${gpu.id}`)
      .then((d) => setBusy(d.busy))
      .catch(() => {});
  }, [gpu.id]);

  const from = toMin(gpu.availableFrom);
  const limit = gpu.availableTo === '23:59' ? 1440 : toMin(gpu.availableTo);

  // Every possible start time that day and whether it can be booked
  const slots = useMemo(() => {
    const now = nowStamp();
    const out: { m: number; state: 'ok' | 'booked' | 'past' }[] = [];
    for (let m = from; m + hours * 60 <= limit; m += 60) {
      const s = stamp(date, m);
      const e = stamp(date, m + hours * 60);
      let state: 'ok' | 'booked' | 'past' = 'ok';
      if (s <= now) state = 'past';
      else if (busy.some((b) => b.start_time < e && b.end_time > s)) state = 'booked';
      out.push({ m, state });
    }
    return out;
  }, [date, hours, busy, from, limit]);

  // Keep the chosen start valid when the date or hours change
  useEffect(() => {
    const firstOk = slots.find((s) => s.state === 'ok');
    setStart((prev) =>
      prev !== null && slots.some((s) => s.m === prev && s.state === 'ok')
        ? prev
        : firstOk
          ? firstOk.m
          : null,
    );
  }, [slots]);

  const total = Number((gpu.price * hours).toFixed(2));
  // Energy = power (W) x hours / 1000
  const energyKwh = (gpu.powerW * hours) / 1000;

  const { brand, name } = splitModel(gpu.type);

  return (
    <main>
      <button className="back" onClick={onBack}>&#8592; Back to all GPUs</button>

      <div className="detail">
        <div>
          <h1 className="title">{name}</h1>
          <p className="brand">{brand ? `${brand} graphics card` : 'Graphics card'}</p>

          <dl className="specs">
            <div><dt>Memory</dt><dd>{gpu.vramGb} GB</dd></div>
            <div><dt>Power draw</dt><dd>{gpu.powerW} W</dd></div>
            <div><dt>Free every day</dt><dd>{gpu.availableFrom} to {gpu.availableTo}</dd></div>
            <div><dt>Longest rental</dt><dd>{gpu.availableHours} hours</dd></div>
          </dl>

          <Strip from={gpu.availableFrom} to={gpu.availableTo} labels />

          <h3 style={{ marginTop: 34 }}>Host</h3>
          <div className="own">
            <div className="av">{gpu.ownerUsername.charAt(0)}</div>
            <div>
              <div className="tx">{gpu.ownerUsername}</div>
              <p className="small">
                {gpu.ownerRating ? (
                  <><span className="amber"><Star /></span> {gpu.ownerRating} out of 5</>
                ) : (
                  'No ratings yet'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="slip sticky">
          <h3>Book this GPU</h3>

          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            min={localDate(new Date())}
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
          />

          <div className="row2">
            <div>
              <label htmlFor="hours">Hours</label>
              <select id="hours" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                {Array.from({ length: gpu.availableHours }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="start">Start time</label>
              <select
                id="start"
                value={start ?? ''}
                onChange={(e) => setStart(Number(e.target.value))}
                disabled={start === null}
              >
                {start === null && <option value="">No free slot</option>}
                {slots.map((s) => (
                  <option key={s.m} value={s.m} disabled={s.state !== 'ok'}>
                    {clock(s.m)} to {clock(s.m + hours * 60)}
                    {s.state === 'booked' ? ' (booked)' : s.state === 'past' ? ' (past)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {start === null && (
            <p className="small" style={{ margin: '-6px 0 14px' }}>
              No free {hours}-hour slot on this day. Try another date or fewer hours.
            </p>
          )}

          <div className="sum"><span>Price per hour</span><span>€{gpu.price.toFixed(2)}</span></div>
          <div className="sum"><span>Energy used</span><span>{energyKwh.toFixed(2)} kWh</span></div>
          <div className="sum total">
            <span>Total</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          <button
            className="btn w"
            style={{ marginTop: 14 }}
            disabled={start === null}
            onClick={() => start !== null && onPay({ date, start: clock(start), hours, total })}
          >
            Continue to payment
          </button>
        </div>
      </div>
    </main>
  );
};

export default GpuDetails;
