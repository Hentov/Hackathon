import React, { useState } from 'react';
import { Bolt } from './icons';
import IdleChart from './IdleChart';
import { API_URL } from '../api';

export interface UserData {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
}

// Decorative shape for the sign-in screen, not real data
const DECOR = [2, 2, 1, 1, 1, 2, 3, 4, 6, 7, 8, 8, 7, 8, 9, 9, 8, 7, 6, 8, 10, 9, 6, 3];

interface LoginProps {
  onLogin: (user: UserData) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [role, setRole] = useState('renter');

  const [error, setError] = useState('');

  // Handle Login Submission via API
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed.');
        return;
      }

      onLogin(data);
    } catch (err) {
      setError('Network error. Please try again later.');
    }
  };

  // Handle Registration Submission via API
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !regUsername || !regEmail || !regPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters long!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          username: regUsername,
          email: regEmail,
          password: regPassword,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }

      // Ако регистрацията е успешна, логваме потребителя директно
      onLogin(data);
    } catch (err) {
      setError('Network error. Please try again later.');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
  };

  return (
    <main className="auth">
      <aside className="auth-art">
        <div className="logo"><span className="mark"><Bolt size={16} /></span>GPU Share</div>
        <div>
          <h1>Idle GPUs put to work</h1>
          <p>
            Rent a graphics card by the hour, or earn from your own while it sits unused.
          </p>
        </div>
        <IdleChart counts={DECOR} decorative />
      </aside>

      <div className="auth-form">
        <div className="box">
          <h2>{isRegistering ? 'Create an account' : 'Log in'}</h2>

          {error && <div className="err" role="alert">{error}</div>}

          {!isRegistering ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit}>
              <label htmlFor="loginEmail">Email</label>
              <input
                id="loginEmail"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                placeholder="user@domain.com"
              />
              <label htmlFor="loginPassword">Password</label>
              <input
                id="loginPassword"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                placeholder="********"
              />
              <button type="submit" className="btn w">Log in</button>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit}>
              <div className="row2">
                <div>
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>
              <label htmlFor="regUsername">Username</label>
              <input
                id="regUsername"
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
                placeholder="johndoe123"
              />
              <label htmlFor="regEmail">Email</label>
              <input
                id="regEmail"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                placeholder="john@example.com"
              />
              <label htmlFor="regPassword">Password (at least 8 characters)</label>
              <input
                id="regPassword"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={8}
                placeholder="********"
              />
              <label htmlFor="role">I mainly want to</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="renter">Rent a GPU</option>
                <option value="owner">Share my GPU</option>
              </select>
              <button type="submit" className="btn w">Create account</button>
            </form>
          )}

          <p className="small" style={{ marginTop: 20 }}>
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" className="link" onClick={toggleMode}>
              {isRegistering ? 'Log in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
