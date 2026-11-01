export default function CalendarEventChip({ event }) {
  const type = String(event?.type || 'event')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');

  const title =
    event?.title ||
    event?.name ||
    event?.description ||
    'Calendar event';

  return (
    <span
      className={`cal-chip cal-chip--${type}`}
      title={title}
    >
      <span className="cal-chip__dot" />
      <span className="cal-chip__text">{title}</span>
    </span>
  );
}