import React, { useState } from 'react';

export interface GpuItem {
  id: number;
  type: string;
  price: number;
  image: string;
  availableHours: number;
}

const MOCK_GPUS: GpuItem[] = [
  { id: 1, type: 'RTX 4070', price: 1.50, image: 'https://via.placeholder.com/250x150?text=RTX+4070', availableHours: 8 },
  { id: 2, type: 'RTX 4070', price: 1.60, image: 'https://via.placeholder.com/250x150?text=RTX+4070', availableHours: 5 },
  { id: 3, type: 'RTX 4080', price: 2.20, image: 'https://via.placeholder.com/250x150?text=RTX+4080', availableHours: 12 },
  { id: 4, type: 'RTX 4090', price: 3.50, image: 'https://via.placeholder.com/250x150?text=RTX+4090', availableHours: 10 },
  { id: 5, type: 'NVIDIA A100', price: 5.00, image: 'https://via.placeholder.com/250x150?text=NVIDIA+A100', availableHours: 24 },
];

interface DashboardProps {
  user: { email: string };
  onLogout: () => void;
  onSelectGpu: (gpu: GpuItem) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onSelectGpu }) => {
  const [selectedType, setSelectedType] = useState('All');

  const filteredGpus = selectedType === 'All' 
    ? MOCK_GPUS 
    : MOCK_GPUS.filter(gpu => gpu.type === selectedType);

  const totalAvailableGpus = filteredGpus.length;
  const totalHours = filteredGpus.reduce((acc, gpu) => acc + gpu.availableHours, 0);

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1>GPU SHARE</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Hello, {user.email}</span>
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
          <option value="RTX 4070">RTX 4070</option>
          <option value="RTX 4080">RTX 4080</option>
          <option value="RTX 4090">RTX 4090</option>
          <option value="NVIDIA A100">NVIDIA A100</option>
        </select>
      </div>

      <main style={styles.gpuGrid}>
        {filteredGpus.map((gpu) => (
          <div key={gpu.id} style={styles.gpuCard}>
            <img src={gpu.image} alt={gpu.type} style={styles.cardImg} />
            <div style={styles.cardBody}>
              <h3>{gpu.type}</h3>
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