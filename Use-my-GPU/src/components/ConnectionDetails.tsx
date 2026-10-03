import React, { useEffect, useState } from 'react';
import { api, type Connection } from '../api';

interface Props {
  bookingId: number;
  userId: number;
}

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available: the text is still selectable */
    }
  };

  return (
    <div className="codebox">
      <div className="top">
        <label>{label}</label>
        <button type="button" className="copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <code>{value}</code>
    </div>
  );
};

const ConnectionDetails: React.FC<Props> = ({ bookingId, userId }) => {
  const [conn, setConn] = useState<Connection | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Connection>(`/api/bookings/${bookingId}/connection?user_id=${userId}`)
      .then(setConn)
      .catch((e: Error) => setError(e.message));
  }, [bookingId, userId]);

  if (error) return <div className="err">{error}</div>;
  if (!conn) return <p className="small">Loading connection details...</p>;

  return (
    <div className="term">
      <p className="state">
        {conn.phase === 'active'
          ? `Connected rental, active until ${conn.end_time}.`
          : `Starts ${conn.start_time} and ends ${conn.end_time}. The details are ready now.`}
      </p>
      <Field label="SSH command" value={conn.ssh_command} />
      <Field label="Password" value={conn.password} />
      <Field label="Jupyter Notebook address" value={conn.jupyter_url} />
      <Field label="Jupyter token" value={conn.jupyter_token} />
    </div>
  );
};

export default ConnectionDetails;
