
export const formatCurrency = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })}`;

export const formatDate = (iso) => {
  if (!iso) return '—';

  const d = new Date(`${iso}T00:00:00`);

  if (Number.isNaN(d.getTime())) return '—';

  return `${d.getDate()} ${d.toLocaleString('en-GB', {
    month: 'long',
  })} ${d.getFullYear()}`;
};

export const formatTime = (value) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const time = String(value).trim();

  const twelveHourMatch = time.match(
    /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?\s*(AM|PM)$/i
  );

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();

    if (
      hours < 1 ||
      hours > 12 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return '—';
    }

    if (period === 'AM' && hours === 12) hours = 0;
    if (period === 'PM' && hours !== 12) hours += 12;

    return `${String(hours % 12 || 12).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
  }

  const match = time.match(
    /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/
  );

  if (match) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours > 23 || minutes > 59) return '—';

    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = String(hours % 12 || 12).padStart(2, '0');

    return `${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  const date = new Date(time);

  if (!Number.isNaN(date.getTime()) && /T/.test(time)) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  return '—';
};

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function niceScale(max, ticks = 5) {
  const raw = max / ticks || 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  const m = [1, 2, 2.5, 5, 10].find((x) => f <= x);
  const step = m * pow;

  return { step, max: step * ticks };
}

export function monotonePath(pts) {
  const n = pts.length;

  if (n < 2) {
    return n ? `M${pts[0].x},${pts[0].y}` : '';
  }

  const dx = [];
  const m = [];

  for (let i = 0; i < n - 1; i += 1) {
    dx.push(pts[i + 1].x - pts[i].x);
    m.push((pts[i + 1].y - pts[i].y) / dx[i]);
  }

  const t = [m[0]];

  for (let i = 1; i < n - 1; i += 1) {
    t.push(
      m[i - 1] * m[i] <= 0
        ? 0
        : (m[i - 1] + m[i]) / 2
    );
  }

  t.push(m[n - 2]);

  for (let i = 0; i < n - 1; i += 1) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }

    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const s = a * a + b * b;

    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      t[i] = k * a * m[i];
      t[i + 1] = k * b * m[i];
    }
  }

  let d = `M${pts[0].x},${pts[0].y}`;

  for (let i = 0; i < n - 1; i += 1) {
    const h = dx[i] / 3;

    d += ` C${pts[i].x + h},${pts[i].y + t[i] * h} ${
      pts[i + 1].x - h
    },${pts[i + 1].y - t[i + 1] * h} ${
      pts[i + 1].x
    },${pts[i + 1].y}`;
  }

  return d;
}
