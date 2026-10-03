import React, { useState } from 'react';
//import { GpuItem } from './Dashboard';
import type { GpuItem } from './Dashboard';

export interface GpuDetailsItem extends GpuItem {
  ram: string;
  availableFrom: string;
  availableTo: string;
  provider: {
    name: string;
    rating: number; // e.g. 4.9 / 5
    reviewCount: number;
    energySavedKwh: number;
  };
  description?: string;
}

interface GpuDetailsProps {
  gpu: GpuItem;
  onBack: () => void;
  onBook: (bookingInfo: any) => void;
}

const GpuDetails: React.FC<GpuDetailsProps> = ({ gpu, onBack, onBook }) => {
  // Разширяваме данните с примерни характеристики, ако липсват
  const detailedGpu: GpuDetailsItem = {
    ...gpu,
    ram: gpu.type.includes('A100') ? '80 GB HBM2e' : gpu.type.includes('4090') ? '24 GB GDDR6X' : '16 GB GDDR6X',
    availableFrom: '08:00',
    availableTo: '22:00',
    provider: {
      name: 'Alex Developer',
      rating: 4.9,
      reviewCount: 38,
      energySavedKwh: 142.5,
    },
    description: 'Оптимизирана машина за Machine Learning, AI training и тежки 3D луупове/рендеринг. Стабилна връзка и ниско закъснение.',
  };

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [hours, setHours] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalPrice = (detailedGpu.price * hours).toFixed(2);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert('Моля, изберете дата за наемане!');
      return;
    }

    const bookingData = {
      gpuId: detailedGpu.id,
      gpuType: detailedGpu.type,
      date,
      startTime,
      hours,
      totalPrice,
    };

    setIsSuccess(true);
    onBook(bookingData);
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backBtn}>
        ← Обратно към всички обяви
      </button>

      <div style={styles.card}>
        <div style={styles.grid}>
          {/* Лява колона: Изображение и Информация за GPU */}
          <div>
            <img src={detailedGpu.image} alt={detailedGpu.type} style={styles.image} />
            <h2 style={styles.title}>{detailedGpu.type}</h2>
            
            <div style={styles.specBox}>
              <p><strong>VRAM Памет:</strong> {detailedGpu.ram}</p>
              <p><strong>Работно време на машината:</strong> От {detailedGpu.availableFrom} до {detailedGpu.availableTo} ч.</p>
              <p><strong>Цена:</strong> <span style={styles.priceHighlight}>€{detailedGpu.price.toFixed(2)} / час</span></p>
            </div>

            {/* Профил и рейтинг на притежателя */}
            <div style={styles.providerBox}>
              <h3>Притежател на видеокартата</h3>
              <p><strong>Име:</strong> {detailedGpu.provider.name}</p>
              <p>
                <strong>Feedback:</strong> ⭐ {detailedGpu.provider.rating} / 5.0 
                ({detailedGpu.provider.reviewCount} положителни отзива)
              </p>
              <p style={styles.greenText}>
                🌱 <strong>Спестена излишна енергия:</strong> ~{detailedGpu.provider.energySavedKwh} kWh
              </p>
              <p style={styles.desc}>{detailedGpu.description}</p>
            </div>
          </div>

          {/* Дясна колона: Форма за избор на период и плащане */}
          <div style={styles.bookingBox}>
            <h3>Наемане на виртуална машина</h3>
            
            {isSuccess ? (
              <div style={styles.successMessage}>
                🎉 Успешно резервирахте {detailedGpu.type}!
                <br />
                <small>Период: {date} от {startTime} за {hours} ч.</small>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <div style={styles.inputGroup}>
                  <label>Изберете дата:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label>Начален час:</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label>Продължителност (часове):</label>
                  <input
                    type="number"
                    min="1"
                    max={detailedGpu.availableHours}
                    value={hours}
                    onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                    style={styles.input}
                  />
                </div>

                <div style={styles.totalBox}>
                  <span>Обща сума за плащане:</span>
                  <div style={styles.totalPrice}>€{totalPrice}</div>
                </div>

                <button type="submit" style={styles.confirmBtn}>
                  Потвърди и наеми GPU
                </button>
              </form>
            )}
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
    padding: '8px 16px',
    backgroundColor: '#334155',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '25px',
    border: '1px solid #334155',
    maxWidth: '900px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },
  image: {
    width: '100%',
    borderRadius: '8px',
    height: '200px',
    objectFit: 'cover',
  },
  title: {
    margin: '15px 0 10px 0',
    color: '#38bdf8',
  },
  specBox: {
    backgroundColor: '#0f172a',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  priceHighlight: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  providerBox: {
    backgroundColor: '#0f172a',
    padding: '15px',
    borderRadius: '8px',
    lineHeight: '1.6',
  },
  greenText: {
    color: '#34d399',
  },
  desc: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    marginTop: '10px',
  },
  bookingBox: {
    backgroundColor: '#0f172a',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #475569',
    backgroundColor: '#1e293b',
    color: '#fff',
  },
  totalBox: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#1e293b',
    borderRadius: '6px',
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#38bdf8',
    marginTop: '5px',
  },
  confirmBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    marginTop: '15px',
  },
  successMessage: {
    backgroundColor: '#065f46',
    color: '#a7f3d0',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
};

export default GpuDetails;