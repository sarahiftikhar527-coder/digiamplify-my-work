
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const RANGES = ['Week', 'Month', 'Year'];

const FALLBACK_COLORS = {
  high: '#c1121f',
  medium: '#f59e0b',
  low: '#22c55e',
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};

const useCountUp = (target, disabled) => {
  const [value, setValue] = useState(disabled ? target : 0);

  useEffect(() => {
    if (disabled) {
      setValue(target);
      return undefined;
    }

    const duration = 700;
    const from = value;
    const start = performance.now();
    let frame;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      setValue(Math.round(from + (target - from) * eased));

      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target, disabled]);

  return value;
};

const RangeSelect = ({ value, onChange, label, options, disabled }) => (
  <div className="relative">
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className="h-8 appearance-none rounded-md border border-[#2a2a2a] bg-black pl-2.5 pr-7 text-[11px] text-white focus:border-[#c1121f] focus:outline-none disabled:opacity-60"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>

    <ChevronDown
      size={12}
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300"
    />
  </div>
);

const Row = ({ item, index, max, total, reduceMotion }) => {
  const pct = total ? Math.round((item.count / total) * 100) : 0;
  const shownCount = useCountUp(item.count, reduceMotion);

  return (
    <li className="flex items-center gap-2">
      <span className="flex w-[68px] shrink-0 items-center gap-1.5 text-[11px] text-white">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="truncate">{item.label}</span>
      </span>

      <div
        role="progressbar"
        aria-label={`${item.label} priority tasks`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={item.count}
        className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#d4d4d4]"
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: item.color }}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${(item.count / max) * 100}%` }}
          transition={{
            duration: reduceMotion ? 0 : 0.7,
            delay: reduceMotion ? 0 : index * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>

      <span className="w-[66px] shrink-0 text-right text-[11px] text-gray-300">
        {shownCount} ({pct}%)
      </span>
    </li>
  );
};

const SkeletonRows = () => (
  <ul className="mt-6 space-y-5" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <li key={i} className="flex items-center gap-2">
        <span className="h-2.5 w-[68px] shrink-0 animate-pulse rounded bg-[#1e1e1e]" />
        <span className="h-1.5 flex-1 animate-pulse rounded-full bg-[#1e1e1e]" />
        <span className="h-2.5 w-[66px] shrink-0 animate-pulse rounded bg-[#1e1e1e]" />
      </li>
    ))}
  </ul>
);

const PriorityBreakdown = ({
  data = [],
  range = 'Week',
  onRangeChange,
  loading = false,
  error = null,
  onRetry,
  ranges = RANGES,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const items = (Array.isArray(data) ? data : []).map((d) => ({
    label: d.label ?? 'Unknown',
    count: toNumber(d.count),
    color:
      d.color ??
      FALLBACK_COLORS[String(d.label ?? '').toLowerCase()] ??
      '#9ca3af',
  }));

  const total = items.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(1, ...items.map((d) => d.count));

  const errorMessage = error
    ? typeof error === 'string'
      ? error
      : error.message || 'Something went wrong.'
    : null;

  return (
    <div aria-busy={loading}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-white">
          Priority Breakdown
        </h3>

        <RangeSelect
          label="Priority range"
          value={range}
          options={ranges}
          disabled={loading}
          onChange={onRangeChange}
        />
      </div>

      {loading ? (
        <SkeletonRows />
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
      ) : items.length === 0 ? (
        <p className="mt-6 text-center text-[11px] text-gray-400">
          No tasks for this {range.toLowerCase()}.
        </p>
      ) : (
        <ul key={range} className="mt-6 space-y-5">
          {items.map((item, index) => (
            <Row
              key={item.label}
              item={item}
              index={index}
              max={max}
              total={total}
              reduceMotion={shouldReduceMotion}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default PriorityBreakdown;