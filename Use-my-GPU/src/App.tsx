import { useState } from 'react';
import Login, { type UserData } from './components/Login';
import Dashboard, { type GpuItem } from './components/Dashboard';
import GpuDetails from './components/GpuDetails';
import PaymentPage from './components/PaymentPage';
import SuccessPage from './components/SuccessPage';
import MyBookings from './components/MyBookings';
import HostPage from './components/HostPage';
import ProfilePage from './components/ProfilePage';
import Nav, { type View } from './components/Nav';
import type { BookingDraft, BookingResult } from './api';

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [view, setView] = useState<View>('find');
  const [selectedGpu, setSelectedGpu] = useState<GpuItem | null>(null);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [booking, setBooking] = useState<BookingResult | null>(null);

  // Go to a tab and leave any half-finished booking
  const navigate = (next: View) => {
    setView(next);
    setSelectedGpu(null);
    setDraft(null);
    setBooking(null);
  };

  const handleLogout = () => {
    setUser(null);
    navigate('find');
  };

  const renderPage = (u: UserData) => {
    if (booking) {
      return (
        <SuccessPage
          user={u}
          booking={booking}
          onHome={() => navigate('find')}
          onMyBookings={() => navigate('bookings')}
        />
      );
    }
    if (view === 'bookings') return <MyBookings user={u} />;
    if (view === 'host') return <HostPage user={u} />;
    if (view === 'profile') return <ProfilePage user={u} />;
    if (selectedGpu && draft) {
      /* Step 3: card payment */
      return (
        <PaymentPage
          user={u}
          gpu={selectedGpu}
          draft={draft}
          onBack={() => setDraft(null)}
          onPaid={setBooking}
        />
      );
    }
    if (selectedGpu) {
      /* Step 2: GPU details, date and time */
      return <GpuDetails gpu={selectedGpu} onBack={() => setSelectedGpu(null)} onPay={setDraft} />;
    }
    /* Step 1: all listings */
    return <Dashboard onSelectGpu={setSelectedGpu} onHost={() => navigate('host')} />;
  };

  return (
    <div className="gs">
      {user && (
        <Nav username={user.username} view={view} onNavigate={navigate} onLogout={handleLogout} />
      )}
      {user ? renderPage(user) : <Login onLogin={setUser} />}
    </div>
  );
}

export default App;
