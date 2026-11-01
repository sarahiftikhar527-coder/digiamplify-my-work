import { motion, useReducedMotion } from 'framer-motion';

const STATUS = {
  done: { label: 'Done', className: 'text-green-500' },
  left: { label: 'Left', className: 'text-[#e5202e]' },
  pending: { label: '-', className: 'text-orange-400' },
  none: { label: '-', className: 'text-gray-200' },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const ROW =
  'grid grid-cols-5 items-center gap-2 px-3 text-center text-[11px]';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T/;

const formatDate = (value) => {
  if (!value) return '-';

  const text = String(value);

  if (
    !DATE_ONLY.test(text.slice(0, 10)) ||
    (text.length > 10 && !DATE_TIME.test(text))
  ) {
    return text;
  }

  const date = new Date(`${text.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return text;

  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
};

const formatTime = (value) => {
  if (!value) return '-';

  const text = String(value);
  if (!DATE_TIME.test(text)) return text;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 === 0 ? 12 : hours % 12;

  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
};

const minutesToText = (total) => {
  const minutes = Math.max(0, Math.round(total));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
};

const getWorkHours = (row) => {
  if (
    Number.isFinite(Number(row.workMinutes)) &&
    row.workMinutes !== null &&
    row.workMinutes !== undefined
  ) {
    return minutesToText(Number(row.workMinutes));
  }

  if (row.workHours) return String(row.workHours);

  if (
    DATE_TIME.test(String(row.clockIn)) &&
    DATE_TIME.test(String(row.clockOut))
  ) {
    const diff = (new Date(row.clockOut) - new Date(row.clockIn)) / 60000;

    if (Number.isFinite(diff) && diff >= 0) {
      return minutesToText(diff);
    }
  }

  return '-';
};

const SkeletonRows = () => (
  <div aria-hidden="true">
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className={`${ROW} border-t border-[#1e1e1e] py-3`}
      >
        {[0, 1, 2, 3, 4].map((c) => (
          <span
            key={c}
            className="mx-auto h-2.5 w-4/5 animate-pulse rounded bg-[#1e1e1e]"
          />
        ))}
      </div>
    ))}
  </div>
);

const ShiftAssignedTable = ({
  rows = [],
  loading = false,
  error = null,
  onRetry,
  onRowClick,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const list = Array.isArray(rows) ? rows : [];

  const errorMessage = error
    ? typeof error === 'string'
      ? error
      : error.message || 'Something went wrong.'
    : null;

  return (
    <div aria-busy={loading}>
      <h3 className="text-sm font-medium text-white">
        Shift Assigned
      </h3>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[460px] overflow-hidden rounded-md border border-[#1e1e1e]">
          <div className={`${ROW} bg-[#0f0f0f] py-3 text-gray-300`}>
            <span>Date</span>
            <span>Clock In</span>
            <span>Clock Out</span>
            <span>Work Hours</span>
            <span>Status</span>
          </div>

          {loading ? (
            <SkeletonRows />
          ) : errorMessage ? (
            <div
              role="alert"
              className="border-t border-[#1e1e1e] px-3 py-6 text-center"
            >
              <p className="text-[11px] text-red-500">
                {errorMessage}
              </p>

              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-2.5 h-8 rounded-md border border-[#2a2a2a] px-3 text-[11px] text-gray-200 transition-colors hover:border-[#c1121f] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1121f]"
                >
                  Try again
                </button>
              )}
            </div>
          ) : list.length === 0 ? (
            <p className="border-t border-[#1e1e1e] px-3 py-6 text-center text-[11px] text-gray-400">
              No shifts assigned yet.
            </p>
          ) : (
            list.map((row, index) => {
              const status = STATUS[row.status] ?? STATUS.none;
              const clickable = Boolean(onRowClick);

              return (
                <motion.div
                  key={row.id ?? index}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.35,
                    delay: shouldReduceMotion ? 0 : index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  {...(clickable
                    ? {
                        role: 'button',
                        tabIndex: 0,
                        onClick: () => onRowClick(row),
                        onKeyDown: (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        },
                      }
                    : {})}
                  className={`${ROW} border-t border-[#1e1e1e] py-3 text-gray-100 ${
                    clickable
                      ? 'cursor-pointer transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c1121f]'
                      : ''
                  }`}
                >
                  <span>{formatDate(row.date)}</span>
                  <span>{formatTime(row.clockIn)}</span>
                  <span>{formatTime(row.clockOut)}</span>
                  <span>{getWorkHours(row)}</span>
                  <span className={status.className}>{status.label}</span>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftAssignedTable;