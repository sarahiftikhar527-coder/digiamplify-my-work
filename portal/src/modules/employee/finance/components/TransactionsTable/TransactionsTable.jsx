import { useMemo, useState } from 'react';
import Icon from '../Icons';
import TransactionFilterModal, {
  EMPTY_FILTERS,
} from '../TransactionFilterModal';
import {
  formatCurrency,
  formatDate,
  formatTime,
} from '../../utils/finance';

const normalizeText = (value) =>
  String(value ?? '').trim().toLowerCase();

const normalizeStatus = (value) => {
  const status = normalizeText(value);

  if (
    status === 'completed' ||
    status === 'successful' ||
    status === 'success'
  ) {
    return 'Successful';
  }

  if (status === 'pending' || status === 'processing') {
    return 'Pending';
  }

  if (
    status === 'failed' ||
    status === 'rejected' ||
    status === 'cancelled' ||
    status === 'canceled'
  ) {
    return 'Failed';
  }

  return value ? String(value) : 'Pending';
};

const getDateValue = (value) => {
  if (!value) return '';

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const normalizeTime = (value) => {
  if (value === null || value === undefined || value === '') {
    return '--';
  }

  if (typeof value === 'string') {
    const text = value.trim();

    if (!text) return '--';

    const twelveHourMatch = text.match(
      /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i
    );

    if (twelveHourMatch) {
      const hour = Number(twelveHourMatch[1]);
      const minute = Number(twelveHourMatch[2]);
      const period = twelveHourMatch[3].toUpperCase();

      if (
        hour < 1 ||
        hour > 12 ||
        minute < 0 ||
        minute > 59
      ) {
        return '--';
      }

      return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
    }

    const twentyFourHourMatch = text.match(
      /^(\d{1,2}):(\d{2})(?::\d{2})?$/
    );

    if (twentyFourHourMatch) {
      const hour = Number(twentyFourHourMatch[1]);
      const minute = Number(twentyFourHourMatch[2]);

      if (
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        return '--';
      }

      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;

      return `${formattedHour}:${String(minute).padStart(2, '0')} ${period}`;
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const safeFormatDate = (value) => {
  if (!value) return '--';

  try {
    const formatted = formatDate(value);

    return formatted &&
      !String(formatted).toLowerCase().includes('undefined')
      ? formatted
      : '--';
  } catch {
    return '--';
  }
};

const safeFormatTime = (value) => {
  const normalized = normalizeTime(value);

  if (normalized === '--') return '--';

  try {
    const formatted = formatTime(normalized);

    if (
      !formatted ||
      String(formatted).toLowerCase().includes('undefined') ||
      String(formatted).toLowerCase().includes('invalid')
    ) {
      return normalized;
    }

    return formatted;
  } catch {
    return normalized;
  }
};

const normalizeTransaction = (transaction, index) => {
  const item = transaction ?? {};

  const rawAmount =
    item.amount ??
    item.netPay ??
    item.netSalary ??
    item.salary ??
    0;

  const amount = Number(rawAmount);

  return {
    ...item,
    id: item.id ?? item._id ?? `transaction-${index}`,
    bank: String(item.bank ?? item.paymentMethod ?? 'Payroll'),
    ref: String(
      item.ref ??
      item.reference ??
      item.referenceNumber ??
      'Payroll'
    ),
    date: item.date ?? item.paymentDate ?? '',
    time: normalizeTime(item.time ?? item.paymentTime),
    amount: Number.isFinite(amount) ? amount : 0,
    status: normalizeStatus(item.status),
  };
};

const matches = (transaction, query, filters) => {
  const searchableText = [
    transaction.bank,
    transaction.ref,
    transaction.status,
    formatCurrency(transaction.amount),
    safeFormatDate(transaction.date),
    safeFormatTime(transaction.time),
  ]
    .join(' ')
    .toLowerCase();

  if (
    query.trim() &&
    !searchableText.includes(query.trim().toLowerCase())
  ) {
    return false;
  }

  if (
    filters.status !== 'All' &&
    transaction.status !== filters.status
  ) {
    return false;
  }

  const transactionDate = getDateValue(transaction.date);

  if (
    filters.from &&
    (!transactionDate || transactionDate < filters.from)
  ) {
    return false;
  }

  if (
    filters.to &&
    (!transactionDate || transactionDate > filters.to)
  ) {
    return false;
  }

  if (
    filters.min !== '' &&
    transaction.amount < Number(filters.min)
  ) {
    return false;
  }

  if (
    filters.max !== '' &&
    transaction.amount > Number(filters.max)
  ) {
    return false;
  }

  return true;
};

const initials = (name) =>
  String(name || 'Payroll')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function TransactionsTable({ transactions = [] }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [filterOpen, setFilterOpen] = useState(false);

  const safeTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) {
      return [];
    }

    return transactions.map((transaction, index) =>
      normalizeTransaction(transaction, index)
    );
  }, [transactions]);

  const rows = useMemo(
    () =>
      safeTransactions.filter((transaction) =>
        matches(transaction, query, filters)
      ),
    [safeTransactions, query, filters]
  );

  const activeCount = [
    filters.status !== 'All',
    Boolean(filters.from),
    Boolean(filters.to),
    filters.min !== '',
    filters.max !== '',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setFilters({ ...EMPTY_FILTERS });
  };

  return (
    <section
      className="fn-card fn-tx"
      aria-labelledby="fn-transactions-title"
    >
      <div className="fn-tx__bar">
        <h2
          id="fn-transactions-title"
          className="fn-tx__title"
        >
          Transactions
        </h2>

        <label className="fn-search">
          <Icon name="search" size={12} />

          <input
            type="search"
            placeholder="Search..."
            aria-label="Search transactions"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <button
          type="button"
          className="fn-btn fn-btn--filter"
          onClick={() => setFilterOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={filterOpen}
        >
          Filter

          {activeCount > 0 && (
            <span
              className="fn-btn__count"
              aria-label={`${activeCount} active filters`}
            >
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {activeCount > 0 && (
        <div className="fn-tx__filter-summary">
          <span>
            {activeCount} active{' '}
            {activeCount === 1 ? 'filter' : 'filters'}
          </span>

          <button
            type="button"
            className="fn-btn fn-btn--ghost"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="fn-table-wrap">
        <table className="fn-table">
          <thead>
            <tr>
              <th scope="col">Transaction</th>
              <th scope="col">Date</th>
              <th scope="col">Time</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((transaction, index) => {
              const statusClass = normalizeText(
                transaction.status
              ).replace(/\s+/g, '-');

              return (
                <tr
                  key={transaction.id}
                  style={{ '--i': index }}
                >
                  <td>
                    <div className="fn-bank">
                      <span
                        className="fn-bank__logo"
                        aria-hidden="true"
                      >
                        {initials(transaction.bank)}
                      </span>

                      <div>
                        <p className="fn-bank__name">
                          {transaction.bank}
                        </p>

                        <p className="fn-bank__ref">
                          {transaction.ref}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>{safeFormatDate(transaction.date)}</td>

                  <td>{safeFormatTime(transaction.time)}</td>

                  <td>{formatCurrency(transaction.amount)}</td>

                  <td>
                    <span
                      className={`fn-pill fn-pill--${statusClass}`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="fn-empty" role="status">
            {safeTransactions.length === 0
              ? 'No transactions available yet.'
              : 'No transactions match your search or filters.'}
          </p>
        )}
      </div>

      {filterOpen && (
        <TransactionFilterModal
          filters={filters}
          onClose={() => setFilterOpen(false)}
          onApply={(nextFilters) => {
            setFilters({
              ...EMPTY_FILTERS,
              ...nextFilters,
            });
            setFilterOpen(false);
          }}
        />
      )}
    </section>
  );
}