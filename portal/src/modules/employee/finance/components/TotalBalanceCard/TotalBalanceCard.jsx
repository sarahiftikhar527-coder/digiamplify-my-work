
import { useEffect, useMemo, useState } from 'react';
import Icon from '../Icons';
import { formatCurrency } from '../../utils/finance';

const getCardId = (card) => String(card?.id ?? card?._id ?? '');

export default function TotalBalanceCard({
  cards = [],
  balance = 0,
  monthlyFee = 0,
  loading = false,
  error = '',
  onAddCard,
  onWithdraw,
  onViewTransactions,
  onRetry,
}) {
  const [idx, setIdx] = useState(0);
  const [hidden, setHidden] = useState(false);

  const safeCards = useMemo(
    () =>
      Array.isArray(cards)
        ? cards.filter((card) => card && getCardId(card))
        : [],
    [cards]
  );

  const numericBalance = Number(balance);
  const totalBalance =
    Number.isFinite(numericBalance) ? numericBalance : 0;

  const numericFee = Number(monthlyFee);
  const fee =
    Number.isFinite(numericFee) ? numericFee : 0;

  useEffect(() => {
    setIdx((current) => {
      if (safeCards.length === 0) return 0;
      return Math.min(current, safeCards.length - 1);
    });
  }, [safeCards.length]);

  const card = safeCards[idx] ?? null;

  const handlePrevious = () => {
    setIdx((current) => Math.max(0, current - 1));
    setHidden(false);
  };

  const handleNext = () => {
    setIdx((current) =>
      Math.min(safeCards.length - 1, current + 1)
    );
    setHidden(false);
  };

  const handleAddCard = () => {
    if (typeof onAddCard === 'function') {
      onAddCard();
    }
  };

  const handleWithdraw = () => {
    if (typeof onWithdraw === 'function') {
      onWithdraw(card);
    }
  };

  const handleViewTransactions = () => {
    if (typeof onViewTransactions === 'function') {
      onViewTransactions(card);
    }
  };

  return (
    <section
      className="fn-card fn-balance"
      aria-labelledby="fn-total-balance-title"
    >
      <div className="fn-balance__header">
        <h2
          id="fn-total-balance-title"
          className="fn-card__title"
        >
          Total Balance
        </h2>

        {loading && (
          <span className="fn-balance__loading" role="status">
            Loading...
          </span>
        )}
      </div>

      <div className="fn-balance__amount">
        <p className="fn-balance__label">Available balance</p>
        <p className="fn-balance__value">
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {error && (
        <div className="fn-balance__error" role="alert">
          <p>{error}</p>

          {typeof onRetry === 'function' && (
            <button
              type="button"
              className="fn-btn fn-btn--ghost"
              onClick={onRetry}
              disabled={loading}
            >
              Try again
            </button>
          )}
        </div>
      )}

      <div className="fn-balance__body">
        <button
          type="button"
          className="fn-addcard"
          onClick={handleAddCard}
          disabled={loading || typeof onAddCard !== 'function'}
        >
          <span>Add New Card</span>
          <Icon name="plus" size={12} />
        </button>

        {loading && safeCards.length === 0 ? (
          <div className="fn-vcard fn-vcard--empty" role="status">
            <p>Loading your linked cards...</p>
          </div>
        ) : card ? (
          <div
            key={getCardId(card)}
            className="fn-vcard"
          >
            <p className="fn-vcard__brand">
              {card.brand || card.bankName || 'Payment Card'}
            </p>

            <p className="fn-vcard__link">
              {card.label || 'Linked payment card'}
            </p>

            <p className="fn-vcard__number">
              <span>
                {hidden
                  ? '•••• •••• •••• ••••'
                  : `•••• ${String(card.last4 ?? '').slice(-4) || '••••'}`}
              </span>

              <button
                type="button"
                className="fn-icon-btn"
                aria-label={
                  hidden ? 'Show card digits' : 'Hide card digits'
                }
                aria-pressed={hidden}
                onClick={() => setHidden((current) => !current)}
              >
                <Icon
                  name={hidden ? 'eye' : 'eyeOff'}
                  size={13}
                />
              </button>
            </p>

            <div className="fn-vcard__actions">
              <button
                type="button"
                className="fn-btn"
                onClick={handleViewTransactions}
                disabled={
                  loading ||
                  typeof onViewTransactions !== 'function'
                }
              >
                Transactions
              </button>

              <button
                type="button"
                className="fn-btn"
                onClick={handleWithdraw}
                disabled={
                  loading ||
                  totalBalance <= 0 ||
                  typeof onWithdraw !== 'function'
                }
              >
                Withdraw
              </button>
            </div>

            {safeCards.length > 1 && (
              <div className="fn-vcard__nav">
                <button
                  type="button"
                  className="fn-icon-btn"
                  aria-label="Previous card"
                  disabled={idx === 0}
                  onClick={handlePrevious}
                >
                  <Icon name="chevronLeft" size={13} />
                </button>

                <span aria-live="polite">
                  {idx + 1} / {safeCards.length}
                </span>

                <button
                  type="button"
                  className="fn-icon-btn"
                  aria-label="Next card"
                  disabled={idx >= safeCards.length - 1}
                  onClick={handleNext}
                >
                  <Icon name="chevronRight" size={13} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="fn-vcard fn-vcard--empty">
            <p>
              No card linked yet. Add a card to get started.
            </p>
          </div>
        )}
      </div>

      <p className="fn-balance__fee">
        Monthly Regular fee {formatCurrency(fee)}
      </p>
    </section>
  );
}
