import { useMemo, useState } from 'react';
import Icon from '../Icons';
import PanelState from '../PanelState';

const getDateValue = (item) => {
  if (typeof item === 'string') return item.slice(0, 10);

  if (item && typeof item === 'object') {
    const value =
      item.dateKey ??
      item.date ??
      item.attendanceDate ??
      item.absenceDate;

    return value ? String(value).slice(0, 10) : '';
  }

  return '';
};

const parseDate = (value) => {
  if (!value || typeof value !== 'string') return null;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    12,
    0,
    0
  );

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date;
};

const formatDate = (value) => {
  const date = parseDate(getDateValue(value));

  if (!date) return 'Unknown date';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const getWeekday = (value) => {
  const date = parseDate(getDateValue(value));

  if (!date) return '';

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
  }).format(date);
};

const formatMonth = (value) => {
  if (!value || !/^\d{4}-\d{2}$/.test(String(value))) {
    return 'this month';
  }

  const [year, month] = String(value).split('-').map(Number);
  const date = new Date(year, month - 1, 15, 12);

  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const getSafeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? number
    : fallback;
};

export default function EmployeeAbsenteeismCard({
  data,
  loading = false,
  error = '',
  onRetry,
  onViewDetail,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const absentDates = useMemo(() => {
    if (!Array.isArray(data?.absentDates)) return [];

    const uniqueDates = new Map();

    data.absentDates.forEach((item) => {
      const date = getDateValue(item);

      if (!date || !parseDate(date)) return;

      if (!uniqueDates.has(date)) {
        uniqueDates.set(date, {
          date,
          original: item,
        });
      }
    });

    return Array.from(uniqueDates.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((item) => item.original);
  }, [data?.absentDates]);

  const hasAbsentDates = Array.isArray(data?.absentDates);

  const absent = hasAbsentDates
    ? absentDates.length
    : getSafeNumber(data?.absent, 0);

  const total = getSafeNumber(data?.total, 0);

  const pct = total > 0
    ? Math.min(100, Math.round((absent / total) * 100))
    : 0;

  const monthLabel = formatMonth(data?.month);

  const handleViewDetails = () => {
    setShowDetails(true);

    if (typeof onViewDetail === 'function') {
      onViewDetail();
    }
  };

  const closeDetails = () => setShowDetails(false);

  return (
    <>
      <section className="cal-card">
        <PanelState
          loading={loading}
          error={error}
          onRetry={onRetry}
          empty={!data}
          emptyText="Your attendance data is not available."
        >
          <div className="cal-absent__row">
            <span className="cal-absent__icon">
              <Icon name="users" size={13} />
            </span>

            <div>
              <h2 className="cal-card__title">My Absences</h2>

              <p className="cal-card__sub">
                {hasAbsentDates
                  ? `You have been absent ${absent} ${absent === 1 ? 'day' : 'days'} in ${monthLabel}.`
                  : 'Absence dates have not been provided by the attendance API.'}
              </p>
            </div>
          </div>

          <div className="cal-absent__bar">
            <div
              className="cal-bar"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Your absence percentage"
            >
              <span style={{ width: `${pct}%` }} />
            </div>

            <span className="cal-absent__percentage">
              {total > 0 ? `${pct}%` : '—'}
            </span>

            <button
              type="button"
              className="cal-linkbtn"
              onClick={handleViewDetails}
              disabled={loading || Boolean(error) || !data}
            >
              View Details
            </button>
          </div>
        </PanelState>
      </section>

      {showDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="my-absence-title"
            className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] text-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-[#252525] p-5">
              <div>
                <h2
                  id="my-absence-title"
                  className="text-lg font-semibold"
                >
                  My Absence Details
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Attendance records for {monthLabel}
                </p>

                {data?.timezone && (
                  <p className="mt-1 text-xs text-gray-500">
                    Time zone: {data.timezone}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close absence details"
                className="rounded-md p-2 text-gray-400 transition hover:bg-[#202020] hover:text-white"
              >
                <Icon name="x" size={18} />
              </button>
            </header>

            <div className="max-h-[65vh] overflow-y-auto p-5">
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#292929] bg-[#151515] p-4">
                  <p className="text-sm text-gray-400">Absent Days</p>
                  <p className="mt-2 text-2xl font-semibold text-red-400">
                    {absent}
                  </p>
                </div>

                <div className="rounded-lg border border-[#292929] bg-[#151515] p-4">
                  <p className="text-sm text-gray-400">Working Days</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {total > 0 ? total : '—'}
                  </p>
                </div>
              </div>

              <div className="mb-5 rounded-lg border border-[#292929] bg-[#151515] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-400">
                    Absence percentage
                  </p>

                  <p className="text-sm font-semibold">
                    {total > 0 ? `${pct}%` : 'Not available'}
                  </p>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-[#292929]"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Absence percentage"
                >
                  <div
                    className="h-full rounded-full bg-red-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <h3 className="mb-3 text-sm font-semibold">
                Absent Dates
              </h3>

              {hasAbsentDates && absentDates.length > 0 ? (
                <ul className="space-y-3">
                  {absentDates.map((item) => {
                    const dateValue = getDateValue(item);

                    return (
                      <li
                        key={dateValue}
                        className="flex items-center gap-3 rounded-lg border border-[#292929] bg-[#141414] p-3"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                          <Icon name="calendar-days" size={18} />
                        </span>

                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {formatDate(dateValue)}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {getWeekday(dateValue)}
                          </p>
                        </div>

                        <span className="ml-auto rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-400">
                          Absent
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-lg border border-[#292929] bg-[#141414] p-6 text-center">
                  <Icon
                    name={hasAbsentDates ? 'calendar-check' : 'calendar-clock'}
                    size={28}
                  />

                  <p className="mt-3 text-sm font-medium">
                    {hasAbsentDates
                      ? 'No absent dates recorded'
                      : 'Absence dates are unavailable'}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {hasAbsentDates
                      ? 'No confirmed absent dates were returned for this month.'
                      : 'The attendance API must return absentDates to display actual absence dates.'}
                  </p>
                </div>
              )}
            </div>

            <footer className="flex justify-end border-t border-[#252525] p-4">
              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium transition hover:bg-red-700"
              >
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
