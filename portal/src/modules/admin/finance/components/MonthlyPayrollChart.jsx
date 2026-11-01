
import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const H = 260;
const PAD = { top: 16, right: 16, bottom: 30, left: 48 };
const INSET = 10;
const TICKS = [0, 200, 400, 600, 800, 1000];
const DURATION = 1600;
const RED = '#e0212f';

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const normalizeSeries = (series) => {
  const source = series?.chart ?? series ?? {};

  return {
    Week: Array.isArray(source.Week) ? source.Week : [],
    Month: Array.isArray(source.Month) ? source.Month : [],
    Year: Array.isArray(source.Year) ? source.Year : [],
  };
};

export default function MonthlyPayrollChart({ series }) {
  const uid = useId().replace(/:/g, '');
  const wrapRef = useRef(null);

  const [view, setView] = useState('Month');
  const [width, setWidth] = useState(0);
  const [inView, setInView] = useState(false);
  const [startedFor, setStartedFor] = useState(null);
  const [active, setActive] = useState(null);

  const chartSeries = normalizeSeries(series);
  const data = chartSeries[view];
  const n = data.length;
  const reduced = reducedMotion();
  const drawn = startedFor === view;
  const hasData = n > 0;

  useEffect(() => {
    const element = wrapRef.current;

    if (!element || typeof ResizeObserver === 'undefined') {
      if (element) setWidth(Math.floor(element.getBoundingClientRect().width));
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = wrapRef.current;

    if (!element || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!width || !inView) return undefined;

    if (reducedMotion()) {
      setStartedFor(view);
      return undefined;
    }

    let secondFrame;

    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setStartedFor(view));
    });

    return () => {
      cancelAnimationFrame(firstFrame);

      if (secondFrame !== undefined) {
        cancelAnimationFrame(secondFrame);
      }
    };
  }, [view, width, inView]);

  useEffect(() => {
    if (active !== null && active >= n) {
      setActive(null);
    }
  }, [active, n]);

  const innerW = Math.max(width - PAD.left - PAD.right - INSET * 2, 1);
  const innerH = H - PAD.top - PAD.bottom;
  const spacing = n > 1 ? innerW / (n - 1) : innerW;

  const maxValue = Math.max(
    1000,
    ...data.map((item) => Number(item.value) || 0)
  );

  const chartMax = Math.ceil(maxValue / 200) * 200;
  const ticks = Array.from(
    { length: Math.floor(chartMax / 200) + 1 },
    (_, index) => index * 200
  );

  const x = (index) => PAD.left + INSET + index * spacing;

  const y = (value) =>
    PAD.top +
    innerH * (1 - Math.max(0, Number(value) || 0) / chartMax);

  const baseY = PAD.top + innerH;

  const line = data
    .map((item, index) => `${x(index)},${y(item.value)}`)
    .join(' ');

  const area = hasData
    ? `M${x(0)},${baseY} ${data
        .map((item, index) => `L${x(index)},${y(item.value)}`)
        .join(' ')} L${x(n - 1)},${baseY} Z`
    : '';

  const labelStep = Math.max(1, Math.ceil(46 / spacing));

  const onMove = (event) => {
    if (!hasData || spacing <= 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const index = Math.round((pointerX - x(0)) / spacing);

    setActive(Math.min(n - 1, Math.max(0, index)));
  };

  const tip = active !== null ? data[active] : null;
  const tipLeft = tip ? Math.min(Math.max(x(active), 56), width - 56) : 0;
  const transition = (value) => (reduced ? 'none' : value);

  return (
    <section
      className="rounded-lg border border-[#232323] bg-[#0a0a0a] p-4 sm:p-5"
      aria-labelledby="payroll-chart-title"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="payroll-chart-title" className="text-xs font-semibold">
          Monthly Payroll Analytic
        </h2>

        <div className="relative">
          <select
            value={view}
            onChange={(event) => {
              setView(event.target.value);
              setActive(null);
            }}
            aria-label="Chart range"
            className="appearance-none rounded border border-[#2a2a2a] bg-black py-1.5 pl-3 pr-8 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
          >
            {Object.keys(chartSeries).map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>

          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400"
          />
        </div>
      </div>

      <div ref={wrapRef} className="relative w-full" style={{ height: H }}>
        {width > 0 && hasData && (
          <svg
            width={width}
            height={H}
            viewBox={`0 0 ${width} ${H}`}
            role="img"
            aria-label={`Payroll by ${view.toLowerCase()}, peak ${Math.max(
              ...data.map((item) => Number(item.value) || 0)
            )} thousand PKR`}
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setActive(null)}
            style={{ touchAction: 'pan-y' }}
          >
            <defs>
              <linearGradient
                id={`fill-${uid}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={RED} stopOpacity="0.6" />
                <stop offset="100%" stopColor={RED} stopOpacity="0.04" />
              </linearGradient>
            </defs>

            {ticks.map((value) => (
              <g key={value}>
                <line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={y(value)}
                  y2={y(value)}
                  stroke="#3a3a3a"
                  strokeDasharray="3 4"
                />

                <text
                  x={PAD.left - 10}
                  y={y(value) + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#a3a3a3"
                >
                  {value === 0 ? '0' : `${value}K`}
                </text>
              </g>
            ))}

            {data.map(
              (item, index) =>
                index % labelStep === 0 && (
                  <text
                    key={`${item.label}-${index}`}
                    x={x(index)}
                    y={H - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#a3a3a3"
                  >
                    {item.label}
                  </text>
                )
            )}

            <g key={view}>
              <clipPath id={`clip-${uid}`}>
                <rect
                  x="0"
                  y="0"
                  height={H}
                  style={{
                    width: drawn ? width : 0,
                    transition: transition(`width ${DURATION}ms linear`),
                  }}
                />
              </clipPath>

              <path
                d={area}
                fill={`url(#fill-${uid})`}
                clipPath={`url(#clip-${uid})`}
              />

              <polyline
                points={line}
                fill="none"
                stroke={RED}
                strokeWidth="1.5"
                strokeLinejoin="round"
                pathLength="1"
                strokeDasharray="1"
                style={{
                  strokeDashoffset: drawn ? 0 : 1,
                  transition: transition(
                    `stroke-dashoffset ${DURATION}ms linear`
                  ),
                }}
              />

              {data.map((item, index) => {
                const delay = Math.round(
                  (index / Math.max(n - 1, 1)) * DURATION
                );

                const isActive = index === active;

                return (
                  <circle
                    key={`${item.label}-${index}`}
                    cx={x(index)}
                    cy={y(item.value)}
                    r={isActive ? 6 : 4}
                    fill="#2a0609"
                    stroke={RED}
                    strokeWidth="2"
                    style={{
                      opacity: drawn ? 1 : 0,
                      transform: `scale(${drawn ? 1 : 0})`,
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      transition: transition(
                        `opacity 300ms ${delay}ms, transform 300ms ${delay}ms`
                      ),
                    }}
                  />
                );
              })}
            </g>

            {tip && (
              <line
                x1={x(active)}
                x2={x(active)}
                y1={PAD.top}
                y2={baseY}
                stroke="#ffffff"
                strokeOpacity="0.25"
                strokeDasharray="2 3"
              />
            )}
          </svg>
        )}

        {tip && (
          <div
            className="pointer-events-none absolute rounded border border-[#2a2a2a] bg-black/90 px-2.5 py-1.5 text-[11px] shadow-lg"
            style={{
              left: tipLeft,
              top: Math.max(y(tip.value) - 54, 0),
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-neutral-400">{tip.label}</p>
            <p className="font-semibold">
              PKR {(Number(tip.value) || 0).toLocaleString('en-PK')}K
            </p>
          </div>
        )}

        {width > 0 && !hasData && (
          <div className="flex h-full items-center justify-center text-xs text-neutral-500">
            No payroll data available for this period.
          </div>
        )}
      </div>
    </section>
  );
}
