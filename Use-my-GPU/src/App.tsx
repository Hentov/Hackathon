import { useState } from 'react';
import Login, { type UserData } from './components/Login';
import Dashboard, { type GpuItem } from './components/Dashboard';
import GpuDetails from './components/GpuDetails';
import PaymentPage from './components/PaymentPage'; // Импортираме новата страница за плащане

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedGpu, setSelectedGpu] = useState<GpuItem | null>(null);
  
  // Ново състояние за данните за плащане. Ако не е null, показваме PaymentPage.
  const [paymentData, setPaymentData] = useState<{ total: number; hours: number } | null>(null);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedGpu(null);
    setPaymentData(null);
  };

  const handleSelectGpu = (gpu: GpuItem) => {
    setSelectedGpu(gpu);
  };

  return (
    <div>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : paymentData ? (
        /* Стъпка 3: Страница за плащане с карта */
        <PaymentPage 
          totalAmount={paymentData.total}
          onBack={() => setPaymentData(null)} // Връща назад към детайлите за картата
          onSuccess={() => {
            alert(`Payment of €${paymentData.total.toFixed(2)} successful! Machine booked for ${paymentData.hours} hours.`);
            // След успешно плащане се връщаме в самото начало (Dashboard)
            setPaymentData(null);
            setSelectedGpu(null);
          }}
        />
      ) : selectedGpu ? (
        /* Стъпка 2: Детайли за видеокартата */
        <GpuDetails 
          gpu={selectedGpu} 
          onBack={() => setSelectedGpu(null)} 
          onPay={(total, hours) => {
            // Вместо alert, тук запазваме сумата и часовете, което автоматично отваря PaymentPage
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