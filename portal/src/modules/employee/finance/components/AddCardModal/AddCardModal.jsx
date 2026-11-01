
import { useId, useState } from 'react';
import Modal from '../Modal';

const brandOf = (number) => {
  if (number.startsWith('4')) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(number)) return 'MASTERCARD';
  if (/^3[47]/.test(number)) return 'AMEX';
  return 'CARD';
};

export default function AddCardModal({ onClose, onAdd }) {
  const uid = useId();
  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [error, setError] = useState('');

  const digits = number.replace(/\D/g, '');

  const handleNumber = (event) => {
    const value = event.target.value
      .replace(/\D/g, '')
      .slice(0, 16);

    setNumber(value.replace(/(.{4})/g, '$1 ').trim());
    setError('');
  };

  const handleExpiry = (event) => {
    const digitsOnly = event.target.value
      .replace(/\D/g, '')
      .slice(0, 4);

    const formatted =
      digitsOnly.length > 2
        ? `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
        : digitsOnly;

    setExpiry(formatted);
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!holder.trim()) {
      setError('Enter the card holder name.');
      return;
    }

    if (digits.length !== 16) {
      setError('Card number must be 16 digits.');
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setError('Enter the expiry date as MM/YY.');
      return;
    }

    const [monthText, yearText] = expiry.split('/');
    const month = Number(monthText);
    const year = 2000 + Number(yearText);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (
      year < currentYear ||
      (year === currentYear && month < currentMonth)
    ) {
      setError('This card has expired.');
      return;
    }

    const card = {
      id: `card-${Date.now()}`,
      brand: brandOf(digits),
      last4: digits.slice(-4),
      holder: holder.trim(),
      expiry,
    };

    onAdd(card);
  };

  return (
    <Modal title="Add new card" onClose={onClose}>
      <form
        className="fn-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <label
            className="fn-label"
            htmlFor={`${uid}-holder`}
          >
            Card holder name
          </label>

          <input
            id={`${uid}-holder`}
            className="fn-input"
            type="text"
            value={holder}
            onChange={(event) => {
              setHolder(event.target.value);
              setError('');
            }}
            autoComplete="cc-name"
            placeholder="Name on card"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label
            className="fn-label"
            htmlFor={`${uid}-number`}
          >
            Card number
          </label>

          <input
            id={`${uid}-number`}
            className="fn-input"
            type="text"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={number}
            onChange={handleNumber}
            autoComplete="cc-number"
            aria-describedby={
              error ? `${uid}-error` : undefined
            }
            required
          />
        </div>

        <div>
          <label
            className="fn-label"
            htmlFor={`${uid}-expiry`}
          >
            Expiry date
          </label>

          <input
            id={`${uid}-expiry`}
            className="fn-input"
            type="text"
            inputMode="numeric"
            placeholder="MM/YY"
            value={expiry}
            onChange={handleExpiry}
            autoComplete="cc-exp"
            maxLength={5}
            required
          />
        </div>

        {error && (
          <p
            id={`${uid}-error`}
            className="fn-form-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="fn-modal__actions">
          <button
            type="button"
            className="fn-btn fn-btn--ghost fn-btn--lg"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="fn-btn fn-btn--lg"
          >
            Add card
          </button>
        </div>
      </form>
    </Modal>
  );
}
