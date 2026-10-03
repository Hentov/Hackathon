import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000';

export interface GpuItem {
  id: number;
  type: string;
  price: number;
  image: string;
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
  photo: string;
  owner_username: string;
  owner_rating: number | null;
}

const toHours = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
};

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='250' height='150'><rect width='100%' height='100%' fill='#334155'/><text x='50%' y='50%' fill='#94a3b8' font-family='sans-serif' font-size='16' text-anchor='middle'>GPU</text></svg>"
  );

const mapGpu = (g: ApiGpu): GpuItem => ({
  id: g.id,
  type: g.model,
  price: g.price_per_hour,
  image: `/images/${g.photo}`,
  availableHours: Math.max(1, Math.round(toHours(g.available_to) - toHours(g.available_from))),
  vramGb: g.vram_gb,
  powerW: g.power_w,
  availableFrom: g.available_from,
  availableTo: g.available_to,
  ownerUsername: g.owner_username,
  ownerRating: g.owner_rating,
});

export const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = PLACEHOLDER;
};

interface DashboardProps {
  user: { username: string }; // ПРОМЯНА: сменихме email на username
  onLogout: () => void;
  onSelectGpu: (gpu: GpuItem) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onSelectGpu }) => {
  const [selectedType, setSelectedType] = useState('All');

  const [models, setModels] = useState<string[]>([]);
  const [gpus, setGpus] = useState<GpuItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/gpu-models`)
      .then((r) => r.json())
      .then(setModels)
      .catch(() => setError('Cannot reach the server'));
  }, []);

  useEffect(() => {
    const query = selectedType === 'All' ? '' : `?model=${encodeURIComponent(selectedType)}`;
    fetch(`${API_URL}/api/gpus${query}`)
      .then((r) => r.json())
      .then((rows: ApiGpu[]) => {
        setGpus(rows.map(mapGpu));
        setError('');
      })
      .catch(() => setError('Cannot reach the server'));
  }, [selectedType]);

  const filteredGpus = gpus;

  const totalAvailableGpus = filteredGpus.length;
  const totalHours = filteredGpus.reduce((acc, gpu) => acc + gpu.availableHours, 0);

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1>GPU SHARE</h1>
        <div>
          {/* ПРОМЯНА: тук вече се извиква user.username */}
          <span style={{ marginRight: '15px' }}>Hello, {user.username}</span>
          <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <section style={styles.statsSection}>
        <div style={styles.statCard}>
          <h3>Available GPUs</h3>
          <p>{totalAvailableGpus} units</p>
        </div>
        <div style={styles.statCard}>
          <h3>Total Available Hours</h3>
          <p>{totalHours} hours</p>
        </div>
      </section>

      <div style={styles.floatingMenu}>
        <label style={{ fontWeight: 'bold' }}>Select GPU model: </label>
        <select 
          value={selectedType} 
          onChange={(e) => setSelectedType(e.target.value)}
          style={styles.select}
        >
          <option value="All">All models</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <main style={styles.gpuGrid}>
        {filteredGpus.map((gpu) => (
          <div key={gpu.id} style={styles.gpuCard}>
            <img src={gpu.image} alt={gpu.type} onError={onImgError} style={styles.cardImg} />
            <div style={styles.cardBody}>
              <h3>{gpu.type}</h3>
              <p style={{ color: '#94a3b8', margin: '5px 0' }}>
                {gpu.ownerUsername} · {gpu.ownerRating ? `★ ${gpu.ownerRating}` : 'No ratings yet'}
              </p>
              <p style={styles.price}>Price: €{gpu.price.toFixed(2)} / hour</p>
              <button 
                onClick={() => onSelectGpu(gpu)} 
                style={styles.detailsBtn}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  dashboard: {
    backgroundColor: '#0f172a',
    color: '#fff',
    minHeight: '100vh',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
    borderBottom: '1px solid #334155',
  },
  logoutBtn: {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  statsSection: {
    display: 'flex',
    gap: '20px',
    margin: '25px 0',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #334155',
  },
  floatingMenu: {
    position: 'sticky',
    top: '10px',
    zIndex: 100,
    backgroundColor: '#1e293b',
    padding: '15px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: '#0f172a',
    color: '#fff',
    border: '1px solid #475569',
    cursor: 'pointer',
  },
  gpuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  gpuCard: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #334155',
  },
  cardImg: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  cardBody: {
    padding: '15px',
  },
  price: {
    color: '#38bdf8',
    fontWeight: 'bold',
    margin: '10px 0',
  },
  detailsBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};

export default Dashboard;