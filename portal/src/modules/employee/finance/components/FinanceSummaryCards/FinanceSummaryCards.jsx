
import { useEffect, useRef, useState } from 'react';
import Icon from '../Icons';
import { formatCurrency, reducedMotion } from '../../utils/finance';

function useCountUp(target, duration = 900) {
  const safeTarget = Number.isFinite(Number(target))
    ? Number(target)
    : 0;

  const [value, setValue] = useState(
    () => (reducedMotion() ? safeTarget : 0)
  );

  const fromRef = useRef(value);

  useEffect(() => {
    if (reducedMotion()) {
      fromRef.current = safeTarget;
      setValue(safeTarget);
      return undefined;
    }

    if (typeof window === 'undefined' || !window.requestAnimationFrame) {
      fromRef.current = safeTarget;
      setValue(safeTarget);
      return undefined;
    }

    const from = fromRef.current;
    let frameId;
    let startTime;

    const tick = (timestamp) => {
      if (startTime === undefined) {
        startTime = timestamp;
      }

      const progress =
        duration <= 0
          ? 1
          : Math.min((timestamp - startTime) / duration, 1);

      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = from + (safeTarget - from) * easedProgress;

      fromRef.current = currentValue;
      setValue(currentValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        fromRef.current = safeTarget;
        setValue(safeTarget);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [safeTarget, duration]);

  return Math.round(value);
}

function SummaryCard({ item }) {
  const amount = useCountUp(item.amount);

  return (
    <article className="fn-card fn-stat">
      <span className="fn-stat__icon" aria-hidden="true">
        <Icon name={item.icon || 'wallet'} size={16} />
      </span>

      <div className="fn-stat__content">
        <p className="fn-stat__label">{item.label}</p>

        <p className="fn-stat__value" aria-live="off">
          {formatCurrency(amount)}
        </p>

        {item.note && (
          <p className="fn-stat__note">{item.note}</p>
        )}
      </div>
    </article>
  );
}

export default function FinanceSummaryCards({ items = [] }) {
  const safeItems = Array.isArray(items)
    ? items.filter((item) => item && item.id != null)
    : [];

  if (safeItems.length === 0) {
    return (
      <div className="fn-summary" role="status">
        <p>No finance summary available.</p>
      </div>
    );
  }

  return (
    <div className="fn-summary">
      {safeItems.map((item) => (
        <SummaryCard key={item.id} item={item} />
      ))}
    </div>
  );
}
