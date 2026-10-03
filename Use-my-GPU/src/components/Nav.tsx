import React from 'react';
import { Bolt } from './icons';

export type View = 'find' | 'bookings' | 'host' | 'profile';

interface NavProps {
  username: string;
  view: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const TABS: { id: View; label: string }[] = [
  { id: 'find', label: 'Find a GPU' },
  { id: 'bookings', label: 'My bookings' },
  { id: 'host', label: 'Host a GPU' },
];

const Nav: React.FC<NavProps> = ({ username, view, onNavigate, onLogout }) => (
  <nav>
    <div className="logo"><span className="mark"><Bolt size={16} /></span>GPU Share</div>
    <div className="navlinks">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tab ${view === t.id ? 'on' : ''}`}
          onClick={() => onNavigate(t.id)}
        >
          {t.label}
        </button>
      ))}
      <button
        className={`tab who ${view === 'profile' ? 'on' : ''}`}
        onClick={() => onNavigate('profile')}
        aria-label="Open my profile"
      >
        {username}
      </button>
      <button className="tab" onClick={onLogout}>Log out</button>
    </div>
  </nav>
);

export default Nav;
