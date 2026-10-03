import React, { useEffect, useState } from 'react';
import { api } from '../api';
import Strip from './Strip';
import type { UserData } from './Login';

interface Props {
  user: UserData;
}

interface MyGpu {
  id: number;
  model: string;
  vram_gb: number;
  power_w: number;
  price_per_hour: number;
  available_from: string;
  available_to: string;
  upcoming_bookings: number;
}

// Common cards: picking one fills in the memory and power
const PRESETS: Record<string, { vram: number; power: number }> = {
  'NVIDIA RTX 4090': { vram: 24, power: 450 },
  'NVIDIA RTX 4080 SUPER': { vram: 16, power: 320 },
  'NVIDIA RTX 4070 Ti SUPER': { vram: 16, power: 285 },
  'NVIDIA RTX 4070 SUPER': { vram: 12, power: 220 },
  'NVIDIA RTX 4060 Ti': { vram: 16, power: 165 },
  'NVIDIA RTX 3090': { vram: 24, power: 350 },
  'NVIDIA RTX 3080': { vram: 10, power: 320 },
  'NVIDIA RTX 3070': { vram: 8, power: 220 },
  'NVIDIA RTX 3060': { vram: 12, power: 170 },
  'NVIDIA A100': { vram: 80, power: 400 },
};

const HostPage: React.FC<Props> = ({ user }) => {
  const [model, setModel] = useState('');
  const [vram, setVram] = useState('');
  const [power, setPower] = useState('');
  const [price, setPrice] = useState('');
  const [from, setFrom] = useState('18:00');
  const [to, setTo] = useState('23:59');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState<MyGpu[]>([]);

  const loadMine = () =>
    api<MyGpu[]>(`/api/my-gpus?owner_id=${user.id}`)
      .then(setMine)
      .catch(() => {});

  useEffect(() => {
    loadMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const onModelChange = (value: string) => {
    setModel(value);
    const preset = PRESETS[value];
    if (preset) {
      setVram(String(preset.vram));
      setPower(String(preset.power));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDone('');
    setBusy(true);
    try {
      await api('/api/gpus', {
        method: 'POST',
        body: {
          owner_id: user.id,
          model,
          vram_gb: Number(vram),
          power_w: Number(power),
          price_per_hour: Number(price),
          available_from: from,
          available_to: to,
        },
      });
      setDone(`"${model}" is now listed and visible to renters.`);
      setModel('');
      setVram('');
      setPower('');
      setPrice('');
      loadMine();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main>
      <div className="detail">
        <div className="slip">
          <h2>List your GPU</h2>
          {done && <div className="ok" role="status">{done}</div>}
          {error && <div className="err" role="alert">{error}</div>}

          <form onSubmit={submit}>
            <label htmlFor="model">GPU model</label>
            <input
              id="model"
              list="gpu-presets"
              required
              maxLength={60}
              placeholder="NVIDIA RTX 4090"
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
            />
            <datalist id="gpu-presets">
              {Object.keys(PRESETS).map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>

            <div className="row2">
              <div>
                <label htmlFor="vram">Memory (GB)</label>
                <input id="vram" type="number" min={1} max={256} required value={vram} onChange={(e) => setVram(e.target.value)} />
              </div>
              <div>
                <label htmlFor="power">Power draw (W)</label>
                <input id="power" type="number" min={1} max={1500} required value={power} onChange={(e) => setPower(e.target.value)} />
              </div>
            </div>

            <label htmlFor="price">Price per hour (€)</label>
            <input id="price" type="number" min={0.01} max={100} step={0.01} required value={price} onChange={(e) => setPrice(e.target.value)} />

            <div className="row2">
              <div>
                <label htmlFor="from">Free from</label>
                <input id="from" type="time" required value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <label htmlFor="to">Free until</label>
                <input id="to" type="time" required value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>

            <p className="small" style={{ marginBottom: 6 }}>
              Renters can book your GPU every day inside this window.
            </p>
            {from && to && <Strip from={from} to={to} labels />}

            <button type="submit" className="btn w" style={{ marginTop: 22 }} disabled={busy}>
              {busy ? 'Saving...' : 'Create listing'}
            </button>
          </form>
        </div>

        <div>
          <h2>My listings</h2>
          {mine.length === 0 && <p>You have not listed a GPU yet. Fill in the form to add your first one.</p>}
          {mine.map((g) => (
            <div key={g.id} className="sum" style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="tx" style={{ font: '800 26px/1 var(--display)' }}>{g.model}</span>
                <span className="tx" style={{ font: '800 24px/1 var(--display)' }}>€{g.price_per_hour.toFixed(2)}/h</span>
              </div>
              <p className="small" style={{ margin: '6px 0 8px' }}>
                {g.vram_gb} GB memory, {g.power_w} W, free {g.available_from} to {g.available_to}.{' '}
                {g.upcoming_bookings} upcoming {g.upcoming_bookings === 1 ? 'booking' : 'bookings'}.
              </p>
              <Strip from={g.available_from} to={g.available_to} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default HostPage;
