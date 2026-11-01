
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { Target, Gauge, Star, TrendingUp } from "lucide-react";

const W = 360;
const H = 210;
const L = 38;
const R = 12;
const T = 24;
const B = 32;
const GRID = [100, 75, 50, 25, 0];
const RANGES = ["Week", "Month", "Year"];

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const plotWidth = W - L - R;
const plotHeight = H - T - B;

const getX = (x, minX, maxX) =>
  L + ((x - minX) / (maxX - minX || 1)) * plotWidth;

const getY = (value) =>
  T + (1 - clamp(value, 0, 100) / 100) * plotHeight;

const createSmoothPath = (points) => {
  if (!points.length) return "";

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const previous = points[Math.max(0, i - 1)];
    const current = points[i];
    const next = points[i + 1];
    const afterNext = points[Math.min(points.length - 1, i + 2)];

    const tension = 0.2;

    const control1X =
      current.x + (next.x - previous.x) * tension;

    const control1Y =
      current.y + (next.y - previous.y) * tension;

    const control2X =
      next.x - (afterNext.x - current.x) * tension;

    const control2Y =
      next.y - (afterNext.y - current.y) * tension;

    path += ` C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${next.x} ${next.y}`;
  }

  return path;
};

const AnimatedNumber = ({ value, reduce }) => {
  const numericValue = toNumber(value);
  const motionValue = useMotionValue(numericValue);
  const [display, setDisplay] = useState(numericValue);
  const decimals = Number.isInteger(numericValue) ? 0 : 1;

  useEffect(() => {
    const unsubscribe = motionValue.on("change", setDisplay);

    if (reduce) {
      motionValue.set(numericValue);
      setDisplay(numericValue);
      return unsubscribe;
    }

    const controls = animate(motionValue, numericValue, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [numericValue, reduce, motionValue]);

  return <>{Number(display).toFixed(decimals)}</>;
};

export const normalizePerformance = (raw) => {
  const data = raw?.data ?? raw ?? {};

  return {
    overall: data.overall ?? data.overallPerformance ?? 0,
    series: Array.isArray(data.series) ? data.series : [],
    xTicks: Array.isArray(data.xTicks)
      ? data.xTicks
      : Array.isArray(data.ticks)
        ? data.ticks
        : [],
    goals: data.goals ?? data.goalsAchieved ?? "-",
    kpi: data.kpi ?? data.kpiScore ?? "-",
    feedback: data.feedback ?? "-",
  };
};

export const usePerformanceOverview = ({
  endpoint,
  initialRange = "Month",
  enabled = true,
  pollMs = 0,
  headers,
  fetcher,
  transform = normalizePerformance,
} = {}) => {
  const [range, setRange] = useState(initialRange);
  const [data, setData] = useState(() => transform({}));
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const latest = useRef({ fetcher, transform, headers, endpoint });
  latest.current = { fetcher, transform, headers, endpoint };

  const controllerRef = useRef(null);

  const load = useCallback(async (currentRange, options = {}) => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    if (!options.silent) setLoading(true);
    setError("");

    try {
      const {
        fetcher: custom,
        transform: map,
        headers: requestHeaders,
        endpoint: url,
      } = latest.current;

      let responseData;

      if (custom) {
        responseData = await custom(currentRange, {
          signal: controller.signal,
        });
      } else {
        if (!url) {
          throw new Error("Performance API endpoint is not configured.");
        }

        const response = await fetch(
          `${url}?range=${encodeURIComponent(currentRange.toLowerCase())}`,
          {
            signal: controller.signal,
            credentials: "include",
            headers: {
              Accept: "application/json",
              ...requestHeaders,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        responseData = await response.json();
      }

      if (controller.signal.aborted) return;

      setData(map(responseData));
    } catch (err) {
      if (controller.signal.aborted || err?.name === "AbortError") {
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load performance data."
      );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    load(range);

    return () => controllerRef.current?.abort();
  }, [range, enabled, load]);

  useEffect(() => {
    if (!enabled || !pollMs) return undefined;

    const intervalId = setInterval(
      () => load(range, { silent: true }),
      pollMs
    );

    return () => clearInterval(intervalId);
  }, [range, enabled, pollMs, load]);

  const onRetry = useCallback(
    () => load(range),
    [load, range]
  );

  return {
    ...data,
    range,
    onRangeChange: setRange,
    loading,
    error,
    onRetry,
  };
};

const PerformanceOverviewView = ({
  overall = 0,
  series = [],
  xTicks = [],
  goals = "-",
  kpi = "-",
  feedback = "-",
  range = "Month",
  onRangeChange,
  loading = false,
  error = "",
  onRetry,
}) => {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const gradientId = `performance-area-${uid}`;
  const lineGradientId = `performance-line-${uid}`;
  const clipId = `performance-clip-${uid}`;
  const svgRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(null);

  const safeOverall = clamp(toNumber(overall), 0, 100);

  const safeSeries = useMemo(() => {
    if (!Array.isArray(series)) return [];

    return series
      .filter(
        (item) =>
          item &&
          Number.isFinite(Number(item.x)) &&
          Number.isFinite(Number(item.value))
      )
      .map((item) => ({
        x: toNumber(item.x),
        value: clamp(toNumber(item.value), 0, 100),
        label: String(item.label ?? ""),
      }))
      .sort((a, b) => a.x - b.x);
  }, [series]);

  const safeTicks = useMemo(() => {
    if (!Array.isArray(xTicks)) return [];

    return xTicks.filter(
      (item) =>
        item &&
        Number.isFinite(Number(item.x)) &&
        typeof item.label === "string"
    );
  }, [xTicks]);

  const minX = safeSeries[0]?.x ?? 0;
  const maxX = safeSeries[safeSeries.length - 1]?.x ?? 1;

  const points = useMemo(
    () =>
      safeSeries.map((item) => ({
        x: getX(item.x, minX, maxX),
        y: getY(item.value),
        value: item.value,
        label: item.label,
        originalX: item.x,
      })),
    [safeSeries, minX, maxX]
  );

  const linePath = useMemo(
    () => createSmoothPath(points),
    [points]
  );

  const areaPath = useMemo(() => {
    if (!linePath || points.length < 2) return "";

    const first = points[0];
    const last = points[points.length - 1];

    return `${linePath} L ${last.x} ${H - B} L ${first.x} ${H - B} Z`;
  }, [linePath, points]);

  const dataKey = useMemo(
    () =>
      `${range}-${safeSeries
        .map((point) => `${point.x}:${point.value}`)
        .join(",")}`,
    [range, safeSeries]
  );

  useEffect(() => {
    setActiveIndex(null);
  }, [dataKey]);

  const lastIndex = points.length - 1;

  const currentIndex =
    activeIndex !== null && activeIndex <= lastIndex
      ? activeIndex
      : lastIndex;

  const current = currentIndex >= 0 ? points[currentIndex] : null;

  const ease = [0.22, 1, 0.36, 1];

  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.7, ease };

  const stats = [
    { icon: Target, label: "Goals Achieved", value: goals },
    { icon: Gauge, label: "KPI Score", value: kpi },
    { icon: Star, label: "Feedback", value: feedback },
  ];

  const pickNearest = (clientX) => {
    const svg = svgRef.current;

    if (!svg || !points.length) return;

    const rect = svg.getBoundingClientRect();

    if (!rect.width) return;

    const x = ((clientX - rect.left) / rect.width) * W;

    let nearest = 0;
    let distance = Infinity;

    points.forEach((point, index) => {
      const currentDistance = Math.abs(point.x - x);

      if (currentDistance < distance) {
        distance = currentDistance;
        nearest = index;
      }
    });

    setActiveIndex(nearest);
  };

  const handleKeyDown = (event) => {
    if (!points.length) return;

    if (event.key === "Escape") {
      setActiveIndex(null);
      return;
    }

    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex += 1;
    else if (event.key === "ArrowLeft") nextIndex -= 1;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = lastIndex;
    else return;

    event.preventDefault();
    setActiveIndex(clamp(nextIndex, 0, lastIndex));
  };

  const tooltipWidth = 62;
  const tooltipY = current
    ? Math.max(2, current.y - 32)
    : 0;
  const tooltipX = current
    ? clamp(current.x - tooltipWidth / 2, L, W - R - tooltipWidth)
    : 0;

  const tickX = (tick) => getX(toNumber(tick.x), minX, maxX);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      aria-busy={loading}
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-[#252525] bg-[#0b0b0b] p-4 text-white"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-red-900/50 bg-red-950/40">
            <TrendingUp size={14} className="text-red-500" />
          </div>

          <h3 className="truncate text-xs font-medium text-white sm:text-sm">
            Performance Overview
          </h3>
        </div>

        <div
          role="group"
          aria-label="Performance date range"
          className="flex shrink-0 rounded-md border border-[#303030] bg-[#101010] p-0.5"
        >
          {RANGES.map((item) => {
            const selected = item === range;

            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                disabled={loading}
                onClick={() => {
                  if (!selected) onRangeChange?.(item);
                }}
                className={`rounded px-2 py-1 text-[9px] transition-colors sm:px-2.5 sm:text-[10px] ${
                  selected
                    ? "bg-red-900/70 text-white shadow-sm"
                    : "text-neutral-500 hover:bg-white/5 hover:text-neutral-200"
                } disabled:cursor-not-allowed`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tracking-tight tabular-nums text-white">
              <AnimatedNumber value={safeOverall} reduce={reduce} />
            </span>
            <span className="text-sm font-medium text-red-500">%</span>
          </div>

          <p className="mt-0.5 text-[10px] text-neutral-500">
            Overall Performance
          </p>
        </div>

        <div className="mb-1 rounded-md border border-red-900/40 bg-red-950/20 px-2.5 py-1.5 text-right">
          <p className="text-[9px] text-neutral-500">Selected period</p>
          <p className="text-[10px] font-medium text-red-300">{range}</p>
        </div>
      </div>

      <div className="relative mt-3 min-w-0">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          tabIndex={points.length ? 0 : -1}
          aria-label={`Performance area chart showing ${safeOverall} percent overall performance. Use arrow keys to inspect data points.`}
          onPointerMove={(event) => pickNearest(event.clientX)}
          onPointerDown={(event) => pickNearest(event.clientX)}
          onPointerLeave={() => setActiveIndex(null)}
          onKeyDown={handleKeyDown}
          className="block h-auto w-full overflow-visible outline-none focus-visible:ring-1 focus-visible:ring-red-700/60"
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#ef3340" stopOpacity="0.28" />
              <stop offset="55%" stopColor="#c1121f" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#c1121f" stopOpacity="0.01" />
            </linearGradient>

            <linearGradient
              id={lineGradientId}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#a31520" />
              <stop offset="50%" stopColor="#e52b39" />
              <stop offset="100%" stopColor="#ff5964" />
            </linearGradient>

            <clipPath id={clipId}>
              <rect
                x={L}
                y={T}
                width={plotWidth}
                height={plotHeight}
              />
            </clipPath>
          </defs>

          {GRID.map((value) => {
            const y = getY(value);

            return (
              <g key={value}>
                <line
                  x1={L}
                  x2={W - R}
                  y1={y}
                  y2={y}
                  stroke={value === 0 ? "#414141" : "#282828"}
                  strokeWidth={value === 0 ? 0.9 : 0.7}
                  strokeDasharray={value === 0 ? undefined : "3 5"}
                />

                <text
                  x={L - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#858585"
                >
                  {value}
                </text>
              </g>
            );
          })}

          <g clipPath={`url(#${clipId})`}>
            {areaPath && (
              <motion.path
                key={`area-${dataKey}`}
                d={areaPath}
                fill={`url(#${gradientId})`}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: loading ? 0.45 : 1 }}
                transition={{
                  duration: reduce ? 0 : 0.8,
                  ease,
                }}
              />
            )}

            {linePath && (
              <motion.path
                key={`line-${dataKey}`}
                d={linePath}
                fill="none"
                stroke={`url(#${lineGradientId})`}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: loading ? 0.5 : 1 }}
                transition={{
                  duration: reduce ? 0 : 0.8,
                  ease,
                }}
              />
            )}

            {current && (
              <>
                <line
                  x1={current.x}
                  x2={current.x}
                  y1={T}
                  y2={H - B}
                  stroke="#f87171"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  opacity="0.65"
                />

                <circle
                  cx={current.x}
                  cy={current.y}
                  r="9"
                  fill="#c1121f"
                  opacity="0.14"
                />

                <circle
                  cx={current.x}
                  cy={current.y}
                  r="5"
                  fill="#0b0b0b"
                  stroke="#ff5964"
                  strokeWidth="2"
                />

                <circle
                  cx={current.x}
                  cy={current.y}
                  r="2"
                  fill="#ffffff"
                />
              </>
            )}
          </g>

          {safeTicks.map((tick, index) => (
            <text
              key={`${tick.x}-${tick.label}-${index}`}
              x={tickX(tick)}
              y={H - 10}
              textAnchor="middle"
              fontSize="9"
              fill="#8b8b8b"
            >
              {tick.label}
            </text>
          ))}

          {current && (
            <g pointerEvents="none">
              <rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipWidth}
                height="23"
                rx="5"
                fill="#241012"
                stroke="#7f1d27"
                strokeWidth="0.8"
              />

              <text
                x={tooltipX + tooltipWidth / 2}
                y={tooltipY + 9}
                textAnchor="middle"
                fontSize="7"
                fill="#fca5a5"
              >
                {current.label || `Point ${current.originalX}`}
              </text>

              <text
                x={tooltipX + tooltipWidth / 2}
                y={tooltipY + 18}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="#ffffff"
              >
                {current.value}%
              </text>
            </g>
          )}
        </svg>

        {!loading && !error && safeSeries.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0b0b]/70">
            <p className="text-center text-xs text-neutral-500">
              No performance data for this {range.toLowerCase()}
            </p>
          </div>
        )}

        <AnimatePresence>
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-[#0b0b0b]/65"
            >
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-900/50 border-t-red-500" />
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0b0b0b]/95 px-3 text-center"
            >
              <p className="text-xs text-red-400">{error}</p>

              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded border border-red-900 px-3 py-1 text-[10px] text-neutral-200 transition hover:bg-red-950"
                >
                  Retry
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-3">
        {stats.map(({ icon: Icon, label, value }, index) => (
          <motion.div
            key={label}
            initial={reduce ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...transition,
              delay: reduce ? 0 : index * 0.08,
            }}
            className="min-w-0 px-1 text-center first:pl-0 last:pr-0"
          >
            <p className="flex min-h-7 items-center justify-center gap-1 text-[9px] leading-tight text-neutral-500 sm:text-[10px]">
              <Icon size={11} className="shrink-0 text-red-500" />
              <span>{label}</span>
            </p>

            <div className="mt-1 flex min-h-7 items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={String(value ?? "-")}
                  initial={reduce ? false : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -5 }}
                  transition={{ duration: reduce ? 0 : 0.2 }}
                  className="break-words text-[10px] font-medium leading-tight text-white sm:text-xs"
                >
                  {value ?? "-"}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const PerformanceOverview = ({
  endpoint,
  fetcher,
  pollMs,
  headers,
  transform,
  initialRange = "Month",
  ...props
}) => {
  const remote = Boolean(endpoint || fetcher);

  const remoteProps = usePerformanceOverview({
    endpoint,
    fetcher,
    pollMs,
    headers,
    transform,
    initialRange,
    enabled: remote,
  });

  const [innerRange, setInnerRange] = useState(
    props.range ?? initialRange
  );

  if (remote) {
    return (
      <PerformanceOverviewView
        {...remoteProps}
        onRangeChange={(next) => {
          remoteProps.onRangeChange(next);
          props.onRangeChange?.(next);
        }}
      />
    );
  }

  return (
    <PerformanceOverviewView
      {...props}
      range={props.range ?? innerRange}
      onRangeChange={(next) => {
        setInnerRange(next);
        props.onRangeChange?.(next);
      }}
    />
  );
};

export default PerformanceOverview;
