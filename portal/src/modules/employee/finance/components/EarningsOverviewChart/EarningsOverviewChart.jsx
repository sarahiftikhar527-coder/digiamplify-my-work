
import { useId, useMemo, useState } from 'react';
import { formatCurrency, monotonePath, niceScale } from '../../utils/finance';

const W = 540;
const H = 250;
const PAD = { l: 54, r: 14, t: 34, b: 30 };
const EMPTY_DATA = [];

export default function EarningsOverviewChart({ data = EMPTY_DATA }) {
  const gid = useId().replace(/:/g, '');
  const [active, setActive] = useState(null);
  const [reduceMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const safeData = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((item, index) => {
        const parsedValue = Number(item?.value);

        return {
          month: String(item?.month ?? `Month ${index + 1}`),
          value:
            item?.value == null || !Number.isFinite(parsedValue)
              ? null
              : Math.max(0, parsedValue),
        };
      }),
    [data]
  );

  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const base = PAD.t + ih;

  const { max, step } = niceScale(
    Math.max(1, ...safeData.map((item) => item.value ?? 0)),
    5
  );

  const x = (index) =>
    safeData.length > 0
      ? PAD.l + ((index + 0.5) * iw) / safeData.length
      : PAD.l + iw / 2;

  const y = (value) => base - (value / max) * ih;

  const points = safeData
    .map((item, index) =>
      item.value == null
        ? null
        : {
            i: index,
            x: x(index),
            y: y(item.value),
            v: item.value,
          }
    )
    .filter(Boolean);

  const ticks = Array.from({ length: 6 }, (_, index) => index * step);

  const peak =
    points.length > 0
      ? points.reduce((highest, point) =>
          point.v > highest.v ? point : highest
        )
      : null;

  const current =
    points.find((point) => point.i === active) ?? peak;

  const line = points.length > 0 ? monotonePath(points) : '';

  const area =
    points.length > 0
      ? `${line} L${points[points.length - 1].x},${base} L${points[0].x},${base} Z`
      : '';

  const handlePointerMove = (event) => {
    if (points.length === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();

    if (!rect.width) return;

    const pointerX = ((event.clientX - rect.left) / rect.width) * W;

    const closest = points.reduce((best, point) =>
      Math.abs(point.x - pointerX) < Math.abs(best.x - pointerX)
        ? point
        : best
    );

    setActive(closest.i);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    if (points.length === 0) return;

    event.preventDefault();

    const currentIndex = points.findIndex(
      (point) => point.i === current?.i
    );

    const startIndex = currentIndex >= 0 ? currentIndex : 0;

    const nextIndex = Math.max(
      0,
      Math.min(
        points.length - 1,
        startIndex + (event.key === 'ArrowRight' ? 1 : -1)
      )
    );

    setActive(points[nextIndex].i);
  };

  return (
    <section className="fn-card fn-chart">
      <h2 className="fn-card__title">Earnings Overview</h2>

      {points.length === 0 ? (
        <div
          className="fn-chart__empty"
          role="status"
          style={{
            minHeight: `${H}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          No earnings data available for this period.
        </div>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="fn-svg"
            role="img"
            aria-label={`Earnings overview. ${current ? safeData[current.i].month : ''}: ${current ? formatCurrency(current.v) : ''}`}
            tabIndex={0}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setActive(null)}
            onKeyDown={handleKeyDown}
          >
            <defs>
              <linearGradient
                id={`fn-earnings-gradient-${gid}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#d4101f" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#d4101f" stopOpacity="0" />
              </linearGradient>
            </defs>

            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.l}
                  x2={W - PAD.r}
                  y1={y(tick)}
                  y2={y(tick)}
                  className="fn-grid"
                />

                <text
                  x={PAD.l - 10}
                  y={y(tick) + 3}
                  textAnchor="end"
                  className="fn-axis"
                >
                  {formatCurrency(tick)}
                </text>
              </g>
            ))}

            {safeData.map((item, index) => (
              <text
                key={`${item.month}-${index}`}
                x={x(index)}
                y={H - 8}
                textAnchor="middle"
                className="fn-axis"
              >
                {item.month}
              </text>
            ))}

            {points.length > 1 && (
              <path
                d={area}
                fill={`url(#fn-earnings-gradient-${gid})`}
                className="fn-area"
              />
            )}

            {points.length > 1 && (
              <path
                d={line}
                pathLength="1"
                fill="none"
                className="fn-line"
                style={{
                  strokeDasharray: reduceMotion ? 'none' : '1',
                  strokeDashoffset: 0,
                  transition: reduceMotion ? 'none' : 'stroke-dashoffset 900ms ease',
                }}
              />
            )}

            {points.length === 1 && (
              <circle
                cx={points[0].x}
                cy={points[0].y}
                r="4"
                className="fn-dot"
              />
            )}

            {current && (
              <g transform={`translate(${current.x} ${current.y})`}>
                <g className="fn-marker">
                  <line
                    x1="0"
                    x2="0"
                    y1="4"
                    y2={base - current.y}
                    className="fn-vline"
                  />

                  <circle r="4" className="fn-dot" />

                  <rect
                    x="-25"
                    y="-28"
                    width="50"
                    height="17"
                    rx="3"
                    className="fn-tag"
                  />

                  <text
                    x="0"
                    y="-16"
                    textAnchor="middle"
                    className="fn-tag-text"
                  >
                    {formatCurrency(current.v)}
                  </text>
                </g>
              </g>
            )}
          </svg>

          <p className="fn-chart__foot" aria-live="polite">
            {current && (
              <>
                <span>
                  {safeData[current.i].month}
                </span>
                {': '}
                <strong>{formatCurrency(current.v)}</strong>
              </>
            )}
          </p>
        </>
      )}
    </section>
  );
}
