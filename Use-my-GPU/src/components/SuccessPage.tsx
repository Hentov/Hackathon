import React from 'react';
import ConnectionDetails from './ConnectionDetails';
import type { BookingResult } from '../api';
import type { UserData } from './Login';

interface SuccessPageProps {
  user: UserData;
  booking: BookingResult;
  onHome: () => void;
  onMyBookings: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ user, booking, onHome, onMyBookings }) => {
  return (
    <main>
      <div className="narrow">
        <h2>Booking confirmed</h2>
        <p className="lead">
          Your hours are saved. The connection details below stay available in My bookings until the rental ends.
        </p>

        <div className="slip" style={{ marginBottom: 22 }}>
          <div className="sum"><span>GPU</span><span>{booking.model}</span></div>
          <div className="sum"><span>From</span><span>{booking.start_time}</span></div>
          <div className="sum"><span>Until</span><span>{booking.end_time}</span></div>
          <div className="sum"><span>Energy</span><span>{booking.energy_kwh} kWh</span></div>
          <div className="sum total">
            <span>Paid</span>
            <span>€{booking.total_price.toFixed(2)}</span>
          </div>
        </div>

        <ConnectionDetails bookingId={booking.id} userId={user.id} />

        <div className="row2" style={{ marginTop: 22 }}>
          <div><button className="btn w" onClick={onMyBookings}>Open My bookings</button></div>
          <div><button className="btn w ghost" onClick={onHome}>Back to GPUs</button></div>
        </div>
      </div>
    </main>
  );
};

export default SuccessPage;
