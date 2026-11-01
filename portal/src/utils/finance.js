
export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date) => {
  if (!date) return '—';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '—';

  return parsedDate.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (date) => {
  if (!date) return '—';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '—';

  return parsedDate.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const niceScale = (maxValue) => {
  const max = Number(maxValue) || 0;

  if (max <= 0) return { max: 1, step: 0.25 };

  const magnitude = 10 ** Math.floor(Math.log10(max));
  const normalized = max / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const scaleMax = nice * magnitude;

  return {
    max: scaleMax,
    step: scaleMax / 4,
  };
};

export const monotonePath = (points) => {
  if (!Array.isArray(points) || points.length === 0) return '';

  return points
    .map((point, index) => {
      const x = Number(point.x);
      const y = Number(point.y);

      if (!Number.isFinite(x) || !Number.isFinite(y)) return '';

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .filter(Boolean)
    .join(' ');
};

export const reducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
