
import { useEffect, useId, useState } from 'react';
import Modal from '../Modal';

export const EMPTY_FILTERS = {
  status: 'All',
  from: '',
  to: '',
  min: '',
  max: '',
};

const STATUSES = ['All', 'Successful', 'Pending', 'Failed'];

const normalizeFilters = (filters) => ({
  ...EMPTY_FILTERS,
  ...(filters && typeof filters === 'object' ? filters : {}),
});

const isValidAmount = (value) =>
  value === '' || /^\d+(\.\d{0,2})?$/.test(value);

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

export default function TransactionFilterModal({
  filters = EMPTY_FILTERS,
  onClose,
  onApply,
}) {
  const uid = useId();

  const [draft, setDraft] = useState(() => normalizeFilters(filters));
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(normalizeFilters(filters));
    setError('');
  }, [filters]);

  const updateField = (name, value) => {
    setDraft((current) => ({
      ...current,
      [name]: value,
    }));

    setError('');
  };

  const handleAmountChange = (name, value) => {
    updateField(name, normalizeAmount(value));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (
      draft.from &&
      draft.to &&
      draft.from > draft.to
    ) {
      setError(
        '"From" date must be before or equal to "To" date.'
      );
      return;
    }

    if (
      !isValidAmount(draft.min) ||
      !isValidAmount(draft.max)
    ) {
      setError(
        'Enter a valid amount with up to two decimal places.'
      );
      return;
    }

    if (
      draft.min !== '' &&
      draft.max !== '' &&
      Number(draft.min) > Number(draft.max)
    ) {
      setError(
        'Minimum amount must be less than or equal to maximum amount.'
      );
      return;
    }

    onApply?.(normalizeFilters(draft));
  };

  const handleReset = () => {
    const resetFilters = { ...EMPTY_FILTERS };

    setDraft(resetFilters);
    setError('');
    onApply?.(resetFilters);
  };

  return (
    <Modal title="Filter transactions" onClose={onClose}>
      <form className="fn-form" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            className="fn-label"
            htmlFor={`${uid}-status`}
          >
            Status
          </label>

          <select
            id={`${uid}-status`}
            className="fn-input"
            value={draft.status}
            onChange={(event) =>
              updateField('status', event.target.value)
            }
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="fn-form-row">
          <div>
            <label
              className="fn-label"
              htmlFor={`${uid}-from`}
            >
              From
            </label>

            <input
              id={`${uid}-from`}
              type="date"
              className="fn-input"
              value={draft.from}
              max={draft.to || undefined}
              onChange={(event) =>
                updateField('from', event.target.value)
              }
              aria-describedby={error ? `${uid}-error` : undefined}
            />
          </div>

          <div>
            <label
              className="fn-label"
              htmlFor={`${uid}-to`}
            >
              To
            </label>

            <input
              id={`${uid}-to`}
              type="date"
              className="fn-input"
              value={draft.to}
              min={draft.from || undefined}
              onChange={(event) =>
                updateField('to', event.target.value)
              }
              aria-describedby={error ? `${uid}-error` : undefined}
            />
          </div>
        </div>

        <div className="fn-form-row">
          <div>
            <label
              className="fn-label"
              htmlFor={`${uid}-min`}
            >
              Min amount
            </label>

            <input
              id={`${uid}-min`}
              type="text"
              inputMode="decimal"
              className="fn-input"
              placeholder="0"
              value={draft.min}
              onChange={(event) =>
                handleAmountChange('min', event.target.value)
              }
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${uid}-error` : undefined}
            />
          </div>

          <div>
            <label
              className="fn-label"
              htmlFor={`${uid}-max`}
            >
              Max amount
            </label>

            <input
              id={`${uid}-max`}
              type="text"
              inputMode="decimal"
              className="fn-input"
              placeholder="Any"
              value={draft.max}
              onChange={(event) =>
                handleAmountChange('max', event.target.value)
              }
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${uid}-error` : undefined}
            />
          </div>
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
            onClick={handleReset}
          >
            Reset
          </button>

          <button
            type="submit"
            className="fn-btn fn-btn--lg"
          >
            Apply
          </button>
        </div>
      </form>
    </Modal>
  );
}
