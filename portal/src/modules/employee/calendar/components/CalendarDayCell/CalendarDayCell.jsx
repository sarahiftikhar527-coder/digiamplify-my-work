import CalendarEventChip from '../CalendarEventChip';
import {
  formatLong,
  weekdayIndex,
} from '../../../../../utils/calendar';

export default function CalendarDayCell({
  date,
  inMonth,
  events = [],
  visible = {},
  isToday = false,
  todayCol = false,
  maxChips = 2,
  onSelect = () => {},
}) {
  if (!inMonth) {
    return (
      <div
        className={`cal-cell cal-cell--blank${todayCol ? ' is-today-col' : ''}`}
        aria-hidden="true"
      />
    );
  }

  const shown = events.filter((event) => {
    if (!event || !event.type) return true;

    return visible[event.type] !== false;
  });

  const extra = Math.max(0, shown.length - maxChips);
  const isWeekend = weekdayIndex(date) >= 5 && visible.weekend !== false;

  const classes = ['cal-cell'];

  if (todayCol) classes.push('is-today-col');
  if (isToday) classes.push('is-today');
  if (isWeekend) classes.push('is-weekend');

  const label = `${formatLong(date)}${
    shown.length
      ? `, ${shown.length} item${shown.length === 1 ? '' : 's'}`
      : ''
  }`;

  return (
    <button
      type="button"
      className={classes.join(' ')}
      aria-label={label}
      aria-current={isToday ? 'date' : undefined}
      onClick={() => onSelect(date)}
    >
      <span className="cal-cell__num">
        {date.getDate()}
      </span>

      <span className="cal-cell__events">
        {shown.slice(0, maxChips).map((event, index) => (
          <CalendarEventChip
            key={
              event.id ??
              event._id ??
              `${event.type || 'event'}-${event.title || 'item'}-${index}`
            }
            event={event}
          />
        ))}

        {extra > 0 && (
          <span className="cal-more">
            +{extra} more
          </span>
        )}
      </span>
    </button>
  );
}