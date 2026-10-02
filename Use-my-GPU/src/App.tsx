import React, { useState } from 'react';
import Login, { type UserData } from './components/Login';
import Dashboard, { type GpuItem } from './components/Dashboard';

function App() {
  const [user, setUser] = useState<UserData | null>(null);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleSelectGpu = (gpu: GpuItem) => {
    alert(`Избрахте обява за ${gpu.type}.`);
  };

  return (
    <div>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
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