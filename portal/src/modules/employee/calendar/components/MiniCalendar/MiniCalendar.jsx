import { useMemo, useState } from 'react';
import Icon from '../Icons';
import { useEvents } from '../../../../../hooks/useCalendarData';
import { MONTHS, WEEKDAYS, addMonths, isSameDay, monthMatrix, toISO } from '../../../../../utils/calendar';

export default function MiniCalendar({ today, version, onSelectDate }) {
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const days = useMemo(() => monthMatrix(month.getFullYear(), month.getMonth()).flat(), [month]);
  const { data } = useEvents(toISO(days[0]), toISO(days[days.length - 1]), version);
  const marked = useMemo(() => new Set((data || []).map((e) => e.date)), [data]);

  return (
    <section className="cal-card cal-mini" aria-label="Mini calendar">
      <div className="cal-mini__head">
        <h2 className="cal-card__title">{MONTHS[month.getMonth()]} {month.getFullYear()}</h2>
        <div className="cal-mini__nav">
          <button type="button" className="cal-sq cal-sq--sm" aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))}>
            <Icon name="chevronLeft" size={11} />
          </button>
          <button type="button" className="cal-sq cal-sq--sm" aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <Icon name="chevronRight" size={11} />
          </button>
        </div>
      </div>

      <div className="cal-mini__grid">
        {WEEKDAYS.map((w) => <span key={w} className="cal-mini__wd">{w}</span>)}
        {days.map((d) => {
          const iso = toISO(d);
          const out = d.getMonth() !== month.getMonth();
          return (
            <button
              key={iso}
              type="button"
              className={`cal-mini__day${out ? ' is-out' : ''}${isSameDay(d, today) ? ' is-today' : ''}`}
              aria-label={`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}${marked.has(iso) ? ', has items' : ''}`}
              onClick={() => onSelectDate(d)}
            >
              {d.getDate()}
              {marked.has(iso) && !out && <i className="cal-mini__dot" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}