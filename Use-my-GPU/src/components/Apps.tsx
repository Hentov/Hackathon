import React, { useState } from 'react';
import Login, { UserData } from './Login';
import Dashboard, { GpuItem } from './Dashboard';
import GpuDetails from './GpuDetails';

type PageView = 'login' | 'dashboard' | 'details';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('login');
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedGpu, setSelectedGpu] = useState<GpuItem | null>(null);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedGpu(null);
    setCurrentPage('login');
  };

  const handleSelectGpu = (gpu: GpuItem) => {
    setSelectedGpu(gpu);
    setCurrentPage('details');
  };

  const handleBooking = (bookingInfo: any) => {
    console.log('Направена резервация:', bookingInfo);
  };

  return (
    <div>
      {currentPage === 'login' && <Login onLogin={handleLogin} />}

      {currentPage === 'dashboard' && user && (
        <Dashboard
          user={{ email: user.email }}
          onLogout={handleLogout}
          onSelectGpu={handleSelectGpu}
        />
      )}

      {currentPage === 'details' && selectedGpu && (
        <GpuDetails
          gpu={selectedGpu}
          onBack={() => setCurrentPage('dashboard')}
          onBook={handleBooking}
        />
      )}
    </div>
  );
};

export default App;