import React, { useState } from 'react';
import type { GpuItem } from './Dashboard';
import { api, type BookingDraft, type BookingResult } from '../api';
import type { UserData } from './Login';

interface PaymentPageProps {
  user: UserData;
  gpu: GpuItem;
  draft: BookingDraft;
  onBack: () => void;
  onPaid: (booking: BookingResult) => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ user, gpu, draft, onBack, onPaid }) => {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      // The server checks the time slot, calculates the price and runs the (mock) payment.
      const booking = await api<BookingResult>('/api/bookings', {
        method: 'POST',
        body: {
          user_id: user.id,
          gpu_id: gpu.id,
          date: draft.date,
          start: draft.start,
          hours: draft.hours,
          card: { number: cardNumber, exp: expiry, cvc: cvv },
        },
      });
      onPaid(booking);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Card number: a space after every 4 digits
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardNumber(value.match(/.{1,4}/g)?.join(' ') || '');
  };

  // Expiry: MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setExpiry(value.length > 2 ? `${value.substring(0, 2)}/${value.substring(2, 4)}` : value);
  };

  // CVV: digits only
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, ''));
  };

  return (
    <main>
      <div className="narrow">
        <button className="back" onClick={onBack} disabled={busy}>&#8592; Back to details</button>


        <div className="slip">
          <h3>Checkout</h3>

          <div className="sum"><span>GPU</span><span>{gpu.type}</span></div>
          <div className="sum"><span>Date</span><span>{draft.date}</span></div>
          <div className="sum"><span>Start</span><span>{draft.start}</span></div>
          <div className="sum"><span>Hours</span><span>{draft.hours}</span></div>
          <div className="sum total">
            <span>Total</span>
            <span>€{draft.total.toFixed(2)}</span>
          </div>

          {error && <div className="err" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
            <label htmlFor="cardName">Cardholder name</label>
            <input
              id="cardName"
              type="text"
              required
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />

            <label htmlFor="cardNumber">Card number</label>
            <input
              id="cardNumber"
              type="text"
              inputMode="numeric"
              required
              maxLength={19}
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={handleCardNumberChange}
            />

            <div className="row2">
              <div>
                <label htmlFor="expiry">Expiry date</label>
                <input
                  id="expiry"
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={5}
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                />
              </div>
              <div>
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={3}
                  placeholder="123"
                  value={cvv}
                  onChange={handleCvvChange}
                />
              </div>
            </div>

            <button type="submit" className="btn w" disabled={busy}>
              {busy ? 'Processing...' : `Pay €${draft.total.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;
