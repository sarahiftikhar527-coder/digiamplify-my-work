import CalendarDayCell from '../CalendarDayCell';
import {
  WEEKDAYS,
  isSameDay,
  toISO,
  weekdayIndex,
} from '../../../../../utils/calendar';

export default function CalendarGrid({
  days = [],
  month,
  weekMode = false,
  eventsByDate = {},
  visible = {},
  today,
  busy = false,
  onSelectDay = () => {},
}) {
  const todayCol = today ? weekdayIndex(today) : -1;

  return (
    <div
      className={`cal-gridwrap${busy ? ' is-busy' : ''}`}
      aria-busy={busy}
    >
      <div className={`cal-grid${weekMode ? ' cal-grid--week' : ''}`}>
        {WEEKDAYS.map((weekday, index) => (
          <div
            key={weekday}
            className={`cal-wd${index === todayCol ? ' is-today' : ''}`}
          >
            {weekday}
          </div>
        ))}

        {days.map((date) => {
          const dateKey = toISO(date);
          const events = eventsByDate[dateKey] || [];

          return (
            <CalendarDayCell
              key={dateKey}
              date={date}
              inMonth={weekMode || date.getMonth() === month}
              events={events}
              visible={visible}
              isToday={today ? isSameDay(date, today) : false}
              todayCol={weekdayIndex(date) === todayCol}
              maxChips={weekMode ? 8 : 2}
              onSelect={onSelectDay}
            />
          );
        })}
      </div>
    </div>
  );
}