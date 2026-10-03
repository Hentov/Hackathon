import React, { useState } from 'react';
//import { GpuItem } from './Dashboard';
import type { GpuItem } from './Dashboard';

export interface GpuDetailsItem extends GpuItem {
  ram: string;
  availableFrom: string;
  availableTo: string;
  provider: {
    name: string;
    rating: number;
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
    description: 'Оптимизирана машина за Machine Learning, AI training и тежки 3D рендеринг задачи.',
  };

  // Резервационни състояния
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [hours, setHours] = useState<number>(1);

  // Плащане и стъпки
  const [step, setStep] = useState<'booking' | 'payment' | 'completed'>('booking');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Отзив (Feedback)
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const totalPrice = (detailedGpu.price * hours).toFixed(2);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert('Моля, изберете дата!');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !cardNumber || !cardExpiry || !cardCvc) {
      alert('Моля, попълнете всички полета за плащане!');
      return;
    }

    const bookingData = {
      gpuId: detailedGpu.id,
      gpuType: detailedGpu.type,
      date,
      startTime,
      hours,
      totalPrice,
      customer: { fullName, email },
    };

    onBook(bookingData);
    setStep('completed');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Моля, изберете оценка от 1 до 5 звезди!');
      return;
    }
    setFeedbackSubmitted(true);
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backBtn}>
        ← Обратно към всички обяви
      </button>

      <div style={styles.card}>
        <div style={styles.grid}>
          {/* Лява колона: Информация за GPU и собственика */}
          <div>
            <img src={detailedGpu.image} alt={detailedGpu.type} style={styles.image} />
            <h2 style={styles.title}>{detailedGpu.type}</h2>

            <div style={styles.specBox}>
              <p><strong>VRAM Памет:</strong> {detailedGpu.ram}</p>
              <p><strong>Свободен компютър:</strong> От {detailedGpu.availableFrom} до {detailedGpu.availableTo} ч.</p>
              <p><strong>Цена:</strong> <span style={styles.priceHighlight}>€{detailedGpu.price.toFixed(2)} / час</span></p>
            </div>

            <div style={styles.providerBox}>
              <h3>За притежателя</h3>
              <p><strong>Име:</strong> {detailedGpu.provider.name}</p>
              <p>
                <strong>Feedback:</strong> ⭐ {detailedGpu.provider.rating} / 5.0 
                ({detailedGpu.provider.reviewCount} отзива)
              </p>
              <p style={styles.greenText}>
                🌱 <strong>Спестена излишна енергия:</strong> ~{detailedGpu.provider.energySavedKwh} kWh
              </p>
              <p style={styles.desc}>{detailedGpu.description}</p>
            </div>
          </div>

          {/* Дясна колона: Форма според стъпката */}
          <div style={styles.rightColumn}>
            
            {/* СТЪПКА 1: Избор на период */}
            {step === 'booking' && (
              <form onSubmit={handleProceedToPayment} style={styles.formBox}>
                <h3>1. Изберете период</h3>
                
                <div style={styles.inputGroup}>
                  <label>Дата:</label>
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
                  <span>Обща сума:</span>
                  <div style={styles.totalPrice}>€{totalPrice}</div>
                </div>

                <button type="submit" style={styles.actionBtn}>
                  Към плащане →
                </button>
              </form>
            )}

            {/* СТЪПКА 2: Плащане с кредитна/дебитна карта */}
            {step === 'payment' && (
              <form onSubmit={handlePaymentSubmit} style={styles.formBox}>
                <h3>2. Данни за плащане</h3>
                
                <div style={styles.inputGroup}>
                  <label>Две имена:</label>
                  <input
                    type="text"
                    placeholder="Иван Иванов"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label>Имейл за потвърждение:</label>
                  <input
                    type="email"
                    placeholder="ivan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label>Номер на карта:</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label>Валидност:</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                      style={styles.input}
                    />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label>CVC / CVV:</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={3}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      required
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.totalBox}>
                  <span>Дължима сума:</span>
                  <div style={styles.totalPrice}>€{totalPrice}</div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setStep('booking')} style={styles.secondaryBtn}>
                    Назад
                  </button>
                  <button type="submit" style={{ ...styles.actionBtn, flex: 2 }}>
                    Плати €{totalPrice}
                  </button>
                </div>
              </form>
            )}

            {/* СТЪПКА 3: Оставяне на feedback след ползване */}
            {step === 'completed' && (
              <div style={styles.formBox}>
                <div style={styles.successBadge}>
                  🎉 Плащането е успешно! Виртуалната машина е активирана.
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '20px 0' }} />

                <h3>Оставете Feedback за {detailedGpu.provider.name}</h3>
                
                {feedbackSubmitted ? (
                  <div style={styles.thankYouMessage}>
                    Благодарим ви за вашата оценка! Вашият отзив беше записан успешно.
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px' }}>
                      Как оценявате работата си с тази видеокарта?
                    </p>

                    {/* Рейтинг със звезди */}
                    <div style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            ...styles.star,
                            color: (hoverRating || rating) >= star ? '#f59e0b' : '#475569',
                          }}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <div style={styles.inputGroup}>
                      <label>Коментар (незадължително):</label>
                      <textarea
                        rows={3}
                        placeholder="Опишете как мина работата..."
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        style={{ ...styles.input, resize: 'vertical' }}
                      />
                    </div>

                    <button type="submit" style={styles.actionBtn}>
                      Изпрати отзив
                    </button>
                  </form>
                )}
              </div>
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
    maxWidth: '950px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  formBox: {
    backgroundColor: '#0f172a',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #334155',
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
    fontSize: '1rem',
  },
  totalBox: {
    margin: '15px 0',
    padding: '12px',
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
  actionBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  secondaryBtn: {
    padding: '12px',
    backgroundColor: '#475569',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  successBadge: {
    backgroundColor: '#065f46',
    color: '#a7f3d0',
    padding: '15px',
    borderRadius: '6px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  starsContainer: {
    display: 'flex',
    gap: '10px',
    fontSize: '2rem',
    cursor: 'pointer',
    marginBottom: '15px',
  },
  star: {
    transition: 'color 0.2s',
  },
  thankYouMessage: {
    backgroundColor: '#1e293b',
    color: '#38bdf8',
    padding: '15px',
    borderRadius: '6px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
};

export default GpuDetails;