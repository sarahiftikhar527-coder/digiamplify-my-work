
import { useEffect, useId, useState } from 'react';
import Modal from '../Modal';
import { formatCurrency } from '../../utils/finance';

const normalizeAmount = (value) => {
  const cleaned = String(value ?? '').replace(/[^\d.]/g, '');
  const decimalIndex = cleaned.indexOf('.');

  if (decimalIndex === -1) {
    return cleaned;
  }

  return (
    cleaned.slice(0, decimalIndex + 1) +
    cleaned.slice(decimalIndex + 1).replace(/\./g, '').slice(0, 2)
  );
};

const getCardId = (card) => String(card?.id ?? card?._id ?? '');

export default function WithdrawModal({
  cards = [],
  balance = 0,
  onClose,
  onWithdraw,
}) {
  const uid = useId();

  const safeCards = Array.isArray(cards)
    ? cards.filter((card) => card && getCardId(card))
    : [];

  const numericBalance = Number(balance);
  const availableBalance =
    Number.isFinite(numericBalance) && numericBalance > 0
      ? numericBalance
      : 0;

  const [amount, setAmount] = useState('');
  const [cardId, setCardId] = useState(() => getCardId(safeCards[0]));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const selectedCardExists = safeCards.some(
      (card) => getCardId(card) === cardId
    );

    if (!selectedCardExists) {
      setCardId(getCardId(safeCards[0]));
    }
  }, [cards, cardId]);

  const handleAmountChange = (event) => {
    setAmount(normalizeAmount(event.target.value));
    setError('');
  };

  const handleCardChange = (event) => {
    setCardId(event.target.value);
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const value = Number(amount);
    const selectedCard = safeCards.find(
      (card) => getCardId(card) === cardId
    );

    if (!selectedCard) {
      setError('Please add or select a valid card first.');
      return;
    }

    if (
      !amount.trim() ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      setError('Enter a valid amount greater than 0.');
      return;
    }

    const roundedAmount = Math.round((value + Number.EPSILON) * 100) / 100;

    if (roundedAmount > availableBalance) {
      setError(
        `You can withdraw up to ${formatCurrency(availableBalance)}.`
      );
      return;
    }

    if (typeof onWithdraw !== 'function') {
      setError('Withdrawal is currently unavailable. Please try again later.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onWithdraw({
        amount: roundedAmount,
        cardId,
      });
    } catch (err) {
      setError(
        err?.message || 'Unable to process your withdrawal. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Withdraw" onClose={onClose}>
      <form className="fn-form" onSubmit={submit} noValidate>
        <p className="fn-modal__hint">
          Available balance:{' '}
          <strong>{formatCurrency(availableBalance)}</strong>
        </p>

        <div>
          <label className="fn-label" htmlFor={`${uid}-amount`}>
            Amount
          </label>

          <input
            id={`${uid}-amount`}
            className="fn-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${uid}-error` : undefined}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="fn-label" htmlFor={`${uid}-card`}>
            Withdraw to
          </label>

          <select
            id={`${uid}-card`}
            className="fn-input"
            value={cardId}
            onChange={handleCardChange}
            disabled={safeCards.length === 0 || isSubmitting}
            required
          >
            {safeCards.length === 0 ? (
              <option value="">No cards added</option>
            ) : (
              safeCards.map((card) => {
                const id = getCardId(card);
                const brand = card.brand || 'Card';
                const last4 = String(card.last4 || '').slice(-4);

                return (
                  <option key={id} value={id}>
                    {brand} {last4 ? `****${last4}` : ''}
                  </option>
                );
              })
            )}
          </select>
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
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="fn-btn fn-btn--lg"
            disabled={
              safeCards.length === 0 ||
              isSubmitting ||
              availableBalance <= 0
            }
          >
            {isSubmitting ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
