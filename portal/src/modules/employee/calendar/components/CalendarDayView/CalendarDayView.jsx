import Icon from '../Icons';
import CalendarLegend from '../CalendarLegend';
import CalendarEventChip from '../CalendarEventChip';
import PanelState from '../PanelState';
import {
  durationLabel,
  format12,
  formatLong,
  fromMinutes,
  spanMinutes,
  toMinutes,
} from '../../../../../utils/calendar';

const HOURS = Array.from(
  { length: 13 },
  (_, index) =>
    format12(`${String((index * 2) % 24).padStart(2, '0')}:00`)
);

function InfoCard({
  tone,
  title,
  value,
  sub,
  hint,
  hintTone,
}) {
  return (
    <div className={`cal-info cal-info--${tone}`}>
      <p className="cal-info__title">{title}</p>
      <p className="cal-info__value">{value}</p>

      {sub && (
        <p className="cal-info__sub">{sub}</p>
      )}

      <p
        className={`cal-info__hint${
          hintTone ? ` cal-info__hint--${hintTone}` : ''
        }`}
      >
        {hint}
      </p>
    </div>
  );
}

function Marker({ time, label }) {
  return (
    <div className="cal-mark">
      <span className="cal-mark__dot" />
      <span>{format12(time)}</span>
      <span className="cal-mark__line" />
      <span className="cal-mark__pill">{label}</span>
    </div>
  );
}

export default function CalendarDayView({
  date,
  schedule,
  loading,
  error,
  onRetry,
  events = [],
  visible = {},
  onToggle,
  onBack,
  onPrev,
  onNext,
  onOpenMeeting,
  onScheduleMeeting,
}) {
  const items = Array.isArray(schedule?.items)
    ? schedule.items
    : [];

  const shift = schedule?.shift;
  const breakTime = schedule?.breakTime;

  let freeEnd = 24 * 60 - 1;

  if (items.length && items[0]?.start) {
    freeEnd = Math.max(
      0,
      toMinutes(items[0].start) - 60
    );
  } else if (shift?.start) {
    freeEnd = toMinutes(shift.start);
  }

  const dayEvents = events.filter((event) => {
    if (!event?.type) return true;

    return visible[event.type] !== false;
  });

  return (
    <div className="cal-day">
      <div className="cal-day__top">
        <button
          type="button"
          className="cal-btn cal-btn--back"
          onClick={onBack}
        >
          <Icon name="arrowLeft" size={12} />
          Back
        </button>

        <div className="cal-day__nav">
          <button
            type="button"
            className="cal-sq"
            aria-label="Previous day"
            onClick={onPrev}
          >
            <Icon name="chevronLeft" size={12} />
          </button>

          <button
            type="button"
            className="cal-sq"
            aria-label="Next day"
            onClick={onNext}
          >
            <Icon name="chevronRight" size={12} />
          </button>

          <h2
            className="cal-day__date"
            aria-live="polite"
          >
            {formatLong(date)}
          </h2>
        </div>

        {onScheduleMeeting && (
          <div className="cal-day__actions">
            <button
              type="button"
              className="cal-btn"
              onClick={onScheduleMeeting}
            >
              + Schedule meeting
            </button>
          </div>
        )}
      </div>

      <div className="cal-info-grid">
        <InfoCard
          tone="shift"
          title="Work Shift"
          value={
            shift
              ? `${format12(shift.start)} - ${format12(shift.end)}`
              : '--'
          }
          sub={
            shift
              ? durationLabel(spanMinutes(shift.start, shift.end))
              : '--'
          }
          hint="Total working hours"
        />

        <InfoCard
          tone="break"
          title="Break Time"
          value={
            breakTime
              ? `${format12(breakTime.start)} - ${format12(breakTime.end)}`
              : '--'
          }
          sub={
            breakTime
              ? durationLabel(
                  spanMinutes(breakTime.start, breakTime.end)
                )
              : '--'
          }
          hint="Total break time"
        />

        <InfoCard
          tone="in clock"
          title="Clock In"
          value={
            schedule?.clockIn?.time
              ? format12(schedule.clockIn.time)
              : '--:--'
          }
          hint={
            schedule?.clockIn?.status || 'Not clocked in'
          }
          hintTone="ok"
        />

        <InfoCard
          tone="out clock"
          title="Clock Out"
          value={
            schedule?.clockOut?.time
              ? format12(schedule.clockOut.time)
              : '--:--'
          }
          hint={
            schedule?.clockOut?.status || 'Not clocked out'
          }
          hintTone="out"
        />
      </div>

      <CalendarLegend
        visible={visible}
        onToggle={onToggle}
      />

      {dayEvents.length > 0 && (
        <div className="cal-dayevents">
          {dayEvents.map((event, index) => (
            <CalendarEventChip
              key={
                event.id ??
                event._id ??
                `${event.type || 'event'}-${event.title || 'item'}-${index}`
              }
              event={event}
            />
          ))}
        </div>
      )}

      <PanelState
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={!schedule}
        emptyText="No schedule found."
      >
        <div
          className="cal-timeline"
          aria-busy={loading}
        >
          <div
            className="cal-timeline__scale"
            aria-hidden="true"
          >
            {HOURS.map((hour, index) => (
              <span key={`${hour}-${index}`}>
                {hour}
              </span>
            ))}
          </div>

          <div className="cal-timeline__body">
            {freeEnd > 0 && (
              <div className="cal-free">
                <span className="cal-free__icon">
                  <Icon name="moon" size={14} />
                </span>

                <div>
                  <p className="cal-free__title">
                    Free time
                  </p>

                  <p className="cal-free__range">
                    12:00 AM - {format12(fromMinutes(freeEnd))}
                  </p>
                </div>
              </div>
            )}

            {shift && (
              <Marker
                time={shift.start}
                label="Clock In"
              />
            )}

            {items.map((item, index) => {
              const clickable = Boolean(item.meeting && onOpenMeeting);
              const Wrapper = clickable ? 'button' : 'div';

              return (
              <Wrapper
                key={
                  item.id ??
                  item._id ??
                  `${item.title || 'item'}-${index}`
                }
                type={clickable ? 'button' : undefined}
                onClick={clickable ? () => onOpenMeeting(item.meeting) : undefined}
                className={`cal-item cal-item--${item.type || 'event'}${
                  clickable ? ' cal-item--clickable' : ''
                }`}
              >
                <span className="cal-item__icon">
                  <Icon name="calendar" size={14} />
                </span>

                <div>
                  <p className="cal-item__time">
                    {format12(item.start)} - {format12(item.end)}
                  </p>

                  <p className="cal-item__title">
                    {item.title || 'Scheduled activity'}
                  </p>
                </div>

                <div className="cal-item__meta">
                  <span>{item.place || ''}</span>

                  <span className="cal-item__people">
                    {item.attendees != null && (
                      <>
                        <Icon name="users" size={11} />
                        {' '}{item.attendees}
                      </>
                    )}
                  </span>
                </div>
              </Wrapper>
              );
            })}

            {shift && (
              <Marker
                time={shift.end}
                label="Clock Out"
              />
            )}
          </div>
        </div>
      </PanelState>
    </div>
  );
}