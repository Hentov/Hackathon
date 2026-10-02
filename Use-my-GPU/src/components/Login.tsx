import React, { useState } from 'react';

export interface UserData {
  id: number;
  name: string;
  email: string;
  username?: string;
  role: string;
}

interface LoginProps {
  onLogin: (user: UserData) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Login form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role

  const [error, setError] = useState('');

  // Handle Login Submission via API
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginUsername || !loginPassword) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
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

    if (!firstName || !lastName || !regUsername || !regEmail || !regPassword || !role) {
      setError('Please fill in all fields.');
      return;
    }

    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters long!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          username: regUsername,
          email: regEmail,
          password: regPassword,
          role: role
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
    <div style={styles.loginContainer}>
      <div style={styles.loginForm}>
        <h2>{isRegistering ? 'Create an Account' : 'Login to GPU Share'}</h2>

        {error && <div style={styles.errorBox}>{error}</div>}

        {!isRegistering ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit}>
            <div style={styles.inputGroup}>
              <label>Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                placeholder="johndoe123"
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                placeholder="********"
                style={styles.input}
              />
            </div>
            <button type="submit" style={styles.submitBtn}>
              Log In
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit}>
            <div style={styles.inputGroup}>
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="John"
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Doe"
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Username</label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
                placeholder="johndoe123"
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                placeholder="john@example.com"
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Password (at least 8 characters)</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={8}
                placeholder="********"
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={styles.input}
              >
                <option value="user">User (Rent GPU)</option>
                <option value="provider">Provider (Share GPU)</option>
              </select>
            </div>
            <button type="submit" style={styles.submitBtn}>
              Register
            </button>
          </form>
        )}

        {/* TOGGLE FORM BUTTON */}
        <div style={styles.toggleContainer}>
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" onClick={toggleMode} style={styles.toggleBtn}>
              {isRegistering ? ' Log in here' : ' Register here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: '20px',
  },
  loginForm: {
    backgroundColor: '#1e293b',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '400px',
  },
  errorBox: {
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#fff',
    fontSize: '1rem',
  },
  submitBtn: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
  toggleContainer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#38bdf8',
    cursor: 'pointer',
    fontWeight: 'bold',
    textDecoration: 'underline',
    padding: 0,
    fontSize: '0.9rem',
  },
};

export default Login;