import React, { useEffect, useMemo, useState } from 'react';
import { Star } from './icons';
import Strip from './Strip';
import { API_URL } from '../api';

export interface GpuItem {
  id: number;
  type: string;
  price: number;
  availableHours: number;
  vramGb: number;
  powerW: number;
  availableFrom: string;
  availableTo: string;
  ownerUsername: string;
  ownerRating: number | null;
}

interface ApiGpu {
  id: number;
  model: string;
  vram_gb: number;
  power_w: number;
  price_per_hour: number;
  available_from: string;
  available_to: string;
  photo: string | null;
  owner_username: string;
  owner_rating: number | null;
}

const toHours = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
};
const endHour = (t: string) => (t === '23:59' ? 24 : toHours(t));

const mapGpu = (g: ApiGpu): GpuItem => ({
  id: g.id,
  type: g.model,
  price: g.price_per_hour,
  availableHours: Math.max(1, Math.round(endHour(g.available_to) - toHours(g.available_from))),
  vramGb: g.vram_gb,
  powerW: g.power_w,
  availableFrom: g.available_from,
  availableTo: g.available_to,
  ownerUsername: g.owner_username,
  ownerRating: g.owner_rating,
});

// "NVIDIA RTX 4090" -> brand "NVIDIA", name "RTX 4090"
export const splitModel = (model: string) => {
  const m = model.match(/^(NVIDIA|AMD|Intel)\s+(.*)$/i);
  return m ? { brand: m[1], name: m[2] } : { brand: '', name: model };
};

interface DashboardProps {
  onSelectGpu: (gpu: GpuItem) => void;
  onHost: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectGpu, onHost }) => {
  const [selectedType, setSelectedType] = useState('All');
  const [all, setAll] = useState<GpuItem[]>([]);
  const [energyKwh, setEnergyKwh] = useState(0);
  const [savedHours, setSavedHours] = useState(0);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/gpus`)
      .then((r) => r.json())
      .then((rows: ApiGpu[]) => {
        setAll(rows.map(mapGpu));
        setError('');
      })
      .catch(() => setError('Cannot reach the server. Is it running?'))
      .finally(() => setLoaded(true));
    fetch(`${API_URL}/api/stats`)
      .then((r) => r.json())
      .then((s) => {
        setEnergyKwh(s.energyKwh ?? 0);
        setSavedHours(s.savedHours ?? 0);
      })
      .catch(() => {});
  }, []);

  const models = useMemo(() => Array.from(new Set(all.map((g) => g.type))).sort(), [all]);
  const rows = selectedType === 'All' ? all : all.filter((g) => g.type === selectedType);

  return (
    <main>
      <section className="hero">
        <div>
          <h1>Rent idle GPU power by the hour</h1>
          <p className="lead">
            Pick a graphics card that is sitting unused, book the hours you need and connect to it.
          </p>
          <div className="cta">
            <a className="btn" href="#gpus">Find a GPU</a>
            <button className="btn ghost" onClick={onHost}>Host yours</button>
          </div>
        </div>

        <div className="panel">
          <h3>Saved energy</h3>
          <p className="small">Idle GPU time that was put to use instead of sitting unused.</p>
          <div className="saved">
            <div>
              <span className="n">{savedHours}<small>h</small></span>
              <span className="l">Hours saved</span>
            </div>
            <div className="volt">
              <span className="n">{energyKwh}<small>kWh</small></span>
              <span className="l">Energy used by rentals</span>
            </div>
          </div>
          <p className="small foot">{all.length} GPUs listed right now</p>
        </div>
      </section>

      <h2 id="gpus">Available GPUs</h2>

      <div className="filter">
        <div className="pick">
          <label htmlFor="model">GPU model</label>
          <select id="model" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="All">All models</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <p className="count">{rows.length} {rows.length === 1 ? 'GPU' : 'GPUs'} shown</p>
      </div>

      {error && <div className="err">{error}</div>}

      <div className="board">
        <div className="board-head" aria-hidden="true">
          <span>GPU</span>
          <span>Memory</span>
          <span>Power</span>
          <span>Free every day</span>
          <span>Host</span>
          <span style={{ textAlign: 'right' }}>Price</span>
          <span />
        </div>

        {loaded && !error && rows.length === 0 && (
          <p className="empty">No GPUs listed for this model yet.</p>
        )}

        {rows.map((gpu) => {
          const { brand, name } = splitModel(gpu.type);
          return (
            <div key={gpu.id} className="row">
              <div className="c-model model">
                {name}
                {brand && <small>{brand}</small>}
              </div>
              <div>{gpu.vramGb} GB</div>
              <div>{gpu.powerW} W</div>
              <div className="c-window">
                <Strip from={gpu.availableFrom} to={gpu.availableTo} />
                <div className="when">{gpu.availableFrom} to {gpu.availableTo}</div>
              </div>
              <div className="host">
                {gpu.ownerUsername}
                <span>
                  {gpu.ownerRating ? (
                    <><span className="star"><Star size={13} /></span>{gpu.ownerRating}</>
                  ) : (
                    'New host'
                  )}
                </span>
              </div>
              <div className="price">€{gpu.price.toFixed(2)}<small>/h</small></div>
              <div className="go">
                <button className="btn sm" onClick={() => onSelectGpu(gpu)}>Book</button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default Dashboard;
