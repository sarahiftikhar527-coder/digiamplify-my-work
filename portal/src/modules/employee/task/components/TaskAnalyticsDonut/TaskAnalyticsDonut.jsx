
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  CalendarClock,
  CheckCheck,
  ChevronDown,
} from 'lucide-react';

const SIZE = 150;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const GAP = 4;

const RangeSelect = ({ value, onChange, label }) => (
  <div className="relative">
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="h-8 appearance-none rounded-md border border-[#2a2a2a] bg-black pl-2.5 pr-7 text-xs text-white focus:border-[#c1121f] focus:outline-none"
    >
      {['Week', 'Month', 'Year'].map((o) => (
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

const TaskAnalyticsDonut = ({
  data = [],
  percent,
  summary = {},
  range = 'Week',
  onRangeChange,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const completed = data.find((d) => d.label === 'Completed')?.value ?? 0;

  const centerPercent =
    percent ?? (total ? Math.round((completed / total) * 100) : 0);

  let cumulative = 0;

  const segments = data.map((d) => {
    const length = total ? (d.value / total) * C : 0;
    const segment = { ...d, length, offset: cumulative };
    cumulative += length;
    return segment;
  });

  const summaryItems = [
    {
      label: "Today's Task",
      value: summary.today ?? 0,
      icon: CalendarClock,
    },
    {
      label: 'Completed',
      value: summary.completed ?? 0,
      icon: CheckCheck,
    },
    {
      label: 'Pending',
      value: summary.pending ?? 0,
      icon: AlertCircle,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-white">
          Task Analytics
        </h3>

        <RangeSelect
          label="Analytics range"
          value={range}
          onChange={onRangeChange}
        />
      </div>

      {/* Donut Center + Legend */}
      <div className="mt-5 flex flex-col items-center gap-5">
        {/* Donut Chart — Centered */}
        <div
          className="relative mx-auto shrink-0"
          style={{ width: SIZE, height: SIZE }}
          role="img"
          aria-label={`${centerPercent}% of tasks completed`}
        >
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            fill="none"
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke="#262626"
              strokeWidth={STROKE}
            />

            <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
              {segments.map((seg, i) => {
                const dash = Math.max(
                  seg.length - (segments.length > 1 ? GAP : 0),
                  0
                );

                if (dash === 0) return null;

                return (
                  <motion.circle
                    key={seg.label}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={R}
                    stroke={seg.color}
                    strokeWidth={STROKE}
                    strokeDashoffset={-seg.offset}
                    initial={
                      shouldReduceMotion
                        ? false
                        : { strokeDasharray: `0 ${C}` }
                    }
                    animate={{
                      strokeDasharray: `${dash} ${C - dash}`,
                    }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.8,
                      delay: shouldReduceMotion ? 0 : i * 0.1,
                      ease: 'easeOut',
                    }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-medium leading-tight text-white">
              {centerPercent}%
            </span>

            <span className="mt-1 text-[10px] text-gray-300">
              Task completed
            </span>
          </div>
        </div>

        {/* Legend — Smaller Font */}
        <ul className="w-full space-y-2">
          {data.map((d) => {
            const pct = total
              ? Math.round((d.value / total) * 100)
              : 0;

            return (
              <li
                key={d.label}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: d.color }}
                />

                <span className="min-w-0 flex-1 truncate text-gray-200">
                  {d.label}
                </span>

                <span className="shrink-0 text-gray-400">
                  {d.value} ({pct}%)
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Compact Summary Table */}
      <div className="mt-5 grid grid-cols-3 divide-x divide-[#1e1e1e] rounded-md border border-[#1e1e1e] py-3">
        {summaryItems.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="min-w-0 px-1.5 text-center"
          >
            <p className="flex items-center justify-center gap-1 text-[10px] leading-tight text-gray-300">
              <Icon
                size={12}
                className="shrink-0 text-[#c1121f]"
                aria-hidden="true"
              />

              <span className="truncate">{label}</span>
            </p>

            <p className="mt-2 text-xs font-medium text-white">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskAnalyticsDonut;