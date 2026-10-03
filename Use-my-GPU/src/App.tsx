import { useState } from 'react';
import Login, { type UserData } from './components/Login';
import Dashboard, { type GpuItem } from './components/Dashboard';
import GpuDetails from './components/GpuDetails'; // ДОБАВЕНО: Импортираме новата страница

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedGpu, setSelectedGpu] = useState<GpuItem | null>(null); // ДОБАВЕНО: Състояние за избраната карта

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedGpu(null); // Изчистваме и избраната карта при изход
  };

  // ПРОМЕНЕНО: Вече не показва alert, а променя състоянието на selectedGpu
  const handleSelectGpu = (gpu: GpuItem) => {
    setSelectedGpu(gpu);
  };

  return (
    <div>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : selectedGpu ? (
        /* ДОБАВЕНО: Ако потребителят е логнат И е избрал карта, показваме GpuDetails */
        <GpuDetails 
          gpu={selectedGpu} 
          onBack={() => setSelectedGpu(null)} 
          onPay={(total, hours) => {
            alert(`Успешно платихте €${total.toFixed(2)} за ${hours} часа!`);
            // setSelectedGpu(null); // Разкоментирай това, ако искаш след плащане да го връща в Dashboard-a
          }} 
        />
      ) : (
        /* Твоят оригинален Dashboard се показва, ако потребителят е логнат, но НЕ е избрал карта */
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