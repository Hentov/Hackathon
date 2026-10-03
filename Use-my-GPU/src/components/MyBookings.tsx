import React, { useEffect, useState } from 'react';
import { Star } from './icons';
import ConnectionDetails from './ConnectionDetails';
import { api, type MyBooking } from '../api';
import type { UserData } from './Login';

interface Props {
  user: UserData;
}

const PHASE_LABEL = { upcoming: 'Upcoming', active: 'Active now', ended: 'Ended' } as const;

const RateForm: React.FC<{ booking: MyBooking; userId: number; onDone: () => void }> = ({
  booking,
  userId,
  onDone,
}) => {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      await api('/api/reviews', {
        method: 'POST',
        body: { user_id: userId, booking_id: booking.id, stars, comment },
      });
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: 14 }}>
      <label>Rate {booking.owner_username}</label>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={n <= stars ? 'on' : ''}
            aria-label={`${n} stars`}
            onClick={() => setStars(n)}
          >
            <Star size={22} />
          </button>
        ))}
      </div>
      <input
        type="text"
        maxLength={500}
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <div className="err">{error}</div>}
      <button className="btn sm" onClick={submit} disabled={busy}>
        {busy ? 'Sending...' : 'Send rating'}
      </button>
    </div>
  );
};

const MyBookings: React.FC<Props> = ({ user }) => {
  const [items, setItems] = useState<MyBooking[] | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<number | null>(null);

  const load = () =>
    api<MyBooking[]>(`/api/bookings?user_id=${user.id}`)
      .then(setItems)
      .catch((e: Error) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  return (
    <main>
      <h2>My bookings</h2>
      {error && <div className="err">{error}</div>}
      {items && items.length === 0 && (
        <p>You have no bookings yet. Open Find a GPU, pick a card and book your first hours.</p>
      )}

      <div className="list">
        {items?.map((b) => (
          <article key={b.id} className={`bk ${b.phase}`}>
            <div className="bk-head">
              <h3>{b.model}</h3>
              <span className={`badge ${b.phase}`}>{PHASE_LABEL[b.phase]}</span>
            </div>
            <p className="when">{b.start_time} to {b.end_time}</p>

            <div className="facts">
              <div><b>{b.hours} h</b><span>Duration</span></div>
              <div><b>€{b.total_price.toFixed(2)}</b><span>Paid</span></div>
              <div><b>{b.energy_kwh} kWh</b><span>Energy</span></div>
              <div><b>{b.owner_username}</b><span>Host</span></div>
            </div>

            {b.phase !== 'ended' && (
              <div style={{ marginTop: 18 }}>
                <button
                  className="btn ghost sm"
                  onClick={() => setOpen(open === b.id ? null : b.id)}
                >
                  {open === b.id ? 'Hide connection details' : 'Show connection details'}
                </button>
                {open === b.id && (
                  <div style={{ marginTop: 14 }}>
                    <ConnectionDetails bookingId={b.id} userId={user.id} />
                  </div>
                )}
              </div>
            )}

            {b.stars ? (
              <p className="small" style={{ marginTop: 18 }}>
                <span className="amber"><Star /></span> You rated this {b.stars} out of 5
                {b.comment ? `: "${b.comment}"` : ''}
              </p>
            ) : (
              <RateForm booking={b} userId={user.id} onDone={load} />
            )}
          </article>
        ))}
      </div>
    </main>
  );
};

export default MyBookings;
