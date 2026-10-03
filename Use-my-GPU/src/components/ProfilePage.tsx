import React, { useEffect, useState } from 'react';
import { api } from '../api';
import type { UserData } from './Login';

interface Props {
  user: UserData;
}

interface Profile {
  username: string;
  saved_hours: number;
  saved_kwh: number;
  rentals: number;
}

const ProfilePage: React.FC<Props> = ({ user }) => {
  const [p, setP] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Profile>(`/api/profile?user_id=${user.id}`)
      .then(setP)
      .catch((e: Error) => setError(e.message));
  }, [user.id]);

  return (
    <main>
      <div className="profile">
        <h2>{user.username}</h2>
        {error && <div className="err">{error}</div>}
        {p && (
          <div className="big">
            <h3>Saved energy</h3>
            <div className="saved">
              <div>
                <span className="n">{p.saved_hours}<small>h</small></span>
                <span className="l">Hours saved</span>
              </div>
              <div className="volt">
                <span className="n">{p.saved_kwh}<small>kWh</small></span>
                <span className="l">Energy used by rentals</span>
              </div>
            </div>
            <p className="small foot">
              Every hour someone rents your GPU adds one saved hour.
              {p.rentals > 0 ? ` ${p.rentals} ${p.rentals === 1 ? 'rental' : 'rentals'} so far.` : ' No rentals yet.'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;
