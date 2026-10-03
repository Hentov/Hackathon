import React, { useState } from 'react';

interface PaymentPageProps {
  totalAmount: number;
  onBack: () => void;
  onSuccess: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ totalAmount, onBack, onSuccess }) => {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Тук в реално приложение се изпращат данните към Stripe/PayPal
    onSuccess();
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backBtn}>
        &#8592; Back to Details
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>Secure Checkout</h2>
        <p style={styles.subtitle}>Total Amount to Pay: <span style={styles.highlight}>€{totalAmount.toFixed(2)}</span></p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Cardholder Name</label>
            <input 
              type="text" 
              required 
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Card Number</label>
            <input 
              type="text" 
              required 
              maxLength={19}
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.inputGroup, flex: 1, marginRight: '15px' }}>
              <label style={styles.label}>Expiration Date</label>
              <input 
                type="text" 
                required 
                maxLength={5}
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>CVV</label>
              <input 
                type="text" 
                required 
                maxLength={3}
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" style={styles.payBtn}>
            Confirm Payment of €{totalAmount.toFixed(2)}
          </button>
        </form>
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    alignSelf: 'flex-start',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '40px',
    border: '1px solid #334155',
    width: '100%',
    maxWidth: '500px',
    marginTop: '20px',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '1.8rem',
  },
  subtitle: {
    margin: '0 0 30px 0',
    color: '#94a3b8',
    fontSize: '1.1rem',
  },
  highlight: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  label: {
    marginBottom: '8px',
    color: '#cbd5e1',
    fontSize: '0.9rem',
  },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
  },
  payBtn: {
    marginTop: '10px',
    padding: '15px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  }
};

export default PaymentPage;