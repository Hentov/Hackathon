import React from 'react';

interface SuccessPageProps {
  onHome: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ onHome }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrapper}>
          <span style={styles.icon}>✅</span>
        </div>
        
        <h1 style={styles.title}>Payment Successful!</h1>
        <p style={styles.subtitle}>Your machine is now ready to use.</p>

        <div style={styles.infoSection}>
          <h3 style={styles.sectionTitle}>Connection Details</h3>
          <p style={styles.text}>You can connect to your rented GPU using the credentials below. These credentials are valid for the duration of your rental.</p>
          
          <div style={styles.codeBox}>
            <span style={styles.label}>SSH Connection (Terminal):</span>
            <code style={styles.code}>ssh user-gpu@198.51.100.24 -p 2222</code>
          </div>

          <div style={styles.codeBox}>
            <span style={styles.label}>Password:</span>
            <code style={styles.code}>temp-share-pass-789</code>
          </div>

          <div style={styles.codeBox}>
            <span style={styles.label}>Jupyter Notebook (Browser):</span>
            <code style={styles.code}>http://198.51.100.24:8888</code>
           <span style={{ ...styles.label, display: 'block', marginTop: '5px', fontSize: '0.85rem' }}>Token: temp-share-pass-789</span>
          </div>
        </div>

        <button onClick={onHome} style={styles.homeBtn}>
          Back to Dashboard
        </button>
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
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '40px',
    border: '1px solid #334155',
    width: '100%',
    maxWidth: '600px',
    textAlign: 'center',
  },
  iconWrapper: {
    marginBottom: '20px',
  },
  icon: {
    fontSize: '4rem',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '2rem',
    color: '#10b981',
  },
  subtitle: {
    margin: '0 0 30px 0',
    color: '#94a3b8',
    fontSize: '1.1rem',
  },
  infoSection: {
    backgroundColor: '#0f172a',
    padding: '25px',
    borderRadius: '8px',
    textAlign: 'left',
    marginBottom: '30px',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '10px',
    color: '#38bdf8',
    fontSize: '1.3rem',
  },
  text: {
    color: '#cbd5e1',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  codeBox: {
    backgroundColor: '#1e293b',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #475569',
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.9rem',
    marginBottom: '8px',
  },
  code: {
    fontFamily: 'monospace',
    color: '#a7f3d0',
    fontSize: '1.1rem',
    userSelect: 'all',
  },
  homeBtn: {
    padding: '15px 30px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  }
};

export default SuccessPage;