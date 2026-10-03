import { useState } from 'react';
import Login, { type UserData } from './components/Login';
import Dashboard, { type GpuItem } from './components/Dashboard';
import GpuDetails from './components/GpuDetails';
import PaymentPage from './components/PaymentPage';
import SuccessPage from './components/SuccessPage'; // Импортираме новата страница за успех

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedGpu, setSelectedGpu] = useState<GpuItem | null>(null);
  const [paymentData, setPaymentData] = useState<{ total: number; hours: number } | null>(null);
  
  // Ново състояние за показване на екрана за успех
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedGpu(null);
    setPaymentData(null);
    setIsSuccess(false);
  };

  const handleSelectGpu = (gpu: GpuItem) => {
    setSelectedGpu(gpu);
  };

  return (
    <div>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : isSuccess ? (
        /* Стъпка 4: Успешно плащане и детайли за свързване */
        <SuccessPage 
          onHome={() => {
            // Връщане към началния екран (Dashboard)
            setIsSuccess(false);
            setSelectedGpu(null);
          }}
        />
      ) : paymentData ? (
        /* Стъпка 3: Страница за плащане с карта */
        <PaymentPage 
          totalAmount={paymentData.total}
          onBack={() => setPaymentData(null)}
          onSuccess={() => {
            // При успешно плащане преминаваме към екрана за успех
            setPaymentData(null);
            setIsSuccess(true);
          }}
        />
      ) : selectedGpu ? (
        /* Стъпка 2: Детайли за видеокартата */
        <GpuDetails 
          gpu={selectedGpu} 
          onBack={() => setSelectedGpu(null)} 
          onPay={(total, hours) => {
            setPaymentData({ total, hours });
          }} 
        />
      ) : (
        /* Стъпка 1: Начален екран с всички обяви */
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onSelectGpu={handleSelectGpu} 
        />
      )}
    </div>
  );
}

export default App;