import React, { useState } from 'react';
import { onImgError, type GpuItem } from './Dashboard';

interface GpuDetailsProps {
  gpu: GpuItem;
  onBack: () => void;
  // The payment function can accept transaction details
  onPay: (totalPrice: number, hours: number) => void; 
}

const GpuDetails: React.FC<GpuDetailsProps> = ({ gpu, onBack, onPay }) => {
  const [rentHours, setRentHours] = useState<number>(1);
 

  // Calculate final price
  const totalPrice = gpu.price * rentHours;
  // Energy = power (W) x hours / 1000
  const energyKwh = (gpu.powerW * rentHours) / 1000;

  

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backBtn}>
        &#8592; Back to all GPUs
      </button>

      <div style={styles.card}>
        <div style={styles.grid}>
          {/* Left column: Image and Specs */}
          <div>
            <img src={gpu.image} alt={gpu.type} onError={onImgError} style={styles.image} />
            <h2 style={styles.title}>{gpu.type}</h2>
            
            <div style={styles.infoBox}>
              <h4 style={styles.infoTitle}>Technical Specifications:</h4>
              <p style={styles.infoText}>{gpu.vramGb} GB VRAM · {gpu.powerW} W</p>
            </div>

            <div style={styles.infoBox}>
              <h4 style={styles.infoTitle}>Owner:</h4>
              <p style={styles.infoText}>
                {gpu.ownerUsername} · {gpu.ownerRating ? `★ ${gpu.ownerRating} / 5` : 'No ratings yet'}
              </p>
            </div>

            <div style={styles.infoBox}>
              <h4 style={styles.infoTitle}>Availability & Schedule:</h4>
              <p style={styles.infoText}>
                🟢 <strong>Available for rent:</strong> Every day from {gpu.availableFrom} to {gpu.availableTo} h.
              </p>
              <p style={styles.infoText}>
                Maximum rental time: <strong>{gpu.availableHours} hours</strong>
              </p>
            </div>
          </div>

          {/* Right column: Pricing and Payment */}
          <div style={styles.checkoutSection}>
            <h3 style={styles.checkoutTitle}>Rental Details</h3>
            
            <div style={styles.priceRow}>
              <span>Price per hour:</span>
              <span style={styles.highlightPrice}>€{gpu.price.toFixed(2)}</span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>How many hours will you rent the machine?</label>
              <input 
                type="number" 
                min="1" 
                max={gpu.availableHours} 
                value={rentHours} 
                onChange={(e) =>
                  setRentHours(Math.min(gpu.availableHours, Math.max(1, Number(e.target.value) || 1)))
                }
                style={styles.input}
              />
            </div>

            <div style={styles.priceRow}>
              <span>Energy consumed:</span>
              <span>{energyKwh.toFixed(2)} kWh</span>
            </div>

            <div style={styles.totalRow}>
              <span>Total amount:</span>
              <span style={styles.totalPrice}>€{totalPrice.toFixed(2)}</span>
            </div>

           <button onClick={() => onPay(totalPrice, rentHours)} style={styles.payBtn}>
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#0f172a',
    color: '#fff',
    minHeight: '100vh',
    padding: '20px',
  },
  backBtn: {
    padding: '10px 15px',
    backgroundColor: '#334155',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '30px',
    border: '1px solid #334155',
    maxWidth: '900px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '40px',
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  title: {
    fontSize: '2rem',
    color: '#38bdf8',
    margin: '20px 0 10px 0',
  },
  infoBox: {
    backgroundColor: '#0f172a',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px',
  },
  infoTitle: {
    margin: '0 0 10px 0',
    color: '#94a3b8',
    fontSize: '1rem',
  },
  infoText: {
    margin: '5px 0',
    fontSize: '0.95rem',
  },
  checkoutSection: {
    backgroundColor: '#0f172a',
    padding: '25px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  checkoutTitle: {
    marginTop: 0,
    marginBottom: '20px',
    borderBottom: '1px solid #334155',
    paddingBottom: '10px',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.2rem',
    marginBottom: '20px',
  },
  highlightPrice: {
    color: '#38bdf8',
    fontWeight: 'bold',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '25px',
  },
  label: {
    marginBottom: '10px',
    color: '#94a3b8',
  },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #475569',
    backgroundColor: '#1e293b',
    color: '#fff',
    fontSize: '1.1rem',
    outline: 'none',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '30px',
    paddingTop: '15px',
    borderTop: '1px solid #334155',
  },
  totalPrice: {
    color: '#10b981',
  },
  payBtn: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  successMessage: {
    backgroundColor: '#065f46',
    color: '#a7f3d0',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1.1rem',
  }
};

export default GpuDetails;