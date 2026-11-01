import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Icon from '../Icons';
import { formatCurrency, niceScale } from '../../utils/finance';

const W = 300;
const H = 250;
const PAD = { l: 42, r: 8, t: 28, b: 28 };
const EMPTY_DATA = [];

export default function BonusOverviewChart({ data = EMPTY_DATA }) {
  const sectionRef = useRef(null);
  const gradientId = useId().replace(/:/g, '');
  const [isVisible, setIsVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [activeBar, setActiveBar] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateMotionPreference = () => {
      setReduceMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMotionPreference);
    } else {
      mediaQuery.addListener(updateMotionPreference);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMotionPreference);
      } else {
        mediaQuery.removeListener(updateMotionPreference);
      }
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const safeData = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((item, index) => ({
        month: String(item?.month ?? `Month ${index + 1}`),
        amount:
          Number.isFinite(Number(item?.amount)) && Number(item?.amount) > 0
            ? Number(item.amount)
            : 0,
      })),
    [data]
  );

  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const base = PAD.t + ih;

  const { max, step } = niceScale(
    Math.max(1, ...safeData.map((item) => item.amount)),
    5
  );

  const band = safeData.length > 0 ? iw / safeData.length : iw;
  const barW = Math.max(2, Math.min(14, band * 0.62));

  const y = (value) => base - (value / max) * ih;

  const ticks = Array.from({ length: 6 }, (_, index) => index * step);

  const total = safeData.reduce((sum, item) => sum + item.amount, 0);

  const animate = isVisible && !reduceMotion;

  const handleBarClick = (index) => {
    setActiveBar((current) => (current === index ? null : index));
  };

  return (
    <section
      ref={sectionRef}
      className="fn-card fn-chart fn-bonus"
      aria-labelledby={`bonus-title-${gradientId}`}
      onMouseLeave={() => setActiveBar(null)}
    >
      <h2
        id={`bonus-title-${gradientId}`}
        className="fn-card__title"
      >
        Bonus Overview{' '}
        <span className="fn-card__sub">( This Year )</span>
      </h2>

      {safeData.length === 0 ? (
        <div
          className="fn-chart__empty"
          role="status"
          style={{
            minHeight: `${H}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '16px',
          }}
        >
          No bonus data available for this year.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="fn-svg"
          role="img"
          aria-label={`Bonus overview for this year. Total bonus ${formatCurrency(total)}.`}
        >
          <defs>
            <linearGradient
              id={`fn-bar-grad-${gradientId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#e5192b" />
              <stop offset="100%" stopColor="#7a0a14" />
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
                x={PAD.l - 6}
                y={y(tick) + 3}
                textAnchor="end"
                className="fn-axis fn-axis--sm"
              >
                {formatCurrency(tick)}
              </text>
            </g>
          ))}

          {safeData.map((item, index) => {
            const cx = PAD.l + (index + 0.5) * band;
            const barY = y(item.amount);
            const barHeight = base - barY;
            const delay = index * 70;
            const barVisible = animate || reduceMotion;
            const isActive = activeBar === index;

            return (
              <g key={`${item.month}-${index}`}>
                <text
                  x={cx}
                  y={H - 9}
                  textAnchor="middle"
                  className="fn-axis fn-axis--sm"
                >
                  {item.month}
                </text>

                {item.amount > 0 && (
                  <>
                    <rect
                      x={cx - barW / 2}
                      y={barVisible ? barY : base}
                      width={barW}
                      height={barVisible ? barHeight : 0}
                      rx="2"
                      fill={`url(#fn-bar-grad-${gradientId})`}
                      className="fn-bar"
                      tabIndex={0}
                      role="button"
                      aria-label={`${item.month}: ${formatCurrency(item.amount)}`}
                      onMouseEnter={() => setActiveBar(index)}
                      onMouseLeave={() => setActiveBar(null)}
                      onClick={() => handleBarClick(index)}
                      onFocus={() => setActiveBar(index)}
                      onBlur={() => setActiveBar(null)}
                      style={{
                        cursor: 'pointer',
                        outline: 'none',
                        transition: reduceMotion
                          ? 'none'
                          : [
                              `y 750ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                              `height 750ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                              'opacity 200ms ease',
                              'filter 200ms ease',
                            ].join(', '),
                        opacity:
                          activeBar !== null && !isActive ? 0.65 : 1,
                        filter: isActive ? 'brightness(1.3)' : 'none',
                      }}
                    >
                      <title>
                        {`${item.month}: ${formatCurrency(item.amount)}`}
                      </title>
                    </rect>

                    <text
                      x={cx}
                      y={Math.max(PAD.t - 4, barY - 7)}
                      textAnchor="middle"
                      style={{
                        display:
                          isActive && barVisible ? 'block' : 'none',
                        pointerEvents: 'none',
                        fontWeight: 700,
                        fill: '#ffffff',
                      }}
                    >
                      {formatCurrency(item.amount)}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      )}

      <p className="fn-chart__foot">
        <Icon name="trophy" size={12} /> Total bonus this year:{' '}
        {formatCurrency(total)}
      </p>
    </section>
  );
}