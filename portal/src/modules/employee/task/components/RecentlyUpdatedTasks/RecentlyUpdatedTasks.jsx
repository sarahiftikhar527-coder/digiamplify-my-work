
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageSquareText } from 'lucide-react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : 0;
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatUpdatedAt = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 === 0 ? 12 : hours % 12;
  const time = `${String(hours).padStart(2, '0')}:${minutes} ${period}`;

  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86400000
  );

  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;

  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${time}`;
};

const itemTime = (item) =>
  item.updatedAt ? formatUpdatedAt(item.updatedAt) : item.time ?? '';

const SkeletonList = () => (
  <ul className="mt-3" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <li
        key={i}
        className={`flex items-center gap-3 py-3 ${
          i > 0 ? 'border-t border-[#1e1e1e]' : ''
        }`}
      >
        <span className="h-8 w-8 shrink-0 animate-pulse rounded-md bg-[#1e1e1e]" />

        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="block h-2.5 w-2/3 animate-pulse rounded bg-[#1e1e1e]" />
          <span className="block h-2.5 w-1/2 animate-pulse rounded bg-[#1e1e1e]" />
        </div>

        <span className="h-2.5 w-20 shrink-0 animate-pulse rounded bg-[#1e1e1e]" />
      </li>
    ))}
  </ul>
);

const RecentlyUpdatedTasks = ({
  items = [],
  newCount = 0,
  loading = false,
  error = null,
  onRetry,
  onItemClick,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const list = Array.isArray(items) ? items : [];

  const errorMessage = error
    ? typeof error === 'string'
      ? error
      : error.message || 'Something went wrong.'
    : null;

  const showNew = !loading && !errorMessage && Number(newCount) > 0;

  return (
    <div aria-busy={loading}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-white">
          Recently Updated Task
        </h3>

        <AnimatePresence>
          {showNew && (
            <motion.span
              key="new-count"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              className="text-[11px] text-[#e5202e]"
            >
              {newCount} New
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <SkeletonList />
      ) : errorMessage ? (
        <div role="alert" className="mt-6 text-center">
          <p className="text-[11px] text-red-500">{errorMessage}</p>

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
        <p className="mt-6 text-center text-[11px] text-gray-400">
          No recent updates yet.
        </p>
      ) : (
        <ul className="mt-3">
          <AnimatePresence initial={!shouldReduceMotion} mode="popLayout">
            {list.map((item, index) => {
              const Wrapper = onItemClick ? 'button' : 'div';

              return (
                <motion.li
                  key={item.id ?? index}
                  layout={!shouldReduceMotion}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.35,
                    delay: shouldReduceMotion ? 0 : index * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={index > 0 ? 'border-t border-[#1e1e1e]' : ''}
                >
                  <Wrapper
                    {...(onItemClick
                      ? { type: 'button', onClick: () => onItemClick(item) }
                      : {})}
                    className={`flex w-full items-center gap-3 py-3 text-left ${
                      onItemClick
                        ? 'rounded-md transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1121f]'
                        : ''
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-900/70 bg-red-950/50 text-red-600">
                      <MessageSquareText size={14} aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-white">
                        {item.title}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-gray-400">
                        Progress Updated to {toNumber(item.progress)}%
                      </p>
                    </div>

                    <span className="shrink-0 text-[11px] text-gray-200">
                      {itemTime(item)}
                    </span>
                  </Wrapper>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default RecentlyUpdatedTasks;